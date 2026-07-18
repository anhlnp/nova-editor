# Nova Editor — Manual Parity Audit (browser)

This is the click-through to audit the editor part-by-part against webstudio, and to verify the 🟡
("logic done, not browser-tested") features. It is organized as **22 subsystems** (the editor mapping),
grouped **Keep / Adjust / New**. Each subsystem says what "good" looks like so you can judge *matches vs
subtly-off*.

---

## ⭐ HOW TO GIVE FEEDBACK (read this first — this is the part that was missing)

**Don't worry about marks/emoji — just write what happened in plain words.** For each item (or in bulk),
write the ID and a sentence: "ok", or "works but laggy", or "nothing happens when I click X". I classify
it into ✅ (ok+matches) / ⚠️ (works but subtly off/missing — the "incomplete-not-different" worry) /
❌ (broken). Paste a red console line if there is one.

**Example — this is exactly how to write it (real format, no emoji needed):**
```
K1: ok
K3.1: shows but laggy
K5: open/type/enter/esc ok, but Delete-hero can't undo; keyboard scroll to off-screen items doesn't work
K6: editing the hero does nothing — delete/edit/drag/resize/set-field all dead
K7: Publish does nothing, no message about whether I entered the Vercel token
```

What I do with it:
- A subsystem that's all-ok → I mark it done, **no version, no work**.
- Anything off/broken → I open **one** fix release for that subsystem, sized to the problem.

Each subsystem has a **Target (webstudio)** line — that's the bar; if nova is worse, say so even if it
"kind of works."

---

## Before you start (2 minutes)

- [ ] `pnpm dev`, open a project, hard-refresh (accept "restore draft" if asked).
- [ ] Open the browser **console** and leave it open. Mark **❌** on any *red* error.
- [ ] *(Optional, advanced)* Two warnings should never print — if you ever see `[I4]` or `[I5]` in the
      console, copy the line into your feedback. They mean a deep regression. You don't need to hunt for
      them; just glance if something feels wrong.

---

# PART 1 — KEEP (audit for subtle gaps before we build on top)

> These are the parts we plan to keep as-is. We verify them FIRST because everything else sits on them,
> and because "keep" doesn't mean "confirmed complete." This pass also closes Phase F (the v7.0.x work).

### K1 — Draft persistence
**Target:** edits survive a refresh; no data loss.
- [ ] **K1.1** Make an edit → refresh → restore draft → the edit is still there.

### K2 — Canvas renders
**Target (webstudio):** the page shows visually, sized to the viewport, scrolls cleanly.
- [ ] **K2.1** Project opens; the page is visible on the white canvas; no missing/blank blocks.
- [ ] **K2.2** Switch pages (top-bar page dropdown) → canvas reloads the right page.

### K3 — Select & inspect
**Target:** click a thing → it highlights → the right panel shows its settings.
- [ ] **K3.1** Click a block → it gets an outline AND the right panel fills with its props.
- [ ] **K3.2** Click empty canvas → selection behaves predictably (panel keeps last selection by design;
      it should NOT flicker empty).

### K4 — Right inspector tabs (Settings / Style)
**Target (webstudio):** two tabs — one for *what it is* (props), one for *how it looks* (style).
- [ ] **K4.1** The right panel has two tabs; switching keeps your scroll position and in-progress edits.

### K5 — Command palette (⌘K)
**Target:** ⌘K opens a searchable command list; arrow+Enter runs; Esc closes; it draws above everything.
- [ ] **K5.1** ⌘K opens, you can type to filter, Enter runs the top result, Esc closes.

### K6 — Undo / redo = ONE step per action
**Target:** every completed action reverts in **exactly one** Ctrl/Cmd+Z (no "undo moves it 1px").
For each: do it, press **Ctrl/Cmd+Z once** → fully reverts; **Ctrl/Cmd+Y** → redoes.
- [ ] **K6.1** Edit a prop (e.g. Button label) → one undo reverts the whole value.
- [ ] **K6.2** Change a style (padding/bg/flex) → one undo reverts.
- [ ] **K6.3** **Gap drag** (drag the band between flex children) → release → **one** undo restores the
      gap (NOT one-undo-per-pixel — this is the key fix). Live preview tracks the cursor while dragging.
- [ ] **K6.4** **Resize drag** (corner/edge handle) → release → one undo restores the size; W·H badge
      shows while dragging.
