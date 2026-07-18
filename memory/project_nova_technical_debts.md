---
name: project-nova-technical-debts
description: Known technical debts, workarounds, and deferred architectural fixes as of v1.1
metadata:
  type: project
---

## v1.4 audit fixes (2026-06-15) — "style doesn't apply" root causes

Manual testing reported ~80–90% of Style-panel edits not showing on canvas or
applying inconsistently. Root causes found + fixed:

- **BLOCK AUTHORING INVARIANT (enforced):** every block MUST combine its base
  classes with `_novaClass` via `cn()` (`packages/registry/src/utils/cn.ts`,
  wraps `twMerge`) — NEVER raw string concatenation. Raw concat left conflicting
  utilities (base `gap-6` + override `gap-8`) both in the DOM; CSS source order
  decided the winner → unpredictable. All 14 blocks converted. Background only
  "worked" before because it was special-cased via inline-style suppression.
- **Avoid responsive `md:` variants in base classes for properties the Style
  panel controls** (padding, text size). A non-responsive override (`py-8`)
  loses to a `md:py-16` base at desktop even after twMerge. Simplified base
  padding/text on Section, HeroSection, Button. (Navbar/Footer still use
  `px-4 md:px-8` — minor, see TD-015.)
- **Section is now SINGLE-LAYER.** The old inner `<div class="mx-auto max-w-*">`
  meant `_novaClass` (and thus all layout overrides) landed on the outer
  `<section>` while children lived one level down — flex/grid/gap edits were
  no-ops. Now children are direct; `mx-auto`+max-width apply to the section
  itself. Trade-off: a width-constrained section centers its background too;
  full-bleed colour bands = compose outer full-width Section around inner one.
- **PropsPanel now handles `ZodUnion` of `ZodLiteral`** (renders a select,
  coerces numeric literals back to numbers). This is why Column/Stats/
  Testimonials column-count pickers were entirely absent (`descForType`
  returned null for ZodUnion). New blocks may use `z.enum` or this union form.
- **TextBlock** schema/type gained `h1` (migration creates hero-title h1 nodes).
- **StylePanel:** Typography gained a text-colour control; LayoutSection falls
  back to the element's COMPUTED display so base-class flex/grid blocks (Navbar,
  HeroSection, Column) show container controls; Flex/Grid-child sections now gate
  on the PARENT's computed display, not the selected node's own.

### TD-015: Navbar/Footer keep responsive base padding (`px-4 md:px-8`)
A non-responsive Style-panel px override loses at md+ on these two. Low priority
(horizontal padding on full-width nav/footer is rarely overridden). Simplify to a
single value if reported.

## v1.4 audit fixes — round 2 (2026-06-15): W1/W2/W3 interaction

Audited the interaction workstreams. Fixed + findings:

- **W1 multi-select (shift/ctrl-click) was BROKEN → FIXED.** Root cause: the
  Craft→store selection sync (`RightPanelWithSync` in the editor page) called
  `selectNode(id)` on every canvas selection change, and `selectNode` RESETS
  `selectedNodeIds` to `[id]`. Craft re-selects on every (modifier) mousedown, so
  the set was wiped on the very click meant to extend it. Fix: the sync is now the
  SINGLE selection writer — modifier-click → `addToSelection`, plain click →
  `selectNode`; modifier state read at pointerdown capture. Removed the competing
  `toggleSelection` writer in RenderNode. Canvas toggle-OFF isn't wired (use the
  toolbar ✕ to clear); `removeFromSelection` remains unused.
- **W2 Ungroup was UNREACHABLE → FIXED.** MultiSelectToolbar only renders at
  ≥2 selected, but its Ungroup needs exactly 1 Section → never showed. Added a
  reachable path: `ungroup` is now a registry command
  (`editorCommands.ungroup`, operates on selectedId) and appears in the canvas
  ContextMenu when the right-clicked node is a Section. Group still lives on the
  multi-select toolbar (needs 2+; now reachable since multi-select works).
