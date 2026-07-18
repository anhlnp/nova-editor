# Nova Editor Redesign — Webstudio-Parity (then Nova-ceiling)

> **Status:** Proposal (ratified IA decisions 2026-06-26). Not yet implemented.
> **Goal:** Reach parity with webstudio's *working editor* features, hooked onto Nova's existing
> mental model (Document-authority [ADR-042] + bounded-Tailwind `classOverrides` [ADR-018] + I1–I10),
> **then** re-introduce Nova's Figma-grade gizmos as the ceiling.
> **Umbrella:** [MODEL.md](MODEL.md). This doc only restructures the **editor UI/IA layer** (canvas,
> left, right, top bar, modes) — no schema change, no invariant broken.

## Why this doc

The current editor is "chưa ổn": **over-consolidated** (one LeftPanel = Blocks+Layers+presets; one
RightPanel = Props/Style hidden tabs) and **over-ambitious at the canvas** (Figma gizmos + Webflow flow
DnD layered together, all 🟡 unverified), while **missing** the two things that make webstudio feel
solid+commercial: Settings/Style separation + style **provenance**, and **Content/Preview modes**.
Audit source: [reference/webstudio-community/docs/university/foundations/](../reference/webstudio-community/docs/university/foundations/).

## Ratified decisions (2026-06-26)

1. **Right panel = segmented Settings/Style** (one 280px panel, segmented control — not hidden tabs,
   not two separate webstudio-style panels). Closest to current Nova, lowest risk.
2. **Defer CMS/data entirely.** Parity scope = editor only (canvas/left/right/modes/breakpoints).
   Webstudio's CMS, data variables, and expression binding are a *separate pillar*, built later — they
   are not the clarity problem and Nova has no data layer yet.

## Re-audit corrections (2026-06-26, code-grounded)

A careful re-audit of *both* codebases corrected 3 docs-based assumptions:

- **C1 — Left rail already exists.** Nova already has the icon-rail + active-panel pattern
  (`LeftPanel.tsx` L78–86: layers/blocks/ai/templates/pages/components + `toggleLeftSection`),
  matching webstudio `sidebar-left.tsx`. The IA is not the problem. Real work = **declutter the rail**
  (remove Blocks-vs-Components redundancy; fold AI/Templates; move Theme out of Pages), **add an Assets
  panel**, and **split the 2110-line monolith** into per-panel files. *Not* "replace with a rail."
- **C2 — Webstudio also tabs Style/Settings.** `inspector.tsx` (L119–204) uses `PanelTabs`
  (Style | Settings) — identical to nova's `RightPanel` Props|Style tabs. The tab structure is fine;
  the segmented choice is cosmetic. Real diffs: rename Props→Settings, **mode-gate the Style tab**
  (webstudio: design-mode + has-presetStyle + html only), add instance-info header.
- **C3 — Breakpoint canvas already exists, but is incoherent.** Nova wires viewport→canvas width
  (TopBar desktop/tablet/mobile → `Canvas.tsx` L62 `VIEWPORT_WIDTH[viewport]`). The real gap: the
  **viewport preview is disconnected from the style breakpoint** (`StylePanel.tsx` L102 local
  `breakpoint` writing `md:`/`lg:`). Webstudio fuses them (one breakpoint resizes canvas AND scopes
  styles, mobile-first cascade). **Phase 3 = unify these two, not add a canvas.**

New issues surfaced: rail redundancy (Blocks vs Components both top-level); Theme bolted into Pages
(export-only); monolith files (LeftPanel 2110 / StylePanel 1592 lines) vs webstudio's small focused
files — a maintainability risk that blocks safe iteration.

## Refactor strategy: PATTERN-MATCH, not code-port (governing constraint)

User direction (2026-06-26): refactor the nova editor UI + "above-logic" to match webstudio (some UI
rework acceptable, e.g. the margin/padding adjuster) **without breaking any nova backend logic**.

**Decisive code finding (why literal port is impossible):** webstudio's editor UI is welded to its
backend. Every style control calls `setProperty(cssProperty)(StyleValue)` →
`serverSyncStore.createTransaction([$styleSources,$styles,…])` (`use-style-data.ts` L99-142) — a
**CSS-property model + nanostores + immerhin sync**. Porting the UI drags in that data model, which
would *replace* nova's Document + bounded-`classOverrides` backend. Off the table.

**The safe seam (why pattern-match IS low-risk):** both editors already decouple presentation from
data. Webstudio: `setProperty`/`createBatchUpdate`. Nova: **`extract`/`set`/`setExclusive`/`mutate`**
already passed into each section (`SpacingSection`, `LayoutSection`, …) → `setNodeProps` →
`useDocumentWrite` → Document. **The whole refactor lives ABOVE this seam.** New widgets may reach the
backend ONLY through the existing `set`/`extract`/`setNodeProps` path — never a new write path.

