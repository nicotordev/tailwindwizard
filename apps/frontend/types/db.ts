/**
 * This file is manually generated to match the Prisma schema.
 * It provides TypeScript types and enums for the TailwindWizard database.
 */

// -----------------------------
// Enums
// -----------------------------

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum AuthProvider {
  CLERK = "CLERK",
}

export enum StripeAccountType {
  EXPRESS = "EXPRESS",
  STANDARD = "STANDARD",
  CUSTOM = "CUSTOM",
}

export enum StripeAccountStatus {
  NOT_CONNECTED = "NOT_CONNECTED",
  PENDING = "PENDING",
  ENABLED = "ENABLED",
  RESTRICTED = "RESTRICTED",
  REJECTED = "REJECTED",
}

export enum BlockType {
  COMPONENT = "COMPONENT",
  SECTION = "SECTION",
  PAGE = "PAGE",
}

export enum BlockFramework {
  REACT = "REACT",
  VUE = "VUE",
  SVELTE = "SVELTE",
}

export enum StylingEngine {
  TAILWIND = "TAILWIND",
  CSS = "CSS",
}

export enum Visibility {
  PRIVATE = "PRIVATE",
  UNLISTED = "UNLISTED",
  PUBLIC = "PUBLIC",
}

export enum BlockStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PUBLISHED = "PUBLISHED",
  UNPUBLISHED = "UNPUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum ModerationDecision {
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  REQUEST_CHANGES = "REQUEST_CHANGES",
}

export enum RenderJobStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
}

export enum PreviewViewport {
  MOBILE = "MOBILE",
  TABLET = "TABLET",
  DESKTOP = "DESKTOP",
}

export enum FileKind {
  COMPONENT = "COMPONENT",
  STYLE = "STYLE",
  UTILS = "UTILS",
  README = "README",
  ASSET = "ASSET",
  OTHER = "OTHER",
}

export enum CodeStorageKind {
  INLINE_ENCRYPTED = "INLINE_ENCRYPTED",
  OBJECT_STORAGE = "OBJECT_STORAGE",
}

export enum CurrencyCode {
  USD = "USD",
  EUR = "EUR",
  CLP = "CLP",
  GBP = "GBP",
  MXN = "MXN",
  ARS = "ARS",
  BRL = "BRL",
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELED = "CANCELED",
  REFUNDED = "REFUNDED",
  CHARGEBACK = "CHARGEBACK",
}

export enum DeliveryStatus {
  NOT_READY = "NOT_READY",
  READY = "READY",
  REVOKED = "REVOKED",
}

export enum LicenseType {
  PERSONAL = "PERSONAL",
  TEAM = "TEAM",
  ENTERPRISE = "ENTERPRISE",
}

export enum LicenseStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
}

export enum RefundStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PROCESSED = "PROCESSED",
}

export enum DisputeStatus {
  OPEN = "OPEN",
  NEEDS_RESPONSE = "NEEDS_RESPONSE",
  UNDER_REVIEW = "UNDER_REVIEW",
  WON = "WON",
  LOST = "LOST",
  CLOSED = "CLOSED",
}

export enum ReviewStatus {
  VISIBLE = "VISIBLE",
  HIDDEN = "HIDDEN",
  REMOVED = "REMOVED",
}

export enum ApiKeyScope {
  READ_PUBLIC = "READ_PUBLIC",
  DOWNLOAD_PURCHASED = "DOWNLOAD_PURCHASED",
  ADMIN = "ADMIN",
}

export enum WebhookProvider {
  STRIPE = "STRIPE",
}

export enum WebhookStatus {
  RECEIVED = "RECEIVED",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  IGNORED = "IGNORED",
}

export enum AuditActorType {
  USER = "USER",
  SYSTEM = "SYSTEM",
}

export enum AuditAction {
  USER_CREATE = "USER_CREATE",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",

  CREATOR_CONNECT_STRIPE = "CREATOR_CONNECT_STRIPE",
  CREATOR_UPDATE_STRIPE = "CREATOR_UPDATE_STRIPE",

  BLOCK_CREATE = "BLOCK_CREATE",
  BLOCK_UPDATE = "BLOCK_UPDATE",
  BLOCK_SUBMIT = "BLOCK_SUBMIT",
  BLOCK_APPROVE = "BLOCK_APPROVE",
  BLOCK_REJECT = "BLOCK_REJECT",
  BLOCK_PUBLISH = "BLOCK_PUBLISH",
  BLOCK_UNPUBLISH = "BLOCK_UNPUBLISH",
  BLOCK_ARCHIVE = "BLOCK_ARCHIVE",

