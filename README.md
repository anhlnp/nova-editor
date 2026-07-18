<div align="center">
  <img src="apps/studio/public/logo.svg" alt="Nova" width="72" height="72" />
  <h1>Nova Editor</h1>
  <p><strong>An AI-native visual page builder that exports clean React/Next.js code to your own GitHub repo.</strong></p>
  <p>
    <code>v1.4</code> ·
    schema <code>1.4</code> ·
    7 packages typecheck-clean ·
    270+ unit tests
  </p>
</div>

---

## What it is

Nova is a schema-driven, AI-assisted page builder. You compose pages from a block library on a drag-drop canvas, style them with a bounded Tailwind editor, edit by chatting with an AI — and Nova keeps a single canonical `project.json` as the source of truth. Pro users export clean, **owned** React / Next.js `.tsx` straight to their GitHub repo (and optionally auto-deploy to Vercel).

```
User prompt → AI patches JSON schema → Visual editor renders → Export React code → Git push
```

| Tool | Output | Code ownership | Git sync | AI-native |
|------|--------|----------------|----------|-----------|
| Webflow | HTML/CSS | ❌ | ❌ | ❌ |
| Framer | React (runtime-locked) | partial | ❌ | ◑ |
| **Nova** | Clean React/Next.js `.tsx` | ✅ full | ✅ | ✅ |

**Docs:** start at [`doc/README.md`](doc/README.md). The canonical set is [`SPEC.md`](doc/SPEC.md) (what it does), [`ADR.md`](doc/ADR.md) (why), [`COMPONENTS.md`](doc/COMPONENTS.md) (what each part contains), [`VERIFIED.md`](doc/VERIFIED.md) (what's confirmed working).

## Architecture

Turborepo + pnpm workspace. The schema is the single source of truth (ADR-001); data flows one way: `Schema → Canvas` and `Schema → Code` (ADR-002).

| Package | Responsibility |
|---------|----------------|
| [`packages/schema`](packages/schema) | Zod types + canonical `project.json` shape, ID generators, migrations (→ 1.4) |
| [`packages/registry`](packages/registry) | 15-block UI library (component + Zod schema + AI hints + `cn` style-merge util) |
| [`packages/editor`](packages/editor) | Craft.js adapter, pure schema operations/commands, draft autosave (IndexedDB), 20-step undo/redo |
| [`packages/ai`](packages/ai) | 6-provider AI (Claude / GPT / Gemini + 3 free) — planner + patcher, **JSON Patch only** |
| [`packages/git`](packages/git) | GitHub REST (Octokit) — read / write / publish / conflict-check (server-only) |
| [`packages/renderer`](packages/renderer) | `Project` schema → `.tsx` files (Pro feature) |
| [`packages/deploy`](packages/deploy) | Vercel deploy trigger (Pro) |
| [`apps/studio`](apps/studio) | Next.js 14 App Router app — auth, API routes, editor workspace |

**Tech:** Next.js 14 (App Router) · TypeScript (strict) · Zod · Craft.js · Zustand · Tailwind · NextAuth (GitHub OAuth) · Supabase (Postgres) · Lemon Squeezy + PayOS · Vitest.

### Security model
- **GitHub tokens never reach the browser** (ADR-003). Git runs server-side; the token lives only in the encrypted NextAuth JWT.
- **Supabase service key is server-only.** No client DB access (RLS, service-role).
- **AI output is JSON Patch only** — never raw code — Zod-validated before it touches state; credits deducted *only after* validation (ADR-006).
- Paywall enforced server-side in the publish route, not the UI.

## Getting started

**Prereqs:** Node 20+, pnpm 8+, a Supabase project, a GitHub OAuth app, and ≥1 AI provider key (a free one like Groq works for dev).

```bash
pnpm install
pnpm turbo typecheck test          # all packages green
cp .env.example apps/studio/.env.local   # fill values
pnpm --filter @studio/app dev      # http://localhost:3000
```

Full operator runbooks (env, database migrations, R2, payments) live in [`doc/setup/`](doc/setup/README.md). Diagnostic: visit `/api/setup-check` (dev only).

## How it works
1. **Connect a repo** — OAuth, pick a GitHub repo. Nova detects the default branch (ADR-008) and reads/initializes `project.json`.
2. **Edit** — drag blocks to the canvas, click to select, edit content/props (Props tab) and Tailwind styling (Style tab → `classOverrides`), manage layers/pages, or ask the AI ("make the hero dark blue"). AI returns an RFC 6902 JSON Patch, applied + Zod-validated.
3. **Autosave** — drafts persist to IndexedDB (debounced); schema-level undo/redo keeps the last 20 states (ADR-009).
4. **Publish** — Free syncs `project.json`; Pro also exports generated `.tsx` and (with a Vercel token) auto-deploys. Remote conflicts push a `nova/draft-*` branch + PR link instead of force-pushing.

## Pricing (summary)
| | Free | Pro |
|---|------|-----|
| Visual editor (all blocks/pages) | ✅ | ✅ |
| AI credits / month | 200 | 4,000 |
| Schema git sync | ✅ | ✅ |
| `.tsx` export + Vercel deploy | ❌ | ✅ |
| Price | $0 | $19/mo |

Billing via Lemon Squeezy (global) + PayOS (Vietnam). Full model, credit math, and planned Max/Team tiers: [`doc/pricing-policy.md`](doc/pricing-policy.md).

## Status & roadmap
- **v1.4 (current):** drag-drop canvas, multi-select, bounded Tailwind Style panel (`classOverrides` + `cn` merge), schema-driven Props panel, composite-block decomposition, AI chat, multi-page, templates, code export. Confirmed-working vs needs-manual-QA tracked in [`doc/VERIFIED.md`](doc/VERIFIED.md).
- **v2.0 (in progress):** docs/process reset (done) → publish blocks generated from the registry (ADR-027) → single style system / props=content-only (ADR-028) → Theme decision (ADR-029) → Footer decomposition + Row primitive. Then the **template marketplace** (discovery + creator monetization).

## License
Proprietary — all rights reserved (pre-release). Not yet open source.