- [ ] **K6.5** Delete a node → one undo restores it (and selection behaves).
- [ ] **K6.6** Set a field to the value it ALREADY has → **no** new undo step is created.
- [ ] **K6.7** Do prop-edit → move → AI edit, then Ctrl+Z ×3 → reverts in exact reverse order.

### K7 — Export / publish
**Target:** publishing writes the project out faithfully.
- [ ] **K7.1** Publish (Free) → toast confirms `project.json` committed.
- [ ] **K7.2** *(if you have a Pro test account)* Publish → `.tsx` generated; deploy URL if Vercel set.

### K8 — Breadcrumb
**Target:** a path of ancestors at the bottom; click one to select it.
- [ ] **K8.1** Select a nested node → breadcrumb shows its ancestor trail → clicking an ancestor selects it.

### K9 — Inline text edit
**Target (webstudio):** double-click text on canvas, type in place, commit on Enter/blur.
- [ ] **K9.1** Double-click a TextBlock/Button/Link → type → Enter/blur commits; one undo reverts the
      whole edit; **Esc cancels with no change**.

### K10 — Selection survives edits
**Target:** after any edit, the right node stays selected; the panel doesn't flicker empty.
- [ ] **K10.1** After several edits in a row, the inspector keeps showing the correct node.

➡ **All of Part 1 ✅** → I flip the v7.0.0/7.0.1/7.0.2 + Phase F rows in [VERIFIED.md](VERIFIED.md) to ✅
and we start the rework from a verified base.

---

# PART 2 — ADJUST (compare to webstudio; ⚠️ = the gap we'll fix)

### A1 — Left rail & panel switching
**Target (webstudio):** an icon rail; clicking an icon opens that one panel; clicking it again collapses
to max canvas space. One panel = one job.
- [ ] **A1.1** The left icon rail switches panels (Layers/Blocks/Pages/etc); clicking the active icon
      collapses it.
- [ ] **A1.2** ⚠️-check: does it feel cluttered/duplicated (e.g. both "Blocks" and "Components")? Mark ⚠️
      with what's confusing.

### A2 — Add / Blocks panel
**Target (webstudio):** primitives first (Box/Text/Image/Link), grouped, searchable; click to insert,
drag to canvas.
- [ ] **A2.1** Search works; clicking a block inserts it; dragging it to canvas inserts it.
- [ ] **A2.2** ⚠️-check: are the offered blocks too preset-heavy / not primitive-first? Mark ⚠️.

### A3 — Navigator / Layers tree
**Target (webstudio):** tree of all instances; rename inline; drag to reorder AND re-nest (drag sideways
to change depth); show/hide; a live CSS preview at the bottom; a "Global Root" at the top.
- [ ] **A3.1** Drag a layer to reorder/reparent; F2 (or double-click) renames; eye icon hides.
- [ ] **A3.2** ⚠️-check (expected gaps): no **CSS preview** at the bottom, no **Global Root**, can't drag
      sideways to change nesting depth. Confirm each is missing.

### A4 — Pages panel
**Target (webstudio):** add/rename/delete/reorder pages, SEO fields, organize into **folders**.
- [ ] **A4.1** Add/rename/route/delete/duplicate/reorder pages; SEO fields save.
- [ ] **A4.2** ⚠️-check: the **Theme** tab is bolted into Pages (odd place), and there are **no folders**.

### A5 — Style panel sections + the Space (padding/margin) widget
**Target (webstudio):** the padding/margin box editor supports **scrub-drag** a side to change the value,
**Shift**=all four sides, **Alt**=opposite pair, **Alt-click**=clear, keyboard arrows between cells.
- [ ] **A5.1** The Style panel shows sections (Layout/Size/Space/Typography/…); edits visibly apply.
- [ ] **A5.2** Spacing widget: can you scrub a side by dragging? Is it smooth? (webstudio is.) Mark ⚠️ if
      it only has plain inputs / jumps / lacks Shift/Alt modifiers.
- [ ] **A5.3** ⚠️-check: there are **four** style modes (Simple/Default/Focus/Advanced) — is that
      confusing? (We plan to cut to 2.)

### A6 — Settings / Props panel
**Target (webstudio):** props + element **tag**, **id**, **class** controls.
- [ ] **A6.1** Every prop type edits (text/select/toggle/number/color/list); typing isn't laggy.
- [ ] **A6.2** ⚠️-check: there's no **tag / id / class** control like webstudio's Settings.