  RENDERJOB_CREATE = "RENDERJOB_CREATE",
  RENDERJOB_UPDATE = "RENDERJOB_UPDATE",

  PURCHASE_CREATE = "PURCHASE_CREATE",
  PURCHASE_PAID = "PURCHASE_PAID",
  PURCHASE_FAILED = "PURCHASE_FAILED",
  PURCHASE_REFUNDED = "PURCHASE_REFUNDED",
  PURCHASE_CHARGEBACK = "PURCHASE_CHARGEBACK",

  LICENSE_REVOKE = "LICENSE_REVOKE",
  DOWNLOAD_CREATE = "DOWNLOAD_CREATE",

  REVIEW_CREATE = "REVIEW_CREATE",
  REVIEW_UPDATE = "REVIEW_UPDATE",
  REVIEW_MODERATE = "REVIEW_MODERATE",

  DISPUTE_CREATE = "DISPUTE_CREATE",
  DISPUTE_UPDATE = "DISPUTE_UPDATE",

  WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED",
  WEBHOOK_PROCESSED = "WEBHOOK_PROCESSED",
  WEBHOOK_FAILED = "WEBHOOK_FAILED",
}

export enum PlanTier {
  FREE = "FREE",
  PRO = "PRO",
  TEAM = "TEAM",
  ENTERPRISE = "ENTERPRISE",
}

// -----------------------------
// Models
// -----------------------------

export interface User {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  authProvider: AuthProvider;
  externalAuthId: string | null;

  // Creator profile
  creator?: Creator | null;

  // Buyer side
  purchases?: Purchase[];
  licenses?: License[];
  downloads?: Download[];
  reviews?: Review[];

  // Platform subscriptions
  planTier: PlanTier;
  planExpiresAt: Date | null;

  // Security / ops
  apiKeys?: ApiKey[];
  auditLogs?: AuditLog[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  moderationEvents?: ModerationEvent[];
}

export interface Creator {
  id: string;
  userId: string;
  user?: User;

  displayName: string | null;
  bio: string | null;
  websiteUrl: string | null;
  portfolioUrl: string | null;
  countryCode: string | null;

  // Stripe Connect
  stripeAccountId: string | null;
  stripeAccountType: StripeAccountType;
  stripeAccountStatus: StripeAccountStatus;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeDetailsSubmitted: boolean;

  // Compliance / moderation
  isApprovedSeller: boolean;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;

  blocks?: Block[];
  payouts?: Payout[];

  createdAt: Date;
  updatedAt: Date;
}

export interface Block {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  iconURL: string | null;
  changelog: string | null;
  type: BlockType;
  framework: BlockFramework;
  stylingEngine: StylingEngine;

  version: string;
  visibility: Visibility;
  status: BlockStatus;

  // Pricing
  currency: CurrencyCode;
  price: number; // Decimal in DB, number in TS
  platformFeeBps: number;

  // Ownership
  creatorId: string;
  creator?: Creator;

  // Public preview assets
  previews?: PreviewAsset[];

  // Private code payload
  codeBundle?: CodeBundle | null;

  // Dependencies metadata
  registryDeps?: BlockRegistryDependency[];
  npmDeps?: BlockNpmDependency[];

  // Tags / categories
  tags?: BlockTag[];

  // Moderation
  moderationEvents?: ModerationEvent[];
  renderJobs?: RenderJob[];

  // Commerce
  lineItems?: PurchaseLineItem[];
  licenses?: License[];
  reviews?: Review[];

  // Counters
  soldCount: number;
  ratingAvg: number;
  ratingCount: number;

  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  archivedAt: Date | null;
}

export interface CodeBundle {
  id: string;
  blockId: string;
  block?: Block;

  storageKind: CodeStorageKind;

  objectKey: string | null;
  objectRegion: string | null;
  objectBucket: string | null;

  encryptedJson: string | null;

  sha256: string | null;
  astScanPassed: boolean;
  astScanReport: string | null;

  watermarkStrategyVersion: string;

  createdAt: Date;
  updatedAt: Date;
  blockFiles?: BlockFile[];
}

export interface BlockFile {
  id: string;
  codeBundleId: string;
  codeBundle?: CodeBundle;

  path: string;
  kind: FileKind;

  encryptedContent: string | null;

