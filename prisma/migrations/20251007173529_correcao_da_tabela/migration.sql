/*
  Warnings:

  - You are about to drop the column `nome` on the `jogos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome]` on the table `jogadores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `jogos_nome_key` ON `jogos`;

-- AlterTable
ALTER TABLE `apostas` MODIFY `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `jogos` DROP COLUMN `nome`;

-- CreateIndex
CREATE UNIQUE INDEX `jogadores_nome_key` ON `jogadores`(`nome`);
