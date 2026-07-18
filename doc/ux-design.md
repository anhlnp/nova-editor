# Nova — UX Design Language

**Status:** Living document. Updated as product vision evolves.
**Audience:** Anyone building UI for Nova. Read before designing any new panel, flow, or interaction.

---

## 0. Product vision

Nova is three products in one:

| Inspiration | Nova layer | Principle |
|---|---|---|
| **Vercel v0** | AI chat → JSON schema → live canvas | Zero freeform CSS; Tailwind + tokens only |
| **Builder.io** | Component registry + JSON AST editor | Everything is a typed block with typed props |
| **Canva** | Canvas-first, template gallery, instant discoverability | The canvas is the primary workspace; panels are tools |

The Canva layer was added explicitly in v1.2. Every UX decision should ask: *does this make the canvas feel like the primary workspace, or does it make users feel like they live in the panels?*

---

## 1. Primary UX pattern — Canva-style vertical expandable sidebar

### The pattern

Replace the current top-tab system (`Layers | Blocks`) with a **vertical icon rail + expandable panel** on the left side:

```
┌──┬──────────────────────────────────────────────────────────┐
│  │                                                          │
│🗂│  ← Layers panel (expanded)                              │
│  │  Page                                                    │
│🧱│    └─ HeroSection                                        │
│  │    └─ Navbar                                             │
│🤖│                                                          │
│  │                                                          │
│🎨│                                                          │
│  │                                                          │
│📄│                                                          │
└──┴──────────────────────────────────────────────────────────┘
```

- Icon rail: always 60px wide, always visible
- Panel: 260px, slides out next to the rail when an icon is clicked
- Click the active icon again → closes the panel (more canvas space)
- Keyboard: `1`–`5` jump to each section; `Escape` closes panel

### Section mapping

| Icon | Section | What it shows |
|------|---------|---------------|
| 🗂 | **Layers** | Tree of current page's elements. Right-click for context menu. Always open by default. |
| 🧱 | **Blocks** | Block picker (search + icons). Click adds block after selection; drag to canvas. Replaces the Blocks tab entirely. |
| 🤖 | **AI** | Chat input + patch history. Home for the AI chat flow. Replaces the current floating chat. |
| 🎨 | **Templates** | Browse page templates (thumbnails). One-click apply. Replaces the template picker at project creation (also accessible mid-project). |
| 📄 | **Pages** | Multi-page management. Add/delete/rename/reorder pages. Currently at top of left panel; moves here. |

### Why this fixes the tab-switching problem

Previously: Users had to switch between `Layers` and `Blocks` tabs constantly — select a block in Layers, switch to Blocks to pick what to add, switch back to Layers to see the result. Three tab switches per operation.

Now: Each section is one icon click, the panel is full-height for that section, and the Layers tree is always one click away regardless of which section is open.

### Canvas empty-state (Canva-inspired)

When the canvas has no blocks:
- Show a centered `+` button with text "Add your first block"
- Clicking opens the Blocks section (icon 🧱) in the sidebar
- This is the zero-friction "first thing to do" affordance Canva uses

### Canvas right-click

Right-click anywhere on the canvas (not on a block) → context menu:
- `Add block here` → opens Blocks panel
- Nothing else (keep it simple)

---

## 2. Layers panel — becomes the primary management surface

Right-click any item in the Layers tree:

```
┌─────────────────────────┐
│ Add block above         │
│ Add block below      ▶  │
│ ─────────────────       │
│ Duplicate    Ctrl+D     │
│ Delete       Del        │
│ ─────────────────       │
│ Move up                 │
│ Move down               │
│ ─────────────────       │
│ Rename                  │
└─────────────────────────┘
```

"Add block above/below" opens the inline block picker popover (not a full panel — a 280px searchable list that closes after selection).

Keyboard shortcuts when a layer item is focused:
- `Del` / `Backspace` → delete
- `Ctrl+D` → duplicate
- `Enter` → select on canvas + focus RightPanel
- `↑` / `↓` → navigate tree
- `Alt+↑` / `Alt+↓` → move block up/down in the tree

---

## 3. Panel collapse + canvas priority

The canvas should have maximum space. Panels should be on-demand:

