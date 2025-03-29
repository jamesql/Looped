/*
  Warnings:

  - You are about to drop the column `banner` on the `Server` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bannerId]` on the table `Server` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "banner",
ADD COLUMN     "bannerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Server_bannerId_key" ON "Server"("bannerId");

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "R2File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
