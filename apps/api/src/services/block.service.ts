import { PutObjectCommand } from "@aws-sdk/client-s3";
import AdmZip from "adm-zip";
import { createHash } from "crypto";
import env from "../config/env.config.js";
import type {
  BlockFramework,
  BlockStatus,
  BlockType,
  FileKind,
  Prisma,
  StylingEngine,
  Visibility,
} from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { r2Client } from "../lib/r2.js";
import { validateCode } from "../utils/validation.js";
import { renderService } from "./render.service.js";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface FindRandomParams {
  visibility?: Visibility;
  creatorId?: string;
  limit?: number;
  categorySlug?: string;
}

export interface BundleUploadInput {
  blockId: string;
  fileName: string;
  buffer: Buffer;
}

export interface BundleUploadResult {
  id: string;
  sha256: string;
  size: number;
}

/* -------------------------------------------------------------------------- */
/*                              Random utilities                              */
/* -------------------------------------------------------------------------- */

function getFileKind(fileName: string): FileKind {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "tsx" || ext === "jsx") return "COMPONENT";
  if (ext === "css") return "STYLE";
  if (ext === "ts" || ext === "js") return "UTILS";
  if (ext === "md") return "README";
  if (["png", "jpg", "jpeg", "svg", "webp"].includes(ext ?? "")) return "ASSET";
  return "OTHER";
}

function pickRandomUnique<T>(arr: readonly T[], count: number): T[] {
  const n = Math.min(count, arr.length);
  const copy = arr.slice();

  // Fisher–Yates (partial)
  for (let i = 0; i < n; i += 1) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    const tmp = copy[i];
    const copyJ = copy[j];

    if (copyJ) copy[i] = copyJ;
    if (tmp) copy[j] = tmp;
  }

  return copy.slice(0, n);
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = arr.slice();

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    const copyJ = copy[j];
    if (copyJ) copy[i] = copyJ;
    if (tmp) copy[j] = tmp;
  }

  return copy;
}

/* -------------------------------------------------------------------------- */
/*                                 Service                                    */
/* -------------------------------------------------------------------------- */

