# Nova — Component Reference

> What each part *contains*, its key design pattern / clever bits, and gotchas. Tables only.
> Scope reflects code audited as of v1.4. Entries marked ⚠️ have known debt (see `memory/project_nova_technical_debts.md`).

## Editor UI — `apps/studio/src/components/editor/`

| Component | Contains / responsibility | Key pattern & gotchas |
|---|---|---|
| `RenderNode.tsx` | Per-node canvas chrome via Craft `onRender` (ADR-017): selection/hover outline, floating toolbar (drag/select-parent/delete), layout badge. Hosts `<AlignBar>` + `<LayoutOverlay>`. | Connects label to `_novaName\|\|displayName\|\|name`. Toolbar portals to **`document.body`** with `position:fixed` — escapes the canvas `transform:scale(zoom)` containing block (C2/ADR-032, flips TD-018). Subscribes to `zoom` + panels for reposition. Plain click = `clearMultiSelection`; modifier-click handled by the sync, not here. |
| `RightPanel.tsx` | Props/Style tabbed inspector for the selected node. Mounts both `PropsPanel` + `StylePanel` (toggled via `hidden`). Header toolbar (dup/move/copy/delete). | Reads `selectedNodeId` from `uiStore`; writes via `actions.setProp`. Collapsible. |
| `PropsPanel.tsx` | **Schema-driven** props form (W5): derives fields from the block's Zod schema → controls via `getFieldDescriptors` from `@studio/registry`. Replaced the former per-block `*.settings.tsx` (since removed, TD-013). | Handles ZodEnum/Boolean/Number/String/Array **and ZodUnion-of-literals** (column counts; numeric coercion). Unknown types → field silently skipped. **Text/number/textarea inputs debounced 300 ms (C4.1)** — local state for immediate UI feedback, deferred `setProp` to reduce Craft re-renders. Zero Zod `_def` usage (C4.2) — all introspection is in `fieldDescriptors.ts`. |
| `StylePanel.tsx` | Visual Tailwind editor → writes `props.classOverrides[]`. Sections: Layout/Flex-child/Grid-child/Spacing/Sizing/Position/Typography/Background/Border/Effects/Raw. Modes: simple/default/focus/advanced. Breakpoint+state+dark variant bar. | Single `mutate()` producer avoids stale-closure when composing writes. Child sections gate on **parent's** computed display; LayoutSection falls back to computed display for base-class flex/grid. Raw section has per-class `×` + **Clear all**. Emits only canonical classes (must be in tailwind safelist). **Arbitrary value sync (C4.4):** Background > Color and Typography > Color selects inject the current arbitrary value (gradient, `[#hex]`, etc.) as a labelled option (`"value ↵"`) when it's not in the named palette, preventing the "No color" blind-spot when switching from Advanced mode. |
| `LeftPanel.tsx` | The icon-rail sidebar + all 5 sections: Layers (tree, DnD reparent/reorder, rename F2, hide, context menu), Blocks (primitives/presets, grid/list), AI (chat, conversations, providers), Templates (save/apply), Pages (pages CRUD + SEO, Theme tab). Also `BlockPickerModal` (popover). | `buildBlockElement()` is the single insertion path (click/drag/Layers) incl. `defaultChildren`. AI state cached at module scope across tab switches. ⚠️ Theme tab tokens unused in editor (TD-019). `BlockPickerModal` now mirrors primitives/presets grouping. **Layer tree auto-scroll (C4.3):** `onDragOver` on the scroll container detects cursor within 48 px of top/bottom edge and scrolls 8 px/frame via `requestAnimationFrame`. **Layout presets (v3.1.0 C1.2):** `LAYOUT_PRESETS` array + `buildPresetElement` helper; "Layouts" group above Primitives (hidden when searching) with 4 presets that inject nested `Box` trees via `query.parseReactElement`. |
| `Canvas.tsx` | Craft `<Frame>` host; viewport width + zoom transform; empty-state; bottom ancestry breadcrumb. `onClickCapture` preventDefault on `<a>/<button>` so editor clicks select not navigate. | `<Frame key={activePage}>` remounts on page switch (reload). External edits enter via `<CanvasSync>`, not `data`. |
| `MultiSelectToolbar.tsx` | Floating toolbar at ≥2 selected: Delete/Duplicate all, Group, (Ungroup). | Dispatches pure `cmdGroupNodes`/`cmdDeleteMany` directly via `applyExternalSchema`. ⚠️ Ungroup branch here is unreachable (needs 1 sel) — Ungroup lives in the canvas ContextMenu instead. |
| `ContextMenu.tsx` | Right-click node menu: dup/copy/cut/paste/move/select-parent/extract/**ungroup (Section)**/delete. | `runOn()` re-selects the right-clicked node first, then dispatches `editorCommands`. |
| `AlignBar.tsx` | On-canvas alignment bar for a node inside a flex parent: writes parent `justify-/items-` + child `self-`. | Renders only when parent computed display is flex. Portals to **`document.body`** with `position:fixed` tethered to the selected node's `getBoundingClientRect()` (C2/ADR-032). Zoom subscription + scroll/resize listeners for reposition. Writes Tailwind classes (responsive-safe). |
| `LayoutOverlay.tsx` | Gap-drag bands between flex/grid children → drag to set `gap-*`. | Portals to **`document.body`**; `reposition` wrapped in `requestAnimationFrame`; `ResizeObserver` on `.nova-canvas-page` + zoom subscription. **Margin-vs-gap guard:** bands only appear when container has CSS `columnGap`/`rowGap` > 0, preventing drag handles over child-margin spacing (C2/ADR-032). NOT element resize handles (TD-017). |
| `TopBar.tsx` | Logo/project/page-select, undo/redo, viewport, zoom, credits, dirty flag, upgrade, deploy settings, onboarding replay, Publish. Test-account `TierSwitcher`. | Zoom input clamped 25–100% to match `uiStore.setZoom` [0.25,1]. |
| `Onboarding.tsx` | First-run coachmark tour (localStorage-gated), replayable. | Anchors to `[data-onboard=…]`; degrades to centered if anchor missing. |
| `useEditorCommands.ts` | Hook bridging pure `editorCommands` → app state (reads page+selection+clipboard, runs, re-syncs canvas, updates selection). | Resolves the target via `primarySelection` over both selection sources (ADR-039). Since v5.1.0/ADR-040 Craft mints `node_<8>` at creation, so the selected id is already the schema id — no `toNovaId` normalization needed. |

