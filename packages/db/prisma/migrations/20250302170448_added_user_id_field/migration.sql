/*
  Warnings:

  - The values [AsianAmerican,EastAsian,SouthEastAsian,SouthAsian,MiddleEastern] on the enum `EthinicityEnum` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EthinicityEnum_new" AS ENUM ('White', 'Black', 'Asian American', 'East Asian', 'South East Asian', 'South Asian', 'Middle Eastern', 'Pacific', 'Hispanic');
ALTER TABLE "Model" ALTER COLUMN "ethinicity" TYPE "EthinicityEnum_new" USING ("ethinicity"::text::"EthinicityEnum_new");
ALTER TYPE "EthinicityEnum" RENAME TO "EthinicityEnum_old";
ALTER TYPE "EthinicityEnum_new" RENAME TO "EthinicityEnum";
DROP TYPE "EthinicityEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
