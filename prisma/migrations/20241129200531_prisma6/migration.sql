-- AlterTable
ALTER TABLE "_AuthDelegation" ADD CONSTRAINT "_AuthDelegation_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_AuthDelegation_AB_unique";

-- AlterTable
ALTER TABLE "_LessonToTagOptionTagValue" ADD CONSTRAINT "_LessonToTagOptionTagValue_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LessonToTagOptionTagValue_AB_unique";
