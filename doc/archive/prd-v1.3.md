# Nova Editor — PRD v1.3 (Visual Style Editor + Layout Canvas)

**Version:** 1.3 (merged v1.3 + v1.4 — decision 2026-06-15)
**Status:** Implementing
**Base:** v1.2.1 as-built (composite blocks, Layers-first UX, free AI providers, AI chat history)
**Theme:** "Best-in-class Tailwind style editing — every element, every state, every breakpoint, live canvas feedback"
**Reference:** `reference/webstudio/` audited 2026-06-15; findings in `memory/project_nova_v13_forward.md`

---

## 0. Why merge v1.3 and v1.4

The audit of Webstudio's style panel (2026-06-15) revealed that layout editing is NOT a separate concern — it is simply the Layout section of the style panel, with a canvas overlay that shows the result. The gap between "show gap bands on canvas" (originally v1.3) and "drag gap bands to resize" (originally v1.4) is a single `onMouseDown` handler on the same `LayoutOverlay` component. Shipping both together is lower risk than two releases.

**What is merged in:**
- Canvas layout overlay (W0) — gap bands, direction badge
- Interactive gap drag handles (W8) — mousedown on band → drag to resize
- HeroSection layout prop: `centered / split-left / split-right` (W7)
- Layers panel layout badge — shows `flex →` or `grid 3` on parent nodes (W7)
- tailwind.config.js emit on publish from `project.theme` tokens (W10)

**What stays out (own design cycle required):**
- Drag-to-resize columns — requires solving the canvas-layers sync invariant (see `doc/ux-design.md` §7)
- Multi-region named block slots — requires new block authoring API
- Reusable style token chips (v1.5+)
- Inline text links inside TextBlock (v1.5+, needs TipTap/ProseMirror)

---

## 1. Scope boundary (exhaustive)

| Feature | v1.3 | Out |
|---|:---:|:---:|
| `classOverrides: string[]` — reserved key in element.props | ✅ | |
| Schema version `1.2.1 → 1.3` | ✅ | |
| NavLink → Link rename (schema migration + registry rename) | ✅ | |
| `makeCraftComponent` wrapper: `_novaClass` injection via `twMerge` | ✅ | |
| All 14 blocks accept `_novaClass?: string` and apply `twMerge` | ✅ | |
| Visual Tailwind Style Panel — 9 sections | ✅ | |
| Tabbed RightPanel: Props tab + Style tab | ✅ | |
| Breakpoint bar: All / sm / md / lg / xl + cascade indicator | ✅ | |
| State bar: — / hover / focus / active / focus-visible / disabled | ✅ | |
| Dark mode toggle (dark: prefix) | ✅ | |
| Context-sensitive flex-child / grid-child sections | ✅ | |
| Box-model SVG diagram for Spacing section | ✅ | |
| Scrub inputs — drag-to-change + unit dropdown (px / rem / % / auto) | ✅ | |
| Panel modes: Default / Focus (accordion) / Advanced (raw classes only) | ✅ | |
| PropertyLabel source dots (local / inherited / default) | ✅ | |
| Advanced typography popover (⋯ button, glows if active) | ✅ | |
| Canvas Layout Overlay — gap bands + direction badge (W0) | ✅ | |
| Interactive gap drag handles (hover band → resize cursor → drag) | ✅ | |
| HeroSection layout prop: centered / split-left / split-right | ✅ | |
| Layers panel layout badge (flex/grid indicator on parent node label) | ✅ | |
| tailwind.config.js emit on publish (from project.theme tokens) | ✅ | |
| AI planner + patcher reads/writes classOverrides | ✅ | |
| Drag-to-resize column widths | | ✅ v1.4 |
| Multi-region named block slots | | ✅ v1.4 |
| Reusable style token chips | | ✅ v1.5+ |
| Inline text links in TextBlock | | ✅ v1.5+ |

---

## 2. Architecture decisions

### 2.1 classOverrides: reserved prop key

`classOverrides` lives in `element.props` as a reserved key — NOT as a new field on the `Element` type.

```typescript
// No change to ElementSchema Zod validator (props is Record<string, unknown>)
// No change to the Element TypeScript type
// Convention: any element may have this special prop
element.props.classOverrides?: string[]
// e.g. ["mt-8", "hover:opacity-80", "md:text-xl", "dark:bg-gray-900"]
```

**Why inside props (not a separate field):**
- Zero change to ElementSchema Zod type — `props` is already `Record<string,unknown>`
- Craft.js `actions.setProp` already stores arbitrary prop keys in node data
- AI patcher uses `set_prop` operations; `classOverrides` is just another prop key
- No new migration logic needed for the Element itself

**Convention rules:**
1. Block components MUST NOT read `props.classOverrides` directly — the wrapper strips it before passing `{...rest}`
2. The key `classOverrides` is permanently reserved — no block may use it for its own purposes
3. Default value when absent: `[]` (no overrides)
4. Order: classes stored sorted: base → sm → md → lg → xl → hover → focus → active → dark

### 2.2 _novaClass prop injection (the bridge between classOverrides and block DOM)

`makeCraftComponent` computes `_novaClass = twMerge(...(classOverrides ?? []))` and injects it as a prop alongside `{...rest}`. Every block component:

