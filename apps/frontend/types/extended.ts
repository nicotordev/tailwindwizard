import { components } from "./api";

// Re-export generated types
export type User = components["schemas"]["User"];
export type Purchase = components["schemas"]["Purchase"];
export type Block = components["schemas"]["Block"];
export type Creator = components["schemas"]["Creator"];
export type Collection = components["schemas"]["Collection"];

// Extended types that might be missing or incomplete in auto-generated file
// due to backend DTOs not matching full Prisma models or being WIP.

export type BlockStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';
export type StripeStatus = 'NOT_CONNECTED' | 'PENDING' | 'ENABLED' | 'RESTRICTED' | 'REJECTED';
export type LicenseStatus = 'ACTIVE' | 'REVOKED';
export type DeliveryStatus = 'NOT_READY' | 'READY' | 'REVOKED';

export interface License {
  id: string;
  purchaseId: string;
  buyerId: string;
  blockId: string;
  type: 'PERSONAL' | 'TEAM' | 'ENTERPRISE';
  status: LicenseStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;

  // Relations often needed in UI
  block?: Block;
}

export interface RenderJob {
  id: string;
  blockId: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
  error?: string | null;
}

// We extend Purchase but ensure we don't conflict with generated type
export interface ExtendedPurchase extends Purchase {
  // Use compatible types or optional additions
  lineItems?: Array<{
    block: {
      id: string;
      title: string;
      slug: string;
    };
    licenseType?: string;
    amount?: number | string;
  }>;
}


export type CreatorProfile = components["schemas"]["Creator"] & {
  user?: components["schemas"]["User"];
  rejectedAt?: string | null;
  isBanned?: boolean;
};
