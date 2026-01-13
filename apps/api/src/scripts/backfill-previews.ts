import { prisma } from "../db/prisma.js";
import { renderService } from "../services/render.service.js";

async function main() {
  console.log("🔍 Searching for blocks that need previews or screenshots...");

  // Identificamos bloques que:
  // 1. No tengan previews en la relación PreviewAsset
  // 2. O no tengan el campo screenshot definido
  const blocks = await prisma.block.findMany({
    where: {
      status: "PUBLISHED",
      codeBundle: { isNot: null },
      OR: [{ previews: { none: {} } }, { screenshot: null }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (blocks.length === 0) {
    console.log(
      "✅ All published blocks already have previews and screenshots."
    );
    return;
  }

  const total = blocks.length;

  console.log(
    `🚀 Found ${total} blocks to process. Starting high-performance backfill...`
  );

  const promises = blocks.map(async (block) => {
    try {
      // Creamos el job de renderizado
      const job = await prisma.renderJob.create({
        data: { blockId: block.id },
      });

      // Ejecutamos el renderizado directamente para controlar la concurrencia en este script
      await renderService.processJob(job.id);

      console.log(`  ✅ [OK] ${block?.title} (${block?.slug})`);
    } catch (err) {
      console.error(
        `  ❌ [FAIL] ${block?.title}:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  });

  // Esperamos a que todo el lote termine antes de pasar al siguiente
  const results = await Promise.allSettled(promises);

  console.log("\n--- Backfill Summary ---");
  console.log(`Total blocks: ${total}`);
  console.log(
    `Successfully processed: ${results.filter((r) => r.status === "fulfilled").length}`
  );
  console.log(
    `Failed: ${results.filter((r) => r.status === "rejected").length}`
  );
  console.log("------------------------");
}

main()
  .then(() => {
    console.log("👋 Backfill script finished.");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Critical error during backfill:", error);
    process.exit(1);
  });
