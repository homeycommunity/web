/*
  Warnings:

  - A unique constraint covering the columns `[homey_id,user_id]` on the table `homey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `homey_id` to the `homey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `homey` ADD COLUMN `homey_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `homey_homey_id_user_id_key` ON `homey`(`homey_id`, `user_id`);
