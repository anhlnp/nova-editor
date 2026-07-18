# Nova — The Document Model (NDM)

> **Why this doc exists.** The 40 ADRs are *point decisions*; this is the **umbrella** that gives them
> conceptual integrity — one mental model for the whole product. It names the representations, declares
> who is authoritative, states the **invariants** that bind every transformation, defines the
> **design-mode** quality bar, and the **operational methodology** for keeping quality. **Read this
> first;** the ADRs explain individual choices, this explains how they cohere.
>
> Seeded v5.6.0 (Phase A of the Design-Mode plan). Each invariant is named in
> `packages/editor/src/model/invariants.ts`; "enforced by" tracks the move from *prose-only* convention
> to *checked-in-code* (the v5.6→ program).

## Document hierarchy — where this sits

```
MODEL.md  (this) ── the mental model: representations, authority, invariants, design-mode bar, methodology
  ├── ADR.md         ── why each structural decision was made (cite the invariant they serve)
  ├── SPEC.md        ── what Nova does right now (behavior; "working" only after VERIFIED)
  ├── COMPONENTS.md  ── what each package/component contains
  ├── VERIFIED.md    ── what is confirmed working (✅) vs needs QA (🟡) vs broken (🔴)
  └── ROADMAP.md     ── release ledger (bump + model per version)
```

A decision is recorded as an **ADR**; the principle it upholds is an **invariant here**. New ADRs must
cite which invariant(s) they touch. When a bug has no matching invariant, the model is incomplete — add
one (see Part III).

---

# Part I — The Document Model

## I.1 Representations & authority (single source of truth)

| Representation | What it is | Authority | Lives in |
|---|---|---|---|
| **The Document** | `Project` (pages → `Element` tree). The serializable "scene file." | **Authoritative**, versioned, migratable (ADR-001) | `projectStore.project`; persisted: IndexedDB draft + git `project.json` |
| **Components/Symbols** *(Phase D)* | reusable master subtrees; `Element`s become **instances** referencing a master + an override delta | part of the Document; masters authoritative, instances derive | schema 4.0 (v6.0.0): `ComponentMaster` + `components[]` on Project; overrides are a **sparse per-prop delta keyed by stable element id** (never path) |
| **Assets** | images/media, referenced by URL/id, never embedded | authoritative, by-reference | R2 / `src` props |
| **The Live Tree** | Craft `SerializedNodes` in memory | **projection** of the Document; never read as truth except via reconciliation | `@craftjs/core` editor |
| **The View** | rendered DOM + selection/overlay chrome | projection of the Live Tree | canvas DOM, portaled overlays |
| **Selection** | `selectedNodeId` / `selectedNodeIds` | **UI state — not part of the Document**; single-writer | `uiStore` |
| **History** | one interleaved timeline (canvas markers + schema steps) | derived control state | `unifiedHistory`, `projectStore` |
| **Export** | generated Next.js + Tailwind code | **pure, faithful** transform of the Document (one-way, ADR-002) | `packages/renderer` |

## I.2 The data hierarchy (the Document, explicit)

```
Project { schemaVersion, meta{ name, createdAt, updatedAt }, pages[], theme? }
  Page    { id: page_<6>, name, route, elements: Element[], seo? }
    Element { id: node_<8>, type, props: Record<serializable>, children: Element[] }
```

- `props` is JSON-serializable (ADR-010), arbitrarily nested since schema 2.0 (ADR-035). Visual styling
  lives in `props.classOverrides: string[]` — a **bounded** Tailwind vocabulary, never raw CSS
  (ADR-018/022). Editor-only metadata uses `_nova*` keys (ADR-026), stripped on publish.
- IDs are minted **conforming at creation** — `node_<8>` / `page_<6>` (ADR-005/040). The schema id ==
  the live Craft id; no read-time normalization.
- All state derives from the Document; migrations run on load (`migrateToLatest`).

## I.3 The two legal edit directions

> **Phase F note (ADR-042, v7.0.2 — logic complete, runtime 🟡):** Nova now has **one** authority —
> the Document. Every **discrete** edit is Document-first (props/style/align/gap, move/delete/rename/
> resize/nudge, block-insert). The two **inherently gesture-based** interactions — native drag-drop
> (E1) and inline-text commit (E2) — flow through a single narrow **gesture adapter**
> (`projectStore.commitCanvasGesture`, renamed from `updateElements`) reached only by `onNodesChange`;
> it reconciles into the Document with a zero-payload marker (no re-deserialize/memory bomb). There is
> **no generic two-way sync**; the `CRAFT_READONLY` scaffolding flag was retired. Direction 1 below now
> exists ONLY as that bounded E1/E2 adapter. Flips to ✅ after browser QA.

