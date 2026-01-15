import { prisma } from "../src/db/prisma.js";
import { IconType } from "../src/db/generated/prisma/enums.js";

async function main() {
  console.log("🌱 Seeding categories...");

  const categories = [
    {
      slug: "hero-sections",
      name: "Hero Sections",
      description: "Eye-catching initial sections for your landing pages.",
      icon: "layout-template",
      iconType: IconType.LUCIDE,
      priority: 10,
      isFeatured: true,
    },
    {
      slug: "navigation",
      name: "Navigation",
      description: "Modern headers, footers and navigation menus.",
      icon: "menu",
      iconType: IconType.LUCIDE,
      priority: 9,
      isFeatured: true,
    },
    {
      slug: "forms",
      name: "Forms",
      description: "Clean and accessible input forms, login, and sign-up screens.",
      icon: "input",
      iconType: IconType.LUCIDE,
      priority: 8,
      isFeatured: true,
    },
    {
      slug: "cards",
      name: "Cards",
      description: "Versatile content containers for products, blog posts, and more.",
      icon: "credit-card",
      iconType: IconType.LUCIDE,
      priority: 7,
      isFeatured: false,
    },
    {
      slug: "marketing",
      name: "Marketing",
      description: "Pricing tables, testimonials, and feature lists.",
      icon: "megaphone",
      iconType: IconType.LUCIDE,
      priority: 6,
      isFeatured: false,
    },
    {
      slug: "dashboards",
      name: "Dashboards",
      description: "Complex layouts for admin panels and user portals.",
      icon: "layout-dashboard",
      iconType: IconType.LUCIDE,
      priority: 5,
      isFeatured: true,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log("🌱 Seeding tags...");

  const tags = [
    {
      slug: "dark-mode",
      name: "Dark Mode",
      description: "Optimized for dark color schemes.",
      icon: "🌙",
      iconType: IconType.EMOJI,
    },
    {
      slug: "minimal",
      name: "Minimal",
      description: "Clean and simple designs.",
      icon: "✨",
      iconType: IconType.EMOJI,
    },
    {
      slug: "glassmorphism",
      name: "Glassmorphism",
      description: "Frosted glass effects using backdrop filters.",
      icon: "🍷",
      iconType: IconType.EMOJI,
    },
    {
      slug: "animated",
      name: "Animated",
      description: "Components with Framer Motion or CSS animations.",
      icon: "🚀",
      iconType: IconType.EMOJI,
    },
    {
      slug: "accessible",
      name: "Accessible",
      description: "WCAG compliant and screen-reader friendly.",
      icon: "♿",
      iconType: IconType.EMOJI,
    },
    {
      slug: "saas",
      name: "SaaS",
      description: "Perfect for software as a service platforms.",
      icon: "💼",
      iconType: IconType.EMOJI,
    },
    {
      slug: "ecommerce",
      name: "E-commerce",
      description: "Designed for online stores and shopping experiences.",
      icon: "🛒",
      iconType: IconType.EMOJI,
    },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
