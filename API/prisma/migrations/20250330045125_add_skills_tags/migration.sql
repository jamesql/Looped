/*
  Warnings:

  - You are about to drop the column `files` on the `Portfolio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "files";

-- AlterTable
ALTER TABLE "R2File" ADD COLUMN     "portfolioId" TEXT;

-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "R2File" ADD CONSTRAINT "R2File_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
