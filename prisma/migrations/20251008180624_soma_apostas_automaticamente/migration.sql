/*
  Warnings:

  - You are about to drop the column `jogadoresId` on the `apostas` table. All the data in the column will be lost.
  - You are about to drop the column `jogosId` on the `apostas` table. All the data in the column will be lost.
  - Added the required column `jogadoreId` to the `apostas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jogoId` to the `apostas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `apostas` DROP FOREIGN KEY `apostas_jogadoresId_fkey`;

-- DropForeignKey
ALTER TABLE `apostas` DROP FOREIGN KEY `apostas_jogosId_fkey`;

-- DropIndex
DROP INDEX `apostas_jogadoresId_fkey` ON `apostas`;

-- DropIndex
DROP INDEX `apostas_jogosId_fkey` ON `apostas`;

-- AlterTable
ALTER TABLE `apostas` DROP COLUMN `jogadoresId`,
    DROP COLUMN `jogosId`,
    ADD COLUMN `jogadoreId` INTEGER NOT NULL,
    ADD COLUMN `jogoId` INTEGER NOT NULL,
    MODIFY `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE `apostas` ADD CONSTRAINT `apostas_jogadoreId_fkey` FOREIGN KEY (`jogadoreId`) REFERENCES `jogadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apostas` ADD CONSTRAINT `apostas_jogoId_fkey` FOREIGN KEY (`jogoId`) REFERENCES `jogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
