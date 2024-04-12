-- CreateTable
CREATE TABLE "favorited_lessons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "favorited_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorited_lessons_userId_lessonId_key" ON "favorited_lessons"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "favorited_lessons" ADD CONSTRAINT "favorited_lessons_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
