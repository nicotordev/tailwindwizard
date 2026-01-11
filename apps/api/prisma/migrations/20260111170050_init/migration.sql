-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('CLERK');

-- CreateEnum
CREATE TYPE "StripeAccountType" AS ENUM ('EXPRESS', 'STANDARD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StripeAccountStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'ENABLED', 'RESTRICTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('COMPONENT', 'SECTION', 'PAGE');

-- CreateEnum
CREATE TYPE "BlockFramework" AS ENUM ('REACT', 'VUE', 'SVELTE');

-- CreateEnum
CREATE TYPE "StylingEngine" AS ENUM ('TAILWIND', 'CSS');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ModerationDecision" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CHANGES');

-- CreateEnum
CREATE TYPE "RenderJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PreviewViewport" AS ENUM ('MOBILE', 'TABLET', 'DESKTOP');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('COMPONENT', 'STYLE', 'UTILS', 'README', 'ASSET', 'OTHER');

-- CreateEnum
CREATE TYPE "CodeStorageKind" AS ENUM ('INLINE_ENCRYPTED', 'INLINE_PLAIN', 'OBJECT_STORAGE');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('USD', 'EUR', 'CLP', 'GBP', 'MXN', 'ARS', 'BRL');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELED', 'REFUNDED', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('NOT_READY', 'READY', 'REVOKED');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('PERSONAL', 'TEAM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'NEEDS_RESPONSE', 'UNDER_REVIEW', 'WON', 'LOST', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'REMOVED');

-- CreateEnum
CREATE TYPE "ApiKeyScope" AS ENUM ('READ_PUBLIC', 'DOWNLOAD_PURCHASED', 'ADMIN');

-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'CREATOR_CONNECT_STRIPE', 'CREATOR_UPDATE_STRIPE', 'BLOCK_CREATE', 'BLOCK_UPDATE', 'BLOCK_SUBMIT', 'BLOCK_APPROVE', 'BLOCK_REJECT', 'BLOCK_PUBLISH', 'BLOCK_UNPUBLISH', 'BLOCK_ARCHIVE', 'RENDERJOB_CREATE', 'RENDERJOB_UPDATE', 'PURCHASE_CREATE', 'PURCHASE_PAID', 'PURCHASE_FAILED', 'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'LICENSE_REVOKE', 'DOWNLOAD_CREATE', 'REVIEW_CREATE', 'REVIEW_UPDATE', 'REVIEW_MODERATE', 'DISPUTE_CREATE', 'DISPUTE_UPDATE', 'WEBHOOK_RECEIVED', 'WEBHOOK_PROCESSED', 'WEBHOOK_FAILED');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'TEAM', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'CLERK',
    "externalAuthId" TEXT,
    "planTier" "PlanTier" NOT NULL DEFAULT 'FREE',
    "planExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "websiteUrl" TEXT,
    "portfolioUrl" TEXT,
    "countryCode" TEXT,
    "stripeAccountId" TEXT,
    "stripeAccountType" "StripeAccountType" NOT NULL DEFAULT 'EXPRESS',
    "stripeAccountStatus" "StripeAccountStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "stripeChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripePayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stripeDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "isApprovedSeller" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "changelog" TEXT,
    "type" "BlockType" NOT NULL DEFAULT 'COMPONENT',
    "framework" "BlockFramework" NOT NULL DEFAULT 'REACT',
    "stylingEngine" "StylingEngine" NOT NULL DEFAULT 'TAILWIND',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "BlockStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" "CurrencyCode" NOT NULL DEFAULT 'USD',
    "price" DECIMAL(10,2) NOT NULL,
    "platformFeeBps" INTEGER NOT NULL DEFAULT 1500,
    "creatorId" TEXT NOT NULL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeBundle" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "storageKind" "CodeStorageKind" NOT NULL DEFAULT 'OBJECT_STORAGE',
    "objectKey" TEXT,
    "objectRegion" TEXT,
    "objectBucket" TEXT,
    "encryptedJson" TEXT,
    "sha256" TEXT,
    "astScanPassed" BOOLEAN NOT NULL DEFAULT false,
    "astScanReport" TEXT,
    "watermarkStrategyVersion" TEXT NOT NULL DEFAULT 'v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockFile" (
    "id" TEXT NOT NULL,
    "codeBundleId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "kind" "FileKind" NOT NULL DEFAULT 'OTHER',
    "encryptedContent" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreviewAsset" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "viewport" "PreviewViewport" NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "videoUrl" TEXT,
    "watermarked" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreviewAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockRegistryDependency" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,

    CONSTRAINT "BlockRegistryDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockNpmDependency" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "isDev" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BlockNpmDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockTag" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlockTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockCategory" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "BlockCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationEvent" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "decidedById" TEXT,
    "decision" "ModerationDecision" NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "status" "RenderJobStatus" NOT NULL DEFAULT 'QUEUED',
    "queueName" TEXT,
    "queueJobId" TEXT,
    "workerId" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
    "disputeStatus" "DisputeStatus",
    "currency" "CurrencyCode" NOT NULL DEFAULT 'USD',
    "subtotalAmount" DECIMAL(10,2) NOT NULL,
    "platformFeeAmount" DECIMAL(10,2) NOT NULL,
    "stripeFeeAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripeChargeId" TEXT,
    "paidAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "chargebackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLineItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "licenseType" "LicenseType" NOT NULL DEFAULT 'PERSONAL',
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "type" "LicenseType" NOT NULL DEFAULT 'PERSONAL',
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "eulaVersion" TEXT NOT NULL DEFAULT 'v1',
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'NOT_READY',
    "deliveryReadyAt" TIMESTAMP(3),
    "transactionHash" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Download" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "signedUrlId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Download_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'USD',
    "amount" DECIMAL(10,2) NOT NULL,
    "stripeTransferId" TEXT,
    "stripePayoutId" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "stripeDisputeId" TEXT,
    "reason" TEXT,
    "evidence" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "purchaseId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "ApiKeyScope" NOT NULL DEFAULT 'READ_PUBLIC',
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "WebhookProvider" NOT NULL DEFAULT 'STRIPE',
    "status" "WebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "externalId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorType" "AuditActorType" NOT NULL DEFAULT 'SYSTEM',
    "actorUserId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_externalAuthId_key" ON "User"("externalAuthId");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_userId_key" ON "Creator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_stripeAccountId_key" ON "Creator"("stripeAccountId");

