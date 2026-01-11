import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../db/prisma.js';

const INDIVIDUAL_DIR = path.resolve(process.cwd(), 'individual');

async function main() {
  console.log('Starting import from:', INDIVIDUAL_DIR);

  if (!fs.existsSync(INDIVIDUAL_DIR)) {
    console.error('Directory not found:', INDIVIDUAL_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(INDIVIDUAL_DIR).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length.toString()} HTML files.`);

  // 1. Ensure Creator (and User)
  const systemEmail = 'system@tailwindwizard.com';
  let user = await prisma.user.findUnique({ where: { email: systemEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: systemEmail,
        name: 'System Admin',
        role: 'ADMIN',
        authProvider: 'CLERK', // Default
        externalAuthId: 'system_admin_id', // Mock ID
      }
    });
    console.log('Created System User:', user.id);
  } else {
    console.log('Found System User:', user.id);
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
    console.log('Created System Creator:', creator.id);
  } else {
    console.log('Found System Creator:', creator.id);
  }

  for (const file of files) {
    // Format: category_id.html
    // Example: alert_62567afd668037eea734a83d.html
    // Example: blog_grid_62a69163e26bb25473783670.html (category might contain underscores)

    const basename = path.basename(file, '.html');
    const parts = basename.split('_');
    const originalId = parts.pop(); // The last part is the ID
    const categorySlug = parts.join('-'); // Join the rest with dashes
    const categoryName = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    if (!originalId || parts.length === 0) {
      console.warn(`Skipping malformed filename: ${file}`);
      continue;
    }

    // 2. Upsert Category
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        slug: categorySlug,
        name: categoryName,
      }
    });

    // 3. Create/Update Block
    const blockSlug = `${categorySlug}-${originalId}`;
    const filePath = path.join(INDIVIDUAL_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if block exists
    const existingBlock = await prisma.block.findUnique({ where: { slug: blockSlug } });

    if (existingBlock) {
        // console.log(`Block already exists: ${blockSlug}, skipping...`);
        // Optionally update content if needed
        continue;
    }

    try {
        const block = await prisma.block.create({
          data: {
            slug: blockSlug,
            title: `${categoryName} Component`,
            description: `Imported component for ${categoryName}`,
            type: 'COMPONENT',
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            creatorId: creator.id,
            price: 0, // Free
            categories: {
                create: {
                    categoryId: category.id
                }
            },
            codeBundle: {
                create: {
                    storageKind: 'INLINE_PLAIN',
                    blockFiles: {
                        create: {
                            path: '/index.html',
                            kind: 'COMPONENT',
                            content: content
                        }
                    }
                }
            }
          }
        });
        console.log(`Imported: ${block.slug}`);
    } catch (error) {
        console.error(`Failed to import ${blockSlug}:`, error);
    }
  }

  console.log('Import finished.');
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
