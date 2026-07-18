-- 0008_password_auth.sql
-- Adds password_hash column for email+password (credentials) sign-up/in.
-- NULL for OAuth users (GitHub, Google); set only for provider='email' users.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
