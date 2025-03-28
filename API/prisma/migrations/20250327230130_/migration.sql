-- CreateTable
CREATE TABLE "R2File" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "bucketFileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "R2File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "R2File" ADD CONSTRAINT "R2File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
