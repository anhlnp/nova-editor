# Nova Builder — Living Product Spec

> Single source of truth for what **`apps/nova-builder/`** does right now.
> A feature is described here as *working* only after it has a ✅ row in [`VERIFIED.md`](VERIFIED.md).
>
> Legacy spec (`apps/studio` / Craft.js system): [`doc/archive/spec-legacy-studio.md`](archive/spec-legacy-studio.md)
>
> Companion docs: [`ADR.md`](ADR.md) (decisions) · [`COMPONENTS.md`](COMPONENTS.md) (file-by-file reference) · [`VERIFIED.md`](VERIFIED.md) (confirmed working)

**Current version:** v25.3.0 · **Schema version:** `5.0`
**Stack:** Next.js 15 (App Router) · nanostores · @webstudio-is SDK · Supabase · NextAuth v4 · pnpm + Turborepo

> ✅ **WS-PARITY-AUDIT status (v22.0.0):** the three persistence/sync blockers are FIXED — WSA-1 (v20.0.0 M-S1: styles paint), WSA-2 (v21.0.0 M1: transaction sync + undo), audit #7 (v22.0.0 M2: patch autosave + `version` optimistic concurrency; ⚠️ apply migration **0020** to enable the guard — degraded unguarded mode until then). Guards: `e2e/canvas-styles.spec.ts`, `e2e/builder-canvas-sync.spec.ts`, `e2e/save-patch.spec.ts` (DB-env gated). Remaining Tier P work: `doc/ROADMAP.md`.

---

## 1. What nova-builder is

An AI-native no-code web page builder. Users compose pages from Webstudio SDK components on a live
canvas, edit CSS styles directly, ask AI to generate layouts, and share a read-only preview link.
It replaces `apps/studio` (Craft.js-based, deprecated). The strategic moat: **AI layout generation
+ real CSS property editing + Git-owned projects** — not a Tailwind-class vocabulary or a preset
drag-and-drop tool.

---

## 2. Monorepo map

| Path | Purpose | Status |
|------|---------|--------|
| `apps/nova-builder/` | The Next.js 15 app (active system) | ✅ Active |
| ~~`apps/studio/`~~ | Legacy Craft.js app | 🗑️ Removed in v17.0.0 (P75) |
| `packages/ai/` | Multi-provider AI (composerAgentWS, credits, rate-limit) | ✅ Active |
| `packages/ws-*/` | Webstudio SDK packages (19 packages extracted) | ✅ Active |
| `reference/webstudio/packages/*` | Webstudio SDK source reference | 📖 Read-only reference |
| ~~`packages/schema`, `packages/registry`~~ | Legacy Element[] packages — ADR-NB-011 debt closed | 🗑️ Removed in v17.2.0 |
| ~~`packages/editor`, `packages/renderer`~~ | Craft adapter + Element[] codegen | 🗑️ Removed in v17.0.0 (P75) |
| `packages/git/`, `packages/deploy/` | GitHub sync + Vercel deploy | 🔄 Phase 12 (need WS schema update) |
| `supabase/` | Migrations for Nova backend | ✅ Active |

---

## 3. Data model (ADR-NB-001)

`WebstudioData` — normalized Maps stored in Supabase as JSONB (`schemaVersion: "5.0"`):

```
$instances         Map<InstanceId, Instance>           — element tree (id + component + children refs)
$props             Map<PropId, Prop>                   — typed props per instance
$styles            Map<StyleDeclKey, StyleDecl>        — CSS property declarations
$styleSources      Map<StyleSourceId, StyleSource>     — local / token style sources
$styleSourceSelections Map<InstanceId, StyleSourceSelection>
$breakpoints       Map<BreakpointId, Breakpoint>       — responsive breakpoints
$pages             Map<PageId, Page>                   — pages (each has rootInstanceId)
$assets            Map<AssetId, Asset>                 — uploaded assets (Phase 12)
```

All state derives from these atoms. **Autosave (v22.0.0, M2)** = immerhin transaction patches drained every 1s to `POST /api/projects/[id]/patch` under `version` optimistic concurrency (409 → conflict UI; migration 0020 required, degraded unguarded mode until applied). Manual save = full-document `PATCH /api/projects/[id]` (also version-guarded; carries the envelope: cssVars/interactions/customCss/symbols). Load = `GET /api/projects/[id]` → `deserializeWebstudioData()` → seed all atoms + `$docVersion`.

---

## 4. Builder surface