| State | Left side | Right side | Canvas width |
|-------|-----------|------------|--------------|
| Default | Rail (60px) + panel (260px) | Properties (260px) | calc(100% - 580px) |
| Left panel closed | Rail (60px) | Properties (260px) | calc(100% - 320px) |
| Both closed | Rail (60px) | Handle only (16px) | calc(100% - 76px) |

Toggle: Click active icon on rail → closes panel. `Ctrl+\` → same. Right panel: `◀` handle → collapse. `Ctrl+Shift+\` → toggle.

When the left panel closes, the canvas `flex-1` div expands automatically — no explicit padding or margin needed. The CSS variable `--left-panel-w` is set on the `<aside>` element for any future consumers (e.g. overlays that must clear the panel), but the canvas scroll boundary is controlled purely by flex layout.

**Canvas scroll anchor invariant (v1.2 fix):** The `nova-canvas-scroll` outer div is `overflow-auto`. Its direct child is a `min-w-max` centering wrapper. This combination is required:

- Without `min-w-max`: `items-center` on a flex-column container clips wide pages to the left — content scrolls right but the leftmost portion is permanently hidden. This is the CSS "centering overflow" bug.
- With `min-w-max`: when the page is wider than the container, the wrapper becomes exactly `page-width` wide, so horizontal scroll starts exactly at the left edge of the canvas area (= right edge of the left panel). When the page is narrower, the wrapper stretches to fill the container and centering works normally.

**Floating toolbar position invariant (v1.2 fix):** `RenderNode` uses `useLayoutEffect` (not render-time `style={}`) to compute the toolbar position. `useLayoutEffect` fires after React commits DOM changes but before paint, so `getBoundingClientRect()` reflects the current layout. The `leftSection` store value is a dependency of this effect, so toggling the panel immediately triggers a correct reposition — no hover required to fix a stale position.

**Vertical scroll invariant (v1.2 fix):** The `Canvas` component root must use `h-full` (not `flex-1`) because its immediate parent is a block container (`relative overflow-hidden div`), not a flex container — `flex-1` has no effect in that context. The `nova-canvas-scroll` element additionally needs `min-h-0` to override the flex item default `min-height: auto`, which would otherwise allow the element to grow unbounded and never actually scroll.

**Right panel collapse (v1.2):** `uiStore` exposes `rightPanelOpen: boolean` and `toggleRightPanel()`. When collapsed, the panel renders as a 24px strip with a `▶` re-open button; when open, it shows a `◀` button in the panel header. Keyboard shortcut: `Ctrl+Shift+\`. The keyboard handler lives in `EditorWorkspace` alongside undo/redo.

**Composite block decomposition (v1.2.1+):** Composite blocks that contain interactive elements (links, buttons) are `isCanvas: true` canvas blocks. Those elements are individual Craft.js nodes in the Layers panel, separately selectable on the canvas. Clicking a `Link` inside a Navbar selects the Link (not the Navbar); RightPanel shows its settings. (The block was renamed `NavLink`→`Link` in schema 1.3.) Full decision matrix + authoring rules: [`architecture-blocks.md`](architecture-blocks.md).

---

## 3a. TopBar control grouping (v1.2)

The TopBar center section is organized into three visually distinct pill-shaped groups, each wrapped in `bg-white/5 rounded-md p-0.5`. Groups are separated by thin `w-px h-4 bg-white/10` dividers.

| Group | Controls | Rationale |
|-------|----------|-----------|
| **1 — History** | Undo, Redo | Temporal operations — undo/redo always belong together |
| **2 — Viewport** | Desktop / Tablet / Mobile | Responsive preview — three mutually exclusive states |
| **3 — Zoom** | − / % display / + / Reset | Zoom controls — percent is clickable to type a custom value (**25–100%**, matching `uiStore.setZoom`'s clamp); reset returns to 100%. Note: canvas overlays mis-position at zoom ≠ 100% (TD-018). |

The zoom percentage label doubles as an editable input: click it → text input appears, `Enter` confirms, `Escape` cancels. This avoids cluttering the bar with a static label that needs a separate "click to edit" affordance.

---

## 4. Design token system — two distinct layers, clean contract

> ⚠️ **Status (v1.4): the token→class bridge below was NEVER built.** `project.theme` tokens are not consumed by the editor (the Style panel uses a fixed Tailwind palette, not theme tokens). Per **ADR-029** the Theme tab is "export-only" for now (fonts via `tailwind.config`); full token-wiring is a deferred future feature. The design intent below remains the target for that future work. (TD-019)

Design tokens and visual class overrides are **different concerns at different scales**. Do not merge them.

| Layer | Scale | Owner | When |
|-------|-------|-------|------|
| `project.theme` (design tokens) | Project | Brand / designer | v1.2 |
| `element.classOverrides` | Element | Editor user | v1.3 |

**Design tokens** answer: "what colors, fonts, and spacing values exist in this project?"
```json
{ "theme": { "colors": { "primary": "#7c3aed" }, "fontFamily": { "sans": "Inter" } } }
```

**classOverrides** answer: "what Tailwind classes does THIS specific element use that differ from its block's built-in defaults?"
```json
{ "classOverrides": ["mt-8", "bg-primary", "text-white"] }
```

**The contract (defined in v1.2, used in v1.3):**
1. Token names in `project.theme.colors` become Tailwind custom-color keys in `tailwind.config.js`
2. The style panel (v1.3) populates its color swatches from `project.theme.colors` — named tokens appear first
3. Users can also type any standard Tailwind class directly (not limited to tokens)
4. `tailwind.config.js` is only emitted in v1.3 (when the style panel ships), because only then do we know which token names are actually used in `classOverrides`

**Why NOT emit `tailwind.config.js` in v1.2:** The config maps token names to values (`primary → #7c3aed`). But if no element has `bg-primary` in its `classOverrides` yet (because the style panel doesn't exist until v1.3), the config has dead entries. The emit belongs with the style panel.

