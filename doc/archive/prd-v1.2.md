# Nova Editor — PRD v1.2 (Content-Rich Editor + Production Hardening)

**Version:** 1.2 (delta spec — builds on v1.1)
**Status:** Planning. Ready to start.
**Base:** Read `prd.md` (v1.0 as-built) and `prd-v1.1.md` first. This document specifies only what changes or is added in v1.2.
**Language:** English

> **Theme — Content-rich editor + production hardening.** Makes the editor feel like a real product: images users can upload (via R2, not Supabase Storage), more block types, Playwright safety net, and — most importantly — a UX pass so users never have to switch tabs to manage their canvas. v1.2 also lays the design token schema that v1.3's visual style editor builds on.

> **Bootstrap financial constraint:** Every architecture decision must be evaluated against a pre-revenue budget. Use free tiers that don't punish growth. Prefer zero-egress-fee storage (R2), free CI (GitHub Actions), and avoid services where the free tier disappears with a handful of users.

---

## 0. Nova product vision (for context)

Nova is intentionally three products layered together:
| Inspiration | Nova layer |
|---|---|
| **Vercel v0** | AI chat → JSON schema patch → live canvas. No freeform CSS. Tailwind only. |
| **Builder.io** | Component registry, JSON AST schema, visual editor |
| **Canva** | Canvas-first UX, template gallery, drag-from-panel, inline "+" affordance |

v1.2 advances all three layers. The Canva layer has been underspecced — it gets explicit attention in W5 this version.

---

## 1. Architecture cost re-evaluation

### Storage: Cloudflare R2 (not Supabase Storage)

Supabase Storage free tier: 1 GB storage, 5 GB/month bandwidth. A handful of high-res images exhausts this, bumping the project to $25/month — unacceptable pre-revenue.

**Decision: All file storage uses Cloudflare R2.**

| | Supabase Storage Free | **Cloudflare R2 Free** |
|---|---|---|
| Storage | 1 GB | **10 GB** |
| Egress / bandwidth | 5 GB/month | **$0 forever** |
| Beyond free | $25/month plan | $0.015/GB storage, $0 egress |

R2 is S3-compatible → we use `@aws-sdk/client-s3` with a custom endpoint. No new SDK needed.

New env vars: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.

### Database: Keep Supabase PostgreSQL

User metadata + projects is kilobytes, not gigabytes. Supabase free tier (500 MB DB) is safe for the foreseeable future.

### Payments: Lemon Squeezy (international) + PayOS (Vietnam)

Lemon Squeezy handles international cards, PayPal, and VAT/MoR complexity — keep it.

Vietnamese users pay via VietQR (bank app scan-and-pay). Lemon Squeezy doesn't support VietQR. **PayOS** (payos.vn) solves this automatically:
- Auto-generates a VietQR QR code per transaction (works with all 26+ Vietnamese banks)
- Sends a webhook to Nova when payment is confirmed → Nova upgrades the user account automatically
- Has a sandbox environment for testing
- No manual verification, no Zalo required
- Fee: ~0.5–1% domestic, $0 monthly cost
- SDK: `@payos/node`