```
┌──────────────────────────────────────────────────────┐
│  Topbar (44px): ← | project name | breakpoints | AI | Share | Save  │
├────────────┬───────────────────────────┬─────────────┤
│            │                           │             │
│ Left       │  Canvas (main)            │ Right       │
│ Sidebar    │  <iframe src="/canvas">   │ Inspector   │
│ 220px      │  centered, breakpoint-    │ 280px       │
│            │  width constrained        │ Style|Settings │
│            │                           │             │
├────────────┴───────────────────────────┴─────────────┤
│  Footer (36px): ↩ ↪ | breadcrumb ancestors           │
└──────────────────────────────────────────────────────┘
```

### Left sidebar tabs
| Tab | Panel | Default |
|-----|-------|---------|
| Components | Webstudio SDK components by category; click inserts | closed |
| Pages | Folder-tree + CRUD (create/rename/delete pages and folders); SEO fields (browser title, meta description, noindex) per active page | closed |
| Navigator | Instance tree with expand/collapse, context menu, cross-parent DnD, keyboard navigation | **open** |
| Assets | Upload images/fonts; 3-col thumbnail grid; insert into Image instance | closed |

### Canvas right-click context menu
- Right-click any canvas element → `nova:contextMenu` postMessage → builder renders portal menu at cursor position
- Items: Copy / Cut / Paste (when clipboard non-empty) / Duplicate / Wrap in Box / Select parent / Delete
- Position adjusted for iframe offset and canvas zoom; clamped to viewport edges
- Dismiss on Escape or click-outside; closes after any action

### Command palette (⌘K)
- Floating modal, position: fixed, z-index 9999; backdrop closes on click-outside; Escape closes
- Three groups: **Pages** (navigate), **Components** (insert), **Actions** (duplicate/delete/wrap/undo/redo/open AI)
- Type-to-filter (each word in query must match label/keywords); ↑/↓/Enter keyboard navigation
- Active item auto-scrolls into view; mouseEnter syncs keyboard highlight; shortcut hints displayed on action rows

### Canvas (iframe at `/canvas`)
- Loaded as a same-origin `<iframe>` — **no auth redirect** (ADR-NB-003)
- Data flows via `__webstudioSharedSyncEmitter__` (builder = leader, canvas = follower)
- Click → sets `$selectedInstanceSelector`; hover → `$hoveredInstanceSelector`
- Selected element: solid purple 2px outline (`[data-ws-selected]`)
- Hovered element (non-selected): dashed purple 1px outline (`[data-ws-hovered]`)
- Breakpoint width: `iframe.style.width = breakpoint.maxWidth ? "Npx" : "100%"`
- **Inline text editing**: double-click a text-only instance (Heading/Paragraph/Button) → `contentEditable = "true"`, blue outline; Enter commits; Escape cancels; blur commits; canvas postMessages `nova:textCommit` → builder updates `$instances`
- **Zoom**: `$canvasZoom atom<number>(1)` — builder-side only; `transform: scale(zoom)` on the wrapper div around the iframe; `transform-origin: top center`; Ctrl+scroll / pinch to zoom; Ctrl+0 = 100%; Ctrl+Shift+1 = fit breakpoint to container width; Topbar shows zoom % with −/+ buttons; canvas interactivity unchanged (selection via DOM traversal, not screen coords)

### Right inspector
- **Style tab**: `StyleInspector` — 8 collapsible sections; editable `StyleValueEditor` per value type (unit / color / keyword); `AddPropertyRow` at bottom for new properties (hidden in multi-select mode); CSS state selector (7 pseudo-state pills); multi-select intersection view when 2+ selected; **Transform panel** always visible with 4 sub-rows (Translate/Rotate/Scale/Skew) — "+" to activate with defaults or "×" to remove; numeric X/Y/Z inputs per axis; writes a single `transform` CSS property; **shadow panels** (Box Shadow + Text Shadow) each with per-layer editor (X/Y/Blur/Spread/Color/Inset) and "+" add button; **Transition panel** with multi-layer editor (property/duration ms/delay ms/easing) and property datalist; **Animation panel** with multi-layer editor (name/duration ms/delay ms/repeat/easing/direction/fill-mode) and datalist of 12 preset @keyframes names (fadeIn, slideInLeft, spin, bounce, etc.) injected into the canvas style block; **Filter panel** and **Backdrop Filter panel** each with multi-function editor — 10 filter functions (blur/brightness/contrast/grayscale/hue-rotate/invert/opacity/saturate/sepia/drop-shadow) with per-function numeric inputs; drop-shadow shows X/Y/Blur/Color sub-fields; functions space-joined into CSS string
- **Settings tab**: `SettingsPanel` — editable prop rows per instance

