# EXHAUSTIVE Audit Report - Cluster 5: Core Sync & Adapters

This cluster is the "Bridge" between the internal JSON schema (`@studio/schema`) and the runtime Canvas DOM tree (`@craftjs/core`). Any flaws here result in silent project corruption, orphaned nodes, or data loss upon saving.

---

## 1. Comprehensive Issue Identification

### A. The `schemaToNodes.ts` Data Loss Bomb
1. **Unknown Type Handling:** When the editor loads a project schema, it verifies each `Element` against the `registry`. If an element's type is missing (e.g., a block was renamed or a plugin was removed), the parser skips it via `if (!isKnown(child)) continue;`.
2. **The Consequence:** Because it uses `continue`, the `processElement` function is never called for that node. This means the parser **never recurses into that node's children**. If a user had a custom "HeroContainer" block with 50 valid Text and Image blocks inside it, and the developer renames "HeroContainer" to "Hero", the system will silently delete all 50 valid child blocks upon loading because it refuses to traverse through the unknown parent. 

### B. The `nodesToSchema.ts` ID Mutation Hack
1. **The ID Regex Hack:** Craft.js natively generates random 10-character alphanumeric IDs (`nanoid()`). Nova's schema strictly requires an 8-character ID prefixed with `node_`. To force compliance, `nodesToSchema.ts` takes the Craft ID, strips special characters, appends `00000000`, and slices it to 8 characters. 
2. **The Collision Risk:** This is mathematically terrifying. `slice(0, 8)` means only the first few characters of the original Craft ID are kept. The entropy is severely reduced, massively increasing the probability of ID collisions when users duplicate blocks or add many elements rapidly. If two blocks get the same ID, the entire tree will collapse.

### C. `makeCraftComponent.tsx` Root DOM Assumption
1. **The Wrapper Flaw:** To avoid coupling components directly to Craft.js hooks, Nova uses an invisible `<div style={{ display: "contents" }} ref={...}>` wrapper. In the `ref` callback, it binds Craft's drag-and-drop listeners to the **first child element** (`wrapper?.firstElementChild`).
2. **The Consequence:** This strictly assumes every component in the registry returns a single root DOM node. If a developer builds a `FeatureList` block that returns a React Fragment `<>` containing three `<div>` sibling items, only the *very first* item will be draggable or selectable. The remaining siblings will become "ghosts" on the canvas that cannot be interacted with.

### D. `mutations.ts` State Sync Decoupling
1. **Silent Tree Edits:** Operations like `groupNodes` and `duplicateNode` perform pure JSON transformations. However, there is no event emitter or middleware that notifies the `projectStore` immediately when these operations are executed. They rely entirely on Craft.js re-syncing its state via `onChange`, serializing the entire tree back to JSON, and then hitting the Zustand store. This cyclical flow (Zustand -> Craft -> JSON -> Zustand) makes atomic undo/redo operations highly unstable.

---

## 2. Architectural Decisions & Recommendations

The core problem in Cluster 5 is trying to force Craft.js to behave like a strictly typed AST (Abstract Syntax Tree) without actually owning the ID generation or tree traversal hooks.

### Option A: The "Lossless JSON" Approach
- **Concept:** Modify `schemaToNodes.ts` to preserve unknown blocks as a special `<UnknownBlock>` component rather than dropping them. The `<UnknownBlock>` renders a red warning box on the canvas but successfully mounts all of its children inside it.
- **Pros:** 100% data preservation. If a developer accidentally breaks a block name, the user's content is safe, and they can drag the children out of the broken block.
- **Cons:** Requires a dedicated fallback component in the registry.

### Option B: The "Strict Schema Upgrade" Approach
- **Concept:** Write database migrations. Before the JSON schema ever touches the editor, run a strict versioned migration script that renames outdated block types to new ones.
- **Pros:** The Editor code remains clean and doesn't have to worry about broken types.
- **Cons:** Extremely high maintenance for developers. Every block rename requires a database migration script.

### 🏆 Recommendation for Nova v2.0
**Adopt Option A for Data Safety, and patch the ID generator.**
- **Action 1 (Data Safety):** Refactor `schemaToNodes.ts` so that if `!isKnown(child)`, it replaces `child.type` with `"UnknownBlock"`. Create an `UnknownBlock` in the registry that renders a red dashed border but still accepts `children`. This prevents catastrophic subtree deletion.
- **Action 2 (ID Generation):** Remove the dangerous `slice(0, 8)` string hack in `nodesToSchema.ts`. Instead, fork or patch Craft.js (or inject a custom Node Factory) to natively generate `node_<8>` IDs at the moment of creation.
- **Action 3 (DOM Safety):** Enforce via ESLint or TypeScript that all components in the `blocks/` directory must return a single root JSX element, preventing the `firstElementChild` ghost bug in `makeCraftComponent.tsx`.
