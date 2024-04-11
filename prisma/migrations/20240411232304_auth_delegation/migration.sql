-- CreateTable
CREATE TABLE "_AuthDelegation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AuthDelegation_AB_unique" ON "_AuthDelegation"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthDelegation_B_index" ON "_AuthDelegation"("B");

-- AddForeignKey
ALTER TABLE "_AuthDelegation" ADD CONSTRAINT "_AuthDelegation_A_fkey" FOREIGN KEY ("A") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthDelegation" ADD CONSTRAINT "_AuthDelegation_B_fkey" FOREIGN KEY ("B") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
