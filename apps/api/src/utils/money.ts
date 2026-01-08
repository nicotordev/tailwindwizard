// src/utils/money.ts
import type { Prisma } from "../db/generated/prisma/client.js";
export type Currency = "usd" | "eur" | "clp" | "gbp" | "mxn" | "ars" | "brl";

export function toCents(amount: Prisma.Decimal | number | string): number {
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  return Math.round(n * 100);
}

export function fromCents(cents: number): number {
  if (!Number.isInteger(cents)) throw new Error("cents must be integer");
  return cents / 100;
}

export function calcPlatformFeeCents(
  priceCents: number,
  platformFeeBps: number
): number {
  if (!Number.isInteger(priceCents))
    throw new Error("priceCents must be integer");
  if (!Number.isInteger(platformFeeBps))
    throw new Error("platformFeeBps must be integer");
  return Math.round((priceCents * platformFeeBps) / 10_000);
}
