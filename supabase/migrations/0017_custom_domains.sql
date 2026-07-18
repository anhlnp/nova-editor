-- P41 — Custom domains
CREATE TABLE IF NOT EXISTS project_domains (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id),
  domain      text NOT NULL UNIQUE,
  verify_token text NOT NULL,
  status      text NOT NULL DEFAULT 'pending',  -- pending | verified | ssl_active | error
  ssl_status  text NOT NULL DEFAULT 'none',     -- none | provisioning | active
  created_at  timestamptz DEFAULT now(),
  verified_at timestamptz
);
CREATE INDEX IF NOT EXISTS project_domains_project_id_idx ON project_domains(project_id);