  createdAt: Date;
}

export interface PreviewAsset {
  id: string;
  blockId: string;
  block?: Block;

  viewport: PreviewViewport;
  url: string;
  width: number;
  height: number;

  videoUrl: string | null;
  watermarked: boolean;

  createdAt: Date;
}

export interface BlockRegistryDependency {
  id: string;
  blockId: string;
  block?: Block;

  name: string;
  version: string | null;
}

export interface BlockNpmDependency {
  id: string;
  blockId: string;
  block?: Block;

  name: string;
  version: string | null;
  isDev: boolean;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;

  blocks?: BlockTag[];
}

export interface BlockTag {
  id: string;
  blockId: string;
  block?: Block;

  tagId: string;
  tag?: Tag;
}

export interface ModerationEvent {
  id: string;
  blockId: string;
  block?: Block;

  decidedById: string | null;
  decidedBy?: User | null;

  decision: ModerationDecision;
  reason: string | null;
  notes: string | null;

  createdAt: Date;
}

export interface RenderJob {
  id: string;
  blockId: string;
  block?: Block;

  status: RenderJobStatus;

  queueName: string | null;
  queueJobId: string | null;
  workerId: string | null;

  startedAt: Date | null;
  finishedAt: Date | null;
  error: string | null;
  attempts: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  buyerId: string;
  buyer?: User;

  status: PurchaseStatus;
  refundStatus: RefundStatus;
  disputeStatus: DisputeStatus | null;

  currency: CurrencyCode;
  subtotalAmount: number;
  platformFeeAmount: number;
  stripeFeeAmount: number;
  totalAmount: number;

  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  stripeChargeId: string | null;

  paidAt: Date | null;
  canceledAt: Date | null;
  refundedAt: Date | null;
  chargebackAt: Date | null;

  lineItems?: PurchaseLineItem[];
  licenses?: License[];
  downloads?: Download[];

  createdAt: Date;
  updatedAt: Date;
  dispute?: Dispute | null;
  reviews?: Review[];
}

export interface PurchaseLineItem {
  id: string;
  purchaseId: string;
  purchase?: Purchase;

  blockId: string;
  block?: Block;

  licenseType: LicenseType;

  unitPrice: number;
  quantity: number;

  createdAt: Date;
}

export interface License {
  id: string;
  purchaseId: string;
  purchase?: Purchase;

  buyerId: string;
  buyer?: User;

  blockId: string;
  block?: Block;

  type: LicenseType;
  status: LicenseStatus;

  eulaVersion: string;

  deliveryStatus: DeliveryStatus;
  deliveryReadyAt: Date | null;

  transactionHash: string;

  revokedAt: Date | null;
  revokeReason: string | null;

  downloads?: Download[];

  createdAt: Date;
  updatedAt: Date;
}

export interface Download {
  id: string;
  licenseId: string;
  license?: License;

  purchaseId: string;
  purchase?: Purchase;

  buyerId: string;
  buyer?: User;

  signedUrlId: string | null;
  ipAddress: string | null;
  userAgent: string | null;

  createdAt: Date;
}

export interface Payout {
  id: string;
  creatorId: string;
  creator?: Creator;

  currency: CurrencyCode;
  amount: number;

  stripeTransferId: string | null;
  stripePayoutId: string | null;

  periodStart: Date | null;
  periodEnd: Date | null;

  createdAt: Date;
  paidAt: Date | null;
}

export interface Dispute {
  id: string;
  purchaseId: string;
  purchase?: Purchase;

  status: DisputeStatus;

  stripeDisputeId: string | null;

  reason: string | null;
  evidence: string | null;

  openedAt: Date;
  closedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  blockId: string;
  block?: Block;

  buyerId: string;
  buyer?: User;

  purchaseId: string | null;
  purchase?: Purchase | null;

  rating: number;
  title: string | null;
  body: string | null;

  status: ReviewStatus;

  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  user?: User;

  name: string;
  scope: ApiKeyScope;

  keyHash: string;
  prefix: string;
  lastUsedAt: Date | null;

  createdAt: Date;
  revokedAt: Date | null;
}

export interface WebhookEvent {
  id: string;
  provider: WebhookProvider;
  status: WebhookStatus;

  externalId: string;
  eventType: string;
  payload: Record<string, unknown> | null; // Json type in Prisma

  receivedAt: Date;
  processedAt: Date | null;
  error: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  actorType: AuditActorType;
  actorUserId: string | null;
  actorUser?: User | null;

  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;

  createdAt: Date;
}
