-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ResourceQuestion" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResourceQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResourceQuestion_resourceId_order_idx" ON "ResourceQuestion"("resourceId", "order");

-- AddForeignKey
ALTER TABLE "ResourceQuestion" ADD CONSTRAINT "ResourceQuestion_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