-- CreateIndex
CREATE INDEX "Creator_isApprovedSeller_idx" ON "Creator"("isApprovedSeller");

-- CreateIndex
CREATE INDEX "Creator_stripeAccountStatus_idx" ON "Creator"("stripeAccountStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Block_slug_key" ON "Block"("slug");

-- CreateIndex
CREATE INDEX "Block_creatorId_status_idx" ON "Block"("creatorId", "status");

-- CreateIndex
CREATE INDEX "Block_visibility_status_idx" ON "Block"("visibility", "status");

-- CreateIndex
CREATE INDEX "Block_publishedAt_idx" ON "Block"("publishedAt");

-- CreateIndex
CREATE INDEX "Block_soldCount_idx" ON "Block"("soldCount");

-- CreateIndex
CREATE UNIQUE INDEX "CodeBundle_blockId_key" ON "CodeBundle"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeBundle_objectKey_key" ON "CodeBundle"("objectKey");

-- CreateIndex
CREATE INDEX "CodeBundle_astScanPassed_idx" ON "CodeBundle"("astScanPassed");

-- CreateIndex
CREATE INDEX "BlockFile_codeBundleId_idx" ON "BlockFile"("codeBundleId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockFile_codeBundleId_path_key" ON "BlockFile"("codeBundleId", "path");

-- CreateIndex
CREATE INDEX "PreviewAsset_blockId_idx" ON "PreviewAsset"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "PreviewAsset_blockId_viewport_key" ON "PreviewAsset"("blockId", "viewport");

-- CreateIndex
CREATE INDEX "BlockRegistryDependency_blockId_idx" ON "BlockRegistryDependency"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockRegistryDependency_blockId_name_key" ON "BlockRegistryDependency"("blockId", "name");

-- CreateIndex
CREATE INDEX "BlockNpmDependency_blockId_idx" ON "BlockNpmDependency"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockNpmDependency_blockId_name_isDev_key" ON "BlockNpmDependency"("blockId", "name", "isDev");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "BlockTag_tagId_idx" ON "BlockTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockTag_blockId_tagId_key" ON "BlockTag"("blockId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "BlockCategory_categoryId_idx" ON "BlockCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockCategory_blockId_categoryId_key" ON "BlockCategory"("blockId", "categoryId");

-- CreateIndex
CREATE INDEX "ModerationEvent_blockId_createdAt_idx" ON "ModerationEvent"("blockId", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationEvent_decidedById_idx" ON "ModerationEvent"("decidedById");

-- CreateIndex
CREATE INDEX "RenderJob_blockId_status_idx" ON "RenderJob"("blockId", "status");

-- CreateIndex
CREATE INDEX "RenderJob_status_createdAt_idx" ON "RenderJob"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripePaymentIntentId_key" ON "Purchase"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeCheckoutSessionId_key" ON "Purchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeChargeId_key" ON "Purchase"("stripeChargeId");

-- CreateIndex
CREATE INDEX "Purchase_buyerId_createdAt_idx" ON "Purchase"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "Purchase_status_createdAt_idx" ON "Purchase"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PurchaseLineItem_purchaseId_idx" ON "PurchaseLineItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseLineItem_blockId_idx" ON "PurchaseLineItem"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseLineItem_purchaseId_blockId_licenseType_key" ON "PurchaseLineItem"("purchaseId", "blockId", "licenseType");

-- CreateIndex
CREATE UNIQUE INDEX "License_transactionHash_key" ON "License"("transactionHash");

-- CreateIndex
CREATE INDEX "License_buyerId_createdAt_idx" ON "License"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "License_blockId_createdAt_idx" ON "License"("blockId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "License_buyerId_blockId_type_purchaseId_key" ON "License"("buyerId", "blockId", "type", "purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Download_signedUrlId_key" ON "Download"("signedUrlId");

-- CreateIndex
CREATE INDEX "Download_buyerId_createdAt_idx" ON "Download"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "Download_licenseId_createdAt_idx" ON "Download"("licenseId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_stripeTransferId_key" ON "Payout"("stripeTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_stripePayoutId_key" ON "Payout"("stripePayoutId");

-- CreateIndex
CREATE INDEX "Payout_creatorId_createdAt_idx" ON "Payout"("creatorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_purchaseId_key" ON "Dispute"("purchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_stripeDisputeId_key" ON "Dispute"("stripeDisputeId");

-- CreateIndex
CREATE INDEX "Review_blockId_createdAt_idx" ON "Review"("blockId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_buyerId_createdAt_idx" ON "Review"("buyerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_blockId_buyerId_key" ON "Review"("blockId", "buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_createdAt_idx" ON "ApiKey"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiKey_scope_idx" ON "ApiKey"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_externalId_key" ON "WebhookEvent"("externalId");

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_status_receivedAt_idx" ON "WebhookEvent"("provider", "status", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_eventType_receivedAt_idx" ON "WebhookEvent"("eventType", "receivedAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeBundle" ADD CONSTRAINT "CodeBundle_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockFile" ADD CONSTRAINT "BlockFile_codeBundleId_fkey" FOREIGN KEY ("codeBundleId") REFERENCES "CodeBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreviewAsset" ADD CONSTRAINT "PreviewAsset_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockRegistryDependency" ADD CONSTRAINT "BlockRegistryDependency_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockNpmDependency" ADD CONSTRAINT "BlockNpmDependency_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockTag" ADD CONSTRAINT "BlockTag_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockTag" ADD CONSTRAINT "BlockTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockCategory" ADD CONSTRAINT "BlockCategory_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockCategory" ADD CONSTRAINT "BlockCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationEvent" ADD CONSTRAINT "ModerationEvent_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationEvent" ADD CONSTRAINT "ModerationEvent_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLineItem" ADD CONSTRAINT "PurchaseLineItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLineItem" ADD CONSTRAINT "PurchaseLineItem_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
