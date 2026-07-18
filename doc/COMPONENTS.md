# Nova Builder — Component Reference

> Per-file/module reference for `apps/nova-builder/`. Tables only — no prose.
>
> Legacy component reference (`apps/studio`): [`doc/archive/components-legacy-studio.md`](archive/components-legacy-studio.md)

---

## App routes — `apps/nova-builder/src/app/`

| Route | Type | Auth | Purpose |
|-------|------|------|---------|
| `/` | RSC | redirect → `/login` or `/projects` | root |
| `/(auth)/login` | Client | public | email+password login via NextAuth |
| `/(auth)/signup` | Client | public | new account registration |
| `/projects` | Client | required | project card grid; create/delete |
| `/builder/[projectId]` | Client | required | main builder page; seeds atoms, renders all builder chrome |
| `/canvas` | Client | **public** (no redirect) | canvas iframe page; SyncClient follower; Webstudio renderer |
| `/preview/[projectId]` | Client | public | canvas-only preview; no builder chrome |
| `/api/projects` | Route handler | required | GET list + POST create |
| `/api/projects/[id]` | Route handler | required | GET load + PATCH save + DELETE |
| `/api/ai` | Route handler | required | POST AI composition (auth + credit check + rate limit) |
| `/api/auth/[...nextauth]` | NextAuth | — | NextAuth JWT handler |
| `/api/auth/register` | Route handler | public | email+password signup |

---

## Builder UI — `apps/nova-builder/src/builder/`

| File | Responsibility | Key pattern / gotchas |
|------|---------------|-----------------------|
| `Topbar.tsx` | Project name · breakpoint pills · AI toggle · Share · Save | "Share ↗" copies `/preview/${id}` to clipboard + 2s toast; "AI" toggles `$aiPanelOpen`; breakpoint pills set `$selectedBreakpoint` |
| `Footer.tsx` | ↩/↪ undo/redo buttons · breadcrumb ancestor chain | Reads `$canUndo`/`$canRedo` nanostores atoms; breadcrumb built from `$instances` parent map; clicking ancestor sets `$selectedInstanceId` |
| `RightPanel.tsx` | Style / Settings 2-tab panel wrapper | 280 px; `StyleInspector` + `SettingsPanel` toggled by tab |
| `StyleInspector.tsx` | CSS property inspector · `writeStyle()` · `AddPropertyRow` | 8 named `<details>` sections; `StyleValueEditor` per value type; `parseNewValue()` infers type from raw string; `captureSnapshot()` before every write |
| `SettingsPanel.tsx` | Editable prop rows per selected instance | Reads `$props` for selectedInstanceId; onChange mutates `$props` Map; `captureSnapshot()` before write |
| `AIPanel.tsx` | Fixed overlay AI prompt panel | `position:fixed`, top 52px, z-index 100; calls `POST /api/ai`; `applyWSComposition(result.composition)` on Apply; Escape closes; `$aiPanelOpen` atom |

### `builder/left-sidebar/` (module structure)

| File | Responsibility |
|------|----------------|
| `index.tsx` | Sidebar container; 4-tab icon rail; 4px resize handle (min 180/max 360 px; `localStorage` persist) |
| `navigator/index.tsx` | Navigator orchestrator; `$expandedIds` atom; auto-expand ancestors on selection change; sessionStorage persist |
| `navigator/TreeRow.tsx` | Single row: `▶`/`▼` expand toggle; instance icon + label; `draggable` attribute |
| `navigator/ContextMenu.tsx` | Portal context menu at cursor; Rename / Delete / Duplicate / Wrap in Box; Escape / click-outside dismiss |
| `navigator/useDnd.ts` | HTML5 DnD; same-parent-only constraint (cross-parent drop rejected); dashed drop indicator |
| `components/index.tsx` | Components panel; grouped by `WsComponentMeta.category`; search |
| `components/ComponentItem.tsx` | Draggable component card |
| `components/useDraggable.ts` | mousedown → ghost card → `$publisher` pubsub dragStart/Move/End |
| `pages/index.tsx` | Pages panel; list + "+" inline create form |
| `pages/PageItem.tsx` | Display mode / editing mode; double-click to rename |
| `pages/usePageCrud.ts` | `createPage` / `renamePage` / `deletePage` (guard: ≥1 page always); `captureSnapshot()` before mutations |
| `assets/index.tsx` | Stub — "Assets coming soon" |

---

## Canvas — `apps/nova-builder/src/canvas/`

| File | Responsibility | Key pattern |
|------|---------------|-------------|
| `canvas.tsx` | Main canvas component; click + mouseover event listeners | Reads `[data-ws-selector-id]` on click → sets `$selectedInstanceSelector`; on mouseover → sets `$hoveredInstanceSelector`; subscribes to `$publisher` for DnD from ComponentsPanel |
| `webstudio-component.tsx` | Inflates one `Instance` → React element via `components.get(instance.component)` | Sets `data-ws-selector-id` (comma-joined selector), `data-ws-selected` (when selected), `data-ws-hovered` (when hovered); renders children recursively |
| `shared/styles.ts` | Injects CSS into canvas `<head>` | Selection: `[data-ws-selected] { outline: 2px solid #7c3aed }` · Hover: `[data-ws-hovered]:not([data-ws-selected]) { outline: 1px dashed rgba(124,58,237,0.5) }` |

