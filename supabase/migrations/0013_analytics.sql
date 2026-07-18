-- P63: Lightweight page-view analytics (2026-07-10)

CREATE TABLE IF NOT EXISTS page_views (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path        text NOT NULL DEFAULT '/',
  referrer    text,
  device_type text NOT NULL DEFAULT 'desktop',  -- 'mobile' | 'tablet' | 'desktop'
  country     text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_project_id_idx ON page_views(project_id);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views(created_at);
