-- Nova Editor — AI messages + credit cost refactor
-- Run AFTER 0001_init.sql.

-- ── ai_messages table ─────────────────────────────────────────────────────────
-- Stores per-project conversation history for the AI chat panel.
-- project_id may be null when user has no project selected yet.

create table if not exists ai_messages (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects(id) on delete cascade,
  user_id      uuid not null references users(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  provider     text,           -- provider id used (assistant messages only)
  credits_used integer,        -- credits deducted for this operation (0 for free providers)
  created_at   timestamptz not null default now()
);

create index if not exists idx_ai_messages_project on ai_messages(project_id, created_at);
create index if not exists idx_ai_messages_user    on ai_messages(user_id, created_at);

alter table ai_messages enable row level security;
-- No policies — service role only (same as all other tables).

-- ── Update deduct_credit to accept variable credit amounts ───────────────────
-- Previously hardcoded to -1. Now accepts p_credits so different providers
-- deduct proportionally (see PROVIDER_CREDIT_COST in packages/ai/src/providers/base.ts).

create or replace function deduct_credit(
  p_user_id   uuid,
  p_project_id uuid,
  p_credits   integer default 1
)
returns integer
language plpgsql
as $$
declare
  v_remaining integer;
begin
  -- Deduct p_credits (not always 1 anymore)
  update users
    set credits_remaining = credits_remaining - p_credits,
        updated_at = now()
    where id = p_user_id
      and credits_remaining >= p_credits
    returning credits_remaining into v_remaining;

  if v_remaining is null then
    raise exception 'insufficient_credits';
  end if;

  insert into credit_transactions (user_id, project_id, delta, reason)
    values (p_user_id, p_project_id, -p_credits, 'ai_operation');

  return v_remaining;
end;
$$;

-- ── Update monthly credit amounts ─────────────────────────────────────────────
-- 1 credit = $0.002 USD (see PROVIDER_CREDIT_COST in packages/ai/src/providers/base.ts)
--
-- Free:  100 credits/month ($0.20 operator budget)
--   → 8 Anthropic ops  OR  12 OpenAI ops  OR  16 Google ops  OR  100 Groq ops
--   Enough to genuinely evaluate the product.
--
-- Pro:   2,000 credits/month ($4.00 operator budget at 100% Anthropic usage)
--   → ~167 Anthropic ops/month  (healthy margin at $15/month Pro price)
--
-- Max tier (future): 10,000 credits/month ($20 operator budget)
--   → ~833 Anthropic ops/month  (healthy margin at $50/month Max price)
--   Not yet implemented in DB tier enum — see doc/pricing-policy.md §3.

create or replace function reset_monthly_credits()
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  with refreshed as (
    update users
      set credits_remaining = case when tier = 'pro' then 2000 else 100 end,
          credits_reset_at = now() + interval '1 month',
          updated_at = now()
      where credits_reset_at <= now()
      returning id, tier
  ),
  logged as (
    insert into credit_transactions (user_id, delta, reason)
      select id, case when tier = 'pro' then 2000 else 100 end, 'monthly_reset'
      from refreshed
      returning 1
  )
  select count(*) into v_count from logged;

  return v_count;
end;
$$;

-- Backfill: bring existing users to new amounts.
update users set credits_remaining = 100  where tier = 'free' and credits_remaining <= 50;
update users set credits_remaining = 2000 where tier = 'pro'  and credits_remaining <= 500;
