/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "updatedAt",
ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
