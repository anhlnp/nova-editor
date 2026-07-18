# Phase 5 — Manual QA Checklist (v2.0 gate)

> The one-time browser/deploy QA pass that flips 🟡 rows in [`VERIFIED.md`](VERIFIED.md) to ✅ and closes the deploy-coupled TDs. Nothing should rely on Pro publish until §9 passes.
>
> **How to use:** run each step, compare to **Pass criteria**. If it passes, flip the named `VERIFIED.md` row to ✅ (date it). If it fails, leave 🟡 and file a 🔴 + a TD with the exact repro/console output. Test on the **default editor zoom (100%)** unless a step says otherwise.

## 0. Setup
1. `pnpm install && pnpm --filter @studio/app dev` → open `http://localhost:3000`.
2. Apply DB migrations incl. **`0004_credit_allowances.sql`** to your Supabase project (`supabase db push` or SQL editor). → **Pass:** `/api/setup-check` reports all tables/RPCs present; no console errors on editor load.
3. Sign in (GitHub OAuth), connect a repo, open a project. Have a **Pro/test** account ready (TopBar tier switcher) for §9.
4. Keep the browser **devtools console** open the whole pass — any red error = note it.

---

## 1. Critical-path smoke
| # | Steps | Pass criteria | VERIFIED row |
|---|---|---|---|
|1.1| Load a project | Canvas renders the page; no console errors; "Loading…" resolves | Publish/load |
|1.2| Click a block on canvas | It gets the selection outline; **right panel shows that block's name + Props/Style tabs** | "Click-select → panel targets it" |
|1.3| Edit a Prop (e.g. Button label) | Canvas updates live | — |
|1.4| Ctrl+Z then Ctrl+Y | Undo reverts, redo re-applies | "Undo/redo" |
|1.5| Reload the page | Your edits persisted (draft/restore prompt or saved state) | — |

---

## 2. Style system — the core v1.4/v2.0 fixes (highest priority)
The big risk: that `cn()` merge + `classOverrides` + removed props actually render right.
| # | Steps | Pass criteria | VERIFIED row |
|---|---|---|---|
|2.1| Select a block → **Style tab** → change **padding** (e.g. Spacing → py-8) | Canvas padding changes **immediately and matches** the chosen value (not a different/old value) | "Style panel writes apply on canvas" |
|2.2| Change **text size** on a TextBlock (Style → Typography → Size) | Size changes and **the chosen size wins** (no stale base size fighting it) | same |
|2.3| Change **gap** on a Column, **width** on a block, **bg color** (Style → Background) | Each applies predictably; bg color shows | same |
|2.4| Set a **hover** variant (top bar → hover) + bg color | On canvas hover the color changes | — |
|2.5| **Select a `Section`** → set Display **flex** + gap + justify-between (Style → Layout) | The Section's **children** reflow side-by-side (layout acts on content, not a hidden inner wrapper) | "Section layout overrides reach children" |
|2.6| Select a **TextBlock** → open **Props tab** | **No** fontSize/fontWeight/align controls (only content/tag/textColor). Select a **Section** → Props shows only bgColor (no padding/maxWidth). Select **Column** → no gap | "ADR-028 migrated/new blocks render identically" |
|2.7| **Style → Raw/Advanced → "Clear all"** on a styled block | All overrides removed; block returns to base look. Per-class `×` removes one class | "Style Clear all + per-class ×" |

---

## 3. Block insertion + composite `defaultChildren`
| # | Steps | Pass criteria | VERIFIED row |
|---|---|---|---|
|3.1| Blocks panel → **drag** a block onto canvas | Live drop indicator; block lands where dropped | "Drag block + drop indicator" |
|3.2| Blocks panel → **click** a block (and Layers "+") | Appends; primitives/presets grouped; popover picker also grouped | "Add block (click/Layers) + defaultChildren" |
|3.3| Insert **Navbar** | Renders brand Link + nav Links + CTA Button as **separate, selectable** child nodes (Layers shows them); brand sits left | same |
|3.4| Insert **HeroSection** | Renders an `h1` title + subtitle (child TextBlocks, big/bold) + a Button — no duplicate/empty text | same |
|3.5| Insert **PricingCard** | Renders with a child **Button** CTA (selectable) | same |
|3.6| Insert **Footer** (TD-021) | Renders copyright + **child Link** nodes (Privacy/Terms), readable on the dark bg; clicking a footer link selects that Link | "Footer decomposed" |
|3.7| Insert **Row** (TD-022) | A horizontal flex container appears; drop 2–3 blocks inside → they sit **side-by-side** with a gap; selecting Row + Style changes gap/justify | "Row flex primitive" |

---

## 4. Selection, multi-select, group/ungroup
| # | Steps | Pass criteria | VERIFIED row |
|---|---|---|---|
|4.1| **Shift/Ctrl-click** a 2nd, 3rd block | Selection **accumulates** (2+ outlined); the multi-select toolbar appears showing the count | "Shift/Ctrl multi-select accumulates" |
|4.2| With 2+ selected → **Group** | They wrap into a Section named **"Group"** (Layers label) with sensible padding | "Group → Section / Ungroup" |
|4.3| Right-click the Group Section → **Ungroup** | Children lift back into the parent; the Section is removed | same |
|4.4| Plain click elsewhere | Multi-selection collapses to the single clicked block | — |

---

