# left-sidebar — Changelog

## [8.0.0] — 2026-07-01

### navigator/

- `index.tsx`: orchestrator; `expandedIds` state (Set<string>) with `sessionStorage`
  persist; auto-expands ancestors when `$selectedInstanceSelector` changes; builds
  `parentMap` from `$instances`; manages `renamingId` + `contextMenu` state
- `TreeRow.tsx`: row with separate expand `▶`/`▼` toggle + selection click; `draggable`
  for HTML5 DnD; right-click fires `onContextMenu`; inline `<input>` when `renamingId`
  matches
- `ContextMenu.tsx`: portal fixed at cursor; items — Rename / Delete / Duplicate /
  Wrap in Box; dismisses on Escape or click-outside
- `useDnd.ts`: HTML5 drag; same-parent-only constraint enforced in `handleDrop`;
  `dropIndicatorId` + `dropAbove` for the dashed line indicator

### pages/

- `index.tsx`: page list + inline "+" form (name + path inputs)
- `PageItem.tsx`: display mode (name + path chip) / editing mode (`<input>` on
  double-click); blur/Enter commits rename
- `usePageCrud.ts`: `createPage` / `renamePage` / `deletePage` (guard: ≥ 1 page always)

### components/

- `index.tsx`: search + grouped category list using `ComponentItem` cards
- `ComponentItem.tsx`: pill button with `onMouseDown` starting drag lifecycle
- `useDraggable.ts`: drag lifecycle hook — ghost div follows cursor; `mouseup` over
  canvas fires `onInsert(componentName)` callback

### index.tsx (container)

- Resize handle: 4 px right-edge `div`; `mousedown` → global `mousemove` / `mouseup`;
  width clamped 180–360 px; persists to `localStorage("nova-sidebar-width")`
- Imports updated to `./navigator`, `./pages`, `./components`, `./assets`
