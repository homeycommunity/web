-- AlterTable: Add timestamps to homey table
ALTER TABLE `homey`
ADD COLUMN `created_at` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
ADD COLUMN `updated_at` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable: Create homey_apps table
CREATE TABLE `homey_apps` (
  `id` VARCHAR(191) NOT NULL,
  `homey_id` VARCHAR(191) NOT NULL,
  `app_id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `version` VARCHAR(191) NOT NULL,
  `origin` VARCHAR(191) NOT NULL,
  `channel` VARCHAR(191) NULL,
  `auto_update` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME (3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `homey_apps_homey_id_app_id_key` (`homey_id`, `app_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `homey_apps` ADD CONSTRAINT `homey_apps_homey_id_fkey` FOREIGN KEY (`homey_id`) REFERENCES `homey` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate data from JSON to new table
INSERT INTO
  `homey_apps` (
    `id`,
    `homey_id`,
    `app_id`,
    `name`,
    `version`,
    `origin`,
    `channel`,
    `auto_update`
  )
SELECT
  UUID () as id,
  h.id as homey_id,
  JSON_UNQUOTE (JSON_EXTRACT (app, '$.id')) as app_id,
  JSON_UNQUOTE (JSON_EXTRACT (app, '$.name')) as name,
  JSON_UNQUOTE (JSON_EXTRACT (app, '$.version')) as version,
  JSON_UNQUOTE (JSON_EXTRACT (app, '$.origin')) as origin,
  JSON_UNQUOTE (JSON_EXTRACT (app, '$.channel')) as channel,
  COALESCE(JSON_EXTRACT (app, '$.autoupdate'), true) as auto_update
FROM
  `homey` h,
  JSON_TABLE (apps, '$[*]' COLUMNS (app JSON PATH '$')) AS apps
WHERE
  h.apps IS NOT NULL;

ALTER TABLE `homey`
DROP COLUMN `apps`;