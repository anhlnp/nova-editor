# WS-PARITY-AUDIT — Nova Builder vs Webstudio (full parity)

> **Audited:** Nova v19.2.2 (commit `4d3d26e`) vs `reference/webstudio` @ `65d8a16` ("fix: Fix nested collection data variable #5835") + `reference/webstudio-community` (docs-only fork, no code).
> **Method:** every ✅/🟠 claim below was verified by reading the named Nova file/symbol in this audit session; every 🔴 claim is backed by a negative grep across `apps/nova-builder/src`; the two 🔴🔴 architecture findings were additionally confirmed at runtime (Playwright computed-style probe + screenshots in `test-results/ws-audit/`). Doc claims (SPEC/ROADMAP/VERIFIED) were treated as leads, not evidence — several were refuted (see §0.2).
> **Scope decision (user):** FULL parity — 100 % of Webstudio features/packages/architecture enumerated; backend re-evaluation of ADR-NB-002 included (§9); visual/UX layer included (§8b). Deliverable of this round is this document + roadmap; migration implementation is Tier P (§12).

---

## 0. Executive summary

### 0.1 Scorecard

| Layer | Rows | ✅ parity | 🟠 partial | 🔴 gap | 🔁 adapt | ⛔ skip |
|-------|------|-----------|-----------|--------|----------|---------|
| A — Data model & schema | 14 | 8 | 3 | 2 | 1 | 0 |
| B — State, sync & persistence | 12 | 2 | 3 | 5 | 2 | 0 |
| C — Canvas runtime | 16 | 4 | 5 | 7 | 0 | 0 |
| D — Builder features | 26 | 6 | 12 | 5 | 1 | 2 |
| E — Shared modules | 24 | 2 | 5 | 15 | 1 | 1 |
| F — Packages | 36 | 19 | 2 | 6 | 3 | 6 |
| G — Server routes & services | 18 | 3 | 4 | 3 | 6 | 2 |
| H — UI/UX & visual design | 12 | 1 | 4 | 7 | — | — |
| **Total** | **158** | **45** | **38** | **50** | **14** | **11** |

### 0.2 Top 10 gaps by impact (all code-verified)

| # | Finding | Sev | Evidence | Fix phase |
|---|---------|-----|----------|-----------|
| 1 | ~~**StyleDecls never paint on the canvas.**~~ **✅ FIXED v20.0.0 (M-S1)** — `canvas/styles.ts` ports the WS pattern (5 sheets: fonts/presets/user/state/helpers; @media per breakpoint, states, mixin source cascade). Probe re-run green, permanent guard `e2e/canvas-styles.spec.ts`. Original finding: no `$styles → CSS` pipeline existed in the iframe; every element showed default computed styles. | ✅ | before: `test-results/ws-audit/canvas-content.png` · after: `builder-1440-after-ms1.png` | ~~M-S1~~ done |
| 2 | ~~**Builder mutations never sync to the canvas after initial load.**~~ **✅ FIXED v21.0.0 (M1)** — `lib/transactions.ts` `updateData()` routes ALL ~25 write-path modules through `serverSyncStore.createTransaction`; proven by `e2e/builder-canvas-sync.spec.ts` (panel edit → iframe computed style changes; undo reverts in iframe). Original finding: zero `createTransaction` callers — the follower never received edits. | ✅ | e2e spec + grep (no direct data-atom `.set()` outside load/sync) | ~~M1~~ done |
| 3 | ~~**Token cascade is broken by design.**~~ **✅ FIXED v22.2.1 (M3)** — `styleInspectorWrite.ts` iterates sources in specificity order (`tokens` first, `local` last), isolating token styles from local overrides. `StyleTokensPanel.tsx` inserts tokens before local sources in the selection array. Breakpoint manager supports condition editing and style migration on delete. | ✅ | `lib/styleInspectorWrite.ts`, `builder/StyleInspector.tsx`, `builder/BreakpointManager.tsx` | ~~M3~~ done |
| 4 | **No expression/data-binding execution.** `dataBinding.ts` is atom CRUD only; no `$ws$dataSource` encoding, no eval, no binding-popover/expression-editor; `elements.tsx:84` silently drops `type:"expression"` children. | 🔴 | negative greps `executeExpression`, `encodeDataSourceVariable` | **M4** |
| 5 | ~~**Undo restores a different world than what was mutated.**~~ **✅ FIXED v21.0.0 (M1)** — undo/redo = immerhin transaction revert across all 10 atoms; `captureSnapshot` deleted (leftover caller = compile error). | ✅ | lib/transactions.ts; lib/history.ts adapter | ~~M1~~ done |
| 6 | **Export loses responsive + stateful styling.** Both exporters skip every non-base breakpoint and every `state` decl (`htmlExporter.ts:125`, `reactExporter.ts:91`) → published output has no media queries, no :hover. WS uses `project-build` + `template` codegen. | 🔴 | both read | **M9** |
| 7 | ~~**Multi-tab / concurrent save is last-write-wins.**~~ **✅ FIXED v22.0.0 (M2)** — patch-based autosave (`saveQueue` → `/api/projects/[id]/patch`, server applyPatches) + `version` optimistic concurrency (409 + conflict UI). Requires migration 0020 on the DB (degraded mode documented until applied). | ✅ | `e2e/save-patch.spec.ts` (env-gated) + node wire probe | ~~M2~~ done |
| 8 | **Builder visual layer is broken + off-standard.** Right-panel tab strip renders as clipped run-on text; state pills clipped at viewport edge; canvas area shows no content at 1280/1440/1920; 49/56 builder files define a local palette (`const C = {…}`) vs 3 importing `uiTheme.ts` — ADR-NB-012 is not actually enforced; 0 files use `ws-design-system`. | 🔴 | `test-results/ws-audit/builder-*.png`; grep counts §8b | **MV1/MV2/MV3** |
| 9 | **No content-model nesting guards.** `treeMove.canAcceptChildren` is a 9-entry hardcoded set; paste/AI-apply have no nesting validation at all (WS: `content-model.ts` + `matcher.ts` driven by component metas). | 🔴 | treeMove.ts read; negative grep | **M5** |
| 10 | ~~**Rich text loses formatting on commit.**~~ **✅ FIXED v22.2.1 (M6)** — Lexical integration (`text-editor.tsx` + `interop.ts`) and enhanced `parseRichHtml` preserve links (a with href prop) and underline (u tag) on commit. | ✅ | `canvas/text-editor/interop.ts`, `lib/richText.ts` | ~~M6~~ done |

