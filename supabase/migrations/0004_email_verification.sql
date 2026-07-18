-- FA-v1 / R4 — email verification on signup (FA-005 completeness).
-- Soft verification: signup issues a token + email; the account works before
-- verifying, but the flag lets us surface a "verify your email" state and gate
-- sensitive actions later. Tokens are hashed (raw token only in the link),
-- single-use, 24-hour expiry — same design as password_reset_tokens.

alter table users add column if not exists email_verified boolean not null default false;

create table if not exists email_verification_tokens (
  token_hash  text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_email_verification_user on email_verification_tokens(user_id);

alter table email_verification_tokens enable row level security;
-- No policies = only the service role key (server-side) can read/write.
