import { z } from "zod";
import {
  UserSchema,
  PurchaseSchema,
  ExtendedPurchaseSchema,
  BlockSchema,
  CreatorSchema,
  LicenseSchema,
  RenderJobSchema,
} from "../index.js";

export type User = z.infer<typeof UserSchema>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export type ExtendedPurchase = z.infer<typeof ExtendedPurchaseSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type Creator = z.infer<typeof CreatorSchema>;
export type License = z.infer<typeof LicenseSchema>;
export type RenderJob = z.infer<typeof RenderJobSchema>;

export type BlockStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "ARCHIVED";
export type StripeStatus =
  | "NOT_CONNECTED"
  | "PENDING"
  | "ENABLED"
  | "RESTRICTED"
  | "REJECTED";
export type LicenseStatus = "ACTIVE" | "REVOKED";
export type DeliveryStatus = "NOT_READY" | "READY" | "REVOKED";
