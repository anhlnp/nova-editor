# Nova — Release Roadmap & Version Ledger

> **Living document.** Records every release — **past** (retrospective) and **planned**
> (forward) — with its bump class and the model that should build it.
>
> **How to use:** when a release ships, append/flip its row here. Numbering follows
> [SPEC.md §11](SPEC.md#11-versioning--process): **Patch→Haiku · Minor→Sonnet · Major→Opus**,
> classified by *risk/scope of the change, not lines of code*. A **transformative**
> schema migration (decomposition, field/type removal or rename) is always a **Major**.
>
> **Two version numbers:** the **product** version (the SPEC header, currently `v2.0-dev`)
> and the **`schemaVersion`** in `project.json` (currently `1.6`).

---

## Semver drift (read this first)

The product label has **under-counted breaking changes**. The schema chain is
`1.0 → 1.1 → 1.2 → 1.2.1 → 1.3 → 1.4 → 1.5 → 1.6` (`packages/schema/src/migrations/runner.ts`,
`versionChain`). Of those steps, **five were transformative migrations** — i.e. true
Majors — yet most were labeled minor/patch:

| schema step | what it did | true bump |
|---|---|---|
| `1.2→1.2.1` | Navbar `links[]`/`ctaLabel` + PricingCard `cta` → **child nodes** (props removed) | **Major** |
| `1.2.1→1.3` | **renamed** the `NavLink` block type → `Link` | **Major** |
| `1.3→1.4` | HeroSection/Navbar **decomposition**, visual props removed | **Major** |
| `1.4→1.5` | visual props → `classOverrides` (props removed, ADR-028) | **Major** |
| `1.5→1.6` | Footer **decomposition** (links → child `Link` nodes, TD-021) | **Major** |

Had bump→model semver been applied from day one, the product would already be **≈ v7.x**,
not `v2.0`. **Decision:** we keep the existing SPEC-label numbering as primary (continuity
with all current docs), but this ledger records the **true bump** per release so the drift
stays visible and future classification stays honest.

---

## Retrospective ledger (shipped)

| Labeled | schemaVersion | Theme | True bump | Should-have-been built by |
|---|---|---|---|---|
| v1.0 | 1.0 | Baseline editor + schema | — | — |
| v1.1 | 1.1 | Optional page `seo` (additive) | Minor | Sonnet |
| v1.2 | 1.2 | `theme`, toasts (TD-005), panel collapse (TD-011) | Minor | Sonnet |
| v1.2.1 | 1.2.1 | **Navbar/PricingCard decomposition** → child nodes | **Major** | **Opus** |
| v1.3 | 1.3 | Visual Tailwind editor, tiers; **`NavLink`→`Link` rename** | **Major** | **Opus** |
| v1.4 | 1.4 | **HeroSection/Navbar decomposition**; schema-driven PropsPanel | **Major** | **Opus** |
| v1.5 | 1.5 | **props→`classOverrides`** (ADR-028), visual props removed | **Major** | **Opus** |
| v1.6 | 1.6 | **Footer decomposition** (TD-021) + `Row` primitive | **Major** | **Opus** |
| v2.0 | 1.6 | Publish-from-registry (ADR-027), debt cleanup, QA gate | Major | Opus |
| v2.1.0 | 1.6 | ✅ **SHIPPED** — Security & data-integrity hotfixes (ADR-030): UnknownBlock lossless load, TextBlock XSS, AI rate-limit race + unlimited bypass, git ghost files, AI parse, bg-override regex | Minor | Opus¹ |
| v2.1.1 | 1.6 | ✅ **SHIPPED** — Code-export crash & deploy fixes (ADR-031): component name sanitize, strings via JSON.stringify, `generateAll` unknown-block guard, React-fragment wrapper, remove redundant Vercel trigger, `structuredClone` + pre-validation in runner | Patch | Sonnet² |
| v2.2.0 | 1.6 | ✅ **SHIPPED** — Canvas overlay portaling (ADR-032): all three overlays portal to `document.body` (escapes CSS-transform containing block), `AlignBar` tethered to selected node bbox, `LayoutOverlay` rAF + ResizeObserver + margin-vs-gap guard, zoom subscription on all three. Flips TD-018. | Minor | Sonnet |
| v2.3.0 | 1.6 | ✅ **SHIPPED** — Inspector-panel performance & robustness (ADR-033): PropsPanel inputs debounced 300 ms (C4.1); Zod `_def` introspection moved to `fieldDescriptors.ts` in registry + `WeakMap` cache (C4.2); LeftPanel layer tree auto-scroll on DnD drag (C4.3); StylePanel shows arbitrary bg/text values instead of blank "—" (C4.4). | Minor | Sonnet |
| v3.1.0 | 2.0 | ✅ **SHIPPED** — Box primitive + layout presets (ADR-036, v3.1.0): `Box` block (`as` prop, `isCanvas`, no `canMoveIn` restriction, transparent bgColor default); LeftPanel layout presets group (2-col, 3-col, sidebar L/R inject nested `Box` trees); `Section` gains `as` prop (backward-compat); `generateSources.mjs` + `sources.ts` regenerated (16 blocks). 7 new tests. | Minor | Sonnet |
| v3.2.0 | 2.0 | ✅ **SHIPPED** — Cloudflare Workers Staging Deployment (ADR-033): Overcame massive Next.js App Router/OpenNext/Wrangler/AWS SDK integration hurdles. Fixed OpenNext Regex bug (`patch-open-next.js`), AWS SDK browser export bug (`patch-aws-sdk.js`), NextAuth Cloudflare edge fetch bug, and wrangler env sync bugs. | Minor | Opus, Pro |
| v3.2.1 | 2.0 | ✅ **SHIPPED** — Wrangler TOML asset upload hotfix: Fixed a critical TOML syntax trap where `assets` was swallowed by `[vars]`, causing CSS/JS files to be completely missing on Cloudflare. Re-enabled `deploy` without script parameter. | Patch | Opus |
| v4.0.0 | 3.0 | ✅ **SHIPPED** — Brittle-preset decomposition + rich text/media (ADR-037): HeroSection/FeatureCard/PricingCard → child primitives, `2.0→3.0` transformative migration, Button/Link inline edit, `next/image` export. | **Major** | **Opus** |
| v4.1.0 | 3.0 | ✅ **SHIPPED** — Hybrid credit model (ADR-038): all tiers **metered** (Pro unlimited→4000, fixes TD-026), two buckets (monthly + prepaid top-up, 1yr TTL), Free **daily soft-cap** 40/day, `decideCreditSource` + migration `0006`. Benchmarked v0 + Figma Make. | Minor³ | Opus |
| v4.2.0 | 3.0 | ✅ **SHIPPED** — Credit UX surfacing: editor UI now exposes the v4.1.0 two-bucket model. TopBar shows combined total + daily badge (amber when low) with tooltip breakdown. AI panel shows monthly/prepaid counters, daily sub-cap row, distinguishes `daily_cap` vs `insufficient` errors, and offers one-click top-up purchase links (200/1000/4000 cr). `creditDisplay.ts` pure helpers (18 tests). async `/api/me` refetch after each AI op. | Minor | Sonnet |
| v5.0.0 | 3.0 | ✅ **SHIPPED (logic)** — Hybrid unified undo + selection desync fix (ADR-039, **reverses ADR-009**, audit C6). Snapshot history → interleaved timeline: canvas edits replay via Craft-native history (in-place, no remount, keeps selection); page/theme/AI are schema steps. Kills the memory bomb (canvas markers carry no `Project`) + phantom-selection. `unifiedHistory` + `effectiveSelection` pure reducers (15 tests). **C6 only**; C5.2 fork deferred → v5.1.0. Runtime 🟡 (browser-QA batched post-v5). No schema change. | **Major** | **Opus** |
| v5.1.0 | 3.0 | ✅ **SHIPPED (logic)** — Craft-fork IDs (ADR-040, audit C5.2, narrows ADR-012). Pinned pnpm patch of `@craftjs/core` createNode mints `"node_"+nanoid(8)` at node creation → `toNovaId()` slice-hack removed (closes TD-001/002); `craftIdMint` CI guard test asserts the patch stays applied. No schema/data change → **Minor** (corrects the earlier Major mislabel). Runtime 🟡 (browser-QA post-v5). | Minor | Sonnet |
| v5.1.1 | 3.0 | ✅ **SHIPPED** — Robustness & type cleanup: TD-004 lazy Supabase client (`getSupabase()` + `supabase` Proxy → no module-load crash, clean 500 on missing env; unit-tested); TD-010 removed the `NovaRootCanvas` cast (typed `UserComponent<Record<string,unknown>>`). Confirmed TD-006 already resolved (ADR-032) + TD-008/009 accepted constraints. | Patch | Haiku |
| v5.4.0 | 3.0 | ✅ **SHIPPED (harness)** — TD-007 Playwright E2E harness (ADR-015): `playwright.config.ts` (chromium, storageState auth, retries:1); `e2e/fixtures.ts` (API route mocks for `/api/project/*`, `/api/me`, `/api/ai`); `e2e/auth.setup.ts` (storageState setup + auth instructions); 4 critical-path specs: `editor-load` (canvas+rail visible, empty-state prompt), `add-block` (click→layers tree), `undo-redo` (Ctrl+Z/Y exercises v5.0.0 unified timeline), `credit-gate` (0-credit gate message + disabled input). ADR-015 flipped 🧪→✅(harness)/✅(runs). Green runs ✅ (browser QA gate passed). No schema change. | Minor | Sonnet |
| v5.3.0 | 3.0 | ✅ **SHIPPED (logic)** — TD-023 buildable export scaffold: `generateAll` now emits `package.json` (deps: next/react/react-dom/tailwindcss/postcss/autoprefixer/**tailwind-merge**; scripts dev/build/start), `postcss.config.js`, `app/globals.css` — the exported Next.js repo is immediately `npm install && npm run build`-able. New `generators/scaffold.ts` with `generateScaffold`/`generatePackageJson`. 20 new tests. Closes TD-023; TD-024 (real deploy build) narrowed to runtime QA. No schema change → Minor. | Minor | Sonnet |
| v7.0.0 | 4.0 | ◐ **IN PROGRESS (stage 1 logic)** — **One source of truth, stage 1 (I2; Phase F; ADR-042)** (Major; architecture migration). Design session + **ADR-042** (current/target arch, full sync-path audit, risks, rollback, exceptions E1–E3) landed. Makes the **Document the only authority** and Craft a pure projection, staged behind a `CRAFT_READONLY` switch (false in v7.0.0). New pure primitives **`setNodeProps`/`setNodeProp`** (immutable, deep-clone, same-ref no-op; 11 tests) are the Document-edit counterpart of Craft's `actions.setProp`. New **transient-edit infra** (`beginTransientCanvasEdit`/`endTransientCanvasEdit`) suppresses the reconciliation bridge during a drag preview so the gesture commits ONE Document step on pointer-up (also fixes the old one-marker-per-pointermove limitation). New **`useDocumentWrite`** app helper centralizes "pure transform → `applyExternalSchema`". **Re-pointed to Document-first** (runtime 🟡): RightPanel props, StylePanel classOverrides + free-position (atomic node+parent), AlignBar self-align, ⌘K Tidy, LayoutOverlay gap-drag. Decision (user-approved): capture-and-reapply DnD (E1) + local inline-text (E2) + editor-only setHidden (E3); staged delivery (v7.0.1 layers DnD/delete/rename · v7.0.2 native DnD/inline text + flip flag + remove dead bridge). Also fixed 3 pre-existing rules-of-hooks violations in RightPanel (lint green). Typecheck 8/8 ✅; editor 166 (+11) / app 284 / renderer 79 green; lint green. Phase F → ✅ only after v7.0.2 + browser QA. | **Major** | **Opus** |
| v7.0.2 | 4.0 | ◐ **IN PROGRESS (stage 3 logic — Phase F logic complete)** — **One source of truth, stage 3 capstone (I2; Phase F; ADR-042)** (Major). Completes the migration to **Document = sole authority**. New pure **`cmdInsertBlock(els, parentId, index, element, getRules)`** (gated by registry DropRules; +5 tests) + app **`buildBlockElementSchema`** (registry→Element). **Click-insert → Document-first** (Blocks-panel click, Layers add-above/below/append, layout presets) via `cmdInsertBlock` (was `actions.addNodeTree`). **Architecture crystallized (user decision):** rather than a binary "Craft read-only" flip, `updateElements` is **renamed → `commitCanvasGesture`** and **reclassified as the ONE narrow ADR-042 E1/E2 gesture adapter** (the only Craft→Document path), reached only by native drag-drop (E1, `connectors.create` + in-canvas drag) and inline-text commit (E2); it keeps the zero-payload canvas marker (no re-deserialize / no memory bomb, preserving ADR-039). The **`CRAFT_READONLY` scaffolding flag was retired** (`flags.ts` deleted) — the model is a permanent "discrete=Document-first, gesture=adapter" split, not an on/off. Future option left open: replace the adapter with true drag-end coalescing if browser QA proves Craft's events robust. **Audit (measurable):** grep confirms **zero** production `actions.move`/`actions.delete`/`actions.addNodeTree`/`CRAFT_READONLY`; remaining Craft writes = E1 panel-drag + 2 transient previews (gap/resize) + E2 inline-text — all documented. Typecheck 8/8 ✅; editor 185 (+5) / app 284 green; lint green. **Phase F is logic-complete but stays 🟡** — gesture adapter + end-to-end model need **browser QA** (drag/resize/snapping/marquee/Layers/Components/AI/publish, no regression vs v6.x); then flip Phase F → ✅ + a follow-up commit deletes the (retained-for-rollback) reframed legacy paths. | **Major** | **Opus** |
| v7.0.1 | 4.0 | ◐ **IN PROGRESS (stage 2 logic)** — **One source of truth, stage 2: structural gestures (I2; Phase F; ADR-042)** (Major). Moves structural edits to Document-first with legality enforced ONCE in the command layer. New pure **`cmdMoveNode(els, id, parent, index, getRules)`** — the structural twin of `useDocumentWrite`: gates every move via `canMoveInto`/registry DropRules (illegal/self/descendant → same-ref no-op). New **`cmdDropRelative(els, drag, target, before|after|inside, getRules)`** — computes the index in the post-removal sibling array (same-parent reorder lands exactly where the indicator showed) and routes through cmdMoveNode. New app **`getDropRules`** (single registry-backed lookup; no UI re-implements rules). **+14 tests** (`cmdMoveNode.test.ts`: reorder, reparent legal/illegal, self/descendant no-op, top-level, before/after/inside, same-parent post-removal index, illegal-inside/self/missing no-ops). **Re-pointed Document-first** (runtime 🟡): Layers DnD (→cmdDropRelative), Layers move-up/down + delete + rename (→cmdMoveUp/Down/Delete via run + setNodeProps), ContextMenu "Extract block" (→cmdMoveNode), RenderNode ✕ delete (→removeNode + clear selection), RenderNode resize (transient preview → **exactly one** Document history entry per gesture) + arrow-nudge (discrete setNodeProps). **Audit (measurable):** grep confirms **zero** production `actions.move`/`actions.delete`; remaining `actions.setProp` are the 2 transient drag previews (gap/resize, committed via Document on pointer-up); `actions.addNodeTree`/`connectors.create` (block insert) deferred to v7.0.2; `actions.setHidden` = E3 editor-only exception. Typecheck 8/8 ✅; editor 180 (+14) / app 284 green; lint green. v7.0.2 = native DnD (E1) + inline text (E2) + block-insert + flip `CRAFT_READONLY` + remove dead bridge + full I1–I10 conformance + browser QA → Phase F ✅. | **Major** | **Opus** |
| v6.4.0 | 4.0 | ✅ **SHIPPED (logic)** — **Export golden tests + TD-024 close (I8)** (Minor; Phase E). Makes I8 export parity checked in code. **Suite A** (minimal doc): `generateAll` on Box+TextBlock page file + block sources → `toMatchSnapshot` (3 snapshot tests). **Suite B** (Instance I8 parity): `generateAll(docWithNoOverrideInstance)` ≡ `generateAll(docWithDetachedNoOverride)` — `toEqual`, not snapshot, so both sides can't degrade silently together; same for an override-carrying Instance (`label:"Submit"` vs master `"Save"`) — output must contain overridden value. **Suite C** (full-block): all 16 registry block types + 1 ComponentMaster + 1 Instance → `toMatchSnapshot` the whole files bundle; any block codegen change fails immediately. **I1/I10 regression guard** (+2 tests in `instanceRoundTrip.test.ts`): `schemaToNodes(nodesToSchema(docWithInstance))` still contains Instance node — serialization round-trip must NEVER bake Instances (only `generateAll`/export may resolve). **TD-024 MITIGATED**: `memory/project_nova_technical_debts.md` updated — codegen regressions covered by golden tests; manual deploy-build QA remains. Typecheck 8/8 ✅; renderer 79 (+7) / editor 155 (+2) tests green. 4 snapshot files committed. **After this release: all I1–I10 invariants have enforcing tests** (I2=prose/review, I9=numbers@QA are the only soft entries remaining). | Minor | Sonnet |
| v6.3.0 | 4.0 | ✅ **SHIPPED (logic)** — **AI patch normalization + pre-validation (I6)** (Minor; Phase E). Enforces invariant I6 with a clean **normalize → validate → apply** pipeline. **`packages/ai/src/utils/normalizePatch.ts`**: `normalizeAIPatch(patch, project)` — pure, never mutates input. `set-prop classOverrides` replace-intent from the AI becomes a **merge**: union(current, incoming), deduplicated, stable order (existing first, case-sensitive). `set-props classOverrides` same. All other ops pass through as the same reference. **`packages/ai/src/utils/validator.ts`**: `validateAIPatch(patch, project)` — builds a recursive `id → Element` map from `project.pages[].elements` only (Component master subtrees are NOT in this set — they are read-only projection sources, not document edit targets). For each op: `set-prop`/`set-props`/`remove` check `targetId` in document ids; `add-child` checks `parentId` in document ids OR valid page id; unknown ops fail. Returns `{ valid: true }` or `{ valid: false, reason, badOp }` (first failing op, deterministic). **API route pipeline** (`apps/studio/src/app/api/ai/route.ts`): NovaPatch semantic patches (no `"path"` field) run `normalizeAIPatch` → `validateAIPatch` → `applySmartPatch`; on `valid: false` → **HTTP 422** `{ error: reason }` without applying — credits NOT deducted (ADR-006). Legacy RFC 6902 patches bypass normalization/validation (handled by `fast-json-patch`). **AI panel UI** (`LeftPanel.tsx`): `handleSubmit` refactored into `runAIRequest(msg, prependUserMsg)` + `handleRetry()`; 422 responses show `"Patch invalid: …"` error bubble with a **"↺ Retry" button** that re-fires the last prompt without adding a duplicate user message; `ChatMessage` gains `retryable?: boolean`. **+23 tests** (`normalizePatch.test.ts` 11 + `validator.test.ts` 12): merge/dedup/ordering, pass-through reference equality, empty-patch valid, id-exists, projection-node rejected, unknown-op rejected, first-bad-op reported, add-child page/element validation. Typecheck 8/8 ✅; ai 80 / app 307 tests green. | Minor | Sonnet |
| v6.2.0 | 4.0 | ✅ **SHIPPED (logic)** — **Instance override editing** (Minor; Phase D). Makes the `overrides` map on a selected Instance writable from the inspector per-prop. Two new pure commands in `packages/editor/src/components/commands.ts`: **`cmdSetInstanceOverride(elements, components, instanceId, targetElementId, propKey, value)`** — validates type === INSTANCE_TYPE; **equality-based structural no-op** (returns original array unchanged if the current effective resolved value already deep-equals the incoming value, keeping history clean); otherwise deep-clones the Instance node and writes `overrides[targetElementId][propKey] = value`. **`cmdClearInstanceOverride`** — removes one key; removes the entry when empty; no-op if already absent. **Inspector Instance panel** (RightPanel) replaces the "v6.2" placeholder with scrollable **override rows**: props sourced STRICTLY from the registry's `propSchema` for the master root's block type (text/url/color/image controls; `select`/`toggle`/`number`/`repeater` excluded); each row shows the current effective value (resolved = master + overrides), a filled-dot badge when overridden, and an **× reset icon**; `classOverrides` added as a special row (space-separated display, stored as string[]). Detach button pinned at the bottom. **+11 tests** (`overrideCommands.test.ts`): round-trip survival, set/clear/identity, no-op contracts (invalid id; equality no-op), multi-key independence, classOverrides replacement, **I10 propagation** (master change propagates to un-overridden instances only). Runtime 🟡 (typecheck ✅; editor 153 / app 284 tests green). v6.3 optional next (promote-to-master) or skip to Phase E. | Minor | Sonnet |
| v6.1.1 | 4.0 | ✅ **SHIPPED (logic)** — **Components on the canvas: render + instantiate UI** (Minor; Phase D). Closes the three v6.1.0 🔴 items. Key invariant: **`nodesToSchema` never bakes an Instance** — Instance nodes survive the `schemaToNodes` ↔ `nodesToSchema` round-trip unchanged (12 new tests, `instanceRoundTrip.test.ts`). `schemaToNodes` now emits `resolvedName:"Instance"` (not `UnknownBlock`) + `isCanvas:false` + `nodes:[]`. **Canvas rendering**: `InstanceBlock` registered in Craft resolver via `CraftProvider.extraResolver` (new prop; avoids package circular dependency — InstanceBlock reads `useProjectStore`); it resolves the master via `resolveInstance`, renders via `ElementTreeRenderer` (registry components, `pointerEvents:none`) with a dashed-purple outline and a name badge; missing master → safe placeholder. `ElementTreeRenderer` is a new pure, non-Craft recursive renderer over registry components. **LeftPanel Components section**: lists `project.components` (name + hexagonal icon); "Insert" button calls `cmdInstantiate` + `applyExternalSchema`; empty state hints toward ⌘K. **Inspector Instance panel**: "Component" badge + master name header + "Detach instance" button (calls `cmdDetachInstance` + `applyExternalSchema`) rendered instead of the regular Props/Style tabs when an Instance is selected. Runtime 🟡 (typecheck ✅; editor 142 / app 284 tests green). Override editing deferred to v6.2. | Minor | Sonnet |
| v6.1.0 | 4.0 | ✅ **SHIPPED (renderer + commands)** — **Components/Symbols, part 2: canvas + renderer** (Major; Phase D). The v6.0 model was **relocated to `@studio/schema`** (so the renderer AND editor share one resolution rule) and gained **`resolveInstancesInTree(elements, components)`**. **Export now consumes it**: `generateAll` flattens every `Instance` to its resolved concrete tree before codegen, so export === canvas projection (**I8**) and no `Instance` tags are emitted; golden test proves **instance render === detached render** (byte-identical). New pure, unit-tested editor commands (`packages/editor/src/components/commands.ts`): **`cmdCreateComponentFromSelection`** (lifts the selection into a new `ComponentMaster` + replaces it with an `Instance`; **PRESERVES the lifted subtree's stable element ids** so override addressing stays valid; multi-select → master children in **document order**, reusing the group sibling rule), **`cmdInstantiate`**, **`cmdDetachInstance`** (bake + re-mint + drop ref). **+~30 tests** (schema 90 / editor 130 / renderer 72). UI 🟡: **⌘K "Create component" + "Detach instance"** wired via the project store (gated by `canDetach`). NOT built yet (next, 🟡): canvas RENDERING of instances (currently falls back to `UnknownBlock`), LeftPanel Components section / instantiate, inspector override indicator. Decisions honored: instances **non-enterable**; override editing deferred to v6.2. | **Major** | Opus |
| v6.0.0 | **4.0** | ✅ **SHIPPED (model)** — **Components/Symbols, part 1: the model** (Major; **opens Phase D**, the document-model flagship). New schema (`@studio/schema`): `ComponentMaster {id,name,root}` + `OverrideMap` + an `Instance` element convention (`type:"Instance"`, props `{masterId, overrides}`); `components[]` added to Project (optional/additive). **Schema migration 3.0→4.0** — seeds `components: []`, bumps version, **no-op for projects without components** (pages untouched). New pure model (`packages/editor/src/components/`): **`resolveInstance(master, overrides)`** flattens an instance to a concrete tree — overrides are a **SPARSE per-prop delta keyed by STABLE ELEMENT ID** (path addressing forbidden), override wins / rest inherits / stale keys ignored; pure + deterministic (`resolve(m,o)===resolve(m,o)`, no mutation); a missing/dangling master yields a **safe deterministic placeholder** (never crashes). **`detachInstance`** bakes the resolved tree, **remints fresh unique ids**, and drops the ref. **+14 I10 tests** (override round-trip, propagate-except-override, determinism/purity, dangling, detach) + **3.0→4.0 migration tests**. NO canvas UI yet. **Next: v6.1.0** — canvas UI (create-from-selection / instantiate / detach / override-edit) + renderer/export consuming `resolveInstance` (preserving I8). | **Major** | Opus |
| v5.21.0 | 3.0 | ✅ **SHIPPED (logic)** — Inspector polish: **direct numeric editing** (Phase C; **completes Phase C logic**). New pure `numericField.ts` — parse/format/commit/step/scrub living together: `parseNumeric` (finite parse + clamp, null on empty/invalid/non-finite), `formatNumeric` (`parse(format(v)) === v`), `commitNumeric` (**invalid/empty → revert to prev, never NaN**; empty+allowEmpty → null clear), `stepValue` (arrow ±step, Shift = shiftStep ×10), `scrubDelta` (drag-to-change, accumulates from drag-start total / sensitivity); **all step+scrub outputs normalized to precision** (kills float drift like 9.9999997) and clamped. **+15 tests**. New `NumericInput` component encodes the editing contract — **type→Enter/blur commit, Esc cancels (restores pre-edit value, no write), ArrowUp/Down step, drag-the-unit scrub** — writing through StylePanel's existing bounded writers (fixed-size px row; no schema change). Runtime 🟡. History note: scrub writes live per pointermove (Nova's known one-marker-per-move limit; single-entry-on-pointer-up awaits the global fix — not done here). **Phase C logic COMPLETE** (layout intent · resize · snap · guides · marquee · DnD · align · distribute · group · keyboard model · numeric editing · free-position). **Next: Phase D — Components/Symbols** (Major: master→instance→override→propagate; + Assets). | Minor | Sonnet |
| v5.20.0 | 3.0 | ✅ **SHIPPED (logic)** — Keyboard map as a **single source of truth** (Phase C; closes the "keyboard is basic" gap systematically). New pure `keymap.ts`: ASCII chords (`"Mod+Shift+G"`, `Mod` = Ctrl/Cmd) with `parseChord`/`normalizeChord`/`formatChord` (platform-aware display; glyphs built via `String.fromCharCode` so the **source stays ASCII** — tsc-safe), a typed **finite `ShortcutContext`** (`global`/`canvas`/`selection`/`text-editing`), and `matchChord(event, activeContexts)` with **most-specific-context-wins** precedence. The keymap is the ONE place chords are declared: the registry's hand-typed `shortcut` strings were **removed entirely** and labels are now DERIVED via `shortcutLabel`/`formatChord`. **Integrity invariants (tested):** no two bindings share a (chord, context); every keymap commandId exists in the registry; every shortcut-bearing command resolves to a binding; **no hard-coded shortcut strings remain**; no binding collides with a reserved browser chord (Mod+L/R/T/W/N/Q/P/S). **+~22 keymap tests** (parse/format round-trip, match+precedence, conflict/reserved/bidirectional-integrity). Wired: `page.tsx` keydown refactored to dispatch through `matchChord` (input-guarded; chord literals gone), and a discoverable **"Keyboard shortcuts" help overlay** (open via `?`, portaled at z-popover, grouped by command group, labels via `formatChord`). Runtime keydown + overlay 🟡. **Phase C continues** — **inspector polish** remains (inline-edit/scrubbable/multi-select). | Minor | Sonnet |
| v5.19.0 | 3.0 | ✅ **SHIPPED (logic)** — Group / Ungroup as a **first-class primitive** (Phase C). Audited + hardened the pure ops: **`groupNodes` now wraps children in DOCUMENT order** (not selection/click order — shift-clicking D, B, C still yields `[B, C, D]`), **sibling-only** (anchors on the first selected node's parent; ignores cross-parent ids), and **group-of-one / <2-siblings = no-op** (no singleton or cross-parent wrappers); `ungroupNode` lifts children into the parent at the group's slot in order. **+13 grouping tests** (document-order, interior-slot, nested, no-op guards, ungroup, **group→ungroup round-trip === identity**). Wired **⌘G** (group multi-selection) + **⌘⇧G** (ungroup) into the editor keydown (input-guarded), and added **Group/Ungroup to the ⌘K palette** — `CommandContext` gained `canGroup` (>=2 same-parent siblings) + `canUngroup` (one container with children), computed at runtime; **+2 enablement tests**. Toolbar buttons kept consistent (shortcut hints). Runtime apply 🟡. **Phase C continues** — keyboard shortcuts (beyond ⌘G/⌘⇧G), inspector polish remain. | Minor | Sonnet |
| v5.18.0 | 3.0 | ✅ **SHIPPED (logic)** — "Tidy Layout" recommendation engine (Phase C). Pure `autoArrange.ts` (NO DOM) reframed as a layout *recommendation* engine (not just a drop helper): `recommendLayout(children)` → `{layout, cols, gap, classes}`; **conservative BAND-based** detection — row = 1 Y-band + ≥2 X-bands, column = 1 X-band + ≥2 Y-bands, **grid only when REGULAR & full (rows×cols === n)** so L-shapes / staggered / partial grids return **"none" (low confidence, no-op)**; gap inferred from band gaps snapped to the Tailwind scale (`snapGap`); **no padding inference**. `applyTidy` strips prior layout classes + adds inferred. **13 tests**. Wired as a **"Tidy layout" ⌘K command** on the selected container (zoom-scaled rects → bounded classOverrides). Runtime apply 🟡. **Phase C NOT complete** — Group/Ungroup (exists), keyboard shortcuts, inspector polish remain. | Minor | Sonnet |
| v5.17.0 | 3.0 | ✅ **SHIPPED (logic)** — Gated free-position model (Phase C; **the unlock**). Pure `freePosition.ts` (NO DOM): `PositionMode` (flow/free) vocab; `parseFreePosition`/`writeFreePosition` (round-trip `parse(write(pos))===pos`), `isFreePositioned`, `toFreePosition(parent, child, scale=zoom)`, `moveBy` (clamped to parent), `exitFreePosition`, `ensureRelative`. Opt-in: a child becomes `absolute`+`left-[Npx]`/`top-[Npx]` (bounded classOverrides, **no schema change**), parent made `relative`. **15 tests** (round-trip, clamping, scale, enter/exit, variant preservation, ensureRelative). StylePanel Position section gains a **Free position** toggle (gated to a child-of-container; enter computes pos from rects, exit returns to flow). This is the **legal application target** that makes the v5.10/v5.11/v5.16 resize/snap/align-distribute deltas applicable. Runtime toggle 🟡. | Minor | Sonnet |
| v5.16.0 | 3.0 | ✅ **SHIPPED (logic)** — Align & distribute across multi-selection (Phase C). Pure `alignDistribute.ts` (NO DOM): `alignDeltas` (6 edges vs selection bounds) + `distributeDeltas` (h/v) returning `{id,dx,dy}[]`, order-stable, no-op <2/<3. **Distribute = outermost items fixed, inner repositioned to equal edge-gaps** (Gap1=Gap2…; e.g. A·B·C → A&C stay, B moves). **16 tests** (each align vs known rects, distribute equal-gap incl. unsorted input, 1/2-item edges, already-aligned no-op, expressibility). **Honest gating** (`isAlign/DistributeExpressible`): since Nova is flow/auto-layout-first (most elements have no editable x/y), application is **only expressible for free-positioned (absolute/fixed) elements** — MultiSelectToolbar buttons are **disabled, not approximated**, otherwise; enabled ops write bounded `left-[]`/`top-[]`. Delta-returning API is preview-friendly (hover→preview later). Runtime apply 🟡. | Minor | Sonnet |
| v5.15.0 | 3.0 | ✅ **SHIPPED (logic)** — Style-panel **inspector clarity & discoverability** (Phase C). *(Scope = summaries + section reset + visibility — NOT the full "commercial-grade" set: inline-edit / scrubbable values / multi-select / searchable props are later.)* Pure `styleSummary.ts` (NO DOM) — the **single source** of the section→Tailwind-prefix map (moved out of StylePanel, de-duped): `summarizeSection` → `{id, hasOverrides, resettable, count, classes}`; `resetSection` (**explicit semantics: removes ONLY that section's classes**, incl. variants; idempotent); `sectionActive`. **13 tests** incl. summary↔reset round-trip + sectionActive consistency. StylePanel: each Section header now shows a one-click **Reset** when active (section-scoped via `mutate`+`resetSection`). Runtime UI 🟡. | Minor | Sonnet |
| v5.14.0 | 3.0 | ✅ **SHIPPED (logic)** — Per-position DnD geometry + crisp drop indicator (Phase C). Pure `dropTarget.ts` (NO DOM, **container assumed already resolved**): `computeDropTarget(pointer, siblings, {direction, container?, draggedId?})` → explicit contract `{dropIndex, placement, targetSiblingId?, indicatorRect?}`. Midpoint rule per orientation; **end-of-list** (below last → index n); **self-reorder off-by-one** handled via `draggedId` (raw > fromIndex → −1); empty-container → "inside"; indicator line spans the container, computed once in one space. **18 tests** (column/row, thirds, end-of-list, self-reorder from same container, empty/single, indicator geometry). `DropIndicator.tsx` resolves the deepest canvas container under the pointer (runtime) + renders the computed line during drag (additive/defensive — never blocks Craft). Aligning Craft's final drop index to `dropIndex` is the remaining runtime integration 🟡. | Minor | Sonnet |
| v5.13.0 | 3.0 | ✅ **SHIPPED (logic)** — Command registry + ⌘K palette (Phase C). *Scope = registry + palette, not a full keyboard model.* Pure `commandRegistry.ts` (NO DOM): **CommandDefinition** (identity/labels/keywords/shortcut/group/**action**/**isEnabled(ctx)**) separated from **CommandContext** (selection/clipboard); `COMMANDS` (16, synonym keywords: remove→Delete, clone→Duplicate); `filterCommands` ranked **title-prefix > word-boundary > substring > keyword**, deterministic tie-break (tier→registry index); `commandEnabled`; `hasUniqueIds` invariant. **12 tests** (ranking, empty/no-match, synonyms, enabled-state, unique-id invariant). `CommandPalette.tsx` (⌘K/Ctrl-K, portaled z-popover/I7, arrow/Enter/Esc, disabled rows greyed) dispatches editor commands via `useEditorCommands` + UI actions (undo/redo via coordinator, panel toggles); context via `resolveEffectiveSelection` (I3). Runtime overlay 🟡. | Minor | Sonnet |
| v5.12.0 | 3.0 | ✅ **SHIPPED (logic)** — Marquee (drag-rectangle) multi-select (Phase C, TD-016). Pure `marquee.ts` (NO DOM): `normalizeRect`, `passedThreshold` (4px), `marqueeHits` (intersect/contain, **document-order, deterministic**), `selectionModeFromEvent` (Shift=add, Ctrl/Cmd=toggle), `applyMarqueeSelection` (replace/add/toggle, order-stable). **13 tests** (intersect/contain, partial/edge, zero-area, doc order, threshold, all 3 selection modes). `MarqueeLayer` paints the rect on empty-canvas drag (portaled, z-canvas-overlay, I7), hit-tests only ROOT-descendant (document-backed) node rects, and writes via `uiStore.selectNodes` (single-writer I3). Zoom-safe (both rects screen-space). **Decision: additive/toggle shipped now** (not replace-only). Runtime drag 🟡. | Minor | Sonnet |
| v5.11.0 | 3.0 | ✅ **SHIPPED (logic)** — Snapping + smart guides + equal-spacing/measure (Phase C). Pure `snapGuides.ts` (NO DOM): `computeSnap` (free-move) with **deterministic precedence overlap > edge > center > spacing**, **axes resolve independently** (corner alignment), equal-spacing same-parent only, deterministic tie-break (priority → distance → position → delta); `snapValue` (single-edge), `edgeCandidates`, `measureGaps`. **19 tests** (precedence, threshold boundary, no-match, determinism vs input order, equal-spacing, measure). Wired into the resize drag: moving edges snap to sibling/parent edges/centers (screen-space, threshold ÷ zoom), draw guide lines (pink for spacing), hold **Alt** for distance-to-sibling badges. Runtime drag/overlay 🟡. `computeSnap` is ready for move/free-position. | Minor | Sonnet |
| v5.10.0 | 3.0 | ✅ **SHIPPED (logic)** — On-canvas resize handles + W·H badge + arrow-nudge (Phase C, TD-017). Pure `resizeMath.ts` (`resizeTo` = delta+snap+min-clamp; `nudgeSize` ±1 / Shift ±10; 8px floor) — 14 tests incl. the **resize→layoutModel round-trip** guarantee. RenderNode selection overlay gains **E/S/SE drag handles** (cursors ew/ns/nwse; portaled to body at z-canvas-overlay per I7; zoom-correct via `offsetW/H` and screen-delta/zoom) that convert the affected axis to **Fixed** and write `w/h-[Npx]` through `layoutModel.writeAxisSize` (drops a stale main-axis `flex-1` on Fill→Fixed); live W·H badge during drag. Arrow keys nudge the selected node's size (±1, Shift ±10), converting to Fixed at the current rendered px; ignored while typing in inputs/contentEditable. Runtime drag/nudge 🟡. | Minor | Sonnet |
| v5.9.0 | 3.0 | ✅ **SHIPPED (logic)** — Auto-layout Hug/Fill/Fixed sizing (Phase C, the design-mode spine). New pure `layoutModel.ts` = canonical, **context-aware** translation layer between sizing intent and bounded Tailwind `classOverrides` (no schema change): Hug→`w/h-fit`, Fixed→`w/h-[Npx]`, Fill→`flex-1` (main axis) or `w/h-full` (cross / no-flex). **Round-trip guaranteed:** `parse(write(intent,ctx),ctx) === intent` (exhaustively tested over modes×axes×contexts). StylePanel gains a Width/Height **Size** control (Hug/Fill/Fixed + px) that detects the parent's flex direction as context and reads/writes via the pure layer; `self-*` stays with AlignBar (orthogonal). 11 new tests. Runtime control 🟡. layoutModel is the base future auto-layout (min/max, wrap, distribute, constraints) extends. | Minor | Sonnet |
| v5.8.0 | 3.0 | ✅ **SHIPPED (logic)** — I1/I3/I4/I5 conformance suite + I9 perf baseline (Phase B). **I1:** seeded round-trip property test (`roundTrip.property.test.ts`, 200 trees of known+unknown blocks, `NOVA_RT_SEED` replay) proves `nodesToSchema(schemaToNodes(els)) ≡ els`. **I4:** `withReplay` single guarded coordinator (`replayGuard.ts`, reentrancy-safe, always resets) wraps every Craft `history.undo/redo`; page.tsx undo/redo refactored to it. **I3:** `shouldClearCraftSelection` pure clear-mirror rule + tests; wired into `RightPanelWithSync`. **I5:** dev guard in `updateElements` (canvas edit must not bump `canvasSyncToken`; store.replaying must track the coordinator). **I9:** `perf.ts` marker + `PERF_BUDGETS` + `summarize`/`withinBudget` (tested), wired into LayoutOverlay reposition + `updateElements`; `doc/perf-baseline.md` documents targets (numbers 🟡 @ QA). +20 tests. Runtime undo/selection 🟡. | Minor | Sonnet |
| v5.7.0 | 3.0 | ✅ **SHIPPED (logic)** — I7 UI Layering Contract (Phase B, ADR-041). Named z-layer scale (`canvas<canvas-overlay<chrome<popover<modal<toast`) sourced from `src/lib/zLayers.ts` → Tailwind `z-<layer>` utilities + `--z-*` CSS vars (defaults `z-0…z-50` preserved for user `classOverrides`). Chrome (TopBar/Left/RightPanel flex items) now owns a stacking context above all body-portaled canvas overlays — **fixes the Style panel being covered by selection toolbars/AlignBar**. Every magic z-index across 11 editor files replaced with layer tokens; `zLayers.test.ts` (7) guards scale ordering + `canvas-overlay<chrome` + scans editor source for raw z-index. Enforces invariant I7. Runtime visual 🟡. | Minor | Sonnet |
| v5.6.0 | 3.0 | ✅ **SHIPPED (docs+logic)** — Nova Document Model (Phase A of the Design-Mode plan). `doc/MODEL.md` formalizes the mental-model **umbrella over the ADRs**: representations & authority (Document/Components/Assets/Live Tree/View/Selection/History/Export), the two legal edit directions, the **I1–I10 invariant catalog**, the design-mode north-star benchmark (vs Figma/Unity/v0), the **Hug/Fill/Fixed** auto-layout paradigm, and the bug-triage methodology. `packages/editor/src/model/invariants.ts` names I1–I10 (frozen, exported); ADR.md gains an invariant cross-reference + **corrects the ADR-004 render-loop mis-attribution** → ADR-002/039. 7 new tests. No behavior change → Minor. | Minor | Sonnet |
| v5.5.0 | 3.0 | ✅ **SHIPPED (logic)** — UX & Performance debt resolution (TD-028/029/030, audit Clusters 2+4). TD-028: `AlignBar` no longer mutates parent node; restricted to selected node's `self-*` alignment only; JUSTIFY/ITEMS groups removed; read-only `flex→`/`flex↓` context label added. TD-029: `LeftPanel` migrated from HTML5 `draggable` to `@dnd-kit/core` (PointerSensor) + flat DFS tree (`layersUtils.ts: flattenTree`) + virtual window (scroll+ResizeObserver, OVERSCAN=8, padding-trick). TD-030: `simpleModeUtils.ts` adds `SIMPLE_KNOWN_CLASSES` + `simpleModeOverflow` → amber "Custom"/"Mixed" badge in SimpleModePanel when Advanced-mode classes are invisible to Simple view. 30 new tests (13 layersUtils + 17 simpleModeUtils). Runtime interactions 🟡 (browser-QA batched post-v5). No schema change. | Minor | Sonnet |
| v5.2.0 | 3.0 | ✅ **SHIPPED (logic)** — TD-003 pluggable rate-limiter: `lib/rateLimit.ts` pluggable fixed-window limiter — Upstash REST (INCR+EXPIRE NX, edge-safe, zero new deps) when env vars set, per-instance `Map` fallback otherwise. Pure `shouldBlock`/`advance` unit-tested (20 tests total). `middleware.ts` wired to `createDefaultLimiter`; lazy singleton + `async middleware`. Runtime Upstash path 🟡. | Minor | Sonnet |

³ Labeled Minor (additive DB columns, no `schemaVersion` change, backward-compatible) but it **changes Pro billing behavior** (unlimited → metered) — flagged so the drift stays honest. Built by Opus this session.

¹ Roadmap-assigned model = Sonnet; built by Opus this session (model switching is user-controlled).
² Roadmap-assigned model = Haiku; built by Sonnet this session (model switching is user-controlled).

---

## Forward roadmap (planned)

Source: the v2.0 mega-audit (`doc/audit_v2.0/`, 10 clusters + 4 execution tracks). Each
finding was **re-verified against live code** (≈13/15 confirmed; corrections noted in the
audit). Restructure posture = **Hybrid**: add a `Box` primitive + layout presets but keep
`Row`/`Column` as thin aliases, and decompose only the *brittle* presets — keep the simple
display presets (FAQ/Stats/Testimonials) and the already-decomposed Navbar/Footer.

Execution order follows the audit's track priority (security/data → export → UI → core).

| # | Release | Bump | **Model** | Clusters | Theme |
|---|---|---|---|---|---|
| 1 | **v2.1.0** | Minor | **Sonnet** | 3, 5, 8, 9, 1.4 | ✅ SHIPPED — Security, data-integrity & correctness hotfixes (ADR-030) |
| 2 | **v2.1.1** | Patch | **Haiku** | 7, 9.3, 10.2, 10.3 | ✅ SHIPPED — Code-export crash & deploy fixes (ADR-031) |
| 3 | **v2.2.0** | Minor | **Sonnet** | 2 | ✅ SHIPPED — Canvas overlay portaling (zoom fix, TD-018, ADR-032) |
| 4 | **v2.3.0** | Minor | **Sonnet** | 4 | ✅ SHIPPED — Inspector-panel performance & robustness |
| 5 | **v2.4.0** | Minor | **Sonnet** | 8.3 | ✅ SHIPPED — AI semantic (targetId) patching (ADR-034) |
| 6 | **v3.0.0** | Major | **Opus** | 10.1 | ✅ SHIPPED — Recursive props schema 1.6→2.0 (ADR-035). **C6 + C5.2 split out** ↓ |
| 6b | **v5.0.0** | Major | **Opus** | 6 | ✅ SHIPPED (logic) — Hybrid unified undo + selection desync fix (ADR-039, reverses ADR-009). **C6 only**; runtime 🟡 (browser-QA batched post-v5). |
| 6c | **v5.1.0** | Minor | **Sonnet** | 5.2 | ✅ SHIPPED (logic) — Craft-fork IDs (ADR-040): pinned pnpm patch of `@craftjs/core` mints `node_<8>` at creation; `toNovaId()` removed; closes TD-001/002. Reclassified Major→Minor (no schema/data change). Runtime 🟡 (browser-QA post-v5). |
| 7 | **v3.1.0** | Minor | **Sonnet** | 1 | ✅ SHIPPED — `Box` primitive + layout presets + Section `as` (ADR-036) |
| 8 | **v4.0.0** | Major | **Opus** | 3 | Brittle-preset decomposition + rich text/media |

### v2.1.0 — Security, data-integrity & correctness (Minor → Sonnet)
- **C3.2 XSS** — add `DOMPurify` sanitize before `dangerouslySetInnerHTML` in
  `TextBlock.tsx`; preserve rich text by saving sanitized `innerHTML` (not `textContent`).
- **C5.1 data loss** — in `packages/editor/src/craft-adapter/schemaToNodes.ts`, replace the
  `continue` for unknown types with a new registry **`UnknownBlock`** (red dashed box,
  `isCanvas`, renders children) so subtrees are never silently dropped.
- **C9.1 rate-limit race** — insert a *pending* `credit_transactions` row **before** the AI
  call (`apps/studio/src/app/api/ai/route.ts`); finalize/rollback after.
- **C9.2 unlimited bypass** — log **zero-cost** transactions for unlimited tiers so the
  count-based limiter sees them.
- **C8.1 git ghost files** — diff `base_tree` vs emitted files in
  `packages/git/src/commands/publishFiles.ts`; push `{ path, mode, type, sha: null }` for
  removed files.
- **C8.2 AI parse** — robust JSON extraction (greedy `{…}`/`[…]` match) + provider
  structured-output where available (`packages/ai/src/agents/patcherAgent.ts`).
- **C1.4 style bug** — extend the `novaStyle.ts` bg regex to detect `bg-[` (arbitrary) and
  `bg-gradient-*` so inline `style` no longer clobbers them.
- Tests: regression per fix. VERIFIED rows start 🟡 (server/browser QA).
- **Deferred (TD-003):** full Edge/Upstash-Redis limiter — follow-up; v2.1 does the
  immediate DB-level fix only.

### v2.1.1 — Code-export crash & deploy fixes (Patch → Haiku)
- **C7.1** `pageFile.ts` — sanitize the component name (strip leading non-alpha / invalid
  chars, fallback `"Page"`).
- **C7.2** `propsToJSX.ts` — emit `key={JSON.stringify(value)}` for strings (preserves `\n`).
- **C7.3** `index.ts`/`generateAll` — guard missing `BLOCK_SOURCES` entries; don't emit
  dangling imports; surface an error.
- **C7.4** make the hardcoded `<main className="min-h-screen flex flex-col">` wrapper opt-out.
- **C9.3** remove redundant `triggerVercelDeploy` (`packages/deploy/src/vercel.ts`); rely on
  native GitHub→Vercel.
- **C10.2/10.3** `runner.ts` — `structuredClone` before migrating (pure fns) + a `BaseSchema`
  pre-validation guard with a friendly "not a Nova project" error.

### v2.2.0 — Canvas overlay portaling (Minor → Sonnet)
- **C2** — portal `RenderNode` toolbar / `AlignBar` / `LayoutOverlay` to `document.body`
  (viewport-relative, `position:fixed`), driven by `ResizeObserver` + scroll listener →
  fixes the zoom offset (flips **TD-018**). `AlignBar` tethers to the selected node's bbox,
  mutates **only the selected node**, adds grid alignment. `LayoutOverlay` reposition wrapped
  in `requestAnimationFrame`; margin-vs-gap guard.

### v2.3.0 — Inspector-panel performance & robustness (Minor → Sonnet)
- **C4** — `useDebounce` (~300ms) on PropsPanel text/number inputs; replace fragile Zod
  `_def` introspection with a stable field descriptor; swap LeftPanel HTML5 DnD for
  `@dnd-kit/core` (auto-scroll/animation) + virtualize large trees; fix StylePanel
  simple↔advanced sync (stop showing "No color" when an advanced value exists).

### v2.4.0 — AI semantic (targetId) patching (Minor → Sonnet) ✅ SHIPPED (ADR-034)
- **C8.3** — replaced RFC-6902 array-index patches with a `targetId`-based NovaPatch format
  (`set-prop`, `set-props`, `add-child`, `remove`) + `applySemanticPatch` applier. The LLM
  references elements by ID (`node_<8>`), never by array position. `applySmartPatch` dispatcher
  provides backward compatibility: detects RFC 6902 by presence of `"path"` field. System
  prompt rewritten with NOVA PATCH OPS section and updated OUTPUT FORMAT EXAMPLE. 22 unit tests.

### v3.0.0 — Recursive props schema (Major → Opus) ✅ SHIPPED (ADR-035)
- **C10.1** ✅ — `PropsValueSchema` made fully recursive via `z.lazy()` (array-of-objects +
  nested records now allowed). Schema `1.6 → 2.0`; additive no-op migration (old data still
  valid). `LATEST_VERSION`/`versionChain`/`createDefaultProject` bumped. New `props.schema.test.ts`
  + migration/element test updates. Cluster 10 now fully resolved (10.2/10.3 shipped in v2.1.1).
- **Scope decision:** C6 + C5.2 were **deferred** out of v3.0.0 (see row 6b). They reverse
  documented ADRs (C6→ADR-009 "Craft undo disabled"; C5.2→ADR-012 "no Craft fork") and are
  **verifiable only in a browser**, which this environment lacks (SPEC §2: `apps/studio` is
  typecheck-only). Shipping them blind risks silently breaking the editor core. The schema
  major (1.6→2.0) is the honest driver of the v3.0.0 Major label on its own.

### v3.0.x — Craft-native undo + Craft-fork IDs (DEFERRED, QA-gated)
- **C6** — delete `historyStore.ts`; return undo/redo to Craft's native engine; debounce
  store→DB sync (`updateElements`); unify selection on `useEditor(state.events.selected)`
  (deprecate `uiStore.selectedNodeIds`). Rebuild TopBar to dispatch Craft history. **Reverses
  ADR-009** — Craft history doesn't cover pages/theme/meta/AI patches, so this needs a careful
  bridge + browser QA of undo/redo/selection across all edit sources.
- **C5.2** — remove the `slice(0,8)` ID hack (`nodesToSchema.ts`); mint real `node_<8>` IDs at
  Craft node creation. **Reverses ADR-012** — `@craftjs/core` exposes no id-generation override,
  so this requires a Craft fork (the repo ships `reference/craft.js` for exactly this).
- **Gate:** start once an E2E/browser-QA capability exists; both changes are pure-interaction /
  deep-integration and unit tests can't catch a desync or id-collision regression.

### v3.1.0 — `Box` primitive + layout presets (Minor → Sonnet, Hybrid) ✅ SHIPPED (ADR-036)
- **C1.1 `Box` block** — `packages/registry/src/blocks/Box/`: polymorphic container (`as` prop: div/header/footer/nav/section/main/article/aside, default `div`); `isCanvas: true`; no `canMoveIn` restriction (accepts all block types); `bgColor` defaults to `"transparent"`. Published in `sources.ts` (16 blocks). Use `Box` for internal layout; `Section` for page-level sections with default spacing.
- **C1.2 Layout presets** — `LAYOUT_PRESETS` array in `LeftPanel.tsx` + `buildPresetElement` helper; "Layouts" group above Primitives when not searching; 4 presets (2-col flex, 3-col grid, sidebar-right, sidebar-left). Each injects a nested `Box` tree via `query.parseReactElement`.
- **C1.3 Section `as` prop** — `as?: "section"|"div"|"header"|…` (default `"section"`, backward-compat additive field). `generateSources.mjs BLOCK_NAMES` + `sources.ts` regenerated.
- **Row/Column:** kept as-is (not deprecated — removal would be Major).

### v3.2.0 — Cloudflare Workers Staging Deployment (Minor → Opus, Hybrid) ✅ SHIPPED (ADR-033)
- **Deployment stabilization** — Successfully stabilized the OpenNext Cloudflare deployment pipeline after a rigorous overnight session.
- **OpenNext Regex crash** — Created `patch-open-next.js` in `postinstall` to dynamically remove invalid `(?g)` regex flags generated by OpenNext's path utilities that were crashing `esbuild`.
- **AWS SDK browser exports** — Created `patch-aws-sdk.js` to modify `package.json` files within the Next.js `standalone` build output, bypassing broken `index.browser.js` exports dynamically before `wrangler deploy` instead of forcing harmful dependency downgrades.
- **NextAuth Edge compat** — Bypassed the legacy `openid-client` library in NextAuth by overriding the `GitHubProvider` `token.request` and `userinfo.request` with native `fetch` API, sidestepping the `[unenv] https.request is not implemented yet` bug.
- **NextAuth redirect bug** — Forced the `redirect_uri` to use the Cloudflare runtime `process.env.NEXTAUTH_URL` instead of relying on `provider.callbackUrl`, bypassing Next.js App Router's build-time hardcoding of `localhost:3000`.
- **Wrangler environment syncing** — Added `[vars]` block into `wrangler.toml` to prevent `wrangler deploy` from automatically deleting the plaintext `NEXTAUTH_URL` from the Cloudflare Dashboard during CI/CD.

### v3.2.1 — Cloudflare Asset Deploy Hotfix (Patch → Opus) ✅ SHIPPED
- **TOML Syntax Fix:** Fixed a critical bug where the `assets` directive was swallowed by the `[vars]` TOML table because it was placed below it, effectively deleting the assets configuration from the root. Moved `assets` to the top of `wrangler.toml`.
- **Wrangler Deploy Restore:** Restored `.github/workflows/deploy-cloudflare.yml` to use `command: deploy .open-next/worker.js --no-autoconfig` which correctly uploads assets when `wrangler.toml` is valid, bypassing the broken `opennextjs-cloudflare deploy` hook.

### v4.0.0 — Brittle-preset decomposition + rich text/media (Major → Opus, Hybrid)
- **C3.1** HeroSection — drop the `kids.slice()` hack → real `Box`-based child layout + migration.
- **C3.5** FeatureCard/PricingCard — decompose string props into child primitives + migration
  (keep FAQ/Stats/Testimonials display presets as-is).
- **C3.3** Button/Link — inline `contentEditable` via `_novaEditing` (parity with TextBlock).
- **C3.4** Image — emit `next/image` in the export renderer + flexible aspect ratio.

---

## Phase G — Editor Parity (webstudio UX, nova backend) — v7.x, schema FROZEN 4.0

> Forward initiative ratified 2026-06-26. Design detail: [redesign-webstudio-parity.md](redesign-webstudio-parity.md).
> Governing constraint: **pattern-match webstudio UX above the `extract`/`set`/`setNodeProps` seam;
> never touch the backend** (packages/{schema,editor,registry,renderer,ai,git}, projectStore,
> makeCraftComponent, I1–I10). ⇒ **no schema change** ⇒ `schemaVersion` stays **4.0**, all releases
> are **Minor/Patch** (or Major-by-risk for Modes/DnD), never Major-by-schema.

### Methodology: the audit→version gate (per subsystem)

Each subsystem from the editor mapping runs one gate:
1. **Parity micro-audit** — read nova↔webstudio + one browser session; list the *subtle* gaps
   (missing states, edge cases, under-built interactions) — the "incomplete-not-different" worry.
2. **Verdict:**
   - **OK / parity sufficient** → mark ✅ in [VERIFIED.md](VERIFIED.md), **no version**, next subsystem.
   - **Not OK** → open ONE release, bump by **risk**: polish→Patch(Haiku) · rework→Minor(Sonnet) ·
     architecture→Major-by-risk(Opus). Ship → 🟡 → browser-QA → ✅.

**Versions are minted on a not-OK verdict, not pre-assigned.** This is a methodology + ordered backlog,
not a fixed number ledger.

### Sequencing decision (user, 2026-06-26): **Gate 0 first**

Browser-QA the "Keep" parts BEFORE any panel rework — which simultaneously **closes Phase F**
(v7.0.0–7.0.2 are 🟡). Auditing the keep-parts *is* the Phase F browser QA (one pass, two goals).
Do not rework on an unverified foundation (strategic-pivot: verified-depth over breadth).

### The audit instrument: 22 subsystems

The browser audit covers **22 subsystems**, enumerated with pass/⚠️/❌ feedback in
[qa-checklist.md](qa-checklist.md): **Keep K1–K10** (draft, canvas, select/inspect, inspector tabs, ⌘K,
undo-granularity, export, breadcrumb, inline-text, selection-survival) · **Adjust A1–A10** (rail, Add,
Navigator, Pages, Style+Space, Settings, overlay chrome, DnD, breakpoints, top bar) · **New N1–N3**
(Modes, Assets, provenance). Each subsystem's ✅/⚠️/❌ result maps to the gate below (map at the foot of
qa-checklist). **G0 is the 10 Keep audits**, broken out per-subsystem — not one lumped gate.

