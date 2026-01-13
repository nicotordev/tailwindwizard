/*
  Warnings:

  - You are about to drop the column `iconURL` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `iconURL` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "iconURL",
ADD COLUMN     "screenshot" TEXT;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "iconURL",
ADD COLUMN     "icon" TEXT;