export const blockService = {
  async findRandom(params: FindRandomParams) {
    const { visibility, creatorId, limit = 10, categorySlug } = params;

    const where: Prisma.BlockWhereInput = {
      ...(visibility ? { visibility } : {}),
      ...(creatorId ? { creatorId } : {}),
      ...(categorySlug
        ? {
            categories: {
              some: {
                category: { slug: categorySlug },
              },
            },
          }
        : {}),
    };

    // 1) Fetch candidate IDs (cheap query)
    const candidates = await prisma.block.findMany({
      where,
      select: { id: true },
      take: 5000, // safety cap
    });

    const candidateIds = candidates.map((c) => c.id);
    const pickedIds = pickRandomUnique(candidateIds, limit);

    if (pickedIds.length === 0) {
      return [];
    }

    // 2) Fetch selected blocks with relations
    const items = await prisma.block.findMany({
      where: { id: { in: pickedIds } },
      include: {
        creator: {
          select: {
            displayName: true,
            user: { select: { avatarUrl: true } },
          },
        },
        previews: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    });

    // 3) Prisma does not preserve IN order → shuffle again
    return shuffle(items).slice(0, limit);
  },

  async findMany(params: {
    status?: BlockStatus;
    visibility?: Visibility;
    type?: BlockType;
    framework?: BlockFramework;
    stylingEngine?: StylingEngine;
    creatorId?: string;
    limit?: number;
    offset?: number;
    search?: string;
    categorySlug?: string;
  }) {
    const {
      status,
      visibility,
      type,
      framework,
      stylingEngine,
      creatorId,
      limit = 20,
      offset = 0,
      search,
      categorySlug,
    } = params;

    const where: Prisma.BlockWhereInput = {
      status,
      visibility,
      type,
      framework,
      stylingEngine,
      creatorId,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
      categories: categorySlug
        ? {
            some: {
              category: { slug: categorySlug },
            },
          }
        : undefined,
    };

    return prisma.block.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            displayName: true,
            user: { select: { avatarUrl: true } },
          },
        },
        previews: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
    });
  },

  async countMany(params: {
    status?: BlockStatus;
    visibility?: Visibility;
    type?: BlockType;
    framework?: BlockFramework;
    stylingEngine?: StylingEngine;
    creatorId?: string;
    search?: string;
    categorySlug?: string;
  }) {
    const {
      status,
      visibility,
      type,
      framework,
      stylingEngine,
      creatorId,
      search,
      categorySlug,
    } = params;

    const where: Prisma.BlockWhereInput = {
      status,
      visibility,
      type,
      framework,
      stylingEngine,
      creatorId,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
      categories: categorySlug
        ? {
            some: {
              category: { slug: categorySlug },
            },
          }
        : undefined,
    };

    return prisma.block.count({ where });
  },

  async findById(id: string) {
    return prisma.block.findUnique({
      where: { id },
      include: {
        creator: {
          include: {
            user: { select: { avatarUrl: true, name: true } },
          },
        },
        previews: true,
        registryDeps: true,
        npmDeps: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        _count: {
          select: { reviews: true },
        },
      },
    });
  },

  async findBySlug(slug: string) {
    return prisma.block.findUnique({
      where: { slug },
      include: {
        creator: {
          include: {
            user: { select: { avatarUrl: true, name: true } },
          },
        },
        previews: true,
        registryDeps: true,
        npmDeps: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        _count: {
          select: { reviews: true },
        },
      },
    });
  },

  async create(_creatorId: string, data: Prisma.BlockCreateInput) {
    return prisma.block.create({
      data,
    });
  },

  async update(id: string, data: Prisma.BlockUpdateInput) {
    const existing = await prisma.block.findUnique({
      where: { id },
      select: { status: true },
    });

    const updated = await prisma.block.update({
      where: { id },
      data,
    });

    const nextStatus =
      typeof data.status === "string" ? data.status : data.status?.set;
    const shouldQueuePreview =
      nextStatus === "PUBLISHED" && existing?.status !== "PUBLISHED";

    if (shouldQueuePreview) {
      void blockService.queueRenderJobIfNeeded(id);
    }

    return updated;
  },

  async upsertCodeBundle({
    blockId,
    fileName,
    buffer,
  }: BundleUploadInput): Promise<BundleUploadResult> {
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const isZip = fileName.toLowerCase().endsWith(".zip");

    // Primary storage (the zip itself or the single file)
    const bundleObjectKey = `bundles/${blockId}/${sha256}-${fileName}`;

    // Upload the main artifact (zip or file)
    await r2Client.send(
      new PutObjectCommand({
        Bucket: env.r2.bucketName,
        Key: bundleObjectKey,
        Body: buffer,
        ContentType: isZip ? "application/zip" : "application/octet-stream",
      })
    );

    // Prepare for extracted files processing
    let astScanPassed = true;
    let astScanReport = "Files scanned.";
    const filesToCreate: Prisma.BlockFileCreateWithoutCodeBundleInput[] = [];

    if (isZip) {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();

      for (const entry of entries) {
        if (
          entry.isDirectory ||
          entry.entryName.startsWith(".") ||
          entry.entryName.includes("//.")
        ) {
          continue;
        }

        const entryBuffer = entry.getData();
        const entryPath = entry.entryName; // e.g. "src/App.tsx"
        const kind = getFileKind(entryPath);

        // Upload extracted file for renderer access
        const entryKey = `bundles/${blockId}/files/${entryPath}`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket: env.r2.bucketName,
            Key: entryKey,
            Body: entryBuffer,
            ContentType: "application/octet-stream",
          })
        );

        // Scan code
        if (["COMPONENT", "UTILS", "STYLE"].includes(kind)) {
          const content = entryBuffer.toString("utf8");
          const validation = validateCode(content, entryPath);
          if (!validation.passed) {
            astScanPassed = false;
            astScanReport += `\n${validation.report}`;
          }
        }

        filesToCreate.push({
          path: entryPath,
          kind,
        });
      }
    } else {
      // Single file handling
      const kind = getFileKind(fileName);
      const entryKey = `bundles/${blockId}/files/${fileName}`;

      // Upload accessible file copy
      await r2Client.send(
        new PutObjectCommand({
          Bucket: env.r2.bucketName,
          Key: entryKey,
          Body: buffer,
          ContentType: "application/octet-stream",
        })
      );

      if (["COMPONENT", "UTILS", "STYLE"].includes(kind)) {
        const content = buffer.toString("utf8");
        const validation = validateCode(content, fileName);
        astScanPassed = validation.passed;
        astScanReport = validation.report;
      }

      filesToCreate.push({
        path: fileName,
        kind,
      });
    }

    // Transactional DB update
    const codeBundle = await prisma.codeBundle.upsert({
      where: { blockId },
      create: {
        block: { connect: { id: blockId } },
        storageKind: "OBJECT_STORAGE",
        objectKey: bundleObjectKey,
        objectBucket: env.r2.bucketName,
        objectRegion: "auto",
        sha256,
        astScanPassed,
        astScanReport,
        blockFiles: {
          create: filesToCreate,
        },
      },
      update: {
        storageKind: "OBJECT_STORAGE",
        objectKey: bundleObjectKey,
        objectBucket: env.r2.bucketName,
        sha256,
        astScanPassed,
        astScanReport,
        blockFiles: {
          deleteMany: {},
          create: filesToCreate,
        },
      },
      select: {
        id: true,
        sha256: true,
      },
    });

    return {
      id: codeBundle.id,
      sha256: codeBundle.sha256 ?? "",
      size: buffer.byteLength,
    };
  },

  async queueRenderJob(blockId: string, trigger = true) {
    const job = await prisma.renderJob.create({
      data: {
        block: { connect: { id: blockId } },
      },
    });

    if (trigger) {
      // Fire and forget: trigger rendering in background
      renderService.processJob(job.id).catch((err: unknown) => {
        console.error(`Failed to trigger render job ${job.id}:`, err);
      });
    }

    return job;
  },

  async queueRenderJobIfNeeded(blockId: string, options?: { force?: boolean }) {
    const [block, pendingJob] = await Promise.all([
      prisma.block.findUnique({
        where: { id: blockId },
        select: {
          codeBundle: { select: { id: true } },
          _count: { select: { previews: true } },
        },
      }),
      prisma.renderJob.findFirst({
        where: { blockId, status: { in: ["QUEUED", "RUNNING"] } },
        select: { id: true },
      }),
    ]);

    if (!block?.codeBundle) return null;
    if (pendingJob && !options?.force) return pendingJob;
    if (!options?.force && block._count.previews > 0) return null;

    return blockService.queueRenderJob(blockId);
  },

  async getCreatorUserId(blockId: string) {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: {
        creator: {
          select: {
            userId: true,
          },
        },
      },
    });

    return block?.creator.userId ?? null;
  },

  async delete(id: string) {
    return prisma.block.delete({
      where: { id },
    });
  },
};
