/*
  Warnings:

  - You are about to drop the `HomeyToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Homeys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `HomeyToken` DROP FOREIGN KEY `HomeyToken_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Homeys` DROP FOREIGN KEY `Homeys_user_id_fkey`;

-- DropTable
DROP TABLE `HomeyToken`;

-- DropTable
DROP TABLE `Homeys`;

-- CreateTable
CREATE TABLE `homey_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `access_token` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `homey_tokens_user_id_key`(`user_id`),
    UNIQUE INDEX `homey_tokens_access_token_key`(`access_token`),
    UNIQUE INDEX `homey_tokens_refresh_token_key`(`refresh_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homey` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `homey_tokens` ADD CONSTRAINT `homey_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `homey` ADD CONSTRAINT `homey_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
