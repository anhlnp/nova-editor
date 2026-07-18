# Nova — Pricing & AI Credit Policy

> The single owner of pricing/credit numbers. Code/DB must follow this doc, not duplicate it.
> **Status:** recommended best-practice design. **Reference prices verified: 2026-06-16** — re-check provider pricing pages quarterly (each `PROVIDER_CREDIT_COST` constant carries a `// verify: YYYY-MM-DD`).
> **v4.1.0 (ADR-038) — hybrid credit model:** every tier is now **metered** (Pro is no longer unlimited); credits live in **two buckets** — a resetting **monthly allowance** with a per-tier **daily soft-cap** (Figma-style), and a **prepaid top-up** bucket that never resets, expires after 1 year, and bypasses the daily cap (v0-style). See §3, §3a, §4.

---

## 1. Principle
> **Gate scale and power, not capability.** Every user — free or paid — can build something real. The editor is fully functional on Free; paid tiers raise limits and unlock workflow features (code export, deploy, domains, seats).

## 2. The credit model (best practice)

**Why credits, not raw $ or tokens:** a stable, provider-agnostic unit insulates the user from per-model price differences and lets the operator reason about cost in one currency. Token-exact billing is deferred (see §8) — flat per-operation credits are simpler and predictable.

- **1 credit = $0.002 USD** of AI compute. Anchored to the most expensive provider (Anthropic) so credit costs stay small integers and operator exposure is bounded.
- **Cost is per *operation*** (one AI edit = planner + patcher round-trip), not per token. Charged **only after** the result validates (`ProjectSchema.parse()` succeeds) — failed ops cost 0 (ADR-006). Deduction is atomic (`deduct_credit` RPC).
- **Hard-coded prices, dated.** Provider prices change ~1–2×/year; a runtime pricing API doesn't exist for most. Update path: edit `PROVIDER_CREDIT_COST` in `packages/ai/src/providers/base.ts` and redeploy. Optional DB override table only if you need price changes without deploy (§8).

### Per-operation cost (latest models of the 3 majors)
Token budget per Nova op: **planner** 2,000 in / 300 out (cheap model) + **patcher** 4,000 in / 600 out (capable model).

| Provider | Planner (fast) | Patcher (capable) | Ref price in/out (per 1M) | Op cost | **Credits/op** |
|---|---|---|---|---|---|
| **Anthropic** | Claude Haiku 4.5 | Claude Sonnet 4.6 | Haiku $0.80/$4 · Sonnet $3/$15 | ~$0.024 | **12** |
| **OpenAI** | GPT-4o-mini | GPT-4o | mini $0.15/$0.60 · 4o $2.50/$10 | ~$0.017 | **8** |
| **Google** | Gemini 2.5 Flash | Gemini 2.5 Pro | Flash $0.075/$0.30 · Pro $1.25/$10 | ~$0.011 | **6** |

> **Premium option:** offering Claude **Opus 4.8** as the patcher (~$15/$75 per 1M → ~$0.06/op → ~30 credits) is reasonable as a "max quality" toggle for Pro+; not the default (cost). Update model names + prices on the verify date — newer model generations supersede these.

### Free providers — testing only (arbitrary cost)
`groq`, `openrouter` (`:free` models), `mistral` (open-weight) cost the operator ~$0. They exist for **development/testing**, default `AI_PROVIDER` in `.env.example`. Credit cost = **1** (purely to drive the shared per-minute rate limiter; the exact number is arbitrary). Not positioned as a production end-user path.

---

## 3. Tiers

> ✅ **Implemented:** monthly allowances are enforced by `reset_monthly_credits()` (free 200 / pro 4000 / max 15000 / team 5000; column default 200, `0004`) + the initial grant in `supabase-server.ts` (`<30d ? 50 : 200`, anti-abuse). Reset cadence is **monthly**. Since v4.1.0 (`0006_two_bucket_credits.sql`, ADR-038) the allowance lives in the **monthly bucket** (`users.credits_remaining`), separate from the **prepaid bucket** (`users.topup_credits_remaining`); `lib/tiers.ts` is the entitlement source of truth (`aiCreditsPerMonth` + `dailyCreditCap`). **Pro is metered** (was unlimited).

### Shipped tiers

| | **Free** | **Pro** |
|---|---|---|
| Price | $0 | **$19/mo** ($190/yr — 2 months free) |
| AI credits / month | **200** | **4,000** |
| Daily cap (monthly bucket, §3a) | **40 cr/day** | none |
| ↳ ≈ Claude ops (12 cr) | ~16 | ~333 |
| ↳ ≈ Gemini ops (6 cr) | ~33 | ~666 |
| Active projects | 1 | Unlimited |
| Visual editor (all blocks/pages) | ✅ | ✅ |
| GitHub sync (`project.json`) | ✅ | ✅ |
| `.tsx` code export | ❌ | ✅ |
| Vercel auto-deploy | ❌ | ✅ |
| Custom domain | ❌ | 1 |
| Premium templates | Preview | ✅ |
| Support | Community | Email |