**Backend allowlist (🔒 must not touch):** `packages/schema`, `packages/editor` pure commands
(`setNodeProps`, `cmdMoveNode`, `cmdInsertElement`, `nodesToSchema`/`schemaToNodes`, `unifiedHistory`),
`packages/registry` (block+classOverrides contract), `packages/renderer` (export), `packages/ai`,
`packages/git`, `projectStore` (Document authority, `commitCanvasGesture`), `makeCraftComponent`,
`useDocumentWrite`/`setNodeProps`, I1–I10 + tests, and the `layoutModel`/`freePosition` parse/write
contract (rework UI that uses them, keep the functions).

**🔧 Free to rework:** everything in `apps/studio/src/components/editor/*` (panels, sections, overlays,
TopBar), the `StylePanel.utils`/`simpleModeUtils`/`styleSummary` extract-set helpers, and `uiStore`.

**Bounded value space stays.** Webstudio's CSS-property richness maps onto bounded Tailwind: scrub
snaps to the Tailwind scale (not free px); per-side = `pt-*/pr-*/…`; provenance reinterpreted as
breakpoint-variant + inheritance (nova has no style-sources/tokens). Webstudio's ephemeral live preview
maps onto the Phase-F transient-gesture path (`isTransientCanvasEdit`), committing on pointer-up — the
trickiest port. "Blocks" rework = promote primitives (Box/Text/Image/Link) as the core Add experience,
demote opinionated presets to optional compositions (insert still via `cmdInsertElement`).

## Three redesign principles

1. **One panel = one job** (fix over-consolidation).
2. **Webstudio = floor; Nova's Figma gizmos = ceiling.** Ship flow-DnD parity first; bring gizmos
   (free-position/snap/marquee/align/auto-arrange) back **last**, behind an explicit *Advanced Design
   mode* toggle. This resolves the canvas over-ambition.
3. **Keep the old spine.** Every edit stays Document-first; style stays bounded `classOverrides`. We
   borrow webstudio's UX/IA, **not** its raw-CSS/CSS-var/token model.

## Target layout

```
TOPBAR  ◆Nova [Design▾|Content|Preview]  [📱▭🖥 breakpoints]  ⌘K  Share  Publish  HideUI⌘\
RAIL│ ACTIVE PANEL(280) │        CANVAS (breakpoint-sized)        │ RIGHT(280)
 ▣  │ ▣ Add             │  flow DnD · hover/select outline ·       │ [Settings|Style] segmented
 ☰  │ ☰ Navigator       │  drop-indicator line                     │ style-source bar
 🖼 │ 🖼 Assets         │  (gizmo layer OFF by default)            │ breakpoint+state row
 📄 │ 📄 Pages          │                                          │ sections + provenance dots
FOOTER  sync · zoom · selected-path breadcrumb
```

## Left — icon rail, 4 one-job panels (replaces combined LeftPanel.tsx)

- **▣ Add (Components):** search · Layouts presets · Primitives · Sections. Click = insert into
  selection; drag = DnD. Hook: `registry` → `buildElement.ts` → `cmdInsertElement` (Document-first).
- **☰ Navigator (Layers, first-class — weakest gap vs webstudio):** Global Root at top · tree with
  double-click rename (`_novaName`) · DnD reorder + **horizontal depth-drag** · 👁 show/hide · **CSS
  Preview** at bottom (read-only resolved classes). Hook: Document `Element[]`; new = CSS-preview (pure
  resolve), Global Root (`project.theme`/`:root`, later phase), depth-drag (extend `dropTarget.ts`).
- **🖼 Assets (new):** upload · filter/sort · details (name/size/**uses**/replace/delete). Hook:
  assets by-reference; "uses" = reference count in Document.
- **📄 Pages:** new page · home · rename · SEO/social · **folders (new)** · DnD reorder. Hook: Document
  `pages[]` (SEO already ADR-013).

## Right — segmented Settings/Style + provenance + 2 style modes (edits RightPanel.tsx)

```
┌ Heading              ⧉ ↑↓ ⧉ 🗑 ┐
│ [ Settings | Style ]            │  ← segmented control (no hidden tabs)
│ STYLE                            │
│ ◐ Local   [+ Token (later)]      │  ← style-source bar
│ 📱 base | md | lg    :hover ▾    │  ← breakpoint + state, moved to top
│ ▸ Layout            • blue       │  ← provenance: blue=set here · orange=inherited/other breakpoint
│ ▸ Space             • orange     │     gray=default · red=overridden
│ ▸ Typography        • blue       │
│ [ Simple ⇄ Advanced ]            │  ← 2 modes (drop focus/default)
└─────────────────────────────────┘
```

