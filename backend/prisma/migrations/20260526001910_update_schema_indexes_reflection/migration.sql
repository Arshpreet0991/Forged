/*
  Warnings:

  - You are about to drop the `Reflection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reflection" DROP CONSTRAINT "Reflection_dayId_fkey";

-- AlterTable
ALTER TABLE "Day" ADD COLUMN     "improve" TEXT,
ADD COLUMN     "right" TEXT,
ADD COLUMN     "wrong" TEXT;

-- DropTable
DROP TABLE "Reflection";

-- CreateIndex
CREATE INDEX "MainQuest_userId_idx" ON "MainQuest"("userId");

-- CreateIndex
CREATE INDEX "Task_dayId_idx" ON "Task"("dayId");