## Stores — `apps/studio/src/store/`

| Store | Holds | Notes |
|---|---|---|
| `projectStore.ts` | project, activePage, dirty, history slice, `canvasSyncToken`, page ops, theme | `updateElements` (canvas→store) does NOT bump `canvasSyncToken` (render-loop guard, ADR-004). External edits (AI/undo) DO bump it. Draft saved (debounced) on every change. |
| `uiStore.ts` | selection (`selectedNodeId` + `selectedNodeIds[]`), leftSection, viewport, zoom, contextMenu, panels, aiProvider, clipboard | `selectNode` resets the multi-set; `addToSelection` extends it. `setZoom` clamps [0.25,1]. `removeFromSelection` currently unused. |
| `userStore` / `toastStore` | tier/credits/identity · toasts+confirm | — |

## Editor package — `packages/editor/src/`

| Module | Contains | Key pattern |
|---|---|---|
| `craft-adapter/makeCraftComponent.tsx` | HOC wrapping each pure block for Craft (drag/select); **forwards props incl. `classOverrides`** (the block merges via `cn` itself — ADR-027); inline-edit injection (`_novaEditing`/`_novaOnCommit`) | `display:contents` wrapper connects child's `firstElementChild` (real box). ADR-012/017. No more `_novaClass` pre-merge. |
| `craft-adapter/schemaToNodes.ts` | schema Element[] → Craft SerializedNodes (editor load) | Unknown/unmigrated block types render as the `UnknownBlock` fallback with children PRESERVED (C5.1/ADR-030 — no more silent subtree deletion). ⚠️ hardcodes `hidden:false`/`custom:{}` — Craft `hidden`/`custom` are NOT round-tripped (rename now uses `_novaName` prop instead). |
| `craft-adapter/nodesToSchema.ts` | Craft nodes → schema (every onChange) | Passes Craft ids through verbatim — they're already `node_<8>` since the v5.1.0/ADR-040 createNode patch (no more `toNovaId` slice); a dev-only `assertNovaId` warns if the patch isn't applied. Copies `node.props` wholesale → `classOverrides`/`_novaName` persist. Restores an `UnknownBlock`'s original `type` from `_novaUnknownType` (lossless round-trip, ADR-030). |
| `operations/` | Pure `Element[]`/`Project` ops: clone-with-new-ids, find/insert/move/remove/duplicate, group/ungroup, clipboard, page ops | ADR-016/019. 100% unit-tested, browser-free. |
| `commands/editorCommands.ts` | Command registry over `EditorState` (delete/dup/copy/cut/paste/move/**ungroup**) | Pure transitions; dispatched by UI. |
| `storage/historyStore.ts` | 20-snapshot undo/redo (ADR-009) | `past`/`future`; `canUndo = past.length>1`. |
| `storage/draftStorage.ts` | Debounced (1.5s) IndexedDB draft via localforage | ⚠️ not cleared after publish → restore prompt can reappear ≤24h. |
| `templates/applyTemplate.ts` | Instantiate page/project template, re-mint ids | ADR-014/019. |

## Registry — `packages/registry/src/`

| Item | Notes |
|---|---|
| `types.ts` `RegistryBlock` | `{ component, schema, defaults, aiHints, craftConfig{displayName,isCanvas,rules.canMoveIn}, defaultChildren?, inlineEditProp? }` (the `settings` field was removed — TD-013) |
| `utils/cn.ts` | `twMerge` wrapper — **every block merges base+`_novaClass` through this** (ADR-023). |
| `utils/novaStyle.ts` | `hasBgOverride/hasTextColorOverride/hasBorderColorOverride` — suppress prop inline-color when an override sets it. |
| `blocks/Box/` | **v3.1.0 (C1.1/ADR-036)** Generic polymorphic layout container. `as` prop switches HTML element (div/header/footer/nav/section/main/article/aside); `bgColor` defaults to `"transparent"`; `isCanvas: true`, no `canMoveIn` restriction. The blank-canvas counterpart to `Section` (which ships with default spacing). |
| blocks `*/index.ts` | Assembles `RegistryBlock`; `defaultChildren` for composites (Navbar/Hero/PricingCard/Footer). The per-block `*.settings.tsx` were **removed** (TD-013 — PropsPanel replaced them). |

## Renderer — `packages/renderer/src/`

| Module | Contains | Notes |
|---|---|---|
| `index.ts` `generateAll` | schema → file map (pages, layout, tailwind config, block sources, `_novaStyle`) | Free tier skips; Pro emits. **Throws** if any element type has no `BLOCK_SOURCES` entry — prevents dangling imports (C7.3/ADR-031). |
| `generators/pageFile.ts` | Element tree → JSX; imports blocks; SEO metadata export | Sanitizes component name (strips leading non-alpha, fallback `"Page"` — C7.1). Wraps elements in `<>…</>` React fragment (removed hardcoded `<main>` wrapper — C7.4). |
| `generators/propsToJSX.ts` | props → JSX attrs | Strips `_nova*` (editor-only). Strings emitted as `key={JSON.stringify(value)}` — preserves `\n`/control chars (C7.2). |
| `blocks/sources.ts` | **GENERATED** (ADR-027) — `BLOCK_SOURCES` + `NOVA_STYLE_SOURCE` derived from the live registry blocks by `generateSources.mjs`. Do not edit by hand. | Regenerate: `node packages/renderer/src/blocks/generateSources.mjs --emit`. Drift test in `sources.test.ts` fails CI if stale. Emitted `_novaStyle.ts` uses real `cn` (tailwind-merge). |
| `blocks/generateSources.mjs` | The codegen: reads registry blocks + `cn.ts`/`novaStyle.ts`, rewrites util imports → `./_novaStyle`. | Single source of truth = the live blocks. |

## AI package — `packages/ai/src/`

| Module | Contains | Key pattern |
|---|---|---|
| `agents/plannerAgent.ts` | Produces a high-level plan (string) from the user's request + current schema. Cheap model call. | Used to give the patcher focused context without needing the full schema on every attempt. |
| `agents/patcherAgent.ts` | Produces a `NovaPatch[]` (or legacy RFC 6902) array from the plan + registry hints. Up to 3 retries on parse failure. | `extractJsonPatch` recovers the array from conversational preamble / markdown fences (C8.2/ADR-030). Returns `unknown[]` — caller validates. |
| `utils/applyPatch.ts` | `applyAndValidatePatch(schema, patches)` — RFC 6902 via `fast-json-patch` + `ProjectSchema.parse`. Throws on invalid result (ADR-006: no credit on throw). | Used by `applySmartPatch` for backward-compat RFC 6902 patches. |
| `utils/semanticPatch.ts` | **C8.3 (ADR-034)** — `NovaPatch` type union (`SetPropOp`/`SetPropsOp`/`AddChildOp`/`RemoveOp`); `applySemanticPatch` (ID-based tree search + Zod validate); `applySmartPatch` dispatcher. | LLM references elements by `id` (`node_<8>`), never by array index. `applySmartPatch` detects RFC 6902 (has `"path"`) for backward compat. `add-child` supports both `node_<8>` (element children) and `page_<6>` (page top-level). |
| `prompts/system.prompt.ts` | `buildSystemPrompt(registryHints)` — injects block catalog + NovaPatch format instructions for the patcher. | Contains HARD RULES, NOVA PATCH OPS (4 ops), STYLING / LAYOUT REASONING, PATCH DISCIPLINE, and OUTPUT FORMAT EXAMPLE. Rewritten in v2.4.0 from RFC 6902 to NovaPatch format. |
| `providers/` | `AIProvider` interface + 6 concrete providers (`anthropic`, `openai`, `google`, `groq`, `openrouter`, `mistral`). | Last three reuse the OpenAI SDK via custom `baseURL` (free tier). Per-op credit cost in `PROVIDER_CREDIT_COST`. |

## Schema package — `packages/schema/src/`

| Module | Contains | Key pattern |
|---|---|---|
| `schemas/props.schema.ts` | `PropsValueSchema` + `PropsSchema` (`Record<string, PropsValue>`) — the JSON-serializable prop value contract (ADR-010). | **Fully recursive via `z.lazy()`** since schema 2.0 (C10.1/ADR-035): a value is a leaf · array of values · record of values, nested arbitrarily (array-of-objects now allowed). `PropsValue` TS type declared explicitly (z.lazy output isn't inferrable). |
| `schemas/element.schema.ts` | `ElementSchema` (`id`/`type`/`props`/`children[]`), recursive via `z.lazy()`. | ID regex `^node_[A-Za-z0-9_-]{8}$` (ADR-005). |
| `schemas/project.schema.ts` | `ProjectSchema` (`schemaVersion`/`meta`/`pages[]`/`theme?`) + `ThemeSchema`. | `schemaVersion` is a `MAJOR.MINOR[.PATCH]` string (ADR-007). |
| `migrations/runner.ts` | `migrateToLatest(raw)` — step-by-step chain `1.0→…→1.6→2.0`. | Pre-validates non-Nova input (C10.3) + `structuredClone`s before migrating (C10.2, ADR-031). `1.6→2.0` is an additive no-op version bump (ADR-035). `LATEST_VERSION` + `versionChain` define the chain. |
| `defaults.ts` / `templates.ts` | `createDefaultProject` (stamps `LATEST_VERSION`), `templateFromPage`/`templateFromProject`. | Default project = HeroSection (2 TextBlock children) + Footer. |
