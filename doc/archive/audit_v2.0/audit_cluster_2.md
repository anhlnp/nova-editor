# EXHAUSTIVE Audit Report - Cluster 2: Canvas Chrome & Interaction

The interaction layer (overlays, toolbars, outlines) sits between the user and the canvas DOM. This audit dissects the state management and mathematical computation flaws that degrade the user experience.

---

## 1. Comprehensive Issue Identification

### A. The TD-018 Zoom Bug (`RenderNode` & `LayoutOverlay`)
1. **The Math Collision:** The canvas wrapper `.nova-canvas-page` utilizes `transform: scale(zoom)`. The UI overlays calculate their positions using `element.getBoundingClientRect()`. 
2. **The Failure:** `getBoundingClientRect()` returns absolute coordinates relative to the browser viewport (unscaled). However, placing an `absolute` or `fixed` element inside a `transform` container forces the browser to treat those viewport coordinates as *local, unscaled* coordinates. Thus, if a block is 100px from the left, but the canvas is zoomed to 50%, the overlay will be drawn at 100px relative to the *scaled container*, visually landing at the 200px mark on the screen. The overlays physically detach from the blocks.

### B. `AlignBar.tsx` Anti-Patterns
1. **Viewport Ejection (UX Bug):** It uses `absolute top-1 left-1/2` while portaled to the canvas container. In a 3000px long landing page, if a user scrolls down 2000px and clicks a block, the AlignBar renders 2000px above them at the top of the document.
2. **State Mutation Side-Effect:** The AlignBar appears when a *child* of a flex container is selected. However, modifying `justify-content` or `align-items` requires mutating the `classOverrides` of the **Parent Node**. Modifying the state of an unselected parent node by interacting with a child node's toolbar is a severe UX anti-pattern. It introduces magical, hidden state changes that confuse users.
3. **Grid Ignorance:** The tool only surfaces Flexbox controls (`justify-`, `items-`). CSS Grid layouts receive zero visual alignment support.

### C. `LayoutOverlay.tsx` Computation Fragility
1. **Box Model Misinterpretation:** The gap bands are calculated by measuring the pixel difference between the `right` edge of Element A and the `left` edge of Element B. If Element A has a CSS `margin-right: 10px`, the gap calculation will mistake that margin for a flex gap and draw a purple band over it. 
2. **DOM Thrashing:** The repositioning logic runs imperatively on `window.resize` and `scroll` via `addEventListener`. While performant, it does not debounce or utilize `requestAnimationFrame`, potentially causing jank on low-end devices during heavy scrolling.

### D. `MultiSelectToolbar.tsx` State Race Conditions
1. **State Injection:** The "Duplicate/Delete/Group" commands execute by pulling the Craft.js state, modifying it in memory, and then pushing the entire JSON blob directly into the Zustand `projectStore` via `applyExternalSchema`. 
2. **The Risk:** Bypassing Craft's internal action history for multi-node mutations risks desynchronizing Craft's internal `nodes` registry from the external Zustand `projectStore`.

---

## 2. Architectural Decisions & Recommendations

The core problem in Cluster 2 is how floating UI elements (Chrome) relate to the scaled Canvas.

### Option A: Viewport-Relative Portaling (Figma/Webflow Style)
- **Concept:** Portal all floating UI (`RenderNode` toolbar, `AlignBar`, `LayoutOverlay`) to `document.body`. Remove them entirely from the `.nova-canvas-page` DOM tree. Use `getBoundingClientRect()` and apply `position: fixed`.
- **Pros:** 100% immune to CSS transforms and zoom bugs. The UI controls will maintain their physical size on the screen (e.g., text remains 12px) even if the canvas is zoomed out to 10%, ensuring they are always clickable.
- **Cons:** Requires a `ResizeObserver` and scroll listener on the canvas wrapper to continuously update the `fixed` coordinates as the user pans around the canvas.

### Option B: Local-Relative Portaling
- **Concept:** Keep them inside `.nova-canvas-page`. Stop using `getBoundingClientRect()`. Instead, recursively calculate `node.offsetLeft` and `node.offsetTop` up the DOM tree until reaching the `.nova-canvas-page` boundary.
- **Pros:** Since coordinates are local, they scale natively with the `transform: scale()`. 
- **Cons:** UI tools will shrink when zoomed out. At 25% zoom, the toolbars will become microscopic and unclickable.

### 🏆 Recommendation for Nova v2.0
**Adopt Option A (Viewport-Relative Portaling).**
For a professional design tool, UI controls (Chrome) must remain a consistent, usable size regardless of the canvas zoom level. 
- **Action 1:** Move all Portals in Cluster 2 to `document.body`.
- **Action 2:** Tether `AlignBar` directly to the `RenderNode` bounding box, positioned slightly below the element, rather than the top of the screen.
- **Action 3:** Remove Parent-mutation from `AlignBar`. If a user wants to align a container, they must click the container itself. The `AlignBar` should only mutate the `classOverrides` of the *currently selected node*.
