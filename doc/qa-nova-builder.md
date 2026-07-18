# Nova Builder — Manual QA Checklist

> Click-through audit for `apps/nova-builder/` (v8.0.0 → current).
>
> **NOT for `apps/studio/` (legacy Craft.js editor)** — that checklist is in
> [`doc/archive/qa-checklist-legacy-studio.md`](archive/qa-checklist-legacy-studio.md).
>
> **How to give feedback:** Write the ID and what happened.
> ```
> B1: ok
> B3.2: click shows menu but Delete crashes the page — console: TypeError: Cannot read ...
> U2.1: undo reverts but canvas flickers white for 1s
> ```
> All-✅ subsystem → flip VERIFIED.md row to ✅ with today's date, no version bump.
> Any ⚠️/❌ → one fix release, re-test that subsystem.

---

## Before you start (2 minutes)

- [ ] `pnpm --filter @nova/builder dev` in the repo root, open `http://localhost:3000`
- [ ] Log in; open (or create) a project — you should be at `/builder/[projectId]`
- [ ] Open the browser **console** and leave it open — mark **❌** on any red error
- [ ] Hard-refresh the builder page (`Ctrl+Shift+R`) before starting

---

# PART 1 — Auth + Projects (B series)

### B1 — Login / signup flow
**Target:** email+password auth; unauthenticated routes redirect to login.
- [ ] **B1.1** Open `http://localhost:3000` without being logged in → redirects to `/login`
- [ ] **B1.2** Log in with email + password → lands on `/projects`
- [ ] **B1.3** Invalid password → shows error message, does not crash

### B2 — Projects dashboard
**Target:** real project list from Supabase; create/delete; empty state.
- [ ] **B2.1** Projects page loads and shows real project cards (not a stub/placeholder)
- [ ] **B2.2** Empty state shown when no projects exist: "No projects yet."
- [ ] **B2.3** Time-ago timestamps on each card are readable (e.g. "2 hours ago")

### B3 — Create project
**Target:** "New Project" → modal → name → creates in Supabase → opens builder.
- [ ] **B3.1** Click "+ New Project" → modal appears with name input
- [ ] **B3.2** Type a name + press Enter (or click Create) → navigates to `/builder/[newId]`
- [ ] **B3.3** Press Escape in the modal → modal closes without creating anything
- [ ] **B3.4** New project is visible in the projects list on return

### B4 — Delete project
**Target:** delete button → inline confirm → row removed; list refreshes without reload.
- [ ] **B4.1** Click × on a project card → confirm appears
- [ ] **B4.2** Confirm → project removed from list; no page reload
- [ ] **B4.3** Cancel → project remains

---

# PART 2 — Canvas rendering (C series)

### C1 — Canvas loads
**Target:** canvas iframe renders the project's WebstudioData; no blank/white/error state.
- [ ] **C1.1** Open a project → canvas (center column) shows rendered content, not a blank frame
- [ ] **C1.2** No red console errors on load
- [ ] **C1.3** Re-open the same project → same content renders (data round-trips through Supabase)

### C2 — Canvas click-to-select
**Target:** clicking an element selects it; right panel shows its styles; solid purple outline.
- [ ] **C2.1** Click any element in the canvas → it gets a **solid purple 2px outline**
- [ ] **C2.2** Right panel (Style Inspector) updates to show the selected element's styles
- [ ] **C2.3** Navigator highlights the selected element in the tree
- [ ] **C2.4** Click on empty canvas background → selection cleared (or keeps last selection — either is ok, but should not crash)

### C3 — Hover outline
**Target:** hovering over an unselected element shows a dashed purple outline.
- [ ] **C3.1** Hover over an element → **dashed purple 1px outline** appears
- [ ] **C3.2** Selected element does NOT show hover outline on top of the selection outline
- [ ] **C3.3** Moving mouse away removes the hover outline

### C4 — Breakpoint canvas resize
**Target:** selecting a non-default breakpoint narrows the canvas iframe with a smooth transition.
- [ ] **C4.1** Select a breakpoint ≤ 768 px (e.g. Tablet/Mobile) in the Topbar pills → canvas iframe narrows, gray background visible on both sides
- [ ] **C4.2** Transition is smooth (`0.2s ease`), not instant jump
- [ ] **C4.3** Select "Base/Desktop" → canvas returns to full width
- [ ] **C4.4** ⚠️-check: does switching the breakpoint also scope style edits? (Expected gap: it does NOT — StyleInspector writes to the base breakpoint regardless. Confirm and note.)

