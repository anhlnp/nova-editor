# Nova Editor — PRD v1.4 (Direct Manipulation + Approachability)

**Version:** 1.4
**Status:** Implementing — **W5 + W6 DONE**. Remaining: W7 (approachability), W4 (decomposition+migration), W1–W3 (canvas/multi-select).
**Build log:**
- W5 ✅ `PropsPanel.tsx` derives fields from each block's Zod schema (zod-free introspection of `_def`) + key heuristics (color/image/pageLink/textarea/repeater); rendered in Style-tab language; wired into RightPanel for all blocks; old `SettingsPanel` usage removed (14 `*.settings.tsx` now unused — delete in cleanup). Tests: `schemaIntrospect.test.ts` guards Zod `_def` assumptions (79 registry tests pass).
- W6 ✅ Blocks panel grouped into Primitives vs Presets (`PRIMITIVE_BLOCKS` set) + grid/list view toggle persisted in `uiStore.blockPickerView`.
**Base:** v1.3 as-built (Visual Tailwind Style panel, classOverrides + safelist, Layers drag-drop, tiers, AI layout/patch discipline, composite blocks)
**Theme:** "Feels like a real design tool, usable by non-developers — without removing the Tailwind power."

---

## 0. North star & guiding principle

Nova is a **flow-layout web builder**, NOT a freeform canvas (Canva/tldraw). So we adopt the *feel* of direct manipulation — select, group, align, resize, snap — while every output stays **responsive Tailwind**. Two pillars:

1. **Direct manipulation** — multi-select, grouping, on-canvas position/size, all mapping to responsive utilities.
2. **Approachability** — "simplification, not reduction": keep full power, change the default surface (Simple mode, tooltips, guided onboarding).

**Locked decisions (2026-06-15):** gated free-absolute-positioning (opt-in, Advanced), custom coachmark onboarding (no dep), opinionated Simple-mode presets, schema-driven Props panel (supersedes the old "Props→Style harmonization"), multi-select built first (gates the rest).

---

## 1. Scope

