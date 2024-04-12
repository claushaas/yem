/*
  Warnings:

  - Added the required column `authorFirstName` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorLastName` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "authorFirstName" TEXT NOT NULL,
ADD COLUMN     "authorLastName" TEXT NOT NULL;