### Multi-select
- Hold **Ctrl/Cmd** or **Shift** and click Navigator rows to add/remove instances from multi-selection
- `$multiSelectedInstanceIds: atom<string[]>` tracks the full set; empty = single-select mode
- Purple tint highlights multi-selected Navigator rows (distinct from primary selection blue)
- Footer shows "N selected — Ctrl+D duplicate · Del delete" badge in place of breadcrumb
- StyleInspector shows **intersection** of properties (only properties ALL selected instances share); edits write to **all** selected instances simultaneously
- **Delete**: removes all selected instances (skips descendants of selected ancestors)
- **Ctrl+D**: duplicates all selected instances (skips descendants of selected ancestors); new clones become the new multi-selection

### Footer
Breadcrumb of ancestor chain → click to select ancestor. ↩/↪ undo/redo buttons (reactive to `$canUndo`/`$canRedo`).

---

## 5. Key user flows

### Open a project
1. Login → `/projects` (auth guard, redirect if no session)
2. Click project card → navigates to `/builder/[projectId]`
3. Builder fetches `GET /api/projects/[id]` → seeds atoms → creates SyncClient leader → renders iframe
4. Canvas creates SyncClient follower → reads atom snapshot → renders instance tree

### Edit a style
1. Click element in canvas → `$selectedInstanceSelector` set → StyleInspector populates
2. Click a value in StyleInspector → `StyleValueEditor` renders (inline edit)
3. Change value → `writeStyle()` calls `captureSnapshot()` then mutates `$styles` Map
4. `$styles` change propagates via SyncClient to canvas → re-renders immediately

### Undo / Redo (ADR-NB-019, since v21.0.0)
- Every mutation runs inside `updateData()` (`lib/transactions.ts`) — an immerhin transaction over all ten data atoms; the transaction also syncs the change to the canvas follower
- Ctrl+Z / ↩ → `undo()` reverts the last transaction (all atoms it touched) and broadcasts the revert to the canvas
- Ctrl+Shift+Z / Ctrl+Y / ↪ → `redo()` re-applies it; `$canUndo`/`$canRedo` reflect the immerhin stacks

### AI generation
1. Topbar "AI" → `$aiPanelOpen.set(true)` → `AIPanel.tsx` renders
2. Type prompt → `POST /api/ai` `{ userMessage, projectId }`
3. API calls `composerAgentWS` → returns `WSCompositionResult`
4. `validateCompositionWS(result)` passes → deduct 1 credit (ADR-NB-005)
5. Click "Apply" → `applyWSComposition(result.composition)` merges instances/props/styles into atoms → canvas re-renders

### Share / Preview
- Topbar "Share ↗" → copies `/preview/[projectId]` to clipboard
- `/preview/[projectId]` — public route (no auth); seeds atoms; renders canvas iframe; no builder chrome

---

## 6. Tiers & billing

Unchanged from legacy system. `packages/ai/src/providers/registry.ts` — 6 providers.
Credit model: monthly bucket + prepaid top-up (ADR-038). Daily soft-cap per tier.
Credit deduction after `validateCompositionWS` pass only (ADR-NB-005).

---

## 7. Security invariants

| Rule | Reason |
|------|--------|
| `/canvas` is public — no auth redirect | iframe loads without session cookie; data via emitter only (ADR-NB-003) |
| AI credit deducted only after valid composition | ADR-NB-005; failed calls cost 0 |
| GitHub is opt-in — never force auth/save/push | user owns their repo |
| No credits if `validateCompositionWS` returns false | same as above |
| Owner-scoped `[projectId]` routes verify `ownsProject` → 404 for non-owners | ADR-NB-015; closes IDOR (FA-008/009) |
| Paid features (deploy, code export, maxProjects) gate on `entitlements(tier)` → 402 | ADR-NB-015; free tier cannot bypass (FA-001/002/004) |
| Payment webhooks idempotent — PayOS `orderCode` claimed once in `processed_payments` | ADR-NB-015; replay cannot re-grant credits (FA-003) |
| Public POSTs (`/api/submissions`, `/api/analytics/track`) rate-limited before DB work | FA-010/011; blunts email-bomb + analytics pollution |

---

## 8. Quality gates (as of v18.8.0 / FA-v1 R2)