- **WORKS (verified):** block insertion (click/drag/Layers all go through
  `buildBlockElement`) + `defaultChildren` → Navbar/PricingCard/HeroSection insert
  with their child nodes; Layers tree drag-reparent/reorder/rename/hide; AlignBar
  (now effective post-cn fix); inline text edit; onboarding; AI + Templates panels.
  PropsPanel covers every block prop type (only `z.union` props are the 3 fixed
  `columns`).

### TD-016: W1 marquee (drag-rectangle select) NOT IMPLEMENTED
The plan listed a marquee; no code exists. Multi-select is modifier-click only.

### TD-017: W3 element resize handles + "gated free-position" NOT IMPLEMENTED
Only LayoutOverlay GAP-drag bands ship (resize gaps between children). No
element width/height drag handles and no absolute free-positioning.

### TD-018: Canvas overlays mis-position at zoom ≠ 1
RenderNode toolbar, AlignBar, and LayoutOverlay use `position: fixed` children
portaled into `.nova-canvas-page`, which gets `transform: scale(zoom)` when
zoom≠1 — a transformed ancestor becomes the containing block for `fixed`, so
overlays offset. Correct at the default zoom=1.

## v1.4 audit fixes — round 3 (2026-06-15): persistence + publish

- **Layers rename was non-functional AND non-persistent → FIXED.** Old code wrote
  `setCustom(c.displayName)` but the UI read `node.data.displayName` (different
  field) and `nodesToSchema` never serializes Craft `custom`/`hidden`. So rename
  showed nothing and was wiped by any undo/redo/AI reload. Now stored in
  `props._novaName` (round-trips via the schema), read by Layers/canvas toolbar/
  breadcrumb, and stripped from published JSX (`propsToJSXString` drops `_nova*`).
- **TopBar zoom clamp mismatch → FIXED.** ZoomControl accepted 10–200% but
  `uiStore.setZoom` clamps [0.25, 1]; input now matches (25–100%).
- **TD-014 publish: duplicate-content bugs → FIXED (structural part).** Published
  HeroSection rendered title/subtitle props (pre-v1.4) AND children → duplicate
  text; Navbar rendered a brand `<a>` from props AND children → duplicate brand.
  Both now render children-only (v1.4 contract). Section source made single-layer;
  TextBlock source gained `h1`; Button base text non-responsive — all to match the
  live blocks. **TD-014 fully RESOLVED in Phase 1 / ADR-027 (2026-06-16):**
  `BLOCK_SOURCES` is no longer hand-maintained — `generateSources.mjs` generates
  `sources.ts` from the live registry blocks (which now take `classOverrides` +
  merge via `cn`), and a drift test fails CI if `sources.ts` is stale. The old
  string-concat `cx` is gone; published blocks use real `cn` (tailwind-merge) via
  the generated `_novaStyle.ts`. See TD-023 for the remaining dep-injection piece.
- **Still not persisted:** Layers "hide" (Craft `hidden`, not serialized) — minor
  view aid, only affects the editor session, doesn't affect publish.

### TD-023: publish route must ensure `tailwind-merge` in the exported repo — ✅ RESOLVED (v5.3.0)
**Was:** `generateAll` emitted block sources + `_novaStyle.ts` (which imports `tailwind-merge`) but no `package.json`, so the exported repo couldn't build.
**Resolution (v5.3.0):** `generateAll` now calls `generateScaffold` first, emitting `package.json` (with `tailwind-merge: "^3.6.0"` + next/react/tailwindcss/postcss/autoprefixer), `postcss.config.js`, and `app/globals.css`. The exported project is immediately `npm install && npm run build`-able. Logic unit-tested (20 tests in `scaffold.test.ts`). Actual deploy build = TD-024 (still runtime-gated).

