-- 0009_webstudio_schema.sql
-- Webstudio-based builder: schema_json now stores WebstudioData (schemaVersion "5.0").
-- The column itself is unchanged (JSONB, nullable) — only the application-level format
-- changes; existing "4.0" and older rows are migrated lazily by migrateToLatest() on read.
-- This migration only adds observability and guard columns; it does NOT rewrite any rows.

-- ── 1. schema_version: fast version inspection without parsing the full JSONB ──

-- Generated column extracts schemaVersion from schema_json so queries can filter
-- or ORDER BY version without a full JSONB scan.
-- NULL when schema_json is null (newly created project, not yet saved).
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS schema_version TEXT
    GENERATED ALWAYS AS (schema_json ->> 'schemaVersion') STORED;

-- Index allows efficient lookup of all legacy projects that still need migration.
-- Usage:  SELECT id FROM projects WHERE schema_version < '5.0'
-- (text sort: "1.0" < "2.0" < ... < "4.0" < "5.0" works for our versioning scheme)
CREATE INDEX IF NOT EXISTS idx_projects_schema_version
  ON projects(schema_version)
  WHERE schema_version IS NOT NULL;

-- ── 2. has_webstudio_data: quick boolean flag for monitoring / analytics ─────────

-- True once the project has been saved with WebstudioData (≥ one save post-migration).
-- Lets ops dashboards track migration progress without touching app code.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS has_webstudio_data BOOLEAN
    GENERATED ALWAYS AS (schema_json ->> 'schemaVersion' = '5.0') STORED;

-- ── 3. Constraints: asset_url and data quality ───────────────────────────────────

-- Prevent schema_json from being overwritten with obviously-wrong data.
-- Check: if schema_json is set, it must at minimum have a 'schemaVersion' key.
-- This catches bugs where a partial/null object is accidentally written.
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_schema_json_has_version;
ALTER TABLE projects
  ADD CONSTRAINT projects_schema_json_has_version
    CHECK (schema_json IS NULL OR schema_json ? 'schemaVersion');

-- ── 4. Notes ─────────────────────────────────────────────────────────────────────
-- • No row-level migration is performed here.
-- • Old projects (schemaVersion "1.0"–"4.0") remain untouched in storage.
-- • When a project is opened, apps/nova-builder/src/lib/migrate.ts:migrateToLatest()
--   converts Element[] → WebstudioData in memory and the next PATCH /api/projects/:id
--   writes schemaVersion "5.0" back to schema_json.
-- • Rollback: the generated columns and index can be dropped safely; they carry no data.