**The separation preserves both systems' strengths:**
- Tokens stay clean (global, named, swappable — change `primary` and every element using it updates)
- classOverrides stays flexible (any Tailwind class, not just token-backed ones, can be used)
- Neither needs to know about the other's internals

---

## 5. Pricing model — Canva-inspired

### Canva's key insight
The free tier is genuinely useful. Users build habits first; upgrade prompts appear contextually at moments of frustration or desire for more — not at first launch. The upgrade is for scale and power, not for basic access.

### Nova's pricing principle
**"You should be able to build something real on the free tier."**

| Feature | Free | Pro |
|---------|------|-----|
| Editor (all blocks, all pages) | ✅ Full access | ✅ |
| GitHub export (schema JSON + .tsx) | ✅ 1 active project | ✅ Unlimited |
| AI credits | 50/month | Unlimited |
| Vercel deploy | ✗ | ✅ |
| Custom domains | ✗ | ✅ |
| Team sharing | ✗ | ✅ |
| Premium templates | Preview only | ✅ |

### The contextual upgrade UX (not gating the editor itself)

Canva's approach: Pro-only features are visible in the UI (often with a crown/star icon) but unusable without upgrading. Clicking them shows a contextual upgrade prompt at the moment of intent — not a paywall on first open.

Nova equivalent:
- Blocks panel shows all blocks. Premium blocks have a `PRO` badge. Click → "Upgrade to use this block in your project"
- Publish button for free users → shows the "Saved to GitHub" message + a CTA "Auto-deploy with Vercel — upgrade to Pro"
- AI runs out → toast "You've used 50 AI credits this month. Upgrade to Pro for unlimited."
- Second project creation attempt → "Free plan includes 1 active project. Upgrade to Pro for unlimited."

All upgrade prompts are in-context, never on initial load. The editor itself is always fully functional for the free tier's feature set.

### Vietnam / non-Western payment (integrated into store setup, not separate)

Lemon Squeezy: Visa/Mastercard/PayPal. Works for international users.

For Vietnamese users (VietQR, Momo, ZaloPay): These payment methods are not supported by Lemon Squeezy. The pragmatic bootstrap approach:
- Manual bank transfer → contact via email or Zalo for manual account upgrade
- A `POST /api/admin/upgrade?userId=&secret=ADMIN_SECRET` route handles the upgrade server-side
- Documented in `doc/setup/` store guide alongside the Lemon Squeezy setup

When revenue justifies it (100+ paying users), integrate Stripe + VNPay/Momo properly.

---

## 6. Template gallery (v2.0 target, but inform v1.x decisions)

