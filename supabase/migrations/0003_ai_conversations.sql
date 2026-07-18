-- Nova Editor — AI conversation threads
-- Run AFTER 0002_ai_messages.sql.

-- ── ai_conversations ──────────────────────────────────────────────────────────
-- Each row is one chat thread within a project.
-- A project can have many conversations; messages belong to a conversation.

create table if not exists ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  title       text not null default 'New conversation',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()   -- bumped on each new message
);

create index if not exists idx_ai_conv_project
  on ai_conversations(project_id, user_id, updated_at desc);

alter table ai_conversations enable row level security;

-- ── Link ai_messages to conversations ────────────────────────────────────────
-- ai_messages.project_id stays for fast project-level queries without a join.
-- ai_messages.conversation_id is the primary grouping key.

alter table ai_messages
  add column if not exists conversation_id uuid
    references ai_conversations(id) on delete cascade;

create index if not exists idx_ai_messages_conv
  on ai_messages(conversation_id, created_at);

-- ── Auto-bump conversation.updated_at on new message ─────────────────────────
create or replace function touch_ai_conversation()
returns trigger language plpgsql as $$
begin
  update ai_conversations
    set updated_at = now()
    where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists ai_messages_touch_conversation on ai_messages;
create trigger ai_messages_touch_conversation
  after insert on ai_messages
  for each row
  when (new.conversation_id is not null)
  execute function touch_ai_conversation();
