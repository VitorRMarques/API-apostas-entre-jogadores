-- DropIndex
DROP INDEX `jogadores_email_key` ON `jogadores`;

-- DropIndex
DROP INDEX `jogadores_nome_key` ON `jogadores`;

-- AlterTable
ALTER TABLE `apostas` MODIFY `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;