---

# PART 3 — Left sidebar (L series)

### L1 — Tab switching
**Target:** 4 icon tabs (Components / Pages / Navigator / Assets); clicking active tab collapses.
- [ ] **L1.1** All 4 tabs visible in icon rail
- [ ] **L1.2** Clicking each tab opens the correct panel
- [ ] **L1.3** Clicking the currently active tab collapses the panel

### L2 — Navigator: expand/collapse
**Target:** instance tree; `▶`/`▼` toggles; auto-expands ancestors on selection change.
- [ ] **L2.1** `▶` on a non-leaf row → children appear; `▼` → collapse
- [ ] **L2.2** Select a deeply nested element on canvas → Navigator auto-expands its ancestors
- [ ] **L2.3** Expanded state persists across tab switches (sessionStorage)

### L3 — Navigator: context menu
**Target:** right-click any row → portal menu (Rename / Delete / Duplicate / Wrap in Box); Escape / click-outside dismisses.
- [ ] **L3.1** Right-click a row → menu appears at cursor position
- [ ] **L3.2** **Rename** → inline input on the row → type new name → Enter commits → row shows new label
- [ ] **L3.3** **Delete** → element removed from Navigator and canvas
- [ ] **L3.4** **Duplicate** → a copy appears below the original in the tree
- [ ] **L3.5** **Wrap in Box** → element moved inside a new Box parent
- [ ] **L3.6** Escape closes the menu; click outside the menu also closes it

### L4 — Navigator: DnD reorder
**Target:** drag a row up/down within the same parent to reorder; cross-parent drag rejected.
- [ ] **L4.1** Drag a sibling up → dashed drop indicator appears → release → siblings reorder
- [ ] **L4.2** Drag to a different parent → drop is rejected (no move happens)

### L5 — Pages CRUD
**Target:** create/rename/delete pages; cannot delete the last page.
- [ ] **L5.1** Click "+" → type page name + path → Enter → new page appears in list
- [ ] **L5.2** Double-click a page name → inline input → rename → Enter commits
- [ ] **L5.3** Delete page (× button or context menu) → page removed; another page becomes active
- [ ] **L5.4** Attempt to delete the only remaining page → rejected (no delete button, or error message)

### L6 — Components panel
**Target:** grouped by category; click inserts as child of selected instance.
- [ ] **L6.1** Components panel shows items grouped by category (layout, text, etc.)
- [ ] **L6.2** Click a component → new instance appears as child of selected element in Navigator
- [ ] **L6.3** Click a component with nothing selected → instance appears at root of page

### L7 — Sidebar resize handle
**Target:** drag right edge of sidebar to resize; persists across reload.
- [ ] **L7.1** Drag the right edge of the sidebar → sidebar widens/narrows
- [ ] **L7.2** Width is constrained (min ~180 px, max ~360 px)
- [ ] **L7.3** Reload page → sidebar remembers its width

---

# PART 4 — Right panel: Style Inspector (S series)

### S1 — Section rendering
**Target:** StyleInspector shows named collapsible sections (Layout, Size, Spacing, etc.).
- [ ] **S1.1** Selecting an element shows sections (Layout / Size / Spacing / Typography / Background / Border / Effects / Advanced)
- [ ] **S1.2** Clicking a section header collapses/expands it
- [ ] **S1.3** No section shows "undefined" or raw JSON as a value

### S2 — StyleValueEditor: unit values
**Target:** number input + unit select; arrow keys step ±1/±10; canvas updates immediately.
- [ ] **S2.1** Click a unit value (e.g. `width: 100px`) → number input + unit select appear
- [ ] **S2.2** Change number → canvas element updates immediately (no save/submit needed)
- [ ] **S2.3** Change unit → canvas updates
- [ ] **S2.4** Arrow Up / Down in number input → steps ±1; Shift+Arrow → steps ±10

### S3 — StyleValueEditor: color values
**Target:** `<input type="color">` + hex display; canvas updates on pick.
- [ ] **S3.1** Click a color value (e.g. `backgroundColor`) → color picker appears
- [ ] **S3.2** Pick a new color → canvas element background updates immediately
- [ ] **S3.3** Hex text next to the picker shows the correct value

