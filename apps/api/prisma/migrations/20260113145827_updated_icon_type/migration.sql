/*
  Warnings:

  - The values [REACT_ICONS] on the enum `IconType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IconType_new" AS ENUM ('IMAGE', 'LUCIDE', 'REACT_ICON', 'EMOJI');
ALTER TABLE "public"."Category" ALTER COLUMN "iconType" DROP DEFAULT;
ALTER TABLE "Category" ALTER COLUMN "iconType" TYPE "IconType_new" USING ("iconType"::text::"IconType_new");
ALTER TYPE "IconType" RENAME TO "IconType_old";
ALTER TYPE "IconType_new" RENAME TO "IconType";
DROP TYPE "public"."IconType_old";
ALTER TABLE "Category" ALTER COLUMN "iconType" SET DEFAULT 'LUCIDE';
COMMIT;