### TD-024: exported-build parity — MITIGATED (v6.4.0)
**Narrowed by v5.3.0 (TD-023 resolved):** the exported repo now has a coherent scaffold (package.json with all deps, postcss.config.js, globals.css), so `npm install && npm run build` should work.
**MITIGATED (v6.4.0):** codegen regressions are now covered by golden snapshot tests (`generateAll.snapshot.test.ts` — all 16 registry block types + ComponentMaster + Instance). Any change to a block's generated source or to the page/layout codegen will fail the snapshot immediately. **What remains (manual QA):** running an actual `npm install && npm run build` on the exported output to confirm the Next.js build succeeds and the rendered page matches the editor preview. Gate before enabling Pro publish in production.

### TD-025: AI hints reference removed visual props (ADR-028 follow-up)
`*.ai.ts` for TextBlock/Section/Column still mention `fontSize`/`padding`/`gap`
etc. The blocks no longer accept them (1.5) — so if the AI sets those props they
no-op. Update the hints to steer styling through `classOverrides` (Tailwind
classes). Also the `*.settings.tsx` (TD-013, already dead) reference them. Low
urgency (AI still works for content/semantic props + classOverrides).

## v1.4 audit fixes — round 4 (2026-06-15): UI polish + design findings

Quick wins shipped:
- **Layers rename hotkey F2** added (was context-menu only).
- **Style panel "Clear all" button** in Raw/advanced section (removes every
  classOverride). Per-property reset already existed: selects clear via their
  placeholder, chips toggle off, and Raw shows per-class `×` chips.
- **Block-picker popover** (Layers add-above/below) now groups Primitives/Presets
  like the Blocks panel (W6) — previously a flat grid.

Design findings needing a DECISION (not yet actioned — breaking/larger):
- **TD-019: Theme tab — PARTIALLY ADDRESSED (Phase 3 / ADR-029):** now labeled
  "Export theme" (honest: tokens → exported tailwind.config; canvas not restyled).
  Full token binding into Style/props pickers is still deferred (future feature).
  Original finding below. `project.theme` is disconnected in the editor:
  colors/spacing tokens are consumed by NOTHING in the editor (no UI applies a
  theme token to a block; Style panel uses fixed Tailwind palette, props use hex).
  Only `generateTailwindConfig(theme)` writes them to the EXPORTED tailwind config,
  and even there custom color/spacing tokens are unused since blocks emit standard
  Tailwind classes (fonts.sans is the only one that plausibly applies via
  `font-sans`). → Either wire theme tokens into Style/props pickers, or mark the
  tab export-only. Currently it looks functional but does ~nothing.
- **TD-020: Three overlapping style systems → redundant props.** Theme tab vs
  Props-tab visual props vs Style panel. TextBlock (`fontSize/fontWeight/align/
  textColor`) and Section (`bgColor/paddingY/paddingX/maxWidth`) duplicate the
  Style panel almost entirely; with `cn()` the Style panel wins, so the Props
  versions are dead-ish/confusing. Recommend: Props = content + semantics only
  (TextBlock→content+tag, Section→none or a layout preset), Style panel = all
  visual. BIG change: schema migration (prop values → classOverrides), AI hints,
  publish sources, defaultChildren. Needs sign-off.
- **TD-021: Footer decompose — ✅ RESOLVED (Phase 3, v1.6).** Footer is now
  `isCanvas:true` with `canMoveIn:["Link","Button"]` + `defaultChildren`; the
  `links: string[]` prop was removed and migrated to child `Link` nodes by the
  `1.5→1.6` migration (tested). (Original finding below.) Footer was `isCanvas:false`
  and rendered links from a `links: string[]` prop → links aren't child nodes,
  (isCanvas, child Link/Button nodes, defaultChildren, migration). The other leaf
  presets (FeatureCard/FAQ/Stats/Testimonials) are pure content-display (no
  interactive sub-elements) — acceptable per the architecture rule.