### S4 — StyleValueEditor: keyword values
**Target:** text input for CSS keywords (display, flex-direction, etc.).
- [ ] **S4.1** Click a keyword value (e.g. `display: block`) → text input appears
- [ ] **S4.2** Type `flex` → Enter or blur → canvas layout changes

### S5 — Add CSS property (AddPropertyRow)
**Target:** two inputs at the bottom; datalist of 60+ properties; commit on Enter/blur.
- [ ] **S5.1** Property name input at bottom has autocomplete suggestions when typed (datalist)
- [ ] **S5.2** Type `display` in property + `flex` in value + Enter → canvas element becomes flex
- [ ] **S5.3** Type `width` + `200px` + Enter → element width changes in canvas
- [ ] **S5.4** Type `backgroundColor` + `#ff0000` + Enter → background turns red
- [ ] **S5.5** Both inputs clear after commit

---

# PART 5 — Right panel: Settings (T series)

### T1 — Props display
**Target:** shows editable prop rows for the selected instance.
- [ ] **T1.1** Select an element → Settings tab shows its props (tag, href, src, etc.)
- [ ] **T1.2** Edit a text prop (e.g. button label) → canvas updates

---

# PART 6 — Undo / Redo (U series)

### U1 — Keyboard shortcuts
**Target:** Ctrl+Z = undo; Ctrl+Shift+Z = redo; Ctrl+Y = redo; one step per action.
- [ ] **U1.1** Edit a style (e.g. width) → Ctrl+Z → value reverts → canvas updates
- [ ] **U1.2** After undo, Ctrl+Shift+Z → value re-applies
- [ ] **U1.3** Delete a node via context menu → Ctrl+Z → node reappears
- [ ] **U1.4** Add a CSS property via AddPropertyRow → Ctrl+Z → property removed
- [ ] **U1.5** Chain: style-edit → delete → AI-apply → Ctrl+Z ×3 → reverts in exact reverse order

### U2 — Footer buttons
**Target:** ↩ (undo) and ↪ (redo) buttons in footer; disabled when stack is empty.
- [ ] **U2.1** Fresh load → both buttons are visually disabled (dimmed)
- [ ] **U2.2** After any mutation → ↩ becomes active (brighter)
- [ ] **U2.3** Click ↩ → same as Ctrl+Z; ↪ becomes active after undo
- [ ] **U2.4** Click ↪ → same as Ctrl+Shift+Z

---

# PART 7 — AI Panel (A series)

### A1 — Open / close
**Target:** "AI" button in Topbar; panel opens below topbar centered; Escape closes.
- [ ] **A1.1** "AI" button visible in topbar right section
- [ ] **A1.2** Click "AI" → panel opens (below topbar, centered over canvas)
- [ ] **A1.3** Click "AI" again → panel closes
- [ ] **A1.4** Escape key closes the panel

### A2 — Generate + Apply
**Target:** type prompt → Generate → AI returns composition → Apply → canvas re-renders.
- [ ] **A2.1** Type a prompt (e.g. "Create a hero section with a heading and button") → click Generate
- [ ] **A2.2** Spinner shown while API call in flight
- [ ] **A2.3** Success: component summary shown ("✓ N components: Box, Heading…") + credits remaining
- [ ] **A2.4** Click "Apply to page" → canvas re-renders with AI layout; panel closes
- [ ] **A2.5** Applied layout is undoable (Ctrl+Z → canvas reverts)

### A3 — Discard + Error paths
**Target:** Discard returns to idle; errors shown without crash.
- [ ] **A3.1** Generate → success → click Discard → panel returns to idle (prompt cleared, canvas unchanged)
- [ ] **A3.2** Error (e.g. 0-credit account, or invalid prompt): error string shown in red, no crash, [Try again] possible
- [ ] **A3.3** ⚠️-check: is the "credits remaining" display correct after a successful generation?

---

# PART 8 — Share / Preview (P series)

### P1 — Share button
**Target:** "Share ↗" in Topbar copies preview URL to clipboard; toast confirms.
- [ ] **P1.1** Click "Share ↗" → clipboard updated + "✓ Copied" notification shown for ~2s

### P2 — Preview page
**Target:** `/preview/[projectId]` — public (no auth), canvas only, no builder chrome.
- [ ] **P2.1** Open the copied preview URL in an **incognito window** → page loads without login redirect
- [ ] **P2.2** Canvas shows the project content (same as in builder)
- [ ] **P2.3** No editor chrome visible (no topbar, no sidebar, no right panel)

---

# PART 9 — Breadcrumb / Footer (F series)

