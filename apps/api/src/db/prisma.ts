import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

function getPrismaClient() {
  const connectionString = `${process.env.DATABASE_URL}`;

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });

  return prisma;
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof getPrismaClient>;
}

export const prisma =
  globalThis.prisma ?? (globalThis.prisma = getPrismaClient());