**Unit economics (worst case = 100% Anthropic):** Free ≤ 200/12 × $0.024 ≈ **$0.40/mo** per active user. Pro = 4,000/12 × $0.024 ≈ **$8/mo** AI cost on $19 revenue → ~$11 gross headroom before infra. Real usage mixes cheaper/free providers, so typical AI cost is well under that.

### Planned tiers (design now, ship on demand — same entitlement system in `lib/tiers.ts`)

| | **Max** | **Team** |
|---|---|---|
| Price | $49/mo | $29/seat/mo (min 3 seats) |
| AI credits / month | 15,000 | 5,000 / seat (pooled) |
| Projects | Unlimited | Unlimited |
| Custom domains | 5 | 5 / project |
| Seats | 1 | 3+ |
| White-label (remove "Powered by Nova") | ✅ | ✅ |
| Admin dashboard (usage, audit) | — | ✅ |
| SSO / SAML | — | v2.x |
| Support | Priority email (48h) | Priority + onboarding |

Adding a tier = one `TIER_ENTITLEMENTS` entry + widen the `users.tier` CHECK (already `free,pro,max,team` via `0003_tiers.sql`) + update `reset_monthly_credits()`.

---

## 3a. Daily soft-cap (v4.1.0, ADR-038)
A per-tier **daily limit on monthly-bucket spend** so a user can't drain the whole
monthly allowance in one sitting (inspired by Figma Make). Applied to **Free only**
(`40 cr/day` ≈ 3 Claude or 6 Gemini ops); paid tiers are uncapped. The cap counts
only `ai_operation` rows with `from_topup = false` since the start of the UTC day
(`getMonthlySpentToday`). **Prepaid top-up credits bypass the cap** — once the daily
monthly-bucket limit is hit, a user with a top-up keeps working (spends prepaid); a
user without one waits until tomorrow or buys a top-up. Enforced in `/api/ai` via the
pure `decideCreditSource()` helper in `lib/tiers.ts` (unit-tested).

## 4. Credit top-ups (à la carte) — the **prepaid bucket**
Let users buy credits without upgrading. Top-ups land in `users.topup_credits_remaining`
(separate from the monthly bucket): **additive, never reset by the monthly cron, expire
1 year after purchase, and bypass the daily cap**. Spent **after** the monthly bucket is
exhausted or daily-capped. `credit_transactions.reason = 'topup_purchase'`.

| Package | Credits | Price | Variant-name token |
|---|---|---|---|
| Boost | 200 | $0.50 | `200` |
| Standard | 1,000 | $2 | `1000` |
| Power | 4,000 | $7 | `4000` |

Lemon Squeezy one-time products → `/api/payment/webhook` (`order_created`) credits the
prepaid bucket and stamps `topup_expires_at = now() + 1 year`. The webhook matches the
package by credit-size token in the variant name, **largest-first** (so `200` can't
substring-match `1000`/`4000`).

---

## 5. Contextual upgrade UX (Canva-inspired)
Never gate the editor at first load. Prompt only at the moment of intent:

| Trigger | Prompt |
|---|---|
| 2nd project | "Free plan: 1 active project. Upgrade to Pro for unlimited." |
| Paid credits hit 0 | "You've used your monthly credits. Upgrade, buy a top-up, or switch to a free model." |
| Free daily cap hit (§3a) | "Daily limit reached. Buy a top-up to keep going, or come back tomorrow." |
| Credits ≤ 2× op cost | amber credit counter |
| Click Publish (Free) | "Saved to GitHub ✓ — export `.tsx` + auto-deploy with Pro." |
| Click a PRO template/block | "Upgrade to use this." |

## 6. Payments
- **Global:** Lemon Squeezy (Merchant of Record — handles VAT/tax). Pro subscription + top-up products.
- **Vietnam:** **PayOS** (VietQR, auto bank-transfer confirmation via `/api/payment/webhook`). Setup: [`setup/store.md`](setup/store.md).
- Dev: `NEXT_PUBLIC_FORCE_PRO=true` bypasses billing locally (never in prod). Manual upgrade fallback = direct DB `UPDATE users SET tier=…` (no admin route exists).

## 7. Free-provider strategy (cost control)
Pre-revenue: default to a free provider, label "(free)" in the selector, show "0 paid credits". Keeps operator AI cost ~$0 and reduces churn from early credit exhaustion. Push paid providers only where output quality matters ("for complex layouts, try Claude").

## 8. Deferred
| Decision | Until |
|---|---|
| Token-exact billing | usage varies a lot across users |
| DB-driven cost table (no-deploy price changes) | post-revenue |
| Annual/seat proration edge cases | first Team customer |
| Opus "max quality" toggle | demand for higher-fidelity generation |
