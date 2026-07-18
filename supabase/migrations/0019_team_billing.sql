-- P69 — Per-seat team billing
ALTER TABLE teams ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';       -- free | team | business
ALTER TABLE teams ADD COLUMN IF NOT EXISTS seats integer NOT NULL DEFAULT 1;         -- purchased seats
ALTER TABLE teams ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';     -- monthly | annual
