-- P60: API keys + webhooks (2026-07-08)

CREATE TABLE IF NOT EXISTS api_keys (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  key_prefix  text NOT NULL,     -- first 8 chars of the key, shown in UI
  key_hash    text NOT NULL,     -- bcrypt hash of the full key
  created_at  timestamptz DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);

CREATE TABLE IF NOT EXISTS project_webhooks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url         text NOT NULL,
  events      text[] NOT NULL DEFAULT ARRAY['deploy', 'save'],
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_webhooks_project_id_idx ON project_webhooks(project_id);
