# EXHAUSTIVE Audit Report - Cluster 4: Inspector Panels

This cluster governs the UI sidebars (Left, Right, and Top panels) that users interact with to manipulate the canvas data. The audit reveals critical performance bottlenecks regarding keystroke re-renders and unvirtualized DOM trees.

---

## 1. Comprehensive Issue Identification

### A. `PropsPanel.tsx` Performance & Fragility
1. **The Keystroke Re-render Bomb:** The panel uses standard controlled inputs (`<input value={props[key]} onChange={handleChange} />`). However, `handleChange` immediately fires `actions.setProp()`, pushing the update into the Craft.js global state. This forces the *entire Canvas and the selected component* to re-render on every single keystroke (e.g., typing a 500-word paragraph). There is absolutely no debouncing.
2. **Zod Introspection Fragility:** The panel dynamically generates form fields by introspecting the internal `_def` object of Zod schemas (`def?.typeName === "ZodEnum"`). Zod's internal `_def` structure is undocumented and subject to change without warning in minor version updates. If Zod changes how it stores Union or Enum literals, the entire Props panel will crash.

### B. `LeftPanel.tsx` (Layers) Scaling Failure
1. **Unvirtualized Tree Rendering:** The Layers panel recursively renders every single node in the Craft.js tree via `<LayerItem>`. For a complex landing page with 1,000+ DOM nodes, React must mount 1,000+ `<LayerItem>` components simultaneously. Expanding or collapsing layers will cause massive UI lockups due to the lack of DOM virtualization (e.g., using `react-vtree` or `react-virtuoso`).
2. **HTML5 Drag and Drop Flaws:** Layer reordering relies on raw HTML5 Drag and Drop (`draggable={true}`, `onDragOver`). HTML5 DnD is notoriously buggy, lacks smooth animation, and crucially, *does not support edge-scrolling*. If a user wants to drag a node from the bottom of a long list to the top, they cannot scroll the panel while holding the item.

### C. `StylePanel.tsx` Abstraction Leaks
1. **State Desync across Modes:** The panel has a "Simple" mode (using predefined swatches like `SIMPLE_COLORS`) and an "Advanced" mode. If a user sets a custom hex color `bg-[#123123]` in Advanced mode, and then switches back to Simple mode, the Simple UI cannot represent this value. It visually displays "No color selected", gaslighting the user into thinking their style was removed.
2. **Missing CSS Topologies:** The panel hardcodes specific Tailwind scales (e.g., `gap-` options up to `24`, `grid-cols-` up to `12`). It completely lacks support for `grid-rows`, `backdrop-filter`, or CSS transforms (`scale`, `rotate`).

### D. `TopBar.tsx` History Desynchronization Risk
1. **The Undo/Redo Conflict:** The TopBar reads `past` and `future` arrays from `useProjectStore()` (Zustand). However, Craft.js has its own deeply nested internal history (`actions.history.undo()`). If the application state (Zustand) and the canvas DOM tree state (Craft.js) are tracking history independently, users will inevitably experience "Undo Desync" where clicking undo reverts a Zustand state but leaves the Canvas DOM unchanged, destroying project integrity.

---

## 2. Architectural Decisions & Recommendations

The panels are currently built for a "Prototype" phase, lacking the robustness required for a production-grade editor.

### Option A: The "Thick Client" Approach (Current)
- **Concept:** React components directly manage all state interactions (onChange fires directly to the global store, drag-and-drop is handled via raw DOM events).
- **Pros:** Fast to develop, minimal dependencies.
- **Cons:** Catastrophic performance on large pages. High fragility.

### Option B: The "Optimized Middle-Layer" Approach
- **Concept:** Introduce intermediate state management and virtualization libraries to act as a buffer between the user's raw input and the heavy Canvas store.
- **Pros:** Buttery smooth performance regardless of project size. 
- **Cons:** Increases application bundle size and architectural complexity.

### 🏆 Recommendation for Nova v2.0
**Adopt Option B.**
A professional No-Code builder lives or dies by the performance of its Inspector Panels. 
- **Action 1 (PropsPanel):** Implement `useDebounce` (e.g., 300ms) on all text and textarea inputs in the PropsPanel to prevent Canvas thrashing. Replace hacky Zod introspection with a dedicated schema parser like `@hookform/resolvers/zod` or `zod-to-json-schema`.
- **Action 2 (LeftPanel):** Rip out the HTML5 Drag and Drop. Implement `@dnd-kit/core` with the Sortable preset, which provides native auto-scrolling, smooth animations, and robust tree handling. Wrap the tree render in a virtualization library.
- **Action 3 (TopBar):** Unify the Undo/Redo architecture. The TopBar must command the Craft.js `actions.history` directly, and Zustand state changes must be synced *as a side-effect* of the Craft tree mutating, ensuring a single source of truth.