**Reading of #1 + #2 together:** the editor's core loop (edit → see result) is broken at two independent layers. The style panels and edit operations are "write-only" — they mutate state that is neither painted (styles) nor delivered (sync). This was invisible to e2e because the specs assert presence (iframe/overlay/panel rows), not painted results — and the QA-gate rows that would have caught it are exactly the ones still 🟡. **M-S1 and M1 are therefore the first migration phases, before any feature parity work.**

> **Update v22.2.1 (2026-07-13):** #1 (WSA-1, M-S1), #2+#5 (WSA-2/WSA-4, M1), #3 (WSA-3, M3), #7 (M2), and #10 (M6) are **fixed** — style token specificity is isolated, rich text preserves underline & links, and canvas interaction parity (M7b) is complete. Top remaining blockers: #4 (expressions, M4), #6 (export fidelity, M9).

### 0.3 What is genuinely at parity

The data model itself (WebstudioData 5.0 Maps, `@webstudio-is/sdk` types), the 19 extracted `ws-*` packages (near-zero drift, §7), component libraries (base + Radix registered with metas/templates), the leader/follower SyncClient transport, canvas selection/hover/overlay/resize/drag-reparent interaction layer (ADR-NB-018), the breadth of style-editor UI (shadows/transforms/transitions/animations/filters/gradients/grid), pages/folders/SEO basics, assets upload (R2), command palette UI, context menu, multi-select, zoom, i18n, auth/billing/teams (Nova-only, §11).

---

## 1. Legend & counting rules

