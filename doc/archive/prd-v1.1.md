# Nova Editor — PRD v1.1 (Editor GA + Template Foundation)

**Version:** 1.1 (delta spec — builds on v1.0)
**Status:** **Feature-complete** (pending the user's browser QA). `pnpm turbo typecheck test --force` → **15/15 tasks, 247 unit tests**. All workstreams done except **W2 Playwright/E2E, deferred to v1.2** by decision. W1 (best-in-class editor): W1.1–W1.9 implemented; W1.10 perf is light-touch. See §1.5 for the Craft.js evaluation.

**Build/runtime fixes found during manual QA:**
- **ESM resolution:** workspace packages use `.js` import specifiers → `.ts` sources; Next.js webpack strict ESM can't resolve them at runtime. Fixed in `next.config.mjs` via `webpack.resolve.extensionAlias`. Without it, any route importing a workspace pkg 500s.
- **Auth provisioning:** `getOrProvisionUser` pattern added — self-heals sessions where the Supabase row was missing. All token routes updated. `SignOutButton` added to `/projects`. Editor logo links to `/projects`.
- **DB setup:** `/api/setup-check` dev-only diagnostic endpoint added — checks env vars, DB connectivity, table/RPC existence. `supabase/migrations/0001_init.sql` must be run manually in Supabase SQL Editor.
- **Craft ROOT deserialization crash (editor load):** `schemaToNodes` set ROOT's `type.resolvedName = "div"` — not registered in the Craft resolver → `TypeError: Cannot destructure property 'type' of undefined` on editor open. Fixed: `NovaRootCanvas` component (a proper Craft canvas root, `isCanvas: true`) created, registered in `CraftProvider`'s resolver, `schemaToNodes` updated to use `resolvedName: "NovaRootCanvas"`.
- ✅ **W1.1** `operations/` (pure ops, 32 tests) · ✅ **W1.5** `editorCommands` (delete/duplicate/copy/cut/paste/move, 12 tests) wired to keyboard + RightPanel toolbar.
- ✅ **W1.2 (wired live)** `buildEditorResolver(registry)` of `useNode`-wrapped components now drives the Canvas `<Frame>`; wrapper connects the child's real DOM (`firstElementChild`) so selection/indicator can measure it. `nodesToSchema` deterministically maps Craft ids → `node_<8>` (adapter round-trip tests). → components are now draggable/selectable on the canvas.
- ✅ **W1.3** `RenderNode` overlay via `<Editor onRender>` — hover/selection outline (`.component-selected`) + floating toolbar (move handle / select-parent / delete); Canvas exposes `.nova-canvas-scroll` + `.nova-canvas-page`.
- ✅ **W1.4** drop indicator styled via `<Editor indicator>` (Craft's `<Events>` draws it); Blocks panel drag-to-create already wired.
- ✅ **W1.6** right-click **context menu** (`ContextMenu` + `uiStore.contextMenu`): duplicate/copy/cut/paste/move-up/down/select-parent/delete — dispatches the tested W1.5 commands.
- ✅ **W1.7** **Navigator v2** (LayersPanel): selection highlight + two-way sync, type icons, hide toggle (`actions.setHidden`), per-row reorder (`actions.move`), indentation.
- ✅ **W1.8** **Responsive preview**: TopBar viewport switcher (desktop 1280 / tablet 768 / mobile 375) + zoom (25–100%); Canvas binds page width + scale.
- ✅ **W1.9** canvas **breadcrumb** (ancestry, click-to-select) + empty-page state.
- ✅ **W5 (complete)** Vercel deploy settings UI: `POST /api/project/[id]/vercel` (encrypts token via `lib/crypto`, `setVercelConfig`) + TopBar gear → `VercelSettings` modal.
- *(All canvas interactions are wired against the Craft reference patterns; pending the user's browser QA. Automated E2E = W2, moved to v1.2.)*
- ✅ **W4** SEO: `PageSchema.seo`, first real migration **1.0→1.1** (additive `seo`, step-wise runner), default factory emits 1.1, renderer emits Next.js `metadata` (4 tests). *Remaining: SEO inputs in the page-settings UI.*
- ✅ **W6 foundation** Templates: `TemplateSchema` (discriminated union) + `templateFromPage/Project` constructors (schema, 7 tests) + `applyTemplate` re-minting `node_<8>`/`page_<6>` ids & version-migrating (editor, 6 tests). *Remaining: git/Supabase storage + "Save as / Apply template" UI.*
- ✅ **W3** Multi-page management: pure page ops (create/add/rename/setRoute/setSeo/delete(≥1 guard)/move/duplicate + route validation, 17 tests) → `projectStore` (`commit` helper: history + draft + active-page) → **Pages panel** (new tab: switch/add/rename/edit-route/reorder/duplicate/delete) with collision validation.
- ✅ **W4 (complete)** SEO inputs added to the Pages-panel edit form (title/description/ogImage) via `setPageSeo`.
- ✅ **W5** `packages/deploy` — `triggerVercelDeploy` (never-throws, 4 tests) + `lib/crypto.ts` (AES-256-GCM) + wired into the Pro publish path (decrypts `vercel_token_enc`, returns `deployUrl`).
- ✅ **W6 (complete)** Template storage + UI: `packages/git` `listTemplates`/`readTemplate`/`saveTemplate` in `/.nova/templates/*.json` (6 tests) + API routes `GET/POST /api/project/[id]/templates` and `GET …/[slug]` (TemplateSchema-validated) + Pages-panel **Templates** section ("Save current page as template" / "Apply").
- ✅ **W7** IP rate-limit Edge middleware (`src/middleware.ts`) on `/api/ai` (per-IP/min ceiling; the durable per-user limit stays in the route). Sentry left as a documented env-only hook (`SENTRY_DSN`).
- **Remaining for v1.1 sign-off:** user browser QA of the canvas interactions; W1.10 perf pass if a 200+-node page feels slow. **W2 Playwright/E2E → v1.2.**
- **QA UX fixes (applied during QA):** drag-source crash (BlocksPanel used raw component refs, resolver uses wrapped refs — fixed via `editorResolver` export); floating toolbar grip icon (✛ → 6-dot grip); toolbar clamped to canvas bounds (no longer overlaps side panels); CopyIcon ≠ DuplicateIcon (clipboard vs double-rect SVG); zoom % is now a click-to-edit input + dedicated reset icon (↺); publish message per-tier (Free = "schema saved to GitHub"; Pro no Vercel = "tsx committed, set up Vercel"; Pro+Vercel = deploy URL confirmation); auth `pages` + `session.maxAge: 30d` added to prevent redirect to NextAuth default pages on token expiry.

**Base:** Read [`prd.md`](prd.md) first — especially **§0 Implementation Status** and the ADR log (§3). This document specifies only what changes or is added in v1.1. Anything not mentioned here is unchanged from v1.0.
**Language:** English

> **Theme — Best-in-class visual editor.** v1.1's headline is a visual editor whose *interaction quality matches or beats* Craft.js's reference editor and Webstudio — direct-manipulation canvas (drag, drop with live indicators, click/hover/multi-select, reorder across containers), a real navigator tree, keyboard + context-menu commands, copy/paste/duplicate, and responsive preview — **while keeping Nova's moat**: AI-native schema patching, a clean component/props model (no CSS-soup output), and full code ownership. Around that we finish the deferred v1.0 items (SEO, Vercel deploy), add automated E2E, and lay the **template artifact** that v2.0's marketplace builds on.
>
> **What "beyond Webstudio" means for Nova (explicit):** we do **not** become a freeform CSS editor (that abandons clean, owned component output — see ADR-018). We win on (1) interaction parity, (2) AI as a first-class editing surface, (3) clean React/Next.js export, (4) GitHub ownership. Webstudio/Framer have none of (2)–(4) together.

---

## 0. Scope

**W1 — Best-in-class visual editor (the headline)** is broken into sub-workstreams:

| ID | Sub-workstream | Priority |
|----|----------------|----------|
| W1.1 | **Editor operations library** — pure, browser-free schema ops (clone-with-new-ids, insert/move/remove/duplicate, copy buffer); the testable core | Must |
| W1.2 | **Craft integration foundation** — `useNode` wrapper HOC + node-ID override (`node_<8>`) + resolver; lossless round-trip | Must |
| W1.3 | **Selection & hover system** — selection outline + type badge, hover highlight, click-select, multi-select, Esc/select-parent | Must |
| W1.4 | **Drag & drop UX** — drag from Blocks panel, **live insertion indicators**, reorder within/across containers, `canMoveIn` enforcement | Must |
| W1.5 | **Keyboard + command system** — Delete, Cmd+D duplicate, Cmd+C/X/V, arrow/Tab tree nav (commands dispatch W1.1 ops) | Must |
| W1.6 | **Context menu** — right-click: duplicate / copy / paste / delete / move up·down / wrap / select-parent | Should |
| W1.7 | **Navigator (layers) tree v2** — drag-reorder, rename, hide/lock, collapse, two-way selection sync, type icons | Must |
| W1.8 | **Responsive preview** — viewport switcher (desktop/tablet/mobile) + zoom/fit (no schema change; components already responsive) | Should |
| W1.9 | **Canvas chrome** — ancestry breadcrumb, zoom controls, empty-state, grid backdrop | Should |
| W1.10 | **Performance** — memoized node render, avoid full-tree re-serialize per change | Should |

**Other workstreams:**

| Priority | Item | Workstream |
|----------|------|------------|
| **Must** | E2E test suite (Playwright) + CI gate — incl. editor interaction specs | W2 |
| **Must** | Multi-page management UI (create/rename/delete/reorder/route) | W3 |
| **Should** | SEO metadata fields + first schema migration `1.0 → 1.1` | W4 |
| **Should** | `packages/deploy` — Vercel deploy trigger (Pro) | W5 |
| **Should** | Template foundation — `Template` schema + personal/team save/apply (reuses W1.1 clone machinery) | W6 |
| **Should** | Production hardening — IP rate limit (Edge) + Sentry | W7 |
| **Defer (v1.2)** | Image upload (storage infra) | — |
| **Defer (v1.2)** | Bounded per-breakpoint **style tokens** (NOT freeform CSS — see ADR-018) | — |
| **Defer (v1.2)** | Block-library expansion (forms, FAQ, testimonials, gallery, stats) | — |
| **Won't (v2.0+)** | Template marketplace: discovery, monetization, commission | — |
| **Won't** | Freeform CSS editing, real-time collaboration, two-way sync, custom user components | — |

> Responsive **preview** moved from Defer → W1.8 (it's a viewport resize, cheap, and core to "best-in-class"). Per-breakpoint **style editing** stays deferred (ADR-018).

**Exit criteria for v1.1:** a user can drag blocks onto the canvas with live drop indicators, click/hover/multi-select, reorder across containers, duplicate/copy/paste via keyboard and context menu, manage layers in a real navigator tree, preview at mobile/tablet/desktop, manage multiple pages, set SEO, export `.tsx`, optionally trigger a Vercel deploy, and save/reuse a template — with the editor-operations library fully unit-tested and the critical path covered by a green Playwright E2E run in CI.

### 0.1 Competitive parity target

| Capability | Craft.js (demo) | Webstudio | Framer | **Nova v1.1 target** |
|------------|:--:|:--:|:--:|:--:|
| Drag/drop with live insertion indicators | ◑ | ✅ | ✅ | ✅ (W1.4) |
| Click / hover / multi-select | ◑ | ✅ | ✅ | ✅ (W1.3) |
| Navigator/outline tree (drag-reorder, rename, hide/lock) | ◑ | ✅ | ✅ | ✅ (W1.7) |
| Keyboard + context-menu commands, copy/paste/duplicate | ◑ | ✅ | ✅ | ✅ (W1.5/W1.6) |
| Responsive preview | ✗ | ✅ | ✅ | ✅ (W1.8) |
| Freeform CSS / per-breakpoint styles | ✗ | ✅ | ✅ | **Deliberately out** (ADR-018) |
| **AI-native schema editing** | ✗ | ✗ | ◑ | ✅ (v1.0) |
| **Clean owned React/Next.js export** | ✗ | ◑ | ✗ | ✅ (v1.0) |
| **Git ownership (your repo)** | ✗ | ✗ | ✗ | ✅ (v1.0) |

◑ = partial / DIY. Nova's edge is the bottom three rows; v1.1 closes the top five.

---

## 1. New Architecture Decisions (v1.1)

These extend the v1.0 ADR log (prd.md §3). They do not override existing ADRs unless stated.

### ADR-012: Canvas editing via `useNode` wrappers + ID override (defer the Craft.js fork)

**Decision:** Keep `@craftjs/core` as an npm dependency. In `packages/editor`, wrap each registry component in a thin Craft-aware component that calls `useNode()` to connect drag/select, and **override Craft's node-ID generation** so newly created nodes get `node_<nanoid(8)>` IDs (ADR-005 format). Build the Craft `resolver` from these wrappers.

**Why not fork (yet):** A full fork (ADR-004's original intent) is heavier and higher-maintenance. The two things the fork was for — intercepting `onChange` and controlling IDs — are both achievable without forking: `onChange` is already handled via `onNodesChange` (v1.0 audit fix), and IDs can be controlled at node-creation time. Fork only if we hit a concrete wall (re-evaluate at v1.2). This **partially supersedes ADR-004** for v1.1.

**Consequence:** Registry components stay pure React (no `useNode` inside them) so they remain export-safe for `packages/renderer`. The Craft-awareness lives only in the editor's wrapper layer. Every node that appears in the schema has a valid `node_<8>` ID, so `ProjectSchema.parse()` holds across drag-to-add → AI → publish.

**Acceptance:** drop a block from the Blocks panel → it appears on canvas, is selectable, has a `node_<8>` id, and survives a round-trip through `nodesToSchema` → `ProjectSchema.parse()`.

### ADR-013: First schema migration — `schemaVersion` `"1.0" → "1.1"` (additive)

**Decision:** v1.1 introduces page-level SEO fields (W4). This is the first real migration. It is **additive and backward-compatible**: a `"1.0"` document is migrated by adding default (empty) SEO objects; a `"1.1"` document is unchanged. `schemaVersion` becomes `"1.1"`.

**Why:** Validates the migration runner that has existed since v1.0 with zero migrations. Establishes the pattern: every breaking-or-additive schema change ships a migration entry + tests.

**Consequence:** `packages/schema/src/migrations/` gains its first real migration `1.0→1.1` and tests. `readProject()` already runs `migrateToLatest()`, so existing repos upgrade transparently on next open.

### ADR-014: `Template` is a schema-versioned, self-contained artifact (personal/team in v1.1; marketplace in v2.0)

**Decision:** A **Template** is `{ meta, schemaVersion, scope: "page" | "project", payload }` where `payload` is either a single `Page` (with its element tree) or a whole `Project`, plus template `meta` (`name`, `description`, `tags[]`, `thumbnailUrl?`, `author`, `createdAt`). Templates are validated by a new `TemplateSchema` in `packages/schema` and are migration-aware (a template made on `1.0` upgrades on apply).

**v1.1 surface (personal/team only):** "Save current page/project as template" and "Apply template." Storage is **the user's own GitHub repo** (`/.nova/templates/*.json`) and/or a `templates` table in Supabase keyed by user — **no public listing, no pricing, no commission.**

**Why:** This is the atomic unit the v2.0 marketplace will trade. Proving import/export + apply + migration now means v2.0 adds only discovery, payments, and commission on top of a stable artifact.

**Consequence:** `apply template` must **re-mint all element/page IDs** (`node_<8>` / `page_<6>`) to avoid collisions with the target project, and re-validate. Applying a `project`-scope template into an existing project is "replace pages" or "append pages" (user choice).

### ADR-015: E2E is required for `apps/studio` + `packages/editor`, gated in CI

**Decision:** Adopt **Playwright** for end-to-end coverage of the critical path. Mock external services (GitHub, AI providers, Supabase) at the network boundary so E2E is deterministic and runs in CI without real credentials. This **supersedes the v1.0 §15 stance** ("E2E too slow; manual QA") for the critical path.

**Why:** The v1.0 audit found real bugs (canvas crash, draft-key mismatch, app tsconfig silently broken) that unit tests passed straight through. E2E is the missing safety net before the editor is GA.

**Consequence:** New `apps/studio/e2e/` suite; CI runs unit + typecheck + E2E. The §15 table is updated: `packages/editor` and `apps/studio` move from "❌ skip" to "✅ E2E (critical path)".

### ADR-016: Editor commands are pure schema operations (logic ≠ Craft, ≠ browser)

**Decision:** Every structural edit (insert, move, remove, duplicate, copy/paste, wrap) is implemented as a **pure function over `Element[]` / `Project`** in `packages/editor/src/operations/`, with no Craft.js or DOM dependency. The UI (canvas, context menu, keyboard, navigator) only *dispatches* these operations; Craft is then re-synced from the resulting schema via the existing `applySchemaToCanvas` path.

**Why:** The v1.0 audit's core lesson — browser-coupled editor logic is unverifiable and bug-prone. Pure operations are **100% unit-testable without a browser**, are reused by AI/templates/copy-paste alike, and keep the schema (ADR-001) authoritative. This is the single most important decision for making the editor *reliably* best-in-class.

**Consequence:** Craft becomes a thin presentation/interaction layer; correctness lives in tested operations. Drag-reorder in the canvas and navigator both resolve to a `moveNode` op.

### ADR-017: Selection/hover/DnD chrome is a Craft `onRender` overlay

**Decision:** Selection outlines, hover highlights, the type badge, drag handles, and drop indicators are injected by a custom Craft **`onRender`** component (the per-node render wrapper) — *this* is what `onRender` is actually for (the v1.0 bug was wiring a change handler there; the change handler is `onNodesChange`).

**Consequence:** `packages/editor` gains a `RenderNode` overlay component. It reads selection/hover from Craft events and renders absolutely-positioned chrome over each node's DOM box.

### ADR-018: Style model stays component/props-based — NO freeform CSS editor

**Decision:** Nova does **not** add a freeform CSS or per-breakpoint style-override editor in v1.x. Styling remains (a) responsive behavior baked into each registry component (Tailwind, ADR per registry), and (b) a curated, JSON-serializable set of style *props* per block (ADR-010). v1.1 adds **responsive preview** (viewport resize) but not responsive *editing*.

**Why:** Freeform CSS is Webstudio/Framer's model and it directly conflicts with Nova's thesis — clean, owned, component-based React output and AI-patchable schema. Arbitrary CSS would (1) bloat the schema with non-portable style trees, (2) make AI patching and clean export far harder, (3) erase the "you own readable components" differentiator. "Beyond Webstudio" for Nova = interaction parity + AI + ownership, **not** CSS-editor parity.

**Consequence:** If demand proves out, a **bounded** per-breakpoint *style-token* layer (a fixed vocabulary, still JSON-serializable) is the v1.2+ path — never raw CSS. Documented as deferred, not rejected.

### ADR-019: Clone/copy/paste/template-apply share one ID-re-minting routine

**Decision:** A single `cloneSubtreeWithNewIds(elements)` in `packages/editor/src/operations/` is the canonical way to duplicate any element subtree with fresh `node_<8>` IDs. Duplicate (W1.5), copy/paste (W1.5), and `applyTemplate` (W6, ADR-014) all use it.

**Consequence:** ID-collision safety is implemented and tested once. Template apply for `project` scope additionally re-mints `page_<6>` IDs via a sibling `clonePagesWithNewIds`.

---

## 1.5 Craft.js strategic evaluation (read-only source @ `reference/craft.js`)

Reviewed the upstream source to de-risk the editor build and the eventual fork decision. Findings:

- **`onRender` is the official extension point** for per-node chrome: `<Editor onRender={RenderNode}>` wraps every node; the reference `RenderNode` toggles a `.component-selected` class on `node.dom` and portals a floating toolbar at the node's rect. We adopted this verbatim (Tailwind-ized) for **W1.3**. → ADR-017 confirmed.
- **DnD + the drop indicator are free.** `<Editor>` renders `<Events>{children}</Events>` internally; once nodes are connected (`connect`/`drag`/`create`), Craft draws the drop indicator itself (`events/RenderEditorIndicator`). So **W1.4** is mostly "connect components + style the indicator", not "build DnD".
- **`node.dom` must be a real boxed element.** The reference connects each component's own root. Our pure-component wrapper therefore connects the child's `firstElementChild` (wrapper stays `display:contents`) — otherwise the overlay/indicator can't measure a `display:contents` box. Fixed in `makeCraftComponent`.
- **De-risks the ID problem AND the fork (big):** `packages/core/src/utils/createNode.ts` does `let id = newNode.id || getRandomNodeId()` — **Craft honors a supplied node id**, and `getRandomId` is `nanoid(10)` over `[A-Za-z0-9_-]`. So (a) for v1.1 we deterministically map a Craft id → `node_<8>` in `nodesToSchema` (stable; once it round-trips through `schemaToNodes` the node adopts the conforming id), and (b) a future fork only needs to swap `getRandomNodeId` to mint `node_…` directly — trivial. **This materially lowers the cost/risk of the v1.2 fork (ADR-012 re-eval).**
- **`@craftjs/layers`** exists upstream (a ready navigator/outline tree). Option for **W1.7** instead of hand-rolling — evaluate before building the navigator v2.

**Conclusion:** the stock dependency + `onRender` + connect-real-DOM is sufficient for all of v1.1's editor scope; **no fork needed now**. Keep ADR-012 (fork deferred to v1.2, now low-risk).

---

## 2. Workstreams

### W1 — Best-in-class visual editor *(Must)*

Closes v1.0 known limitations ①/② (prd.md §0) and raises the bar to Craft.js/Webstudio interaction parity. Built bottom-up so the verifiable core lands first.

> **Verification reality:** structural correctness (W1.1) and integration types (W1.2) are unit-/type-checkable here. The *interaction polish* (W1.3–W1.9) is browser-visual and must be confirmed by Playwright E2E (W2) + manual QA — the PRD calls out which is which.

#### W1.1 — Editor operations library *(Must — testable core; ADR-016/019)*
`packages/editor/src/operations/` — pure functions over `Element[]`/`Project`, no Craft/DOM:
- `cloneSubtreeWithNewIds(el)` / `cloneElementsWithNewIds(els)` — deep copy, fresh `node_<8>` IDs at every depth (ADR-019).
- `findNode(els, id)`, `findParentId(els, id)`, `getAncestors(els, id)` (for breadcrumb), `flattenTree`.
- `insertNode(els, node, parentId|null, index)`, `removeNode(els, id)`, `moveNode(els, id, newParentId, index)`, `duplicateNode(els, id)` (clone + insert after original).
- `canDrop(els, dragId, targetId, registry)` — enforces `craftConfig.rules.canMoveIn` and prevents dropping a node into its own descendant.
- `wrapInContainer(els, id, containerType)`.
- A clipboard helper: `serializeForClipboard(node)` / `pasteFromClipboard(els, json, targetId)` (paste re-mints IDs).
- **Unit tests** for every function incl. edge cases (root-level ops, deep nesting, illegal drops, id uniqueness after clone).

#### W1.2 — Craft integration foundation *(Must; ADR-012)*
- `makeCraftComponent(Comp, craftConfig)` HOC: connects `useNode().connectors.connect(drag(ref))`, forwards `{children}`, carries `displayName` + `rules`. Registry components stay pure (export-safe).
- `buildEditorResolver()` builds the Craft resolver from **wrapped** components keyed by registry name (so node `name`/`resolvedName` === schema `type`).
- **Node-ID override** so every node Craft creates (Blocks-panel drop, paste, duplicate) gets `node_<8>` — keeps `ProjectSchema.parse()` valid through drag→AI→publish. Verified by the round-trip test from v1.0 plus new drop-path tests.

#### W1.3 — Selection & hover *(Must; ADR-017)*
`RenderNode` overlay (Craft `onRender`): selection outline + type-name badge + quick actions (delete, duplicate, drag-handle, select-parent ▲); hover highlight; click-to-select; **multi-select** (Shift/Cmd-click) tracked in `uiStore`; Esc clears.

#### W1.4 — Drag & drop UX *(Must)*
Drag from Blocks panel onto canvas; **live insertion indicator** (drop line/box) computed from pointer position; reorder within and across containers; `canDrop` (W1.1) enforced live (reject + cursor feedback); drag ghost/preview. All drops resolve to W1.1 `insertNode`/`moveNode` then re-sync.

#### W1.5 — Keyboard & command system *(Must)*
Central `editorCommands` dispatcher (each command = a W1.1 op + canvas re-sync + history push): Delete/Backspace (remove), Cmd/Ctrl+D (duplicate), Cmd+C/X/V (copy/cut/paste via clipboard helper), Cmd+Z/Y (existing), Arrow/Tab/Shift+Tab to move selection across the tree, Cmd+A select siblings. Commands are guarded (no-op when typing in an input).

#### W1.6 — Context menu *(Should)*
Right-click a node → Duplicate / Copy / Cut / Paste / Delete / Move up / Move down / Wrap in Section / Select parent. Items dispatch `editorCommands`.

#### W1.7 — Navigator (Layers) tree v2 *(Must)*
Replace the read-only layers list: drag-to-reorder (→ `moveNode`), inline rename (sets a node `displayName`/custom label), hide & lock toggles, collapse/expand, type icons, two-way selection sync with canvas, multi-select. Indentation + connector lines.

#### W1.8 — Responsive preview *(Should; ADR-018)*
Viewport switcher in TopBar (Desktop 1280 / Tablet 768 / Mobile 375) that resizes the canvas frame; zoom (25–200%) + "fit". No schema change — components already ship responsive Tailwind. Selection/DnD continue to work at any width.

#### W1.9 — Canvas chrome *(Should)*
Bottom **breadcrumb** of selection ancestry (clickable → select ancestor, uses `getAncestors`); zoom controls; empty-page state ("Drag a block here, or ask AI"); subtle grid backdrop; canvas pan (space-drag).

#### W1.10 — Performance *(Should)*
Memoize `RenderNode` and block components; debounce/coalesce `onNodesChange`→store writes; avoid re-serializing the whole tree on every keystroke (diff or throttle). Target: smooth on a 200-node page.

**Acceptance (W1):** operations library 100% unit-tested; resolver round-trip lossless incl. nested trees and after drops; in a browser (E2E + manual) — drag/drop with indicators, click/hover/multi-select, reorder across containers, keyboard + context-menu commands, copy/paste/duplicate, navigator drag-reorder, and responsive preview all work; AI flow still valid after manual edits; every new node has a `node_<8>` id.

### W2 — E2E test suite *(Must)*

**Build:**
- Playwright in `apps/studio/e2e/`. Network mocks for GitHub (Octokit), AI providers, Supabase service calls.
- **Critical-path spec:** login (mock OAuth) → connect repo → editor loads default project → drag a block → edit a prop → run an AI patch (mocked patch response) → publish (free: schema-only) → assert commit payload.
- Secondary specs: undo/redo applies to canvas; draft restore prompt; conflict → PR-link banner; paywall (free cannot export `.tsx`).
- CI: extend `.github/workflows/ci.yml` to install Playwright browsers and run `pnpm e2e` after unit/typecheck.

**Acceptance:** `pnpm e2e` green locally and in CI; a deliberately reintroduced v1.0-class bug (e.g. revert the `onNodesChange` fix) makes it fail.

### W3 — Multi-page management UI *(Must)*

**Build:**
- Page manager in the TopBar page dropdown (or a small left-panel "Pages" section): create (`generatePageId` + default route), rename, delete (guard: keep ≥1 page, ADR keeps `pages.min(1)`), reorder, edit `route` (validated against the page route regex).
- New nav/page operations go through `projectStore` (history-tracked, draft-saved) and bump `canvasSyncToken` on switch (already handled by `key={activePage}`).
- Route-collision validation (no two pages with the same route).

**Acceptance:** create/rename/delete/reorder pages; routes validated; undo covers page ops; export produces the right `app/<route>/page.tsx` files (renderer `routeToFilePath` already supports nested routes).

### W4 — SEO metadata + migration `1.0 → 1.1` *(Should)*

**Build:**
- Extend `PageSchema` with optional `seo?: { title?: string; description?: string; ogImage?: string }` (strings; URL-validated for `ogImage`). Bump `ProjectSchema.schemaVersion` accepted value to include `"1.1"`; `createDefaultProject` emits `"1.1"`.
- Migration `1.0→1.1`: add empty `seo` defaults to every page; set `schemaVersion="1.1"`. Tests: 1.0 doc upgrades; 1.1 doc unchanged; round-trip validates.
- Renderer: emit Next.js `export const metadata` (per page) and `<title>`/`<meta>` in the generated layout/page from `seo`.
- UI: a "Page SEO" section in the page settings (title/description/ogImage inputs).

**Acceptance:** set SEO in editor → export → generated page has correct `metadata`; old `1.0` repos open and silently upgrade.

### W5 — `packages/deploy` (Vercel trigger) *(Should)*

Implements prd.md §8.7 (was deferred).

**Build:**
- `packages/deploy/src/vercel.ts` — `triggerVercelDeploy(token, repoFullName, branch)` (never throws; logs on failure, per §19 risk register).
- Project settings UI to paste Vercel token + project id → stored **encrypted** (`ENCRYPTION_KEY`) in `projects.vercel_token_enc` / `vercel_project_id` (columns already exist in the migration).
- Publish route (Pro path): after `publishFiles`, if Vercel is configured, decrypt token and trigger deploy; surface the deploy URL in the publish result.

**Acceptance:** Pro user with Vercel configured sees a deploy URL after publish; failure does not block publish.

### W6 — Template foundation *(Should)*

Implements ADR-014.

**Build:**
- `packages/schema`: `TemplateSchema` (`meta`, `schemaVersion`, `scope`, `payload`) + `templateFromPage()`, `templateFromProject()`, and `applyTemplate(template, target, mode)` that **re-mints IDs** and validates.
- Storage: write/read templates from the user's repo at `/.nova/templates/<slug>.json` via `packages/git`, and/or a Supabase `templates` table (user-scoped). v1.1 = personal/team; **no public index**.
- Editor UI: "Save as template" (current page or project) and "Apply template" (picker over the user's templates; choose replace/append for project scope).
- Tests: template round-trip; apply re-mints all ids; cross-version apply (1.0 template → 1.1 project) migrates.

**Acceptance:** save a page as a template, apply it to another project → IDs are fresh, schema validates, canvas renders. **No marketplace surface ships.**

### W7 — Production hardening *(Should)*

**Build:**
- **IP-level rate limiting** via Vercel Edge `middleware.ts` on `/api/ai` (and optionally `/api/project/*/publish`) — closes prd.md §12's deferred "future phase." Keep the existing per-user 10/min DB check as the second layer.
- **Sentry** (or equivalent) for server + client error tracking; scrub tokens/PII. Wrap API routes and the editor in error boundaries with friendly messages (extends the v1.0 editor load-error screen).

**Acceptance:** burst of requests from one IP is throttled at the edge; unhandled errors appear in Sentry with no secrets leaked.

---

## 3. Schema changes summary

```
ProjectSchema.schemaVersion: accepts "1.0" | "1.1"; default factory emits "1.1"
PageSchema.seo?: { title?, description?, ogImage? }   // NEW (optional)
TemplateSchema (NEW): { meta{name,description,tags[],thumbnailUrl?,author,createdAt}, schemaVersion, scope: "page"|"project", payload: Page | Project }
migrations: "1.0→1.1" (additive: add empty seo, bump version)  // FIRST real migration
```

All other schemas unchanged. ID formats unchanged (`node_<8>`, `page_<6>`).

## 4. Testing additions

- `packages/editor`: **operations library (W1.1) — exhaustive unit tests** (clone id-uniqueness, insert/move/remove/duplicate, illegal-drop guards, root-level ops); resolver round-trip + drop-path id tests (W1.2).
- `packages/schema`: migration `1.0→1.1` tests; `TemplateSchema` + `applyTemplate` (id re-mint, cross-version) tests.
- `packages/renderer`: SEO `metadata` emission tests.
- `packages/deploy`: `triggerVercelDeploy` (mocked fetch) — never-throw behavior.
- `apps/studio` + `packages/editor`: **Playwright E2E** critical path + editor-interaction specs (drag/drop, select, reorder, copy/paste, navigator) (W2). §15 table updated accordingly.

## 5. Sequencing (suggested)

1. **W1.1** (operations library) — the testable core; everything (canvas DnD, keyboard, context menu, templates, copy/paste) dispatches these. **← in progress**
2. **W1.2** (Craft wrapper + ID override) — makes nodes draggable/selectable and keeps IDs schema-valid.
3. **W1.3–W1.6** (selection/hover, drag UX, keyboard, context menu) + **W2** E2E to lock them in.
4. **W1.7–W1.10** (navigator v2, responsive preview, chrome, perf).
5. **W3** (multi-page) + **W4** (SEO + migration) — schema/UX features, naturally paired.
6. **W6** (templates) — reuses W1.1 clone machinery; depends on stable schema (W4).
7. **W5** (deploy) + **W7** (hardening) — independent; any time after W1.2.

## 6. Forward: v1.3 — Visual Tailwind Editor

*(Analysis of user proposal, 2026-06-14)*

**Proposal:** Instead of a freeform CSS editor, build a Webflow-like visual panel that maps to Tailwind classes. User sets "Margin Top: 16px" → system writes `mt-4` into a `classOverrides` array on the element. The component renders with `cn(builtinClasses, ...overrides)`. Output stays clean Tailwind.

**Verdict: Ship it. It is the only approach that satisfies all four of Nova's moats simultaneously.**

| Constraint | Freeform CSS | Visual Tailwind (this proposal) |
|---|---|---|
| Clean `.tsx` output | ✗ (CSS strings mixed in) | ✅ (just class arrays) |
| AI patchable | ◑ (LLMs struggle with raw CSS) | ✅ (LLMs know Tailwind cold) |
| ADR-018 compliant | ✗ (violates spirit) | ✅ (constrained to Tailwind) |
| Renderer compatible | ✗ (needs style engine) | ✅ (no renderer change) |

**Schema change (non-breaking):**
```typescript
// ElementSchema gains one optional field:
classOverrides?: string[]; // e.g. ["mt-4", "md:mt-8", "flex", "gap-4"]
```
Existing schemas (no `classOverrides`) are valid. Migration: none needed for 1.1→1.3.

**How it works end-to-end:**
1. User opens the new **Style** tab in RightPanel (alongside existing Props tab)
2. Style tab shows Webflow-like controls: Spacing (margin/padding), Layout (display/flex/grid), Size, Typography, Colors — all with breakpoint selector (sm/md/lg)
3. User sets "Margin Top: 16" → maps 16px → `mt-4`. With md: breakpoint active → `md:mt-4`
4. `classOverrides` on the element is updated (via Craft `setProp`)
5. Component renders: `<div className={cn(block.defaultClasses, ...element.classOverrides)}>`
6. `tailwind-merge` (new dep) resolves conflicts: if block has `mt-4` and override adds `mt-8`, merge keeps only `mt-8`
7. Renderer: `propsToJSX` passes `classOverrides` → `className={cn(defaults, overrides)}` in the emitted `.tsx`
8. AI: can read and write `classOverrides` as naturally as props (it's just Tailwind strings)

**Value map (partial, the engineering work):**
| UI value | Tailwind class | Breakpoint variant |
|---|---|---|
| mt-0..mt-96 | `mt-{n}` | `sm:mt-{n}` etc. |
| px-N | `px-{n}` | ✓ |
| flex / grid | `flex` / `grid` | ✓ |
| flex-row/col | `flex-row` / `flex-col` | ✓ |
| gap-N | `gap-{n}` | ✓ |
| w-full, w-1/2… | `w-full` etc. | ✓ |
| text-sm/base/lg… | `text-{size}` | ✓ |
| font-bold… | `font-{weight}` | ✓ |
| Non-standard px | `mt-[{value}px]` (arbitrary) | ✓ |

**Why this also solves the layout complaint (blocks only stack vertically):**
- User selects a Section, adds `flex flex-row gap-8` via the Layout tab
- Children now arrange horizontally
- This is exactly how Webflow/Framer do it — structural layout is CSS, not a proprietary concept

**Dependencies for v1.3:** `tailwind-merge` (class conflict resolution). No other new packages needed. The renderer already emits Tailwind.

**ADR-018 update for v1.3:** "Visual Tailwind editing" is explicitly permitted as it is constrained to the Tailwind class set. Freeform CSS strings remain out of scope.

**New workstreams in v1.3:**
- W8: Style panel UI (RightPanel "Style" tab) + value-to-Tailwind mapping table
- W9: `tailwind-merge` integration in Craft wrapper + renderer
- W2 (moved from v1.2): Playwright/E2E — now testable with a stable canvas
- W10: Cross-page linking (user request from QA) — `<Link href="/route">` prop on Button/Navbar via existing route registry

---

## 7. Out of scope → v2.0 (Template Marketplace)

v1.1 deliberately stops at **personal/team** templates (the artifact + save/apply). v2.0 builds the marketplace on top of the proven `Template` artifact:

- **Template library** compatible with the project schema (seeded by team + contributed by users via the editor).
- **Hybrid sourcing:** team seed initially + user contributions through the editor.
- **Discovery & browsing:** search, tags, categories, previews.
- **Creator incentives & monetization:** pricing policy for the marketplace, platform **% commission**, payouts.

These need their own spec (`doc/prd-v2.0.md`) — pricing/commission policy is explicitly still open and must be designed there.
