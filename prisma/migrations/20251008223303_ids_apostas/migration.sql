/*
  Warnings:

  - You are about to drop the column `apostaId` on the `disputas` table. All the data in the column will be lost.
  - Added the required column `aposta1Id` to the `Disputas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aposta2id` to the `Disputas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `disputas` DROP FOREIGN KEY `Disputas_apostaId_fkey`;

-- DropIndex
DROP INDEX `Disputas_apostaId_fkey` ON `disputas`;

-- AlterTable
ALTER TABLE `apostas` MODIFY `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `disputas` DROP COLUMN `apostaId`,
    ADD COLUMN `aposta1Id` INTEGER NOT NULL,
    ADD COLUMN `aposta2id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Disputas` ADD CONSTRAINT `Disputas_aposta2id_fkey` FOREIGN KEY (`aposta2id`) REFERENCES `apostas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disputas` ADD CONSTRAINT `Disputas_aposta1Id_fkey` FOREIGN KEY (`aposta1Id`) REFERENCES `apostas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
