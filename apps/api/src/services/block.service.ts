import { createHash } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import type {
  BlockFramework,
  BlockStatus,
  BlockType,
  Prisma,
  StylingEngine,
  Visibility,
  FileKind,
} from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { r2Client } from "../lib/r2.js";
import env from "../config/env.config.js";
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
// ... existing code ...
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
    return prisma.block.update({
      where: { id },
      data,
    });
  },

  async upsertCodeBundle({
    blockId,
    fileName,
    buffer,
  }: BundleUploadInput): Promise<BundleUploadResult> {
    const sha256 = createHash("sha256").update(buffer).digest("hex");
    const objectKey = `bundles/${blockId}/${sha256}-${fileName}`;

    // 1. AST Validation (only for text/code files)
    let astScanPassed = true;
    let astScanReport = "File not scanned (non-code asset).";
    const kind = getFileKind(fileName);

    if (["COMPONENT", "UTILS", "STYLE"].includes(kind)) {
      const content = buffer.toString("utf8");
      const validation = validateCode(content, fileName);
      astScanPassed = validation.passed;
      astScanReport = validation.report;
    }

    // 2. Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: env.r2.bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: "application/octet-stream", // or detect based on ext
      })
    );

    const codeBundle = await prisma.codeBundle.upsert({
      where: { blockId },
      create: {
        block: { connect: { id: blockId } },
        storageKind: "OBJECT_STORAGE",
        objectKey,
        objectBucket: env.r2.bucketName,
        objectRegion: "auto",
        sha256,
        astScanPassed,
        astScanReport,
        blockFiles: {
          create: {
            path: fileName,
            kind,
            // We don't store content inline for OBJECT_STORAGE
          },
        },
      },
      update: {
        storageKind: "OBJECT_STORAGE",
        objectKey,
        objectBucket: env.r2.bucketName,
        sha256,
        astScanPassed,
        astScanReport,
        blockFiles: {
          deleteMany: {},
          create: {
            path: fileName,
            kind,
          },
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

  async queueRenderJob(blockId: string) {
    const job = await prisma.renderJob.create({
      data: {
        block: { connect: { id: blockId } },
      },
    });

    // Fire and forget: trigger rendering in background
    renderService.processJob(job.id).catch((err: unknown) => {
      console.error(`Failed to trigger render job ${job.id}:`, err);
    });

    return job;
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
