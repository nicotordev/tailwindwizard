import { prisma } from "../db/prisma.js";
import { blockService } from "../services/block.service.js";

function getArgValue(flag: string) {
  const arg = process.argv.find((value) => value.startsWith(`${flag}=`));
  return arg ? arg.split("=").slice(1).join("=") : null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitValue = getArgValue("--limit");
  const limit = limitValue ? Number(limitValue) : undefined;

  const blocks = await prisma.block.findMany({
    where: {
      status: "PUBLISHED",
      codeBundle: { isNot: null },
      previews: { none: {} },
    },
    select: { id: true, title: true },
    take: limit,
  });

  if (blocks.length === 0) {
    console.log("No published blocks without previews found.");
    return;
  }

  console.log(
    `Found ${blocks.length} published blocks without previews${dryRun ? " (dry run)" : ""}.`
  );

  for (const block of blocks) {
    if (dryRun) {
      console.log(`- ${block.id} ${block.title}`);
      continue;
    }

    await blockService.queueRenderJobIfNeeded(block.id);
    console.log(`Queued preview render for ${block.id} ${block.title}`);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Preview backfill failed:", message);
    process.exit(1);
  });
