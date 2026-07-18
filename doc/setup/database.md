# Database Setup (Supabase)

Nova uses Supabase for the **database only** (Postgres). File storage is Cloudflare R2; the project's page schema (`project.json`) lives in the user's GitHub repo — the DB holds metadata, users, credits, and AI chat history.

## 1. Create a project
1. [supabase.com](https://supabase.com) → New project
2. Project Settings → API, copy into `.env.local` (see [environment.md](./environment.md)):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Run the migrations (source of truth — do NOT hand-write schema)
Run the SQL files in `supabase/migrations/` **in filename order** via the Supabase SQL Editor (or `supabase db push`):

| File | Adds |
|---|---|
| `0001_init.sql` | `users`, `projects`, `credit_transactions`; `deduct_credit()` + `reset_monthly_credits()` RPCs; RLS enabled |
| `0002_ai_messages.sql` | `ai_messages` + the `deduct_credit(p_credits)` variant |
| `0003_ai_conversations.sql` | `ai_conversations` + `touch_conversation_updated_at` trigger (auto-sorts chat list by last activity) |
| `0003_tiers.sql` | widens `users.tier` CHECK to **(free, pro, max, team)** |
| `0004_credit_allowances.sql` | sets `credits_remaining` default **200** and `reset_monthly_credits()` refill to **free 200 / pro 4000 / max 15000 / team 5000** (per [`../pricing-policy.md`](../pricing-policy.md)) |

> These SQL files are authoritative for column names, defaults, and RPC logic. This doc intentionally does not duplicate them (the previous hand-written copy drifted: it showed `tier (free,pro)` and `credits default 10`, both wrong). The AI conversation/credit schema detail is described in [`architecture-ai.md`](../architecture-ai.md) §3–4.

## 3. Row Level Security
RLS is enabled with **no policies** → only the `service_role` key (used server-side in API routes) can read/write. The browser never gets DB access. Never import `@/lib/supabase-server` (service key) into a client component.

## 4. `getOrProvisionUser` flow
`apps/studio/src/lib/supabase-server.ts` runs on every authenticated API request (self-healing auth):
```
GitHub OAuth → NextAuth token (githubId, githubLogin, email)
  → getOrProvisionUser(token)
    → SELECT users WHERE github_id = …
    → if missing: INSERT (free tier, default credits per 0001_init)
    → return user row
```

## 5. Schema migrations — two independent systems
- **DB schema:** the `supabase/migrations/*.sql` files above (run manually/CI on the Supabase project).
- **`project.json` schema:** versioned separately (`schemaVersion` 1.0→1.4), migrated automatically on project load by `packages/schema/src/migrations/runner.ts`. Stored in GitHub, not the DB — no DB migration needed for a project-schema change. See [`../ADR.md`](../ADR.md) (ADR-007/013).
