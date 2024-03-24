/*
  Warnings:

  - You are about to drop the `_CourseToRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SubModules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `provider` on the `user_subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubscriptionProvidersType" AS ENUM ('hotmart', 'iugu');

-- DropForeignKey
ALTER TABLE "_CourseToRole" DROP CONSTRAINT "_CourseToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToRole" DROP CONSTRAINT "_CourseToRole_B_fkey";

-- DropForeignKey
ALTER TABLE "_SubModules" DROP CONSTRAINT "_SubModules_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubModules" DROP CONSTRAINT "_SubModules_B_fkey";

-- AlterTable
ALTER TABLE "user_subscriptions" DROP COLUMN "provider",
ADD COLUMN     "provider" "SubscriptionProvidersType" NOT NULL;

-- DropTable
DROP TABLE "_CourseToRole";

-- DropTable
DROP TABLE "_SubModules";

-- DropTable
DROP TABLE "roles";

-- DropEnum
DROP TYPE "ProviderType";
