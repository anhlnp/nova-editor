# Setup — Operator Runbooks

Ordered guide to standing up Nova locally and in production. Do the **Required** steps first; the rest are feature-gated.

## Order
| # | Step | Doc | Needed for |
|---|---|---|---|
| 1 | GitHub OAuth app + core env vars (NextAuth, Supabase keys) | [environment.md](./environment.md) | **Required** — login + editor |
| 2 | Supabase project + run `supabase/migrations/*.sql` | [database.md](./database.md) | **Required** — users, credits, AI chat |
| 3 | Cloudflare R2 bucket | [cloudflare-r2.md](./cloudflare-r2.md) | Image uploads |
| 4 | Lemon Squeezy (global) + PayOS (Vietnam) | [store.md](./store.md) | Paid tiers / billing |

AI provider keys: at least one of `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` / Groq / OpenRouter / Mistral (free options exist — see [`../architecture-ai.md`](../architecture-ai.md)). Vercel deploy token is optional (Pro feature).

## Quick start (local dev)
```bash
cp apps/studio/.env.example apps/studio/.env.local   # fill values (step 1)
# create Supabase project, run migrations (step 2)
pnpm install
pnpm dev                                             # http://localhost:3000
```
Dev shortcut: `NEXT_PUBLIC_FORCE_PRO=true` acts as a Pro user without billing (never in prod). Test accounts can switch tier via the TopBar switcher (`NOVA_TEST_ACCOUNTS`, see [`../SPEC.md`](../SPEC.md) §6).

## Diagnostics
`GET /api/setup-check` (dev-only) verifies env vars, DB tables, and RPCs are present.

## Pitfalls
- `apps/studio/next.config.mjs` MUST keep `webpack.resolve.extensionAlias` `.js → [.ts,.tsx,.js]` or API routes 500 at runtime (invisible to typecheck/tests).
- API routes use the **service_role** key (bypasses RLS); never expose it client-side.
