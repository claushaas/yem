-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('video', 'text', 'courseWare');

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "videoSourceUrl" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "videoSourceUrl" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LessonType" NOT NULL DEFAULT 'video',
    "description" TEXT,
    "content" TEXT,
    "videoSourceUrl" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_values" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_option_tag_value" (
    "id" TEXT NOT NULL,
    "tagOptionId" TEXT NOT NULL,
    "tagValueId" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_option_tag_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT,
    "courseId" TEXT,
    "moduleId" TEXT,
    "responseToId" TEXT,
    "notify" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "progressInMilliseconds" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CourseToModule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CourseToTagOptionTagValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SubModules" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ModuleToTagOptionTagValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_LessonToModule" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_LessonToTagOptionTagValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_option_tag_value_tagOptionId_tagValueId_key" ON "tag_option_tag_value"("tagOptionId", "tagValueId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_lessonId_userId_key" ON "lesson_progress"("lessonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToRole_AB_unique" ON "_CourseToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToRole_B_index" ON "_CourseToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToModule_AB_unique" ON "_CourseToModule"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToModule_B_index" ON "_CourseToModule"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToTagOptionTagValue_AB_unique" ON "_CourseToTagOptionTagValue"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToTagOptionTagValue_B_index" ON "_CourseToTagOptionTagValue"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SubModules_AB_unique" ON "_SubModules"("A", "B");

-- CreateIndex
CREATE INDEX "_SubModules_B_index" ON "_SubModules"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ModuleToTagOptionTagValue_AB_unique" ON "_ModuleToTagOptionTagValue"("A", "B");

-- CreateIndex
CREATE INDEX "_ModuleToTagOptionTagValue_B_index" ON "_ModuleToTagOptionTagValue"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LessonToModule_AB_unique" ON "_LessonToModule"("A", "B");

-- CreateIndex
CREATE INDEX "_LessonToModule_B_index" ON "_LessonToModule"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LessonToTagOptionTagValue_AB_unique" ON "_LessonToTagOptionTagValue"("A", "B");

-- CreateIndex
CREATE INDEX "_LessonToTagOptionTagValue_B_index" ON "_LessonToTagOptionTagValue"("B");

-- AddForeignKey
ALTER TABLE "tag_option_tag_value" ADD CONSTRAINT "tag_option_tag_value_tagOptionId_fkey" FOREIGN KEY ("tagOptionId") REFERENCES "tag_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_option_tag_value" ADD CONSTRAINT "tag_option_tag_value_tagValueId_fkey" FOREIGN KEY ("tagValueId") REFERENCES "tag_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_responseToId_fkey" FOREIGN KEY ("responseToId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToRole" ADD CONSTRAINT "_CourseToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToRole" ADD CONSTRAINT "_CourseToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToModule" ADD CONSTRAINT "_CourseToModule_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToModule" ADD CONSTRAINT "_CourseToModule_B_fkey" FOREIGN KEY ("B") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToTagOptionTagValue" ADD CONSTRAINT "_CourseToTagOptionTagValue_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToTagOptionTagValue" ADD CONSTRAINT "_CourseToTagOptionTagValue_B_fkey" FOREIGN KEY ("B") REFERENCES "tag_option_tag_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubModules" ADD CONSTRAINT "_SubModules_A_fkey" FOREIGN KEY ("A") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubModules" ADD CONSTRAINT "_SubModules_B_fkey" FOREIGN KEY ("B") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToTagOptionTagValue" ADD CONSTRAINT "_ModuleToTagOptionTagValue_A_fkey" FOREIGN KEY ("A") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToTagOptionTagValue" ADD CONSTRAINT "_ModuleToTagOptionTagValue_B_fkey" FOREIGN KEY ("B") REFERENCES "tag_option_tag_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToModule" ADD CONSTRAINT "_LessonToModule_A_fkey" FOREIGN KEY ("A") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToModule" ADD CONSTRAINT "_LessonToModule_B_fkey" FOREIGN KEY ("B") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToTagOptionTagValue" ADD CONSTRAINT "_LessonToTagOptionTagValue_A_fkey" FOREIGN KEY ("A") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToTagOptionTagValue" ADD CONSTRAINT "_LessonToTagOptionTagValue_B_fkey" FOREIGN KEY ("B") REFERENCES "tag_option_tag_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
