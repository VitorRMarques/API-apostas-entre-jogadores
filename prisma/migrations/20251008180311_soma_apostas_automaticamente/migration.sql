/*
  Warnings:

  - Added the required column `apostaId` to the `Disputas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `apostas` MODIFY `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `disputas` ADD COLUMN `apostaId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Disputas` ADD CONSTRAINT `Disputas_apostaId_fkey` FOREIGN KEY (`apostaId`) REFERENCES `apostas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