- **TD-022: Row primitive — ✅ RESOLVED (Phase 3).** Added `Row` (flex-row
  container, `isCanvas:true`, default `gap-4`) at `packages/registry/src/blocks/Row/`,
  registered + emitted to publish. (Optional follow-up: small (r/c) index labels on
  nested children — not done.)
- **Minor:** draft not cleared after publish → "restore draft?" can reappear
  within 24h post-publish.

## Phase 4 — debt cleanup (2026-06-16, pre-QA)

Audited all open debts + bugs introduced by Phases 1–3. Resolved:
- **REGRESSION (Phase 2b) → FIXED:** `cmdGroupNodes` created the wrapper Section
  with the removed `paddingY` prop + a `displayName` prop (which no longer sets the
  layer label). Now uses `_novaName: "Group"` + `classOverrides: ["py-10","px-8"]`.
- **TD-013 → RESOLVED:** removed the `settings` field from `RegistryBlock` and
  deleted all 15 dead `*.settings.tsx` files (PropsPanel replaced them; no consumers
  — only stale comments). Smoke test's "has a settings component" assertion removed.
  **Consistency sweep (2026-06-16):** also updated the block scaffolder
  `packages/registry/scripts/generate-block.mjs` to stop emitting a `settings:`
  field + `*.settings.tsx`, and to generate the v2.0 contract (component takes
  `classOverrides` + merges via `cn`); fixed stale `_novaClass` wording in
  `cn.ts`/`novaStyle.ts` comments + docs (COMPONENTS/SPEC/ADR) and the 14→15 block count.
- **TD-015 → RESOLVED:** Navbar/Footer base padding `px-4 md:px-8` → `px-6`
  (non-responsive, so a Style-panel px override wins).
- **TD-025 → RESOLVED:** rewrote AI hints for TextBlock/Section/Column/Navbar/Footer
  — they referenced removed props (and Navbar/Footer hints were stale since
  v1.2.1/1.4, still describing `brandName`/`links[]`/`ctaLabel`). Now: styling via
  `classOverrides`; Navbar/Footer links are child Link nodes.
- **TD-005 → RESOLVED (earlier, v1.2):** publish flow uses the toast/confirm system,
  not `window.alert`.
- **TD-011 → RESOLVED (v1.2):** panel collapse (`rightPanelOpen`/`toggleRightPanel`,
  left rail collapse).
- **TD-012 → RESOLVED (v1.2):** canvas horizontal-scroll boundary (`min-w-max`).

Deferred to **Phase 5 (QA gate)** — need browser/deploy, not agent-fixable:
TD-018 (zoom-overlay offset), TD-023 (exported repo needs `tailwind-merge` — publish
route + deploy), TD-024 (exported-build parity), TD-007 (E2E suite).
**Out of v2.0 scope (future features, not debt):** TD-016 (marquee), TD-017 (element
resize handles / free-position).
**Pre-v1.4 infra debts (untouched, low priority):** TD-001/002 (Craft fork),
TD-003 (rate-limit Redis), TD-004 (lazy Supabase client), TD-006/008/009/010.

### Undo/selection (audit C6) — ✅ ADDRESSED in v5.0.0 (ADR-039, 2026-06-17)
**Was (ADR-009):** undo = rolling 20 full `Project` snapshots in Zustand; cloned the tree on every Craft change (memory bomb), polluted history with micro-steps, and undo remounted the whole Craft tree (lost selection/focus). Selection was dual-truth (uiStore vs Craft) → phantom deletes.
**Resolution:** hybrid unified timeline (`packages/editor/src/storage/unifiedHistory.ts`) — canvas edits are zero-payload markers replayed via Craft-native history (in-place, no remount); page/theme/AI are schema steps; one Ctrl+Z reverts the newest action regardless of source. Selection desync fixed (uiStore single-writer + clears mirrored to Craft + `resolveEffectiveSelection`). **ADR-009 superseded.** Pure reducers unit-tested (15); runtime undo/redo/selection is 🟡 (browser-QA batched post-v5).
**C5.2 / v5.1.0 — ✅ ADDRESSED (ADR-040, 2026-06-17):** Craft now mints `node_<8>` ids at node creation via a pinned **pnpm patch** of `@craftjs/core` createNode (`patches/@craftjs__core@0.2.12.patch`, registered in root `pnpm.patchedDependencies`) — chosen over vendoring `reference/craft.js` (lighter, version-pinned, fails loud on upgrade). `toNovaId()` slice-hack **removed** (closes **TD-001/002**); `nodesToSchema` passes ids through + a dev-only `assertNovaId` warn-guard. `craftIdMint.test.ts` is the CI guard that the patch stays applied. Minor bump (no schema/data change). Runtime create-flow is 🟡 (browser-QA post-v5).