| Feature | v1.4 | Out / later |
|---|:---:|:---:|
| Multi-select (marquee + shift/ctrl-click) + interaction state machine | ✅ | |
| Multi-node toolbar + bulk delete/duplicate/move | ✅ | |
| Bulk classOverrides apply across selection | ✅ | |
| Group into Section / Ungroup (named, shown in Layers) | ✅ | |
| On-canvas align-to-parent bar (writes parent flex + child self/order) | ✅ | |
| Drag-to-resize handles (w-/h-, snapped) | ✅ | |
| Snap/alignment guides + keyboard nudge | ✅ | |
| Free absolute positioning (per-node, Advanced, "not responsive" warning) | ✅ | |
| Preset decomposition (Hero text, Navbar logo → child nodes) | ✅ | |
| Inline contentEditable text editing on text nodes | ✅ | |
| Schema-driven Props panel (Zod-derived + uiHints) replacing 14 settings | ✅ | |
| Block picker: primitive vs preset split + thumbnail/list toggle | ✅ | |
| Style panel Simple / Advanced modes | ✅ | |
| Tooltips on all Style + Props controls | ✅ | |
| First-run onboarding coachmark tour | ✅ | |
| Plain-language + px hints (gap-4 → "16px") | ✅ | |
| Inline RICH text (bold/italic spans) | | ✅ v1.5 (TipTap) |
| Rotate / z-index drag / freeform canvas | | ✅ not Nova's model |
| Reusable style tokens / components library | | ✅ v1.5+ |
| Arbitrary hex in Style (bg-[#…]) via styleOverrides | | ✅ v1.5 (color model B) |

---

## 2. Workstreams

### WS1 — Multi-select + interaction state machine 🔑 (foundational)
The keystone; grouping, bulk ops, and align all depend on it.

- **Selection set** in `uiStore`: `selectedNodeIds: string[]` (keep `selectedNodeId` as a derived "primary" = last selected for the inspector).
- **Marquee**: drag on empty canvas → rubber-band rect → select intersecting top-level-or-same-parent nodes. Implemented as a small finite state machine (`idle → maybeDrag → marquee → done`), the one pattern worth borrowing from tldraw.
- **Modifier clicks**: shift-click adds/removes; ctrl/cmd-click toggles; click empties.
- **Reflected** in canvas chrome (multi outline), Layers (multi highlight), and a **multi-node toolbar** (group / delete / duplicate / align).
- **Bulk ops** route through new schema commands operating on `string[]` (extend `editorCommands`): `deleteMany`, `duplicateMany`, `moveMany`.
- **Constraint**: bulk operations only across siblings of the same parent for move/group (cross-parent multi-move is out — avoids ambiguous trees).

### WS2 — Grouping
- **Group into Section**: wrap the (same-parent) selection in a new `Section` node at the position of the first selected; children moved in, order preserved. New Section gets `displayName: "Group"` (renamable → e.g. "Hero Text"). Uses existing `wrapInContainer` mutation, extended to wrap multiple.
- **Ungroup**: lift a container's children into its parent at its position, delete the container.
- **Reflects in Layers** automatically (it's a real node) and is **renamable** via the existing layer rename.
- Commands: `groupNodes(ids)`, `ungroupNode(id)` (pure, unit-tested).

### WS3 — On-canvas position & size
- **Align-to-parent bar** (responsive-safe): when 1+ children selected, a small floating bar offers horizontal (start/center/end/between) and vertical (start/center/end) — writes the **parent's** `justify-*`/`items-*`; per-child quick actions write `self-*` / `ml-auto` / `order-*`. This is "position relative to parent" done so it survives breakpoints.
- **Drag-to-resize**: handles on the selection box → set `w-`/`h-` snapped to the spacing scale (reuses StylePanel.utils snapping). Shift = free ratio off.
- **Snap/alignment guides**: while dragging (reorder or resize), draw guide lines to sibling edges/centers; snap within a threshold.
- **Keyboard nudge**: arrow keys change order (flow) or offset (free-position mode); with modifier = larger step.
- **Free position (Advanced, gated)**: a per-node "Free position" toggle in the Style → Position section sets `relative` on parent + `absolute` on child + drag writes `top-`/`left-`; shows a persistent "⚠ not responsive" chip. Off by default; never auto-applied.

### WS4 — Preset decomposition + inline text
- **Decompose layout presets** so every user-meaningful sub-element is a real node:
  - **HeroSection** → title/subtitle become child `TextBlock` nodes; CTA already child Button. Hero keeps only layout/bg props.
  - **Navbar** → logo/brand becomes a child node (`Link` with logo text, or `Image`); links/CTA already children.
  - Other layout presets (pricing/feature rows) compose from primitives.
  - **Exceptions (stay monolithic):** data-list blocks — FAQ `items[]`, Stats `items[]`, Testimonials `items[]` — their array editing is a feature, edited via a Props **repeater** control (WS5).
- **Inline text editing**: `TextBlock` (and decomposed text nodes) become `contentEditable` on the canvas; `onBlur` → `actions.setProp(content)`. Plain text only (rich text = v1.5/TipTap). Enter commits, Esc cancels.
- **Schema migration** `1.3 → 1.4`: for each `HeroSection`, move `title`/`subtitle` props into new child TextBlock elements; for each `Navbar`, synthesize a brand child node from `brandName`/`logoUrl`. Old props dropped after conversion. Update `defaultChildren` so newly-added presets are born decomposed.

### WS5 — Schema-driven Props panel (replaces 14 settings files)
The Props tab becomes ONE generic renderer, mirroring how Style is one panel.

- **Field descriptors** derived from each block's existing Zod `*PropsSchema`:
  - `z.enum` → segmented control / select
  - `z.boolean` → toggle
  - `z.number` → number input
  - `z.string` → text input; if key matches `/color$/i` → color swatch; if key is `content`/`description` → textarea; if key is `href` → page/URL select
  - `z.array(...)` → **repeater** (add/remove/reorder rows; for `items[]` object arrays, nested fields)
- **Per-block `uiHints`** (small map, optional): label overrides, help text (→ tooltip), group headings, control overrides (e.g. force textarea), field order, hidden fields. Lives next to the block (e.g. `Block.ui.ts`).
- **One `<PropsPanel>`** reads `{ schema, uiHints, props }` and renders grouped, tooltipped fields in the **Style-tab visual language** (compact dark) → Props and Style finally match. Delete the 14 `*.settings.tsx` (or keep as thin re-exports during transition).
- Special cases kept as custom field types: Image upload, page-link select, array repeater.

### WS6 — Block picker: primitives vs presets
- **Two groups/tabs**: **Primitives** (Section, Column, TextBlock, Image, Button, Link) and **Presets** (Hero, Navbar, Pricing, Feature grid, FAQ, Stats, Testimonials, Footer…). Driven by a `kind: "primitive" | "preset"` field on each registry entry (or a static set).
- **View toggle**: thumbnail grid (default) ↔ **detail list** (icon + name + one-line description) when thumbnails crowd the panel. Persist choice in `uiStore`.
- Presets insert their decomposed primitive subtree (post-WS4) so they land selectable in Layers.

### WS7 — Approachability layer (runs in parallel; ship incrementally)
- **Style panel Simple / Advanced modes** (extends current `default/focus/advanced`):
  - **Simple** = plain-language, preset-driven: *Spacing: None / Cozy / Normal / Roomy* (map to fixed scale steps), *Text size: S / M / L / XL*, color **swatches**, alignment **icons**, show/hide. No raw class strings.
  - **Advanced** = today's full panel (breakpoints/states/dark/all sections).
  - Mode persisted per user; Simple is the default for first-time users.
- **Tooltips everywhere**: every Style + Props control gets a plain-language `title`/popover ("Padding — space *inside* the box, around the content"). Sourced from `uiHints.help` (Props) and a static map (Style).
- **First-run onboarding tour**: custom lightweight coachmark component (no dependency) — sequence: Blocks → Canvas select → Layers → Props/Style tabs → AI → Publish. Dismissible, replayable from a "?" menu. Stored "seen" flag in localStorage + user row.
- **Plain-language + unit hints**: show px next to scale values (`gap-4` → "16 px"), friendly section descriptions, contextual "?" links.

---

## 3. Architecture decisions

### 3.1 Multi-selection state
`uiStore.selectedNodeIds: string[]`; `selectedNodeId` becomes a getter = last of the array (back-compat for the inspector, which always edits the primary). Craft's `events.selected` can hold multiple; we mirror the set (sticky: ignore transient clears, as in v1.3).

### 3.2 Interaction state machine
A tiny reducer (`idle | pointing | marquee | dragging | resizing`) in a `useCanvasInteraction` hook drives marquee + drag-resize. Not a full tldraw engine — just enough to make multi-gesture interactions robust and cancelable (Esc).

### 3.3 Position model — flex-first, absolute opt-in
Default positioning is **flow/flex** (responsive). "Position relative to parent" = parent `justify/items` + child `self/order/m*-auto`. **Absolute** is a gated per-node escape hatch (`relative` parent + `absolute` child + `top/left`), clearly flagged non-responsive. This preserves Nova's responsive thesis while answering "place this exactly."

### 3.4 Schema-driven Props (Zod + uiHints)
Single source of truth = the block's Zod schema (already exists) + a small uiHints map. One renderer. This eliminates the Props/Style UI mismatch by construction and removes 14 bespoke files. Repeater control handles `items[]` arrays so data-list blocks stay prop-driven.

### 3.5 Group = Section node
Groups are not a new abstraction — they're `Section` containers. Free in Layers, renamable, stylable, exportable. No schema change.

### 3.6 Decomposition rules (locked)
Decompose **layout** presets (text/logo/CTA become nodes). Keep **data-list** blocks monolithic (repeating `items[]`). Rule of thumb: "every visible sub-element a user would select/style is a node; repeating homogeneous data is a prop array."

---

## 4. Migration (`1.3 → 1.4`)
- Recursively: `HeroSection` → emit child `TextBlock` nodes from `title`/`subtitle`, drop those props; `Navbar` → emit brand child node from `brandName`/`logoUrl`, drop those props.
- `LATEST_VERSION = "1.4"`, extend `versionChain`, `defaults.schemaVersion = "1.4"`.
- Drafts run through `migrateToLatest` on load (already wired).
- No migration needed for Props panel change (prop keys unchanged) or grouping.
- Update schema test version assertions.

---

## 5. File change index (high level)
| Area | Change | WS |
|---|---|---|
| `apps/studio/src/store/uiStore.ts` | `selectedNodeIds[]`, picker view mode, simple/advanced mode, onboarding flag | W1,W6,W7 |
| `apps/studio/src/components/editor/useCanvasInteraction.ts` | **New** marquee + drag-resize state machine | W1,W3 |
| `RenderNode.tsx` / `Canvas.tsx` | multi-outline, marquee layer, resize handles, snap guides, align bar | W1,W3 |
| `LeftPanel.tsx` | multi-highlight in Layers; block-picker primitive/preset + list toggle | W1,W6 |
| `packages/editor/src/commands/editorCommands.ts` | `deleteMany/duplicateMany/groupNodes/ungroupNode` | W1,W2 |
| `packages/editor/src/operations/mutations.ts` | extend wrap/group; unit tests | W2 |
| `apps/studio/src/components/editor/PropsPanel.tsx` | **New** schema-driven renderer + field controls | W5 |
| `packages/registry/src/blocks/*/*.ui.ts` | **New** per-block uiHints; remove `*.settings.tsx` | W5 |
| `packages/registry/src/types.ts` | add `kind` + `uiHints`; (settings optional/removed) | W5,W6 |
| `packages/registry/src/blocks/HeroSection`, `Navbar` | decompose; defaultChildren | W4 |
| `packages/schema/src/migrations/runner.ts` + `defaults.ts` | `1.3→1.4` migration | W4 |
| `apps/studio/src/components/editor/StylePanel.tsx` | Simple/Advanced mode, tooltips, px hints | W7 |
| `apps/studio/src/components/editor/Onboarding.tsx` | **New** coachmark tour | W7 |

---

## 6. Per-block plan
| Block | Kind | Decompose? | Props notes |
|---|---|---|---|
| Section, Column | primitive | n/a (containers) | layout props |
| TextBlock | primitive | inline-editable | content=textarea |
| Image | primitive | — | upload field |
| Button, Link | primitive | — | href=page-select |
| HeroSection | preset | ✅ title/subtitle → TextBlock | layout/bg only |
| Navbar | preset | ✅ logo → child node | brand/sticky |
| PricingCard | preset | CTA already child | features=repeater |
| FeatureCard | preset | (small; optional) | text props |
| FAQ / Stats / Testimonials | preset | ❌ monolithic | items=repeater |
| Footer | preset | links→repeater (or nodes v1.5) | colors |

---

## 7. Exit criteria
- [ ] Marquee + shift-click selects multiple; Layers + canvas show the set
- [ ] Group into Section wraps selection, appears + renamable in Layers; Ungroup restores
- [ ] Align bar centers nav links responsively (writes parent justify-*)
- [ ] Drag-resize writes snapped w-/h-; snap guides appear
- [ ] Free-position toggle creates absolute child with non-responsive warning; off by default
- [ ] HeroSection title & Navbar logo appear as selectable nodes in Layers; double-click edits text inline
- [ ] Existing 1.3 projects migrate (Hero/Navbar decomposed) with no data loss
- [ ] Props tab renders from schema for all blocks; visually matches Style tab; 14 settings files gone
- [ ] Block picker separates primitives/presets; list view toggle works + persists
- [ ] Style Simple mode edits common props in plain language; Advanced unchanged
- [ ] Every Style/Props control has a tooltip; px hints shown
- [ ] First-run tour shows once, replayable
- [ ] `pnpm -r typecheck` clean; all tests pass + new command/migration/props tests
- [ ] Right-click duplicate works in BOTH canvas and Layers menus (regression from v1.3 fix)

---

## 8. Sequencing
WS1 (multi-select) → WS2 (group) + WS3 (position/resize) → WS4 (decomposition + inline text) → WS5 (schema Props) → WS6 (picker). **WS7 (approachability) in parallel**, tooltips landing first.

## 9. Risks
- **Multi-select/marquee interaction** is the hard part (hit-testing across zoom/scroll). Mitigate with the state machine + thorough manual test matrix.
- **Decomposition migration** must be lossless; cover with migration tests before shipping.
- **Schema-driven Props** repeater for object arrays (items[]) is the trickiest control; build it first as the gating piece of WS5.
- **Free positioning** is a footgun; keep gated + warned.
