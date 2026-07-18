# Nova — Living Product Spec

> **The** single source of truth for what Nova is *right now*. Replaces the per-version PRDs (archived in `doc/archive/`). Describes current behavior, not history.
> Companion docs: [`MODEL.md`](MODEL.md) (the mental model — read first), [`ADR.md`](ADR.md) (why), [`COMPONENTS.md`](COMPONENTS.md) (what each part contains), [`VERIFIED.md`](VERIFIED.md) (what is confirmed working).
>
> **Doc rule:** a feature is described here as *working* only after it appears in `VERIFIED.md`. Aspirational/unverified items live under "Roadmap / unverified" and are clearly marked.

**Current app version:** v7.0.2-dev · **Schema version:** `4.0` · **Stack:** Next.js 14 (App Router) · Tailwind · Zustand · Craft.js v0.2.12 (pnpm-patched: `node_<8>` ids, ADR-040) · Supabase (Postgres) · NextAuth v4 (GitHub OAuth) · pnpm + Turborepo.

---

## 1. What Nova is
An AI-native, no-code web page builder. Users compose pages from a block library on a drag-drop canvas, edit content/props and Tailwind styling, optionally ask an AI to mutate the page, and publish clean React/Next.js + Tailwind code to **their own GitHub repo** (optionally auto-deployed to Vercel). The moat (vs Webflow/Framer/Webstudio): **AI schema editing + clean owned code export + Git ownership** — not freeform-CSS parity (ADR-018).

## 2. Monorepo
| Package | Purpose | Tested |
|---|---|---|
| `packages/schema` | Zod schemas (Project/Page/Element/Props/Template/SEO/Theme), ID gen, migration runner | ✅ unit |
| `packages/editor` | Craft adapters (`makeCraftComponent`, resolver, `NovaRootCanvas`), pure `operations`, `commands`, history slice, draft storage, `applyTemplate` | ✅ unit |
| `packages/registry` | 15 blocks + Zod schemas + AI hints + `cn` util | ✅ unit/smoke |
| `packages/ai` | Multi-provider planner+patcher (JSON-Patch), system prompt | ✅ unit |
| `packages/git` | Octokit read/write/publish/templates | ✅ unit (mocked) |
| `packages/renderer` | `generateAll()` → Next.js `.tsx` + tailwind config + block sources | ✅ unit |
| `apps/studio` | The Next.js app: editor UI, API routes, auth, billing | ⚠️ typecheck only (no E2E) |

**Critical infra note:** `apps/studio/next.config.mjs` MUST keep `webpack.resolve.extensionAlias` `.js → [.ts,.tsx,.js]`, or any route importing a workspace package 500s at runtime (invisible to typecheck/vitest).

## 3. Data model (ADR-001/005/007/010)
```
Project { schemaVersion, meta{name,createdAt,updatedAt}, pages[], theme? }
Page    { id:page_<6>, name, route, elements[], seo? }
Element { id:node_<8>, type, props:Record<serializable>, children[] }
```
**IDs are minted conforming at creation (v5.1.0/ADR-040):** a pinned pnpm patch of `@craftjs/core` makes Craft assign `node_<8>` ids when a node is created, so the schema id == the live Craft id (the old `toNovaId()` read-time slice is gone).
- `props` is JSON-serializable only, but may now be **arbitrarily nested** (array-of-objects, nested records) since schema 2.0 — `PropsValueSchema` is fully recursive (C10.1/ADR-035). Visual styling lives in `props.classOverrides: string[]` (bounded Tailwind classes, ADR-022). Editor-only metadata uses `_nova*` keys (ADR-026), stripped on publish.
- All state derives from `project.json`. Migrations run on load (`migrateToLatest`): chain `1.0→…→1.5→1.6→2.0→3.0`. (1.4→1.5: visual props → `classOverrides`, ADR-028. 1.5→1.6: Footer `links` → child Link nodes, TD-021. 1.6→2.0: additive — recursive props, no data transform, ADR-035. 2.0→3.0: brittle-preset decomposition — HeroSection split layouts wrap into child `Box` columns, FeatureCard/PricingCard content props → child `TextBlock` nodes, ADR-037.)

## 4. Editor surface (apps/studio)
Left **icon rail** (Layers · Blocks · AI · Templates · Pages · **Components**) + expandable panel · center **canvas** (viewport switch, zoom, breadcrumb) · right **Props/Style** panel. Full component map in [`COMPONENTS.md`](COMPONENTS.md).

