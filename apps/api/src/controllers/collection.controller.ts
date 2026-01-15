import { getAuth } from "@hono/clerk-auth";
import type { Context } from "hono";
import { prisma } from "../db/prisma.js";
import { collectionService } from "../services/collection.service.js";
import type { CreateCollectionInput, UpdateCollectionInput } from "@tw/shared";

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const collectionController = {
  async create(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const user = await prisma.user.findUnique({ where: { externalAuthId: auth.userId } });
    if (!user) return c.json({ message: "User not found" }, 404);

    const body = await c.req.json() as CreateCollectionInput;
    // Append random string to ensure uniqueness or handle it in service. 
    // Using timestamp for now.
    const slug = `${generateSlug(body.name)}-${Math.random().toString(36).substring(2, 7)}`;
    
    const collection = await collectionService.create(user.id, { ...body, slug });
    return c.json(collection, 201);
  },

  async update(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const user = await prisma.user.findUnique({ where: { externalAuthId: auth.userId } });
    if (!user) return c.json({ message: "User not found" }, 404);

    const id = c.req.param("id");
    const body = await c.req.json() as UpdateCollectionInput;
    
    try {
        const updated = await collectionService.update(user.id, id, body);
        return c.json(updated, 200);
    } catch (error: any) {
        if (error.message.includes("not found")) return c.json({ message: "Not found" }, 404);
        return c.json({ message: error.message }, 500);
    }
  },

  async delete(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const user = await prisma.user.findUnique({ where: { externalAuthId: auth.userId } });
    if (!user) return c.json({ message: "User not found" }, 404);

    const id = c.req.param("id");
    
    try {
        await collectionService.delete(user.id, id);
        return c.json({ success: true }, 200);
    } catch (error: any) {
        if (error.message.includes("not found")) return c.json({ message: "Not found" }, 404);
        return c.json({ message: error.message }, 500);
    }
  },

  async getById(c: Context) {
    const auth = getAuth(c);
    let userId: string | undefined;

    if (auth?.userId) {
        const user = await prisma.user.findUnique({ where: { externalAuthId: auth.userId } });
        if (user) userId = user.id;
    }

    const id = c.req.param("id");
    const collection = await collectionService.getById(id, userId);
    
    if (!collection) return c.json({ message: "Not found" }, 404);
    return c.json(collection, 200);
  },

  async listMy(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const user = await prisma.user.findUnique({ where: { externalAuthId: auth.userId } });
    if (!user) return c.json({ message: "User not found" }, 404);

    const collections = await collectionService.listMy(user.id);
    return c.json(collections, 200);
  },

  async addBlock(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const user = await prisma.user.findUnique({ where: { externalAuthId: auth.userId } });
    if (!user) return c.json({ message: "User not found" }, 404);

    const id = c.req.param("id");
    const blockId = c.req.param("blockId");

    try {
        await collectionService.addBlock(user.id, id, blockId);
        return c.json({ success: true }, 200);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
  },

  async removeBlock(c: Context) {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ message: "Unauthorized" }, 401);

    const user = await prisma.user.findUnique({ where: { externalAuthId: auth.userId } });
    if (!user) return c.json({ message: "User not found" }, 404);

    const id = c.req.param("id");
    const blockId = c.req.param("blockId");

    try {
        await collectionService.removeBlock(user.id, id, blockId);
        return c.json({ success: true }, 200);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
  },
};
