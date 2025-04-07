/*
  Warnings:

  - You are about to drop the column `portfolioId` on the `PortfolioImage` table. All the data in the column will be lost.
  - You are about to drop the `Portfolio` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `PortfolioImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_userId_fkey";

-- DropForeignKey
ALTER TABLE "PortfolioImage" DROP CONSTRAINT "PortfolioImage_portfolioId_fkey";

-- AlterTable
ALTER TABLE "PortfolioImage" DROP COLUMN "portfolioId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Portfolio";

-- AddForeignKey
ALTER TABLE "PortfolioImage" ADD CONSTRAINT "PortfolioImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
