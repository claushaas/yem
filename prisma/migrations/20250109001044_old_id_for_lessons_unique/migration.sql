/*
  Warnings:

  - A unique constraint covering the columns `[oldId]` on the table `lessons` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "lessons_oldId_key" ON "lessons"("oldId");
