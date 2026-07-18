-- M11 — Community marketplace: publishable content bundles.
-- A marketplace item is a NovaBundle (WebstudioFragment + meta) published by a user
-- so others can install it into their own projects.

CREATE TABLE IF NOT EXISTS marketplace_items (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text NOT NULL DEFAULT '',
  icon          text NOT NULL DEFAULT '📦',
  category      text NOT NULL DEFAULT 'section',   -- section | page | component | template
  bundle        jsonb NOT NULL,                    -- the NovaBundle payload
  install_count integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketplace_items_author_id_idx ON marketplace_items(author_id);
CREATE INDEX IF NOT EXISTS marketplace_items_category_idx  ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS marketplace_items_created_at_idx ON marketplace_items(created_at DESC);
