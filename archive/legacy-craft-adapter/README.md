# Legacy Craft Adapter — Archived in Phase 7

These files implemented the Craft.js ↔ Nova schema bridge. They were archived when the
nova-builder app replaced the Craft.js canvas with Webstudio's iframe-based canvas renderer.

## Why archived

- `CraftProvider.tsx` — Mounted `<Editor>` (Craft) and wired `onNodesChange` to `nodesToSchema`.
  Dead since nova-builder dropped `@craftjs/core` entirely.
- `craft-adapter/makeCraftComponent.tsx` — HOC wrapping registry blocks so Craft could drag/select them.
- `craft-adapter/NovaRootCanvas.tsx` — The Craft canvas root element registered as `"NovaRootCanvas"`.
- `craft-adapter/schemaToNodes.ts` — `Element[]` → Craft `SerializedNodes` (load path).
- `craft-adapter/nodesToSchema.ts` — Craft `SerializedNodes` → `Element[]` (save path).

## What replaced them

nova-builder uses Webstudio's `SyncClient` + `NanoEventsSyncEmitter` — a unidirectional
atom-to-iframe sync that requires no bidirectional adapter. See `apps/nova-builder/src/lib/sync-client.ts`.

## Do not restore

The `@craftjs/core` dependency has been removed from `packages/editor/package.json`.
Restoring these files without adding it back will cause TypeScript errors.
