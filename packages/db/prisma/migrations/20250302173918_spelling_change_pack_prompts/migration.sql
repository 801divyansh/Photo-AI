/*
  Warnings:

  - You are about to drop the `PackPromots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PackPromots" DROP CONSTRAINT "PackPromots_packId_fkey";

-- AlterTable
ALTER TABLE "OutputImages" ALTER COLUMN "imageUrl" SET DEFAULT '';

-- DropTable
DROP TABLE "PackPromots";

-- CreateTable
CREATE TABLE "PackPrompts" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "packId" TEXT NOT NULL,

    CONSTRAINT "PackPrompts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackPrompts" ADD CONSTRAINT "PackPrompts_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
