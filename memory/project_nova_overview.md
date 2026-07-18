---
name: project-nova-overview
description: Nova — repo location, stack one-liner, and pointers to the canonical docs
metadata:
  type: project
---

**Repo:** `c:\Users\Administrator\Downloads\Github Clone\nova-nocode-editor` · branch `main` · pnpm workspaces + Turborepo.
**Stack:** Next.js 14 (App Router) · Tailwind · Zustand · Craft.js v0.2.12 (unforked) · Supabase · NextAuth v4 (GitHub OAuth) · multi-provider AI.

## Source of truth = `doc/` (not memory)
- `doc/SPEC.md` — current product behavior + monorepo map + data model + tiers
- `doc/COMPONENTS.md` — per-component/package reference tables
- `doc/ADR.md` — architecture decisions
- `doc/VERIFIED.md` — what's confirmed working vs needs manual QA

## Memory-only gotcha (silent failure, easy to forget)
`apps/studio/next.config.mjs` MUST keep `webpack.resolve.extensionAlias` mapping `.js → [.ts, .tsx, .js]`. Without it, any API route importing a workspace package 500s at runtime — invisible to typecheck and vitest.

See also [[project-nova-technical-debts]] for the live debt/TD list.
