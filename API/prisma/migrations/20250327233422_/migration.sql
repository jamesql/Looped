/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `R2File` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "R2File" ADD COLUMN     "messageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "R2File_messageId_key" ON "R2File"("messageId");

-- AddForeignKey
ALTER TABLE "R2File" ADD CONSTRAINT "R2File_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
