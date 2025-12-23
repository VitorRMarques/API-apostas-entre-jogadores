-- CreateTable
CREATE TABLE `jogadores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(40) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `saldo` DECIMAL(9, 2) NOT NULL,
    `mensagem` VARCHAR(50) NULL,

    UNIQUE INDEX `jogadores_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jogos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(40) NOT NULL,
    `apostaMinima` DECIMAL(9, 2) NOT NULL,
    `apostaMaxima` DECIMAL(9, 2) NOT NULL,

    UNIQUE INDEX `jogos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apostas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jogadoresId` INTEGER NOT NULL,
    `jogosId` INTEGER NOT NULL,
    `valor` DECIMAL(9, 2) NOT NULL,
    `data` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ativa',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Disputas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jogoId` INTEGER NOT NULL,
    `somaApostas` DECIMAL(9, 2) NOT NULL,
    `jogador1id` INTEGER NOT NULL,
    `jogador2id` INTEGER NOT NULL,
    `tipoJogo` ENUM('Roleta', 'Blackjack', 'Poker', 'Slots') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apostas` ADD CONSTRAINT `apostas_jogadoresId_fkey` FOREIGN KEY (`jogadoresId`) REFERENCES `jogadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apostas` ADD CONSTRAINT `apostas_jogosId_fkey` FOREIGN KEY (`jogosId`) REFERENCES `jogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disputas` ADD CONSTRAINT `Disputas_jogoId_fkey` FOREIGN KEY (`jogoId`) REFERENCES `jogos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disputas` ADD CONSTRAINT `Disputas_jogador1id_fkey` FOREIGN KEY (`jogador1id`) REFERENCES `jogadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Disputas` ADD CONSTRAINT `Disputas_jogador2id_fkey` FOREIGN KEY (`jogador2id`) REFERENCES `jogadores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
