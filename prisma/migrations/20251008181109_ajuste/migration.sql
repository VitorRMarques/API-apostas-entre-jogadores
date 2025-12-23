/*
  Warnings:

  - You are about to drop the column `jogadoreId` on the `apostas` table. All the data in the column will be lost.
  - Added the required column `jogadorId` to the `apostas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `apostas` DROP FOREIGN KEY `apostas_jogadoreId_fkey`;

-- DropIndex
DROP INDEX `apostas_jogadoreId_fkey` ON `apostas`;

-- AlterTable
ALTER TABLE `apostas` DROP COLUMN `jogadoreId`,
    ADD COLUMN `jogadorId` INTEGER NOT NULL,
    MODIFY `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE `apostas` ADD CONSTRAINT `apostas_jogadorId_fkey` FOREIGN KEY (`jogadorId`) REFERENCES `jogadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
