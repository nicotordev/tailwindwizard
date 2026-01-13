-- CreateEnum
CREATE TYPE "IconType" AS ENUM ('IMAGE', 'LUCIDE', 'REACT_ICONS');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "iconType" "IconType" NOT NULL DEFAULT 'LUCIDE';

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
