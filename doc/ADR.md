# Nova Builder — Architecture Decision Log

> This file covers **`apps/nova-builder/`** (the active system, v7.0.0+).
>
> Legacy ADRs (ADR-001 through ADR-043) that governed `apps/studio` (Craft.js system, retired) are
> archived at [`doc/archive/`](archive/) — see the collapsed section at the bottom of this file.
>
> **Status legend:** ✅ Active · ⚠️ Partially superseded · 🔄 In progress

---

## Nova-builder decisions (ADR-NB-001 → …)

### ADR-NB-025 — Realtime co-editing = immerhin transaction patches broadcast over Supabase Realtime (no Yjs, no relay)
**Status:** ✅ Accepted 2026-07-13 (v25.0.0, M12) — final Tier P phase; **completes** the ADR-NB-019 plan (point 4) and extends ADR-NB-009

**Decision:** Live document co-editing reuses the write path Nova already has. Every mutation flows through one immerhin transaction (ADR-NB-019 / M1), and each transaction is a set of per-namespace **immer patches**. `lib/coedit.ts` subscribes to `serverSyncStore` and broadcasts each local transaction (`{ transactionId, changes }`) over a Supabase Realtime **broadcast** channel (`project-doc:<id>`), sibling to the presence channel (ADR-NB-009). Inbound peer transactions are applied with `serverSyncStore.addTransaction(id, changes, "remote")`, which runs the patches against the atoms (so the canvas repaints) and pushes onto the local undo stack. The `"remote"` source tag does double duty: the outbound subscriber filters it out (no echo), and it is unavailable for re-broadcast. **No Yjs, no CRDT, no relay microservice** — the transport is the existing Realtime channel, the merge model is last-writer-wins per transaction (acceptable for a small-team builder; conflicting edits to the same field converge to the last patch received).

**Save ownership:** immerhin enqueues *every* transaction to the save queue regardless of source, so without a guard each receiving peer would also persist patches it merely observed — causing redundant `POST /patch` writes and optimistic-concurrency 409s. `saveQueue.markRemoteTransaction(id)` records applied remote ids and the flush drops them: **only the originating editor persists its own patches** (ADR-NB-019 p2 optimistic concurrency stays correct with multiple editors).

**Remote selection:** presence (already broadcasting cursors) also carries each editor's `selectedInstanceId`; `RemoteSelections` queries the canvas iframe (`[data-ws-id="…"]`) for that element and draws a colored, name-labeled outline in the builder overlay — same iframe→builder coordinate mapping as remote cursors (ADR-NB-018 keeps the overlay in the builder, not the iframe).

**Why:** ADR-NB-019 already committed to "multiplayer = the same transaction patches broadcast over Supabase Realtime; no Yjs, no relay." The transaction stream, the undo unit and the save payload are the *same object*, so co-editing is a broadcast + apply of that object — the minimal design, zero new infrastructure, and it keeps `/canvas` public (ADR-NB-003), the AI credit gate (ADR-NB-005) and OpenNext/`build:cf` untouched.

**Where:** `lib/coedit.ts`, `lib/saveQueue.ts` (remote-id filter), `lib/presence.ts` (selection broadcast + `getRealtimeClient`), `builder/PresenceLayer.tsx` (`RemoteSelections`, co-edit lifecycle in `usePresence`), `app/builder/[projectId]/page.tsx`.

### ADR-NB-024 — One bundle format (NovaBundle = WebstudioFragment) for file I/O and the community marketplace
**Status:** ✅ Accepted 2026-07-13 (v24.1.0, M11)

**Decision:** Every transferrable unit of Nova content — export-to-file, import-from-file, publish-to-marketplace, install-from-marketplace — uses a single format, `NovaBundle` (`lib/protocol/bundle.ts`). It is a normalized **WebstudioFragment** (arrays of `children` / `instances` / `props` / `styles` / `styleSources` / `styleSourceSelections` / `dataSources` / `resources` / `breakpoints` / `assets`) plus a small `meta` block, tagged with `__nova_bundle__: 1` for validation/versioning. This mirrors upstream `webstudioFragment` so the format stays diffable against Webstudio (ADR-NB-007) and any of the four flows reuses the same `buildBundle` / `insertBundle` pair — no per-flow serializers. `insertBundle` re-mints all ids (independent repeated inserts) and runs the M5 content-model guard (ADR-NB-022) against the target parent, so a marketplace install cannot corrupt the document.

**Marketplace storage:** items live in `marketplace_items` (migration `0021`) with the bundle as `jsonb`; browsing is **public** (so users can preview before installing) while publishing/deletion are author-scoped. Install increments a counter and returns the bundle, which the panel feeds straight into `insertBundle`. No new dependency — file I/O uses `Blob`/`URL.createObjectURL`; there is no ZIP/archive format (a bundle is a single JSON document).

**Why:** The pre-M11 marketplace was built-in templates only, with no way to share content or move it between projects. Collapsing all four transfer flows onto one fragment format (instead of separate template/export/marketplace schemas) is the minimal design that satisfies the parity gap and keeps the guard + id-remint logic in one place.

**Where:** `lib/protocol/bundle.ts`, `lib/protocol/bundleFile.ts`, `lib/protocol/marketplaceClient.ts`, `builder/left-sidebar/marketplace/index.tsx`, `app/api/marketplace/route.ts` (+ `/[itemId]`), `supabase/migrations/0021_marketplace.sql`.

### ADR-NB-023 — Publish codegen reuses the canvas css-engine headlessly instead of porting project-build/template
**Status:** ✅ Accepted 2026-07-13 (v24.0.0, M9)

