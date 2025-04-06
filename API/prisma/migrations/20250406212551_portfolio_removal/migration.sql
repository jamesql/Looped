/*
  Warnings:

  - You are about to drop the `PortfolioImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PortfolioImage" DROP CONSTRAINT "PortfolioImage_r2FileId_fkey";

-- DropForeignKey
ALTER TABLE "PortfolioImage" DROP CONSTRAINT "PortfolioImage_userId_fkey";

-- AlterTable
ALTER TABLE "R2File" ADD COLUMN     "portfolioOwnerId" TEXT;

-- DropTable
DROP TABLE "PortfolioImage";

-- AddForeignKey
ALTER TABLE "R2File" ADD CONSTRAINT "R2File_portfolioOwnerId_fkey" FOREIGN KEY ("portfolioOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
