-- Nova Editor — initial database schema (PRD §7)
-- Run against the Supabase project before deploying the app.
-- Supabase stores ONLY billing/user metadata. Project content lives in GitHub + browser.

create extension if not exists "pgcrypto";

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists users (
  id                        uuid primary key default gen_random_uuid(),
  github_id                 text unique not null,
  github_login              text not null,
  github_email              text,
  github_access_token_enc   text,          -- AES-256 encrypted, background jobs only
  github_account_created_at timestamptz,   -- anti-abuse age check (§12)
  tier                      text not null default 'free'
                              check (tier in ('free', 'pro')),
  credits_remaining         integer not null default 20
                              check (credits_remaining >= 0),
  credits_reset_at          timestamptz not null default (now() + interval '1 month'),
  lemonsqueezy_customer_id  text,
  lemonsqueezy_sub_id       text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table if not exists projects (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  repo_owner        text not null,
  repo_name         text not null,
  repo_full_name    text not null,
  default_branch    text not null default 'main',
  vercel_token_enc  text,
  vercel_project_id text,
  created_at        timestamptz not null default now(),
  unique(user_id, repo_full_name)
);

create table if not exists credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  project_id  uuid references projects(id) on delete set null,
  delta       integer not null,
  reason      text not null
                check (reason in (
                  'monthly_reset',
                  'initial_grant',
                  'topup_purchase',
                  'ai_operation',
                  'refund_on_error'
                )),
  created_at  timestamptz not null default now()
);

create index if not exists idx_users_github_id            on users(github_id);
create index if not exists idx_projects_user_id           on projects(user_id);
create index if not exists idx_credit_transactions_user   on credit_transactions(user_id);
-- Supports the per-minute rate-limit query in /api/ai (reason + created_at).
create index if not exists idx_credit_tx_user_reason_time on credit_transactions(user_id, reason, created_at);

-- ── Row-Level Security (defense-in-depth; all access is via service role) ─────

alter table users               enable row level security;
alter table projects            enable row level security;
alter table credit_transactions enable row level security;
-- No policies = only the service role key (server-side) can read/write.

-- ── deduct_credit RPC ─────────────────────────────────────────────────────────
-- Atomically decrements one credit and writes the audit row. Called by /api/ai
-- ONLY after the AI patch validates (ADR-006). The 'ai_operation' transaction
-- it writes is ALSO what the per-minute rate limiter counts — keep that reason.

create or replace function deduct_credit(p_user_id uuid, p_project_id uuid)
returns integer
language plpgsql
as $$
declare
  v_remaining integer;
begin
  update users
    set credits_remaining = credits_remaining - 1,
        updated_at = now()
    where id = p_user_id
      and credits_remaining > 0
    returning credits_remaining into v_remaining;

  if v_remaining is null then
    raise exception 'insufficient_credits';
  end if;

  insert into credit_transactions (user_id, project_id, delta, reason)
    values (p_user_id, p_project_id, -1, 'ai_operation');

  return v_remaining;
end;
$$;

-- ── reset_monthly_credits RPC (Phase 5 cron) ─────────────────────────────────
-- Refills credits for users whose reset window has elapsed. Free → 20, Pro → 500.
-- Idempotent: only touches rows past credits_reset_at and advances the window.

create or replace function reset_monthly_credits()
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  with refreshed as (
    update users
      set credits_remaining = case when tier = 'pro' then 500 else 20 end,
          credits_reset_at = now() + interval '1 month',
          updated_at = now()
      where credits_reset_at <= now()
      returning id, tier
  ),
  logged as (
    insert into credit_transactions (user_id, delta, reason)
      select id, case when tier = 'pro' then 500 else 20 end, 'monthly_reset'
      from refreshed
      returning 1
  )
  select count(*) into v_count from logged;

  return v_count;
end;
$$;
