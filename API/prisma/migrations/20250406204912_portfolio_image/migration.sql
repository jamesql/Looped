/*
  Warnings:

  - You are about to drop the column `portfolioId` on the `R2File` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "R2File" DROP CONSTRAINT "R2File_portfolioId_fkey";

-- AlterTable
ALTER TABLE "R2File" DROP COLUMN "portfolioId";

-- CreateTable
CREATE TABLE "PortfolioImage" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "r2FileId" TEXT NOT NULL,

    CONSTRAINT "PortfolioImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PortfolioImage" ADD CONSTRAINT "PortfolioImage_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioImage" ADD CONSTRAINT "PortfolioImage_r2FileId_fkey" FOREIGN KEY ("r2FileId") REFERENCES "R2File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