---

## App canvas page — `apps/nova-builder/src/app/canvas/`

| File | Responsibility |
|------|---------------|
| `page.tsx` | Canvas iframe page; `SyncClient(role:"follower")`; reads `window.__webstudioSharedSyncEmitter__`; injects `<style>` for selection/hover outlines; calls `registerComponentLibrary()` |

---

## Lib — `apps/nova-builder/src/lib/`

| File | Exports | Notes |
|------|---------|-------|
| `data-stores.ts` | `$instances`, `$props`, `$styles`, `$styleSources`, `$styleSourceSelections`, `$breakpoints`, `$pages`, `$assets`, `$projectMeta`; `seedDataStores()` / `resetDataStores()` | All nanostores `atom<Map>` or `atom<T>` |
| `nano-states.ts` | `$selectedInstanceId`, `$selectedInstanceSelector`, `$hoveredInstanceSelector`, `$selectedPageId`, `$selectedBreakpoint`, `$builderMode`, `$registeredComponentMetas`, `$publisher`, `$aiPanelOpen`, `$canUndo`, `$canRedo` | Cross-cutting UI state atoms |
| `history.ts` | `captureSnapshot()`, `undo()`, `redo()`; `$canUndo`, `$canRedo` | Shallow Map snapshot stack; max 50 entries; past[]/future[] stacks |
| `sync-client.ts` | `SyncClient`, `NanoEventsSyncEmitter`, `createObjectPool`, `registerContainers` | leader injects emitter into iframe; follower reads `window.__webstudioSharedSyncEmitter__` |
| `schema.ts` | `deserializeWebstudioData()`, `serializeWebstudioData()` | Map ↔ plain-object serialization for JSONB storage |
| `supabase-server.ts` | `getUserProjects()`, `getProject()`, `saveProject()`, `createProject()`, `deleteProject()` | Server-only; Supabase service-role client |
| `auth.ts` | NextAuth config; `CredentialsProvider` (email+bcrypt); `GoogleProvider`; `GitHubProvider` | JWT strategy; session user has `id`, `email`, `tier` |
| `emptyProject.ts` | `emptyProjectSchema()` | Seeds valid `WebstudioData` v5.0 for new projects: 1 page, 1 root Box instance, 1 base breakpoint |
| `applyWSComposition.ts` | `applyWSComposition(result: WSCompositionResult)` | Merges AI-generated instances/props/styles into all data atoms; updates page rootInstanceId; calls `captureSnapshot()` first |

---

## Packages (active)

| Package | Name | Purpose |
|---------|------|---------|
| `packages/ai/` | `@studio/ai` | Multi-provider AI; `composerAgentWS`; credit deduction; rate limiting; `validateCompositionWS` |

### Webstudio SDK packages (resolved from `reference/webstudio/packages/*` — Phase 12 pending)

| Package name | Purpose |
|--------------|---------|
| `@webstudio-is/sdk` | Core types: `Instance`, `Prop`, `StyleDecl`, `StyleSource`, `Breakpoint`, `Page`, `Asset` |
| `@webstudio-is/css-engine` | `toValue()` — structured `StyleValue` → CSS string; `merger.ts` |
| `@webstudio-is/css-data` | CSS property metadata |
| `@webstudio-is/react-sdk` | Runtime renderer; `webstudio-component`; `selectorIdAttribute` |
| `@webstudio-is/sdk-components-react` | ~30 base components (Box, Heading, Paragraph, Button, Link, Image, Form…) |
| `@webstudio-is/sdk-components-react-radix` | ~15 Radix UI wrappers (Dialog, Select, Accordion…) |
| `@webstudio-is/sync-client` | `SyncClient` leader/follower; `NanoEventsSyncEmitter` |
| `@webstudio-is/icons` | SVG icon components |
| `@webstudio-is/fonts` | Font metadata |
| `@webstudio-is/image` | Image optimization helpers |

---

## Deprecated / legacy packages (apps/studio only — do not import in nova-builder)

| Package | Status |
|---------|--------|
| `packages/schema/` | ⚠️ Legacy `Element[]` / `Project` types; `apps/studio` still uses |
| `packages/editor/` | ⚠️ Craft adapter; `apps/studio` still uses |
| `packages/registry/` | ⚠️ 16 Craft blocks; `apps/studio` still uses |
| `packages/renderer/` | ⚠️ Codegen from `Element[]`; replaced by `project-build` in Phase 12 |
| `packages/deploy/` | 🔄 Vercel trigger; needs WebstudioData update (Phase 12) |
| `packages/git/` | 🔄 GitHub sync; needs WebstudioData update (Phase 12) |
