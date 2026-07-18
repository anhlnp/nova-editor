-- 0004_credit_allowances.sql
-- Aligns monthly credit allowances with doc/pricing-policy.md:
--   free 200 · pro 4000 · max 15000 · team 5000 (per-seat pooling TBD)
-- Supersedes the 0001 values (free 20 / pro 500) and covers the max/team tiers
-- added in 0003_tiers.sql (the old function's `else 20` mis-granted max/team).

-- New-user column default (initial grant logic also updated in supabase-server.ts).
alter table users alter column credits_remaining set default 200;

create or replace function reset_monthly_credits()
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  with refreshed as (
    update users
      set credits_remaining = case tier
            when 'pro'  then 4000
            when 'max'  then 15000
            when 'team' then 5000   -- baseline; seat-pooled total is computed at the app layer
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