Canva's template gallery is the first thing users see. It frames the product as "pick a starting point" rather than "blank canvas."

For Nova, the long-term template UX:
- Templates browsable FROM the editor (via the 🎨 section in the sidebar) — not just at project creation
- Template thumbnails (not text list) — 2-column grid of visual previews
- Categories: Portfolio, Landing Page, Blog, E-commerce, SaaS
- One-click apply → replaces current page content (with confirmation)
- "Try before you apply" → preview in a modal before committing

v1.x decisions that shouldn't conflict with this:
- The `🎨 Templates` section in the sidebar icon rail (v1.2) should use the same component as the future gallery — build a simple list now, upgrade to thumbnails in v2.0
- Template schema (name, pages, metadata) should be stable by v1.2

---

## 7. Canvas layout ↔ layers panel sync (partially addressed in v1.4)

> **Status (v1.4):** partially shipped — the Layers panel shows a `flex →`/`grid` **layout badge** on flex/grid parents, and the on-canvas **AlignBar** edits flex justify/align. The full "drag-on-canvas reorder = tree reorder" invariant below is NOT yet implemented (canvas drag reorder for flex children is still via the Layers tree only). Framing kept for the remaining work.

**The problem:** When a user visually sets `flex-row` on a Section block in the style panel (v1.3), its children appear side-by-side on the canvas. But the Layers panel still shows them as a top-to-bottom list — the panel's mental model is DOM order, not visual layout. When the user then tries to "move left" a child block in the canvas via a drag handle, what does "left" mean in the layers tree?

**Why it breaks the 1:1 assumption:**
- Current model: Layers tree = DOM tree order = visual stacking order (top→bottom)
- After flex/grid: Layers tree = DOM tree order ≠ visual spatial arrangement
- A node at position 3 in the tree might visually be in the top-left of a 3-column grid

**What other tools do:**
- **Figma:** Layers tree is always the stacking order; spatial position is independent of tree. The tree represents containment and z-order only. Visual movement (drag on canvas) updates x/y coordinates, not tree position.
- **Webflow:** The navigator tree uses flexbox semantics — moving a child changes its flex order property, not its DOM position. The tree always reflects the visual reading order.
- **Canva:** No concept of a layers panel at the page level — elements have a z-order list, but layout is free-form (absolute position).

**Nova's constraint:** Nova uses DOM order as the canonical order (Craft.js model). Unlike Figma, we don't have x/y coordinates. Unlike Webflow, we're not a pure flexbox editor. The Tailwind class approach (v1.3) means a Section can be `flex flex-row` or `grid grid-cols-3` — the tree order then becomes the flex/grid item order.

**Proposed v1.4 direction:** Align with Webflow's model:
- Layers tree visual order = flex/grid item order
- Moving a child in the tree changes its position in the DOM order AND its visual flex position
- The Layers panel gains a "layout context" indicator (a small `flex →` or `grid 3col` badge on the parent node) so users understand why children appear arranged differently than expected
- Canvas drag reorder for flex children becomes a first-class operation: drag a child left/right within a flex row → updates DOM order → visual order follows

**The canvas-layers sync invariant (for v1.4):** At any time, the order of nodes in the Layers tree must visually match the flex/grid reading order on the canvas. Moving a block in the tree always produces the same visual result as dragging it on the canvas. These are two UIs for the same operation.

This requires the layout editor (v1.4) to design the drag-on-canvas operation at the same time as the Layers reorder operation — they cannot be designed independently.

---

## 8. Future UX patterns to explore

These are noted for future design cycles, not committed to any version:

- **Multi-select + alignment guides** — rubber-band selection on canvas; align/distribute selected blocks. Canva essential.
- **Persistent search** — `Cmd+K` opens a command palette: find block, jump to page, apply template, run AI command. Vercel v0 / Linear-inspired.
- **Inline text editing** — click text content on canvas to edit it directly (not via RightPanel prop). Canva-style.
- **Canvas zoom to selection** — double-click a block in Layers → canvas auto-scrolls and zooms to show it
- **Undo history panel** — list of recent actions, click to jump to a point in time. Figma-style.
- **Block drag from canvas** — drag an existing block on the canvas to reorder (not just via Layers). Canva-style.