1. Declares `_novaClass?: string` in its props interface (or `& { _novaClass?: string }`)
2. Applies it via `twMerge(ownDefaultClasses, _novaClass ?? "")` on the root element's `className`
3. Never shows `_novaClass` in its settings panel (it's a system prop, not a user prop)

```tsx
// packages/editor/src/craft-adapter/makeCraftComponent.tsx
const Wrapped = ({ classOverrides, _novaClass: _ignored, ...rest }: Record<string, unknown>) => {
  const { connectors: { connect, drag } } = useNode();
  const novaClass = twMerge(...((classOverrides as string[]) ?? []));
  return (
    <div
      style={{ display: "contents" }}
      ref={(wrapper) => {
        const el = wrapper?.firstElementChild as HTMLElement | null;
        if (el) connect(drag(el));
      }}
    >
      <Comp {...rest} _novaClass={novaClass} />
    </div>
  );
};
```

```tsx
// Example: packages/registry/src/blocks/Button/Button.tsx
interface ButtonProps {
  label: string;
  href: string;
  variant: "solid" | "outline" | "ghost";
  _novaClass?: string;  // ← system prop, injected by wrapper
}

export function Button({ label, href, variant, _novaClass = "" }: ButtonProps) {
  const base = cn(
    "inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors",
    variant === "solid" && "bg-nova-600 text-white hover:bg-nova-700",
    variant === "outline" && "border border-nova-600 text-nova-600 hover:bg-nova-50",
    variant === "ghost" && "text-nova-600 hover:bg-nova-50",
  );
  return (
    <a href={href} className={twMerge(base, _novaClass)}>
      {label}
    </a>
  );
}
```

**twMerge resolves conflicts:** if the block default has `px-4` and `_novaClass` adds `px-8`, result is `px-8` only.

### 2.3 NavLink → Link rename

`NavLink` block renames to `Link`. Rationale: a link is a universal primitive, not a Navbar-specific concept. `Link` works as a child of Navbar, Footer, any canvas block that accepts children.

Migration step `"1.2.1" → "1.3"`:
```typescript
// For every element recursively: if type === "NavLink", change to "Link"
function renameNavLinks(elements: Element[]): Element[] {
  return elements.map(el => ({
    ...el,
    type: el.type === "NavLink" ? "Link" : el.type,
    children: renameNavLinks(el.children),
  }));
}
```

Navbar's `canMoveIn` changes from `["NavLink", "Button"]` to `["Link", "Button"]`.

`Link` block props (unchanged from NavLink): `label`, `href`, `target: "_self" | "_blank"`, `rel?`, `textColor?`.

### 2.4 Canvas Layout Overlay architecture

`LayoutOverlay` renders gap-band visualizations using the browser's computed CSS (not class parsing). This means it works regardless of whether layout classes come from block defaults or `classOverrides`.

Detection:
```typescript
const cs = window.getComputedStyle(containerDom);
const display = cs.display; // 'flex' | 'grid' | etc.
const isFlex = display === "flex" || display === "inline-flex";
const isGrid = display === "grid" || display === "inline-grid";
```

Gap bands are computed from `getBoundingClientRect()` of child elements — the space between adjacent children's edges. Bands with width < 2px are not drawn.

Portal target: `.nova-canvas-page` (same as the floating toolbar). `z-[10]` — below the toolbar (`z-[20]`) and all overlays.

### 2.5 tailwind.config.js emit

On publish (Pro users), after writing `.tsx` files, emit a `tailwind.config.js` in the project repo root that maps `project.theme.colors` to custom Tailwind colors:

```javascript
// tailwind.config.js (emitted)
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",
        secondary: "#10b981",
        // ... from project.theme.colors
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        // ... from project.theme.fontFamily
      },
    },
  },
};
```

This is emitted by `packages/renderer/src/generateConfig.ts` (new file). Called from the publish API route after `.tsx` generation.

---

## 3. Workstream detail

### W0 — Canvas Layout Overlay

**Purpose:** Visual feedback on the canvas when a flex/grid container is selected. No style panel needed — this is standalone.

**New file:** `apps/studio/src/components/editor/LayoutOverlay.tsx`

```typescript
interface LayoutOverlayProps {
  containerDom: HTMLElement;
  childDoms: HTMLElement[];
  isFlex: boolean;
  isRow: boolean; // flex-row or flex-col
  isGrid: boolean;
  // Craft node ID needed for gap drag writes
  nodeId: string;
}
```

**GapRect computation — flex:**
1. Filter and sort children by main-axis position (left for row, top for column)
2. For each adjacent pair (childA, childB):
   - Row: `{ left: childA.right, top: containerRect.top, width: childB.left - childA.right, height: containerRect.height }`
   - Column: `{ left: containerRect.left, top: childA.bottom, width: containerRect.width, height: childB.top - childA.bottom }`
3. Skip if width/height < 2px

**flex-wrap edge case:** Group children by their dominant axis start position (within ±4px tolerance). Compute per-group gaps. Between groups, compute row-gap bands.

**GapRect computation — grid:**
1. Collect all child `right` values → deduplicate → sort → these are column gap starts
2. Column gap width = `parseFloat(getComputedStyle(container).columnGap) || 0`
3. Same for rows using `bottom` values and `rowGap`
4. Only draw if gap ≥ 2px

**Gap drag handles:** On `mouseenter` over a band, change cursor to `col-resize` (row gap) or `row-resize` (column gap) and increase band opacity to 50%. On `mousedown`, start drag:
```typescript
const startDrag = (e: MouseEvent, orientation: "h" | "v", startGapPx: number) => {
  const startPos = orientation === "h" ? e.clientX : e.clientY;
  const onMove = (me: MouseEvent) => {
    const delta = (orientation === "h" ? me.clientX : me.clientY) - startPos;
    const newGapPx = Math.max(0, startGapPx + delta);
    const tailwindClass = pxToGapClass(newGapPx); // maps to gap-0..gap-96
    actions.setProp(nodeId, (p: Record<string, unknown>) => {
      const overrides = (p.classOverrides as string[] ?? [])
        .filter(c => !c.match(/^gap-/));  // remove existing gap class
      p.classOverrides = [...overrides, tailwindClass];
    });
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", () => window.removeEventListener("mousemove", onMove), { once: true });
};
```

**RenderNode.tsx changes:**
1. Add `childIds: node.data.nodes ?? []` to `useNode` subscription
2. After existing `useLayoutEffect`, add layout detection:
   ```typescript
   const [layoutType, setLayoutType] = useState<null | "flex-row" | "flex-col" | "grid">(null);
   // In useLayoutEffect: read getComputedStyle(dom).display → set layoutType
   ```
3. Compute `childDoms` from `childIds.map(cId => tryGetDom(query, cId))`
4. Add layout badge to toolbar: `{name}` → `{name}{layoutType && <span>{layoutBadge}</span>}`
5. Render `<LayoutOverlay>` in portal when `isActive && layoutType && childDoms.length > 0`

**Files changed:** `RenderNode.tsx`, `LayoutOverlay.tsx` (new)

---

### W1 — Schema: classOverrides + version bump + NavLink→Link

**Files changed:**
- `packages/schema/src/migrations/runner.ts` — add step `"1.2.1" → "1.3"`
- `packages/schema/src/defaults.ts` — bump `schemaVersion` to `"1.3"`
- `packages/schema/src/schemas/project.schema.ts` — update version regex to allow `1.3`
- `packages/registry/src/blocks/NavLink/` → rename folder to `Link/`, update all 5 files
- `packages/registry/src/index.ts` — export `Link` instead of `NavLink`
- `packages/registry/src/blocks/Navbar/index.ts` — `canMoveIn: ["Link", "Button"]`
- All block files referencing NavLink type → update to Link

**Migration step (runner.ts):**
```typescript
{
  from: "1.2.1",
  to: "1.3",
  migrate: (project: Project): Project => ({
    ...project,
    schemaVersion: "1.3",
    pages: project.pages.map(page => ({
      ...page,
      elements: renameNavLinks(page.elements),
    })),
  }),
}
```

**No classOverrides migration needed** — absent prop = `[]`. Existing elements work without any migration.

**Test updates:**
- `packages/schema/src/__tests__/` — update version assertions from `"1.2.1"` to `"1.3"`
- Add test for NavLink→Link migration

---

### W2 — makeCraftComponent: _novaClass injection + all blocks

**New dependency:** `tailwind-merge` in `packages/editor` and `packages/registry`
```
pnpm add tailwind-merge --filter @studio/editor --filter @studio/registry
```

**`makeCraftComponent.tsx` changes:**
```typescript
import { twMerge } from "tailwind-merge";

const Wrapped = (allProps: Record<string, unknown>) => {
  const { classOverrides, ...rest } = allProps;
  const novaClass = twMerge(...((classOverrides as string[] | undefined) ?? []));
  const { connectors: { connect, drag } } = useNode();
  return (
    <div
      style={{ display: "contents" }}
      ref={(wrapper) => {
        const el = wrapper?.firstElementChild as HTMLElement | null;
        if (el) connect(drag(el));
      }}
    >
      <Comp {...rest} _novaClass={novaClass || undefined} />
    </div>
  );
};
```

**Block modifications (14 blocks — mechanical, 3 lines each):**

For each block:
1. Add `_novaClass?: string` to the props interface (or type intersection)
2. Destructure it with default `""` in the function signature
3. Apply `twMerge(existingClassName, _novaClass)` on the root element

| Block file | Root element | Current className source |
|---|---|---|
| `Section/Section.tsx` | `<section>` | `cn("relative", ...)` |
| `Column/Column.tsx` | `<div>` | `cn("grid", ...)` |
| `HeroSection/HeroSection.tsx` | `<section>` | `cn("relative py-20", ...)` |
| `Navbar/Navbar.tsx` | `<nav>` | `cn("fixed top-0", ...)` |
| `Button/Button.tsx` | `<a>` | `cn("inline-flex", ...)` |
| `TextBlock/TextBlock.tsx` | varies | depends on `variant` |
| `Image/Image.tsx` | `<div>` or `<figure>` | `cn("overflow-hidden", ...)` |
| `FeatureCard/FeatureCard.tsx` | `<div>` | `cn("rounded-xl", ...)` |
| `FAQ/FAQ.tsx` | `<div>` | `cn("py-12", ...)` |
| `Stats/Stats.tsx` | `<div>` | `cn("py-16", ...)` |
| `Testimonials/Testimonials.tsx` | `<div>` | `cn("py-16", ...)` |
| `Footer/Footer.tsx` | `<footer>` | `cn("bg-gray-900", ...)` |
| `Link/Link.tsx` (was NavLink) | `<a>` | inline style + className |
| `PricingCard/PricingCard.tsx` | `<div>` | `cn("rounded-2xl", ...)` |

**Pattern for each (example Section):**
```tsx
// Before:
export function Section({ bgColor, padding, children }: SectionProps) {
  return <section className={cn("relative w-full", `bg-[${bgColor}]`, `py-${padding}`)}>

// After:
export function Section({ bgColor, padding, children, _novaClass = "" }: SectionProps & { _novaClass?: string }) {
  return <section className={twMerge(cn("relative w-full", `bg-[${bgColor}]`, `py-${padding}`), _novaClass)}>
```

---

### W3 — StylePanel data layer

**New files:**
- `apps/studio/src/components/editor/StylePanel.utils.ts` — class↔value mapping tables + parse/serialize
- `apps/studio/src/hooks/useDragScrub.ts` — pointer drag-to-increment hook

**`StylePanel.utils.ts` exports:**

```typescript
// Spacing values (Tailwind default scale)
export const SPACING_SCALE: Record<string, string> = {
  "0": "0px", "px": "1px", "0.5": "2px", "1": "4px", "1.5": "6px",
  "2": "8px", "2.5": "10px", "3": "12px", "4": "16px", "5": "20px",
  "6": "24px", "7": "28px", "8": "32px", "9": "36px", "10": "40px",
  "11": "44px", "12": "48px", "14": "56px", "16": "64px", "20": "80px",
  "24": "96px", "28": "112px", "32": "128px", "36": "144px", "40": "160px",
  "44": "176px", "48": "192px", "52": "208px", "56": "224px", "60": "240px",
  "64": "256px", "72": "288px", "80": "320px", "96": "384px",
  "auto": "auto",
};

// Class ↔ value extractors
export function extractClassValue(
  classes: string[],
  prefix: string,         // e.g. "pt-", "mt-", "gap-"
  breakpoint: string,     // e.g. "" | "sm:" | "md:"
  state: string           // e.g. "" | "hover:" | "focus:"
): string | null;

// Class writer: removes existing prefix+breakpoint+state combos, adds new class
export function setClassValue(
  classes: string[],
  prefix: string,
  value: string,          // Tailwind suffix or arbitrary value [...]
  breakpoint: string,
  state: string,
  darkMode: boolean
): string[];

// Removes ALL classes matching a prefix (all breakpoints + states)
export function removeClassPrefix(classes: string[], prefix: string): string[];

// Parses display type from class list
export function getDisplayType(classes: string[]): "block"|"flex"|"grid"|"inline"|"inline-flex"|"inline-grid"|"hidden"|null;

// Gets ALL prefixes in a class list that aren't recognized by any mapping table
// Returns them as "raw overrides" to show in the RawOverrides section
export function getRawOverrides(classes: string[], knownPrefixes: string[]): string[];
```

**`useDragScrub.ts` hook:**

```typescript
interface UseDragScrubOptions {
  value: number;
  step?: number;  // default 1
  min?: number;   // default -Infinity
  max?: number;   // default Infinity
  onValueChange: (newValue: number) => void;
  onDragEnd?: (finalValue: number) => void;
}

// Returns: ref to attach to the input element, isDragging boolean
export function useDragScrub(opts: UseDragScrubOptions): {
  ref: React.RefCallback<HTMLElement>;
  isDragging: boolean;
};
```

Implementation: `pointerdown → setPointerCapture → pointermove (compute delta) → pointerup`. Shift key multiplies step by 10 for faster scrubbing.

**Unit conversion table:**
```typescript
export const UNIT_CONVERSIONS = {
  "px→rem": (px: number) => px / 16,
  "rem→px": (rem: number) => rem * 16,
  "px→%": (px: number, parentPx: number) => (px / parentPx) * 100,
  "%→px": (pct: number, parentPx: number) => (pct / 100) * parentPx,
};
```

**`pxToGapClass` (used by W8 drag handles):**
```typescript
export function pxToGapClass(px: number): string {
  // Maps px to nearest gap-N Tailwind class
  const entries = Object.entries(SPACING_SCALE).filter(([k]) => k !== "auto");
  const nearest = entries.reduce((best, [k, v]) => {
    const diff = Math.abs(parseInt(v) - px);
    return diff < best.diff ? { key: k, diff } : best;
  }, { key: "0", diff: Infinity });
  return `gap-${nearest.key}`;
}
```

---

### W4 — StylePanel UI (9 sections)

**New file:** `apps/studio/src/components/editor/StylePanel.tsx`

**Component structure (top-level):**
```tsx
export function StylePanel({ nodeId }: { nodeId: string }) {
  // Read classOverrides from Craft node
  const { classOverrides } = useNode((node) => ({
    classOverrides: (node.data.props.classOverrides as string[] | undefined) ?? [],
  }));
  
  // Active breakpoint and state
  const [breakpoint, setBreakpoint] = useState<"" | "sm:" | "md:" | "lg:" | "xl:">("");
  const [state, setState] = useState<"" | "hover:" | "focus:" | "active:" | "focus-visible:" | "disabled:">("");
  const [darkMode, setDarkMode] = useState(false);
  const [panelMode, setPanelMode] = useState<"default" | "focus" | "advanced">("default");
  const [openSection, setOpenSection] = useState<string | null>(null); // for focus mode
  
  // Write helper
  const { actions } = useEditor();
  const setClass = useCallback((prefix: string, value: string) => {
    actions.setProp(nodeId, (p: Record<string, unknown>) => {
      p.classOverrides = setClassValue(
        (p.classOverrides as string[] | undefined) ?? [],
        prefix, value, breakpoint, state, darkMode
      );
    });
  }, [nodeId, actions, breakpoint, state, darkMode]);

  const classes = classOverrides;

  return (
    <div className="flex flex-col h-full">
      <PanelModeMenu mode={panelMode} onChange={setPanelMode} />
      <BreakpointBar value={breakpoint} onChange={setBreakpoint} />
      <StateBar value={state} onChange={setState} darkMode={darkMode} onDarkMode={setDarkMode} />
      
      {panelMode === "advanced" ? (
        <RawOverrides classes={classes} onChange={/* full replace */} />
      ) : (
        <div className="flex-1 overflow-y-auto dark-scroll">
          {/* 9 sections */}
          <Section id="layout" label="Layout" mode={panelMode} openSection={openSection} onToggle={setOpenSection}>
            <LayoutSection classes={classes} setClass={setClass} />
          </Section>
          <Section id="spacing" label="Spacing" ...>
            <SpacingSection classes={classes} setClass={setClass} containerDom={dom} />
          </Section>
          <Section id="sizing" label="Sizing" ...>
            <SizingSection ... />
          </Section>
          <Section id="position" label="Position" ...>
            <PositionSection ... />
          </Section>
          <Section id="typography" label="Typography" ...>
            <TypographySection ... />
          </Section>
          <Section id="background" label="Background" ...>
            <BackgroundSection ... />
          </Section>
          <Section id="border" label="Border" ...>
            <BorderSection ... />
          </Section>
          <Section id="effects" label="Effects" ...>
            <EffectsSection ... />
          </Section>
          <Section id="transitions" label="Transitions" ...>
            <TransitionsSection ... />
          </Section>
          <RawOverrides classes={getRawOverrides(classes, ALL_KNOWN_PREFIXES)} onRemove={/* remove class */} />
        </div>
      )}
      
      {/* Always-visible custom class input */}
      <CustomClassInput onAdd={/* append to classOverrides */} />
    </div>
  );
}
```

**Section 1 — Layout:**
Controls: Display (segmented: block/flex/grid/inline/inline-flex/hidden), Flex direction (conditional), Justify content, Align items, Gap (linked all / individual x,y), Flex wrap, Overflow x/y.

Display control uses `SegmentedControl` component (icon buttons for each option).

**Section 2 — Spacing (box-model diagram):**
Primary UI: SVG box-model diagram (outer = margin, inner = padding, center = element).
- Each of the 8 trapezoidal regions is clickable
- Clicking opens a floating `InputPopover` anchored to the clicked region
- `InputPopover` has a scrub input + unit dropdown (px/rem/%/auto)
- Shift-click: link all 4 sides of margin or padding

Fallback: below the diagram, "Show more" expands individual margin-top/right/bottom/left + padding-top/right/bottom/left inputs.

**Section 3 — Sizing:**
Width, Height as scrub inputs. Min/Max as collapsible "Show more". Aspect ratio dropdown.

**Section 4 — Position:**
Position type (segmented: static/relative/absolute/fixed/sticky). When non-static: inset grid (top/right/bottom/left as 4 scrub inputs in a 2×2 grid). Z-index (number input).

**Section 5 — Typography:**
Font family (3-item segmented: sans/serif/mono). Font size (scrub input). Line height (scrub input). Font weight (segmented: thin → black, 9 options). Text align (4 icon buttons). Text color (color picker). Letter spacing (scrub input).
"Show more" expander → opens `TypographyAdvancedPopover` (⋯ button, glows orange if any advanced prop set):
- Font style (italic toggle), Text decoration (underline/line-through/none), Text transform, Text overflow, White space, Word break.

**Section 6 — Background:**
Background color (color picker). Background size (segmented: auto/cover/contain). Background position (9-cell grid selector). Background repeat (segmented). "Show more" → gradient builder (direction dropdown + from/via/to color pickers).

**Section 7 — Border:**
Border width (scrub or select with link toggle for sides). Border style (segmented: none/solid/dashed/dotted). Border color (color picker). Border radius (visual corner selector — 4 corner inputs + link toggle). "Show more" → ring + outline controls.

**Section 8 — Effects:**
Opacity (slider 0–100). Cursor (dropdown). Box shadow (preset dropdown: none/sm/md/lg/xl/2xl/inner). "Show more" → backdrop-blur, mix-blend-mode, filter (blur/brightness/contrast), visibility toggle, pointer-events.

**Section 9 — Transitions:**
Transition property (segmented: none/all/colors/opacity/shadow/transform). Duration (segmented: common values). Timing (segmented: linear/ease-in/ease-out/ease-in-out). "Show more" → delay + transform controls (scale/rotate/translate) + animation presets.

**Color picker component:**
- HEX text input (auto-updates picker)
- HSL hue slider + saturation/lightness square
- Project theme swatches from `project.theme.colors` (first)
- Standard Tailwind color palette grid (second, 11 colors × 10 shades)
- Writes `bg-[#hex]`, `text-[#hex]`, or `border-[#hex]`

**Breakpoint bar:**
```
[ All ] [ sm ] [ md ] [ lg ] [ xl ]
  ↑ cascade indicator arrow spans from selected to smaller breakpoints
```

**State bar:**
```
[ — ] [ hover ] [ focus ] [ active ] [ focus-visible ] [ disabled ]   [ dark ]
```
Dark mode is a separate toggle at the end. When active, all classes written get `dark:` prefix (stacks with state: `dark:hover:bg-gray-800`).

**Panel modes (⋮ kebab menu at top-right):**
- Default: all sections open, no accordion behavior
- Focus: only one section open at a time (accordion), others collapse
- Advanced: hides all sections; shows only RawOverrides + CustomClassInput

**PropertyLabel source dots:**
Every section label and individual control label gets a 4px colored dot:
- Grey: no override for this property (browser default or block default, cannot tell which)
- Orange: classOverrides contains a class for this property at the current breakpoint+state

Implementation: `hasOverride(classes, prefix, breakpoint, state)` → checks if any class in `classes` starts with `${breakpoint}${state}${prefix}`.

**RawOverrides section:**
Always rendered at the bottom. Shows a chip for each class in `classOverrides` that doesn't match any known prefix. Each chip has an `×` button to remove.

**CustomClassInput:**
Always-visible text input at the bottom (below sections). Placeholder: "Add any Tailwind class…". Enter key appends to `classOverrides`. No validation — any string is accepted (user is responsible for valid Tailwind classes).

---

### W5 — Context-sensitive flex-child / grid-child sections

These appear in the **Layout section** (not as separate top-level sections) when the selected element's PARENT has a flex or grid display class.

**Detection:**
```typescript
// In StylePanel, read parent node's computed style
const { parentId } = useNode((node) => ({ parentId: node.data.parent }));
const parentDom = parentId ? tryGetDom(query, parentId) : null;
const parentDisplay = parentDom ? window.getComputedStyle(parentDom).display : null;
const parentIsFlex = parentDisplay === "flex" || parentDisplay === "inline-flex";
const parentIsGrid = parentDisplay === "grid" || parentDisplay === "inline-grid";
```

**FlexChildControls** (shown when `parentIsFlex`):
- Align self (segmented: auto/start/end/center/stretch/baseline) → `self-*`
- Flex grow (toggle: off/1) → `flex-grow` / `flex-grow-0`
- Flex shrink (toggle: off/1) → `flex-shrink` / `flex-shrink-0`
- Flex basis (scrub input) → `basis-*`
- Order (number input) → `order-*`

**GridChildControls** (shown when `parentIsGrid`):
- Column span (number input 1–12) → `col-span-*`
- Row span (number input 1–12) → `row-span-*`
- Column start (number input) → `col-start-*`
- Row start (number input) → `row-start-*`

---

### W6 — RightPanel tabbed UI

**File changed:** `apps/studio/src/components/editor/RightPanel.tsx`

Current header shows block name + expand/collapse. Replace with:

```tsx
// New header structure:
<div className="flex items-center border-b border-white/10">
  <button
    className={tab === "props" ? "tab-active" : "tab"}
    onClick={() => setTab("props")}
  >
    Props
  </button>
  <button
    className={tab === "style" ? "tab-active" : "tab"}
    onClick={() => setTab("style")}
  >
    Style
    {hasOverrides && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 ml-1" />}
  </button>
</div>
```

`hasOverrides` = `((node.data.props.classOverrides as string[]) ?? []).length > 0`.

Tab content:
- `props` tab → existing `block.settings` component (unchanged)
- `style` tab → new `<StylePanel nodeId={selectedNodeId} />`

**Persistent tab per node:** When selecting a different block, tab resets to `props` (the block's own settings are always the primary landing).

**Tab state** lives in `uiStore`:
```typescript
rightPanelTab: "props" | "style";
setRightPanelTab: (t: "props" | "style") => void;
```

---

### W7 — HeroSection layout prop + Layers layout badge

**HeroSection layout prop:**

```typescript
// HeroSection props schema:
interface HeroSectionProps {
  title: string;
  subtitle: string;
  bgColor: string;
  align: "left" | "center" | "right";
  layout: "centered" | "split-left" | "split-right"; // NEW in v1.3
  _novaClass?: string;
}
```

Default: `layout: "centered"` (current behavior, no visual change for existing projects).

Render logic:
```tsx
// centered: existing layout (title/subtitle stacked, children below in flex-row)
// split-left: 2-column grid, text left (col 1), children right (col 2)
// split-right: 2-column grid, children left (col 1), text right (col 2)

const outerClass = twMerge(
  "relative w-full py-20",
  layout !== "centered" && "grid grid-cols-2 gap-12 items-center",
  `bg-[${bgColor}]`,
  _novaClass
);
```

HeroSection settings panel adds a segmented `layout` control.

**Layers panel layout badge:**

In `LeftPanel.tsx`, the Layers tree renders each node's name. When a node is a flex or grid container, append a small badge after the name.

Detection: read from the DOM (same `getComputedStyle` approach as RenderNode), but in the Layers context we don't have a reliable DOM ref for all nodes.

Alternative: read from `classOverrides` (available in the Craft node tree). Check for `"flex"`, `"grid"`, `"inline-flex"`, `"inline-grid"` in the class list.

```typescript
// In Layers tree node render:
const overrides = (node.data.props.classOverrides as string[] | undefined) ?? [];
const hasFlex = overrides.some(c => c === "flex" || c === "inline-flex");
const hasGrid = overrides.some(c => c === "grid" || c === "inline-grid");
const flexDir = overrides.find(c => c.startsWith("flex-")) ?? "flex-row";
const isRow = flexDir !== "flex-col";

// Render badge after name:
{hasFlex && <span className="text-[9px] text-purple-400 ml-1">{isRow ? "flex →" : "flex ↓"}</span>}
{hasGrid && <span className="text-[9px] text-purple-400 ml-1">grid</span>}
```

**Limitation:** Only shows badge for elements WHERE the user explicitly set flex/grid via classOverrides. Blocks that are flex by default (like Navbar) won't show the badge unless the user adds a `flex` classOverride. This is acceptable for v1.3 — the canvas overlay (W0) covers the visual feedback for default-flex blocks.

---

### W8 — Interactive gap drag handles

**Integrated into `LayoutOverlay.tsx`** — gap bands become interactive when `classOverrides` is accessible via `actions.setProp`.

Gap bands render as:
```tsx
<div
  className="fixed pointer-events-auto cursor-col-resize transition-opacity"
  style={{
    left: band.left, top: band.top,
    width: Math.max(band.width, 8), // minimum 8px touch target even if gap is smaller
    height: band.height,
    opacity: hoveredIdx === i ? 0.5 : 0.25,
    background: "rgba(147, 51, 234, 1)",
    transform: band.width < 8 ? `translateX(${(band.width - 8) / 2}px)` : undefined,
  }}
  onMouseEnter={() => setHoveredIdx(i)}
  onMouseLeave={() => setHoveredIdx(null)}
  onMouseDown={(e) => startGapDrag(e, band, nodeId)}
/>
```

Gap drag writes to `classOverrides`:
- Removes existing `gap-*` / `gap-x-*` / `gap-y-*` classes (for the current gap orientation)
- Adds the nearest Tailwind gap class for the new pixel value
- Uses `pxToGapClass()` from `StylePanel.utils.ts`

**Visual feedback during drag:** Since `classOverrides` update is synchronous (Craft re-renders immediately), the gap bands recompute positions on the next `useLayoutEffect` flush, giving live visual feedback.

---

### W9 — AI integration: classOverrides read/write

**Planner prompt update** (`packages/ai/src/planner.ts`):

Add to the system prompt's schema description:
```
Each element may have an optional "classOverrides" in its props: a list of Tailwind CSS class strings
applied on top of the block's built-in styles. The patcher can:
- set_prop: target "classOverrides", value: ["mt-8", "hover:opacity-80", "md:text-xl"]
- The list is additive — provide the COMPLETE desired list (not a diff)
- Use twMerge semantics: later classes override conflicting earlier ones
```

**Patcher update** (`packages/ai/src/patcher.ts`):

When a `set_prop` operation targets `classOverrides`, validate that the value is `string[]`. Pass through unchanged — no special handling needed since `classOverrides` is just a prop.

**Example AI interaction:**
```
User: "Make the hero section title larger on desktop"
Planner: [{ action: "set_prop", target: "node_abc123", prop: "classOverrides", value: ["md:text-5xl", "lg:text-6xl"] }]
Patcher: produces JSON patch to set props.classOverrides = ["md:text-5xl", "lg:text-6xl"]
```

---

### W10 — tailwind.config.js emit on publish

**New file:** `packages/renderer/src/generateConfig.ts`

```typescript
import type { Theme } from "@studio/schema";

export function generateTailwindConfig(theme: Theme | undefined): string {
  const colors = Object.fromEntries(
    Object.entries(theme?.colors ?? {}).map(([k, v]) => [k, v])
  );
  const fontFamily: Record<string, string[]> = {};
  if (theme?.fontFamily?.sans) fontFamily.sans = [theme.fontFamily.sans, "sans-serif"];
  if (theme?.fontFamily?.serif) fontFamily.serif = [theme.fontFamily.serif, "serif"];
  if (theme?.fontFamily?.mono) fontFamily.mono = [theme.fontFamily.mono, "monospace"];

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6)},
      fontFamily: ${JSON.stringify(fontFamily, null, 6)},
    },
  },
  plugins: [],
};
`;
}
```

**Publish API route** (`apps/studio/src/app/api/project/[projectId]/publish/route.ts`):
After generating `.tsx` files, call `generateTailwindConfig(project.theme)` and commit it as `tailwind.config.js` in the project repo.

**Free tier:** Also emit `tailwind.config.js` (not just `.tsx`) — design tokens are not a Pro feature.

---

## 4. Complete file change index

| File | Change | Workstream |
|---|---|---|
| `apps/studio/src/components/editor/LayoutOverlay.tsx` | **New** — gap bands, drag handles | W0 |
| `apps/studio/src/components/editor/RenderNode.tsx` | childIds, layoutType, LayoutOverlay render | W0 |
| `apps/studio/src/components/editor/StylePanel.tsx` | **New** — full 9-section style editor | W4 |
| `apps/studio/src/components/editor/StylePanel.utils.ts` | **New** — class↔value tables, helpers | W3 |
| `apps/studio/src/hooks/useDragScrub.ts` | **New** — drag-to-increment hook | W3 |
| `apps/studio/src/components/editor/RightPanel.tsx` | Add Props/Style tab bar | W6 |
| `apps/studio/src/components/editor/LeftPanel.tsx` | Layout badge on Layers nodes | W7 |
| `apps/studio/src/store/uiStore.ts` | Add `rightPanelTab` state | W6 |
| `packages/schema/src/migrations/runner.ts` | Add 1.2.1→1.3 step | W1 |
| `packages/schema/src/defaults.ts` | Version → "1.3" | W1 |
| `packages/schema/src/schemas/project.schema.ts` | Version regex update | W1 |
| `packages/registry/src/blocks/NavLink/` | **Rename folder** to `Link/` | W1 |
| `packages/registry/src/blocks/Link/Link.tsx` | rename + `_novaClass` | W1, W2 |
| `packages/registry/src/blocks/Link/index.ts` | export Link | W1 |
| `packages/registry/src/blocks/Navbar/index.ts` | canMoveIn: ["Link", "Button"] | W1 |
| `packages/registry/src/index.ts` | export Link instead of NavLink | W1 |
| `packages/registry/src/blocks/Section/Section.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/Column/Column.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/HeroSection/HeroSection.tsx` | `_novaClass` + `layout` prop | W2, W7 |
| `packages/registry/src/blocks/HeroSection/HeroSection.settings.tsx` | layout control | W7 |
| `packages/registry/src/blocks/HeroSection/HeroSection.schema.ts` | layout field | W7 |
| `packages/registry/src/blocks/Navbar/Navbar.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/Button/Button.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/TextBlock/TextBlock.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/Image/Image.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/FeatureCard/FeatureCard.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/FAQ/FAQ.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/Stats/Stats.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/Testimonials/Testimonials.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/Footer/Footer.tsx` | `_novaClass` + twMerge | W2 |
| `packages/registry/src/blocks/PricingCard/PricingCard.tsx` | `_novaClass` + twMerge | W2 |
| `packages/editor/src/craft-adapter/makeCraftComponent.tsx` | classOverrides strip + _novaClass inject | W2 |
| `packages/ai/src/planner.ts` | classOverrides prompt | W9 |
| `packages/ai/src/patcher.ts` | classOverrides validation | W9 |
| `packages/renderer/src/generateConfig.ts` | **New** — tailwind.config.js generator | W10 |
| `apps/studio/src/app/api/project/[projectId]/publish/route.ts` | emit tailwind.config.js | W10 |
| `packages/schema/src/__tests__/` | version assertion updates | W1 |
| `apps/studio/e2e/style-panel.spec.ts` | **New** — style panel E2E | W11 |

---

## 5. Per-block capability matrix (v1.3)

| Block | Style panel target | _novaClass on | Editable via Style tab |
|---|---|---|---|
| Section | `<section>` root | ✅ | bg, padding, display, gap, all |
| Column | `<div>` root | ✅ | grid-cols, gap, sizing, all |
| HeroSection | `<section>` root | ✅ | All + layout prop via Props |
| Navbar | `<nav>` root | ✅ | bg, sticky, all |
| Button | `<a>` root | ✅ | All |
| TextBlock | root `<p>/<h1>...` | ✅ | Typography, all |
| Image | root `<div>/<figure>` | ✅ | Sizing, border-radius, all |
| FeatureCard | `<div>` root | ✅ | Colors, border, all |
| FAQ | `<div>` root | ✅ | Spacing, all |
| Stats | `<div>` root | ✅ | Colors, spacing, all |
| Testimonials | `<div>` root | ✅ | Colors, grid, all |
| Footer | `<footer>` root | ✅ | Colors, spacing, all |
| Link (was NavLink) | `<a>` root | ✅ | Typography, colors, all |
| PricingCard | `<div>` root | ✅ | Colors, border, spacing, all |

Note: `_novaClass` applies to the **root element** only. Sub-elements within preset blocks (FeatureCard's icon, FAQ's accordion button, etc.) are NOT individually styled until they become separate Craft.js nodes (architecture upgrade, v1.4+).

---

## 6. Exit criteria

All of the following must be true before v1.3 ships:

- [ ] Clicking any block → Style tab → changing any Tailwind class → canvas updates live
- [ ] `classOverrides: ["mt-8"]` on a Section → Section has `mt-8` applied, block default `mt-*` overridden
- [ ] Breakpoint control: selecting `md:` + padding → writes `md:px-8` → preview at md breakpoint shows result
- [ ] State control: selecting `hover:` + opacity 80 → writes `hover:opacity-80` → hovering element shows 80% opacity
- [ ] Dark mode toggle: on + background color → writes `dark:bg-gray-900`
- [ ] NavLink blocks in existing projects migrate to Link on load (migration test passes)
- [ ] Link block works in Navbar, Footer, and as standalone block
- [ ] Canvas shows "flex →" badge in floating toolbar when a flex-row container is selected
- [ ] Canvas shows purple gap bands between flex/grid children when container is selected
- [ ] Dragging a gap band changes the gap value → gap-class in classOverrides updates → bands recompute
- [ ] HeroSection `layout: "split-left"` renders 2-column grid with text left, image right
- [ ] Layers panel shows "flex →" badge on Layers nodes that have flex/grid in classOverrides
- [ ] Publish emits `tailwind.config.js` with project theme colors
- [ ] AI can set `classOverrides` via natural language ("make the hero larger on desktop")
- [ ] `pnpm --filter @studio/app typecheck` — zero errors
- [ ] All 247+ existing tests pass; new schema migration tests pass
- [ ] RightPanel Props tab is unchanged — no regressions in block settings panels
- [ ] Panel mode "Advanced" shows only raw class chips + custom class input
- [ ] "Extract block" context menu item works (bug fix landed in prior session)
- [ ] Right panel auto-close bug fixed (clicking block doesn't prevent manual close)

---

## 7. Sequence diagram

```
W0 (Canvas Layout Overlay) ─────────────────────────────────────► done
                                │
W1 (Schema + NavLink→Link) ─────┤
                                │
W2 (makeCraftComponent + all blocks) ◄── W1 ──────────────────► done
                                │
                     ┌──────────┴──────────┐
W3 (StylePanel data)─┤                     ├─ W7 (HeroSection + Layers badge)
W4 (StylePanel UI) ──┘◄── W3              │
                          │               │
W5 (context sections)◄────┤               │
W6 (RightPanel tabs)◄─────┤               │
W8 (gap drag)◄────────────┤               │
                          │               │
W9 (AI) ◄─────────────────┤               │
W10 (tailwind emit) ◄──── │ (independent) ┘
                          │
W11 (E2E tests) ◄─────────┘ (last)
```

W0 ships first — it has zero dependencies and delivers immediate visual value.
W1 + W2 unlock the entire style pipeline.
W3 and W7 can proceed in parallel after W1 is done.
W4, W5, W6, W8 all depend on W3 (the class mapping tables are shared).
W9 and W10 are independent of the UI workstreams.
W11 is last (tests verify the full system).
