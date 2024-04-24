-- DropForeignKey
ALTER TABLE "favorited_lessons" DROP CONSTRAINT "favorited_lessons_lessonSlug_fkey";

-- DropForeignKey
ALTER TABLE "lesson_to_module" DROP CONSTRAINT "lesson_to_module_lessonSlug_fkey";

-- DropForeignKey
ALTER TABLE "lesson_to_module" DROP CONSTRAINT "lesson_to_module_moduleSlug_fkey";

-- DropForeignKey
ALTER TABLE "module_to_course" DROP CONSTRAINT "module_to_course_courseSlug_fkey";

-- DropForeignKey
ALTER TABLE "module_to_course" DROP CONSTRAINT "module_to_course_moduleSlug_fkey";

-- DropForeignKey
ALTER TABLE "saved_lessons" DROP CONSTRAINT "saved_lessons_lessonSlug_fkey";

-- DropForeignKey
ALTER TABLE "user_subscriptions" DROP CONSTRAINT "user_subscriptions_courseSlug_fkey";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "order" INTEGER;

-- AddForeignKey
ALTER TABLE "module_to_course" ADD CONSTRAINT "module_to_course_moduleSlug_fkey" FOREIGN KEY ("moduleSlug") REFERENCES "modules"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_to_course" ADD CONSTRAINT "module_to_course_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "courses"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_to_module" ADD CONSTRAINT "lesson_to_module_lessonSlug_fkey" FOREIGN KEY ("lessonSlug") REFERENCES "lessons"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_to_module" ADD CONSTRAINT "lesson_to_module_moduleSlug_fkey" FOREIGN KEY ("moduleSlug") REFERENCES "modules"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorited_lessons" ADD CONSTRAINT "favorited_lessons_lessonSlug_fkey" FOREIGN KEY ("lessonSlug") REFERENCES "lessons"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_lessons" ADD CONSTRAINT "saved_lessons_lessonSlug_fkey" FOREIGN KEY ("lessonSlug") REFERENCES "lessons"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "courses"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
