/*
  Warnings:

  - Added the required column `serverid` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "serverid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_serverid_fkey" FOREIGN KEY ("serverid") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
