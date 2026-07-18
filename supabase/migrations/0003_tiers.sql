-- Nova Editor — migration 0003: extensible subscription tiers
-- Widens the users.tier CHECK constraint from ('free','pro') to include the
-- forward-looking 'max' and 'team' tiers. Entitlements per tier live in
-- application code (apps/studio/src/lib/tiers.ts) — this constraint only
-- guards the column against typos / unknown values.
--
-- Idempotent: safe to re-run.

alter table users
  drop constraint if exists users_tier_check;

alter table users
  add constraint users_tier_check
  check (tier in ('free', 'pro', 'max', 'team'));