## 5. Layers panel
| # | Steps | Pass criteria | VERIFIED row |
|---|---|---|---|
|5.1| Select a layer → press **F2** (and right-click → Rename) | Inline rename; the new name shows in Layers **and** the canvas toolbar | "Layers rename (F2 + context menu) persists" |
|5.2| Rename, then **reload** the page | The custom name **survives** the reload (stored as `_novaName`) | same |
|5.3| Rename, then **undo/redo** or run an AI edit | The custom name still shows (not reset) | same |
|5.4| **Drag** a layer to reorder / into a container | Tree + canvas reorder match; illegal drops rejected | — |
|5.5| Toggle **hide** (👁) | Node hides on canvas (note: hide is session-only, not persisted — expected) | — |

---

## 6. Migration QA (load OLD projects → 1.6) — important
Create test `project.json` files at older versions (or open a real older repo) and load each.
| # | Setup | Pass criteria | VERIFIED row |
|---|---|---|---|
|6.1| A **1.3** project with a HeroSection using `title`/`subtitle` props | After load: title/subtitle render as child TextBlocks (no duplicate, no empty); looks like before | "ADR-028 render parity" / migration |
|6.2| A **1.2** project with a Navbar using `links[]`/`brandName` | Navbar renders brand + links as child nodes; no missing links | same |
|6.3| A **1.4** project with TextBlock `fontSize:"xl"`, Section `paddingY:"lg"`, Column `gap:"lg"` | After 1.4→1.5: blocks render **identically** to before (sizes/padding/gap preserved via classOverrides) | "1.4→1.5 migration … render parity" |
|6.4| A **1.5** project with a Footer using `links:[...]` | After 1.5→1.6: footer links render as child Links | "Footer decomposed" |
|6.5| Open, then **save/publish**, reopen | No re-migration loop; schemaVersion is `1.6`; stable | — |

---

## 7. Canvas chrome, zoom, viewport
| # | Steps | Pass criteria | VERIFIED row / TD |
|---|---|---|---|
|7.1| Select a child inside a **flex** parent | **AlignBar** appears; justify/align buttons change layout | "AlignBar / gap-drag" |
|7.2| Hover gaps between flex/grid children | Gap bands appear; drag a band → gap changes | same |
|7.3| Switch **viewport** (desktop/tablet/mobile) | Canvas width changes; selection still works | "Responsive viewport switch" |
|7.4| **Zoom** to 50% and 100% via the control | Input accepts only 25–100%; **TD-018 check:** at 50%, do the selection toolbar / AlignBar / gap bands still align to the element? | "Zoom" / **TD-018** |
|7.5| Inline edit: **double-click a TextBlock** | Becomes editable; type + Enter/blur commits; Esc cancels | "Inline text edit" |

> **TD-018:** if overlays are misplaced at zoom ≠ 100% (expected), file/keep it; the fix (portal overlays to a non-transformed ancestor) is a follow-up.

---

## 8. AI
| # | Steps | Pass criteria | VERIFIED row |
|---|---|---|---|
|8.1| AI panel → pick a **free** provider → "make the hero background dark blue" | Patch applies; canvas updates; credit cost shows 0/free | "AI chat → patch applied" |
|8.2| Ask AI to **add a block** / change text | Valid change applied; invalid → no credit charged, error shown | same |
|8.3| Ask AI to **style** something ("make the heading bigger") | It uses `classOverrides` (not a removed prop) — the change actually shows (validates TD-025 hint rewrite) | same / TD-025 |

---

## 9. Publish (Free + Pro) — closes TD-023 / TD-024
| # | Steps | Pass criteria | VERIFIED row / TD |
|---|---|---|---|
|9.1| **Free** account → Publish | `project.json` committed to GitHub; success toast; no `.tsx` | "Publish (Free)" |
|9.2| **Pro** account → Publish | `app/…`, `components/blocks/*.tsx`, `_novaStyle.ts`, `tailwind.config.js` committed | "Publish (Pro)" |
|9.3| **Clone the published repo** → `npm install` | **TD-023:** does it build without manual deps? If `_novaStyle.ts` import of `tailwind-merge` fails → add `tailwind-merge` to the project (and fix the publish route to inject it). | **TD-023** |
|9.4| `npm run build && npm start` the exported site | **TD-024:** the published page **renders the same** as the editor canvas (layout, spacing, styles, hero/navbar/footer not duplicated) | **TD-024** / "exported build parity" |
|9.5| Conflict path: publish, change remote, publish again | A `nova/draft-*` branch + PR link returned (no force-push) | — |

---

## 10. Theme tab + misc
| # | Steps | Pass criteria | VERIFIED row / TD |
|---|---|---|---|
|10.1| Pages → **Theme** tab | The **"Export theme"** banner is shown; editing a token does **not** restyle the canvas (expected, export-only) | **TD-019** |
|10.2| After 9.2, check exported `tailwind.config.js` | Theme fonts/colors appear in the config | — |
|10.3| **Pages**: add / rename / set route / SEO / delete / reorder | All work; route validation enforced | "Pages CRUD + SEO" |
|10.4| **Templates**: save current page, apply it | Saves; apply re-mints ids and inserts | "Templates save/apply" |
|10.5| **Credits** (non-test free account): run AI until low | Counter decrements; at 0, gated with upgrade prompt; allowance matches policy (free 200) | "Credit allowances" |

---

## Exit criteria (v2.0 ships when)
- §1–§8 + §10 rows all flipped to ✅ in `VERIFIED.md`.
- §9 passes → TD-023 + TD-024 closed (or fixed-then-passed).
- Any failures filed as 🔴 + a TD; no 🔴 on the critical path (§1, §2, §3, §6, §9).
- Remaining known-not-blocking: TD-018 (zoom overlay), TD-016/017 (marquee/resize — future features), ✅ TD-007 (E2E — harness shipped v5.4.0).
