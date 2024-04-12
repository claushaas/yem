-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "marketingContent" TEXT,
ADD COLUMN     "marketingVideoUrl" TEXT,
ADD COLUMN     "oldId" TEXT;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "marketingContent" TEXT,
ADD COLUMN     "marketingVideoUrl" TEXT,
ADD COLUMN     "oldId" TEXT;

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "marketingContent" TEXT,
ADD COLUMN     "marketingVideoUrl" TEXT,
ADD COLUMN     "oldId" TEXT;
