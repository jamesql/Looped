/*
  Warnings:

  - The primary key for the `ServerMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `ServerMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServerMember" DROP CONSTRAINT "ServerMember_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ServerMember_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "_ServerMemberRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServerMemberRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServerMemberRoles_B_index" ON "_ServerMemberRoles"("B");

-- AddForeignKey
ALTER TABLE "_ServerMemberRoles" ADD CONSTRAINT "_ServerMemberRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServerMemberRoles" ADD CONSTRAINT "_ServerMemberRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "ServerMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
