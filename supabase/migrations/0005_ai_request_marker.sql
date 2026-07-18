-- 0005_ai_request_marker.sql
-- C9.1 / C9.2 (v2.1.0): the per-minute AI rate limiter used to count the trailing
-- `ai_operation` credit rows, which (a) were written only AFTER the 10–30s op, so
-- concurrent bursts all saw 0 (a race that drained the AI budget), and (b) were
-- written only for METERED tiers, so unlimited tiers were never rate-limited.
--
-- The route now writes a zero-cost `ai_request` marker for EVERY tier BEFORE the
-- op and counts those instead. Widen the reason CHECK to permit the new value.
-- `ai_operation` is kept solely for credit accounting (deduct_credit RPC).

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
