# Nova Builder — Full Commercial Roadmap

> **Target:** Production-grade AI website builder with Webstudio feature parity + Nova's unique advantages (AI, auth, billing, team collaboration).
>
> **Legend:** ✅ Done · 🟡 Built / needs browser QA · 📋 Planned · ⚠️ Blocked
>
> **Bump→Model rule:** Patch→Haiku · Minor→Sonnet · Major→Opus
>
> **Audit source:** `reference/webstudio/apps/builder/app/builder/features/` (16 feature dirs, 50+ components) + `reference/webstudio/packages/` (34 packages) + commercial SaaS gap analysis.

---

## ⚠️ Reconciliation (2026-07-12, v19.2.3) — read this first

The Tier 1–10 tables below are **historical**. Phases 13–75 were implemented in clusters between v8.x and v18.x (see `doc/VERIFIED.md` entries v8.7.0 → v18.0.0 and `doc/CHANGELOG.md`); the per-phase versions in the tables (v13.0.0 … v75.0.0) were never used — actual versions follow strict semver from CLAUDE.md. The tables are kept for scope reference only. Status keys per tier:

| Tier | Actual state |
|------|--------------|
| 1 (P13–22) | ✅ shipped v8.7.0–v8.13.0 (+ FA-007 canvas layer v19.0–19.1) |
| 2 (P23–30) | ✅ shipped v8.14.0–v8.25.0 |
| 3 (P31–36) | ✅ shipped v8.25.0–v8.28.0, P35 symbols v17.0.0 |
| 4 (P37–43) | 🟠 shipped as stubs v8.33.0 (exporters lose breakpoints/states — see audit #6) |
| 5 (P44–50) | 🟠 shipped v8.38.1/v18.0.0 (binding = CRUD only, no expression eval — audit #4) |
| 6 (P51–57) | 🟠 shipped v8.38.1–v18.0.0 (presence yes; co-editing no) |
| 7–9 (P58–73) | ✅/🟠 shipped v8.43.0–v8.49.1, v17.x |
| 10 (P74–75) | ✅ shipped v17.0.0/v17.2.0 (legacy packages already removed — the "remove in Phase 75" note below is stale) |

**The canonical forward plan is now Tier P below**, derived from the full parity audit [`doc/WS-PARITY-AUDIT.md`](WS-PARITY-AUDIT.md) (Nova v19.2.2 vs webstudio `65d8a16`, 158 code-verified rows). Tier-per-chat rule applies: phases within Tier P are sized for one session each.

---

## Tier P — Webstudio Parity Migration (ACTIVE)

> Every gap row in `WS-PARITY-AUDIT.md` maps to exactly one phase here. Standing constraints for every phase: `/canvas` stays public (ADR-NB-003), AI credit gate (ADR-NB-005), ownership/entitlement guards (ADR-NB-015), all six local quality gates incl. `build:cf` before push (CLAUDE.md Step 4), new chrome uses semantic theme tokens (CSS variables / theme hook supporting Dark, Light, and Elder High-Contrast modes per OCP, DIP, and WCAG AAA) + i18n dict keys.
>
> **Session batching (2026-07-13, CLAUDE.md "Session batching & e2e scoping"):** consecutive Patch/Minor phases run as one session (gates once per batch, semver bump per phase); each Major phase is its own session. E2E: targeted specs only per phase; full suite at tier gates. Planned batches: **[M0+MV1+MV2]** → **M1** (Major) → **M2** (Major) → **[M3+M6+M7b]** (v22.2.1 ✅) → **M4** (Major) → **[MV3+M5+M7]** → **[M8+M8b]** → **M9** (Major) → **[M10+M13]** → **[M11]** → **M12** (Major).

| Phase | Name | Depends | Bump | Model | Why this order |
|-------|------|---------|------|-------|----------------|
| **M-S1** ✅ | **Shipped v20.0.0 (2026-07-13)** — `canvas/styles.ts`: 5 css-engine sheets (fonts/presets/user/state/helpers), @media per breakpoint, states, source-order cascade via mixins, Body-as-div preset re-target (ADR-NB-008), `selectedState` sync, rgb color-shape fix + legacy tolerance; guarded by `e2e/canvas-styles.spec.ts` | — | **Major** | Fable | Audit #1 (🔴🔴) RESOLVED; live-edit repaint still needs M1 (WSA-2) |
| **M0** ✅ | **Shipped v20.0.1 (2026-07-13)** — drift = 2 intentional patches + 1 EOL artifact; `packages/WS-UPSTREAM.md` pins `65d8a16` + re-sync procedure | — | Patch | Fable | hygiene before ports |
| **MV1** ✅ | **Shipped v20.1.0 (2026-07-13)** — V-1 (3-col tab grid), V-2 (wrapping pills), V-3 (closed by M-S1), V-4 (non-issue: scroll exists), V-6 (Next devIndicators off); uiTheme extended + shell files migrated; solid-audit **V1** palette check added | — | Minor | Fable | Audit #8 |
| **MV2** ✅ | **Shipped v20.2.0 (2026-07-13)** — `builder/controls/` (UnitInput/ColorControl/ToggleGroup/CollapsibleSection) adopted in style rows/sections/state pills; V-5 (label flips below), V-7 (single navigator label), V-8 (rail aria + contrast) | MV1 | Minor | Fable | |
| **MV3** | Theme token abstraction + elder-first accessibility (CSS variables / semantic theme hook supporting Dark, Light, and Elder High-Contrast modes) + resolve solid-audit V1 WARN backlog across ~45 builder/app files | MV2 | Minor | Sonnet | accessible elder-first theme layer; batched in **[MV3+M5+M7]** |
| **M1** ✅ | **Shipped v21.0.0 (2026-07-13)** — `lib/transactions.ts` updateData single write path (~25 modules converted; captureSnapshot deleted); transaction undo across all 10 atoms; `builder/commands.ts` registry drives shortcuts + ⌘K (i18n `commands` dict); guard `e2e/builder-canvas-sync.spec.ts` | M-S1 | **Major** | Fable | Audit #2 🔴🔴 + #5 RESOLVED |
| **M2** ✅ | **Shipped v22.0.0 (2026-07-13)** — `lib/saveQueue.ts` (popAll → POST patches), `/api/projects/[id]/patch` (server applyPatches + double version guard, 409), sync-status chip, migration **0020** (⚠️ apply to DB; degraded mode until then); guard `e2e/save-patch.spec.ts` (env-gated) | M1 | **Major** | Fable | Audit #7 RESOLVED (pending DB migration apply) |
| **M3** | Style-object-model + token targeting (fixes audit #3), token chips in Style tab, breakpoint minWidth/condition + delete-migration + cascade indicator | M1 | Minor | Sonnet | |
| **M4** | Data binding core — expression encode/eval on canvas, binding-popover, CodeMirror expression editor, variable scoping/usage tracking, meta-driven prop controls (fixes audit #4) | M1 | **Major** | Opus | |
| **M5** | Resources runtime (server-side loader) + Collection item scope + Slot + content-model/matcher guards on DnD/paste/AI-apply (fixes audit #9) | M4 | Minor | Sonnet | |
| **M6** | Lexical rich-text port (replaces `richText.ts`; fixes audit #10) | M1 | Minor | Sonnet | |
| **M7** | Copy-paste — system clipboard, plugin formats (instance JSON/HTML/markdown/Webflow), Tailwind parser | M5, M6 | Minor | Sonnet | |
| **M7b** | Canvas interaction completeness — shift-click multi on canvas, scroll-into-view, link interceptor | M1 | Patch | Haiku | |
| **M8** | Assets/fonts full — font metadata pipeline, image transform route, resumable upload, usage refcount | M0 | Minor | Sonnet | |
| **M8b** | Pages advanced — path params (url-pattern), redirects, basicAuth, custom meta, address bar | M2 | Minor | Sonnet | |
| **M9** | Publish pipeline — `project-build`+`template` codegen replaces exporter stubs (media queries/states/cascade/expressions in output; fixes audit #6); deploy targets; domains CNAME flow | M3, M4 | **Major** | Opus | |
| **M10** | Content mode, grid guides, CSS-preview navigator, safe-mode + blocking-alerts, animation schema | M1 | Minor | Sonnet | |
| **M11** | Protocol bundle import/export + marketplace | M9 | Minor | Sonnet | |
| **M12** | Realtime co-editing — transaction patches over Supabase Realtime + remote selection (extends ADR-NB-009; no Yjs) | M1+M2 | **Major** | Opus | |
| **M13** | Long tail — help center, clone project, share tokens, notifications, dashboard search | M2 | Patch | Haiku | |

Deliberately skipped (with reasons): see `WS-PARITY-AUDIT.md` §10 (prisma/trpc/postgrest/wsauth/entri/polly/remix-runtimes/Yjs).

---

## Phase summary

### Tier 0 — Foundation (DONE)

| Phase | Version | Name | Status |
|-------|---------|------|--------|
| 0–6 | v7.0.0 | Builder shell + WebstudioData + SyncClient + canvas | ✅ |
| 7 | v7.0.2 | 3-column grid layout + inspector panels | ✅ |
| 8 | v8.0.0 | Left sidebar v2 (Navigator, Pages, Components DnD) | 🟡 |
| 9 | v9.0.0 | AI panel wiring | 🟡 |
| 10 | v10.0.0 | Projects CRUD + writable StyleInspector + Preview | 🟡 |
| 11 | v11.0.0 | Canvas click-select + undo/redo + AddPropertyRow | 🟡 |
| 12 | v12.0.0 | Inline text editing (contentEditable + postMessage) | 🟡 |

---

### Tier 1 — Core Editing (Phases 13–22)

*Without these, the builder cannot produce real websites.*

| Phase | Version | Name | Bump | Model | Priority |
|-------|---------|------|------|-------|----------|
| **13** | v13.0.0 | Assets panel (R2 upload + grid + insert Image) | Minor | Sonnet | 🔴 |
| **14** | v14.0.0 | Edit operations (Ctrl+C/V/D + Delete key) | Minor | Sonnet | 🔴 |
| **15** | v15.0.0 | Resize handles on canvas (drag corners/edges) | Minor | Sonnet | 🔴 |
| **16** | v16.0.0 | CSS States (:hover/:focus/:active) + state-scoped writing | Minor | Sonnet | 🔴 |
| **17** | v17.0.0 | Breakpoint-scoped style editing (selector in inspector) | Minor | Sonnet | 🔴 |
| **18** | v18.0.0 | Multi-select (Shift+click, Ctrl+click, bulk ops) | Minor | Sonnet | 🟠 |
| **19** | v19.0.0 | Canvas zoom + viewport controls (25–200%, Fit, Ctrl+=/-) | Patch | Haiku | 🟠 |
| **20** | v20.0.0 | Navigator: cross-parent DnD + keyboard navigation | Minor | Sonnet | 🟠 |
| **21** | v21.0.0 | Command palette ⌘K (insert, find, navigate, convert) | Minor | Sonnet | 🟠 |
| **22** | v22.0.0 | Canvas right-click context menu (cut/copy/paste/delete/wrap) | Patch | Haiku | 🟡 |

---

### Tier 2 — Professional Style Controls (Phases 23–30)

*Makes the style panel comparable to Figma / Webflow.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **23** | v23.0.0 | Box shadows + text shadows (multi-shadow editor, offset/blur/spread/color) | Minor | Sonnet |
| **24** | v24.0.0 | CSS Transforms (rotate/scale/skew/translate, visual controls) | Minor | Sonnet |
| **25** | v25.0.0 | Transitions + CSS animations (duration/easing/delay, keyframe presets) | Minor | Sonnet |
| **26** | v26.0.0 | Filters + backdrop-filter (blur/brightness/contrast/saturate/hue-rotate) | Patch | Haiku |
| **27** | v27.0.0 | Background gradients (visual gradient builder, angle, color stops) | Minor | Sonnet |
| **28** | v28.0.0 | CSS Grid editor (grid-template-columns/rows visual builder, span/placement) | Minor | Sonnet |
| **29** | v29.0.0 | Custom breakpoints (add/edit/delete, canvas-settings popover) | Minor | Sonnet |
| **30** | v30.0.0 | Global styles + CSS custom properties (--vars editor, :root stylesheet) | Minor | Sonnet |

---

### Tier 3 — Content & Structure (Phases 31–36)

*Everything users need to build real multi-page sites.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **31** | v31.0.0 | Pages: SEO fields (title, description, OG image, robots) + path editing | Minor | Sonnet |
| **32** | v32.0.0 | Pages: folder organization + page templates | Minor | Sonnet |
| **33** | v33.0.0 | Style tokens / StyleSource sharing (reusable named style sets) | Minor | Sonnet |
| **34** | v34.0.0 | Rich text editor (Lexical: bold/italic/underline/link/lists inline) | Minor | Sonnet |
| **35** | v35.0.0 | Components / Symbols (ComponentMaster + instance overrides + ⌘G) | Major | Opus |
| **36** | v36.0.0 | Form builder (input/textarea/select/radio/checkbox/submit + validation) | Minor | Sonnet |

---

### Tier 4 — Publishing & Delivery (Phases 37–43)

*Users need to get their sites live.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **37** | v37.0.0 | Code export: WebstudioData → React + Tailwind (port project-build) | Major | Opus |
| **38** | v38.0.0 | Static HTML export (zero-framework ZIP download) | Minor | Sonnet |
| **39** | v39.0.0 | GitHub sync (push/pull WebstudioData, update packages/git) | Minor | Sonnet |
| **40** | v40.0.0 | Vercel one-click deploy (update packages/deploy for WS schema) | Minor | Sonnet |
| **41** | v41.0.0 | Custom domains (DNS CNAME validation + SSL provisioning) | Major | Opus |
| **42** | v42.0.0 | Image optimization (WebP conversion + responsive srcset generation) | Minor | Sonnet |
| **43** | v43.0.0 | Additional deploy targets: Netlify + Cloudflare Pages | Minor | Sonnet |

---

### Tier 5 — AI Differentiation (Phases 44–50)

*Nova's strategic moat over plain Webstudio.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **44** | v44.0.0 | Data binding: variables + resource API (DataSource / Resource atoms) | Major | Opus |
| **45** | v45.0.0 | Dynamic lists / loops (repeat component per array item, index vars) | Minor | Sonnet |
| **46** | v46.0.0 | JavaScript interactions (click → toggle class / animate / navigate) | Minor | Sonnet |
| **47** | v47.0.0 | AI content generation (fill placeholder copy, multi-variant generation) | Minor | Sonnet |
| **48** | v48.0.0 | AI accessibility checker (contrast ratios, missing alt text, ARIA hints) | Minor | Sonnet |
| **49** | v49.0.0 | AI performance advisor (Core Web Vitals, oversized images, layout shift) | Patch | Haiku |
| **50** | v50.0.0 | CMS data binding (Contentful, Airtable, Notion as live data sources) | Major | Opus |

---

### Tier 6 — Project Management & Collaboration (Phases 51–57)

*Everything a team needs to work together on projects.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **51** | v51.0.0 | Version history + 1-click rollback (snapshot list, labeled saves) | Minor | Sonnet |
| **52** | v52.0.0 | Comments + annotations (pin to element, thread replies, resolve) | Minor | Sonnet |
| **53** | v53.0.0 | Activity log (who changed what, per-project event stream) | Patch | Haiku |
| **54** | v54.0.0 | Team workspaces (create team, invite members, transfer projects) | Major | Opus |
| **55** | v55.0.0 | Role-based access control (owner / editor / viewer per project) | Minor | Sonnet |
| **56** | v56.0.0 | Real-time multiplayer (WS relay + replace singleplayer SyncClient) | Major | Opus |
| **57** | v57.0.0 | Collaborative cursors + presence indicators (live co-editing) | Minor | Sonnet |

---

### Tier 7 — Advanced Developer Features (Phases 58–62)

*Pro-tier power user and agency features.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **58** | v58.0.0 | Custom CSS editor (raw CSS panel, CodeMirror syntax highlighting + lint) | Minor | Sonnet |
| **59** | v59.0.0 | Component props editor (define inputs, types, defaults, JSDoc) | Minor | Sonnet |
| **60** | v60.0.0 | API keys + webhooks (CI/CD tokens, deploy triggers, Zapier integration) | Minor | Sonnet |
| **61** | v61.0.0 | Marketplace: community templates + publish your own + category browse | Minor | Sonnet |
| **62** | v62.0.0 | White-label (custom logo in builder, remove Nova branding from exports) | Minor | Sonnet |

---

### Tier 8 — Analytics, SEO & Growth (Phases 63–67)

*Site owners need to understand and grow their traffic.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **63** | v63.0.0 | Site analytics dashboard (page views, bounce rate, device split) | Minor | Sonnet |
| **64** | v64.0.0 | Form submissions hub (view + export lead captures per project) | Minor | Sonnet |
| **65** | v65.0.0 | SEO tools (auto sitemap.xml, robots.txt editor, schema.org markup) | Minor | Sonnet |
| **66** | v66.0.0 | Open Graph preview (real OG image editor, Twitter card preview) | Patch | Haiku |
| **67** | v67.0.0 | Cookie consent + GDPR banner builder (configurable, one-click add) | Patch | Haiku |

---

### Tier 9 — Account, Billing & Admin (Phases 68–73)

*The commercial SaaS layer — monetization and operations.*

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **68** | v68.0.0 | Subscription management UI (plan view, usage meter, upgrade/downgrade) | Minor | Sonnet |
| **69** | v69.0.0 | Per-seat team billing (seat management, invite gates, Stripe integration) | Major | Opus |
| **70** | v70.0.0 | Invoice + billing history (PDF download, tax ID, billing address) | Patch | Haiku |
| **71** | v71.0.0 | Notification preferences (email: invites / publishes / team activity) | Patch | Haiku |
| **72** | v72.0.0 | Admin console (user management, project audit log, billing override) | Minor | Sonnet |
| **73** | v73.0.0 | Feature flags UI (toggle features per user/org, gradual rollout) | Minor | Sonnet |

---

### Tier 10 — Polish & Legacy Cleanup (Phases 74–75)

| Phase | Version | Name | Bump | Model |
|-------|---------|------|------|-------|
| **74** | v74.0.0 | Keyboard shortcuts dialog + in-app help center (searchable docs) | Patch | Haiku |
| **75** | v75.0.0 | apps/studio sunset (remove legacy Craft.js app, dead packages, patches/) | Major | Opus |

---

### Tier 11 — Maintenance (Phases 77+)

| Phase | Name | Bump | Model |
|-------|------|------|-------|
| **77** | SOLID WARN remediation from FA-v1 audit: split `app/projects/page.tsx` (408 lines) and `canvas/canvas.tsx` (404 lines); fix unused `...inputProps` in `components/public/FormField.tsx` (I2) | Patch | Haiku |
| **R2** | ✅ Done (v18.8.0) — password reset (FA-005), missed-page readability (FA-006), legal VI (FA-I02), funnel VI (FA-I04), accept-language ordering (FA-I05), D10 locale precedence | Minor | Sonnet |
| **R3 pt.1** | ✅ Done (v19.0.0) — FA-007 canvas selection overlay + 8-handle resize (`SelectionOverlay.tsx`, `resizeMath.ts`, ADR-NB-018) | Major | Fable |
| **R3 pt.2** | ✅ Done (v19.1.0) — FA-007 drag-reparent (`dragReparent.ts`, shared `lib/treeMove.ts`). FA-007 feature-complete | Minor | Fable |
| **R4** | ✅ Done (v19.2.0) — plan-card i18n (`pricing.planCopy`), email verification (migration 0004, `/verify-email`), FA-007 QA automation + manual checklist. **FA-v1 code-complete** | Minor | Fable |
| **QA** | Human browser pass (`doc/qa-nova-builder.md` §R4) to flip remaining FA-007/i18n 🟡→✅. No code | — | — |

> Full findings + evidence: [`doc/FUNCTIONAL-AUDIT.md`](FUNCTIONAL-AUDIT.md).

---

## Detailed specs — Tier 1 (next 10 phases)

### Phase 13 — Assets panel (v13.0.0 · Minor · Sonnet)

**Why critical:** Cannot add any image to a page today.

**Supabase:** `supabase/migrations/0010_assets.sql`
```sql
CREATE TABLE IF NOT EXISTS assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  type text NOT NULL,          -- "image" | "svg" | "font"
  url text NOT NULL,           -- R2 public URL
  size integer, width integer, height integer,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON assets(project_id);
```

**API:** `app/api/assets/route.ts` — `POST` (multipart → R2 SDK → INSERT) · `GET ?projectId=`

**Panel:** `builder/left-sidebar/assets/index.tsx` (rewrite stub)
- Drag-to-upload zone + `<input type="file" accept="image/*,image/svg+xml">`
- Grid of thumbnail cards (image preview, svg rendered, font "Aa" card)
- Click → if Image instance selected: update `src` prop; otherwise insert new `Image` at selection root

**Env vars:** `R2_ACCOUNT_ID` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` `R2_BUCKET_NAME` `R2_PUBLIC_URL`

---

### Phase 14 — Edit operations (v14.0.0 · Minor · Sonnet)

**New:** `lib/commands.ts` — pure functions:
- `cloneSubtree(instanceId)` → deep-copy subtree with fresh `uid("inst_")` IDs
- `deleteInstance(instanceId)` → removes from `$instances` + removes from parent `children`
- `insertSubtree(parentId, subtree)` → merges into atoms

**Keyboard bindings** (add to `page.tsx` keydown):

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | `deleteInstance(selected)` |
| `Ctrl+D` | clone + insert after current |
| `Ctrl+C` | serialize subtree → `navigator.clipboard` |
| `Ctrl+V` | paste from clipboard as child of selection |
| `Ctrl+X` | cut (copy + delete) |

---

### Phase 15 — Resize handles (v15.0.0 · Minor · Sonnet)

**Canvas → builder:** canvas sends `{ type: "nova:elementRect", instanceId, rect }` on selection change. Builder stores in `$selectedInstanceRect` atom.

**Builder overlay:** 8 `<div>` handles rendered in absolute position over the canvas iframe using the rect data. Each has a `cursor-*` CSS cursor.

**Drag math:** mousedown → track delta → compute new `width`/`height` → `writeStyle()` → canvas re-renders live.

**Reference:** `reference/webstudio/apps/builder/app/builder/features/workspace/canvas-tools/outline/` — resize handle implementation.

---

### Phase 16 — CSS States (v16.0.0 · Minor · Sonnet)

**StyleInspector:** add state pill row above property sections:

```
[ Default ]  [ :hover ]  [ :focus ]  [ :active ]  [ :focus-visible ]
```

Active state drives `StyleDecl.state` on all writes. Property list filters to matching `state`.

**`writeStyle()` signature change:** `writeStyle(property, value, { state?: string, breakpointId?: string })`

**Reference:** `reference/webstudio/apps/builder/app/builder/features/style-panel/style-source-section.tsx`

---

### Phase 17 — Breakpoint-scoped style editing (v17.0.0 · Minor · Sonnet)

**StyleInspector:** breakpoint selector dropdown (reads `$breakpoints`) above property sections. Active breakpoint drives `StyleDecl.breakpointId`.

**Cascade indicator:** star (✦) badge next to values that cascade from a parent breakpoint; click to override locally.

**Property display:** only declarations for `(activeBpId, activeState)` shown as live. Other breakpoints' values grayed behind a "Inherited from Desktop" disclosure.

---

### Phase 18 — Multi-select (v18.0.0 · Minor · Sonnet)

**New atom:** `$selectedInstanceSelectors = atom<string[][]>([])`

**Canvas:** `Shift+click` → add to multi. Plain click → single selection. `Escape` → clear.

**Navigator:** `Shift+click` → range select rows. `Ctrl+click` → toggle.

**Bulk ops:**
- `Delete` → delete all selected
- `Ctrl+D` → duplicate all
- `Ctrl+G` → group into Box container

**Inspector:** shows "N items selected" label; StyleInspector shows mixed-value `—` placeholders.

---

### Phase 19 — Canvas zoom (v19.0.0 · Patch · Haiku)

**Topbar zoom pill** (right side): `25% / 50% / 75% / 100% / 150% / 200% / Fit`

**Atom:** `$canvasZoom = atom<number>(1)` in `lib/nano-states.ts`

**Builder:** canvas wrapper applies `transform: scale(${zoom})` with `transform-origin: top center`. Adjust container `minHeight = viewportHeight / zoom`.

**Keyboard:** `Ctrl+=` zoom in · `Ctrl+-` zoom out · `Ctrl+0` reset

**Reference:** `reference/webstudio/apps/builder/app/builder/features/workspace/` — scale + effective-height calculation.

---

### Phase 20 — Navigator: cross-parent DnD + keyboard nav (v20.0.0 · Minor · Sonnet)

**DnD:** remove same-parent constraint in `useDnd.ts`. Compute drop target parent + index across all visible rows. Visual: indent-level indicator lines showing new nesting depth.

**Keyboard navigation:**
- `↑/↓` → move focus between tree rows
- `Enter` → select focused row
- `Space` → expand/collapse
- `Alt+↑/↓` → reorder within parent
- `Alt+→` → indent (make child of previous sibling)
- `Alt+←` → outdent (promote to parent's parent)

---

### Phase 21 — Command palette (v21.0.0 · Minor · Sonnet)

**Trigger:** `⌘K` / `Ctrl+K` in builder. **New file:** `builder/CommandPalette.tsx`

**Commands:**
- **Insert component** — searches `$registeredComponentMetas` → insert at selection
- **Go to page** — searches `$pages` → `$selectedPageId.set(id)`
- **Find instance** — searches `$instances` by label → select + scroll to in navigator
- **Wrap in Box** / **Duplicate** / **Delete** / **Convert to…**
- **Undo** / **Redo**
- **Open AI** / **Preview** / **Publish**

**UX:** `type → filter → ↑/↓ → Enter`. Groups with keyboard shortcut hints. Escape closes.

**Reference:** `reference/webstudio/apps/builder/app/builder/features/command-panel/`

---

### Phase 22 — Canvas context menu (v22.0.0 · Patch · Haiku)

**Canvas:** sends `{ type: "nova:contextMenu", instanceId, clientX, clientY }` via postMessage on `contextmenu` event.

**Builder:** renders portal `<div>` at `(clientX, clientY)` relative to canvas bounds with menu items:
- Duplicate / Cut / Copy / Paste / Delete
- Wrap in Box / Select parent / Rename (focuses navigator inline edit)

**Dismiss:** click outside or Escape.

---

## Package work

### Port from `reference/webstudio/packages/`

| Package | Target | Phase | Purpose |
|---------|--------|-------|---------|
| `project-build` | `packages/project-build/` | 37 | WebstudioData → React + Tailwind codegen |
| `project-migrations` | `packages/project-migrations/` | 35 | Schema version forward-migration |
| `asset-uploader` | `packages/asset-uploader/` | 13 | R2 upload + metadata utilities |
| `domain` | `packages/domain/` | 41 | DNS CNAME validation helpers |
| `feature-flags` | `packages/feature-flags/` | 73 | Feature toggle system |

### Update existing Nova packages

| Package | Issue | Phase |
|---------|-------|-------|
| `packages/ai/` | Add content generation + a11y check features | 47–48 |
| `packages/deploy/` | Targets old `Element[]` — needs WebstudioData | 40 |
| `packages/git/` | Targets old `Element[]` JSON format | 39 |

### Legacy packages — ✅ already removed (v17.0.0 / v17.2.0, ADR-NB-011)

~~`packages/schema` · `packages/editor` · `packages/registry` · `packages/renderer`~~

---

## Infrastructure — database migrations

| Migration | Phase | Table / purpose |
|-----------|-------|-----------------|
| `0010_assets.sql` | 13 | Assets + R2 metadata |
| `0011_datasources.sql` | 44 | DataSource + Resource atoms persistence |
| `0012_version_history.sql` | 51 | Project snapshots (JSONB blobs with label + timestamp) |
| `0013_comments.sql` | 52 | Comments + threads per project + element pin |
| `0014_teams.sql` | 54 | Teams + memberships table |
| `0015_invitations.sql` | 54 | Pending team invite tokens |
| `0016_analytics.sql` | 63 | Lightweight page view events |
| `0017_form_submissions.sql` | 64 | Lead capture from live forms |
| `0018_marketplace.sql` | 61 | Community templates |

## Infrastructure — external services

| Service | Phase | Purpose |
|---------|-------|---------|
| Cloudflare R2 | 13 | Asset storage (already provisioned) |
| Cloudflare Worker (WS relay) | 56 | Multiplayer WebSocket server |
| Vercel API | 40 | One-click deploy trigger |
| Custom domain DNS provider | 41 | CNAME verification + SSL |
| Stripe | 69 | Per-seat subscription billing |
| Resend / SendGrid | 54 | Team invitation emails |
| PostHog / Plausible | 63 | Site analytics (privacy-friendly) |

---

## Full dependency graph

```
Phase 13 (Assets)
    │
Phase 14 (Edit ops: copy/paste/delete)
    │
Phase 15 (Resize handles)
    │
Phase 16 (CSS States) ──── Phase 17 (Breakpoint styling)
    │                              │
    └──────────────────────────────┘
                   │
           Phase 18 (Multi-select)
                   │
     ┌─────────────┼──────────────┐
     │             │              │
 Phase 19       Phase 20      Phase 21
 (Zoom)       (Nav DnD +     (⌘K palette)
               keyboard)
     │             │              │
     └─────────────┴──────────────┘
                   │
           Phase 22 (Context menu)
                   │
     ┌─────────────┼──────────────────────┐
     │             │                      │
Phase 23–28     Phase 29–30         Phase 31–32
(Style depth:   (Custom bps +       (Pages SEO +
 shadows/trans/  global styles)      folders)
 anim/gradients)
     │
Phase 33 (Style tokens)
     │
Phase 34 (Rich text — Lexical)
     │
Phase 35 (Components/Symbols) ← Schema 6.0 Major
     │
Phase 36 (Form builder)
     │
Phase 37 (Code export) ──── Phase 38 (Static HTML)
     │
Phase 39 (GitHub) ──── Phase 40 (Vercel) ──── Phase 41 (Custom domains)
     │
Phase 42–43 (Image opt + Netlify/CF)
     │
Phase 44 (Data binding) ← Schema 7.0 Major
     │
Phase 45 (Dynamic loops)
     │
Phase 46 (JS interactions)
     │
Phase 47–50 (AI: content / a11y / perf / CMS)
     │
Phase 51 (Version history)
     │
Phase 52 (Comments)
     │
Phase 53 (Activity log)
     │
Phase 54 (Team workspaces) ← Schema 8.0 Major
     │
Phase 55 (RBAC)
     │
Phase 56 (Multiplayer) ← WS relay deployed
     │
Phase 57 (Collaborative cursors)
     │
Phase 58–62 (Dev: raw CSS / props editor / API keys / marketplace / white-label)
     │
Phase 63–67 (Analytics / form leads / SEO / OG / GDPR)
     │
Phase 68–73 (Billing UI / team billing / admin / feature flags)
     │
Phase 74 (Shortcuts dialog + help center)
     │
Phase 75 (apps/studio sunset)
```

---

## Feature parity scorecard

> ⚠️ Superseded by the code-verified scorecard in [`doc/WS-PARITY-AUDIT.md`](WS-PARITY-AUDIT.md) §0.1 (158 rows, 2026-07-12). The table below is the original estimate, kept for history.

| Category | Webstudio ref features | Nova current | Gap (phases) |
|----------|----------------------|--------------|--------------|
| Canvas editing tools | 12 | 4 | 8 → P13–22 |
| Style panel controls | 18 property groups | 8 | 10 → P23–30 |
| Navigator / tree | 8 | 5 | 3 → P20–21 |
| Pages management | 6 | 3 | 3 → P31–32 |
| Assets management | 4 | 0 (stub) | 4 → P13 |
| Components / Symbols | 5 | 0 | 5 → P35 |
| Publishing / deploy | 8 | 2 (preview only) | 6 → P37–43 |
| Command palette | 7 command groups | 0 | 7 → P21 |
| Settings panels | 5 | 2 | 3 → P58–59 |
| **Nova AI features** | 0 (OSS) | 1 (compose) | +5 → P47–50 |
| **Commercial SaaS** | 0 (OSS) | 2 stubs | +28 → P51–73 |
| **Collaboration** | 0 (OSS) | 0 | +7 → P52–57 |
| **Analytics + SEO** | 0 (OSS) | 0 | +5 → P63–67 |

---

## Milestone checkpoints

| Milestone | Phases done | What it unlocks |
|-----------|------------|-----------------|
| **QA gate** | 8–12 browser QA | Flip 🟡 → ✅; required before starting Phase 13 |
| **MVP launch** | 13–22 | Real builder: images, copy/paste, resize, responsive, zoom |
| **Pro launch** | 23–40 | Full style controls + code export + GitHub + Vercel |
| **AI platform** | 41–50 | Data binding, dynamic content, AI content, CMS integrations |
| **Team launch** | 51–57 | Collaboration, multiplayer, version history, RBAC |
| **Enterprise** | 58–73 | Raw CSS, API keys, analytics, team billing, admin console |
| **Full sunset** | 74–75 | Help center + legacy cleanup |

---

## QA strategy

Every phase follows:
1. **Classify** bump → model
2. **Read** SPEC.md + COMPONENTS.md + ADR.md before coding
3. **Implement** + `pnpm --filter @nova/builder build` → 0 errors
4. **Close the loop:** CHANGELOG.md entry + VERIFIED.md 🟡 rows + SPEC.md update

🟡 → ✅ requires human browser QA using [`doc/qa-nova-builder.md`](qa-nova-builder.md).