Key flows (see `VERIFIED.md` for confirmed status):
- **Add block** → click/drag from Blocks panel (or Layers "+"); composite blocks insert `defaultChildren`.
- **Select** → click (Craft → `uiStore` via `RightPanelWithSync`); Shift/Ctrl-click extends multi-select; right-click = context menu.
- **Edit** → Props tab (schema-driven `PropsPanel`) + Style tab (`StylePanel` writes `classOverrides`).
- **Structure** → Layers tree (drag reparent/reorder, rename F2, hide), group→Section / ungroup, undo/redo (Ctrl+Z/Y). **Undo (v5.0.0, ADR-039):** a hybrid unified timeline — canvas edits replay via Craft's native history (in-place, no remount); page/theme/AI are schema steps; one Ctrl+Z reverts the most recent action regardless of source. Supersedes the 20-snapshot model (ADR-009).
- **AI** → describe change → JSON-Patch applied → canvas re-syncs (credits metered).
- **Publish** → Free: `project.json` to GitHub. Pro: generate `.tsx` + optional Vercel deploy.

## 5. Block library (registry) — 16 blocks
**Primitives** (blank building blocks): `Box` (new v3.1.0), `Section`, `Row` (flex), `Column` (grid), `TextBlock`, `Image`, `Button`, `Link`.
**Presets** (opinionated): `HeroSection`, `Navbar`, `Footer`, `FeatureCard`, `PricingCard`, `FAQ`, `Stats`, `Testimonials`.

Canvas containers (`isCanvas`, accept children): Box (all — no restriction), Section (all), Row (all), Column, HeroSection (TextBlock/Button/Image), Navbar (Link/Button/Image), Footer (Link/Button), PricingCard (Button). All others are leaf nodes.

`Box` is the Swiss-army-knife layout primitive (C1.1/ADR-036): renders as any HTML block element (`as` prop: `div/header/footer/nav/section/main/article/aside`, default `div`), `bgColor` defaults to `transparent`. Use `Box` for internal layout structure; use `Section` for page-level sections with its default spacing. `Section` also gains an `as` prop (v3.1.0) for semantic element switching while keeping default spacing.

Left-Panel Blocks section has a "Layouts" group (C1.2) showing 4 presets (2 Col, 3 Col, Sidebar Left/Right) that inject preconfigured nested `Box` trees. Authoring rules + the two-tier model: [`architecture-blocks.md`](architecture-blocks.md).

## 6. Tiers & billing
Free / Pro / Max / Team. **Entitlement-driven** (not hardcoded `tier==="pro"`): single source `apps/studio/src/lib/tiers.ts` (`TIER_ENTITLEMENTS` + helpers `dailyCreditCap`/`decideCreditSource`/`canExportCode`/`canDeploy`/`entitlements`/`isAtLeast`; unknown tier → free). Adding a tier = one `TIER_ENTITLEMENTS` entry. DB CHECK widened in `supabase/migrations/0003_tiers.sql`. Test accounts (`lib/testAccount.ts`, env `NOVA_TEST_ACCOUNTS`) switch tier without billing via `POST /api/dev/set-tier` (re-verifies allowlist server-side; 403 otherwise). AI credit cost is per-provider, deducted only on success (ADR-006). **Hybrid credit model (v4.1.0, ADR-038):** all tiers metered (no unlimited); credits split into a resetting **monthly** bucket with a per-tier **daily soft-cap** (Free 40/day) + a **prepaid top-up** bucket (never resets, 1yr TTL, bypasses the cap). **Credit UX (v4.2.0):** `userStore` carries the full breakdown (`monthlyCredits`/`topupCredits`/`dailyCap`/`dailyRemaining`); TopBar shows combined total with daily badge; AI panel distinguishes `daily_cap` vs `insufficient` blocks and offers top-up purchase links; pure display helpers in `lib/creditDisplay.ts`. Pricing/payment policy: [`pricing-policy.md`](pricing-policy.md).

