-- ============================================================
-- Nova Builder — COMBINED SCHEMA (all migrations in order)
-- Run this once against a fresh Supabase project OR an existing/old database.
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards and idempotent ALTER TABLE remediations throughout.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ============================================================
-- 0001_init.sql — initial schema
-- ============================================================

create table if not exists users (
  id                        uuid primary key default gen_random_uuid(),
  github_id                 text unique,          -- nullable after 0007
  github_login              text,                 -- nullable after 0007
  github_email              text,
  github_access_token_enc   text,
  github_account_created_at timestamptz,
  tier                      text not null default 'free',
  credits_remaining         integer not null default 200   -- updated by 0004
                              check (credits_remaining >= 0),
  credits_reset_at          timestamptz not null default (now() + interval '1 month'),
  lemonsqueezy_customer_id  text,
  lemonsqueezy_sub_id       text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  -- 0006
  topup_credits_remaining   integer not null default 0 check (topup_credits_remaining >= 0),
  topup_expires_at          timestamptz,
  -- 0007
  email                     text,
  provider                  text not null default 'github'
                              check (provider in ('github', 'google', 'email')),
  display_name              text,
  -- 0008
  password_hash             text,
  -- 0012
  branding_logo             text,
  branding_name             text,
  -- 0015
  notification_prefs        jsonb default '{}',
  -- 0016
  role                      text not null default 'user',
  -- 0004_email_verification
  email_verified            boolean not null default false
);

-- Remediation for old / existing databases: ensure all columns and alterations from migrations 0004–0016 exist
alter table users alter column github_id drop not null;
alter table users alter column github_login drop not null;
alter table users alter column credits_remaining set default 200;
alter table users add column if not exists topup_credits_remaining integer not null default 0 check (topup_credits_remaining >= 0);
alter table users add column if not exists topup_expires_at timestamptz;
alter table users add column if not exists email text;
alter table users add column if not exists provider text not null default 'github';
alter table users drop constraint if exists users_provider_check;
alter table users add constraint users_provider_check check (provider in ('github', 'google', 'email'));
alter table users add column if not exists display_name text;
alter table users add column if not exists password_hash text;
alter table users add column if not exists branding_logo text;
alter table users add column if not exists branding_name text;
alter table users add column if not exists notification_prefs jsonb default '{}';
alter table users add column if not exists role text not null default 'user';
alter table users add column if not exists email_verified boolean not null default false;

-- 0003_tiers — tier constraint
alter table users
  drop constraint if exists users_tier_check;
alter table users
  add constraint users_tier_check
  check (tier in ('free', 'pro', 'max', 'team'));

create index if not exists idx_users_github_id    on users(github_id);
create index if not exists users_role_idx         on users(role);

-- 0007 — unique (provider, email) for non-GitHub users
create unique index if not exists idx_users_provider_email
  on users(provider, email) where github_id is null;

create table if not exists projects (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  repo_owner        text,           -- optional after 0007
  repo_name         text,           -- optional after 0007
  repo_full_name    text,           -- optional after 0007
  default_branch    text,           -- optional after 0007
  vercel_token_enc  text,
  vercel_project_id text,
  created_at        timestamptz not null default now(),
  -- 0007
  schema_json       jsonb,
  project_name      text,
  cf_deploy_url     text,
  git_url           text,
  git_subdir        text,
  git_provider      text check (git_provider in ('github', 'gitlab')),
  updated_at        timestamptz not null default now(),
  -- 0018
  team_id           uuid,           -- FK added below after teams table
  -- 0020
  version           integer not null default 0
);

-- Remediation for old / existing databases: ensure all columns and alterations from migrations 0007–0020 exist
alter table projects alter column repo_owner drop not null;
alter table projects alter column repo_name drop not null;
alter table projects alter column repo_full_name drop not null;
alter table projects alter column default_branch drop not null;
alter table projects add column if not exists schema_json jsonb;
alter table projects add column if not exists project_name text;
alter table projects add column if not exists cf_deploy_url text;
alter table projects add column if not exists git_url text;
alter table projects add column if not exists git_subdir text;
alter table projects add column if not exists git_provider text;
alter table projects drop constraint if exists projects_git_provider_check;
alter table projects add constraint projects_git_provider_check check (git_provider in ('github', 'gitlab'));
alter table projects add column if not exists updated_at timestamptz not null default now();
alter table projects add column if not exists team_id uuid;
alter table projects add column if not exists version integer not null default 0;

