-- Tier P M2 (ADR-NB-019 p2): optimistic concurrency for project saves.
-- Every successful data write (patch or full) bumps version; a writer whose
-- baseVersion is stale gets 409 instead of silently clobbering (WSA audit #7).
ALTER TABLE projects ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 0;
