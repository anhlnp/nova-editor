# EXHAUSTIVE Audit Report - Cluster 6: State Management & Stores

This cluster manages the core logic of the application: `projectStore` (data), `uiStore` (interface state), and `historyStore` (undo/redo). The audit reveals critical memory leaks and anti-patterns in how history and selection state are synchronized with the Canvas.

---

## 1. Comprehensive Issue Identification

### A. The History Memory Bomb
1. **No Structural Sharing:** `historyStore.ts` maintains an array of the last 20 `Project` snapshots. While Zustand is immutable, the `nodesToSchema.ts` adapter completely rebuilding the `Element[]` array on every Craft.js `onNodesChange` event destroys any chance of structural sharing. 
2. **The Consequence:** Every time the user breathes, the system creates a full deep clone of the entire DOM tree in memory. For a 1000-node project, 20 history states = 20,000 active node objects kept alive in memory. This will cause severe Garbage Collection (GC) stuttering and eventually crash the browser on large landing pages.

### B. The "Micro-Step" History Pollution
1. **Unbatched Pushes:** `projectStore.updateElements` blindly calls `get().pushHistory(newProject)` every time it fires.
2. **The Consequence:** Because `updateElements` fires on every keystroke (due to the `PropsPanel` flaw from Cluster 4) and every pixel of a drag event, the history stack immediately fills up with useless micro-steps. A user dragging a component for 1 second will generate 60 history states, wiping out their entire actual undo history. Hitting "Undo" will just move the component back 1 pixel.

### C. The Undo/Redo "Sledgehammer"
1. **Total DOM Destruction:** To implement Undo, `projectStore.applyHistorySnapshot` increments `canvasSyncToken`. This forces the Canvas to run `schemaToNodes.ts`, destroying the entire Craft.js internal tree and remounting every single React component from scratch.
2. **The Consequence:** 
   - Massive UI lockup during an Undo operation.
   - Any local component state (e.g., an opened dropdown or a playing video) is instantly destroyed.
   - The user's selection and focus state is lost.

### D. Dual-State Selection Desync
1. **Competing Truths:** `uiStore.ts` tracks `selectedNodeIds`. However, Craft.js internally tracks its own selection state (`state.events.selected`). 
2. **The Consequence:** If a user clicks a node, Craft updates its state, and an event listener presumably updates `uiStore`. But if `uiStore` clears its selection programmatically (e.g., when closing a panel), Craft's internal state remains untouched. This creates phantom selections where the UI thinks nothing is selected, but hitting "Delete" still deletes a component because Craft still holds the selection.

---

## 2. Architectural Decisions & Recommendations

The stores are currently acting as blunt instruments, passing massive JSON objects back and forth instead of utilizing fine-grained updates.

### Option A: The "Patch-Based" History (e.g., Immer / JSON Patch)
- **Concept:** Instead of storing 20 full copies of the `Project` tree, the `historyStore` only stores JSON diffs (patches) using a library like `immer` or `rfc6902`.
- **Pros:** Minimal memory footprint. Completely eliminates GC stuttering.
- **Cons:** Extremely difficult to synchronize with Craft.js, as Craft does not natively accept JSON patches for its internal state.

### Option B: Handing State Back to the Engine
- **Concept:** Delete `historyStore.ts`. Re-enable Craft.js's native undo/redo engine, which is highly optimized for React trees. `projectStore` only saves to the database on a debounced interval, rather than acting as the middleman for every canvas event.
- **Pros:** Silky smooth Undo/Redo that preserves component state and selection. Zero memory overhead.
- **Cons:** Requires rebuilding the TopBar to dispatch Craft actions instead of Zustand actions.

### 🏆 Recommendation for Nova v2.0
**Adopt Option B for History, and unify Selection.**
- **Action 1 (History):** Rip out `historyStore.ts`. The Canvas (Craft) must own the history of the DOM tree. The `projectStore` should only care about *saving* the project to the server, not tracking its every micro-movement.
- **Action 2 (Throttling):** Introduce `lodash.debounce` in the `updateElements` bridge so that it only syncs from Craft to Zustand when the user *stops* interacting (e.g., `onMouseUp` or 500ms after typing).
- **Action 3 (Selection Unification):** Deprecate `selectedNodeIds` in `uiStore.ts`. All UI panels should derive their selection state directly from `useEditor((state) => state.events.selected)` to ensure a single, infallible source of truth.
