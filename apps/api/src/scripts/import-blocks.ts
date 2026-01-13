import fs from "node:fs";
import path from "node:path";
import { prisma } from "../db/prisma.js";
import { userService } from "../services/user.service.js";
import { blockService } from "../services/block.service.js";

async function main() {
  console.log("🚀 Starting block import script...");

  // 1. Setup Admin User
  const adminEmail = "admin@tailwindwizard.com";
  const externalAuthId = "admin-script-id"; // Dummy ID for script execution

  console.log(`👤 Ensuring user ${adminEmail} exists...`);
  
  // Try to find by email first to avoid unique constraint on email if externalAuthId is different
  let user = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!user) {
    user = await userService.getOrCreateUser(externalAuthId, adminEmail);
  } else {
    console.log(`   User found with ID: ${user.id}`);
  }

  // 2. Ensure Creator Profile
  let creator = await prisma.creator.findUnique({
    where: { userId: user.id },
  });

  if (!creator) {
    console.log("🎨 Creating creator profile for admin...");
    creator = await prisma.creator.create({
      data: {
        userId: user.id,
        displayName: "Tailwind Wizard Admin",
        bio: "Official blocks from Tailwind Wizard",
        isApprovedSeller: true,
      },
    });
  } else {
    console.log("✅ Creator profile found.");
  }

  // 3. Process Files
  const blocksFolder = path.join(process.cwd(), "individual");
  if (!fs.existsSync(blocksFolder)) {
    console.error(`❌ Folder not found: ${blocksFolder}`);
    process.exit(1);
  }

  const files = fs.readdirSync(blocksFolder).filter(f => !f.startsWith("."));
  console.log(`📂 Found ${files.length} files to process.`);

  const results = await Promise.allSettled(
    files.map(async (file) => {
      try {
        const filePath = path.join(blocksFolder, file);
        const fileContent = fs.readFileSync(filePath); // Buffer
        const ext = path.extname(file);
        const slug = path.basename(file, ext).toLowerCase();
        const title =
          slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        console.log(`Processing: ${file} -> ${slug}`);

        // 3a. Upsert Block
        // We use upsert to avoid duplicates if running multiple times
        const block = await prisma.block.upsert({
          where: { slug },
          update: {
            creatorId: creator!.id,
          },
          create: {
            slug,
            title,
            description: `Auto-imported block: ${title}`,
            type: "COMPONENT", // Assuming component for now
            status: "PUBLISHED",
            visibility: "PUBLIC",
            price: 0,
            creator: {
              connect: { id: creator!.id },
            },
          },
        });

        // 3b. Upsert Code Bundle
        console.log(`   📦 Uploading code bundle for ${slug}...`);
        await blockService.upsertCodeBundle({
          blockId: block.id,
          fileName: file,
          buffer: fileContent,
        });

        // 3c. Queue Render Job
        console.log(`   📸 Queuing screenshot job for ${slug}...`);
        await blockService.queueRenderJob(block.id);

        return slug;
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        throw error;
      }
    })
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`
🎉 Finished! Success: ${successful}, Failed: ${failed}`);
}

main()
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });