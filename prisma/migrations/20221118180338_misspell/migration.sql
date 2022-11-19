/*
  Warnings:

  - You are about to drop the column `scort` on the `Option` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Option" DROP COLUMN "scort",
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;
