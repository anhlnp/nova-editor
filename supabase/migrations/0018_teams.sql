-- P54 — Team workspaces
CREATE TABLE IF NOT EXISTS teams (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  owner_id    uuid NOT NULL REFERENCES users(id),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id     uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id),
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'member',   -- owner | admin | member
  status      text NOT NULL DEFAULT 'invited',  -- invited | active
  invited_at  timestamptz DEFAULT now(),
  UNIQUE (team_id, email)
);
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);

-- Projects can belong to a team (nullable = personal project)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
