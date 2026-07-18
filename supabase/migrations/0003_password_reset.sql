-- FA-v1 / R2 remediation (v18.8.0)
-- FA-005: password reset flow (the /privacy page promises reset emails).
-- We store only the SHA-256 hash of the reset token — the raw token lives only
-- in the emailed link — so a DB leak cannot be used to reset accounts.

create table if not exists password_reset_tokens (
  token_hash  text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_password_reset_user on password_reset_tokens(user_id);

alter table password_reset_tokens enable row level security;
-- No policies = only the service role key (server-side) can read/write.