**PayOS flow:**
1. Vietnamese user clicks "Upgrade to Pro" → chooses "Pay via VietQR"
2. Nova calls PayOS API → receives `{ paymentLinkId, qrCode, checkoutUrl }`
3. Modal shows QR code (user scans with any banking app) + countdown timer
4. PayOS fires `POST /api/payment/payos/webhook` → Nova verifies HMAC checksum → upgrades user in DB → shows success
5. New env vars: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`

**Lemon Squeezy test mode (how to test Pro/Free locally):**
- LS dashboard: Settings → Store → Enable test mode. Test card: `4242 4242 4242 4242`. Webhooks fire in test mode.
- Dev shortcut (no payment flow): `NEXT_PUBLIC_FORCE_PRO=true` in `.env.local` → treats the session user as Pro. Only active when `NODE_ENV=development`. Remove before production deploy.

**Manual admin upgrade (emergency fallback):**
`POST /api/admin/upgrade?userId=&secret=ADMIN_SECRET` still available for edge cases.

---

## 2. Scope

| ID | Workstream | Priority |
|----|-----------|----------|
| W1 | **Image upload** — Cloudflare R2 + Image block upload UI | Must |
| W2 | **Playwright/E2E + CI gate** | Must |
| W3 | **Block library expansion** — FAQ, Testimonials, Stats, Gallery, Form | Should |
| W4 | **Craft.js fork re-evaluation** | Should |
| W5 | **UX overhaul** — Canva-style vertical sidebar nav (icon rail + expandable sections), Layers right-click/keyboard, inline block picker, canvas empty-state "+" button, panel collapse, scroll fixes | Should |
| W6 | **Cross-page linking** — Button + Navbar `href` with page route picker | Should |
| W7 | **Design token schema** — `ProjectSchema.theme` (colors/fonts/spacing). Schema + UI only; `tailwind.config.js` emit deferred to v1.3 when style panel is ready | Should |
| W8 | **Setup guides** — Vietnam payment, R2 setup, Lemon Squeezy, full env-var walkthrough | Should |
| — | **Tech debt** — publish `alert/confirm` → toast; Supabase lazy-init; block authoring docs | Should |

**Not in v1.2:**
- Per-element Tailwind class overrides (v1.3 W8/W9 — depends on W7 token schema landing here first)
- CSS layout editor / flexbox-grid visual (v1.4 — complex, easy to get wrong)
- Template marketplace / Canva gallery (v2.0)

---

## 3. Workstream Detail

### W1 — Image Upload via Cloudflare R2

**Build:**
- Install `@aws-sdk/client-s3`
- New helper `apps/studio/src/lib/r2.ts` — wraps S3Client with R2 endpoint
- `POST /api/project/[projectId]/upload` — accepts multipart/form-data (image only, max 5 MB, MIME check), uploads to R2, returns `{ url: string }` (public CDN URL via `R2_PUBLIC_URL`)
- Image block settings panel: file input (drag-or-click) → POST to upload → sets `props.src`
- Filename: `${projectId}/${userId}/${Date.now()}-${sanitizedName}` — scoped to project, no collisions

**Env vars added to `.env.local` and setup guide:**
```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=nova-assets
R2_PUBLIC_URL=https://pub-XXXX.r2.dev   # or custom domain
```

**Acceptance:** Upload PNG in Image block settings → image renders on canvas → publish → `.tsx` has the R2 URL. Upload of non-image or >5MB file is rejected with a clear error.

---

### W2 — Playwright/E2E + CI Gate

**Build:**
- `apps/studio/e2e/` — Playwright project with network mocks for GitHub, AI, Supabase
- **Critical-path spec:**
  1. Login (mock OAuth) → redirects to /projects
  2. Connect repo → editor opens with empty canvas
  3. Right-click canvas empty state → block picker → add HeroSection → block appears, no crash
  4. Click block → selection outline; RightPanel shows props
  5. Edit a prop → canvas updates live
  6. AI patch (mocked) → canvas updates
  7. Publish (free tier) → "Saved to GitHub" message (not misleading success)
  8. Ctrl+Z → undo works
- **Secondary specs:** context menu (duplicate/delete); keyboard (Del, Ctrl+D); multi-page; Layers right-click operations

**CI:** `.github/workflows/ci.yml` — add `playwright install --with-deps` + `pnpm e2e`.

---

### W3 — Block Library Expansion

**ADR-021 (new, before implementation):** Interactive blocks need `"use client"`. Recommended: mark interactive blocks with the directive; renderer detects it and wraps in a client boundary. This keeps registry components self-contained.

| Block | Type | Key prop |
|-------|------|---------|
| FAQ | Client (accordion) | `items: { q, a }[]` |
| Testimonials | Server | `items: { quote, author, role, avatar }[]` |
| Stats | Server | `items: { value, label }[]` |
| Gallery | Server | `items: { src, alt }[]` |
| Form | Client | `webhookUrl: string` (submits JSON to webhook, no Nova backend) |

---

### W4 — Craft.js Fork Re-evaluation

Evaluate whether a shallow hook (override `getRandomNodeId` at call sites) avoids a full fork. Reference: `reference/craft.js` — `createNode.ts` accepts `newNode.id`. If a hook suffices, `toNovaId()` in `nodesToSchema.ts` becomes the permanent solution with zero maintenance cost. If a fork is needed, create `packages/craft` and track diffs in `UPSTREAM_DIFF.md`.

Output: a closed ADR-012 with the decision and rationale.

---

### W5 — UX Overhaul: Canva-Style Sidebar + Layers-First Editing

**Problem:** Switching between Blocks → Layers → Properties tabs breaks flow. The current tab system forces users to compete for the same panel space. Canva's approach: each major tool section is always one click away on a permanent icon rail.

**Full UX spec:** See `doc/ux-design.md` §1–§3 for diagrams and rationale.

#### Left panel: icon rail + expandable sections

Replace the current `Layers | Blocks` tab system with a vertical icon rail (60px) + expandable section panel (260px):

| Icon | Section | Content |
|------|---------|---------|
| 🗂 | **Layers** | Element tree; right-click context menu; keyboard nav |
| 🧱 | **Blocks** | Block picker (search + grid of icons); drag or click-to-add |
| 🤖 | **AI** | Chat input + patch history (moves from wherever it currently is) |
| 🎨 | **Templates** | Template list/browser; one-click apply |
| 📄 | **Pages** | Multi-page management (moves from top of left panel) |

Click an icon → 260px panel opens. Click active icon again → panel closes (full canvas width). Keyboard: `1`–`5` jump to sections, `Escape` closes panel.

#### Layers panel — right-click context menu

```
Add block above
Add block below  ▶
──────────────────
Duplicate   Ctrl+D
Delete      Del
──────────────────
Move up
Move down
──────────────────
Rename
```

"Add block above/below" opens the **inline block picker** (280px searchable popover, not a panel).

Keyboard shortcuts when layer item is focused: `Del` delete, `Ctrl+D` duplicate, `Enter` select on canvas, `Alt+↑↓` reorder.

#### Canvas empty-state (Canva-inspired)

Centered `+` button → "Add your first block" → opens Blocks section. No panel required.

Canvas right-click (not on a block) → "Add block here" → opens Blocks section.

#### Panel collapse

- Left rail always visible (60px minimum). Panel open/close: click icon or `Ctrl+\`.
- Right panel: `◀` handle → collapse to 16px. `Ctrl+Shift+\` toggle.

#### Canvas scroll fixes

- Vertical: `padding-bottom: 6rem` on `.nova-canvas-page`.
- Horizontal: `padding-left: var(--left-panel-w, 320px)` on `.nova-canvas-scroll`. When left panel closes, `--left-panel-w` → `60px`. Left boundary always anchors to panel right edge.

---

### W6 — Cross-Page Linking

Button and Navbar blocks gain `href?: string`. When editing `href`, show a dropdown of existing page routes from the project schema alongside a free-text input for external URLs. Renderer emits `<Link href="...">` for internal routes (starts with `/`), `<a target="_blank">` for external.

---

### W7 — Design Token Schema (foundation for v1.3)

**Schema change (v1.1 → v1.2 migration):**
```typescript
// ProjectSchema gains:
theme?: {
  colors?: Record<string, string>;     // { primary: "#7c3aed", secondary: "#10b981" }
  fontFamily?: { sans?: string; serif?: string };
  spacing?: Record<string, string>;    // { xs: "4px", sm: "8px", md: "16px" }
}
```

**Studio UI:** The 📄 Pages section in the sidebar (see W5) gets a `[Pages] [Theme]` segmented control at the top. The Theme tab shows:

```
── Colors ────────────────────────────
● primary   #7c3aed  [color swatch]  ✕
● secondary #10b981  [color swatch]  ✕
                              [+ Add color]

