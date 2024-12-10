-- Add scopes field to api_keys table
ALTER TABLE `api_keys`
ADD COLUMN `scopes` TEXT NULL;
