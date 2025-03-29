/*
  Warnings:

  - You are about to drop the column `icon` on the `Server` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[iconId]` on the table `Server` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "icon",
ADD COLUMN     "iconId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Server_iconId_key" ON "Server"("iconId");

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "R2File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