── Fonts ─────────────────────────────
sans  [Inter______________ ▾]
serif [Georgia____________ ▾]
mono  [JetBrains Mono_____ ▾]

── Spacing scale ─────────────────────
xs  [ 4 ] px
sm  [ 8 ] px
md  [16 ] px
lg  [24 ] px
xl  [48 ] px
```

**Color token interaction:**
- Each row: 16px colored circle (click → opens inline color picker with `<input type="color">` + hex text), token name (click → editable inline), delete button
- `+ Add color` → new row with default name `color1` and color `#6366f1`, immediately in edit mode
- Token names: kebab-case, lowercase only, 1–32 chars (validated inline)
- Default project tokens (auto-added for new projects in `defaults.ts`): `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `muted`

**Font selector:** plain text input (Google Font name or CSS system font). v1.3 will add the Google Fonts picker. For now, user types `Inter` or `Georgia` — the renderer will include a `<link>` tag for Google Fonts if the name matches a known font.

**Changes to `defaults.ts`:** Add default `theme` to the project defaults so new projects start with sensible tokens.

**The two-layer design (see `doc/ux-design.md` §4 for full rationale):**

Design tokens and `classOverrides` are **different concerns at different scales** — do not merge them in v1.2:
- `project.theme` = PROJECT-level vocabulary (what colors/fonts exist in this brand)
- `element.classOverrides` = ELEMENT-level application (what Tailwind classes this specific button uses)

The style panel (v1.3) bridges them: color swatches are populated from `project.theme.colors` (named tokens appear first); users can also use any standard Tailwind class.

**What is NOT done here (deferred to v1.3):**
- `tailwind.config.js` emit — deferred because it needs to know which token names are actually referenced in `classOverrides` to avoid dead entries. That information only exists after the v1.3 style panel ships.
- Per-element `classOverrides` (v1.3 W8)

**References to request from user:** webstudio repo — design-token schema design patterns.

---

### W8 — Setup Guides

Add `doc/setup/` directory with focused guides. The goal is that a non-technical user in any country can follow these from scratch.

**`doc/setup/environment.md`** — complete `.env.local` walkthrough with exactly where to find each value:
- Supabase: Dashboard → Settings → API → Project URL + service_role key
- GitHub OAuth: github.com/settings/developers → New OAuth App → callback URL
- Cloudflare R2: Dashboard → R2 → Create bucket → API tokens → public URL
- Store (Lemon Squeezy or other): see Store section below

**`doc/setup/database.md`** — step-by-step SQL migration with screenshots of Supabase SQL Editor. Mentions `/api/setup-check` for verification.

**`doc/setup/store.md`** — unified payments and store setup:
- Lemon Squeezy (recommended for international): create store, create product, get checkout URL for `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL`
- Vietnam / non-Western users: QR banking (VietQR / Momo / ZaloPay) is more common than Visa. Use the manual upgrade path: set up `POST /api/admin/upgrade?userId=&secret=ADMIN_SECRET`, then customers send payment via bank transfer and email/Zalo to confirm. Include a QR generator tool link.
- Note: when volume justifies it, add Stripe + VNPay/Momo integration

**`doc/setup/cloudflare-r2.md`** — create bucket, enable public access, create API token with Object Read/Write, get public URL. Includes cost comparison vs Supabase Storage (why R2 is chosen).

---

### Tech Debt Fixes

| Debt | Fix |
|------|-----|
| TD-005: `alert/confirm` in publish | Replace with `<Toast>` component in uiStore — no new library, just a state slot + fixed overlay |
| TD-004: Supabase top-level init | Wrap `createClient` in a lazy getter; throw a clear error if env missing |
| TD-009: Block authoring constraint | `doc/setup/block-authoring.md` — single root element requirement, `"use client"` policy |

---

## 4. Version roadmap (updated)

| Version | Theme | Key additions |
|---------|-------|---------------|
| **v1.1** | Editor GA | Best-in-class canvas, multi-page, SEO, templates, deploy |
| **v1.2** | Content + hardening | R2 images, E2E, more blocks, Layers-first UX, cross-page links, design tokens |
| **v1.3** | Visual style editor | Per-element Tailwind class overrides, Style panel using v1.2 tokens, tailwind.config.js emit |
| **v1.4** | Layout editor | Flexbox/grid visual controls. Hardest part: canvas layout ↔ layers panel sync invariant — moving a block on canvas must equal moving it in the tree. See `doc/ux-design.md` §7. |
| **v2.0** | Template marketplace | Canva-style gallery, discovery, monetization |

---

## 5. Exit Criteria

- Image upload to R2 works end-to-end: file → upload → CDN URL → canvas → publish → `.tsx`
- `pnpm e2e` green in CI on the critical-path spec
- Left panel has Canva-style icon rail; 🗂 Layers / 🧱 Blocks / 🤖 AI / 🎨 Templates / 📄 Pages all accessible without tab switching
- Layers right-click context menu works for insert/duplicate/delete/move/rename
- Empty canvas has a "+" button that opens the Blocks section
- At least 3 new blocks (FAQ + 2 others) with full settings panels
- Design token schema in place; Theme UI in studio
- Cross-page `href` works in Button + Navbar
- `window.alert/confirm` replaced in publish flow
- All 247+ unit tests still pass; new tests for R2 upload and theme schema migration
- Vietnam payment guide documented in `doc/setup/payments.md`

---

## 6. References to Request from User Before Starting

1. **BuilderIO/mitosis** — for clean next/image JSX generation (W1 renderer changes)
2. **webstudio repo** — for design-token schema design patterns (W7)
3. Craft.js already at `reference/craft.js` (W4)
