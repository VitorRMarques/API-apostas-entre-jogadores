-- AlterTable
ALTER TABLE `apostas` MODIFY `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `jogadores` ADD COLUMN `usuarioId` INTEGER NULL;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jogadorId` INTEGER NULL,
    `email` VARCHAR(50) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_jogadorId_fkey` FOREIGN KEY (`jogadorId`) REFERENCES `jogadores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
