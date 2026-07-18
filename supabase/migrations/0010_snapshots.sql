-- P51: Version history — project snapshot table for 1-click rollback.

CREATE TABLE IF NOT EXISTS project_snapshots (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id),
  label       text,
  schema_json jsonb NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_snapshots_project_id_created_at
  ON project_snapshots (project_id, created_at DESC);

-- P52: Comments + annotations per project element.

CREATE TABLE IF NOT EXISTS project_comments (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id),
  instance_id text,
  body        text NOT NULL,
  resolved    boolean DEFAULT false,
  parent_id   uuid REFERENCES project_comments(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_comments_project_id_created_at
  ON project_comments (project_id, created_at DESC);

-- P53: Activity log per project.

CREATE TABLE IF NOT EXISTS project_activity (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id),
  action      text NOT NULL,
  meta        jsonb,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_activity_project_id_created_at
  ON project_activity (project_id, created_at DESC);