- Unit tests: `pnpm test` — 16/16 turbo tasks green (ws-* package suites + studio packages)
- E2E: `pnpm test:e2e` — 22 passed / 2 skipped (save + two-account tenant-isolation need `E2E_*` creds); per-test timeout 90s + `retries: 1` (heavy `/builder/demo` cold compile)
- Deploy bundle: `pnpm --filter @nova/builder build:cf` (OpenNext/Cloudflare) MUST pass before push — `next build` alone does not catch Workers-Build failures (CLAUDE.md Step 4)
- Root `vitest.config.ts` supplies the `webstudio` exports condition for ws-* package tests (ADR-NB-014); `css-tree` pinned exactly to 3.1.0 in `ws-css-data`
- `pnpm solid:audit` — 0 blocking; 3 WARNs filed as Phase 77 (ROADMAP Tier 11)

## 9. Upcoming — Tier P (Webstudio parity migration)

Canonical plan: [`doc/ROADMAP.md`](ROADMAP.md) **Tier P**, derived from [`doc/WS-PARITY-AUDIT.md`](WS-PARITY-AUDIT.md) (158 code-verified rows vs webstudio `65d8a16`). First up:

| Phase | Feature | Bump |
|-------|---------|------|
| ~~M-S1~~ | ✅ Shipped v20.0.0 — canvas style rendering (`canvas/styles.ts`, 5 sheets, @media/states/cascade/presets/fonts) | Major |
| ~~M0~~ | ✅ Shipped v20.0.1 — ws-* drift accounted; `packages/WS-UPSTREAM.md` pins upstream | Patch |
| ~~MV1/MV2~~ | ✅ Shipped v20.1.0/v20.2.0 — broken-layout register V-1…V-8 all resolved; `builder/controls/` shared set; solid-audit V1 palette check (backlog → MV3) | Minor |
| ~~M1~~ | ✅ Shipped v21.0.0 — updateData transactions (25 modules), transaction undo, command registry | Major |
| ~~M2~~ | ✅ Shipped v22.0.0 — patch autosave + version concurrency + sync-status chip (apply migration 0020) | Major |
| ~~M3+M6+M7b~~ | ✅ Shipped v22.2.1 — style-object-model token specificity isolation, Lexical rich-text link & underline commit parity, canvas shift-click & retry interaction parity | Minor/Patch |
| ~~M8+M8b+MV3~~ | ✅ Shipped v22.3.0–v22.5.0 — semantic theme tokens (UI_VARS/ThemeProvider/data-theme), assets/fonts pipeline, pages advanced (path params/redirects/SEO/Cloudflare export) | Minor |
| ~~M10~~ | ✅ Shipped v22.6.0 — content mode (3-pill), grid guides overlay (canvas postMessage), CSS preview panel, safe-mode banner, animation schema extension | Minor |
| ~~M13~~ | ✅ Shipped v22.6.1 — dashboard search filter, clone project API + button, notification center stub, style token share/copy | Minor |
| ~~M4~~ | ✅ Shipped v23.0.0 — data binding core: canvas evaluates encoded `expression`/`parameter` props against `$dataSources`; BindingPopover + ExpressionEditor + usage tracking (ADR-NB-021) | Major |
| ~~M5~~ | ✅ Shipped v23.1.0 — resources runtime (server loader + `$resourceValues`), Collection item scope (RepeatList + `ItemScopeContext`), Slot, content-model nesting guards on DnD/paste/AI-apply (ADR-NB-022) | Minor |
| ~~M7~~ | ✅ Shipped v23.2.0 — system clipboard copy/paste, fragment JSON + HTML paste parser, Tailwind class→CSS parser | Minor |
| ~~M9~~ | ✅ Shipped v24.0.0 — publish pipeline: headless css-engine codegen (media/state/cascade), expression resolution, multi-page export; deploy targets + domains CNAME (pre-existing) as delivery layer (ADR-NB-023, fixes audit #6) | Major |
| ~~M11~~ | ✅ Shipped v24.1.0 — protocol bundle (NovaBundle=WebstudioFragment) import/export + community marketplace (publish/browse/install); migration 0021 (ADR-NB-024) | Minor |
| ~~M12~~ | ✅ Shipped v25.0.0 — realtime co-editing: immerhin transaction patches over Supabase Realtime + remote selection outlines (ADR-NB-025; no Yjs, no relay) | Major |

**Tier P (Webstudio-parity migration) COMPLETE** as of v25.0.0 — all phases M-S1, M0–M13 shipped (🟡 pending human browser QA). Remaining work is the QA pass to flip 🟡 → ✅.
