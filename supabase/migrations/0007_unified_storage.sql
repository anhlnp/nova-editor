-- 0007_unified_storage.sql
-- Unified project storage: Supabase as canonical store for all users.
-- GitHub sync becomes optional (not required for save/load/publish).
-- Auth model: email/Google/GitHub are equal first-class login methods.
-- GitHub is a connectable add-on for git sync features, not a gate.

-- ── 1. Users: support any identity provider ──────────────────────────────────

ALTER TABLE users ALTER COLUMN github_id        DROP NOT NULL;
ALTER TABLE users ALTER COLUMN github_login      DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider     TEXT NOT NULL DEFAULT 'github'
  CHECK (provider IN ('github', 'google', 'email'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Unique constraint for non-GitHub providers: (provider, email) must be unique.
-- Partial index: only applies when github_id is null (email/Google users).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_email
  ON users(provider, email) WHERE github_id IS NULL;

-- ── 2. Projects: canonical schema_json storage + optional GitHub sync ─────────

ALTER TABLE projects ADD COLUMN IF NOT EXISTS schema_json  JSONB;        -- canonical project.json
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_name TEXT;         -- display name
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cf_deploy_url TEXT;        -- last Cloudflare Pages URL
ALTER TABLE projects ADD COLUMN IF NOT EXISTS git_url      TEXT;         -- git URL import source
ALTER TABLE projects ADD COLUMN IF NOT EXISTS git_subdir   TEXT;         -- optional subdirectory
ALTER TABLE projects ADD COLUMN IF NOT EXISTS git_provider TEXT
  CHECK (git_provider IN ('github', 'gitlab'));

-- GitHub sync columns are now optional (existing rows keep their values).
-- Legacy rows: schema_json=null until first GET migrates them (lazy one-time migration).
ALTER TABLE projects ALTER COLUMN repo_owner     DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN repo_name      DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN repo_full_name DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN default_branch DROP NOT NULL;

-- Standard updated_at tracking for projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- A project with repo_full_name IS NOT NULL has GitHub sync enabled.
-- A project with repo_full_name IS NULL is cloud-only (no git sync).
-- Both are saved/read identically via schema_json.

-- ── 3. Index for fast project lookup ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user_updated
  ON projects(user_id, updated_at DESC);
