/*
  Warnings:

  - You are about to drop the column `videoSouceUrl` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "videoSouceUrl",
ADD COLUMN     "videoSourceUrl" TEXT;
