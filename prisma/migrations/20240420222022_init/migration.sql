-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('video', 'text', 'courseWare');

-- CreateEnum
CREATE TYPE "SubscriptionProviderType" AS ENUM ('hotmart', 'iugu', 'manual');

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "oldId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "marketingContent" TEXT,
    "videoSourceUrl" TEXT,
    "marketingVideoUrl" TEXT,
    "thumbnailUrl" TEXT NOT NULL DEFAULT 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isSelling" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "oldId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "marketingContent" TEXT,
    "videoSourceUrl" TEXT,
    "marketingVideoUrl" TEXT,
    "thumbnailUrl" TEXT NOT NULL DEFAULT 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isLessonsOrderRandom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "oldId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "LessonType" NOT NULL DEFAULT 'video',
    "description" TEXT NOT NULL,
    "content" TEXT,
    "marketingContent" TEXT,
    "videoSourceUrl" TEXT,
    "marketingVideoUrl" TEXT,
    "thumbnailUrl" TEXT NOT NULL DEFAULT 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_to_module" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_to_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_values" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_option_tag_value" (
    "id" TEXT NOT NULL,
    "tagOptionName" TEXT NOT NULL,
    "tagValueName" TEXT NOT NULL,
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
    "authorFirstName" TEXT NOT NULL,
    "authorLastName" TEXT NOT NULL,
    "lessonId" TEXT,
    "courseId" TEXT,
    "moduleId" TEXT,
    "responseToId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorited_lessons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isFavorited" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorited_lessons_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "provider" "SubscriptionProviderType" NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "providerSubscriptionStatus" TEXT,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuthDelegation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_LessonToTagOptionTagValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_name_key" ON "courses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "modules_slug_key" ON "modules"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "module_to_course_moduleId_courseId_key" ON "module_to_course"("moduleId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_to_module_lessonId_moduleId_key" ON "lesson_to_module"("lessonId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_options_name_key" ON "tag_options"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_values_name_key" ON "tag_values"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_option_tag_value_tagOptionName_tagValueName_key" ON "tag_option_tag_value"("tagOptionName", "tagValueName");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_lessonId_userId_key" ON "lesson_progress"("lessonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorited_lessons_userId_lessonId_key" ON "favorited_lessons"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_lessons_userId_lessonId_key" ON "saved_lessons"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_providerSubscriptionId_key" ON "user_subscriptions"("providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_userId_courseId_providerSubscriptionId_key" ON "user_subscriptions"("userId", "courseId", "providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "_AuthDelegation_AB_unique" ON "_AuthDelegation"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthDelegation_B_index" ON "_AuthDelegation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_LessonToTagOptionTagValue_AB_unique" ON "_LessonToTagOptionTagValue"("A", "B");

-- CreateIndex
CREATE INDEX "_LessonToTagOptionTagValue_B_index" ON "_LessonToTagOptionTagValue"("B");

-- AddForeignKey
ALTER TABLE "module_to_course" ADD CONSTRAINT "module_to_course_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_to_course" ADD CONSTRAINT "module_to_course_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_to_module" ADD CONSTRAINT "lesson_to_module_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_to_module" ADD CONSTRAINT "lesson_to_module_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_option_tag_value" ADD CONSTRAINT "tag_option_tag_value_tagOptionName_fkey" FOREIGN KEY ("tagOptionName") REFERENCES "tag_options"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_option_tag_value" ADD CONSTRAINT "tag_option_tag_value_tagValueName_fkey" FOREIGN KEY ("tagValueName") REFERENCES "tag_values"("name") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "favorited_lessons" ADD CONSTRAINT "favorited_lessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_lessons" ADD CONSTRAINT "saved_lessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthDelegation" ADD CONSTRAINT "_AuthDelegation_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthDelegation" ADD CONSTRAINT "_AuthDelegation_B_fkey" FOREIGN KEY ("B") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToTagOptionTagValue" ADD CONSTRAINT "_LessonToTagOptionTagValue_A_fkey" FOREIGN KEY ("A") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonToTagOptionTagValue" ADD CONSTRAINT "_LessonToTagOptionTagValue_B_fkey" FOREIGN KEY ("B") REFERENCES "tag_option_tag_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;
