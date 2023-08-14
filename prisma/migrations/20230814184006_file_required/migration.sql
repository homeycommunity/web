/*
  Warnings:

  - Made the column `file` on table `app_versions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `app_versions` MODIFY `file` VARCHAR(191) NOT NULL;