### Backlog (ordered verify → value → polish; version assigned at each gate)

| Gate | Subsystem(s) | Class | Bump if not-OK | Note |
|---|---|---|---|---|
| **G0** | Verify Keep **K1–K10** individually (each its own audit) | audit | per-subsystem Patch/Minor | = closes Phase F |
| G1 | Split LeftPanel/StylePanel monoliths into per-panel files | adjust | Patch (Haiku) | unblocks everything after |
| G2 | Settings: tag/id/class; rename Props→Settings + mode-gate Style | adjust | Patch/Minor | |
| G3 | Pages: extract Theme tab; add folders | adjust | Minor | |
| G4 | **Space (padding/margin) widget → ws-grade** (scrub, shift/alt, snap TW-scale) | adjust | Minor (Sonnet) | **template for seam-refactor** |
| G5 | Add panel primitive-first + merge Blocks/Components | adjust | Minor | addresses "dislike blocks" |
| G6 | Navigator depth (css-preview, Global Root, depth-drag) | adjust | Minor | |
| G7 | RenderNode → split into shared overlay components | adjust | Minor | trims 588-line/node |
| G8 | Breakpoints: unify viewport + style-breakpoint | adjust | Minor | fixes the two-concept split |
| G9 | **DnD never-error** (route through cmdMoveNode/cmdInsertElement) | adjust | Minor→Opus | highest interaction risk |
| G10 | **Modes** Design/Content/Preview + TopBar switcher | new | Major-by-risk (Opus) | biggest commercial lever |
| G11 | **Assets panel** | new | Minor (Sonnet) | |
| G12 | **Provenance** label-colors (breakpoint-variant + inheritance) | new | Minor | |

## Critical files by area (forward work)

- **Registry blocks/utils:** `packages/registry/src/blocks/*`, `packages/registry/src/utils/novaStyle.ts`
- **Adapters:** `packages/editor/src/craft-adapter/{schemaToNodes,nodesToSchema,makeCraftComponent,mutations}.ts`
- **Stores:** `apps/studio/src/stores/{projectStore,uiStore,historyStore}.ts`
- **Editor chrome:** `apps/studio/src/components/editor/{RenderNode,AlignBar,LayoutOverlay,MultiSelectToolbar,PropsPanel,LeftPanel,StylePanel,TopBar}.tsx`
- **Renderer:** `packages/renderer/src/{index.ts,generators/pageFile.ts,generators/propsToJSX.ts,blocks/sources.ts}`
- **AI/Git/Deploy/API:** `packages/ai/src/agents/patcherAgent.ts`, `packages/git/src/commands/publishFiles.ts`, `packages/deploy/src/vercel.ts`, `apps/studio/src/app/api/ai/route.ts`, `apps/studio/src/lib/tiers.ts`
- **Schema:** `packages/schema/src/schemas/props.schema.ts`, `packages/schema/src/migrations/runner.ts`
