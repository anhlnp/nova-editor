-- FA-v1 / R1 remediation (v18.7.0)
-- FA-003: PayOS credit top-up idempotency.
-- The webhook inserts one row per payment keyed by the provider's orderCode
-- BEFORE granting credits. A replayed webhook collides on the unique key and
-- the grant is skipped, so credits are granted at most once per payment.

create table if not exists processed_payments (
  order_code  text primary key,
  provider    text not null,
  kind        text not null,          -- 'credits' | 'plan'
  user_id     uuid,
  created_at  timestamptz not null default now()
);

alter table processed_payments enable row level security;
-- No policies = only the service role key (server-side) can read/write.
