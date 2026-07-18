# Functional Audit (FA-v1) — Nova Builder

> **Date:** 2026-07-12
> **Version audited:** v18.6.1
> **Method:** code-trace + static sweeps of all 44 API route handlers, middleware, layout, and the i18n surface. Live Playwright waves (seeded accounts, AI-key journeys) were **not** run in this pass — those checks are crystallized as permanent e2e specs (`e2e/security.spec.ts`, `e2e/i18n.spec.ts`) so they run in CI where secrets are available.
> **Remediation:** confirmed 🔴 blockers fixed in phase **R1 → v18.7.0** (see bottom). Larger items filed as follow-up phases.
>
> **Severity:** 🔴 BLOCKING (broken core flow / data loss / security hole / entitlement bypass / policy violation) · 🟡 WARN (degrades trust/usability, missing recovery) · ⚪ INFO (debt/consistency).
> **Elder-first escalation:** a 🟡 usability defect on a core path (create/publish/pay) that blocks a low-vision/keyboard user → 🔴.

---

## Findings table

| ID | Dim | Sev | Title | Evidence | Fix size | Phase |
|----|-----|-----|-------|----------|----------|-------|
| FA-001 | Security/Commercial | 🔴 | Deploy route has **no project-ownership check** and **no `deploy` entitlement** — any logged-in user can deploy any project; free tier can deploy | [deploy/route.ts:28-32](apps/nova-builder/src/app/api/projects/[projectId]/deploy/route.ts#L28-L32) — `await context.params` discarded, no `.eq("user_id")`, no `entitlements()` | M | R1 |
| FA-002 | Commercial | 🔴 | HTML + React export check ownership (good) but **not** `codeExport` entitlement — free tier exports code | [export/[projectId]/route.ts:23-30](apps/nova-builder/src/app/api/export/[projectId]/route.ts#L23-L30), [export/[projectId]/react/route.ts:21-28](apps/nova-builder/src/app/api/export/[projectId]/react/route.ts#L21-L28) | S | R1 |
| FA-003 | Security/Finance | 🔴 | PayOS credit top-up is read-add-write with **no idempotency key** — a replayed valid webhook re-grants 500 credits every time | [payos/route.ts:68-70](apps/nova-builder/src/app/api/billing/webhook/payos/route.ts#L68-L70) | M | R1 |
| FA-008 | Security | 🔴 | **IDOR (new):** project `activity` GET+POST filter only by `project_id` — any authed user reads any project's activity feed and writes events to any `projectId` | [activity/route.ts:19-24](apps/nova-builder/src/app/api/projects/[projectId]/activity/route.ts#L19-L24), [:42-47](apps/nova-builder/src/app/api/projects/[projectId]/activity/route.ts#L42-L47) | S | R1 |
| FA-009 | Security | 🔴 | **IDOR (new):** project `comments` GET+POST filter only by `project_id` — cross-tenant read of all comments and post to any `projectId` | [comments/route.ts:22-27](apps/nova-builder/src/app/api/projects/[projectId]/comments/route.ts#L22-L27), [:55-63](apps/nova-builder/src/app/api/projects/[projectId]/comments/route.ts#L55-L63) | S | R1 |
| FA-010 | Security | 🔴 | **Email bomb (new):** `POST /api/submissions` is public, unauthenticated, unbounded, and sends an owner email per call → amplification against any project owner | [submissions/route.ts:47-62](apps/nova-builder/src/app/api/submissions/route.ts#L47-L62) | M | R1 |
| FA-I01 | i18n/Security | 🔴 | `/api/i18n` not in `PUBLIC_PREFIXES` → a logged-out visitor's detect fetch is redirected to `/login`, so IP auto-detect silently fails on first visit (its only use case) | [middleware.ts:11-28](apps/nova-builder/src/middleware.ts#L11-L28) (no `/api/i18n`) | S | R1 |
| FA-004 | Commercial | 🟡 | Project create has no `maxProjects:3` enforcement — free tier makes unlimited projects | [projects/route.ts:25-48](apps/nova-builder/src/app/api/projects/route.ts#L25-L48) | S | R1 |
| FA-I03 | i18n/a11y+SEO | 🟡 | `<html lang="en">` hardcoded in root layout → screen readers mispronounce VI content | [layout.tsx:14](apps/nova-builder/src/app/layout.tsx#L14) | S | R1 |
| FA-011 | Security | 🟡 | **New:** `POST /api/analytics/track` public + unbounded → analytics-table pollution (project existence is checked, insert count is not) | [analytics/track/route.ts:33-39](apps/nova-builder/src/app/api/analytics/track/route.ts#L33-L39) | S | R1 |
| FA-005 | Compliance | 🟡 | `/privacy` promises password-reset emails; no reset flow / email verification exists | privacy page vs [lib/auth.ts](apps/nova-builder/src/lib/auth.ts) | M | R2 |
| FA-006 | Elder-first | 🟡 | 3 pages the visual sweep missed keep pre-sweep values (`fontSize:11`, `0.38` muted): analytics, submissions, settings/domains dashboards | [analytics](apps/nova-builder/src/app/analytics/[projectId]/page.tsx), [submissions](apps/nova-builder/src/app/submissions/[projectId]/page.tsx), [domains](apps/nova-builder/src/app/settings/domains/[projectId]/page.tsx) | S | R2 |
| FA-007 | Parity | 🟡→✅(code) | Canvas interaction layer **feature-complete**: selection overlay + 8-handle resize (v19.0.0) + drag-reparent (v19.1.0, `dragReparent.ts` + shared `lib/treeMove.ts`) + inline-text + click-select/hover. Behavior 🟡 pending browser QA | [src/canvas/](apps/nova-builder/src/canvas/) | L | R3 done |
| FA-I02 | i18n/Compliance | 🟡 | Switcher offers VI, but `/terms` + `/privacy` are hardcoded English → legal text not binding for VN users | terms/privacy pages | M | R2 |
| FA-I04 | i18n/Elder-first | 🟡 | ~60% of strings hardcoded English (landing hero, pricing, signup validation, builder tab labels) → VI elder sees half-translated UI | [app/page.tsx](apps/nova-builder/src/app/page.tsx) uses 0 dict keys | M | R2 |
| — | Security | ⚪ | `GET /api/preview/[projectId]` is intentionally public (UUID unguessable) — accepted for MVP; no published/unpublished flag | [preview/route.ts:1-3](apps/nova-builder/src/app/api/preview/[projectId]/route.ts#L1-L3) | — | — |
| FA-I05 | i18n | ⚪ | Accept-Language fallback only fires when country header absent AND result already "en"; no localized `<title>`/`description` | [i18n/detect/route.ts:17-22](apps/nova-builder/src/app/api/i18n/detect/route.ts#L17-L22) | S | R2 |

### Routes verified CLEAN (no finding)

- **Ownership enforced** (`.eq("user_id")`): projects `[projectId]` GET/PATCH/DELETE, export HTML, export React, github, snapshots, snapshots restore, submissions (authed read), transfer, webhooks, domains, comments `[commentId]` (delete/patch).
- **RBAC + seat-gate enforced**: teams `[teamId]/members` GET/POST/DELETE (owner/admin only, 402 on seat limit), teams billing.
- **Admin gate enforced**: `/api/admin/users`, `/api/admin/flags` (both `requireAdmin()` on every verb).
- **Webhook idempotent by construction**: LemonSqueezy webhook sets tier via state-`update` (replay-safe); only PayOS credit top-up (read-add-write) is vulnerable.
- **Credit ordering correct** (ADR-NB-005): `/api/ai` deducts only after `validateCompositionWS`.

---

## Dimension roll-up

| Dim | 🔴 | 🟡 | ⚪ |
|-----|----|----|----|
| D3 Commercial/entitlement | 2 (FA-001,002) | 1 (FA-004) | — |
| D5 Data integrity | — | — | — |
| D6 Security (IDOR / abuse / webhook) | 4 (FA-003,008,009,010) | 1 (FA-011) | 1 (preview) |
| D8 Elder-first missed pages | — | 1 (FA-006) | — |
| D9 Editor parity | — | 1 (FA-007) | — |
| D10 i18n / localization | 1 (FA-I01) | 3 (FA-I02,I03,I04) | 1 (FA-I05) |
| Compliance | — | 1 (FA-005) | — |

**Totals: 7 🔴 · 8 🟡 · 3 ⚪.**

---

## Remediation phase map

- **R1 (v18.7.0, done)** — every 🔴 + the two cheap 🟡 (FA-004, FA-I03) + the public-POST 🟡 (FA-011): entitlement gates, deploy ownership, PayOS idempotency, activity/comments IDOR, submissions/analytics rate-limit + email cap, `/api/i18n` public prefix, dynamic `<html lang>`, maxProjects cap.
- **R2 (v18.8.0, done)** — FA-005 password reset flow (email-verify deferred — not a standing promise), FA-006 missed-page readability, FA-I02 legal-page translation, FA-I04 funnel translation (plan-card copy from `plans.ts` still EN — small remainder), FA-I05 accept-language ordering. Also fixed the D10 precedence bug (explicit locale now overrides IP auto-detect).
- **R3 pt.1 (v19.0.0, done)** — FA-007 canvas selection overlay + resize handles (`SelectionOverlay.tsx`, `resizeMath.ts`, ADR-NB-018).
- **R3 pt.2 (v19.1.0, done)** — FA-007 drag-reparent (`dragReparent.ts`, shared `lib/treeMove.ts`, ADR-NB-018 extension). **FA-007 now feature-complete** (code); needs browser QA to flip 🟡→✅.
- **R4 (v19.2.0, done)** — plan-card copy localization (`pricing.planCopy`, price still single-sourced), email verification (`emailVerification.ts`, migration 0004, `/verify-email`), and QA automation (`e2e/editor.spec.ts` + i18n/security additions) with a manual checklist (`doc/qa-nova-builder.md` §R4) for the canvas-mutation rows.

**Every FA-v1 finding is now remediated in code, and every remainder is closed.** The only outstanding work is the human browser-QA pass (`doc/qa-nova-builder.md` §R4: FA-007 resize/drag-reparent mutations, navigator-DnD regression, VI funnel walk-through, email round-trip) to flip the remaining 🟡 ledger rows to ✅. No further code phases are required by FA-v1.

---

## Automation ledger

| Finding | Becomes permanent spec |
|---------|------------------------|
| FA-001, FA-002, FA-004 | `e2e/security.spec.ts` — free-tier cookie → deploy/export/4th-project → 402/403 |
| FA-008, FA-009 | `e2e/security.spec.ts` — user B vs user A's projectId activity/comments → 403 |
| FA-010, FA-011 | `e2e/security.spec.ts` — burst POST → 429 after threshold |
| FA-I01 | `e2e/i18n.spec.ts` — logged-out `cf-ipcountry: VN` → `/api/i18n/detect` returns `vi` (no 307) |
| FA-I03 | `e2e/i18n.spec.ts` — `document.documentElement.lang` tracks active locale |
