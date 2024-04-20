/*
  Warnings:

  - You are about to drop the column `notify` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `lesson_progress` table. All the data in the column will be lost.
  - You are about to drop the column `progressInMilliseconds` on the `lesson_progress` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `lesson_progress` table. All the data in the column will be lost.
  - You are about to drop the column `publicationDate` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `publicationDate` on the `modules` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `modules` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tag_options` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tag_values` table. All the data in the column will be lost.
  - You are about to drop the `_CourseToModule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CourseToTagOptionTagValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ModuleToTagOptionTagValue` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `description` on table `courses` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `favorited_lessons` table without a default value. This is not possible if the table is not empty.
  - Made the column `order` on table `lesson_to_module` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `lessons` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `modules` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `provider` on the `user_subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubscriptionProviderType" AS ENUM ('hotmart', 'iugu', 'manual');

-- DropForeignKey
ALTER TABLE "_CourseToModule" DROP CONSTRAINT "_CourseToModule_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToModule" DROP CONSTRAINT "_CourseToModule_B_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToTagOptionTagValue" DROP CONSTRAINT "_CourseToTagOptionTagValue_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToTagOptionTagValue" DROP CONSTRAINT "_CourseToTagOptionTagValue_B_fkey";

-- DropForeignKey
ALTER TABLE "_ModuleToTagOptionTagValue" DROP CONSTRAINT "_ModuleToTagOptionTagValue_A_fkey";

-- DropForeignKey
ALTER TABLE "_ModuleToTagOptionTagValue" DROP CONSTRAINT "_ModuleToTagOptionTagValue_B_fkey";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "notify";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "published",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "thumbnailUrl" SET DEFAULT 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000';

-- AlterTable
ALTER TABLE "favorited_lessons" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isFavorited" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "lesson_progress" DROP COLUMN "finishedAt",
DROP COLUMN "progressInMilliseconds",
DROP COLUMN "startedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "lesson_to_module" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "order" SET NOT NULL;

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "publicationDate",
DROP COLUMN "published",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "thumbnailUrl" SET DEFAULT 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000';

-- AlterTable
ALTER TABLE "modules" DROP COLUMN "publicationDate",
DROP COLUMN "published",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "thumbnailUrl" SET DEFAULT 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000';

-- AlterTable
ALTER TABLE "tag_options" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "tag_values" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "user_subscriptions" ADD COLUMN     "providerSubscriptionStatus" TEXT,
DROP COLUMN "provider",
ADD COLUMN     "provider" "SubscriptionProviderType" NOT NULL;

-- DropTable
DROP TABLE "_CourseToModule";

-- DropTable
DROP TABLE "_CourseToTagOptionTagValue";

-- DropTable
DROP TABLE "_ModuleToTagOptionTagValue";

-- DropEnum
DROP TYPE "SubscriptionProvidersType";

-- CreateTable
CREATE TABLE "module_to_course" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_to_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_lessons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isSaved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_to_course_moduleId_courseId_key" ON "module_to_course"("moduleId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_lessons_userId_lessonId_key" ON "saved_lessons"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "module_to_course" ADD CONSTRAINT "module_to_course_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_to_course" ADD CONSTRAINT "module_to_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_lessons" ADD CONSTRAINT "saved_lessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