- ✅ **parity** — functioning equivalent exists in Nova, code-verified (file + symbol read this session). A ✅ may still be 🟡 in VERIFIED.md (unQA'd) — that is tracked in the "Nova QA" column, not here.
- 🟠 **partial** — capability exists but named sub-capabilities are missing (listed in Notes).
- 🔴 **gap** — nothing equivalent exists (negative grep recorded in §13).
- 🔁 **adapt** — capability must land on the Nova stack, not as a code port (Remix→Next route handlers, Prisma→Supabase SQL, tRPC→REST+zod, Yjs→Supabase Realtime). Notes name the substitute.
- ⛔ **intentionally skipped** — with mandatory reason; consolidated in §10.
- **Parity means capability parity, not code parity.** A row keyed by a Webstudio source path asks "can a Nova user do this / does Nova have this guarantee", not "does this file exist".
- Row keys = canonical Webstudio source paths (re-auditable by diffing against `ls` output in §13).

Column layout: `WS source | Capability | Nova counterpart | Parity | Target phase | Notes`.

---

## 2. Layer A — Data model & schema

| WS source (packages/sdk + protocol) | Capability | Nova counterpart | Parity | Phase | Notes |
|---|---|---|---|---|---|
| `sdk/src/schema/instances.ts` | Instance tree (id/text/expression children) | `@webstudio-is/sdk` via `packages/ws-sdk` (verbatim) | ✅ | — | expression children accepted by type but dropped at render (§4) |
| `sdk/src/schema/props.ts` | Typed props incl. expression/action/parameter/resource types | ws-sdk types; Nova writes only plain value props | 🟠 | M4 | expression/action/parameter prop types unused |
| `sdk/src/schema/styles.ts` | StyleDecl (property/value/state/listed) | ws-sdk + `$styles` atom | ✅ | — | |
| `sdk/src/schema/style-sources.ts` | local/token sources | ws-sdk + `$styleSources` | ✅ | — | semantics broken at write layer (§0.2 #3) |
| `sdk/src/schema/breakpoints.ts` | minWidth/maxWidth/condition | ws-sdk + `$breakpoints` | 🟠 | M3 | Nova UI edits label+maxWidth only; no minWidth/condition |
| `sdk/src/schema/data-sources.ts` | variable/parameter/resource | ws-sdk + `$dataSources` | 🟠 | M4 | only `variable` created; parameter/resource-typed DataSources unused |
| `sdk/src/schema/resources.ts` | REST/GraphQL resource (expression url/headers/body) | ws-sdk + `$resources` (plain strings) | 🟠 | M5 | no expression fields, never fetched anywhere |
| `sdk/src/schema/pages.ts` | Page/Folder/meta/basicAuth/customMeta/system pages | `$pages` + pages panel | 🟠 | M8b | folders+SEO basics only; no path params, redirects, basicAuth, custom meta |
| `sdk/src/schema/assets.ts` | Asset records with meta | `$assets` + R2 | ✅ | — | |
| `sdk/src/schema/animation-schema.ts` | keyframe animation schema | preset @keyframes strings in canvas page | 🔴 | M10 | no structured keyframe model |
| `sdk` deployment/marketplace meta | Deployment, MarketplaceProduct | — (Nova `$projectMeta`) | 🔁 | M11 | Nova models deploys in Supabase tables instead |
| `project-migrations/` | forward migrations between schemaVersions | `lib/migrate.ts` (`migrateToLatest`, legacy Element[]→5.0) | ✅ | — | pattern exists; single-step today |
| `protocol/` (ProjectBundle import/export) | portable project bundle | — | 🔴 | M11 | no cross-instance import/export format |
| schemaVersion discipline | versioned JSONB with tests | `schema.ts` + migrate tests | ✅ | — | |

## 3. Layer B — State, sync & persistence

| WS source (apps/builder/app/shared) | Capability | Nova counterpart | Parity | Phase | Notes |
|---|---|---|---|---|---|
| `sync/sync-client.ts` + `singleplayer-client.ts` | leader/follower state transfer over emitter | `lib/sync-client.ts` (port) + `lib/sync-stores.ts` | ✅ | — | transport works; see next row |
| immerhin transactions (`nano-states` + `Store`) | every mutation = revertible transaction that emits sync patches | `lib/transactions.ts` `updateData()` — all write paths (v21.0.0) | ✅ | — | fixed §0.2 #2 |
| `commands-emitter.ts` + `builder/shared/commands.ts` | central command registry (100+ commands: shortcuts, palette, menus share one definition) | `builder/commands.ts` registry (9 commands) drives shortcuts + ⌘K Actions (v21.0.0) | 🟠 | M10 | core registry done; WS has 100+ commands incl. panel toggles — grow by extension |
| `sync/project-queue.ts` + `command-queue.ts` | local-first queued saves, offline retry | `lib/saveQueue.ts` (v22.0.0): 1s drain, retry/backoff states, conflict halt | ✅ | — | offline persistence (IndexedDB) not included — revisit with M12 |
| `sync/patch/*` (server patch application) | granular patch save + authz | `/api/projects/[id]/patch` (v22.0.0): applyPatches + ownership + version guard | ✅ | — | fixed §0.2 #7 |
| `sync/multiplayer-client.ts` + `packages/multiplayer-protocol` + Yjs | CRDT co-editing | `lib/presence.ts` (Supabase Realtime, presence+cursors only) | 🔁 | M12 | ADR-NB-009; document patches over Realtime in M12, no Yjs |
| `awareness.ts` | user presence/awareness model | `$collaborators` atom + PresenceLayer | ✅ | — | |
| undo/redo (immerhin revert) | transaction-scoped undo across all containers | transaction revert via `lib/transactions.ts` (v21.0.0; ADR-NB-006 superseded) | ✅ | — | fixed §0.2 #5 |
| `nano-states/*` (14 modules) | UI state atoms | `lib/nano-states.ts` (single file, ~30 atoms) | ✅ | — | monolithic but equivalent |
| `builder-data.ts` / `canvas-api.ts` / `builder-api.ts` | typed cross-frame APIs | postMessage `nova:*` messages + `__webstudio__$__canvasApi` stub | 🟠 | M1 | ad-hoc message contracts, no shared type module |
| `store-utils.ts` / `dom-hooks` etc. | utilities | equivalents inline | ✅ | — | |
| `db/*` (builder-side db access) | Prisma access layer | `lib/supabase-server.ts` | 🔁 | — | ADR-NB-002 |

## 4. Layer C — Canvas runtime

| WS source (apps/builder/app/canvas) | Capability | Nova counterpart | Parity | Phase | Notes |
|---|---|---|---|---|---|
| `shared/styles.ts` (31 KB) | **subscribe $styles → css-engine stylesheet in iframe** (breakpoints as @media, states as selectors, style-source cascade, presets/fonts) | `canvas/styles.ts` (v20.0.0, M-S1) | ✅ | — | Fixed §0.2 #1. Omitted vs WS (scheduled): ephemeral var() fast-path (M3), descendant component (M5), condition-breakpoint simulation (M3), content-edit helpers (M10) |
| `inflator.ts` | normalized data → element tree | `canvas/elements.tsx` (verbatim port) + `webstudio-component.tsx` (simplified) | ✅ | — | |
| `features/webstudio-component/` | full component renderer (expressions, collection scope, hooks) | `webstudio-component.tsx` — props spread only | 🟠 | M4 | no expression props, no scope vars |
| `features/text-editor/` (Lexical, 53 KB + interop) | rich text: bold/italic/link/span/lists, nested instances, toolbar | contentEditable + execCommand + `richText.ts` (b/i only on commit) | 🟠 | M6 | §0.2 #10 |
| `features/build-mode/` | content mode (edit content, not structure) | none (`$builderMode` = design/preview only) | 🔴 | M10 | |
| `instance-selection-events.ts` | click/multi-select on canvas with modifiers | click-select in `canvas.tsx`; multi-select is navigator-only | 🟠 | M7b | no shift-click multi on canvas |
| `instance-hovering.ts` | hover outlines with labels | `mouseover` handler + `[data-ws-hovered]` outline | ✅ | — | no component label on hover |
| `instance-context-menu.ts` | canvas context menu | `contextmenu` → `nova:contextMenu` → builder portal menu | ✅ | — | |
| `interceptor.ts` | intercept link clicks/forms in design mode | none found | 🔴 | M10 | clicking a Link on canvas can navigate the iframe away |
| `selected-instance-effects.ts` | selection side-effects (scroll into view, outline sync) | partial inside SelectionOverlay rAF loop | 🟠 | M7b | no scroll-new-instance-into-view |
| `grid-guide-utils.ts` | CSS grid placement guides | none | 🔴 | M10 | |
| `collaborative-instance.ts` | remote user selection display | remote cursors only (PresenceLayer, builder-side) | 🟠 | M12 | |
| `shared/use-drag-drop.ts` | drop-target computation for component insert DnD | components panel drag + `dragReparent.ts` for moves | ✅ | — | ADR-NB-018 extension |
| `shared/commands.ts` (canvas commands) | canvas-scoped commands | inline handlers in canvas.tsx | 🟠 | M1 | folds into command registry |
| `scroll-state.ts` / `scrollbar-width.ts` | scroll restore / measurement | none | 🔴 | M10 | minor |
| `shared/font-weight-support.ts` | font weight negotiation | none | 🔴 | M8 | with fonts-manager |

## 5. Layer D — Builder features (`apps/builder/app/builder/features/`)

17 dirs + 9 root files — one row each (sub-rows for the big four).

| WS source | Capability | Nova counterpart | Parity | Phase | Notes |
|---|---|---|---|---|---|
| `style-panel/` sections (18 property groups) | typed CSS editors per section | `StyleInspector.tsx` + 10 dedicated editors | ✅ | — | breadth is there; values don't paint (M-S1) |
| `style-panel/style-source-section.tsx` + `style-source/` | token chips per instance, local vs token targeting, rename/duplicate/detach | `StyleTokensPanel.tsx` (list + apply/remove/delete only) | 🟠 | M3 | §0.2 #3 write-target bug; no chips row in Style tab |
| `style-panel/controls/*` (color/unit/font/image/toggle-group…) | reusable typed value controls | ad-hoc inputs per editor | 🟠 | MV2 | no shared control library |
| `settings-panel/props-section` + `controls/*` | meta-driven prop editors (13 control types), prop binding | `SettingsPanel.tsx` editable rows | 🟠 | M4 | no meta-driven control dispatch, no binding button |
| `settings-panel/variables-section` + `variable-popover` | variable CRUD scoped to instances | `DataBindingPanel.tsx` (global list) | 🟠 | M4 | no instance scoping |
| `settings-panel/resource-panel.tsx` + `curl.ts` | REST/GraphQL resource editor + cURL import | resource CRUD rows in DataBindingPanel | 🟠 | M5 | no headers/body editor, no cURL |
| `navigator/` (tree + css-preview) | tree, DnD, css-preview pane | `left-sidebar/navigator/` (tree, cross-parent DnD, context menu, keyboard) | 🟠 | M10 | css-preview missing; label shows "Body Body" duplication (register V-7) |
| `pages/` (25 files: settings, SEO, social preview, custom meta, redirects…) | full page mgmt | `left-sidebar/pages/` + `SEOPanel.tsx` | 🟠 | M8b | title/desc/og/robotsTxt only |
| `assets/` + `builder/shared/asset-manager` + `fonts-manager` | asset library + font upload/mgmt | `left-sidebar/assets/` (image+font upload, grid, delete) | 🟠 | M8 | no font metadata/subsetting, no image transform, no usage refcount |
| `breakpoints/` (13 files) | full CRUD + condition + cascade indicator + canvas width | `BreakpointManager.tsx` + `BreakpointPills.tsx` | 🟠 | M3 | no minWidth/condition; delete leaves orphan decls; no cascade indicator |
| `components/` | component drawer with drag insert | `left-sidebar/components/` | ✅ | — | |
| `command-panel/` | ⌘K palette fed by command registry | `CommandPalette.tsx` (self-contained) | 🟠 | M1 | works; definitions duplicated vs shortcuts |
| `marketplace/` | browse/install templates | `left-sidebar/marketplace/` stub | 🔴 | M11 | |
| `publish/` (domains, CNAME, entri, restricted features) | publish + domain mgmt UI | `DeployPanel.tsx` + `settings/domains` page | 🟠 | M9 | Vercel/GitHub stubs; no DNS verification flow in builder |
| `workspace/` + `canvas-tools/` | canvas chrome: outline, grid guides, width setting | canvas iframe wrapper + zoom in `page.tsx` | 🟠 | MV1 | no canvas-tools layer in builder |
| `keyboard-shortcuts-dialog/` | shortcut help | `KeyboardShortcutsModal.tsx` ("?") | ✅ | — | |
| `footer/` | breadcrumb + status | `Footer.tsx` | ✅ | — | |
| `menu/` | app menu | `TopbarMenu.tsx` | ✅ | — | |
| `help/` | help center links | none | 🔴 | M13 | |
| `blocking-alerts/` | fatal error modals | none (console only) | 🔴 | M10 | |
| `sync-status.tsx` | save/sync indicator | SyncStatusChip (v22.0.0): saving/saved/recovering/error/conflict + reload | ✅ | — | |
| `address-bar.tsx` | page path bar + params | none | 🔴 | M8b | |
| `builder-mode.tsx` / `view-mode.tsx` | design/content/preview switch | `$builderMode` design/preview | 🟠 | M10 | content mode missing |
| `safe-mode.tsx` | recovery on render crash | none | 🔴 | M10 | |
| `share.tsx` / `clone.tsx` | share links w/ tokens, clone project | preview-link copy; no clone, no scoped tokens | 🟠 | M13 | ⛔ token-scoped share links deferred (§10) |

## 6. Layer E — Shared modules (`apps/builder/app/shared/` + `builder/shared/`)

| WS source | Capability | Nova counterpart | Parity | Phase | Notes |
|---|---|---|---|---|---|
| `commands.ts` (100+ commands) | single command definitions | — | 🔴 | M1 | §0.2 #2/#3 companion |
| `copy-paste/` (plugin-instance/html/markdown/webflow/page) | multi-format system-clipboard paste | `$clipboard` **internal atom** only ([nano-states](../apps/nova-builder/src/lib/nano-states.ts)); Ctrl+C never touches system clipboard | 🔴 | M7 | no cross-project, no HTML/Webflow/Figma/markdown |
| `tailwind/` | Tailwind classes → WebstudioData styles | — | 🔴 | M7 | |
| `binding-popover.tsx` | "+" binding UI on any prop | — | 🔴 | M4 | |
| `expression-editor.tsx` (CodeMirror) | expression authoring with completion | — | 🔴 | M4 | |
| `data-variables.ts` | variable usage tracking, rename/delete safety | delete without usage check (`dataBinding.ts:58`) | 🔴 | M4 | |
| `content-model.ts` + `matcher.ts` | meta-driven nesting constraints | 9-entry `TEXT_ONLY_COMPONENTS` set in `treeMove.ts` | 🔴 | M5 | §0.2 #9; paste/AI-apply unguarded |
| `style-object-model.ts` | computed cascade (sources × breakpoints × states) | `getDeclsForInstance` (first-source, 2-breakpoint check) | 🔴 | M3 | §0.2 #3 |
| `style-source-utils.ts` | source add/dup/detach helpers | inline in StyleTokensPanel | 🟠 | M3 | |
| `css-variable-utils.tsx` | --var token graph | `$cssVars` flat record + `:root` injection | 🟠 | M3 | works but no dependency tracking |
| `instance-utils/` (fragment/insert/mutation/slot/tree) | canonical instance mutation helpers incl. Slot semantics | `edit-operations.ts` + `treeMove.ts` (clone/delete/insert/move) | 🟠 | M5 | no fragment format, no Slot |
| `page-utils.ts` + `url-pattern.ts` | path params, validation | plain string paths | 🔴 | M8b | |
| `redirects/` | project redirects | — | 🔴 | M8b | |
| `resources.ts` + `$resources` loader | resource fetch/caching at runtime | — (resources never fetched) | 🔴 | M5 | |
| `system.ts` | system vars (search params, resources) in scope | — | 🔴 | M5 | |
| `pubsub/` | typed pubsub between frames | raw postMessage | 🟠 | M1 | |
| `code-editor*` (CodeMirror base) | shared code editor | `custom-css` textarea | 🟠 | M4 | CodeMirror arrives with expression editor |
| `html.ts` / html generator | HTML → instances | — | 🔴 | M7 | |
| `matcher`-driven component templates | template insertion constraints | templates registered, constraints unchecked | 🟠 | M5 | |
| `clone-project.tsx` | project cloning | — | 🔴 | M13 | |
| `project-settings/` | project settings dialog | scattered across settings pages | 🟠 | M13 | acceptable divergence, row kept for coverage |
| `marketplace/` (shared) | marketplace data plumbing | — | 🔴 | M11 | |
| `entri/` | one-click DNS (Entri) | — | ⛔ | §10 | vendor-specific |
| `polly/` | session recording harness | — | ⛔ | §10 | WS-internal tooling |

## 7. Layer F — Packages (`reference/webstudio/packages/` — 36 rows)

Extraction state verified: `pnpm-workspace.yaml` includes only `apps/*`+`packages/*`; drift vs `65d8a16` is **3 files** (`ws-react-sdk/src/index.ts`, `ws-components/src/html-embed.tsx`, one dnd test snapshot) — reconcile in M0. ADR-NB-007's "resolves from reference/" is **stale** → marked resolved (ADR update this round).

| WS package | Nova state | Parity | Notes |
|---|---|---|---|
| `sdk` | `packages/ws-sdk` verbatim | ✅ | drift 0 |
| `react-sdk` | `packages/ws-react-sdk` | ✅ | drift 1 file (index.ts) — M0 |
| `css-engine` | `packages/ws-css-engine` | ✅ | drift 0; **unused by canvas** (M-S1 consumes it) |
| `css-data` | `packages/ws-css-data` | ✅ | css-tree pinned 3.1.0 (ADR-NB-014) |
| `html-data` | `packages/ws-html-data` | ✅ | |
| `sdk-components-react` | `packages/ws-components` | ✅ | drift 1 file (html-embed) — M0 |
| `sdk-components-react-radix` | `packages/ws-components-radix` | ✅ | |
| `sdk-components-animation` | `packages/ws-components-animation` | 🟠 | package copied; AnimationGroup not registered on canvas |
| `sdk-components-react-remix` / `-react-router` | — | ⛔ | Remix/RR runtimes — Nova exports Next/static (§10) |
| `design-system` | `packages/ws-design-system` | 🟠 | copied; **0 imports** from builder chrome (§8b) |
| `icons` | `packages/ws-icons` | ✅ | |
| `fonts` | `packages/ws-fonts` | ✅ | copied; font pipeline unused (M8) |
| `image` | `packages/ws-image` | ✅ | loader used on canvas |
| `sync-client` | `packages/ws-sync-client` | ✅ | drift 0 |
| `multiplayer-protocol` | `packages/ws-multiplayer-protocol` | ✅ | unused until M12 |
| `template` | `packages/ws-template` | ✅ | |
| `generate-arg-types` | `packages/ws-generate-arg-types` | ✅ | build-time |
| `tsconfig` | `packages/ws-tsconfig` | ✅ | |
| `sdk-cli` | `packages/ws-sdk-cli` | 🟠 | copied; not wired to any Nova flow (M9) |
| `project-build` | — | 🔴 | M9 — replaces exporter stubs |
| `project-migrations` | — (Nova `lib/migrate.ts`) | 🔁 | pattern adapted |
| `project` | — (Supabase `projects` table) | 🔁 | ADR-NB-002 |
| `protocol` | — | 🔴 | M11 |
| `asset-uploader` (Tus resumable) | `lib/r2.ts` simple multipart | 🟠 | M8 — resumable upload for large assets |
| `authorization-token` | — | 🔴 | M13 (share tokens / builder API tokens) |
| `domain` | Supabase `custom_domains` + settings page | 🔁 | M9 — port CNAME validation logic only |
| `feature-flags` | `/api/admin/flags` + Supabase | ✅ | Nova-native equivalent |
| `plans` | `lib/tiers.ts` + billing | ✅ | Nova-native equivalent (richer: credits) |
| `dashboard` | `/projects` page | ✅ | Nova-native equivalent |
| `prisma-client` | — | ⛔ | Supabase SQL (§10) |
| `postgrest` | — | ⛔ | supabase-js covers it (§10) |
| `trpc-interface` / `http-client` | — | ⛔ | REST + zod (§10) |
| `wsauth` | — | ⛔ | NextAuth (§10) |
| `cli` | — | 🔴 | M9 (optional CLI export target) |

## 8. Layer G — Server routes & services

| WS source | Capability | Nova counterpart | Parity | Phase | Notes |
|---|---|---|---|---|---|
| `routes/rest.data.$projectId.ts` + `sync/patch/*` | patch-based document save | `POST /api/projects/[id]/patch` (v22.0.0) + version-guarded full save | ✅ | — | fixed §0.2 #7 |
| `routes/trpc.$.ts` + `services/trcp-router` | typed RPC surface | 44+ REST handlers + zod | 🔁 | — | contract per ADR-NB-015 |
| `services/workspace-router` / `build-router` | project/build orchestration | projects + snapshots routes | 🟠 | M9 | no build artifacts model |
| `routes/cgi.image.$.ts` (+asset/video) | on-the-fly image transform proxy | raw R2 public URLs | 🔴 | M8 | Cloudflare Image Resizing or Worker transform |
| `routes/rest.staged-upload*` + `services/staged-upload` (Tus) | resumable uploads | multipart POST | 🟠 | M8 | |
| `routes/rest.resources-loader.ts` | server-side resource fetch (secrets stay server-side) | — | 🔴 | M5 | |
| `routes/auth.*` + `services/auth-strategy/` | GitHub/Google/dev OAuth | NextAuth (credentials+Google+GitHub) | ✅ | — | |
| `oauth.ws.*` | WS-cloud OAuth provider | — | ⛔ | §10 | |
| `services/builder-session/csrf/cookie` | builder session hardening | NextAuth JWT + middleware | 🔁 | — | |
| `services/project-import.server.ts` | import bundle | — | 🔴 | M11 | |
| `services/token.server.ts` | API tokens for CLI | `/api/keys` | ✅ | — | |
| `services/bloom-filter.server.ts` | asset dedup | — | 🟠 | M8 | nice-to-have |
| `services/notification-router` | in-app notifications | `/api/settings/notifications` (email prefs) | 🟠 | M13 | |
| `routes/_ui.dashboard*` | dashboard app | `/projects` | ✅ | — | |
| `services/destinations/no-store-redirect/cache-control` | infra hygiene | Next/OpenNext defaults | 🔁 | — | re-check in M2 |
| `logout` routers | multi-app logout | NextAuth signOut | ✅ | — | |
| publishing infra (SaaS deploy targets) | Node/CF/Vercel/Netlify/Docker/SSG | export stubs + Vercel/GitHub stubs | 🔴 | M9 | |
| `dashboard` search/cloning | project search/clone | list only | 🟠 | M13 | |

## 8b. Layer H — UI/UX & visual design (user requirement)

**Rule of adaptation (ADR-NB-020, this round):** layout structure, information hierarchy and interaction patterns follow Webstudio's builder; palette/typography/touch-targets follow Nova elder-first tokens (`uiTheme.ts`, ADR-NB-012). `ws-design-system` CSS/theme is NOT imported into builder chrome verbatim; its component *patterns* (unit input, toggle group, collapsible section, color control) are re-implemented on Nova tokens.

### Broken-layout register (before: `builder-{1280,1440,1920}.png` · after: `builder-1440-after-mv.png`) — **ALL RESOLVED v20.1.0/v20.2.0**

| ID | Break | Resolution | Phase |
|----|-------|-----------|-------|
| V-1 | Right-panel tab strip rendered as clipped run-on text | ✅ 3-column grid of explicit labels, `role=tablist`/`aria-selected` ([RightPanel.tsx](../apps/nova-builder/src/builder/RightPanel.tsx)) | MV1 ✅ |
| V-2 | CSS-state pill row clipped at right edge | ✅ pills wrap via shared ToggleGroup ([StyleStateSelector.tsx](../apps/nova-builder/src/builder/StyleStateSelector.tsx)) | MV1 ✅ |
| V-3 | Canvas area showed no project content | ✅ root cause was WSA-1 — unstyled content; paints since M-S1 | M-S1 ✅ |
| V-4 | Style panel bottom clipped at viewport bottom | ✅ verified non-issue: `StyleInspector` scroll-contains sections (`overflowY:auto`); screenshot showed below-the-fold content | MV1 ✅ |
| V-5 | Selection overlay label covered instance content | ✅ label flips BELOW the box when no room above ([SelectionOverlay.tsx](../apps/nova-builder/src/canvas/SelectionOverlay.tsx)) | MV2 ✅ |
| V-6 | Two floating "N" circles over canvas/footer | ✅ identified as the Next.js dev-tools indicator (builder page + iframe = two); `devIndicators: false` (dev-only) | MV1 ✅ |
| V-7 | Navigator row showed "Body Body" | ✅ primary label once + muted component tag only when different ([TreeRow.tsx](../apps/nova-builder/src/builder/left-sidebar/navigator/TreeRow.tsx)) | MV2 ✅ |
| V-8 | Icon rail: dim unlabeled icons | ✅ `aria-label`/`aria-pressed` + inactive contrast 0.3 → 0.60 (`left-sidebar/index.tsx`) | MV2 ✅ |

Standards follow-up: `solid:audit` check **V1** now flags local `const C = {…}` palettes without a uiTheme import (aggregated WARN); the ~45-file backlog is Tier P **MV3**.

### Standards compliance (verified by grep)

| Check | Result | Evidence |
|---|---|---|
| `ws-design-system` usage in builder chrome | **0 / 56 files** | grep `@webstudio-is/design-system` in `src/builder/`, `src/app/` → no hits |
| `uiTheme.ts` adoption (ADR-NB-012 "single source") | **3 / 56 files**; **49 / 56 declare a local `const C = {…}` palette** | grep counts; ADR-NB-012 constraint ("audit WARNs on re-declared palettes") is not implemented in `solid-audit.mjs` |
| Elder-first floors | panel fonts 12–13px (floor met marginally); action buttons ~22px tall (`padding 2px 8px`) vs `TOUCH_TARGET = 44` floor | e.g. `StyleTokensPanel.tsx` btnSt(), `BreakpointManager.tsx` inputs |
| Empty/loading/error states | "Loading project…" plain text; no skeletons; no blocking-alerts equivalent | builder page |

### Webstudio workspace-structure comparison (adopt in MV1)

Adopt from `features/workspace/`: canvas centered with explicit width control + address bar above; panels as fixed-width columns with resize gutters and internal scroll containment; toolbars/panels built from a small shared control set; z-index/portal discipline via one layer contract. Keep Nova: dark theme, 44px topbar, left icon rail concept, VI/EN labels.

---

## 9. Backend re-evaluation (ADR-NB-002) — decision input

Options evaluated against the audited reality (not against docs):

| Criterion | A — Status quo (JSONB full-save + snapshot undo) | B — Hybrid: keep Supabase; adopt WS client architecture (immerhin transactions + command registry + patch save + Realtime patch broadcast) | C — Full WS backend (Remix/tRPC/Prisma/Yjs relay) |
|---|---|---|---|
| Fixes §0.2 #2 (edits don't sync) | ✗ (bug stays) | ✅ transactions are the sync currency | ✅ |
| Fixes #5 (undo inconsistency) | ✗ | ✅ transaction revert replaces 5-atom snapshots | ✅ |
| Fixes #7 (multi-tab clobber) | ✗ | ✅ patch + version column (optimistic concurrency) | ✅ (Yjs) |
| Save payload | whole document every save (grows with project) | ~KB patches | patches/CRDT |
| Multiplayer path | none | same patches over Supabase Realtime (extends ADR-NB-009), no new infra | proven, but relay service + ops |
| Migration cost | 0 | rewrite `lib/history.ts`; route write paths through `serverSyncStore.createTransaction`; ~10 call-site modules (`styleInspectorWrite`, `styleWriteHelper`, `StyleAddProperty`, `edit-operations` callers, `treeMove` appliers, `dataBinding`, `symbols`, `applyWSComposition`, pages CRUD, BreakpointManager); new PATCH-patch route + `version` column | months; two-framework rewrite; orphans auth/billing/i18n/teams; breaks OpenNext/Workers deploy story |
| Nova invariants (ADR-NB-003 public /canvas, NB-005 credits, NB-015 guards) | kept | kept — no route auth changes | at risk wholesale |
| Ops cost | none | none new | relay + Prisma + second schema |
| Regression risk | n/a | medium — mitigated by single-write-path rule (SOLID D) already in place | extreme |

**Verdict: B.** The audit shows A is not a working baseline (its two central assumptions — edits sync, undo restores — are broken), and C buys nothing B doesn't at 10× the cost. **ADR-NB-019** (added to ADR.md this round): backend stays Supabase/NextAuth/REST (ADR-NB-002 *amended*, not superseded); persistence becomes patch-based with optimistic concurrency; history becomes transaction-based (ADR-NB-006 *superseded*, effective M1); multiplayer document sync rides Supabase Realtime patches (ADR-NB-009 *extended*, effective M12). Implementation: M1 (transactions+commands) → M2 (patch save).

---

## 10. Deliberate divergence register (all ⛔ rows)

| WS source | Reason for skipping |
|---|---|
| `prisma-client`, `postgrest` | Supabase (Postgres + supabase-js) already covers ORM/REST-DB access; ADR-NB-002/019 |
| `trpc-interface`, `http-client` | REST route handlers + zod are the Nova contract (ADR-NB-015); tRPC adds a second RPC idiom for no capability |
| `wsauth`, `oauth.ws.*` | Webstudio-cloud OAuth provider embedding; Nova is NextAuth (credentials+Google+GitHub) |
| `sdk-components-react-remix`, `-react-router` | Remix/React-Router runtime component sets; Nova publishes Next/static output (M9 targets) |
| `entri/` | vendor-specific one-click-DNS integration; Nova domain flow validates CNAME directly (M9) |
| `polly/` | WS-internal HTTP-recording test tooling |
| Token-scoped share links (`share.tsx` full parity) | deferred, not rejected — preview-URL sharing covers MVP; revisit at M13 with `authorization-token` port |
| Yjs CRDT co-editing | replaced by Realtime patch broadcast (ADR-NB-019/M12); revisit only if concurrent-edit conflicts prove material |

## 11. Nova-only capability inventory (must survive migration)

| Capability | Where | Touched by |
|---|---|---|
| Multi-provider AI composition + credit gating (ADR-NB-005) | `packages/ai`, `/api/ai*`, `AIPanel` | M1 (applyWSComposition → transaction), M5 (nesting guard on AI apply) |
| i18n en/vi + IP detect (ADR-NB-013/016/017) | `lib/i18n`, middleware | MV1/MV2 (new chrome must use dict keys) |
| Tiers/billing (LemonSqueezy + PayOS, idempotent webhooks) | `lib/tiers.ts`, billing routes | M9 (publish entitlements) |
| Teams/RBAC/seats | teams routes | M12/M13 |
| Comments, activity log, presence+cursors | panels + Supabase Realtime | M12 (shares channel with patches) |
| Password reset + email verification (hashed single-use) | auth routes | — |
| Analytics, form submissions (rate-limited), sitemap/robots | api routes | M9 |
| Snapshots/version history | snapshots routes | M2 (snapshots become patch checkpoints) |
| Admin console, feature flags, branding/white-label | admin/settings | — |
| Symbols (snapshot-copy, ADR-NB-010) | `lib/symbols.ts` | M5 — named divergence vs WS Slot: keep both; Slot = live shared subtree (new), Symbol = detached copy (existing); converge later if usage shows overlap |

## 12. Migration roadmap — Tier P (see ROADMAP.md "Tier P" for the canonical table)

Dependency-ordered; every 🟠/🔴/🔁 row above carries one of these phase ids.

| Phase | Content | Depends | Bump |
|---|---|---|---|
| **M-S1** ✅ | **Shipped v20.0.0** — canvas style rendering (`canvas/styles.ts`): css-engine sheets in iframe (@media from breakpoints, states, source-order cascade, presets, fonts). Unblocked visual verification of every style feature already built. | — | **Major** |
| **M0** | Reconcile 3-file `ws-*` drift vs `65d8a16`; pin upstream commit in a VERSIONS file | — | Patch |
| **MV1** | Builder shell visual remediation: fix V-1…V-6 register; workspace layout per §8b (panel scroll containment, tab strip, overflow rules); migrate chrome to `uiTheme.ts`; add palette re-declaration check to `solid-audit.mjs` | — | Minor |
| **MV2** | Panel visual parity: shared control set (unit input, toggle group, color control, collapsible section) on Nova tokens; V-5/V-7/V-8; touch-target floor | MV1 | Minor |
| **M1** ✅ | **Shipped v21.0.0** — transactions + command registry (ADR-NB-019 p1): updateData single write path (~25 modules), transaction undo, registry-driven shortcuts/⌘K | M-S1 | **Major** |
| **M2** ✅ | **Shipped v22.0.0** — patch save + optimistic concurrency + save queue + sync-status UI (ADR-NB-019 p2; migration 0020 must be applied) | M1 | **Major** |
| **M3** | Style-object-model + token targeting (fix §0.2 #3): local source always separate; source-order cascade; token chips in Style tab; breakpoint minWidth/condition + delete-migration + cascade indicator | M1 | Minor |
| **M4** | Data binding core: expression encode/eval on canvas, binding-popover, CodeMirror expression editor, variable scoping + usage tracking, meta-driven prop controls | M1 | **Major** |
| **M5** | Resources runtime (server-side loader) + Collection with item scope + Slot component + content-model/matcher guards (DnD, paste, AI apply) | M4 | Minor |
| **M6** | Lexical rich-text port (replaces `richText.ts` + execCommand) | M1 | Minor |
| **M7** | Copy-paste: system clipboard + plugin formats (instance JSON, HTML, markdown, Webflow) + Tailwind parser | M5, M6 | Minor |
| **M7b** | Canvas interaction completeness: shift-click multi on canvas, scroll-into-view, link interceptor | M1 | Patch |
| **M8** | Assets/fonts full: font metadata pipeline, image transform route (CF Image Resizing), resumable upload, usage refcount | M0 | Minor |
| **M8b** | Pages advanced: path params (`url-pattern`), redirects, basicAuth, custom meta, address bar | M2 | Minor |
| **M9** | Publish pipeline: `project-build`+`template` codegen replaces exporter stubs (media queries, states, cascade, expressions); deploy targets; domains CNAME flow | M3, M4 | **Major** |
| **M10** | Content mode, grid guides, CSS-preview in navigator, safe-mode + blocking-alerts, interceptor polish, animation schema | M1 | Minor |
| **M11** | Protocol bundle import/export + marketplace | M9 | Minor |
| **M12** | Realtime co-editing: transaction patches over Supabase Realtime + remote selection (extends ADR-NB-009; no Yjs) | M1+M2 | **Major** |
| **M13** | Long tail: help center, clone project, share tokens (`authorization-token`), notifications, dashboard search | M2 | Patch |

## 13. Appendix — frozen inventories & verification log

### Pinned commits
- Nova: `4d3d26e6c23ff112249c4cd5552b6418f640b334` (v19.2.2)
- reference/webstudio: `65d8a1670f783b1159c7a90cbd64475381eadfae`

### Frozen listings (audit date 2026-07-12)
- `builder/features/`: address-bar, assets, blocking-alerts, breakpoints, builder-mode, clone, command-panel, components, footer, help, keyboard-shortcuts-dialog, marketplace, menu, navigator, pages, publish, safe-mode, settings-panel, share, style-panel, sync-status, view-mode, workspace (17 dirs + 9 root files)
- `builder/shared/`: asset-manager, assets, binding-popover, calc-canvas-width, client-settings, collapsible-section, commands, css-editor, css-variable-utils, data-variable-utils, expression-editor, fonts-manager, inert-handlers, instance-context-menu, instance-label, loading, nano-states, relative-time, style-source-actions, topbar, url-pattern, use-disable-context-menu, use-draft-value
- `canvas/`: canvas, collaborative-instance, elements, features/{build-mode,text-editor,webstudio-component}, grid-guide-utils, inflator, instance-context-menu, instance-hovering, instance-selection-events, interceptor, scrollbar-width, selected-instance-effects, shared/{commands,font-weight-support,inert,routing-priority,scroll-new-instance-into-view,scroll-state,styles,use-drag-drop,use-pointer-outline}, stores
- `shared/`: $resources, array-utils, asset-client, awareness, breakpoints(-utils), builder-api/data, canvas-api, clone-project, code-editor(-base), commands-emitter, content-model, context.server, copy-paste/, csrf, data-variables, db/, dom-hooks/utils, entri, form-utils, html, instance-utils/, marketplace, matcher, nano-hash, nano-states/, notifications, page-utils, pages, permissions, polly, project-settings, pubsub, redirects, resources, router-utils, session, share-project, style-object-model, style-source-utils, sync/, sync-client, system, tailwind/, trpc/
- `packages/` (36): asset-uploader, authorization-token, cli, css-data, css-engine, dashboard, design-system, domain, feature-flags, fonts, generate-arg-types, html-data, http-client, icons, image, multiplayer-protocol, plans, postgrest, prisma-client, project, project-build, project-migrations, protocol, react-sdk, sdk, sdk-cli, sdk-components-animation, sdk-components-react, sdk-components-react-radix, sdk-components-react-remix, sdk-components-react-router, sync-client, template, trpc-interface, tsconfig, wsauth
- `routes/` (34) + `services/` (33): as listed in Layer G source sweep

### Verification log (18 checks)

| # | Question | Result |
|---|----------|--------|
| 1 | ws-* drift vs reference HEAD | 3 files differ (react-sdk index.ts, html-embed.tsx, dnd snapshot); workspace no longer includes reference/ → ADR-NB-007 stale |
| 2 | Tokens real? | CRUD+apply only; write-target bug: token becomes `values[0]` and `ensureSource` writes to `values[0]` → local edits mutate token globally |
| 3 | Expressions evaluated? | No. dataBinding.ts is CRUD; no encode/eval; `elements.tsx` drops expression children; undo mismatch ($dataSources not snapshotted) |
| 4 | RepeatList = Collection? | No. Preview-only repetition, no item scope variables |
| 5 | Rich text | contentEditable+execCommand; commit parser handles b/strong/i/em/br only; underline/links lost |
| 6 | Copy-paste formats | Internal `$clipboard` atom only; system clipboard untouched; single format |
| 7 | Command registry? | None; shortcuts hardcoded in `useBuilderKeyboard.ts`; palette re-declares actions |
| 8 | Undo scope | 5 atoms; pages/breakpoints/dataSources/resources/assets excluded but mutated under captureSnapshot |
| 9 | Save path | Full-doc PATCH; no version/concurrency; payload grows with project |
| 10 | Breakpoints | label+maxWidth+add/delete; no minWidth/condition; delete orphans decls; not snapshotted |
| 11 | Assets/fonts | image+font upload/delete on R2; no transform proxy, no font metadata, no refcount |
| 12 | Export fidelity | Base breakpoint only; states skipped; no media queries in output |
| 13 | Pages advanced | title/desc/og/robotsTxt only; no params/redirects/basicAuth/customMeta |
| 14 | Nesting guards | Hardcoded 9-component set in treeMove only; paste + AI apply unguarded |
| 15 | Symbols vs Slot | Snapshot-copy (ADR-NB-010); no Slot; recorded as named divergence (§11) |
| 16 | Broken layout | Runtime screenshots at 1280/1440/1920 (`test-results/ws-audit/`); register §8b V-1…V-8; **canvas paints no StyleDecls** (computed-style probe: all defaults) |
| 17 | design-system usage | 0/56 builder files |
| 18 | Elder-first tokens | 3/56 import uiTheme; 49/56 local palettes; buttons ~22px vs TOUCH_TARGET 44 |

### VERIFIED.md corrections triggered by this audit
- "Edit a style → canvas re-renders immediately" (SPEC §5 flow, VERIFIED style rows): **refuted** — style values neither paint (M-S1) nor sync (M1). Rows downgraded with note in VERIFIED.md (v19.2.3 section).
- All interactive-mutation 🟡 rows (resize/drag-reparent commits, style writes): root cause now known (sync bypass), not a QA formality.