## 7. AI subsystem
Planner (cheap model) + patcher (capable model) emit JSON-Patch against the current schema; patch validated, retried ≤3×, credits charged on valid result (ADR-006). **6 providers** (live `PROVIDER_NAMES`): `anthropic`, `openai`, `google`, `groq`, `openrouter`, `mistral` — the last three are free (rate-limit-only credit cost). Per-op credit cost in `PROVIDER_CREDIT_COST` (anthropic 12 / openai 8 / google 6 / free 1). Selectable per-request. Deduction picks a bucket via `decideCreditSource` (monthly first, then prepaid top-up; Free's 40/day cap applies to monthly spend only — top-ups bypass it; ADR-038). Details: [`architecture-ai.md`](architecture-ai.md); pricing: [`pricing-policy.md`](pricing-policy.md).

## 8. Publish / codegen
`generateAll(schema)` → `app/<route>.tsx`, `app/layout.tsx`, `tailwind.config.js`, `components/blocks/<Type>.tsx` (+ `_novaStyle.ts`). Free tier commits `project.json` only; Pro generates code. **Published blocks are GENERATED from the live registry** (ADR-027) — `generateSources.mjs` → `sources.ts`, drift-guarded by `sources.test.ts`. The generated `_novaStyle.ts` uses real `cn` (tailwind-merge), so the exported project needs `tailwind-merge` as a dep (TD-023). ⚠️ exported-project build + render not yet browser/deploy-verified.

## 9. Known overlaps / debt (must read before styling work)
- **Three style systems** (Theme tab / visual props / Style panel) overlap; props largely lose to the Style panel. Direction: ADR-028 (Props=content only). TD-019/020.
- **Theme tab** is **export-only** (labeled as such, ADR-029) — tokens write to the exported `tailwind.config.js` but don't restyle the editor canvas yet. Full token binding is a future feature (TD-019).
- Full debt list: `memory/project_nova_technical_debts.md`.

## 10. v2.0 plan & roadmap
> Post-v2.0 releases (numbered, bump-classified, model-assigned) live in the living ledger **[ROADMAP.md](ROADMAP.md)**.

Phases (✅ done · ◐ in progress · ☐ todo):
- **Phase 0 ✅** — docs/process reset (SPEC/ADR/COMPONENTS/VERIFIED + verified-gate).
- **Phase 1 ✅** — publish blocks generated from the registry; `_novaClass`→`classOverrides`+`cn` unified (ADR-027).
- **Phase 2 ✅** — one style system / props = content+semantics (ADR-028). **2a** ✅: removed 1:1 utility-duplicate props from schemas. **2b** ✅: `1.4→1.5` migration moves TextBlock(`fontSize/fontWeight/align`)/Section(`paddingY/paddingX/maxWidth`)/Column(`gap`) values → `classOverrides`; props removed from components; default visual in `defaults.classOverrides`; hex color props kept. (Migration unit-tested; rendered parity → Phase 5 QA.)
- **Phase 3 ✅** — Theme tab labeled export-only (ADR-029); Footer decomposed into child Link nodes (TD-021, migration 1.5→1.6); Row flex primitive added (TD-022).
- **Phase 4 ✅** — debt cleanup: fixed the `cmdGroupNodes` regression (used removed `paddingY`/`displayName`); removed the dead `settings` field + 15 `*.settings.tsx` (TD-013); Navbar/Footer non-responsive padding (TD-015); rewrote stale AI hints (TD-025); confirmed TD-005/011/012 resolved.
- **Phase 5 ☐ — QA gate:** manual browser + exported-build QA. Flip 🟡 rows in `VERIFIED.md` to ✅; resolve TD-018 (zoom overlay), TD-023 (publish `tailwind-merge` dep), TD-024 (exported build), and confirm the editor interactions. **Nothing relies on Pro publish until this passes.**
- Deferred: template marketplace; E2E suite (ADR-015 not built).
- Explicitly **won't**: freeform CSS, real-time collab, two-way `.tsx` import.

## 11. Versioning & process

**Two version numbers:** the **product** version (`v1.4`, this doc's header) and the **`schemaVersion`** in `project.json` (`1.4`). A breaking schema change forces a product **major**.

### Classify the change → which model
Decide by **risk/scope of the change, not lines of code**. A one-line edit that breaks a contract is Major.

| Bump | When | `schemaVersion` signal | Model |
|---|---|---|---|
| **Patch** `x.y.Z` | Bug fix, security, tiny improvement. No new feature, no schema change, fully backward-compatible. | none | **Haiku** |
| **Minor** `x.Y.0` | New feature, backward-compatible. May add **optional** schema fields with an **additive** migration (old data still valid as-is). | additive (e.g. 1.3→1.4 adding optional field) | **Sonnet** |
| **Major** `X.0.0` | Breaking change: removes/renames schema fields, changes a prop/public contract or behavior such that existing data/usage breaks; needs a **transformative** migration that rewrites existing data. | transformative (decomposition, field removal/rename) | **Opus** |

Examples from this codebase: adding optional page `seo` (1.0→1.1) = **Minor**. Decomposing HeroSection title/subtitle into child nodes + removing the props (1.3→1.4) = **Major** (transformative migration). The v2.0 props=content-only refactor (ADR-028) = **Major**. Fixing the `cn` merge bug = **Patch**.

**When unsure, size up** (use the more capable model): the cost of under-classifying a breaking change far exceeds the cost of a larger model. A "patch" that turns out to need design escalates to Sonnet/Opus.

### Definition of done
A feature is "done" only when: typecheck + unit tests pass **and** manually QA'd **and** recorded with a ✅ row in [`VERIFIED.md`](VERIFIED.md). Same-change updates to SPEC/ADR/COMPONENTS are part of the deliverable.
