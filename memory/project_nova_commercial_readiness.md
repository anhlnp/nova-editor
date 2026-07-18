---
name: project-nova-commercial-readiness
description: v17.1.0 SOLID audit verdict + P0 remediation done; remaining P1 commercial backlog
metadata:
  type: project
---

**2026-07-11 · v17.1.0 — SOLID audit + commercial-readiness remediation (P0 scope).**

Audit verdict was: architecture B− (~70/100), **not commercial-ready** — feature-complete but not commercially wired. Remediated in v17.1.0:
- SOLID gate now passes: 0 blocking (was: 725-line builder page S1 + `uid()` in 10 files D1). `lib/uid.ts` is the single id-minting routine; builder page split into `lib/saveProject.ts`, `lib/richText.ts`, `builder/hooks/useProjectLoad.ts`, `builder/hooks/useBuilderKeyboard.ts`, `TextFormatToolbar.tsx` (344 lines).
- Middleware publics fixed (preview/track/submissions/SEO/billing-webhook were ALL auth-gated before — share links broke in incognito).
- Payments: Lemon Squeezy (subscriptions) + PayOS VietQR (one-time + 500-credit top-ups) via `/api/billing/portal` + 2 HMAC-verified webhooks. Env-gated: LS store/variants/secret, PAYOS client/api/checksum keys.
- Email: `lib/email.ts` (Resend REST, no-op without RESEND_API_KEY) — invites + form-lead notifications honoring notification_prefs.
- Publish wiring: exporter + preview now carry customCss/interactions/cookie banner/live form capture; custom domains served via middleware Host rewrite → `/preview/resolve` (needs `NEXT_PUBLIC_APP_HOST`).

**Why:** the recurring failure mode was "feature ships as UI + table but is never wired end-to-end" (webhooks never fired, API keys never authenticate, flags never consumed — still true, P1 backlog).

**How to apply:** when adding a commercial feature, verify the full loop (visitor → API → email/webhook → dashboard) before marking done. P1 backlog: fire project_webhooks, API-key auth, feature-flag consumption, legal pages, tests (still 0 in nova-builder), 31 SOLID warns (TreeRow 33-field props worst). All 🟡 rows still need human browser QA. See [[project-nova-roadmap]].
