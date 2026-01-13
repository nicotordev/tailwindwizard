import fs from "fs";
import path from "path";
import {
  AuthProvider,
  BlockFramework,
  BlockStatus,
  BlockType,
  CodeStorageKind,
  CurrencyCode,
  FileKind,
  StylingEngine,
  UserRole,
  Visibility,
} from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import clerkClient from "../lib/clerkClient.js";
import stripe from "../lib/stripe.js";

const blocksFolder = path.join(process.cwd(), "individual");

const categoryMapping: Record<string, string> = {
  header: "navigation",
  navigation: "navigation",
  breadcrumbs: "navigation",
  hero: "hero-sections",
  feature: "marketing",
  testimonial: "marketing",
  logo_cloud: "marketing",
  call_to_action: "marketing",
  article: "marketing",
  blog: "marketing",
  dashboard: "dashboards",
  data_stats: "dashboards",
  charts: "dashboards",
  page_titles: "dashboards",
  signin: "forms",
  signup: "forms",
  contact: "forms",
  newsletter: "forms",
  pricing: "pricing",
  table: "tables-lists",
  pagination: "tables-lists",
  modal: "modals-overlays",
  dropdown: "modals-overlays",
  select_box: "modals-overlays",
  notification: "modals-overlays",
  alert: "modals-overlays",
  alerts: "modals-overlays",
  footer: "footers",
};

async function main() {
  try {
    const adminEmail =
      process.env.ADMIN_SELLER_EMAIL || "admin@tailwindwizard.com";

    console.log(`Searching for admin user: ${adminEmail}...`);
    let user = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { creator: true },
    });

    if (!user) {
      console.log(`User ${adminEmail} not found in DB. Checking Clerk...`);
      const clerkUsers = await clerkClient.users.getUserList({
        emailAddress: [adminEmail],
      });

      let externalAuthId: string;

      if (clerkUsers.data.length > 0 && clerkUsers.data[0]) {
        externalAuthId = clerkUsers.data[0].id;
        console.log(`User found in Clerk with ID: ${externalAuthId}`);
      } else {
        console.log("User not found in Clerk. Creating new Clerk user...");
        const newClerkUser = await clerkClient.users.createUser({
          emailAddress: [adminEmail],
          // Temporary password, user should reset it
          password: "Password123!",
          firstName: "Admin",
          lastName: "TailwindWizard",
          skipPasswordChecks: true,
        });
        externalAuthId = newClerkUser.id;
        console.log(`Clerk user created with ID: ${externalAuthId}`);
      }

      console.log("Creating user in local database...");
      user = await prisma.user.create({
        data: {
          email: adminEmail,
          externalAuthId,
          role: UserRole.ADMIN,
          authProvider: AuthProvider.CLERK,
          name: "Admin TailwindWizard",
        },
        include: { creator: true },
      });
    }

    // 2 & 5. Check Creator profile
    let creator = user.creator;
    if (!creator) {
      console.log("Creating creator profile for TailwindWizard...");
      creator = await prisma.creator.create({
        data: {
          userId: user.id,
          displayName: "TailwindWizard",
          bio: "Official collection of premium Tailwind CSS components and sections.",
          websiteUrl: "https://tailwindwizard.com",
          isApprovedSeller: true,
          approvedAt: new Date(),
        },
      });
    }

    // 3 & 5. Check Stripe account
    if (!creator.stripeAccountId) {
      console.log("Creating Stripe Express account for TailwindWizard...");
      try {
        const account = await stripe.accounts.create({
          type: "express",
          email: adminEmail,
          business_profile: {
            name: "TailwindWizard",
            url: "https://tailwindwizard.com",
          },
          capabilities: {
            transfers: { requested: true },
            card_payments: { requested: true },
          },
        });

        creator = await prisma.creator.update({
          where: { id: creator.id },
          data: {
            stripeAccountId: account.id,
            stripeAccountStatus: "PENDING",
          },
        });
        console.log(`Stripe account created: ${account.id}`);
      } catch (stripeError) {
        console.warn(
          "Failed to create Stripe account, skipping for now:",
          stripeError instanceof Error
            ? stripeError.message
            : String(stripeError)
        );
      }
    }

    // 4. Get all html blocks from folder
    if (!fs.existsSync(blocksFolder)) {
      throw new Error(`Blocks folder not found: ${blocksFolder}`);
    }

    const files = fs
      .readdirSync(blocksFolder)
      .filter((f) => f.endsWith(".html"));
    console.log(`Found ${files.length} HTML files to import.`);

    // Pre-fetch categories for mapping
    const dbCategories = await prisma.category.findMany();
    const categoriesBySlug = dbCategories.reduce<Record<string, string>>(
      (acc, cat) => {
        acc[cat.slug] = cat.id;
        return acc;
      },
      {}
    );

    for (const file of files) {
      const filePath = path.join(blocksFolder, file);
      const content = fs.readFileSync(filePath, "utf-8");

      const slug = file.replace(".html", "").replace(/_/g, "-");
      const prefix = file.split("_")[0];

      // Determine Type
      let type = BlockType.SECTION;
      if (
        [
          "alert",
          "alerts",
          "badge",
          "button",
          "buttons",
          "dropdown",
          "select_box",
          "modal",
          "notification",
        ].includes(prefix)
      ) {
        type = BlockType.COMPONENT;
      }

      // Title formatting
      const title = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Category matching
      const catSlug = categoryMapping[prefix];
      const categoryId = catSlug ? categoriesBySlug[catSlug] : null;

      try {
        await prisma.$transaction(async (tx) => {
          // Check if block already exists
          const existing = await tx.block.findUnique({
            where: { slug },
          });

          if (existing) {
            // console.log(`Block ${slug} already exists, skipping.`);
            return;
          }

          console.log(`Importing: ${title} (${slug})...`);
          await tx.block.create({
            data: {
              slug,
              title,
              description: `A professionally designed ${prefix} ${type.toLowerCase()} for Tailwind CSS.`,
              type,
              framework: BlockFramework.REACT,
              stylingEngine: StylingEngine.TAILWIND,
              status: BlockStatus.PUBLISHED,
              visibility: Visibility.PUBLIC,
              price: 0,
              currency: CurrencyCode.USD,
              creatorId: creator.id,
              publishedAt: new Date(),
              categories: categoryId
                ? {
                    create: {
                      categoryId: categoryId,
                    },
                  }
                : undefined,
              codeBundle: {
                create: {
                  storageKind: CodeStorageKind.INLINE_PLAIN,
                  blockFiles: {
                    create: {
                      path: "index.html",
                      kind: FileKind.COMPONENT,
                      content: content,
                    },
                  },
                },
              },
            },
          });
        });
      } catch (err) {
        console.error(
          `Failed to import ${file}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    console.log("Batch import completed successfully.");
  } catch (error) {
    console.error(
      "Error in batch import:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