-- 0009 — schema_version generated column
alter table projects
  drop constraint if exists projects_schema_json_has_version;
alter table projects
  add constraint projects_schema_json_has_version
    check (schema_json is null or schema_json ? 'schemaVersion');

-- Generated columns must be added via ALTER (can't inline in CREATE TABLE with the constraint above)
-- They require schema_json to already exist.
alter table projects
  add column if not exists schema_version text
    generated always as (schema_json ->> 'schemaVersion') stored;

alter table projects
  add column if not exists has_webstudio_data boolean
    generated always as (schema_json ->> 'schemaVersion' = '5.0') stored;

create index if not exists idx_projects_user_id        on projects(user_id);
create index if not exists idx_projects_user_updated   on projects(user_id, updated_at desc);
create index if not exists idx_projects_schema_version on projects(schema_version) where schema_version is not null;

create table if not exists credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  project_id  uuid references projects(id) on delete set null,
  delta       integer not null,
  reason      text not null,
  -- 0006
  from_topup  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Remediation for old / existing databases: ensure from_topup column exists
alter table credit_transactions add column if not exists from_topup boolean not null default false;

-- 0005 — widen reason check
alter table credit_transactions drop constraint if exists credit_transactions_reason_check;
alter table credit_transactions add constraint credit_transactions_reason_check
  check (reason in (
    'monthly_reset',
    'initial_grant',
    'topup_purchase',
    'ai_operation',
    'refund_on_error',
    'ai_request'
  ));

create index if not exists idx_credit_transactions_user   on credit_transactions(user_id);
create index if not exists idx_credit_tx_user_reason_time on credit_transactions(user_id, reason, created_at);
create index if not exists idx_credit_tx_daily_cap        on credit_transactions(user_id, reason, from_topup, created_at);

-- ── Row-Level Security ────────────────────────────────────────────────────────
alter table users               enable row level security;
alter table projects            enable row level security;
alter table credit_transactions enable row level security;

-- Drop legacy function overloads from earlier migrations (0001_init and 0002_ai_messages)
-- so they do not conflict with or shadow the final 4-param signature on old databases.
drop function if exists deduct_credit(uuid, uuid);
drop function if exists deduct_credit(uuid, uuid, integer);

-- ── deduct_credit RPC (final version from 0006) ───────────────────────────────
create or replace function deduct_credit(
  p_user_id    uuid,
  p_project_id uuid,
  p_credits    integer default 1,
  p_from_topup boolean default false
)
returns integer
language plpgsql
as $$
declare
  v_monthly integer;
  v_topup   integer;
begin
  update users
    set topup_credits_remaining = 0, topup_expires_at = null, updated_at = now()
    where id = p_user_id
      and topup_expires_at is not null
      and topup_expires_at <= now();

  if p_from_topup then
    update users
      set topup_credits_remaining = topup_credits_remaining - p_credits,
          updated_at = now()
      where id = p_user_id and topup_credits_remaining >= p_credits
      returning credits_remaining, topup_credits_remaining into v_monthly, v_topup;
  else
    update users
      set credits_remaining = credits_remaining - p_credits,
          updated_at = now()
      where id = p_user_id and credits_remaining >= p_credits
      returning credits_remaining, topup_credits_remaining into v_monthly, v_topup;
  end if;

  if v_monthly is null then
    raise exception 'insufficient_credits';
  end if;

  insert into credit_transactions (user_id, project_id, delta, reason, from_topup)
    values (p_user_id, p_project_id, -p_credits, 'ai_operation', p_from_topup);

  return v_monthly + v_topup;
end;
$$;

-- ── reset_monthly_credits RPC (final version from 0006) ───────────────────────
create or replace function reset_monthly_credits()
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  update users
    set topup_credits_remaining = 0, topup_expires_at = null, updated_at = now()
    where topup_expires_at is not null and topup_expires_at <= now();

  with refreshed as (
    update users
      set credits_remaining = case tier
            when 'pro'  then 4000
            when 'max'  then 15000
            when 'team' then 5000
            else 200
          end,
          credits_reset_at = now() + interval '1 month',
          updated_at = now()
      where credits_reset_at <= now()
      returning id, tier
  ),
  logged as (
    insert into credit_transactions (user_id, delta, reason)
      select id,
             case tier
               when 'pro'  then 4000
               when 'max'  then 15000
               when 'team' then 5000
               else 200
             end,
             'monthly_reset'
      from refreshed
      returning 1
  )
  select count(*) into v_count from logged;

  return v_count;
end;
$$;

-- ============================================================
-- 0002_ai_messages.sql
-- ============================================================

create table if not exists ai_messages (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid references projects(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  provider        text,
  credits_used    integer,
  -- 0003_ai_conversations
  conversation_id uuid,   -- FK added below after ai_conversations table
  created_at      timestamptz not null default now()
);

create index if not exists idx_ai_messages_project on ai_messages(project_id, created_at);
create index if not exists idx_ai_messages_user    on ai_messages(user_id, created_at);

alter table ai_messages enable row level security;

-- ============================================================
-- 0003_ai_conversations.sql
-- ============================================================

create table if not exists ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  title       text not null default 'New conversation',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_ai_conv_project
  on ai_conversations(project_id, user_id, updated_at desc);

alter table ai_conversations enable row level security;

-- Now add the FK from ai_messages to ai_conversations
alter table ai_messages
  add column if not exists conversation_id uuid references ai_conversations(id) on delete cascade;
alter table ai_messages
  drop constraint if exists ai_messages_conversation_id_fkey;
alter table ai_messages
  add constraint ai_messages_conversation_id_fkey foreign key (conversation_id) references ai_conversations(id) on delete cascade;

create index if not exists idx_ai_messages_conv
  on ai_messages(conversation_id, created_at);

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

-- ============================================================
-- 0010_snapshots.sql
-- ============================================================

create table if not exists project_snapshots (
  id          uuid default gen_random_uuid() primary key,
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id),
  label       text,
  schema_json jsonb not null,
  created_at  timestamptz default now()
);

create index if not exists project_snapshots_project_id_created_at
  on project_snapshots (project_id, created_at desc);

create table if not exists project_comments (
  id          uuid default gen_random_uuid() primary key,
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id),
  instance_id text,
  body        text not null,
  resolved    boolean default false,
  parent_id   uuid references project_comments(id) on delete cascade,
  created_at  timestamptz default now()
);