### F1 — Breadcrumb
**Target:** ancestor chain of selected element; click to select ancestor.
- [ ] **F1.1** Select a nested element → footer shows "Body > Parent > SelectedElement" chain
- [ ] **F1.2** Click a breadcrumb ancestor → that element becomes selected (canvas outline + inspector updates)

---

## R4 — FA-007 direct-manipulation + i18n (v19.x) — needs a human pass

> Automation proves the overlay renders on select, VI plan cards, and the verify page is public (`e2e/editor.spec.ts`, `e2e/i18n.spec.ts`). The rows below are the *mutations* automation can't reliably assert inside the canvas iframe. Do these in a browser at `/builder/demo` (design mode).

### DM1 — Resize (v19.0.0)
- [ ] **DM1.1** Click an element (e.g. a card Box) → purple bounding box + `Component W × H` label + 8 white handles appear
- [ ] **DM1.2** Drag the SE (bottom-right) handle → a live preview box follows the cursor; the element itself doesn't jump until release
- [ ] **DM1.3** Release → element resizes to the new size; label updates; size persists on reselect
- [ ] **DM1.4** Undo (⌘Z) → element returns to its previous size
- [ ] **DM1.5** Edge handles change one axis (e→width only, s→height only); corner handles change both
- [ ] **DM1.6** Switch to Preview mode → overlay disappears

### DM2 — Drag-reparent (v19.1.0)
- [ ] **DM2.1** Select an element, then press-drag it → cursor becomes grabbing; a purple insertion line / box tracks the element under the pointer
- [ ] **DM2.2** Drop between two siblings (above/below line) → element reorders to that index; persists; undoable
- [ ] **DM2.3** Drop onto a container (into box) → element becomes that container's last child
- [ ] **DM2.4** Dropping into the element's own descendant is rejected (no move); dropping on a text-only element (Heading/Paragraph) shows above/below only, never "into"
- [ ] **DM2.5** A plain click (no drag) still just selects — clicking doesn't move anything
- [ ] **DM2.6** After a drop, the element stays selected (the post-drag click doesn't deselect)

### DM3 — Navigator DnD unchanged (regression, refactor to `lib/treeMove.ts`)
- [ ] **DM3.1** In the left-sidebar navigator, drag a tree row above/below another → reorders in the tree AND canvas
- [ ] **DM3.2** Drag a row onto a container row → nests inside; drag onto a text-only row → only above/below
- [ ] **DM3.3** Undo reverts the navigator move

### I18N1 — VI funnel + email verification (v18.8.0 / v19.2.0)
- [ ] **I18N1.1** Switch to Tiếng Việt → `/`, `/pricing`, `/signup`, `/terms`, `/privacy` render Vietnamese (no English leakage in hero/cards/labels)
- [ ] **I18N1.2** Sign up with email → a "Verify your Nova email" email arrives (with `RESEND_API_KEY` set); the link opens `/verify-email` and shows "Email verified"
- [ ] **I18N1.3** An expired/invalid verify link shows the failure card, not a crash

---

## What to do with your feedback

1. Report per subsystem: `B2: ok`, `L3.3: crashes — console: ...`, `S2.4: arrow keys do nothing`
2. All-✅ → flip the rows in `doc/VERIFIED.md` (nova-builder sections) to ✅ with today's date
3. Any ⚠️/❌ → I open one fix release for that subsystem, then you re-test it

---

## Subsystem → VERIFIED.md section map

| QA IDs | VERIFIED.md section |
|--------|---------------------|
| B1–B4 | nova-builder / v10.0.0 (Projects CRUD) |
| C1 | nova-builder / v7.0.0 (canvas baseline) |
| C2–C3 | nova-builder / v11.0.0 (11A–11B) |
| C4 | nova-builder / v11.0.0 (11C) |
| L1–L7 | nova-builder / v8.0.0 (left sidebar v2) |
| S1–S4 | nova-builder / v10.0.0 (10C StyleInspector) |
| S5 | nova-builder / v11.0.0 (11E AddPropertyRow) |
| T1 | nova-builder / v7.0.0 (SettingsPanel) |
| U1–U2 | nova-builder / v11.0.0 (11D undo/redo) |
| A1–A3 | nova-builder / v9.0.0 (AI Panel) |
| P1–P2 | nova-builder / v10.0.0 (10D Preview/Share) |
| F1 | nova-builder / v7.0.0 (Footer) |
