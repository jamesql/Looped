-- DropForeignKey
ALTER TABLE "Server" DROP CONSTRAINT "Server_id_fkey";

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