create index if not exists project_comments_project_id_created_at
  on project_comments (project_id, created_at desc);

create table if not exists project_activity (
  id          uuid default gen_random_uuid() primary key,
  project_id  uuid not null references projects(id) on delete cascade,
  user_id     uuid not null references users(id),
  action      text not null,
  meta        jsonb,
  created_at  timestamptz default now()
);

create index if not exists project_activity_project_id_created_at
  on project_activity (project_id, created_at desc);

-- ============================================================
-- 0011_api_keys.sql
-- ============================================================

create table if not exists api_keys (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid not null references users(id) on delete cascade,
  name         text not null,
  key_prefix   text not null,
  key_hash     text not null,
  created_at   timestamptz default now(),
  last_used_at timestamptz
);

create index if not exists api_keys_user_id_idx on api_keys(user_id);

create table if not exists project_webhooks (
  id         uuid default gen_random_uuid() primary key,
  project_id uuid not null references projects(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  url        text not null,
  events     text[] not null default array['deploy', 'save'],
  active     boolean default true,
  created_at timestamptz default now()
);

create index if not exists project_webhooks_project_id_idx on project_webhooks(project_id);

-- ============================================================
-- 0013_analytics.sql
-- ============================================================

create table if not exists page_views (
  id          uuid default gen_random_uuid() primary key,
  project_id  uuid not null references projects(id) on delete cascade,
  path        text not null default '/',
  referrer    text,
  device_type text not null default 'desktop',
  country     text,
  created_at  timestamptz default now()
);

create index if not exists page_views_project_id_idx on page_views(project_id);
create index if not exists page_views_created_at_idx on page_views(created_at);

-- ============================================================
-- 0014_form_submissions.sql
-- ============================================================

create table if not exists form_submissions (
  id          uuid default gen_random_uuid() primary key,
  project_id  uuid not null references projects(id) on delete cascade,
  form_name   text not null default 'default',
  fields      jsonb not null default '{}',
  ip          text,
  created_at  timestamptz default now()
);

create index if not exists form_submissions_project_id_idx on form_submissions(project_id);
create index if not exists form_submissions_created_at_idx on form_submissions(created_at);

-- ============================================================
-- 0016_admin.sql — feature flags
-- ============================================================

create table if not exists feature_flags (
  id          uuid default gen_random_uuid() primary key,
  key         text not null unique,
  description text not null default '',
  enabled     boolean not null default false,
  user_ids    text[] not null default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- 0017_custom_domains.sql
-- ============================================================

create table if not exists project_domains (
  id           uuid default gen_random_uuid() primary key,
  project_id   uuid not null references projects(id) on delete cascade,
  user_id      uuid not null references users(id),
  domain       text not null unique,
  verify_token text not null,
  status       text not null default 'pending',
  ssl_status   text not null default 'none',
  created_at   timestamptz default now(),
  verified_at  timestamptz
);

create index if not exists project_domains_project_id_idx on project_domains(project_id);

-- ============================================================
-- 0018_teams.sql
-- ============================================================

create table if not exists teams (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  owner_id    uuid not null references users(id),
  -- 0019
  plan        text not null default 'free',
  seats       integer not null default 1,
  stripe_customer_id     text,
  stripe_subscription_id text,
  billing_cycle          text default 'monthly',
  created_at  timestamptz default now()
);

-- Remediation for old / existing databases that ran 0018 before 0019
alter table teams add column if not exists plan text not null default 'free';
alter table teams add column if not exists seats integer not null default 1;
alter table teams add column if not exists stripe_customer_id text;
alter table teams add column if not exists stripe_subscription_id text;
alter table teams add column if not exists billing_cycle text default 'monthly';

create table if not exists team_members (
  id         uuid default gen_random_uuid() primary key,
  team_id    uuid not null references teams(id) on delete cascade,
  user_id    uuid references users(id),
  email      text not null,
  role       text not null default 'member',
  status     text not null default 'invited',
  invited_at timestamptz default now(),
  unique (team_id, email)
);

create index if not exists team_members_team_id_idx on team_members(team_id);
create index if not exists team_members_user_id_idx on team_members(user_id);

-- Now add FK from projects to teams (deferred because teams didn't exist yet)
alter table projects
  add column if not exists team_id uuid references teams(id) on delete set null;
alter table projects
  drop constraint if exists projects_team_id_fkey;
alter table projects
  add constraint projects_team_id_fkey foreign key (team_id) references teams(id) on delete set null;

-- ============================================================
-- 0002_fa_v1_remediation.sql — idempotency for payments
-- ============================================================

create table if not exists processed_payments (
  order_code  text primary key,
  provider    text not null,
  kind        text not null,
  user_id     uuid,
  created_at  timestamptz not null default now()
);

alter table processed_payments enable row level security;

-- ============================================================
-- 0003_password_reset.sql
-- ============================================================

create table if not exists password_reset_tokens (
  token_hash  text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_password_reset_user on password_reset_tokens(user_id);

alter table password_reset_tokens enable row level security;

-- ============================================================
-- 0004_email_verification.sql
-- ============================================================

-- users.email_verified already added in the CREATE TABLE above.

create table if not exists email_verification_tokens (
  token_hash  text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_email_verification_user on email_verification_tokens(user_id);

alter table email_verification_tokens enable row level security;

-- ============================================================
-- 0021_marketplace.sql
-- ============================================================

create table if not exists marketplace_items (
  id            uuid default gen_random_uuid() primary key,
  author_id     uuid not null references users(id) on delete cascade,
  name          text not null,
  description   text not null default '',
  icon          text not null default '📦',
  category      text not null default 'section',
  bundle        jsonb not null,
  install_count integer not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists marketplace_items_author_id_idx  on marketplace_items(author_id);
create index if not exists marketplace_items_category_idx   on marketplace_items(category);
create index if not exists marketplace_items_created_at_idx on marketplace_items(created_at desc);

-- ============================================================
-- END OF COMBINED SCHEMA
-- ============================================================