**Decision:** Full-fidelity export (WS-PARITY-AUDIT #6) is produced by running the **same** css-engine the canvas uses (`@webstudio-is/css-engine` `createRegularStyleSheet` + `addMediaRule`/`addMixinRule`/`applyMixins`) in a headless, server-side module (`lib/publish/cssGen.ts`) and reading `.cssText` — no DOM, no `render()`. This gives byte-for-byte parity between what the canvas paints and what ships: @media rules per breakpoint, pseudo-state selectors, and source-order cascade — replacing the old exporters that kept only base-breakpoint, no-state declarations. Bound props are baked to literals via the M4 evaluator (`lib/publish/expressionGen.ts`). Webstudio's `project-build` + `template` codegen packages were **not** ported: they target a Remix/SDK-CLI runtime and would duplicate style logic Nova already has correct in the css-engine. The HTML export carries `data-ws-id` / `data-ws-component` so the generated selectors match; React export injects the real stylesheet rather than attempting an (impossible) arbitrary-CSS→Tailwind reverse-map.

**Delivery layer unchanged:** deploy targets (`/api/projects/[id]/deploy` → vercel/netlify/cloudflare via `@studio/deploy`) and the custom-domain CNAME flow (`/api/projects/[id]/domains` — add / verify TXT / SSL status / delete, owner-scoped per ADR-NB-015) already existed from P37–43 / P41 and remain the publish delivery surface; M9 only replaced the codegen fidelity feeding them.

**Server-boundary note:** the codegen must run in a Next.js **server** route, so it redeclares the stable `data-ws-*` attribute names as local constants instead of importing them from `@webstudio-is/react-sdk` (a `"use client"` barrel that pulls in `createContext`, which fails a server route and `build:cf`). The css-engine itself is DOM-free (only `render()` touches the DOM, and codegen reads `.cssText` instead).

**Why:** Audit #6 proved the exporters silently dropped responsive styles, states, cascade and expressions. Reusing the canvas engine is the minimal correct fix with zero new dependencies (bundle/`build:cf` safe) and guarantees export ≡ canvas.

**Where:** `lib/publish/cssGen.ts`, `lib/publish/expressionGen.ts`, `lib/publish/metas.ts`, `lib/htmlExporter.ts`, `lib/reactExporter.ts`, `app/api/export/[projectId]/route.ts` (+ `/react`).

### ADR-NB-022 — Content-model enforcement is a Nova-native component/tag guard, not the Webstudio html-data port
**Status:** ✅ Accepted 2026-07-13 (v23.1.0, M5)

**Decision:** Nesting validation (WS-PARITY-AUDIT #9) is implemented in `lib/nestingGuard.ts` as a pragmatic, dependency-free guard rather than porting Webstudio's `shared/content-model.ts` + `shared/matcher.ts`. Those rely on `@webstudio-is/html-data` (full per-tag HTML category tables) and a `contentModel` field on every component meta — neither of which Nova's simplified metas carry. The guard blocks the three nesting mistakes that actually corrupt a document: children under a text-only component, interactive-inside-interactive (`a > button`, `button > input`), and form-inside-form. It runs on **all three insertion paths** — DnD reparent (`treeMove.applyReparent` returns `null`), paste (`edit-operations.pasteInstance` returns a `violation`, no mutation), and AI-apply (`applyWSComposition`, non-blocking warn so AI output is never silently dropped). Blocked insertions surface through the `$nestingWarning` atom + `NestingToast`.

**Resources runtime:** Resource data is fetched **server-side** via `POST /api/projects/[projectId]/resources` (owner-scoped, ADR-NB-015; 10s timeout) — not from the browser — to avoid CORS and keep request headers/secrets off the client. Loaded values land in `$resourceValues` keyed by the resource data-source id; the canvas merges them into the expression scope (ADR-NB-021) so a prop bound to a resource variable paints the response. **Collection item scope** uses a React context (`ItemScopeContext`) that RepeatList populates per iteration; `webstudio-component` reads it and passes it to `evaluateExpression` as injected values — no per-index prop rewriting.

**Why:** Capability parity (prevent invalid documents; run resources; scope collection items) without dragging in html-data (bundle weight + the `build:cf` trap) or a schema change to add `contentModel` to every meta. If richer HTML validation is needed later, the guard's maps are the single extension point (OCP).

**Where:** `lib/nestingGuard.ts`, `lib/treeMove.ts`, `lib/edit-operations.ts`, `lib/applyWSComposition.ts`, `builder/NestingToast.tsx`, `canvas/slot.tsx`, `canvas/repeat-list.tsx`, `canvas/itemScope.ts`, `lib/resourceLoader.ts`, `app/api/projects/[projectId]/resources/route.ts`.

### ADR-NB-021 — Data binding uses the SDK expression toolkit; props store encoded expressions; canvas evaluates against `$dataSources`
**Status:** ✅ Accepted 2026-07-13 (v23.0.0, M4)

**Decision:** A bound prop is persisted as `Prop { type: "expression", value }` where `value` is the SDK-encoded expression string (variables referenced as `$ws$dataSource$<id>`, per `encodeDataVariableId`). Nova does **not** re-implement any parser: `lib/expression.ts` composes the SDK primitives (`createScope`, `generateExpression`, `transpileExpression`, `lintExpression`, `getExpressionIdentifiers`, `encode/decodeDataVariableId`) exported from `@webstudio-is/sdk` (ws-sdk). The canvas evaluates each bound prop at render time in `getInstancePropsObject` by (1) building a variable-value scope from the current `$dataSources`, (2) transpiling the encoded expression to executable JS with optional-chaining, (3) running it in a `new Function(...names)(...values)` sandbox that **never throws** (returns `undefined` on any error, matching Webstudio's optional-chaining posture). `parameter` props resolve directly to their variable's value.

**Editor form vs storage form:** the `ExpressionEditor` edits the *human* expression (variable **names**); `encodeExpression`/`decodeExpression` convert to/from the stored encoded form on commit/open. This keeps names refactor-safe (storage keys on stable ids) while the UI stays readable — no CodeMirror dependency was added (would bloat the OpenNext/Workers bundle, CLAUDE.md `build:cf` trap); the SDK `lintExpression` supplies the same diagnostics a CodeMirror linter would.

**Cleanup + integrity:** deleting a variable detaches every prop that references it (`deleteVariable` scans `$props`); `unbindProp` reverts a prop to unset; `countVariableUsage` powers the usage badge. All mutations flow through `updateData` (ADR-NB-019) so bindings are undoable, synced to the canvas, and saved as patches.

**Stubs note (ADR-NB-007 / stubs gotcha):** `@webstudio-is/sdk` resolves to `src/stubs/webstudio-sdk.d.ts` for `tsc` (the package ships no built `.d.ts`; only the `webstudio` runtime condition resolves `src/`). M4 tightened the stub's `DataSource`/`Resource` from `any` to real discriminated unions and declared the expression toolkit signatures. The runtime implementations come from the real package and are validated by `build:cf`.

**Why:** Audit #4 (WS-PARITY-AUDIT) — binding was CRUD-only (variables/resources could be created but never *used*: no expression evaluation on canvas, no way to attach a variable to a prop). This closes the gap with capability parity, reusing the SDK the repo already vendors rather than porting Webstudio's builder `data-variables`/`binding-popover`/`expression-editor` React tree verbatim.

**Where:** `lib/expression.ts`, `lib/dataBinding.ts` (bind/unbind/usage), `canvas/webstudio-component.tsx` (eval), `builder/BindingPopover.tsx`, `builder/ExpressionEditor.tsx`, `builder/PropsEditorPanel.tsx` (`PropRow`), `src/stubs/webstudio-sdk.d.ts`.

### ADR-NB-020 — Visual adaptation rule: Webstudio layout structure, Nova elder-first skin
**Status:** ✅ Accepted 2026-07-12 (v19.2.3, WS-PARITY-AUDIT); implementation MV1/MV2

**Decision:** Builder chrome adopts Webstudio's **layout structure, information hierarchy and interaction patterns** (workspace grid, panel scroll containment, shared typed value controls — unit input, toggle group, color control, collapsible section) but is styled exclusively with Nova's elder-first tokens from `uiTheme.ts` (ADR-NB-012). `@webstudio-is/design-system` CSS/theme is **not** imported into builder chrome; its component *patterns* are re-implemented on Nova tokens. The `solid:audit` script gains a check that flags any builder file declaring a local palette object (audit found 49/56 files with `const C = {…}` vs 3 importing `uiTheme.ts` — ADR-NB-012 was documented but unenforced).

**Why:** The user requires Webstudio's layout/design quality without a verbatim copy, on an elder-first, commercial-friendly skin. The 2026-07-12 audit (`doc/WS-PARITY-AUDIT.md` §8b) found the current chrome broken (clipped right-panel tab strip, clipped state pills, invisible canvas content, sub-44px touch targets) and off-standard (0 files on the design system, ADR-NB-012 adoption at 5 %).

**Where:** `doc/WS-PARITY-AUDIT.md` §8b (broken-layout register V-1…V-8 + screenshots in `test-results/ws-audit/`), ROADMAP Tier P phases MV1/MV2, `scripts/solid-audit.mjs` (new check).

### ADR-NB-019 — Patch-based persistence + transaction-based history on the Nova stack
**Status:** ✅ Accepted 2026-07-12 (v19.2.3); **p1 IMPLEMENTED v21.0.0 (M1)** — `lib/transactions.ts` + `builder/commands.ts`; **p2 IMPLEMENTED v22.0.0 (M2)** — `lib/saveQueue.ts` + `/api/projects/[id]/patch` + migration 0020 (`version` column; ⚠️ apply to DB — degraded unguarded mode until then); **p4 (Realtime patch broadcast) IMPLEMENTED v25.0.0 (M12)** — see ADR-NB-025. Plan fully realized.

**Decision:** Keep the Nova backend (Supabase + NextAuth + REST — ADR-NB-002 is **amended**, not replaced) and adopt Webstudio's *client* data architecture:
1. **Every document mutation flows through `serverSyncStore.createTransaction` (immerhin)** — no direct `.set()` on the ten data atoms. Transactions are simultaneously the sync currency (leader→follower), the undo unit, and the save payload.
2. **Undo/redo = transaction revert** — supersedes ADR-NB-006's 5-atom snapshot stack (which the audit proved inconsistent: pages/breakpoints/dataSources/resources/assets mutate under `captureSnapshot()` but are not in the snapshot).
3. **Save = JSON patches + optimistic concurrency** — `PATCH /api/projects/[id]/patch` applies transaction patches server-side against a `version` column; a stale tab gets 409 instead of silently clobbering (replaces full-document JSONB PUT).
4. **Multiplayer document sync (M12) = the same transaction patches broadcast over the existing Supabase Realtime channel** — extends ADR-NB-009; no Yjs, no relay service.

**Why:** The audit proved the status quo is not a working baseline: mutations bypass immerhin so the canvas **never receives builder edits after initial load** (`ImmerhinSyncObject` subscribes only to store transactions — `lib/sync-client.ts:105`; `createTransaction` has zero callers), and snapshot undo restores inconsistent halves. Webstudio's full backend (tRPC/Prisma/Yjs relay) was evaluated and rejected (WS-PARITY-AUDIT §9 matrix): a two-framework rewrite that orphans auth/billing/i18n/teams and the OpenNext/Workers deploy story, buying nothing the hybrid doesn't.

**Supersedes/amends:** ADR-NB-006 (superseded, effective M1) · ADR-NB-002 (amended: backend unchanged, save/sync protocol replaced) · ADR-NB-009 (extended at M12).

**Where (planned):** `lib/sync-stores.ts` (transaction discipline), `lib/history.ts` (replaced), ~10 write-path modules (styleInspectorWrite, styleWriteHelper, StyleAddProperty, edit-operations callers, treeMove appliers, dataBinding, symbols, applyWSComposition, pages CRUD, BreakpointManager), new patch route + migration (`version` column).

### ADR-NB-018 — Canvas direct-manipulation overlay lives in the iframe; writes go through the builder
**Status:** ✅ Active since v19.0.0

**Decision:** The selection overlay + resize handles ([canvas/SelectionOverlay.tsx](../apps/nova-builder/src/canvas/SelectionOverlay.tsx)) render **inside** the `/canvas` iframe, in the same coordinate space as the elements. Interactions never mutate atoms locally — the canvas is a SyncClient **follower**, so it `postMessage`s intent (`nova:resizeCommit`) to the builder (the write **leader**), which applies it via the existing `writeStyle` path. Resize uses a **preview box** during the drag (the element is untouched until release) to avoid inline-style flicker and the atom→sync→re-render round-trip per frame. Geometry is isolated in a pure module ([canvas/resizeMath.ts](../apps/nova-builder/src/canvas/resizeMath.ts)).

**Why:** the iframe already owns element coordinates, so an in-iframe overlay needs no zoom/offset math and the browser maps scaled mouse deltas correctly. Keeping all writes in the builder preserves the single write-path (undo/redo, breakpoint/state targeting, style-source cascade) rather than duplicating it in the canvas.

**Extension (v19.1.0 — drag-reparent):** the same pattern carries the drag-reparent move. `canvas/dragReparent.ts` resolves the drop intent in the iframe (`elementFromPoint` + above/below/into ratio) and `postMessage`s `nova:reparent`; the builder applies it via the shared pure `lib/treeMove.applyReparent` — the identical reindex logic the navigator DnD uses, so tree mutation lives in exactly one module (SOLID D). The canvas never mutates `$instances` itself.

### ADR-NB-017 — Password reset uses hashed single-use tokens; an explicit locale beats IP detection
**Status:** ✅ Active since v18.8.0

**Decision (reset):** Password reset issues a random 32-byte token, emails only the raw token in the link, and stores only its SHA-256 hash (`password_reset_tokens`, migration `0003`) with a 1-hour expiry. Tokens are single-use (deleted on success) and a new request clears older tokens for the user. `POST /api/auth/forgot-password` always returns `{ ok: true }` for a well-formed email — success and "no such account" are indistinguishable — and swallows infra errors so the response never leaks account existence.

**Decision (locale precedence):** The client i18n provider treats an explicit stored locale (the `nova_locale` cookie or localStorage) as authoritative; IP auto-detect only applies when there is no stored choice. `getStoredLocale()` reads the cookie as well as localStorage so client-rendered content agrees with the cookie-driven `<html lang>` (ADR-NB-016).

**Extension (v19.2.0 — email verification):** email signup issues a hashed single-use verification token (`email_verification_tokens`, migration 0004) and emails the link, using the identical design as password reset. Verification is **soft** — the `users.email_verified` flag is set on confirm but login is not blocked (avoids locking users out where email delivery isn't configured); the flag exists to gate sensitive actions later. Sending is best-effort and never blocks signup.

**Why:** FA-005 — the `/privacy` page promised reset emails that didn't exist; hashed single-use tokens + no-enumeration responses are the standard safe design. D10 — auto-detect (on by default) previously overrode a user's manual language choice on every load, which is the opposite of the intended "manual overrides detection" rule.

### ADR-NB-015 — Every owner-scoped `[projectId]` route verifies ownership + entitlement server-side
**Status:** ✅ Active since v18.7.0

**Decision:** Ownership and entitlement are enforced in the route handler, never assumed from "is anyone logged in." Owner-scoped routes call `ownsProject(projectId, userId)` ([lib/projectOwnership.ts](../apps/nova-builder/src/lib/projectOwnership.ts)) and return 404 on mismatch; paid features call `getUserEntitlements(userId)` ([lib/userTier.ts](../apps/nova-builder/src/lib/userTier.ts)) and return **402** with `{ upgrade: true }` when the tier lacks the capability. The tier→capability mapping stays in `tiers.ts` (`entitlements()`); the guards only resolve identity/tier. Public unauthenticated POSTs (`/api/submissions`, `/api/analytics/track`) pass through `rateLimit()` ([lib/rateLimit.ts](../apps/nova-builder/src/lib/rateLimit.ts)) before any DB work.

**Why:** the FA-v1 audit found deploy (no ownership, no entitlement), HTML/React export (no entitlement), and activity/comments (no ownership → cross-tenant IDOR) all trusting session presence alone. Centralizing the checks in three single-responsibility helpers means a new route adds one line, and the contract can't drift per-route.

**Where:** deploy, export (html+react), projects POST, activity, comments routes; PayOS webhook idempotency via `processed_payments` (migration `0002`).

### ADR-NB-016 — Root layout is dynamic so `<html lang>` tracks locale
**Status:** ✅ Active since v18.7.0

**Decision:** The root layout reads the `nova_locale` cookie via `next/headers` `cookies()` and sets `<html lang>` accordingly (`vi`/`en`). This opts the app tree into per-request (dynamic) rendering, trading static generation of the public funnel for a server-correct `lang` attribute.

**Why:** FA-I03 — a hardcoded `lang="en"` makes screen readers mispronounce Vietnamese content and misleads crawlers. Correct SSR `lang` requires reading the request cookie in the server layout; there is no per-request `<html>` attribute without dynamic rendering. The funnel pages are tiny and run on Workers (edge), so the cost is acceptable; revisit if funnel TTFB regresses.

### ADR-NB-014 — Test toolchain pinned to upstream Webstudio resolution behavior
**Status:** ✅ Active since v18.6.1

**Decision:** (1) A root `vitest.config.ts` adds the `webstudio` custom condition to `resolve.conditions` / `ssr.resolve.conditions` so cross-package test imports resolve `src/` entries without building `lib/`; ws-packages that need it re-export this config (`export { default } from "../../vitest.config"`). Condition lists are inlined (not imported from `vite`) because `vite` is not resolvable from package dirs under pnpm strict node_modules. (2) `css-tree` is pinned **exactly** to `3.1.0` in `ws-css-data` — upstream's grammar code references `<font-variant-css21>`, which later css-tree/mdn-data releases removed; caret drift to 3.2.x breaks 56 grammar tests. Any css-tree upgrade must go through the upstream Webstudio lockfile.

**Why:** `packages/ws-*` are verbatim internal copies of Webstudio packages (ADR-NB-007); their tests assume the upstream monorepo's resolution environment. Recreating that environment at the root — instead of patching individual test files — keeps the copies diffable against `reference/webstudio`.

### ADR-NB-013 — SOLID Internationalization & IP Auto-Detection System
**Status:** ✅ Active since v18.5.0

**Decision:** Implement i18n localization (`en`, `vi`) using a strictly segregated SOLID architecture under `src/lib/i18n/` (`types.ts` for interfaces, `dictionaries.ts` for translation catalogs, `detector.ts` for storage/IP rules, `context.tsx` for React state hooks). Guests and users default to IP-based country auto-detection (`VN` → `vi`) via `/api/i18n/detect`, with manual preference storage stored in `localStorage` and `document.cookie`.

**Why:** Decouples UI translation lookups from locale detection and state management. Adheres to Open/Closed Principle so adding future locales requires only extending `DICTIONARIES` without altering hooks or component rendering logic.

### ADR-NB-001 — WebstudioData is the canonical document model
**Status:** ✅ Active since v7.0.0

**Decision:** Replace Nova's recursive `Element[]` schema with Webstudio's normalized Maps:
`$instances`, `$props`, `$styles`, `$styleSources`, `$styleSourceSelections`, `$breakpoints`,
`$pages`, `$assets` (all `Map<id, entity>`). Supabase stores the full set as JSONB under
`schema_json → { schemaVersion: "5.0", data: WebstudioData }`.

**Why:** O(1) lookup by id (was O(n) tree walk); structural breakpoints as first-class entities;
typed `StyleDecl` enables cascade, tokens, and AI-readable style schema; the data model is the
foundation for every inspector, AI, and undo feature.

**Where:** `apps/nova-builder/src/lib/data-stores.ts` (`$instances` … `$assets` nanostores atoms),
`lib/schema.ts` (`deserializeWebstudioData` / `serializeWebstudioData`),
`app/api/projects/[projectId]/route.ts` (PATCH stores serialized Maps).

---

### ADR-NB-002 — Nova backend retained; no Webstudio backend adopted
**Status:** ✅ Active since v7.0.0 · ⚠️ Amended by ADR-NB-019 (v19.2.3): backend stack unchanged, but the document save/sync protocol moves to transaction patches + optimistic concurrency

**Decision:** Supabase (PostgreSQL), NextAuth.js JWT sessions, Lemon Squeezy + PayOS billing, REST
API routes — all carried over unchanged from `apps/studio`. **None** of Webstudio's backend
(Prisma, tRPC, multiplayer relay) is used.

**Why:** Nova's backend was already Next.js-native and fully working. Adopting Webstudio's backend
would mean two simultaneous migrations (canvas + backend) with no user-visible benefit. Supabase is
production-grade and already integrated with billing and auth.

**Where:** `apps/nova-builder/src/lib/supabase-server.ts`, `src/lib/auth.ts`,
`app/api/projects/`, `app/api/ai/`, `app/api/auth/`.

---

### ADR-NB-003 — Canvas route is permanently public (no auth redirect)
**Status:** ✅ Active since v7.0.0

**Decision:** `app/canvas/page.tsx` MUST NOT redirect to login. The builder embeds it as an
`<iframe src="/canvas">` — the iframe loads without an HTTP session; project data arrives via
`window.__webstudioSharedSyncEmitter__` only. Next.js middleware explicitly whitelists `/canvas`.

**Why:** If the canvas page redirects, the iframe receives the login HTML, not the canvas app —
the builder breaks silently (no error thrown). This was the single hardest-to-debug failure mode
identified during Phase 2 planning.

**Where:** `apps/nova-builder/src/middleware.ts` (public path whitelist),
`app/canvas/page.tsx` (no `getServerSession` guard).

---

### ADR-NB-004 — nanostores atoms are the state layer; SyncClient bridges the iframe
**Status:** ✅ Active since v7.0.0

**Decision:** All WebstudioData state lives in nanostores atoms (`$instances`, `$props`, etc.) in
`lib/data-stores.ts`. The builder creates a `SyncClient(role:"leader")`; on iframe load it injects
the emitter into `iframe.contentWindow.__webstudioSharedSyncEmitter__`. The canvas creates a
`SyncClient(role:"follower")` and subscribes to the same atoms. Any atom mutation in the builder
automatically syncs to the canvas.

**Why:** nanostores is framework-agnostic and designed for this cross-context pattern. Atoms give
fine-grained reactivity — only the component that subscribes to a changed atom re-renders.
Zustand is used only for Nova-specific UI chrome (AI panel state, toast notifications).

**Where:** `lib/nano-states.ts`, `lib/data-stores.ts`, `lib/sync-client.ts`.

---

### ADR-NB-005 — AI credits deducted only after valid WSCompositionResult
**Status:** ✅ Active since v7.0.0 (continuation of legacy ADR-006)

**Decision:** `POST /api/ai` deducts one credit **only after** `validateCompositionWS(result)` passes
(non-empty instances array, valid structure). An AI call that returns an empty or invalid composition
costs 0 credits. Daily + monthly cap logic unchanged from `apps/studio` (Lemon Squeezy / PayOS,
`packages/ai/src/agents/composerAgentWS.ts`).

**Why:** The original ADR-006 principle ("credit only after valid schema") carries over directly.
Only the validation target changes: `WSCompositionResult` instead of `Element[]`.

**Where:** `app/api/ai/route.ts` (deduct after `validateCompositionWS`),
`packages/ai/src/utils/validateCompositionWS.ts`.

---

### ADR-NB-006 — Undo/redo = shallow Map snapshot stack, not command-based
**Status:** ⛔ Superseded by ADR-NB-019 — **effective v21.0.0 (M1)**: snapshot stack replaced by immerhin transaction revert; `captureSnapshot` removed. (Audit finding: the snapshot covered 5 atoms while mutations touched 10 — undo restored inconsistent halves)

**Decision:** `lib/history.ts` maintains two stacks (`past[]` / `future[]`) of shallow-copied
`Map` snapshots of the 5 mutable data atoms (`$instances`, `$props`, `$styles`, `$styleSources`,
`$styleSourceSelections`). Max 50 entries. `captureSnapshot()` is called before every mutation.
`undo()` / `redo()` swap the current atom state with the stack.

**Why:** Full snapshot is simple, reliable, and correct. The v1 tradeoff — O(Map.size) memory per
step vs O(1) for inverse-command model — is acceptable at the project scales users create in a
no-code builder. Command-based inverse operations are deferred to v2.

**Where:** `apps/nova-builder/src/lib/history.ts`, wired in `StyleInspector.tsx`,
`SettingsPanel.tsx`, `left-sidebar/navigator/ContextMenu.tsx`,
`left-sidebar/navigator/useDnd.ts`, `left-sidebar/pages/usePageCrud.ts`,
`lib/applyWSComposition.ts`.

---

### ADR-NB-007 — @webstudio-is/* packages resolve from reference/ (Phase 12 pending)
**Status:** ✅ Resolved (verified v19.2.3, WS-PARITY-AUDIT): extraction to `packages/ws-*` is complete — `pnpm-workspace.yaml` includes only `apps/*` + `packages/*` ("reference/ no longer in workspace"); drift vs reference `65d8a16` is 3 files, reconciled in Tier P M0. The text below is historical

**Decision:** Currently all 13 `@webstudio-is/*` packages resolve from
`reference/webstudio/packages/*` via `pnpm-workspace.yaml` workspace aliasing.
Phase 10A (extraction to `packages/ws-*/`) is deferred to Phase 12.

**Why deferred:** The reference-checkout path works and `next.config.mjs` `transpilePackages`
handles it. Extracting all 13 packages is non-trivial and was deprioritized to keep Phase 10 scope
manageable (Projects CRUD + writable StyleInspector were the higher-priority deliverables).

**Risk:** `reference/` is a read-only checkout — packages cannot be patched. Any bug in Webstudio
SDK that affects nova-builder cannot be fixed until extraction completes.

**Where:** `pnpm-workspace.yaml` (`reference/webstudio/packages/*` include),
`apps/nova-builder/next.config.mjs` (`transpilePackages`).

---

### ADR-NB-008 — Canvas Body component renders as `<div>`, not `<body>`
**Status:** ✅ Active since v8.19.1

**Decision:** In `webstudio-component.tsx`, when `instance.component === "Body"`, the canvas
renderer substitutes the resolved `Body` React component (which forwards to a real `<body>` tag)
with `"div"`. All canvas attributes (`data-ws-id`, `data-ws-component`, `data-ws-selector`,
selection/hover outline data attributes) are preserved on the `<div>`.

**Why:** The Webstudio `Body` component (`packages/ws-components/src/body.tsx`) renders an actual
`<body>` HTML element. The canvas iframe page (`app/canvas/page.tsx`) lives inside Next.js's
`RootLayout`, which already emits `<html><body>`. Nesting a second `<body>` inside the layout's
`<body>` violates HTML rules and causes multiple React errors:
"In HTML, `<body>` cannot be a child of `<body>`" and
"You are mounting a new body component when a previous one has not first unmounted."

**Alternatives considered:**
- **Route group restructure** (`(main)/layout.tsx` with `<body>` + `(canvas)/layout.tsx` without)
  — would make the canvas layout own the real `<body>`, letting `Body` render natively. Deferred:
  requires moving files and all their imports, adding risk to a stable codebase.
- **Patching `ws-components/body.tsx`** to render `<div>` always — would break the production
  renderer/export which needs a real `<body>` tag in published pages.

**Where:** `apps/nova-builder/src/canvas/webstudio-component.tsx`
(`WebstudioComponentCanvas` + `WebstudioComponentPreview`, component resolution guard).

---

### ADR-NB-009 — Real-time multiplayer runs on Supabase Realtime, not a WS relay
**Status:** ✅ Active since v15.0.0 · Extended by ADR-NB-019: at Tier P M12 the same Realtime channel carries document transaction patches (co-editing), still no relay/Yjs

**Decision:** Live collaboration (presence, avatar stack, remote cursors) is built on
**Supabase Realtime channels** (`project:<projectId>`), not Webstudio's standalone multiplayer
relay microservice (WebSocket, port 1999). `lib/presence.ts` connects with the public anon key,
uses Realtime presence for the active-user roster and rAF-throttled broadcast for cursors, and
exposes a `$collaborators` atom. When `NEXT_PUBLIC_SUPABASE_ANON_KEY` is unset it degrades to a
silent single-player no-op.

**Why:** ADR-NB-002 keeps Nova's backend and adopts zero Webstudio backend infrastructure. Running
a separate relay process contradicts that and adds ops burden with no user-visible benefit over
Supabase Realtime, which is already part of the stack. Document editing still flows through the
singleplayer SyncClient (ADR-NB-004); presence is a parallel, additive channel — it does not carry
WebstudioData mutations, so there is no conflict-resolution requirement in v1.

**Where:** `apps/nova-builder/src/lib/presence.ts`, `src/builder/PresenceLayer.tsx`,
wired in `src/builder/Topbar.tsx` (avatars) and `app/builder/[projectId]/page.tsx` (cursors + `usePresence`).

---

### ADR-NB-012 — uiTheme.ts is the single source of UI design tokens
**Status:** ✅ Active since v18.1.0

**Decision:** All color, font-size, and touch-target constants live in `src/lib/uiTheme.ts` (FONT / DARK / LIGHT / TOUCH_TARGET). No component file may define its own palette inline. Builder files import `{ DARK as C, FONT }` to keep alias C and avoid JSX churn. Public (light-theme) pages import `{ LIGHT, FONT, TOUCH_TARGET }`.

**Why:** Audit of v18.0.0 found 62 files each defining a local `const C = {...}` with inconsistent `textMuted` opacity (~0.35–0.38, failing WCAG AA at ~3.1:1 contrast) and font sizes (10–11px, below readability floor). A single token module fixes the issue in one place and makes future global changes (e.g. brand colour pivot) a one-line edit.

**Constraints:** `solid:audit` check D1 treats `writeProperty` / `uid` in ≥2 files as BLOCKING. The same rule applies to the token module — any file that re-declares the DARK/LIGHT palette as a local object triggers a WARN in the audit script. `TOUCH_TARGET = 44` is the floor, not a default; smaller targets must be explicitly justified in the PR.

**Where:** `src/lib/uiTheme.ts`; consumed by TopbarActions, SubscriptionPage, and progressively all builder files.

---

### ADR-NB-013 — Public pages use LIGHT theme; builder uses DARK theme
**Status:** ✅ Active since v18.2.0

**Decision:** The app has two distinct visual contexts: (a) **public funnel** (/, /pricing, /terms, /privacy, /login, /signup) — always light background (`#ffffff`/`#f8fafc`), dark text (`#0f172a`), accent nova-600 (`#6d28d9`); (b) **builder** (all `/builder/*`, `/projects`, `/settings/*`, `/analytics/*`) — always dark background (`#0a0a14`), light text (`#e2e8f0`), accent `#7c3aed`.

**Why:** Elder-first audit showed the dark public funnel failed WCAG AA for low-opacity text (< 4.5:1) and imposed high cognitive load on first-time visitors. Dark UIs work in focused tools (like IDEs); light backgrounds reduce visual fatigue for newcomers on marketing pages. Keeping the builder dark is intentional — it matches professional design tool conventions (Figma, Framer, VS Code) and makes canvas content stand out.

**Constraints:** Never put a dark-background component inside the public funnel layout, or a light-background component inside the builder layout, without an explicit override. PublicNav + PublicFooter enforce the LIGHT palette. If A/B testing is needed, gate at the page level, not the component level.

**Where:** `src/components/public/` (PublicNav, PublicFooter, FormField) enforce LIGHT; `src/lib/uiTheme.ts` LIGHT/DARK constants are the source; `middleware.ts` PUBLIC_EXACT + PUBLIC_PREFIXES gate determines which context applies.

---

### ADR-NB-010 — Symbols are reusable subtree snapshots, resolved by fresh ids
**Status:** ✅ Active since v9.0.0

**Decision:** A "symbol" (nova-builder's Components/Symbols feature) is a self-contained snapshot of
a selected instance subtree — its instances, props, and base-breakpoint styles/sources/selections —
stored as plain records in `schema_json.symbols`. Instantiating a symbol remaps every id to a fresh
`uid` and inserts the copy under the current selection (or page root). There is no live master→instance
link in v1: each instantiation is an independent copy.

**Why:** This is the pragmatic synthesis of Nova's Phase-D `ComponentMaster`/`OverrideMap` design onto
WebstudioData. Storing masters as ordinary normalized records (Webstudio's approach) plus fresh-id
resolution at instantiate-time (Nova's stable-id design) gives collision-free repeat insertion with
zero schema additions. Live master overrides (edit-once-update-everywhere) are a v2 upgrade path.

**Where:** `apps/nova-builder/src/lib/symbols.ts` (`$symbols`, create/instantiate/delete),
`src/builder/left-sidebar/symbols/index.tsx`, persisted via the builder page's save/seed path.

---

### ADR-NB-011 — apps/studio and Craft-only packages fully retired (debt complete)
**Status:** ✅ Active since v17.0.0; **debt completed v17.2.0**

**Decision:** `apps/studio` (the legacy Craft.js editor), `packages/editor` (Craft adapter),
`packages/renderer` (Element[] codegen), and the `@craftjs/core` pnpm patch are **deleted**.
`packages/schema` and `packages/registry` are also now **deleted** (v17.2.0).

**Why:** nova-builder reached feature parity; the Craft system has no remaining consumers in the
active dependency chain. Removing it drops 316 transitive packages and eliminates the abandoned
`@craftjs/core` fork/patch.

**v17.2.0 debt completion:** Pruned the legacy Element[] patcher code from `packages/ai/src`
(`patcherAgent`, `composerAgent`, `applyPatch`, `semanticPatch`, `normalizePatch`,
`validateComposition`, `validator`, `compose.prompt`, and 5 test files). `extractJsonPatch`
inlined into `composerAgentWS` (its sole remaining consumer). Removed `@studio/schema` and
`@studio/registry` from `packages/ai` devDependencies. Deleted `packages/schema/` and
`packages/registry/`. `pnpm install` passes; build passes; SOLID audit: **0 blocking · 0 warnings · 0 info**.

**Where:** deletions across `apps/studio/`, `packages/editor/`, `packages/renderer/`, `patches/`,
`packages/schema/`, `packages/registry/`; `package.json` `pnpm.patchedDependencies` removed.

---

## Legacy ADR archive (apps/studio · Craft.js system)

> The following ADRs governed `apps/studio` (the Craft.js-based editor, v1.0–v7.0.2).
> That system is **deprecated** — no new features. These ADRs are preserved as historical record.
> Full text: [`doc/archive/model-legacy-studio.md`](archive/model-legacy-studio.md) (MODEL.md) and
> inline `// ADR-NNN` comments in `apps/studio/src/`.

| ADR | Decision (summary) | Status |
|-----|--------------------|--------|
| 001 | `project.json` is the single source of truth | ⛔ Superseded by ADR-NB-001 |
| 002 | One-way data flow: Schema → Canvas / Schema → Code | ⛔ Superseded by ADR-NB-004 |
| 003 | Git is server-side only via `@octokit/rest` | ✅ Unchanged (packages/git) |
| 004 | Wrap with `useNode` HOC (Craft); ID fork via pnpm patch | ⛔ Craft removed |
| 005 | IDs: nanoid, type-prefixed `node_<8>` / `page_<6>` | ⛔ WS uses own id scheme |
| 006 | AI credits only after valid schema | ✅ Carried over as ADR-NB-005 |
| 007 | `schemaVersion` is a string `"MAJOR.MINOR"` | ✅ Carried over (schemaVersion: "5.0") |
| 008 | Default Git branch detected at connect (Octokit) | ✅ packages/git unchanged |
| 009 | Undo/redo = 20 schema snapshots | ⛔ Superseded by ADR-039 → ADR-NB-006 |
| 010 | Props are JSON-serializable primitives only | ⛔ WS Prop typed system replaces |
| 011 | Multi-provider AI (6 providers) | ✅ Carried over to nova-builder |
| 012 | `useNode` HOC wrap; no Craft fork (narrowed by 040) | ⛔ Craft removed |
| 013 | Every schema change ships a migration + tests | ✅ Pattern carried over (migrateToLatest) |
| 014 | Template = `{meta, schemaVersion, scope, payload}` | ⛔ WS uses TemplateMeta |
| 015 | Playwright E2E for apps/studio | ✅ Still in apps/studio; nova-builder TBD |
| 016 | Editor commands are pure functions over `Element[]` | ⛔ WS uses atom mutations + SDK |
| 017 | Selection/hover/DnD chrome via Craft `onRender` | ⛔ Craft removed |
| 018 | No freeform CSS editor; bounded Tailwind classes | ⛔ WS uses CSS property objects |
| 019 | One ID-re-minting routine `cloneSubtreeWithNewIds` | ⛔ WS SDK handles cloning |
| 021 | Interactive blocks marked `"use client"` | ⛔ WS handles client boundary |
| 022 | `classOverrides: string[]` per node (bounded Tailwind) | ⛔ Replaced by StyleDecl |
| 023 | Blocks merge via `cn()` (tailwind-merge) | ⛔ WS uses CSS engine `toValue()` |
| 024 | Composite blocks decompose into child Craft nodes | ⛔ Craft removed |
| 025 | Section is single-layer (`mx-auto` on section) | ⛔ WS Box/Section are CSS-based |
| 026 | Editor-only metadata uses `_nova*` prefix | ⛔ WS uses its own metadata keys |
| 027 | One block source — publish emits live blocks | ⛔ Replaced by WS `project-build` |
| 028 | One style system — `classOverrides` only | ⛔ Replaced by StyleDecl/StyleSource |
| 029 | Theme tab = export-only for now | ⛔ WS design token system (future) |
| 038 | Hybrid credit model (monthly bucket + prepaid top-up) | ✅ Carried over unchanged |
| 039 | Unified undo + selection desync fix (hybrid timeline) | ⛔ Superseded by ADR-NB-006 |
| 040 | pnpm patch of `@craftjs/core` for `node_<8>` ids | ⛔ Craft removed |
| 042 | Document-authoritative; Craft as render/input projection | ⛔ Craft removed; WS SyncClient replaces |
| 043 | Targeted canvas projection for discrete edits (perf) | ⛔ Not built; WS atom granularity replaces |