Every mutation flows through exactly one of these. Anything else is a bug.

1. **Gesture adapter** (ADR-042 E1/E2 — the ONLY Craft→Document path): native drag-drop + inline-text
   commit go Craft `onNodesChange` → `nodesToSchema` → `projectStore.commitCanvasGesture` (renamed from
   `updateElements`), reconciling into the Document. **Does not** bump `canvasSyncToken`
   (render-loop-safe); pushes one zero-payload canvas history marker. Discrete edits never reach here
   (they're Document-first); drag previews are suppressed mid-drag (`isTransientCanvasEdit`) and commit
   on pointer-up.
2. **Document edit** (AI patch / pure command / page / theme / component-propagation / **and, Phase F,
   every user gesture**): mutate the Document (`useDocumentWrite` + a pure command like `setNodeProps`)
   → `applySchemaToCanvas` (`history.ignore().deserialize`) pushes it to the Live Tree, guarded by
   `isApplyingExternalPatch`; pushes a schema history step (before/after).

## I.4 Invariant catalog (I1–I10)

The contracts that bind the representations. **Today most are prose-only conventions** — the program is
to make each *checked in code*. Symbolic ids live in `packages/editor/src/model/invariants.ts`.

| # | Invariant | Enforced by (target) | Status |
|---|---|---|---|
| **I1** | **Round-trip fidelity:** `nodesToSchema(schemaToNodes(doc)) ≡ doc` (modulo intentionally-dropped Craft-only fields: `parent`/`custom`/`displayName`/`hidden`) | property test `roundTrip.property.test.ts` (seeded, replayable) | ✅ v5.8.0 |
| **I2** | **Single source of truth:** the Document is authoritative; no code path persists Live-Tree-only state | `useDocumentWrite`/`setNodeProps` + command-layer gates (`cmdMoveNode`/`cmdDropRelative`/`cmdInsertBlock`) for all DISCRETE edits; ONE narrow E1/E2 gesture adapter (`commitCanvasGesture`) for native DnD + inline text (ADR-042); grep audit (zero production `actions.move`/`delete`/`addNodeTree`) | 🟡 v7.0.2 (Phase F **logic complete** — discrete edits Document-first, gestures via documented adapter; end-to-end behavior pending browser QA → then ✅) |
| **I3** | **Single-writer selection:** `uiStore` is the only selection writer; Craft→uiStore on real selects, uiStore→Craft on **clears only** | `shouldClearCraftSelection` pure fn + tests | ✅ v5.8.0 (runtime 🟡) |
| **I4** | **History lockstep:** every committed Live-Tree change ↔ exactly one canvas marker; every Craft `history.undo/redo` is wrapped by the `replaying` guard | `withReplay` coordinator + test; store/coordinator consistency dev-guard | ✅ v5.8.0 (runtime 🟡) |
| **I5** | **Render-loop safety:** external patches set `isApplyingExternalPatch`; canvas edits never bump `canvasSyncToken` | dev guard in `updateElements` (no token bump; replay-flag sync) | ✅ v5.8.0 (runtime 🟡) |
| **I6** | **AI patch validity:** every patch targets an existing document-authoritative id (Component projection nodes rejected); `classOverrides` ops **merge**, never silently replace | `normalizePatch.ts` + `validator.ts`; API route 422 gate | ✅ v6.3.0 (logic; UI retry 🟡) |
| **I7** | **UI layering:** product chrome (panels, toolbars) is **always above** the canvas and its portaled overlays | named z-layer token scale (`src/lib/zLayers.ts`) + `zLayers.test.ts` guard | ✅ v5.7.0 (runtime 🟡) |
| **I8** | **Export parity:** exported code renders identically to the canvas projection of the same Document | `generateAll.snapshot.test.ts` — minimal + full-block snapshots; Instance parity `toEqual`; I1/I10 regression guard in `instanceRoundTrip.test.ts` | ✅ v6.4.0 (logic; deployed-build QA 🟡) |
| **I9** | **Interaction performance budget:** drag / overlay-reposition stay within a frame budget (target ~60fps) on large trees | `perf.ts` marker + budgets + `summarize`/`withinBudget` tests; `doc/perf-baseline.md` | 🟡 v5.8.0 (numbers @ QA) |
| **I10** | **Component-instance integrity:** an instance always resolves to master + a valid override delta; master edits propagate except where overridden | resolver + round-trip + propagation tests | n/a → Phase D |

---

# Part II — Design-Mode Principles

The structured-editor experience must reach the bar of **Figma** (auto-layout, snapping), **Unity**
(scene/prefab, gizmos), and **v0** (per-position DnD, auto-arrange, low-friction tweak). Nova's peer is
the structured editor, **not** v0's generation-first model — we keep build-from-scratch DnD (which v0
lacks) and make the *document* Unity-grade.

