-- Adds RBAC role support to existing users table.
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Backfill safety for existing rows.
UPDATE users
SET role = 'user'
WHERE role IS NULL OR TRIM(role) = '';
