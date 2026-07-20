-- ============================================================
-- Nova Editor — Asset Folders migration
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- 1. Folder table (self-referential for nested folders)
CREATE TABLE IF NOT EXISTS asset_folders (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  project_id TEXT NOT NULL,
  parent_id  TEXT REFERENCES asset_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for per-project queries
CREATE INDEX IF NOT EXISTS idx_asset_folders_project
  ON asset_folders(project_id);

-- 3. RLS — enable row-level security (recommended)
ALTER TABLE asset_folders ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically.
-- If you want user-level access too, add a policy:
-- CREATE POLICY "project members can read folders"
--   ON asset_folders FOR SELECT USING (true);

-- ============================================================
-- Verification
-- ============================================================
-- SELECT * FROM asset_folders LIMIT 10;