## II.1 North-star benchmark

**H**ave / **P**artial / **G**ap → phase. (See ROADMAP for version detail.)

| Design-mode capability | Figma | Unity | v0 | Nova | → |
|---|:--:|:--:|:--:|:--:|---|
| Auto-layout: Hug/Fill/Fixed + gap/pad/align (the core paradigm) | ✦ | | | **P** | C — sizing ✅ v5.9.0 (logic) |
| Live on-canvas resize w/ W·H readout; gated free-position (TD-017) | ✦ | ✦ | ✦ | **P** | C — resize+W·H ✅ v5.10.0, gated free-position ✅ v5.17.0 (logic) |
| Snapping + smart guides + equal-spacing badges; Alt-to-measure | ✦ | ✦ | | **P** | C — snapping/guides/measure ✅ v5.11.0 (logic); resize-wired |
| Per-position DnD (drop at any index) + crisp indicator | | | ✦ | **P** | C — geometry+indicator ✅ v5.14.0 (logic); Craft drop-index align later |
| Auto-arrange on drop ("Tidy layout") | | | ✦ | **P** | C — Tidy engine ✅ v5.18.0 (logic, ⌘K action); drop-trigger later |
| Marquee select (TD-016); align/distribute; arrow-nudge | ✦ | ✦ | | **P** | C — arrow-nudge ✅ v5.10.0, marquee ✅ v5.12.0, align/distribute ✅ v5.16.0 (logic; apply gated to free-position) |
| Group / Ungroup (first-class primitive) | ✦ | ✦ | | **P** | C — ops ✅ v5.19.0 (document-order children, sibling-only, group-of-1 no-op; ⌘G/⌘⇧G + ⌘K) |
| Dense numeric inspector (size/layout/spacing/fill/type) | ✦ | ✦ | ✦ | **P** | C — clarity+section-reset ✅ v5.15.0; **direct numeric editing ✅ v5.21.0** (logic) — `numericField.ts` (parse/format/commit/step/scrub, precision-normalized) + `NumericInput` (type/Enter/blur/Esc-cancel/arrows/drag-scrub); multi-select numeric later |
| Command palette (⌘K) + full keyboard model | ✦ | | ✦ | **P** | C — palette+registry ✅ v5.13.0; +⌘G/⌘⇧G v5.19.0; **keymap as single source of truth ✅ v5.20.0** (logic) — `keymap.ts`, derived labels, conflict/reserved/integrity guards, "?" help overlay |
| 60fps (measured budget) | ✦ | ✦ | ✦ | **P** | B (I9) |
| Chrome always above canvas | ✦ | ✦ | ✦ | **H** | B (I7) ✅ v5.7.0 |
| Lossless round-trip / unified undo of everything | ✦ | ✦ | | **P** | B (I1/I4) ✅ logic v5.8.0 |
| Reflective schema-driven inspector | | ✦ | | **H** | keep |
| Components/Symbols: master→instance→override→propagate | ✦ | ✦ | | **P** | **D — model ✅ v6.0.0 + renderer/export ✅ v6.1.0 + canvas/instantiate UI 🟡 v6.1.1 + override editing 🟡 v6.2.0** (`cmdSetInstanceOverride`/`cmdClearInstanceOverride` + inspector rows; equality no-op; I10 propagation guard; classOverrides replacement; 11 tests ✅) |
| Great AI editing · export parity | | | ✦ | **P** | E |
| Real-time multiplayer | ✦ | | | **G** | Forward |

## II.2 The layout paradigm — constraint auto-layout (Hug / Fill / Fixed)

The defining mental model of modern design tools. Adopt it as Nova's: **every container declares
direction + gap + padding + alignment; every child sizes as Hug, Fill, or Fixed.** This maps onto the
existing bounded Tailwind vocabulary — **no schema change** — surfaced as first-class controls (not raw
classes):

