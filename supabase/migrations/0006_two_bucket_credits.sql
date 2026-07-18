-- 0006_two_bucket_credits.sql  (v4.1.0 — hybrid credit model, ADR-038)
-- Splits AI credits into TWO buckets so the prepaid top-up model works honestly:
--   • credits_remaining        = MONTHLY allowance bucket. Reset every cycle by
--                                reset_monthly_credits(). Subject to the per-tier
--                                daily soft-cap (enforced in /api/ai, Figma-style).
--   • topup_credits_remaining  = PREPAID bucket. Bought à la carte (webhook), NEVER
--                                reset, expires after 1 year, and BYPASSES the daily
--                                cap (v0-style). Spent only after the monthly bucket.
-- Numbers are owned by doc/pricing-policy.md (§3 tiers, §4 top-ups, §3a daily caps).

-- ── New columns ───────────────────────────────────────────────────────────────
alter table users
  add column if not exists topup_credits_remaining integer not null default 0
    check (topup_credits_remaining >= 0);
alter table users
  add column if not exists topup_expires_at timestamptz;

-- Record which bucket an ai_operation drew from, so the daily-cap query can count
-- ONLY monthly-bucket spend (top-up spend must not count against the daily cap).
alter table credit_transactions
  add column if not exists from_topup boolean not null default false;

-- Daily-cap lookup: monthly-bucket ai_operation rows since the start of the UTC day.
create index if not exists idx_credit_tx_daily_cap
  on credit_transactions(user_id, reason, from_topup, created_at);

-- ── deduct_credit: spend a chosen bucket atomically ───────────────────────────
-- p_from_topup selects the bucket (the app decides based on daily-cap + balances).
-- Returns the COMBINED remaining (monthly + top-up). Expires stale top-ups first.
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
  -- Lazily expire a lapsed prepaid balance (1-year TTL) before spending.
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

-- ── reset_monthly_credits: refill ONLY the monthly bucket ─────────────────────
-- The prepaid bucket is intentionally untouched (it never resets). Also zeroes any
-- top-up balance that has passed its expiry, in the same pass.
create or replace function reset_monthly_credits()
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  -- Expire lapsed prepaid balances regardless of monthly window.
  update users
    set topup_credits_remaining = 0, topup_expires_at = null, updated_at = now()
    where topup_expires_at is not null and topup_expires_at <= now();

  with refreshed as (
    update users
      set credits_remaining = case tier
            when 'pro'  then 4000
            when 'max'  then 15000
            when 'team' then 5000
            else 200                -- free
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