- **Settings** = `PropsPanel` (content/semantics) + tag/id/class. **Style** = `StylePanel`
  (`classOverrides`). Clean "what it is" vs "how it looks".
- **Provenance label-colors** = cheap, high-clarity: a pure fn over `classOverrides` + variant prefix
  (`md:`/`hover:`) + parent classes → color. No schema change, no invariant touched.
- **4 modes → 2:** keep Simple (plain-language presets) + Advanced (all sections); drop
  `focus`/`default` (StylePanel.tsx PanelMode).

## Top bar + Modes (missing commercial layer)

- **Design** = full editor (today). **Content** = inline text/image edit + content-block insert only;
  hide Style panel + structural Add/Navigator → safe client flow. **Preview** = hide all chrome.
- **Hide UI** = uiStore flag (cheap). Hook: a `mode` flag in `uiStore` gating panels + canvas
  interactions. Does **not** touch the Document.

## Parity matrix — webstudio (working) → Nova hook → phase

| Webstudio feature | Nova | Hook (old model) | Phase |
|---|:--:|---|:--:|
| Components panel (grouped, click/DnD) | P | registry → cmdInsertElement | 0 |
| Navigator select/rename/DnD/hide | P | Document tree (exists) | 0 |
| Navigator CSS preview | G | pure resolve classOverrides | 1 |
| Navigator Global Root | G | project.theme / :root | 4 |
| Navigator depth-drag | P | extend dropTarget.ts | 1 |
| Assets panel (manage/replace/uses) | G | assets by-reference | 2 |
| Pages panel + folders | P | Document pages[] | 2 |
| Breakpoint-sized canvas | **P** | **EXISTS** (viewport→canvas); gap = unify viewport + style-breakpoint | 3 |
| DnD "drop anywhere, never error" | P | gesture adapter E1 → cmdMove/Insert | 1 |
| Inline text edit | H | E2 (makeCraftComponent) | — |
| Style 16 sections | P | classOverrides (~18 already) | 0 |
| Style provenance label-colors | G | pure fn (variant + parent) | 3 |
| Settings/Style panel (tabs) | **H** | already tabbed; gap = rename Props→Settings + mode-gate Style | 0 |
| Modes Design/Content/Preview | G | uiStore.mode flag | 5 |
| Hide UI | G | uiStore flag | 0 |
| Command palette ⌘K | H | — | — |
| Publish | H | make optional/local-first | 0 |

## Three conflicts with the old model → bridges (no invariant broken)

| Webstudio | Conflict | Bridge (keep Nova model) |
|---|---|---|
| Advanced = free raw CSS | ADR-018 bans raw CSS | Keep bounded; arbitrary-value escape `w-[37px]`, not a free CSS box |
| Style Sources / Tokens / CSS-vars | `theme` export-only (ADR-029) | "Token" = reusable `classOverrides` group (not CSS-var); later phase |
| Data variables / CMS / expression | no data layer | **Out of scope** (deferred pillar, decision 2) |

## Execution: Phase G ledger (audit-gated, v7.x, schema frozen 4.0)

Ratified 2026-06-26. The phasing below is the *design intent*; the **execution ledger** lives in
[ROADMAP.md](ROADMAP.md) "Phase G — Editor Parity": an **audit→version gate per subsystem** (G0–G12).
Each subsystem gets a parity micro-audit; **OK → ✅ (no version); not-OK → one Minor/Patch release**
(Major-by-risk only for Modes/DnD). **Gate 0 first** = browser-QA the "Keep" parts, which closes
Phase F (v7.0.x are 🟡). Versions are minted on a not-OK verdict, never pre-assigned.

## Phasing (local-first; Nova gizmos LAST)

- **Phase 0 — Declutter + split** (no new IA): collapse rail redundancy (Blocks vs Components; fold
  AI/Templates; move Theme out of Pages) · rename Props→Settings + mode-gate Style tab · Hide UI ·
  publish→optional · split LeftPanel/StylePanel monoliths into per-panel files. *Lowest risk; the rail
  and tabs already exist (C1/C2), so this is cleanup, not rebuild.*
- **Phase 1 — Navigator depth + DnD never-error, verified** (add css-preview + Global Root; flip 🟡→✅).
- **Phase 2 — Assets panel + Pages folders.**
- **Phase 3 — UNIFY viewport + style-breakpoint (C3) + provenance label-colors.**
- **Phase 4 — Global Root / token foundation.**
- **Phase 5 — Content/Preview modes** (unlock commercial flow).
- **Phase 6 (ceiling) — re-attach Nova's Figma gizmos** (free-position/snap/marquee/align/auto-arrange)
  under an *Advanced Design mode* — this is where Nova's extras "combine into the webstudio base."

Each phase is one verifiable slice — consistent with the "verified-depth over breadth" pivot
([[project-nova-strategic-pivot]]).