### TD-026: Pro AI metering contradiction — ✅ RESOLVED in v4.1.0 (ADR-038, 2026-06-17)
**Was:** `tiers.ts` set Pro/Max/Team `aiCreditsPerMonth: null` → `hasUnlimitedAI` made `/api/ai` skip deduction (Pro = unlimited), contradicting `pricing-policy.md`/`0004` (Pro 4000 metered). Free 100 in code vs 200 in policy.
**Resolution:** the v4.1.0 hybrid credit model made **all tiers metered** — `tiers.ts` now has numeric `aiCreditsPerMonth` for every tier (Pro 4000, Free 200), `hasUnlimitedAI` returns false for all, `/api/ai` deducts for all via `decideCreditSource` + 2-bucket `deduct_credit` (`0006`). Logic unit-tested (`tiers.test.ts`). Runtime enforcement is 🟡 (needs Supabase apply + browser QA) — see `doc/VERIFIED.md` v4.1.0 section.

## Active debts (as of 2026-06-15, post-v1.4)

### TD-013: 14 `*.settings.tsx` files now unused (v1.4)
**Files:** `packages/registry/src/blocks/*/\*.settings.tsx` — all 14 per-block settings panels
**What:** PropsPanel (W5) replaced all of these with schema-driven rendering. The files still exist but are never imported.
**Fix:** Delete in a cleanup pass (safe — no imports).

### TD-014: `packages/renderer` BLOCK_SOURCES diverged from v1.4 live blocks (CONFIRMED, Pro publish broken)
**File:** `packages/renderer/src/blocks/sources.ts` (BLOCK_SOURCES + NOVA_STYLE_SOURCE)
**Confirmed state (2026-06-15 audit):**
- **`cx()` uses plain string concat, NOT twMerge** — published sites reintroduce the exact "two conflicting classes, CSS source-order decides" bug that was just fixed in the live blocks via `cn()`. Style overrides apply unreliably in EXPORTED sites. (Intentionally dependency-free, which is why it's not twMerge — fixing means adding `tailwind-merge` to the generated project's deps, a design decision.)
- **HeroSection source is PRE-v1.4**: still has `title`/`subtitle` props rendering hardcoded `<h1>{title}</h1>`/`<p>{subtitle}</p>` PLUS `{children}`. After the v1.4 migration the schema has NO title/subtitle props (they became child TextBlocks), so a published hero shows the DEFAULT "Welcome"/"Your subtitle here" headings AND the child TextBlocks → duplicate/garbage content.
- **All sources stale vs live v1.4**: no `cn()` merge, old Section double-layer (not single-layer), old responsive base padding, TextBlock tag enum missing `h1`.
**Impact:** Free tier (saves project.json only) unaffected. Pro tier publish → incorrect styling + duplicated hero content.
**Fix:** Regenerate all 14 BLOCK_SOURCES to mirror the live v1.4 blocks (published contract: accept `classOverrides`, merge via a twMerge-based `cx`), decide on the tailwind-merge dep for generated projects, and update `sources.test.ts`. Sizable, needs end-to-end verification of generated output.

