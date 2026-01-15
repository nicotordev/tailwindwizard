import { AuditAction, AuditActorType, Visibility } from "../db/generated/prisma/client.js";
import { prisma } from "../db/prisma.js";

export const collectionService = {
  async create(userId: string, data: { name: string; slug: string; description?: string; visibility?: Visibility }) {
    const collection = await prisma.collection.create({
      data: {
        ...data,
        userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorType: AuditActorType.USER,
        actorUserId: userId,
        action: AuditAction.COLLECTION_CREATE,
        entityType: "Collection",
        entityId: collection.id,
        metadata: { name: collection.name },
      },
    });

    return collection;
  },

  async update(userId: string, id: string, data: { name?: string; slug?: string; description?: string; visibility?: Visibility }) {
    // Check ownership
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error("Collection not found or access denied");
    }

    const updated = await prisma.collection.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        actorType: AuditActorType.USER,
        actorUserId: userId,
        action: AuditAction.COLLECTION_UPDATE,
        entityType: "Collection",
        entityId: updated.id,
        metadata: { changes: data },
      },
    });

    return updated;
  },

  async delete(userId: string, id: string) {
    // Check ownership
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error("Collection not found or access denied");
    }

    await prisma.collection.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorType: AuditActorType.USER,
        actorUserId: userId,
        action: AuditAction.COLLECTION_DELETE,
        entityType: "Collection",
        entityId: id,
        metadata: { name: existing.name },
      },
    });
  },

  async getById(id: string, userId?: string) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        blocks: {
          include: {
            block: {
              select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                screenshot: true,
                creator: {
                  select: {
                    displayName: true,
                    user: { select: { avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!collection) return null;

    // Visibility check
    if (collection.visibility === Visibility.PRIVATE && collection.userId !== userId) {
      return null;
    }

    return collection;
  },

  async listMy(userId: string) {
    return prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });
  },

  async addBlock(userId: string, collectionId: string, blockId: string) {
    // Check ownership
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== userId) {
      throw new Error("Collection not found or access denied");
    }

    // Check if block exists
    const block = await prisma.block.findUnique({ where: { id: blockId } });
    if (!block) {
      throw new Error("Block not found");
    }

    return prisma.collectionBlock.create({
      data: {
        collectionId,
        blockId,
      },
    });
  },

  async removeBlock(userId: string, collectionId: string, blockId: string) {
    // Check ownership
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== userId) {
      throw new Error("Collection not found or access denied");
    }

    return prisma.collectionBlock.deleteMany({
      where: {
        collectionId,
        blockId,
      },
    });
  },
};
