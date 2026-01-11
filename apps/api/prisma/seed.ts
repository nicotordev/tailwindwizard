import { prisma } from '../src/db/prisma';

async function main() {
  console.log('Seeding market data...');

  // 1. Ensure System User & Creator
  const systemEmail = 'system@tailwindwizard.com';
  let user = await prisma.user.findUnique({ where: { email: systemEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: systemEmail,
        name: 'System Admin',
        role: 'ADMIN',
        authProvider: 'CLERK',
        externalAuthId: 'system_admin_id',
      }
    });
  }

  let creator = await prisma.creator.findUnique({ where: { userId: user.id } });
  if (!creator) {
    creator = await prisma.creator.create({
      data: {
        userId: user.id,
        displayName: 'TailwindWizard System',
        isApprovedSeller: true,
      }
    });
  }

  // 2. Categories
  const categoriesData = [
    { slug: 'economia', name: 'Economia de Bloques', icon: 'Coins' },
    { slug: 'zero-trust', name: 'Zero Trust Preview', icon: 'ShieldCheck' },
    { slug: 'stripe', name: 'Stripe Connect', icon: 'CreditCard' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    });
    categories.push(category);
  }

  // 3. Blocks
  const blocksData = [
    {
      slug: 'bento-analytics-grid',
      title: 'Bento Analytics Grid',
      description: 'A beautiful grid for your analytics dashboard',
      categorySlug: 'economia',
      price: 28,
      soldCount: 142,
    },
    {
      slug: 'saas-onboarding-flow',
      title: 'SaaS Onboarding Flow',
      description: 'Complete onboarding flow for your SaaS',
      categorySlug: 'economia',
      price: 34,
      soldCount: 87,
    },
    {
      slug: 'marketplace-trust-panel',
      title: 'Marketplace Trust Panel',
      description: 'Increase trust in your marketplace',
      categorySlug: 'economia',
      price: 42,
      soldCount: 64,
    },
    {
      slug: 'playwright-snapshot-worker',
      title: 'Playwright Snapshot Worker',
      description: 'Security focused snapshot worker',
      categorySlug: 'zero-trust',
      price: 55,
      soldCount: 24,
    },
    {
      slug: 'connect-express-onboarding',
      title: 'Connect Express Onboarding',
      description: 'Seamless Stripe Connect onboarding',
      categorySlug: 'stripe',
      price: 48,
      soldCount: 96,
    },
  ];

  for (const b of blocksData) {
    const cat = categories.find(c => c.slug === b.categorySlug);
    if (!cat) continue;

    await prisma.block.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        price: b.price,
        soldCount: b.soldCount,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
      },
      create: {
        slug: b.slug,
        title: b.title,
        description: b.description,
        price: b.price,
        soldCount: b.soldCount,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        type: 'COMPONENT',
        framework: 'REACT',
        stylingEngine: 'TAILWIND',
        creatorId: creator.id,
        categories: {
          create: {
            categoryId: cat.id
          }
        }
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
