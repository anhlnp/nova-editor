-- P62: White-label branding per user (2026-07-08)

ALTER TABLE users ADD COLUMN IF NOT EXISTS branding_logo text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS branding_name text;