### TD-001: Craft.js ID normalization workaround — ✅ RESOLVED (v5.1.0, ADR-040)
**Was:** `toNovaId()` sliced Craft's `nanoid(10)` → `node_<8>` on read; theoretical collision risk in large trees.
**Resolution:** pinned pnpm patch of `@craftjs/core` createNode mints `"node_"+getRandomId(8)` at creation; `toNovaId()` removed; `craftIdMint.test.ts` guards the patch.

### TD-002: No Craft.js fork — ✅ RESOLVED for the ID concern (v5.1.0, ADR-040)
**Was:** all Craft-awareness in the HOC + `CraftProvider`; the one thing needing deeper access was id generation.
**Resolution:** a minimal pinned **pnpm patch** (not a full vendored fork) overrides createNode's id minting. The HOC/wrap design (ADR-012) otherwise stands; `reference/craft.js` remains for study only.

### TD-003: Rate limit is in-memory per Edge instance — ✅ RESOLVED (v5.2.0)
**Was:** IP rate limit used a `Map` inline in `middleware.ts` — per-instance, doesn't accumulate across instances.
**Resolution (v5.2.0):** Extracted to `apps/studio/src/lib/rateLimit.ts` — pluggable `createDefaultLimiter` picks Upstash REST (INCR+EXPIRE NX pipeline, edge-safe, zero new deps) when `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN` are set; falls back to the per-instance `Map` otherwise. Pure `shouldBlock`/`advance` unit-tested. `middleware.ts` now `async`, wired to lazy singleton. Runtime Upstash path is 🟡 (needs real env + multi-instance load test at QA gate).

### TD-004: Supabase client created at module top-level — ✅ RESOLVED (v5.1.1)
**Was:** `createClient(...)` ran at import (with `"dummy"` fallbacks), so a missing env produced a broken client / could crash importing routes at module load.
**Resolution:** lazy `getSupabase()` + a `supabase` **Proxy** that initializes on first property access — importing the module never touches env, and a missing env throws a clear error at call time (clean 500). Call sites (`supabase.from(...)`) unchanged. Unit-tested (`supabase-server.test.ts`).

### TD-005: `window.alert` / `window.confirm` in publish flow
**File:** `apps/studio/src/app/editor/[projectId]/page.tsx` — `handlePublish`
**What:** Blocks the main thread, looks bad, can't be styled.
**Fix:** Replace with a toast notification system in v1.2.

### TD-006: RenderNode portal race — ✅ RESOLVED (v2.2.0 / ADR-032)
**Was:** `portalTarget = querySelector(".nova-canvas-page") ?? document.body` — race on first render.
**Resolution:** RenderNode now always portals to `document.body` (C2/ADR-032, the zoom-overlay fix) — `portalTarget = typeof document !== "undefined" ? document.body : null`. No querySelector race.

### TD-007: No E2E tests — ✅ HARNESS BUILT (v5.4.0, ADR-015)
**Was:** All canvas bugs found by manual QA. No automated coverage.
**Resolution (v5.4.0):** Playwright harness added to `apps/studio`: `playwright.config.ts` (chromium, storageState, retries:1), `e2e/fixtures.ts` (route mocks for project/user/AI APIs), `e2e/auth.setup.ts` (storageState auth), 4 critical-path specs (editor-load, add-block, undo-redo, credit-gate). `@playwright/test ^1.44.0` added to devDependencies; `"e2e": "playwright test"` script added; e2e files excluded from main tsconfig. **Green runs are ✅** — tested locally via `pnpm --filter @studio/app e2e` (or `cd apps/studio && pnpm e2e`).

### TD-008: `CanvasSync` reads store via `getState()` in `useEffect`
**File:** `apps/studio/src/app/editor/[projectId]/page.tsx`
**What:** Bypasses React's reactivity model. Correct (avoids stale closure) but unusual pattern.
**Impact:** Low. Zustand `getState()` is always synchronous.