| Intent | Meaning | Tailwind (`classOverrides`) |
|---|---|---|
| **Hug** | size to content | `w-fit` / `h-fit` (or `w-auto`) |
| **Fill** | stretch to fill the parent track | main axis `flex-1`; cross axis / no-flex `w-full` / `h-full` |
| **Fixed** | explicit dimension | `w-[Npx]` / `h-[Npx]` |
| Container | direction · gap · padding · align | `flex`/`grid` · `gap-*` · `p*-*` · `items-*`/`justify-*` |

**Implemented (v5.9.0):** `apps/studio/src/components/editor/layoutModel.ts` is the canonical, pure,
context-aware translation layer (`parse`/`write`, round-trip-guaranteed) for the Hug/Fill/Fixed sizing
intent; StylePanel renders the Width/Height control via it. "Fill" is context-aware (main axis →
`flex-1`, cross axis / no-flex → `w-full`/`h-full`); cross-axis alignment (`self-*`) stays with AlignBar,
so sizing and alignment remain orthogonal. Future auto-layout features (min/max, wrap, distribute,
constraints) extend this one module.

**Position vocabulary (v5.17.0, emerging `positionModel`):** every node is **flow** (default) or
**free** — `freePosition.ts` (absolute + bounded `left-[]`/`top-[]`, parent made `relative`; round-trip
`parse(write(pos)) === pos`). Free-position is the **legal application target** for the geometry engines
(`resizeMath` / `alignDistribute` / `snapGuides.computeSnap`): they compute deltas for any selection, but
those deltas can only be *applied* to free-positioned elements — flow elements gate the op off (no
approximation). `layoutModel` (flow sizing) + `freePosition` (free placement) are converging toward one
position model.

## II.3 Principles (the felt experience)

- **Direct manipulation first.** Anything visible is editable on-canvas (resize, drag, inline text);
  the inspector mirrors it numerically. Fewest clicks (user UX rule).
- **Instant feedback.** Interactions hold the I9 frame budget; no jank on large trees.
- **The product layer owns the top.** Chrome is always above the canvas and its overlays (I7).
- **Predictable spatial editing.** Snapping, smart guides, equal-spacing, align/distribute — geometry
  the user can trust.
- **The tree is the truth, not render-time math.** Layout comes from the Document structure, never from
  slicing children at render time (ADR-037 lesson).

---

# Part III — Operational Methodology

## III.1 Bug triage by invariant

1. **Reproduce**, capture exact output (the user provides terminal/console as ground truth).
2. **Classify:** *which invariant did this violate?* The fix targets the **enforcement** (a guard or a
   test that makes the violation impossible/loud), not just the symptom.
3. **No matching invariant?** The model is incomplete — add an invariant here (+ its id in
   `invariants.ts`), then fix.
4. **Each boundary owns a conformance suite** (round-trip property tests, invariant assertions) — not
   just isolated unit tests.

## III.2 Invariant ↔ ADR mapping

The ADR(s) that establish each invariant. *(Correction: the render-loop guard is **ADR-002/039**, not
ADR-004 — ADR-004 is the dead "Fork Craft.js" decision, superseded by ADR-012/040.)*

| Invariant | Governing ADR(s) |
|---|---|
| I1 round-trip | ADR-001 (single source), ADR-005/040 (ids pass through), ADR-030 C5.1 (lossless unknown block) |
| I2 single source | ADR-001, ADR-002 |
| I3 single-writer selection | ADR-039 (selection desync fix), ADR-017 (Craft `onRender` chrome) |
| I4 history lockstep | ADR-039 (hybrid unified undo + replay guard) |
| I5 render-loop safety | ADR-002 (one-way data flow), ADR-039 (`replaying`) |
| I6 AI patch validity | ADR-034 (semantic targetId patch), ADR-006 (credit only after valid schema), ADR-010 (JSON props) |
| I7 UI layering | ADR-041 (z-layer token scale), ADR-032 (overlays portal to `document.body` → cross-stacking-context) |
| I8 export parity | ADR-002 (Schema→Code), ADR-027 (publish emits live blocks), ADR-001 |
| I9 perf budget | ADR-033 (inspector debounce/auto-scroll), ADR-017 (overlay rendering) |
| I10 component integrity | ADR-014 (Template), ADR-019 (id re-mint), ADR-005 (ids); future component ADR |

## III.3 Discipline

- **MODEL is the umbrella.** New ADRs cite the invariant(s) they serve; new invariants get an id in
  `invariants.ts` and a row in I.4.
- **Verified-gate holds:** interactive enforcement stays 🟡 in VERIFIED until browser QA; pure-logic
  guards/tests are ✅ on green.
- **Supersede, don't delete.** Mark superseded invariants/ADRs with a pointer; never reuse an id.
