-- Admin role support
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key         text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  enabled     boolean NOT NULL DEFAULT false,
  user_ids    text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