### TD-009: `display:contents` + `firstElementChild` assumption
**File:** `packages/editor/src/craft-adapter/makeCraftComponent.tsx`
**What:** Connects Craft to `wrapper.firstElementChild`. If a block renders a fragment or conditional null, `firstElementChild` is null — block won't be connectable.
**Fix:** Document in block authoring guide (v1.2). All current 10 blocks render a single root element.

### TD-010: `NovaRootCanvas` cast needed — ✅ RESOLVED (v5.1.1)
**Was:** `NovaRootCanvas as UserComponent<Record<string, unknown>>` cast in `editorResolver`.
**Resolution:** typed `NovaRootCanvas` as `UserComponent<Record<string, unknown>>` (destructures `children` internally) → the cast is gone in `CraftProvider.tsx`.

### TD-008/009: accepted constraints (won't-fix)
**TD-008** (`CanvasSync` reads store via `getState()` in `useEffect`) and **TD-009** (`makeCraftComponent` connects `wrapper.firstElementChild`, so a block must render a single root element) are correct-by-design constraints, not bugs. Documented in the block-authoring guidance; no change planned.

### TD-011: Panel collapse not implemented
**What:** Left and right panels have no hide/show toggle. Blocks canvas on small screens.
**Fix:** v1.2 W5.

### TD-012: Canvas horizontal scroll boundary
**What:** Canvas scroll container centers content; left boundary anchored to viewport left, not panel right edge. Scrolling right moves content under the left panel.
**Fix:** v1.2 W5 — `padding-left` equal to panel width on scroll container.

### TD-028: AlignBar parent state mutation — ✅ RESOLVED (v5.5.0)
**Was:** `AlignBar` mutated the parent node's `justify`/`items` properties when a child was selected, violating the Cluster 2 single-writer rule.
**Resolution (v5.5.0):** Removed `useNodeClassOverrides(parentId)`, `setParentClass`, `setJustify`, `setItems`, and the JUSTIFY/ITEMS button groups from `AlignBarInner`. AlignBar now mutates **only** the selected node's `self-*` alignment class. Parent flex-direction shown as a read-only `flex→`/`flex↓` context label. Runtime is 🟡 (browser-QA post-v5).

### TD-029: LeftPanel HTML5 DnD & Unvirtualized Tree — ✅ RESOLVED (v5.5.0)
**Was:** `LeftPanel` used raw HTML5 `draggable` + rendered the full DOM tree unvirtualized (`<LayerItem>` recursion) — large projects caused scroll jank and DnD reliability issues.
**Resolution (v5.5.0):** Replaced with `@dnd-kit/core` (PointerSensor, distance:4 activation) + flat DFS traversal (`layersUtils.ts: flattenTree`) + virtual window (scroll+ResizeObserver, OVERSCAN=8, padding-trick). Drop position (before/inside/after) computed from `pointerYRef` vs `[data-layer]` bounding rect. The pure `flattenTree`/`ITEM_H` helpers are unit-tested (13 tests in `layersUtils.test.ts`). Runtime DnD is 🟡 (browser-QA post-v5).

### TD-030: StylePanel State Desync / UI Gaslighting — ✅ RESOLVED (v5.5.0)
**Was:** `SimpleModePanel` showed "no color/style selected" when Advanced-mode arbitrary classes (e.g., `bg-[#123123]`) were active — user couldn't tell their styles were still applied.
**Resolution (v5.5.0):** `simpleModeUtils.ts` (pure module) exports `SIMPLE_KNOWN_CLASSES` (union of all Simple-mode presets) and `simpleModeOverflow(overrides)` → `"none" | "mixed" | "custom"`. `SimpleModePanel` renders an amber badge ("Custom" or "Mixed") with an explanatory line when overflow ≠ "none". Logic unit-tested (17 tests in `simpleModeUtils.test.ts`). Runtime badge is 🟡 (browser-QA post-v5).
