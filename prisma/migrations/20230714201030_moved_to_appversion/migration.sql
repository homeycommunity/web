/*
  Warnings:

  - You are about to drop the column `file` on the `apps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `app_versions` ADD COLUMN `file` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `apps` DROP COLUMN `file`;
