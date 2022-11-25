/*
  Warnings:

  - A unique constraint covering the columns `[activationLink]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activationLink` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activationLink" TEXT NOT NULL,
ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_activationLink_key" ON "User"("activationLink");
