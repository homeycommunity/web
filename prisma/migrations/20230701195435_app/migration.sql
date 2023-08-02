-- CreateTable
CREATE TABLE `apps` (
    `id` VARCHAR(191) NOT NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `identifier` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `apps_identifier_key`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_versions` (
    `id` VARCHAR(191) NOT NULL,
    `app_id` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `experimental` BOOLEAN NOT NULL,
    `changelog` VARCHAR(191) NULL,
    `approved` BOOLEAN NOT NULL,
    `available` BOOLEAN NOT NULL,
    `published_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `app_versions_app_id_version_key`(`app_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apps` ADD CONSTRAINT `apps_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `app_versions` ADD CONSTRAINT `app_versions_app_id_fkey` FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
