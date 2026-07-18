---
name: project-nova-phase0-triage
description: Phase 0 Triage & Audit (2026-07-11) — observability + e2e harness added; Strangler Fig posture adopted for refactors
metadata: 
  node_type: memory
  type: project
  originSessionId: de94ea90-aadc-4c5e-bdcc-33e5fb2d4e8b
---

Phase 0 "Frankenstein Greenfield" triage completed 2026-07-11 (on v18.0.0). Report: `doc/PHASE0-TRIAGE.md`.

- Audit verdict: structure is NOT actually Frankenstein — 0 circular deps (madge, 215 files), no file >403 lines, hubs (data-stores 39 importers, nano-states 37, supabaseAdmin 33) are intentional SOLID-D adapters.
- New tooling: **pino** (`src/lib/logger.ts` — import from there, never `pino` directly), **@sentry/nextjs** env-gated (`src/instrumentation.ts`, `instrumentation-client.ts`, `app/global-error.tsx` — no-op without SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN), **Playwright** smoke harness (`pnpm test:e2e`, root `playwright.config.ts` + `e2e/smoke.spec.ts`: login ✅, /builder/demo load ✅, save skipped until E2E_EMAIL/E2E_PASSWORD set).
- Known trap: installing new deps while dev server runs corrupts `.next` cache → 500 "Cannot find module './NNNN.js'" on pages. Fix: kill port 3001, `rm -rf apps/nova-builder/.next`, restart. Diagnostic script kept at `e2e/diagnose-demo.mjs`.
- madge cannot resolve the `@/` alias — measure real coupling with `grep -rl 'from "@/lib/x"'`.
- **Refactor process from now on = Strangler Fig** (doc/PHASE0-TRIAGE.md §5): pin behavior with an e2e test BEFORE touching code; 3 gates (build → test:e2e → solid:audit) before deleting old code; no big-bang rewrites.

Related: [[project-nova-commercial-readiness]], [[project-nova-roadmap]]
