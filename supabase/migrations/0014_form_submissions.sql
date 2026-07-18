CREATE TABLE IF NOT EXISTS form_submissions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  form_name   text NOT NULL DEFAULT 'default',
  fields      jsonb NOT NULL DEFAULT '{}',
  ip          text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS form_submissions_project_id_idx ON form_submissions(project_id);
CREATE INDEX IF NOT EXISTS form_submissions_created_at_idx ON form_submissions(created_at);
