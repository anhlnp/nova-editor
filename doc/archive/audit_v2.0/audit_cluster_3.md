# EXHAUSTIVE Audit Report - Cluster 3: Content Components & Presets

This cluster evaluates the "Leaf Nodes" (Text, Buttons, Images) and the "Preset Containers" (Hero, Footer, PricingCard, FeatureCard, Navbar, etc.) that orchestrate them. The audit reveals critical failures in the WYSIWYG paradigm and unscalable layout hacks.

---

## 1. Comprehensive Issue Identification

### A. The `HeroSection` Slicing Hack (Architecture Failure)
1. **The Hack:** To create a split layout, the render function executes: `const textCol = kids.slice(0, splitAt);`.
2. **The Consequence:** In a visual builder, the source of truth for component ordering is the Craft.js tree (managed via drag-and-drop). By using `slice()` inside the React render function, the `HeroSection` completely disregards the drag-and-drop tree. If a user drags a `Button` to the top of the Hero, the `slice` logic will violently re-route it to a different column. It completely breaks the predictability of the canvas.

### B. `TextBlock` Rich Text & Security Vulnerabilities
1. **Data Loss on Blur:** It utilizes `dangerouslySetInnerHTML` for rendering but saves the input via `e.currentTarget.textContent`. This completely strips all HTML tags (bold, italic, links) upon saving.
2. **XSS Vulnerability:** If a user modifies the JSON payload directly or pastes a script tag into the `contentEditable` area, `dangerouslySetInnerHTML` will execute it. There is absolutely no DOM sanitization (e.g., DOMPurify) implemented before rendering the HTML.
3. **Ghost Spans:** Pressing "Enter" in a `contentEditable` element often generates nested `<div>` or `<br>` tags depending on the browser. Because the block enforces a specific HTML tag (e.g., `<p>`), generating nested divs inside a `<p>` results in invalid HTML markup.

### C. The Missing `_novaEditing` Interface
1. **Inconsistent WYSIWYG:** Users can double-click a `TextBlock` to edit it directly on the canvas. However, `Button` and `Link` components do not implement this. Users are forced to look away from the canvas and find the `label` input in the Right Panel. This breaks the immersion of a direct-manipulation tool.

### D. `Image` Component Lacks Optimization
1. **ESLint Suppression:** The code explicitly uses `// eslint-disable-next-line @next/next/no-img-element`. For an editor designed to export high-performance Next.js code, failing to use the `<Image>` component from `next/image` means exported sites will suffer from poor Core Web Vitals (LCP/CLS) and lack automatic webp compression.
2. **Hardcoded Aspect Ratios:** The `aspectRatio` prop is mapped to rigid Tailwind classes (`aspect-video`, `aspect-square`). If a user needs a `3:4` portrait ratio or an unconstrained height, they cannot achieve it without hacking the `classOverrides`.

### E. Incomplete Decomposition across ALL Presets
Phase 3 claimed to "decompose" composite blocks into child nodes. However, **all presets** (`Footer`, `FeatureCard`, `PricingCard`, `Stats`, etc.) suffer from hardcoded prop data:
1. **Footer:** The `copyright` text is a string prop (`copyright="© 2026 My Company"`).
2. **FeatureCard:** The `title`, `description`, and `icon` are all string props.
3. **PricingCard:** The `plan`, `price`, and `features` array are all rigid string props.
**The Consequence:** If a user wants to change the color of the Pricing price, or swap the Feature icon for an SVG image, they cannot. It entirely breaks the "visual editing" promise. Furthermore, all of these components aggressively restrict what can be dragged inside them via `canMoveIn` (e.g., Footer only accepts Links/Buttons, blocking images/logos).

---

## 2. Architectural Decisions & Recommendations

The core problem in Cluster 3 is the reliance on rigid, monolithic components rather than composable primitives.

### Option A: The "Monolithic Preset" Approach (Current)
- **Concept:** Components like `FeatureCard` or `HeroSection` manage their own internal layout logic and strictly define what props they accept (title, description, price).
- **Pros:** Fast to render. Easy to drag a single component and get a fully designed block.
- **Cons:** Extremely brittle. Impossible to customize beyond the provided props (e.g., cannot add a subtitle to a PricingCard if the prop doesn't exist).

### Option B: The "Data-Seeded Preset" Approach
- **Concept:** A `HeroSection`, `PricingCard`, or `Footer` does not exist as a unique React Component. Instead, they are purely JSON data payloads (Templates) in the Left Panel. When a user drags a "Pricing Card" to the canvas, the system simply injects a generic `Box` primitive containing basic `TextBlock` and `Button` primitives, pre-styled with Tailwind classes.
- **Pros:** Infinite customizability. Users can delete, style, and reorder every single element of the Pricing Card exactly as they wish because they are just standard primitives. Eliminates the need for hacky `slice()` logic or restrictive `canMoveIn` rules.
- **Cons:** Increases the initial node count in the Craft.js tree.

### 🏆 Recommendation for Nova v2.0
**Adopt Option B (Data-Seeded Presets).**
To achieve the flexibility of Webflow/Framer, the concept of "Composite Blocks" must be entirely eradicated from the React layer.
- **Action 1:** Delete **ALL** composite presets (`HeroSection`, `Footer`, `Navbar`, `FeatureCard`, `PricingCard`, `FAQ`, `Stats`, `Testimonials`). Recreate them exclusively as JSON templates in the Left Panel. When dragged, they should spawn a generic `Box` containing basic `TextBlock`, `Image`, and `Button` primitives.
- **Action 2:** Implement `DOMPurify` inside `TextBlock.tsx` to prevent XSS, and fix the save function to use `innerHTML` so rich text formatting is preserved.
- **Action 3:** Refactor `Button` and `Link` to use `contentEditable` when `_novaEditing` is true, ensuring 100% inline text editing across all textual nodes.
- **Action 4:** Update the Export Renderer to swap standard `<img>` tags with `next/image` during the code generation phase.