### A7 — Canvas overlay chrome (hover / select / resize)
**Target (webstudio):** clean hover outline, selected outline + label, resize handles; nothing covers a
panel; stays correct at zoom ≠ 1.
- [ ] **A7.1** Hover shows an outline; select shows outline + toolbar; resize handles work.
- [ ] **A7.2** At zoom ≠ 1, overlays/handles/guides stay correctly aligned.
- [ ] **A7.3** **I7:** select an element flush to the right edge → its toolbar renders **beneath** the
      right panel (panel always on top). Mark ❌ if an overlay covers the panel.

### A8 — Drag & drop on canvas (the "never error" principle)
**Target (webstudio):** you can drop **anywhere** — there's always a valid nearest position, never a
stuck/error state; a crisp drop-line shows the exact insert spot.
- [ ] **A8.1** Drag a block over the canvas → a clear drop-line shows where it lands (between items, end
      of list, into empty containers).
- [ ] **A8.2** Drop a block into a container → it goes in. An **illegal** drop (Section into a Button) is
      rejected gracefully (drops nearby instead of erroring). Mark ❌ if anything crashes or gets stuck.
- [ ] **A8.3** ⚠️-check: does drop ever feel "stuck"/unpredictable vs webstudio's always-finds-a-spot?

### A9 — Breakpoints / viewport
**Target (webstudio):** picking a breakpoint resizes the canvas AND scopes your style edits to that
breakpoint (one unified control, mobile-first).
- [ ] **A9.1** Top-bar Desktop/Tablet/Mobile resizes the canvas.
- [ ] **A9.2** ⚠️-check (known gap): the viewport switch does **NOT** scope your style edits — the style
      breakpoint (md:/lg:) in the Style panel is a *separate* control. Confirm they're disconnected.

### A10 — Top bar
**Target (webstudio):** mode switcher + breakpoints + share + publish, clean.
- [ ] **A10.1** Undo/redo, viewport, zoom, page selector, publish all work.
- [ ] **A10.2** ⚠️-check: there is **no mode switcher** (Design/Content/Preview) — see N1.

➡ Each ADJUST subsystem: all ✅ → mark done; any ⚠️/❌ → one fix release (the Phase G gate).

---

# PART 3 — NEW / MISSING (just confirm they're absent — nothing to test)

These don't exist yet. You don't test them; just confirm you don't see them, so we agree they're net-new.
- [ ] **N1** **Modes** — there's no Design/Content/Preview switch anywhere. *(Biggest commercial gap.)*
- [ ] **N2** **Assets panel** — there's no dedicated media/asset manager in the left rail.
- [ ] **N3** **Style provenance** — nothing tells you where a style comes from (inherited / from another
      breakpoint / overridden). webstudio colors its labels for this.

---

# PART 4 — Beyond the editor (do later, needs live services)

Not part of the editor parity audit; verify before relying on Pro/production.
- [ ] AI: valid edit applies + 1 credit; invalid patch → "Patch invalid" + Retry, **no credit**; AI edit
      is one undo step.
- [ ] Credits/webhook (live Supabase + Lemon Squeezy), exported build (`npm run build`), staging deploy.
- [ ] Marketing/auth/dashboard pages render and the login→projects flow works.

---

## What I do with your feedback (the loop)

1. You reply per subsystem with `ID: ✅ / ⚠️ … / ❌ …`.
2. Each subsystem of all-✅ → I flip its [VERIFIED.md](VERIFIED.md) rows to ✅ — **no version, no work**.
3. Each subsystem with ⚠️/❌ → I open **one** Phase G release ([ROADMAP.md](ROADMAP.md)) sized to the
   problem (polish→Patch, rework→Minor, architecture→Major-by-risk), fix it, you re-test that subsystem.
4. `schemaVersion` stays 4.0 the whole time (UI rework only; backend never touched).

**Subsystem → Phase G gate map** (so a ⚠️/❌ maps straight to a version):

| Audit IDs | Phase G gate |
|---|---|
| K1–K10 | G0 (verify Keep = close Phase F) |
| A1 | G1 (rail/monolith split) |
| A2 | G5 (Add primitive-first) |
| A3 | G6 (Navigator depth) |
| A4 | G3 (Pages/Theme split) |
| A5 | G4 (Space widget) + G1 (section split) |
| A6 | G2 (Settings tag/id/class) |
| A7 | G7 (overlay split) |
| A8 | G9 (DnD never-error) |
| A9 | G8 (unify breakpoints) |
| A10, N1 | G10 (Modes) |
| N2 | G11 (Assets) |
| N3 | G12 (provenance) |
