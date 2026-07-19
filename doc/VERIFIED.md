# Nova — Verified Feature Ledger

## nova-builder / v25.3.0 — Save Project (Create / Update / Save As) (2026-07-18)

| ID | Feature | Status |
|---|---|---|
| SAVE-CR1 | Saving demo project opens the Create Project dialog (Name, Description, Thumbnail) | 🟡 |
| SAVE-UP1 | Saving existing project opens the Confirm Dialog with Update / Save As options | 🟡 |
| SAVE-UP2 | Clicking Update invokes the PATCH save endpoint without project duplication | 🟡 |
| SAVE-SA1 | Clicking Save As prompts for a new name and duplicates the project with client state | 🟡 |
| SAVE-DR1 | Save button changes style dynamically based on `$isDirty` and matches saved/saving state | 🟡 |
| SAVE-DR2 | Save button displays dynamic "Last saved Xs ago" text when not dirty | 🟡 |

## nova-builder / v25.2.3 — Preview loader & flash prevention (2026-07-18)

| ID | Feature | Status |
|---|---|---|
| PREV-LD1 | Loading state renders white background, circular spinner, and pulsing page skeletons | 🟡 |
| PREV-LD2 | Canvas reads `mode=preview` parameter from URL and loads directly into preview mode | 🟡 |
| PREV-LD3 | Zero flash of dark background classes or diagnostics overlay on iframe mount | 🟡 |

## nova-builder / v25.2.2 — Demo preview local state sync (2026-07-18)

| ID | Feature | Status |
|---|---|---|
| PREV-DM3 | Demo builder serializes and saves active data-store atoms to localStorage on Preview click | 🟡 |
| PREV-DM4 | Demo preview loads from localStorage to reflect builder changes in real-time | 🟡 |

## nova-builder / v25.2.1 — Demo preview support (2026-07-18)

| ID | Feature | Status |
|---|---|---|
| PREV-DM1 | Preview button is visible and functional in demo mode | 🟡 |
| PREV-DM2 | `/api/preview/demo` returns the static demo data successfully | 🟡 |

## nova-builder / v25.2.0 — MVP Preview Route completion (2026-07-18)

| ID | Feature | Status |
|---|---|---|
| PREV-T1 | Topbar Actions has "Preview" button opening `/preview/[id]` in new tab | 🟡 |
| PREV-T2 | Removed local "preview" mode pill from local builder switcher | 🟡 |
| PREV-DT | Dynamically sets `document.title` to loaded project's name | 🟡 |
| PREV-CC | Canvas element outlines, hovers, text editing, context menu are disabled in preview mode | 🟡 |
| PREV-DO | Diagnostics overlay is hidden and dark container classes omitted when previewing | 🟡 |

## nova-builder / v25.1.4 — Google OAuth user provisioning (2026-07-18)

| ID | Feature | Status |
|---|---|---|
| AUTH-G1 | Google OAuth login upserts users into `users` table via `upsertEmailUser` | 🟡 |
| AUTH-G2 | Google OAuth session ID set to Supabase database UUID (not google sub string) | 🟡 |
| AUTH-DB | getSupabase() falls back to `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` if standard keys missing | 🟡 |

## nova-builder / v25.1.3 — CONTENT→canvas sync fix (2026-07-17)

| ID | Feature | Status |
|---|---|---|
| GP-S1 | Left sidebar shows icon + text label (Add/Sym/Pages/Layers/…) | ✅ |
| GP-S2 | Canvas click → builder right panel updates immediately via `nova:select` | ✅ |
| GP-S3 | CONTENT field edit in Props panel → canvas heading updates (via `nova:instanceChildren`) | ✅ |
| GP-S4 | Double-click canvas element → Lexical contenteditable opens; Escape closes | ✅ |
| GP-S5 | Insert Button from Components (Add) tab → appears in canvas with text | ✅ |
| GP-S6 | AI route uses Groq (free key) — returns 401 not 500 for unauthenticated | ✅ |
| GP-S7 | Export `/api/export/demo` — 401 (auth required, not 402 paywall or 500) | ✅ |

## nova-builder / v25.1.2 — Left sidebar labels (2026-07-17)

| ID | Feature | Status |
|---|---|---|
| UX-LS1 | Left sidebar icon rail shows icon + short label (Add/Sym/Pages/Layers/Assets/Tokens/CSS/Tmpl/Chat/Log) | 🟡 |
| UX-LS2 | Rail width 56px — labels readable without hover | 🟡 |

## nova-builder / v25.1.1 — Selection sync fix (2026-07-17)

| ID | Feature | Status |
|---|---|---|
| GP-S1 | Canvas click → builder `$selectedInstanceSelector` updates immediately via `nova:select` postMessage | 🟡 |
| GP-S2 | Props panel shows correct instance's CONTENT field after canvas click (GP-3 unblocked) | 🟡 |
| GP-S3 | Shift-click multi-select also bridges selection to builder | 🟡 |
| GP-S4 | Deselect (click empty canvas area) clears builder's `$selectedInstanceSelector` | 🟡 |

## nova-builder / v25.1.0 — Golden path fixes (2026-07-17)

| ID | Feature | Status |
|---|---|---|
| GP-1 | `insertComponent` seeds default text child for Heading/Paragraph/Button/Link/Label/Text/Span | 🟡 |
| GP-2 | Canvas double-click opens Lexical editor on text-capable components even when `children` is empty | 🟡 |
| GP-3 | Canvas double-click seeds `initialChildren:[{type:"text",value:""}]` when instance has no children | 🟡 |
| GP-4 | Props panel → "CONTENT" textarea edits instance text inline; Enter/blur commits via `updateData` | 🟡 |
| GP-5 | CONTENT field syncs back after canvas Lexical commit (isFocused guard prevents overwrite during typing) | 🟡 |
| GP-6 | CONTENT field resets on instance selection change (keyed by `instanceId`) | 🟡 |
| GP-7 | HTML export available on free tier (`codeExport:true`) — golden path portfolio → export works | 🟡 |

## nova-builder / v25.0.0 — Phase M12: Realtime co-editing (2026-07-13) — Tier P COMPLETE

| ID | Feature | Status |
|---|---|---|
| M12-1 | Local edits broadcast as immerhin transaction patches over `project-doc:<id>` channel | 🟡 |
| M12-2 | Peer patches apply via `addTransaction(id, changes, "remote")` — canvas updates live | 🟡 |
| M12-3 | Echo prevented: `source === "remote"` transactions are not re-broadcast | 🟡 |
| M12-4 | Save de-dup: remote transaction ids dropped from the save queue (only originator persists) | 🟡 |
| M12-5 | Each editor broadcasts `selectedInstanceId` via presence | 🟡 |
| M12-6 | `RemoteSelections` draws colored, name-labeled outline over each peer's selected instance | 🟡 |
| M12-7 | Presence + co-edit share one Supabase client; degrade to no-op without anon key | 🟡 |
| M12-8 | Co-edit lifecycle bound to `usePresence` (starts/stops with the loaded project) | 🟡 |

## nova-builder / v24.1.0 — Phase M11: Protocol bundle + marketplace (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M11-1 | `buildBundle` collects selection/page subtree into a normalized NovaBundle (fragment shape) | 🟡 |
| M11-2 | `insertBundle` re-mints all ids + runs M5 nesting guard before inserting (one transaction) | 🟡 |
| M11-3 | `downloadBundle` exports `.nova.json`; `readBundleFile`/`parseBundle` validate on import | 🟡 |
| M11-4 | Import of a non-bundle file surfaces the `mktImportFailed` warning toast | 🟡 |
| M11-5 | migration `0021_marketplace.sql` — `marketplace_items` table (bundle jsonb + install_count) | 🟡 |
| M11-6 | `GET /api/marketplace` public browse (`?category=` / `?q=`) | 🟡 |
| M11-7 | `POST /api/marketplace` publish (auth'd, author-scoped) | 🟡 |
| M11-8 | `GET /api/marketplace/[itemId]` returns bundle + increments install_count | 🟡 |
| M11-9 | `DELETE /api/marketplace/[itemId]` author-only removal | 🟡 |
| M11-10 | MarketplacePanel: Export/Import bundle buttons | 🟡 |
| M11-11 | MarketplacePanel: Publish current page (name/description) | 🟡 |
| M11-12 | MarketplacePanel: Community browse + search + one-click Install | 🟡 |

## nova-builder / v24.0.0 — Phase M9: Publish pipeline (full-fidelity codegen) (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M9-1 | `generateCss` emits @media rules per breakpoint (responsive styles survive export) | 🟡 |
| M9-2 | Exported CSS includes pseudo-state selectors (:hover/:focus/etc.) | 🟡 |
| M9-3 | Exported CSS respects source-order cascade (applyMixins) | 🟡 |
| M9-4 | Component preset styles included via `getExportMetas()` | 🟡 |
| M9-5 | Bound `expression`/`parameter` props resolve to literal values in output (`resolveProps`) | 🟡 |
| M9-6 | HTML export markup carries `data-ws-id` / `data-ws-component` matching generated selectors | 🟡 |
| M9-7 | `exportAllPages` renders every page; `?format=pages` returns JSON manifest | 🟡 |
| M9-8 | React export injects the full-fidelity stylesheet + `data-ws-*` elements | 🟡 |
| M9-9 | `animate`/`scroll`/`load` interaction triggers emitted in export runtime script | 🟡 |
| M9-10 | Server-side codegen has no react-sdk client-barrel import (build + build:cf pass) | 🟡 |
| M9-11 | Deploy targets (vercel/netlify/cloudflare) + domains CNAME flow remain wired (pre-existing) | ✅ |

## nova-builder / v23.2.0 — Phase M7: Copy-paste + plugin formats (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M7-1 | Copy writes sentinel-tagged fragment JSON to system clipboard (`copyToClipboard`) | 🟡 |
| M7-2 | Paste reads system clipboard first, falls back to `$clipboard` atom | 🟡 |
| M7-3 | `serializeFragment`/`deserializeFragment` round-trip a fragment losslessly | 🟡 |
| M7-4 | `parseHtmlToFragment` converts pasted HTML → Nova instance fragment (tag→component map) | 🟡 |
| M7-5 | `parseTailwindClasses` maps common Tailwind utilities → CSS decls | 🟡 |
| M7-6 | Pasted HTML classes become an inline `style` prop (Tailwind + inline style preserved) | 🟡 |
| M7-7 | `cloneFragmentProps` re-keys fragment props onto cloned ids; all paste callers merge into `$props` | 🟡 |

## nova-builder / v23.1.0 — Phase M5: Resources + Collection + Slot + nesting guards (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M5-1 | `checkNesting` blocks text-only-container children, interactive-in-interactive, form-in-form | 🟡 |
| M5-2 | DnD reparent (`applyReparent`) rejects moves that violate the content model | 🟡 |
| M5-3 | Paste returns a `violation` (no mutation) + surfaces `$nestingWarning` toast | 🟡 |
| M5-4 | AI-apply warns (non-blocking) on invalid fragment nesting | 🟡 |
| M5-5 | `NestingToast` shows the warning message, auto-clears after 4s | 🟡 |
| M5-6 | Slot component registered (transparent `display:contents` container) | 🟡 |
| M5-7 | RepeatList provides per-item scope; child expressions resolve to the current array item in preview | 🟡 |
| M5-8 | `POST /api/projects/[id]/resources` server loader (owner-scoped, timeout, JSON/text) | 🟡 |
| M5-9 | `loadProjectResources` populates `$resourceValues`; canvas merges into expression scope | 🟡 |
| M5-10 | `createResource` creates matching resource data source; `deleteResource` cleans up + detaches props | 🟡 |
| M5-11 | DataBindingPanel per-resource Load button + loaded indicator | 🟡 |

## nova-builder / v23.0.0 — Phase M4: Data Binding Core (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M4-1 | `evaluateExpression(encoded, dataSources)` resolves encoded expression to a value; never throws | 🟡 |
| M4-2 | Canvas paints `type:"expression"` props live; recomputes when `$dataSources` changes | 🟡 |
| M4-3 | Canvas resolves `type:"parameter"` props to the referenced variable's value | 🟡 |
| M4-4 | `bindPropToVariable` / `bindPropExpression` write `Prop{type:"expression"}` via updateData | 🟡 |
| M4-5 | `unbindProp` reverts a bound prop to unset | 🟡 |
| M4-6 | `deleteVariable` detaches every prop that referenced it (no dangling refs) | 🟡 |
| M4-7 | `countVariableUsage` badge (`N in use`) shown per variable in DataBindingPanel | 🟡 |
| M4-8 | BindingPopover: ⚡ toggle per prop; variable picker + advanced expression + remove | 🟡 |
| M4-9 | ExpressionEditor: variable autocomplete dropdown + live lintExpression diagnostics | 🟡 |
| M4-10 | Bound prop shows read-only expression chip (decoded to variable names) in Props panel | 🟡 |
| M4-11 | `encodeExpression`/`decodeExpression` round-trip human↔storage form (names↔ids) | 🟡 |
| M4-12 | SDK stub `DataSource`/`Resource` are real discriminated unions; expression toolkit declared | 🟡 |

## nova-builder / v22.6.1 — Phase M13: Dashboard Long Tail (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M13-1 | Search input in dashboard header filters sites by name (live client-side) | 🟡 |
| M13-2 | "New Site" card hidden while search query is active | 🟡 |
| M13-3 | Empty-state message shown when search has no matches | 🟡 |
| M13-4 | `POST /api/projects/[id]/clone` deep-copies schema_json; owner-verified | 🟡 |
| M13-5 | `⊕` clone button in SiteCard calls clone API; routes to new project on success | 🟡 |
| M13-6 | Notification bell in header toggles dropdown; shows "no notifications" stub | 🟡 |
| M13-7 | `{}` share-tokens button serializes active `--ui-*` vars to JSON → clipboard | 🟡 |
| M13-8 | Share-tokens button label shows "Copied!" feedback for 2 seconds | 🟡 |

## nova-builder / v22.6.0 — Phase M10: Content Mode + Canvas Tools (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M10-1 | 3-pill mode selector (design/content/preview) in TopbarActions replaces single Preview toggle | 🟡 |
| M10-2 | `$builderMode` atom extended to include `"content"`; `$isContentMode` is computed (not manual atom) | 🟡 |
| M10-3 | `$gridGuidesVisible` atom + Tools menu toggle; postMessage `nova:gridGuides` forwarded to canvas | 🟡 |
| M10-4 | Canvas injects `body::before` CSS repeating-linear-gradient overlay when grid guides enabled | 🟡 |
| M10-5 | `CssPreviewPanel` — read-only syntax-highlighted CSS for selected instance at active breakpoint | 🟡 |
| M10-6 | `$cssPreviewOpen` atom; CSS Preview tab added dynamically to RightPanel when true | 🟡 |
| M10-7 | `$safeModeActive` computed atom (page root has no children); `SafeModeBanner` auto-shows/hides | 🟡 |
| M10-8 | SafeModeBanner CTA opens CommandPalette (`$commandPaletteOpen.set(true)`) | 🟡 |
| M10-9 | `InteractionTrigger` extended with `"scroll" | "load"` values | 🟡 |
| M10-10 | `InteractionAction` animate type: `{ type: "animate"; keyframe; duration; easing; fill }` | 🟡 |
| M10-11 | Canvas handles animate actions via `el.animate()` + CSS animation shorthand | 🟡 |
| M10-12 | 13 new i18n keys in en + vi for all M10/M13 builder surfaces | 🟡 |

## nova-builder / v22.5.0 — Phase M8b: Pages Advanced (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M8b-1 | Path params hint shown when `[` detected in new-page path field | 🟡 |
| M8b-2 | Redirects stored as `page.meta.redirects` JSON; `updatePageRedirects()` CRUD in `usePageCrud.ts` | 🟡 |
| M8b-3 | Per-page robots directive select in SEOPanel (index,follow / noindex,follow / etc.) | 🟡 |
| M8b-4 | Collapsible Redirects editor with from/to/301-302 rows + count badge (`RedirectsEditor`) | 🟡 |
| M8b-5 | `GET /api/projects/[projectId]/redirects` exports Cloudflare `_redirects` plaintext | 🟡 |

## nova-builder / v22.4.0 — Phase M8: Assets/Fonts Pipeline (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M8-1 | `getFontMetadata(filename)` derives fontFamily/fontWeight/fontStyle from filename heuristic | 🟡 |
| M8-2 | `NovaAsset` extended with `fontFamily?`, `fontWeight?`, `fontStyle?` fields | 🟡 |
| M8-3 | `GET /api/cgi/image` image transform proxy with Cloudflare Images CDN fallback | 🟡 |
| M8-4 | Chunked multipart upload route (`/api/assets/upload`) — initiate/PUT/complete protocol | 🟡 |
| M8-5 | AssetsPanel upload progress bar (0–100); auto-routes files >8MB via chunked protocol | 🟡 |
| M8-6 | `countAssetRefs()` scans `$props` before delete; warns with modal when refcount > 0 | 🟡 |
| M8-7 | Font card shows family/weight metadata when available | 🟡 |

## nova-builder / v22.3.0 — Phase MV3: Semantic Theme Token Architecture (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| MV3-1 | `UI_VARS` 50-token map in `uiTheme.ts` — all values are `var(--ui-*)` strings, not hex | 🟡 |
| MV3-2 | Full `LIGHT` palette added to `uiTheme.ts` (matches DARK/ELDER shape) | 🟡 |
| MV3-3 | `getThemeCssVars(mode)` generates CSS declarations for any theme mode | 🟡 |
| MV3-4 | `globals.css` — three `[data-theme]` blocks (dark/elder/light) with 50 `--ui-*` vars each | 🟡 |
| MV3-5 | `ThemeProvider` component + `$builderTheme` atom (default: dark); wraps builder chrome | 🟡 |
| MV3-6 | Builder root replaced with `<ThemeProvider>` — all chrome theme-aware via data-theme | 🟡 |
| MV3-7 | 70 builder/app files migrated to `import { UI_VARS as C }` — zero hex values in components | 🟡 |
| MV3-8 | Theme switching at runtime = `$builderTheme.set("elder")` with no component edits (OCP) | 🟡 |

## nova-builder / v22.2.1 — Tier P Batch [M3 + M6 + M7b] Parity (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M3 | Style Object Model specificity isolation (`styleInspectorWrite.ts`, `TokenChipsRow` cascade indicator) | ✅ |
| M3 | Breakpoint condition editing & style migration on deletion (`BreakpointManager.tsx`) | ✅ |
| M6 | Lexical rich-text formatting parity (`interop.ts`, `richText.ts` link and underline preservation) | ✅ |
| M7b | Canvas interaction completeness (shift-click multi-select, scroll-into-view retry, link interceptor) | ✅ (`e2e/tier-p-parity.spec.ts`) |

## nova-builder / v22.0.2 — i18n Complete Audit Coverage: Tiers 2, 3, 4 Remediation (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| I18N-ALL | Complete bilingual dictionary (`t.panels.*`) covering all remaining Tier 2, 3, 4 settings and builder panel strings | 🟡 |
| I18N-ARCH | Modular locale architecture (`src/lib/i18n/locales/en.ts` and `vi.ts`) resolving S1 file size warnings on `dictionaries.ts` | 🟡 |
| I18N-CLEAN | Cleaned up temporary migration `.cjs` scripts from `scripts/` directory | 🟡 |

## nova-builder / v22.0.1 — i18n Coverage: Tier 1 Critical Surfaces Remediation (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| I18N-T1 | Canvas right-click context menu labels (`CanvasContextMenu.tsx`) use `useI18n()` dynamic keys (`t.commands.*`) | 🟡 |
| I18N-T1 | First-run onboarding cards (`CoachMarks.tsx`) use `useI18n()` dynamic keys (`t.coachmarks.*`) without static module constants | 🟡 |
| I18N-T1 | Left sidebar tabs (`builder/left-sidebar/index.tsx`) use component-scoped `tabs` array wired to `t.builder.*` | 🟡 |
| I18N-T1 | Navigator tree right-click and empty states (`navigator/ContextMenu.tsx`, `navigator/index.tsx`) use `useI18n()` keys | 🟡 |
| I18N-T1 | Components panel search placeholder and empty states (`components/index.tsx`) use `useI18n()` keys | 🟡 |

## nova-builder / v22.0.0 — Tier P M2: Patch save + optimistic concurrency (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M2 | Patch wire format: immer patches (incl. Map keys + nested pages Maps) survive JSON round-trip and apply server-side onto deserialized data | ✅ (node probe, output in CHANGELOG session) |
| M2 | Autosave queue: transactions drain via `popAll()` every 1s; undo of unsent transaction self-cancels; status chip reflects saving/saved | 🟡 needs DB-backed env (`e2e/save-patch.spec.ts` — currently env-skipped: no Supabase creds in `.env.local`) |
| M2 | Two-tab conflict: stale tab gets 409 + conflict UI + Reload; winner's data intact | 🟡 same spec; ALSO requires migration **0020** applied |
| M2 | Degraded mode without migration 0020: GET/save/patch keep working, `version: null`, concurrency off | ✅ by code path (fallback branches) · 🟡 verify once against live DB |
| M2 | Full save sends baseVersion, adopts returned version, discards queued patches; metadata merges don't bump version | 🟡 manual save in DB env |
| M2 | Demo mode: no queue, no status chip, demoNotice unchanged | ✅ (targeted e2e demo runs unaffected: 3/3) |

> ⚠️ **Operator action:** apply `supabase/migrations/0020_project_version.sql` to enable the concurrency guard; then run `e2e/save-patch.spec.ts` in that env to flip the 🟡 rows.

## nova-builder / v21.0.0 — Tier P M1: Transactions + command registry (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M1/WSA-2 | Builder style edit repaints the canvas iframe (transaction sync); undo reverts it in the iframe too | ✅ (e2e `builder-canvas-sync.spec.ts`) |
| M1/WSA-4 | Undo covers all 10 data atoms (pages/breakpoints/dataSources/resources/assets included) — transaction revert, no snapshot halves | ✅ by construction (captureSnapshot deleted; all writes in updateData) · 🟡 spot-check pages/breakpoint undo in browser |
| M1 | Single write path: zero direct `.set()` on data atoms outside load/sync paths; `captureSnapshot` gone (compile-error guard) | ✅ (grep + typecheck) |
| M1 | Command registry drives both shortcuts and ⌘K Actions (one definition; labels from i18n `commands` dict en+vi) | 🟡 palette walk-through in vi |
| M1 | Instance mutations (insert/duplicate/delete/wrap/reparent/text-commit/AI apply/template/symbol) each = one undo step, synced to canvas | 🟡 interactive pass (was blocked-by-WSA-2, now testable) |
| M1 | AIContentPanel apply + components-panel insert are now undoable (previously mutated with no snapshot at all) | 🟡 |

> **Unblocks the QA backlog:** every canvas-mutation row parked as "blocked-by-WSA-1/2" since v19.2.3 (resize/drag-reparent commits, style writes, navigator DnD) is now testable — M-S1 paints, M1 delivers. Human pass per `doc/qa-nova-builder.md`.

## nova-builder / v20.2.1 — i18n surface coverage remediation P1–P6 (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| P1 | `RightPanel.tsx` tab labels (`Style`/`Props`/`Settings`/`Tokens`/`Interact`/`Data`/`CMS`/`SEO`/`Cookie`) localized via `t.builder.*` | 🟡 visual pass: switch to VI, verify tab labels update |
| P2 | `TopbarActions.tsx` Export▾/Deploy↗/AI Content Fill/Accessibility/Performance/⏱ History menu labels localized | 🟡 visual pass: switch to VI, open each menu |
| P3 | `WelcomeCard.tsx` — all step titles, CTA, dismiss localized via `t.welcome.*`; hardcoded `STEPS` const removed | 🟡 visual pass: clear `nova-welcome-dismissed`, switch to VI, verify VI step text |
| P4 | `Topbar.tsx` tooltips (Back/Copy/Paste/Duplicate/Delete/Breakpoints) localized via `t.builder.*` | 🟡 visual pass: switch to VI, hover tooltips |
| P5 | `settings/language/page.tsx` orphan strings (`displayLanguage`, sublabels, back link) localized | 🟡 visual pass: switch to VI, verify settings page |
| P6 | `PublicNav.tsx` "Try Demo" replaced with `t.landing.tryDemo` | 🟡 visual pass: switch to VI, verify nav |
| Gate | TypeScript: 0 errors | ✅ |
| Gate | ESLint: 0 errors / 0 warnings | ✅ (deprecation warning on `next lint` command is pre-existing) |
| Gate | SOLID audit: 0 blocking | ✅ (dictionaries.ts S1 warn expected — 451 lines, +62 from new translations) |
| Gate | Build: 76 routes compiled, 49/49 static pages | ✅ |

> All 🟡 rows require a human browser pass with locale switched to Vietnamese. No e2e automation written for this patch (tooltip text is not in the DOM at test time; tab labels require visual verification).

## nova-builder / v20.0.1–v20.2.0 — Tier P batch [M0 + MV1 + MV2] (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M0 | ws-* drift vs upstream `65d8a16` fully accounted (2 intentional patches + 1 EOL artifact); `packages/WS-UPSTREAM.md` pin + re-sync procedure | ✅ (diff evidence in file) |
| MV1/V-1 | Right-panel tabs render as readable 3-col grid, active tab visibly distinct | ✅ (screenshot `builder-1440-after-mv.png`) |
| MV1/V-2 | CSS-state pills wrap — all 7 visible at 280px, none clipped | ✅ (screenshot) |
| MV1/V-6 | Floating "N" circles gone (`devIndicators: false`) | ✅ (screenshot) |
| MV1 | solid:audit V1 check flags local palettes (aggregated WARN = MV3 backlog) | ✅ (audit output) |
| MV2 | Shared controls (UnitInput/ColorControl/ToggleGroup/CollapsibleSection) drive style rows, sections and state pills — behavior unchanged (arrow-nudge kept) | 🟡 interactive pass |
| MV2/V-5 | Selection label flips below the box near the top edge — never covers content | 🟡 select an element at y≈0 |
| MV2/V-7 | Navigator shows label once; muted component tag only when label differs | ✅ (screenshot: single "Body") |
| MV2/V-8 | Icon rail: aria-label/aria-pressed + 0.60 contrast | ✅ (code + screenshot contrast) |

> Targeted e2e per the new batching rule: `canvas-styles.spec.ts` + `editor.spec.ts` — 2/2 green. Six-gate check run once at batch end: all green (SOLID 0 blocking · 4 WARN: 3 pre-existing + V1 backlog).

## nova-builder / v20.0.0 — Tier P M-S1: Canvas style rendering (2026-07-13)

| ID | Feature | Status |
|---|---|---|
| M-S1 | Five stylesheets (`nova-fonts/presets/user-styles/state-styles/helpers`) mount in cascade order in the /canvas iframe | ✅ (e2e `canvas-styles.spec.ts`) |
| M-S1 | Demo StyleDecls PAINT: computed styles show backgrounds + flex/grid from `$styles` (WSA-1 resolved) | ✅ (e2e computed-style probe) |
| M-S1 | Breakpoint decls render as `@media` (compareMedia order); state decls render as nested selectors | 🟡 needs breakpoint-switch walk-through |
| M-S1 | Selected pseudo-state previews statelessly on the selected instance (`selectedState` sync object) | 🟡 needs browser QA (blocked for live edits by WSA-2 until M1) |
| M-S1 | Component preset styles apply (headings sized, Body-as-div presets re-targeted per ADR-NB-008) | 🟡 visual pass |
| M-S1 | Uploaded font assets emit @font-face; image style values resolve via asset transformer | 🟡 needs asset-based project |
| M-S1 | Legacy `{type:"color"}` decls (pre-v20 docs) still paint via `legacyColorToRgb`; color controls now write SDK `rgb` | 🟡 open an old project |
| M-S1 | Design-mode helpers (user-select none, contenteditable text cursor, focus ring suppressed) clear in preview mode | 🟡 |

> WSA-1 is resolved and automation-guarded. Note: live style edits still do not repaint the canvas until **M1** lands (WSA-2 — mutations bypass immerhin sync); the 🟡 rows above that involve editing must be QA'd after M1.

## nova-builder / v19.2.3 — WS-PARITY-AUDIT (2026-07-12, doc-only)

Full parity audit vs `reference/webstudio` @ `65d8a16`: [`doc/WS-PARITY-AUDIT.md`](WS-PARITY-AUDIT.md) — 158 code-verified rows, 18-point verification log, runtime probe + screenshots (`test-results/ws-audit/`). No new runtime behavior shipped, so no new 🟡 rows. The audit **refutes** previously ledgered behavior:

| ID | Finding | Status |
|---|---|---|
| WSA-1 | StyleDecls are never rendered to CSS in the canvas iframe — runtime computed-style probe shows all defaults while demo StyleDecls exist. Any prior row implying "style edit → canvas re-renders" is **refuted** (the write succeeds; nothing paints) | ✅ **fixed v20.0.0 (M-S1)** |
| WSA-2 | Builder data mutations bypass immerhin (`createTransaction` has zero callers) → the canvas follower receives NO edits after initial state transfer; selection/hover sync only because they use separate NanostoresSyncObjects | 🔴 → fix M1 |
| WSA-3 | Applying a style token then editing any style mutates the token globally (`ensureSource` writes to `values[0]`) | 🔴 → fix M3 |
| WSA-4 | `captureSnapshot()` is called before mutations of `$pages`/`$breakpoints`/`$dataSources`/`$resources`/`$assets`, none of which are in the snapshot → undo restores inconsistent halves | 🔴 → fix M1 |
| WSA-5 | HTML/React export drops every non-base breakpoint and every `state` decl → published output has no media queries / no :hover | 🔴 → fix M9 |
| WSA-6 | Broken builder chrome at 1280/1440/1920 (register §8b V-1…V-8: clipped tab strip, clipped state pills, invisible canvas content, sub-44px targets); uiTheme adoption 3/56 files vs 49/56 local palettes | 🔴 → fix MV1/MV2 |

> Consequence for older ledger sections: rows of the form "Style panel writes apply on canvas", "canvas re-renders immediately", and the FA-007 mutation rows are downgraded from "🟡 pending QA" to **blocked-by-WSA-1/WSA-2** — human QA cannot flip them until M-S1 + M1 land. Rows about panel UI rendering, atom writes, persistence, auth, i18n, and billing are unaffected.

## nova-builder / v19.2.0 — FA-v1 R4: QA automation + plan-card i18n + email verification (2026-07-12)

| ID | Feature | Status |
|---|---|---|
| FA-I04 | Pricing plan cards render Vietnamese ("Nâng cấp lên Pro" …) when locale = vi | ✅ |
| FA-I04 | Plan price stays single-sourced from `plans.ts` (only copy is localized) | ✅ |
| FA-005 | Email signup issues a hashed single-use verification token + sends verify email | 🟡 |
| FA-005 | `/verify-email` page is public and renders the verify card (not redirected to login) | ✅ |
| FA-005 | `POST /api/auth/verify-email` never succeeds with an invalid token | ✅ |
| FA-005 | Valid token flips `users.email_verified = true` (migration 0004); soft (login not blocked) | 🟡 |
| QA | `e2e/editor.spec.ts` proves FA-007 overlay-on-select; manual checklist DM1–DM3/I18N1 in `doc/qa-nova-builder.md` for the mutations | ✅ |
| FA-e2e | `pnpm test:e2e` — 27 passed / 2 skipped | ✅ |

> R4 flipped the automation-provable FA-007 (overlay renders) and i18n rows to ✅. The resize/drag-reparent/navigator-DnD **mutations** and the email round-trip stay 🟡 pending the human pass (`doc/qa-nova-builder.md` §R4).

## nova-builder / v19.1.0 — FA-007 R3 pt.2: Canvas drag-reparent (2026-07-12)

| ID | Feature | Status |
|---|---|---|
| FA-007 | Press-drag a selected canvas element (>4px) starts a move; a click still selects | 🟡 |
| FA-007 | Drop target resolved from pointer: above/below (insertion line) or into (box) | 🟡 |
| FA-007 | Drop commits via `applyReparent` (reorder same-parent / move cross-parent), undoable | 🟡 |
| FA-007 | Illegal drops rejected (into own subtree, text-only container, root move) | 🟡 |
| FA-007 | `lib/treeMove.ts` shared by navigator DnD + canvas drag (one reindex rule) | ✅ |
| FA-007 | Navigator tree DnD still works after refactor (uses `applyReparent`) | 🟡 |
| FA-007 | `/builder/demo` boots canvas with overlay + drag listener mounted (e2e) | ✅ |

> FA-007 (overlay + resize + drag-reparent) is now feature-complete; 🟡 rows need a human browser QA pass (select → drag element → verify new parent/index + undo; verify navigator DnD unaffected).

## nova-builder / v19.0.0 — FA-007 R3 pt.1: Canvas selection overlay + resize (2026-07-12)

| ID | Feature | Status |
|---|---|---|
| FA-007 | Selecting a canvas element shows a bounding-box overlay with component label + `W × H` | ✅ |
| FA-007 | 8 resize handles render at box corners/edges (overlay = box + label + 8 handles) | ✅ |
| FA-007 | Dragging a handle shows a live preview box; element resizes on release | 🟡 |
| FA-007 | Resize commits width/height to the active breakpoint via `writeStyle` (undoable) | 🟡 |
| FA-007 | Edge handles change one axis, corner handles both (`affectedDimensions`) | 🟡 |
| FA-007 | Overlay hidden in preview mode; no idle re-render churn (rAF change-guard) | 🟡 |
| FA-007 | `/builder/demo` still boots canvas with overlay mounted (e2e) | ✅ |

> 🟡 rows are code-complete; direct-manipulation behavior needs a human browser QA pass (select → drag-resize → verify persisted size + undo). Drag-reparent is R3 pt.2 (not in this release).

## nova-builder / v18.8.0 — FA-v1 R2: Follow-up Remediation (2026-07-12)

| ID | Feature | Status |
|---|---|---|
| FA-005 | `/forgot-password` + `/reset-password` pages load public (not redirected) | ✅ |
| FA-005 | `POST /api/auth/forgot-password` returns 200 for any well-formed email (no enumeration) | ✅ |
| FA-005 | `POST /api/auth/reset-password` never succeeds with an invalid token | ✅ |
| FA-005 | Reset token single-use, SHA-256-hashed, 1-hour expiry (`password_reset_tokens`, migration 0003) | 🟡 |
| FA-005 | "Forgot password?" link present on `/login` | 🟡 |
| FA-006 | analytics/submissions/domains pages: muted 0.60, content fontSize ≥ 12 | 🟡 |
| FA-I02 | `/terms` + `/privacy` render Vietnamese when locale = vi | ✅ |
| FA-I04 | Landing hero renders Vietnamese ("Tạo mọi website") when locale = vi | ✅ |
| FA-I04 | Signup + login funnel strings localized (labels, validation, dividers, CTAs) | 🟡 |
| FA-I04 | Pricing static chrome localized (title/subtitle/badge/FAQ); plan cards from plans.ts still EN | 🟡 |
| FA-I05 | `/api/i18n/detect` prefers IP country, falls back to Accept-Language | ✅ |
| FA-I05 | Localized `<title>` renders Vietnamese ("Trình tạo website bằng AI") when locale = vi | ✅ |
| Deploy | `pnpm --filter @nova/builder build:cf` (Cloudflare Workers Build) completes — edge-runtime route removed | ✅ |
| D10 | Explicit stored locale (cookie/localStorage) overrides IP auto-detect | ✅ |
| FA-e2e | `pnpm test:e2e` — 22 passed / 2 skipped (save + tenant-isolation need seeded accounts) | ✅ |

> ✅ rows proven by `e2e/i18n.spec.ts` / `e2e/security.spec.ts`. 🟡 rows are code-complete, pending browser QA (readability visual pass, reset email round-trip with RESEND configured, full funnel VI walkthrough).

## nova-builder / v18.7.0 — FA-v1 R1: Red-Blocker Remediation (2026-07-12)

| ID | Feature | Status |
|---|---|---|
| FA-001 | Deploy route returns 404 for non-owner, 402 for free tier (ownership + `deploy` entitlement) | 🟡 |
| FA-002 | HTML + React export return 402 for free tier (`codeExport` entitlement) | 🟡 |
| FA-003 | PayOS webhook idempotent — replayed `orderCode` grants credits at most once (`processed_payments`) | 🟡 |
| FA-004 | Project create returns 402 on the 4th project for free tier (`maxProjects:3`) | 🟡 |
| FA-008 | `activity` GET+POST return 404 when caller is not the project owner (IDOR closed) | ✅ |
| FA-009 | `comments` GET+POST return 404 when caller is not the project owner (IDOR closed) | ✅ |
| FA-010 | `/api/submissions` returns 429 after 5/min per IP; owner email capped 3 per project per 5 min | ✅ |
| FA-011 | `/api/analytics/track` returns 429 after 30/min per IP | 🟡 |
| FA-I01 | Logged-out `GET /api/i18n/detect` with `cf-ipcountry: VN` returns `vi` (no login redirect) | ✅ |
| FA-I03 | `<html lang>` tracks `nova_locale` cookie (`vi` when set, `en` default) | ✅ |
| FA-e2e | `pnpm test:e2e` — 17 passed / 2 skipped (save + tenant-isolation need seeded accounts) | ✅ |

> ✅ rows are proven by the new `e2e/i18n.spec.ts` / `e2e/security.spec.ts` specs. 🟡 rows are entitlement/idempotency guards proven by code + typecheck but whose live paths (paid-tier deploy/export, real PayOS replay, 4th-project block) need a seeded account or provider replay to flip to ✅.

## nova-builder / v18.6.1 — FA-v1: Functional Audit + Red-Blocker Remediation (2026-07-12)

| ID | Feature | Status |
|---|---|---|
| FA1 | `pnpm test` — all 16 turbo test tasks pass (was 5/16) | ✅ |
| FA2 | `ws-sync-client` + `ws-multiplayer-protocol` tsconfig extends `@webstudio-is/tsconfig/base.json` (was broken path) | ✅ |
| FA3 | `ws-components` vitest jsdom environment boots (jsdom installed) | ✅ |
| FA4 | Root `vitest.config.ts` resolves `webstudio` exports condition; `ws-react-sdk` (136) + `ws-template` (12) tests pass | ✅ |
| FA5 | `ws-sdk` JSX test files compile (react devDependency); 415 tests pass | ✅ |
| FA6 | `ws-css-data` grammar tests pass with css-tree pinned to 3.1.0 (3607 tests) | ✅ |
| FA7 | e2e smoke: login rejects bad credentials end-to-end ("Sign in with Email" restored via `auth.signInWithEmail`) | ✅ |
| FA8 | e2e suite: 7 passed / 1 skipped (a11y + smoke) | ✅ |
| FA9 | Vietnamese login submit label "Đăng nhập bằng Email" renders when locale = vi | 🟡 |
| FA10 | Production build + lint + typecheck green after remediation | ✅ |

### SOLID Audit — FA-v1 (v18.6.1)
| Check | Severity | File | Fix scheduled |
|-------|----------|------|---------------|
| S1 file > 400 lines (408) | 🟡 WARN | `apps/nova-builder/src/app/projects/page.tsx` | Phase 77 |
| S1 file > 400 lines (404) | 🟡 WARN | `apps/nova-builder/src/canvas/canvas.tsx` | Phase 77 |
| I2 unused `...inputProps` | 🟡 WARN | `apps/nova-builder/src/components/public/FormField.tsx` | Phase 77 |

## nova-builder / v18.6.0 — Phase 76.1: Project-Wide i18n & SOLID Localization (2026-07-11)

| ID | Feature | Status |
|---|---|---|
| P76.1 | Auth pages (`/login`, `/signup`) use `useI18n()` and display `<LanguageSwitcher />` in top navigation | 🟡 |
| P76.1 | Builder topbar (`TopbarActions.tsx`) renders localized button labels & tooltips via `useI18n()` | 🟡 |
| P76.1 | `scripts/solid-audit.mjs` verifies 0 SOLID blocking violations across project files | ✅ |


## nova-builder / v18.5.0 — Phase 76: Internationalization (i18n) & IP Auto-Detection (2026-07-11)

| ID | Feature | Status |
|---|---|---|
| P76 | `src/lib/i18n/` SOLID architecture created (`types.ts`, `dictionaries.ts`, `detector.ts`, `context.tsx`) | 🟡 |
| P76 | English (`en`) and Vietnamese (`vi`) dictionaries implement standard UI strings | 🟡 |
| P76 | `GET /api/i18n/detect` detects visitor country from Cloudflare/Vercel headers (`cf-ipcountry`) and recommends locale | 🟡 |
| P76 | `<LanguageSwitcher />` renders in `PublicNav.tsx` allowing guests/users to switch `en`/`vi` and toggle IP auto-detection | 🟡 |
| P76 | `/settings/language` page renders display language selector and auto-detect switch | 🟡 |

## nova-builder / v18.4.0 — Commercial-Ready + Elder-First Remediation (2026-07-11)

| ID | Feature | Status |
|---|---|---|
| E1 | `src/lib/uiTheme.ts` FONT/DARK/LIGHT/TOUCH_TARGET tokens created | 🟡 |
| E1 | `globals.css` `:focus-visible` ring visible on Tab navigation | 🟡 |
| E1 | `globals.css` `prefers-reduced-motion` suppresses animations | 🟡 |
| E2 | Landing page `/` loads without auth redirect for anonymous visitor | ✅ |
| E2 | Landing page uses light theme (white bg, slate text, 16px+ body copy) | ✅ |
| E2 | Textarea has `<label>` — readable by screen readers | ✅ |
| E2 | All example chips have ≥ 36px height | 🟡 |
| E2 | Primary CTA "Start building free →" button ≥ 44px height | ✅ |
| E2 | Login page uses light theme + real `<label>` on every input | ✅ |
| E2 | Login page Terms → `/terms` and Privacy → `/privacy` are working links | ✅ |
| E2 | Login page smoke test accessible names unchanged (Continue with Google / Sign in with Email) | ✅ |
| E2 | Signup page uses light theme + real `<label>` on every input | ✅ |
| E2 | `/pricing` loads (was 404); shows 4 plan cards with correct prices ($0/$19/$49) | ✅ |
| E2 | `/terms` loads (was 404) | 🟡 |
| E2 | `/privacy` loads (was 404) | 🟡 |
| E2 | `src/lib/plans.ts` PLAN_CARDS — Pro price = $19 (not $12); Max = $49 | 🟡 |
| E2 | `settings/subscription` page uses PLAN_CARDS prices (no more hardcoded $12/$49) | 🟡 |
| E3 | Builder builder panels: all textMuted ≥ 0.60 opacity (was 0.38) | 🟡 |
| E3 | Builder panels: fontSize 10/11 replaced with 12/13 across ~60 files | 🟡 |
| E3 | `TopbarActions.tsx` imports `DARK as C` from uiTheme (no local duplicate) | 🟡 |
| E4 | TopbarActions regrouped to 6 logical controls (was 14+) | 🟡 |
| E4 | Export▾ dropdown contains HTML / React / Deploy items | 🟡 |
| E4 | Tools▾ dropdown contains Fill / Accessibility / Performance / History items | 🟡 |
| E4 | TopbarMenu closes on Esc and click-outside | 🟡 |
| E4 | Upgrade CTA (⭐ Upgrade) visible in /projects header for free-tier users | 🟡 |
| E5 | WelcomeCard appears on first /projects visit (localStorage not set) | 🟡 |
| E5 | WelcomeCard shows 3 numbered steps | 🟡 |
| E5 | WelcomeCard dismisses and doesn't reappear after dismiss | 🟡 |
| E5 | CoachMarks appear on first builder open (localStorage not set) | 🟡 |
| E5 | CoachMarks cycle through 3 steps via Next; Skip closes early | 🟡 |
| E5 | `e2e/a11y.spec.ts` — axe wcag2a/wcag2aa passes on /, /login, /signup, /pricing | ✅ |
| E5 | Elder-first assertion: body text ≥ 16px on landing page | ✅ |
| E5 | Elder-first assertion: primary CTA bounding box ≥ 44px | ✅ |

## nova-builder / v18.0.0 — P44–P75 Cluster (2026-07-11)

| ID | Feature | Status |
|---|---|---|
| P44 | Data binding panel: create/update/delete variables + resources | 🟡 |
| P44 | `$dataSources` and `$resources` synced builder → canvas | 🟡 |
| P45 | RepeatList component renders children N×array items in preview mode | 🟡 |
| P45 | RepeatList appears in Components panel under "Dynamic" category | 🟡 |
| P45 | RepeatList in design mode always shows exactly 1 copy of children | 🟡 |
| P46 | Interactions panel: click/hover/focus → navigate/toggleClass/showHide | 🟡 |
| P46 | Interactions applied in preview mode, not in design mode | 🟡 |
| P47 | AI Content Fill panel opens from topbar "Fill" button | 🟡 |
| P47 | /api/ai/content deducts credits after successful generation | 🟡 |
| P48 | A11y panel opens from topbar "A11y" button; reports per-element issues | 🟡 |
| P48 | /api/ai/a11y returns structured findings | 🟡 |
| P49 | Performance panel opens from topbar "Perf" button | 🟡 |
| P49 | /api/ai/performance returns load-time suggestions | 🟡 |
| P50 | CMS panel binds Contentful/Airtable/Notion endpoints | 🟡 |
| P51 | Props editor (right panel "props" tab) shows instance props | 🟡 |
| P52 | Version history panel lists snapshots; restore rolls back to snapshot | 🟡 |
| P52 | /api/projects/[id]/snapshots creates snapshot on save | 🟡 |
| P53 | Comments panel shows threaded comments per project | 🟡 |
| P54 | /settings/teams: create team, invite members, manage billing | 🟡 |
| P55 | Activity panel shows per-project event feed | 🟡 |
| P56 | Multiplayer presence: collaborator avatars in topbar | 🟡 |
| P57 | Remote cursors overlay visible in canvas area | 🟡 |
| P58 | Custom CSS tab in left sidebar: raw CSS applied live to canvas | 🟡 |
| P59 | CSS Vars tab: add/edit/delete design tokens; live preview | 🟡 |
| P60 | Keyboard shortcuts modal opens with ? key | 🟡 |
| P61 | Marketplace panel: browse and apply 3 built-in templates | 🟡 |
| P62 | Symbols panel: lists project symbols | 🟡 |
| P63 | Analytics track endpoint records page views | 🟡 |
| P63 | Analytics dashboard shows view counts per page | 🟡 |
| P64 | /api/projects/[id]/sitemap returns XML sitemap | 🟡 |
| P65 | Form submissions stored and viewable at /submissions/[id] | 🟡 |
| P68 | /api/billing/portal redirects to LemonSqueezy or PayOS checkout | 🟡 |
| P69 | LemonSqueezy webhook: signature verified; subscription updated | 🟡 |
| P70 | PayOS webhook: signature verified; credits topped up | 🟡 |
| P71 | /settings/billing and /settings/subscription render tier info | 🟡 |
| P72 | /api/admin/flags returns feature flags | 🟡 |
| P73 | /api/admin/users returns user list (admin only) | 🟡 |
| P74 | /api/projects/[id]/webhooks stores and triggers outbound webhooks | 🟡 |
| P75 | /api/export/[id] returns standalone HTML export | 🟡 |
| P75 | /api/export/[id]/react returns React component export | 🟡 |
| — | Build: `pnpm --filter @nova/builder build` — 0 errors | ✅ |

## SOLID Audit — v17.2.0 (2026-07-11)

| Check | Result | Evidence |
|---|---|---|
| `node scripts/solid-audit.mjs` | ✅ 0 blocking · 0 warnings · 0 info | audit run 2026-07-11 |
| `pnpm --filter @nova/builder build` | ✅ 0 errors | build run 2026-07-11 |
| `getSupabaseAdmin()` only in `lib/supabaseAdmin.ts` | ✅ | grep verified |
| All B2 split files < 400 lines | ✅ | wc -l verified |
| TreeRow props grouped (≤5 top-level) | ✅ | code review |
| PageItem props grouped (3 top-level) | ✅ | code review |
| FolderItem unused `id` prop removed | ✅ | code review |
| packages/schema + packages/registry deleted | ✅ | ls verified |
| packages/ai Element[] path files deleted | ✅ | ls verified |
| ADR-NB-011 debt status updated | ✅ | ADR.md |

## nova-builder / v17.1.0 — Commercial-Readiness Remediation (2026-07-11)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **uid dedupe** — `function uid(` exists only in `lib/uid.ts` | ✅ | grep verified | assistant · 2026-07-11 |
| **Builder page split** — page.tsx is 344 lines (< 400 threshold) | ✅ | wc -l verified | assistant · 2026-07-11 |
| **SOLID audit gate** — `pnpm solid:audit` reports 0 blocking | ✅ | audit run | assistant · 2026-07-11 |
| **Build after remediation** — 0 errors, all new routes in manifest | ✅ | pnpm build passed | assistant · 2026-07-11 |
| **Incognito preview** — /preview/:id opens without login redirect | 🟡 | build ✅ | — |
| **Anonymous tracking** — /api/analytics/track records views for logged-out visitors | 🟡 | build ✅ | — |
| **Anonymous submissions** — /api/submissions accepts posts without session | 🟡 | build ✅ | — |
| **Crawlable SEO** — sitemap/robots endpoints reachable without auth | 🟡 | build ✅ | — |
| **LS checkout redirect** — portal?provider=lemonsqueezy 302s to hosted checkout (env set) | 🟡 | build ✅ | — |
| **PayOS checkout** — portal?provider=payos creates payment link + redirects (env set) | 🟡 | build ✅ | — |
| **Billing not configured** — portal returns friendly 503 JSON when env unset | 🟡 | build ✅ | — |
| **LS webhook signature** — bad X-Signature → 401; valid → tier/plan updated | 🟡 | build ✅ | — |
| **PayOS webhook signature** — bad signature → 401; code 00 → tier/credits applied | 🟡 | build ✅ | — |
| **Credit top-up** — PayOS credits purchase adds 500 to users.credits | 🟡 | build ✅ | — |
| **Real usage meter** — subscription page shows users.credits (not hardcoded 0) | 🟡 | build ✅ | — |
| **VietQR buttons** — plan cards show "Pay with VietQR"; top-up button on meter | 🟡 | build ✅ | — |
| **Mock invoices gone** — billing page links LS portal instead of fake rows | 🟡 | build ✅ | — |
| **Invite email** — inviting a team member sends a Resend email (or logged no-op) | 🟡 | build ✅ | — |
| **Lead email** — form submission emails project owner honoring notification_prefs | 🟡 | build ✅ | — |
| **Export custom CSS** — exported HTML contains `<style id="nova-custom-css">` | 🟡 | build ✅ | — |
| **Export cookie banner** — enabled banner + accept/decline script in exported HTML | 🟡 | build ✅ | — |
| **Export interactions** — click/hover/focus actions work in exported HTML | 🟡 | build ✅ | — |
| **Export form capture** — exported forms POST to /api/submissions + show thanks | 🟡 | build ✅ | — |
| **Preview parity** — preview shows custom CSS + CSS vars + live interactions | 🟡 | build ✅ | — |
| **Preview forms live** — submitting a form in preview creates a submission row | 🟡 | build ✅ | — |
| **Preview cookie banner** — banner renders over preview; choice persists | 🟡 | build ✅ | — |
| **Custom-domain serving** — foreign Host on app rewrites → resolver → project preview | 🟡 | build ✅ | — |
| **Unknown domain 404** — unlinked host shows "Domain not connected" page | 🟡 | build ✅ | — |

## SOLID Audit — Final Tier (v17.1.0)

> `pnpm solid:audit` — 303 files. **Before:** 1 blocking (S1 page.tsx 725 ln) + 1 latent blocker
> (D1 `uid()` ×10 files, under-detected by the audit regex) + 32 warnings.
> **After remediation: 0 blocking · 31 warnings · 1 info.** Grades: S C→B+ · O A · L A− · I C+ · D D→A.

| Check | Severity | File(s) | Fix scheduled |
|---|---|---|---|
| S1 file > 400 ln | 🟡 ×6 active | StyleInspector (666), Topbar (641), TransitionEditor (461), GradientEditor (438), templates/index (410), ShadowEditor (402) | Backlog — split on next touch of each file |
| S1 file > 400 ln | 🟡 ×2 legacy | packages/schema runner + test | No — legacy retained per ADR-NB-011 |
| L1 panel interface | 🟡 ×1 | ShadowEditor (5-prop panel) | Backlog — unify to PanelProps |
| I1 fat prop types | 🟡 ×5 active | TreeRow (33 fields!), PageItem (15), ContextMenu (9), FolderItem (8), ComponentItem (7) | Backlog — TreeRow first (worst offender) |
| I2 unused props | 🟡 ×5 active + ×11 legacy registry | navigator/pages components; packages/registry blocks | Active: backlog · Legacy: no |
| O2 panel registry | ⚪ info | StyleInspector | Tracked |

---

## nova-builder / v17.0.0 — Final Cluster: Opus phases (P35, P37, P41, P44, P50, P54, P56, P69, P75 · 2026-07-10)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Symbols tab** — "◆ Symbols" tab visible in left-sidebar rail | 🟡 | build ✅ | — |
| **Create symbol** — selecting an element + naming + Save adds a symbol | 🟡 | build ✅ | — |
| **Symbol snapshot** — captured symbol includes subtree instances + props + styles | 🟡 | build ✅ | — |
| **Instantiate symbol** — Insert drops a fresh copy under selection/page root | 🟡 | build ✅ | — |
| **Repeat insertion** — inserting the same symbol twice yields independent ids (no collision) | 🟡 | build ✅ | — |
| **Symbol persists** — Ctrl+S saves `schema_json.symbols`; reload restores them | 🟡 | build ✅ | — |
| **Delete symbol** — × removes a symbol from the library | 🟡 | build ✅ | — |
| **React export button** — "↓ React" visible in topbar next to HTML | 🟡 | build ✅ | — |
| **React export downloads** — GET /api/export/:id/react returns a `.tsx` file | 🟡 | build ✅ | — |
| **Tailwind mapping** — common props emit utility classes; rest fall back to inline style | 🟡 | build ✅ | — |
| **Domains migration** — 0017 creates `project_domains` table | 🟡 | build ✅ | — |
| **Add domain** — POST generates CNAME + TXT verification token | 🟡 | build ✅ | — |
| **Verify domain** — PATCH resolves TXT record and flips status to verified | 🟡 | build ✅ | — |
| **Domain DNS instructions** — page shows CNAME + TXT records to add | 🟡 | build ✅ | — |
| **Remove domain** — DELETE removes a domain (owner-scoped) | 🟡 | build ✅ | — |
| **Variables** — Data tab creates string/number/boolean/json variables in `$dataSources` | 🟡 | build ✅ | — |
| **Variable value edit** — editing a variable value writes back to the atom | 🟡 | build ✅ | — |
| **Resources** — Data tab creates Resource endpoints (method + url) in `$resources` | 🟡 | build ✅ | — |
| **Data binding persists** — dataSources/resources round-trip through save/load | 🟡 | build ✅ | — |
| **CMS tab** — "cms" tab renders provider config (Contentful/Airtable/Notion) | 🟡 | build ✅ | — |
| **CMS proxy** — POST /api/cms fetches + normalizes items server-side (tokens hidden) | 🟡 | build ✅ | — |
| **CMS test + preview** — Test connection shows item count + first 3 items | 🟡 | build ✅ | — |
| **CMS save as resource** — creates a Resource pointing at the proxy | 🟡 | build ✅ | — |
| **Teams migration** — 0018 creates teams + team_members + projects.team_id | 🟡 | build ✅ | — |
| **Create team** — POST /api/teams creates team + owner membership | 🟡 | build ✅ | — |
| **List teams** — GET /api/teams returns teams with myRole | 🟡 | build ✅ | — |
| **Invite member** — POST members adds by email (links existing users) | 🟡 | build ✅ | — |
| **Remove member** — DELETE removes non-owner members (role-gated) | 🟡 | build ✅ | — |
| **Transfer project** — POST transfer moves a project into/out of a team | 🟡 | build ✅ | — |
| **Teams page** — /settings/teams renders team list + members + billing card | 🟡 | build ✅ | — |
| **Presence** — joining a project connects a Supabase Realtime channel | 🟡 | build ✅ | — |
| **Collaborator avatars** — other users appear as an avatar stack in the topbar | 🟡 | build ✅ | — |
| **Remote cursors** — other users' cursors render live over the canvas | 🟡 | build ✅ | — |
| **Presence no-op** — degrades silently to single-player when anon key unset | 🟡 | build ✅ | — |
| **Team billing migration** — 0019 adds plan/seats/stripe/billing_cycle to teams | 🟡 | build ✅ | — |
| **Seat info** — GET billing returns plan, seats, usedSeats, monthly total | 🟡 | build ✅ | — |
| **Change seats** — +/− controls PATCH seat count (owner-only) | 🟡 | build ✅ | — |
| **Seat gate** — inviting beyond purchased seats returns 402 seatLimit | 🟡 | build ✅ | — |
| **Seat floor** — cannot reduce seats below current member count | 🟡 | build ✅ | — |
| **Studio sunset** — apps/studio, packages/editor, packages/renderer deleted | 🟡 | build ✅ | — |
| **Craft patch removed** — @craftjs/core patch + patchedDependencies removed | 🟡 | build ✅ | — |
| **Build after sunset** — nova-builder builds 0 errors after deletions | ✅ | pnpm build passed | assistant · 2026-07-10 |

---

## nova-builder / v8.49.1 — Cluster 6: Analytics, SEO & Growth + Account, Billing & Admin (Phases 64–68, 70–74 · 2026-07-10)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **form_submissions table** — migration 0014 creates table with fields jsonb + indexes | 🟡 | build ✅ | — |
| **Public form POST** — POST /api/submissions accepts {projectId, formName, fields} without auth | 🟡 | build ✅ | — |
| **Project verification** — /api/submissions returns 404 for unknown projectId | 🟡 | build ✅ | — |
| **Submissions GET** — /api/projects/:id/submissions returns paginated list (owner-scoped) | 🟡 | build ✅ | — |
| **CSV export** — ?format=csv returns correct CSV with dynamic field columns | 🟡 | build ✅ | — |
| **Form filter** — ?formName= filters submissions by form name | 🟡 | build ✅ | — |
| **Delete submission** — DELETE removes single row (owner-scoped) | 🟡 | build ✅ | — |
| **Submissions dashboard** — /submissions/:id renders table with all field columns | 🟡 | build ✅ | — |
| **Form name pills** — multiple form names show filter pill buttons | 🟡 | build ✅ | — |
| **Export CSV button** — clicking downloads CSV file | 🟡 | build ✅ | — |
| **Leads button in projects** — "◧" button visible on project cards | 🟡 | build ✅ | — |
| **Sitemap.xml** — GET /api/projects/:id/sitemap returns valid XML with page URLs | 🟡 | build ✅ | — |
| **noIndex excluded** — pages with noIndex=true absent from sitemap | 🟡 | build ✅ | — |
| **robots.txt** — GET /api/projects/:id/robots returns plain text with sitemap URL | 🟡 | build ✅ | — |
| **Custom robots.txt** — project-stored robotsTxt overrides default when set | 🟡 | build ✅ | — |
| **SEO tab in RightPanel** — "seo" tab visible alongside style/props/settings/tokens/interact/cookie | 🟡 | build ✅ | — |
| **SEOPanel renders** — clicking seo tab shows title/description/canonical/noIndex fields | 🟡 | build ✅ | — |
| **SEO Save** — clicking Save SEO PATCHes /api/projects/:id with seoData | 🟡 | build ✅ | — |
| **Partial PATCH** — seoData/robotsTxt/cookieConsent updates merge into existing schema_json | 🟡 | build ✅ | — |
| **OGPreviewCard** — social preview card updates live as OG title/description/image are typed | 🟡 | build ✅ | — |
| **OG section toggle** — "OPEN GRAPH" section collapses/expands | 🟡 | build ✅ | — |
| **Cookie tab in RightPanel** — "cookie" tab visible in right panel | 🟡 | build ✅ | — |
| **CookieBannerPanel renders** — shows enable toggle + config fields | 🟡 | build ✅ | — |
| **Banner live preview** — preview card updates live as message/colors are changed | 🟡 | build ✅ | — |
| **Cookie save** — Save Banner Settings PATCHes cookieConsent to project | 🟡 | build ✅ | — |
| **Account API** — GET /api/settings/account returns tier/credits | 🟡 | build ✅ | — |
| **Subscription page** — /settings/subscription renders with plan cards and usage bar | 🟡 | build ✅ | — |
| **Current plan highlighted** — active tier card shows purple border + "Current plan" badge | 🟡 | build ✅ | — |
| **Credits meter** — usage bar shows used/max with warning color at >80% | 🟡 | build ✅ | — |
| **Billing page** — /settings/billing renders billing info form + invoice history table | 🟡 | build ✅ | — |
| **Invoice rows** — each invoice shows date, plan, amount, status, PDF button | 🟡 | build ✅ | — |
| **Notification prefs column** — migration 0015 adds notification_prefs jsonb to users | 🟡 | build ✅ | — |
| **Notifications GET/PATCH** — /api/settings/notifications reads/writes user prefs | 🟡 | build ✅ | — |
| **Notifications page** — /settings/notifications renders 7 toggles with animated switches | 🟡 | build ✅ | — |
| **Toggle persists** — flipping a toggle and saving PATCH to /api/settings/notifications | 🟡 | build ✅ | — |
| **Admin role column** — migration 0016 adds role column + feature_flags table | 🟡 | build ✅ | — |
| **Admin users GET** — /api/admin/users returns 403 for non-admin users | 🟡 | build ✅ | — |
| **Admin users list** — /admin renders user table with email/tier/role/credits | 🟡 | build ✅ | — |
| **Inline user edit** — clicking Edit shows tier/role/credits dropdowns; Save updates DB | 🟡 | build ✅ | — |
| **Admin search** — searching by email filters user list | 🟡 | build ✅ | — |
| **Feature flags GET** — /api/admin/flags returns 403 for non-admin | 🟡 | build ✅ | — |
| **Create flag** — POST /api/admin/flags creates new flag with key + description | 🟡 | build ✅ | — |
| **Toggle flag** — PATCH /api/admin/flags toggles enabled state | 🟡 | build ✅ | — |
| **Delete flag** — DELETE removes flag from DB and list | 🟡 | build ✅ | — |
| **Flags page** — /admin/flags renders flag list with toggle switches | 🟡 | build ✅ | — |
| **Keyboard shortcuts modal** — pressing "?" in builder opens shortcuts dialog | 🟡 | build ✅ | — |
| **Escape closes modal** — Escape key dismisses shortcuts dialog | 🟡 | build ✅ | — |
| **Shortcut search** — typing in search field filters shortcuts list | 🟡 | build ✅ | — |
| **5 shortcut groups** — Edit / Selection / Canvas / Panels / AI groups all render | 🟡 | build ✅ | — |
| **"?" guarded** — pressing "?" inside an input does not open modal | 🟡 | build ✅ | — |

---

## nova-builder / v8.44.0 — Phase 63: Site Analytics Dashboard (2026-07-10)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **`page_views` table** — migration 0013 creates table with all required columns + indexes | 🟡 | build ✅ | — |
| **Track endpoint** — POST /api/analytics/track accepts `{projectId, path, referrer}` without auth | 🟡 | build ✅ | — |
| **Device detection** — mobile/tablet/desktop correctly classified from UA string | 🟡 | build ✅ | — |
| **Project verification** — track endpoint returns 404 for unknown projectId (no DB pollution) | 🟡 | build ✅ | — |
| **Country header** — `cf-ipcountry` stored when present; null when absent | 🟡 | build ✅ | — |
| **Analytics GET auth** — /api/analytics/:id returns 401 for unauthenticated requests | 🟡 | build ✅ | — |
| **Ownership check** — analytics endpoint returns 404 for projects not owned by session user | 🟡 | build ✅ | — |
| **`?days=` param** — 7/30/90 day windows return correct filtered results | 🟡 | build ✅ | — |
| **Day series filling** — daySeries always has `days` entries with 0 for empty days | 🟡 | build ✅ | — |
| **Top pages** — topPages sorted desc by count, capped at 10 | 🟡 | build ✅ | — |
| **Device breakdown** — devices object always has mobile/tablet/desktop keys | 🟡 | build ✅ | — |
| **Top referrers** — referrer hostnames extracted; sorted desc; capped at 5 | 🟡 | build ✅ | — |
| **Analytics dashboard loads** — /analytics/:id renders without error | 🟡 | build ✅ | — |
| **Stat cards** — total views, top page, dominant device cards visible | 🟡 | build ✅ | — |
| **Bar chart renders** — views over time shows correct bar heights relative to max | 🟡 | build ✅ | — |
| **Period selector** — 7d/30d/90d buttons switch the period; active button highlighted | 🟡 | build ✅ | — |
| **Refresh button** — ↻ button re-fetches data | 🟡 | build ✅ | — |
| **Device pie bars** — horizontal progress bars reflect mobile/tablet/desktop percentages | 🟡 | build ✅ | — |
| **Top pages table** — path + count rows with relative bar widths | 🟡 | build ✅ | — |
| **Top referrers table** — referrer hostname + count rows | 🟡 | build ✅ | — |
| **Empty state** — "No views yet" message visible when totalViews === 0 | 🟡 | build ✅ | — |
| **Back navigation** — ← button navigates to /projects | 🟡 | build ✅ | — |
| **Preview tracking pixel** — opening /preview/:id fires POST to /api/analytics/track | 🟡 | build ✅ | — |
| **Non-blocking tracking** — tracking failure does not affect preview rendering | 🟡 | build ✅ | — |
| **Analytics button in projects** — "◑" button visible in project cards on /projects | 🟡 | build ✅ | — |
| **Analytics nav** — clicking ◑ navigates to /analytics/:projectId | 🟡 | build ✅ | — |

---

## nova-builder / v8.43.0 — Cluster 5: Developer Features (Phases 58–62 · 2026-07-08)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Custom CSS tab** — "♯" tab visible in left-sidebar icon rail | 🟡 | build ✅ | — |
| **CustomCSSPanel renders** — clicking ♯ shows scrollable textarea with hint text | 🟡 | build ✅ | — |
| **Live CSS injection** — typing in Custom CSS textarea instantly updates canvas styles | 🟡 | build ✅ | — |
| **Custom CSS persists** — Ctrl+S saves customCss; reload restores it | 🟡 | build ✅ | — |
| **Props tab in RightPanel** — "props" tab visible alongside style/settings/tokens/interact | 🟡 | build ✅ | — |
| **PropsEditorPanel renders** — selecting an instance and clicking Props tab shows prop controls | 🟡 | build ✅ | — |
| **Meta-defined props** — props defined in WsComponentMeta show with appropriate controls (color/select/boolean/url/number) | 🟡 | build ✅ | — |
| **Custom ad-hoc props** — non-meta props editable as text; "Add prop" row creates new ones | 🟡 | build ✅ | — |
| **Props write to atoms** — changing a prop value updates `$props` atom; canvas re-renders | 🟡 | build ✅ | — |
| **API Keys page** — `/settings/api` renders key management UI | 🟡 | build ✅ | — |
| **Create API key** — entering name + Create generates key, reveals full key ONCE | 🟡 | build ✅ | — |
| **Key prefix shown** — existing keys show prefix only (never full key in list) | 🟡 | build ✅ | — |
| **Revoke API key** — clicking Revoke + confirm deletes key from DB | 🟡 | build ✅ | — |
| **Webhooks GET/POST** — GET /api/projects/:id/webhooks lists; POST creates with url+events | 🟡 | build ✅ | — |
| **Webhooks DELETE** — DELETE removes webhook owner-scoped | 🟡 | build ✅ | — |
| **Templates tab** — "◈" tab visible in left-sidebar icon rail | 🟡 | build ✅ | — |
| **MarketplacePanel renders** — clicking ◈ shows 3 built-in template cards | 🟡 | build ✅ | — |
| **Apply template** — clicking "Use Template" replaces current page content with template instances + styles | 🟡 | build ✅ | — |
| **Template IDs remapped** — each apply generates fresh UIDs; applying same template twice creates independent instances | 🟡 | build ✅ | — |
| **Undo after template** — Ctrl+Z after applying template restores previous page content | 🟡 | build ✅ | — |
| **Hero template** — Landing Hero renders centered heading + paragraph + two CTA buttons | 🟡 | build ✅ | — |
| **Feature Cards template** — Feature Cards renders 3-column grid with icon/title/description | 🟡 | build ✅ | — |
| **Split template** — Two-Column Split renders left copy + right image placeholder side by side | 🟡 | build ✅ | — |
| **Branding settings page** — `/settings/branding` renders brand name + logo URL form | 🟡 | build ✅ | — |
| **Save branding** — clicking Save Branding PATCHes /api/settings/branding; shows "✓ Saved!" | 🟡 | build ✅ | — |
| **Branding preview** — logo URL + brand name preview shown below inputs | 🟡 | build ✅ | — |
| **Custom brand name in topbar** — setting branding_name replaces "Nova" text in topbar | 🟡 | build ✅ | — |
| **Custom logo in topbar** — setting branding_logo shows 24px image instead of text in topbar | 🟡 | build ✅ | — |
| **Fallback to "Nova"** — topbar shows "Nova" when no branding is configured | 🟡 | build ✅ | — |
| **htmlExporter options** — `exportToHtml` accepts `ExportOptions`; `hidePoweredBy:true` omits comment | 🟡 | build ✅ | — |
| **Brand name in export** — "Built with Nova" comment uses brandingName when set | 🟡 | build ✅ | — |

---

## nova-builder / v8.38.1 — Cluster 4: JS Interactions + AI Tools + History + Comments + Activity (Phases 46–49, 51–53 · 2026-07-08)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Interact tab visible** — "interact" tab in RightPanel alongside style/settings/tokens | 🟡 | build ✅ | — |
| **InteractionsPanel renders** — selecting an element and opening Interact tab shows interaction list | 🟡 | build ✅ | — |
| **Add interaction** — clicking "Add" creates a new interaction with trigger + action dropdowns | 🟡 | build ✅ | — |
| **Navigate action** — setting action=navigate + URL and clicking in preview mode navigates to URL | 🟡 | build ✅ | — |
| **toggleClass action** — click event in preview mode toggles the CSS class on the element | 🟡 | build ✅ | — |
| **showHide action** — click event in preview toggles `display:none` on the element | 🟡 | build ✅ | — |
| **Preview-mode-only** — interactions do NOT fire in design mode, only in preview mode | 🟡 | build ✅ | — |
| **Interactions saved** — Save includes interactions in schema_json; reload restores all defs | 🟡 | build ✅ | — |
| **Fill button in Topbar** — "Fill" tool toggle button visible in topbar right section | 🟡 | build ✅ | — |
| **AIContentPanel opens** — clicking Fill shows centered floating panel | 🟡 | build ✅ | — |
| **Content fill generates** — entering topic and clicking Generate calls /api/ai/content; fills text instances | 🟡 | build ✅ | — |
| **Content fill credited** — credit cost = ceil(textInstances.length / 5); deducted after validation | 🟡 | build ✅ | — |
| **A11y button in Topbar** — "A11y" tool toggle button visible | 🟡 | build ✅ | — |
| **A11yPanel opens** — clicking A11y shows fixed overlay panel | 🟡 | build ✅ | — |
| **A11y rule checks** — "Run Check" runs img-alt / link-href / link-text / input-label / button-text rules | 🟡 | build ✅ | — |
| **A11y issues listed** — issues show with severity (error/warning) color and fix suggestion | 🟡 | build ✅ | — |
| **A11y "Select ›" button** — clicking Select navigates to the flagged instance in canvas | 🟡 | build ✅ | — |
| **A11y no credits** — accessibility check is free (rule-based, AI enrichment optional) | 🟡 | build ✅ | — |
| **Perf button in Topbar** — "Perf" tool toggle button visible | 🟡 | build ✅ | — |
| **PerformancePanel opens** — clicking Perf shows fixed overlay panel | 🟡 | build ✅ | — |
| **Performance score** — "Analyze Page" shows 0-100 score with green/amber/red color | 🟡 | build ✅ | — |
| **Performance hints** — at least one hint shown for pages with images or deep nesting | 🟡 | build ✅ | — |
| **Perf no credits** — performance analysis is free (heuristic-only) | 🟡 | build ✅ | — |
| **⏱ button in Topbar** — "⏱" history toggle button visible | 🟡 | build ✅ | — |
| **HistoryPanel opens** — clicking ⏱ shows version history floating panel | 🟡 | build ✅ | — |
| **Save snapshot** — typing label and clicking Save creates a snapshot entry | 🟡 | build ✅ | — |
| **Snapshot list** — HistoryPanel lists up to 25 snapshots newest-first with formatted date | 🟡 | build ✅ | — |
| **Restore snapshot** — clicking Restore with confirmation replaces project schema_json; "Before restore" checkpoint saved | 🟡 | build ✅ | — |
| **HistoryPanel Escape** — Escape key closes the panel | 🟡 | build ✅ | — |
| **Comments tab in sidebar** — 💬 tab visible in left-sidebar icon rail | 🟡 | build ✅ | — |
| **CommentsPanel renders** — clicking 💬 shows textarea + comment list | 🟡 | build ✅ | — |
| **Post comment** — typing comment body and clicking Post creates a new comment | 🟡 | build ✅ | — |
| **Pin to element** — "Pin to selected element" checkbox attaches instanceId to comment | 🟡 | build ✅ | — |
| **Resolve comment** — clicking Resolve marks comment resolved; toggle back with Unresolve | 🟡 | build ✅ | — |
| **Delete comment** — clicking × deletes the comment (owner-scoped) | 🟡 | build ✅ | — |
| **Show resolved filter** — "Show resolved" checkbox reveals resolved comments | 🟡 | build ✅ | — |
| **Activity tab in sidebar** — ◎ tab visible in left-sidebar icon rail | 🟡 | build ✅ | — |
| **ActivityPanel renders** — clicking ◎ shows recent events list | 🟡 | build ✅ | — |
| **Activity events listed** — saves/deploys/AI ops appear as timestamped rows with icons | 🟡 | build ✅ | — |
| **Activity time-ago** — timestamps shown as "Xm ago" / "Xh ago" / "Xd ago" | 🟡 | build ✅ | — |
| **Activity refresh** — "↻" button re-fetches the event list | 🟡 | build ✅ | — |

---

## nova-builder / v8.33.0 — Cluster 3: Export + GitHub + Deploy + Dims + Netlify/CF (Phases 38–40, 42–43 · Minor · 2026-07-08)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **"↓ HTML" button visible** — download link appears in topbar right section | 🟡 | build ✅ | — |
| **HTML export downloads** — clicking "↓ HTML" triggers browser download of .html file | 🟡 | build ✅ | — |
| **Exported HTML is self-contained** — opening downloaded file in browser renders the page without any external requests | 🟡 | build ✅ | — |
| **CSS classes applied** — exported HTML includes `<style>` block with per-instance CSS classes | 🟡 | build ✅ | — |
| **Base breakpoint only** — styles from non-base breakpoints are omitted from export | 🟡 | build ✅ | — |
| **Void elements correct** — `<img>`, `<input>` rendered without closing tags | 🟡 | build ✅ | — |
| **GitHub push API** — POST /api/projects/[id]/github with token/owner/repo/branch pushes project.json | 🟡 | build ✅ | — |
| **GitHub returns SHA** — response includes { sha, url } after successful push | 🟡 | build ✅ | — |
| **GitHub no-file create** — pushing to a repo without project.json creates the file (sha=null path) | 🟡 | build ✅ | — |
| **"Deploy ▾" button visible** — Deploy button appears in topbar right section | 🟡 | build ✅ | — |
| **DeployPanel opens** — clicking Deploy opens floating popover with provider tabs | 🟡 | build ✅ | — |
| **Provider tabs switch** — Vercel/Netlify/CF Pages tabs show different form fields | 🟡 | build ✅ | — |
| **DeployPanel closes** — Escape key and outside click close the panel | 🟡 | build ✅ | — |
| **Vercel deploy** — filling token + repo + branch and clicking Deploy → triggers Vercel deploy | 🟡 | build ✅ | — |
| **Netlify deploy** — filling token + siteId and clicking Deploy → triggers Netlify deploy | 🟡 | build ✅ | — |
| **Cloudflare deploy** — filling token + accountId + projectName → triggers CF Pages deploy | 🟡 | build ✅ | — |
| **Deploy status shown** — "Deploying…" spinner, then success URL or error message | 🟡 | build ✅ | — |
| **PNG dimensions detected** — uploading a PNG asset returns width/height in response | 🟡 | build ✅ | — |
| **JPEG dimensions detected** — uploading a JPEG asset returns width/height in response | 🟡 | build ✅ | — |
| **Non-image dimensions empty** — SVG/font uploads have no width/height in response | 🟡 | build ✅ | — |
| **packages/deploy exports 3 deployers** — importing `@studio/deploy` exposes triggerVercel/Netlify/CF | 🟡 | build ✅ | — |

---

## nova-builder / v8.28.0 — Cluster 2: Style Tokens + Rich Text + Form Builder (Phases 33, 34, 36 · Minor · 2026-07-08)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Tokens tab visible** — "tokens" tab in RightPanel header alongside style/settings | 🟡 | build ✅ | — |
| **StyleTokensPanel renders** — tokens tab shows create-token form and "No tokens" empty state | 🟡 | build ✅ | — |
| **Create token** — typing name and clicking Create adds a token row to the panel | 🟡 | build ✅ | — |
| **Apply token to instance** — clicking Apply on a token adds tokenId to front of instance's styleSourceSelections | 🟡 | build ✅ | — |
| **Remove token from instance** — Remove button filters token out of instance's values[] | 🟡 | build ✅ | — |
| **Delete token globally** — Delete removes token from $styleSources and all $styleSourceSelections | 🟡 | build ✅ | — |
| **Token "T" badge in StyleInspector** — properties sourced from a token show purple "T" badge with tooltip | 🟡 | build ✅ | — |
| **Token property color** — token-sourced property names render in purple (#a78bfa) | 🟡 | build ✅ | — |
| **Rich text Ctrl+B** — double-click a text element, select text, Ctrl+B → bold applied via execCommand | 🟡 | build ✅ | — |
| **Rich text Ctrl+I** — Ctrl+I → italic | 🟡 | build ✅ | — |
| **Rich text Ctrl+U** — Ctrl+U → underline | 🟡 | build ✅ | — |
| **Floating format toolbar** — B/I/U buttons appear above canvas while text editing is active | 🟡 | build ✅ | — |
| **Toolbar buttons format text** — clicking B/I/U in toolbar posts nova:formatText to canvas, applies formatting | 🟡 | build ✅ | — |
| **Rich text commit** — Enter/blur commits html+text; nova:textCommit parsed into Bold/Italic child instances | 🟡 | build ✅ | — |
| **parseRichHtml round-trip** — nested <b><i>text</i></b> produces correct Bold/Italic instance tree | 🟡 | build ✅ | — |
| **Settings tab → FormSettingsPanel** — selecting a Form/Input/etc. element shows FormSettingsPanel in Settings tab | 🟡 | build ✅ | — |
| **Settings tab → SettingsPanel fallback** — selecting a non-form element shows standard SettingsPanel | 🟡 | build ✅ | — |
| **Form action field** — typing in Action URL field writes `action` prop to $props | 🟡 | build ✅ | — |
| **Input type select** — changing type dropdown writes `type` prop (text/email/password/etc.) | 🟡 | build ✅ | — |
| **Required boolean** — toggling Required select writes boolean prop to $props | 🟡 | build ✅ | — |
| **Undo form prop change** — Ctrl+Z reverts a prop written via FormSettingsPanel | 🟡 | build ✅ | — |

---

## nova-builder / v8.25.0 — Cluster 1: Breakpoints + CSS Vars + SEO + Folders (Phases 29–32 · Minor · 2026-07-08)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Gear icon visible** — ⚙ button appears in topbar after breakpoint pills | 🟡 | build ✅ | — |
| **BreakpointManager opens** — clicking ⚙ shows floating popover with breakpoint rows | 🟡 | build ✅ | — |
| **Edit breakpoint label** — typing in label input updates breakpoint name in pills immediately | 🟡 | build ✅ | — |
| **Edit maxWidth** — changing maxWidth number resizes canvas; pill tooltip updates | 🟡 | build ✅ | — |
| **Delete breakpoint** — "×" removes row; base breakpoint × is disabled | 🟡 | build ✅ | — |
| **Add breakpoint** — "+ Add breakpoint" appends Mobile/640px row; appears in pill list | 🟡 | build ✅ | — |
| **Manager closes on outside click** — clicking elsewhere dismisses the popover | 🟡 | build ✅ | — |
| **Manager closes on Escape** — Escape key dismisses | 🟡 | build ✅ | — |
| **§ CSS Vars tab visible** — "§" icon in left sidebar icon rail | 🟡 | build ✅ | — |
| **StylesPanel renders** — clicking § opens CSS Variables panel; empty state shows placeholder | 🟡 | build ✅ | — |
| **Add var** — typing name + value and pressing Enter or clicking button adds a row | 🟡 | build ✅ | — |
| **Name validation** — blank name or invalid chars show error; valid names accepted | 🟡 | build ✅ | — |
| **Edit var value** — changing value input immediately updates the var | 🟡 | build ✅ | — |
| **Delete var** — "×" removes the row | 🟡 | build ✅ | — |
| **Canvas :root injection** — canvas `<style id="nova-css-vars">` reflects current vars; elements using `var(--name)` update | 🟡 | build ✅ | — |
| **CSS vars saved** — Save writes `cssVars` alongside `data` in `schema_json`; reload restores vars | 🟡 | build ✅ | — |
| **Pages SEO panel** — double-clicking a page shows SEO title / meta description / noindex (P31 already built) | 🟡 | pre-existing | — |
| **Pages folders** — pages panel shows folder groups; create/rename/delete folder (P32 already built) | 🟡 | pre-existing | — |

---

## nova-builder / v8.21.0 — CSS Grid Editor (Phase 28 · Minor · 2026-07-07)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **GridContainerPanel visible** — "Grid Tracks" header + Columns/Rows sections in right inspector | 🟡 | build ✅ | — |
| **Add column track** — "+" in Columns section appends `1fr` track; track count updates | 🟡 | build ✅ | — |
| **Edit column track value** — typing `100px`, `auto`, `minmax(0,1fr)` etc. in track input updates CSS | 🟡 | build ✅ | — |
| **Remove column track** — "×" removes track; disabled when only 1 track remains | 🟡 | build ✅ | — |
| **Add/edit/remove row track** — same as column behavior for Rows section | 🟡 | build ✅ | — |
| **Track count header** — "N×M" label updates when tracks change | 🟡 | build ✅ | — |
| **GridChildPanel visible** — "Grid Placement" header + col/row start+span inputs | 🟡 | build ✅ | — |
| **Col start/span inputs** — changing col-start writes `gridColumn: N`; changing col-span writes `gridColumn: N / span M` | 🟡 | build ✅ | — |
| **Row start/span inputs** — same behavior for `gridRow` | 🟡 | build ✅ | — |
| **Grid props excluded from Layout section** — `gridTemplateColumns/Rows` and `gridColumn/Row` show only in dedicated panels, not as generic keyword rows | 🟡 | build ✅ | — |
| **Undo/redo** — Ctrl+Z reverts grid track or placement edit (captureSnapshot via writeStyleProperty) | 🟡 | build ✅ | — |

---

## nova-builder / v8.20.0 — Babel ESM Fix + Demo Mode (Backfill · Minor · 2026-07-07)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Babel CJS fix** — no `_interopRequireDefault is not a function` crash on any page | 🟡 | build ✅ | — |
| **Try Demo button** — visible in marketing page nav; navigates to `/builder/demo` without auth | 🟡 | build ✅ | — |
| **Demo builder loads** — `/builder/demo` loads with pre-seeded Hero+Features layout | 🟡 | build ✅ | — |
| **Demo topbar** — shows "Demo — edits not saved" label + "Sign up free →" CTA instead of Save/Publish/AI | 🟡 | build ✅ | — |
| **Demo save no-op** — editing elements in demo does not write to Supabase | 🟡 | build ✅ | — |
| **Demo public** — `/builder/demo` and `/api/projects/demo` accessible without session | 🟡 | build ✅ | — |

---

## nova-builder / v8.19.1 — Runtime Fixes: CJS Babel + Nested Body (Patch · 2026-07-07)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **`_interopRequireDefault is not a function` eliminated** — CJS babel helper alias map forces all `@babel/runtime/helpers/*` to absolute CJS paths; next-auth loads without runtime crash | 🟡 | build ✅; server restarted + homepage loaded without error overlay | — |
| **`<body>` nested in `<body>` eliminated** — canvas renderer swaps `Body` component to `<div>`; React no longer reports "body cannot contain a nested body" | 🟡 | build ✅; browser QA needed on /canvas route | — |
| **Hydration mismatch warning suppressed** — `suppressHydrationWarning` on `<html>` silences Katalon extension attribute injection | 🟡 | build ✅; browser QA needed | — |
| **Canvas body div preserves attributes** — swapped `<div>` retains `data-ws-id`, `data-ws-component`, `data-ws-selector`, selection/hover outlines | 🟡 | build ✅; browser QA needed on canvas element selection | — |

---

## nova-builder / v8.19.0 — Background Gradients (Phase 27 · Minor · 2026-07-06)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **GradientPanel visible** — "Gradient" header + "+" button in right inspector for any selected instance | 🟡 | build ✅ | — |
| **Add gradient** — "+" creates indigo→violet linear-gradient; preview swatch renders immediately | 🟡 | build ✅ | — |
| **Type switcher** — changing Linear→Radial re-serializes as `radial-gradient(ellipse at center, ...)` | 🟡 | build ✅ | — |
| **Angle control** — editing angle (0–360) updates live preview; wraps via modulo | 🟡 | build ✅ | — |
| **Radial shape selector** — Ellipse / Circle option changes gradient shape | 🟡 | build ✅ | — |
| **Add stop** — "+ Stop" appends at last position + 20 (clamped 100); canvas re-renders | 🟡 | build ✅ | — |
| **Delete stop disabled** — "×" grayed when exactly 2 stops remain | 🟡 | build ✅ | — |
| **Remove gradient** — "×" on card removes layer; CSS updates to remaining gradients or "none" | 🟡 | build ✅ | — |
| **`backgroundImage` excluded from generic rows** — no keyword row for `backgroundImage` in Background section | 🟡 | build ✅ | — |
| **Undo/redo** — Ctrl+Z reverts gradient edit (captureSnapshot via writeStyleProperty) | 🟡 | build ✅ | — |

---

## nova-builder / v8.18.2 — Full-Project SOLID Audit + CI OOM Fix (Patch · 2026-07-06)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **SOLID audit scans 9 packages** — `apps/nova-builder`, `apps/studio`, 7 `packages/` | 🟡 | script run ✅ | — |
| **Legacy-exempt policy** — `apps/studio/` + 4 deprecated packages capped at WARN | 🟡 | audit output ✅ | — |
| **0 BLOCKING violations full-project** — tier gate passes on 396 files | 🟡 | exit 0 ✅ | — |
| **CI tests sequential** — `--concurrency=1` + 4 GB heap; no OOM crash | 🟡 | ci.yml fix ✅ | — |

---

## nova-builder / v8.18.1 — CI Lint Fix (Patch · 2026-07-06)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **CI lint passes** — `next lint` exits 0 in CI (no interactive prompt, no rule errors) | 🟡 | local ✅ | — |
| **`doc/SOLID-AUDIT.md`** — audit doc exists with Tier 1 + Tier 2 results | 🟡 | file ✅ | — |

---

## nova-builder / v8.18.0 — SOLID Audit Tier 2 Gate (Infrastructure · 2026-07-06)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **CI — turbo typecheck passes** (no cyclic dependency error) | 🟡 | turbo.json fix ✅ | — |
| **CI — validateCompositionWS.ts compiles** (no TS strict errors) | 🟡 | tsc fix ✅ | — |
| **CI — ws-* packages excluded from typecheck scope** (filter applied) | 🟡 | ci.yml fix ✅ | — |
| **`pnpm solid:audit` exits 0** (no BLOCKING violations) | 🟡 | audit run ✅ | — |
| **`styleWriteHelper.ts` — single write-path abstraction** (all editors import it) | 🟡 | build ✅ | — |
| **`StyleStateSelector.tsx` — extracted StateSelector** (separate file) | 🟡 | build ✅ | — |
| **`StyleAddProperty.tsx` — extracted AddPropertyRow** (separate file) | 🟡 | build ✅ | — |
| **`StyleInspector.tsx` — 612 lines** (under 700-line BLOCKING threshold) | 🟡 | wc -l ✅ | — |

---

## nova-builder / v8.17.0 — Filters + Backdrop Filters (Phase 26 · Minor · Sonnet · 2026-07-06)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **26A Filter panel visible**: selecting any instance shows a "Filter" section below the Animation panel | 🟡 | build ✅ | — |
| **26A Add blur filter**: "+" adds a `blur(4px)` default layer; canvas element visually blurs by 4px | 🟡 | build ✅ | — |
| **26A Blur value input**: changing blur to 10 writes `blur(10px)` to the `filter` property | 🟡 | build ✅ | — |
| **26A Brightness filter**: adding brightness(100%) layer and changing to 50 writes `brightness(50%)`; element appears dimmed on canvas | 🟡 | build ✅ | — |
| **26A Contrast filter**: adding and editing contrast(100%) → contrast(200%) increases element contrast on canvas | 🟡 | build ✅ | — |
| **26A Grayscale filter**: grayscale(100%) desaturates the element to full black-and-white | 🟡 | build ✅ | — |
| **26A Hue-rotate filter**: hue-rotate(90deg) shifts element hue by 90 degrees; negative values work | 🟡 | build ✅ | — |
| **26A Invert filter**: invert(100%) inverts element colors | 🟡 | build ✅ | — |
| **26A Opacity filter**: opacity(50%) makes element 50% transparent via filter (distinct from the `opacity` CSS property) | 🟡 | build ✅ | — |
| **26A Saturate filter**: saturate(200%) increases color saturation | 🟡 | build ✅ | — |
| **26A Sepia filter**: sepia(100%) applies sepia tone | 🟡 | build ✅ | — |
| **26B Drop-shadow filter**: adding drop-shadow shows 4 sub-fields (X/Y/Blur/Color); changing values updates `drop-shadow(Xpx Ypx Blurpx color)` | 🟡 | build ✅ | — |
| **26B Drop-shadow color swatch**: clicking color swatch opens native color picker; changing hex updates the rgba color; alpha input (0–1) changes transparency | 🟡 | build ✅ | — |
| **26B Function change resets defaults**: switching from blur to hue-rotate resets value to 0deg; switching to drop-shadow shows X/Y/Blur/Color fields | 🟡 | build ✅ | — |
| **26C Multiple filter layers**: "+" twice produces `blur(4px) brightness(100%)`; each layer independently editable | 🟡 | build ✅ | — |
| **26C Remove filter layer**: "×" removes a layer; remaining layers stay; empty → CSS becomes "none" | 🟡 | build ✅ | — |
| **26C Filter undo/redo**: add blur → Ctrl+Z → removed; Ctrl+Shift+Z → restored | 🟡 | build ✅ | — |
| **26D Backdrop Filter panel visible**: "Backdrop Filter" section appears below Filter panel | 🟡 | build ✅ | — |
| **26D Backdrop blur**: adding blur(10px) in Backdrop Filter panel applies backdrop blur behind element (glass-morphism) | 🟡 | build ✅ | — |
| **26D Backdrop Filter independent**: editing backdrop filter does not affect the `filter` property | 🟡 | build ✅ | — |
| **26E filter not in Effects section**: the generic keyword row for `filter` no longer appears in the Effects accordion | 🟡 | build ✅ | — |
| **26E backdropFilter not in Effects section**: the generic keyword row for `backdropFilter` no longer appears in the Effects accordion | 🟡 | build ✅ | — |
| **26E Multi-select fan-out**: with 2+ instances selected, adding a filter applies to all selected instances | 🟡 | build ✅ | — |

---

## nova-builder / v8.16.0 — Transitions + CSS Animations (Phase 25 · Minor · Sonnet · 2026-07-06)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **25A Transition panel visible**: selecting any instance shows a "Transition" section below shadow panels | 🟡 | build ✅ | — |
| **25A Add transition layer**: "+" adds a layer with property=all, duration=300ms, easing=ease, delay=0ms | 🟡 | build ✅ | — |
| **25A Transition property field**: typing "opacity" in the property input and blurring writes `opacity 300ms ease 0ms` to the `transition` CSS property | 🟡 | build ✅ | — |
| **25A Transition datalist**: clicking the property field shows common CSS property suggestions (all, opacity, transform, color, etc.) | 🟡 | build ✅ | — |
| **25A Transition duration input**: changing duration to 500 updates CSS to `all 500ms ease 0ms` | 🟡 | build ✅ | — |
| **25A Transition delay input**: changing delay to 100 updates CSS to `all 300ms ease 100ms` | 🟡 | build ✅ | — |
| **25A Transition easing select**: choosing "ease-in-out" updates the easing token in the CSS value | 🟡 | build ✅ | — |
| **25A Multiple transition layers**: "+" twice produces `all 300ms ease 0ms, all 300ms ease 0ms`; each layer is independently editable | 🟡 | build ✅ | — |
| **25A Remove transition layer**: "×" removes a layer; CSS collapses to remaining layers or "none" | 🟡 | build ✅ | — |
| **25A Transition undo/redo**: add layer → Ctrl+Z → removed; Ctrl+Shift+Z → restored | 🟡 | build ✅ | — |
| **25B Animation panel visible**: "Animation" section appears below Transition panel | 🟡 | build ✅ | — |
| **25B Add animation layer**: "+" adds `fadeIn 500ms ease 0ms 1 normal forwards` | 🟡 | build ✅ | — |
| **25B Animation name datalist**: clicking name field shows 12 preset options (fadeIn, slideInLeft, spin, etc.) | 🟡 | build ✅ | — |
| **25B Animation duration/delay inputs**: changing values updates the CSS string correctly | 🟡 | build ✅ | — |
| **25B Animation repeat field**: typing "infinite" or selecting from datalist writes `infinite` in the iteration-count position | 🟡 | build ✅ | — |
| **25B Animation direction select**: choosing "alternate" updates direction token | 🟡 | build ✅ | — |
| **25B Animation fill select**: choosing "forwards" updates fill-mode token | 🟡 | build ✅ | — |
| **25B Animation easing select**: choosing "ease-out" updates the timing-function token | 🟡 | build ✅ | — |
| **25B Multiple animation layers**: two animations play simultaneously on canvas | 🟡 | build ✅ | — |
| **25B Remove animation layer**: "×" removes layer; CSS collapses or becomes "none" | 🟡 | build ✅ | — |
| **25C fadeIn preset plays**: applying `animation: fadeIn 500ms ease 0s 1 normal forwards` causes the element to fade in on the canvas | 🟡 | build ✅ | — |
| **25C spin preset plays**: `animation: spin 1s linear infinite` causes the element to rotate continuously | 🟡 | build ✅ | — |
| **25C bounce/pulse play**: respective keyframes produce the bounce and pulse animations | 🟡 | build ✅ | — |
| **25D transition not in Effects section**: the generic keyword row for `transition` no longer appears in the Effects accordion | 🟡 | build ✅ | — |
| **25D animation not in Effects section**: the generic keyword row for `animation` no longer appears in the Effects accordion | 🟡 | build ✅ | — |
| **25D multi-select fan-out**: with 2+ instances selected, transition/animation changes apply to all selected instances | 🟡 | build ✅ | — |

---

## nova-builder / v8.15.0 — CSS Transforms (Phase 24 · Minor · Sonnet · 2026-07-06)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **24A Transform panel visible**: selecting any instance shows a "Transform" section in the right panel with 4 sub-rows (Translate/Rotate/Scale/Skew), all inactive initially | 🟡 | build ✅ | — |
| **24B Add Translate**: clicking "+" on Translate row activates it with X=0, Y=0; canvas gets `transform: translateX(0px) translateY(0px)` | 🟡 | build ✅ | — |
| **24B Translate X/Y inputs**: changing X to 50 updates canvas to `translateX(50px)`; Y works the same; arrow keys nudge ±1px (Shift = ±10px) | 🟡 | build ✅ | — |
| **24B Add Rotate**: clicking "+" on Rotate row activates with X=0, Y=0, Z=0; canvas gets `transform: rotate(0deg)` | 🟡 | build ✅ | — |
| **24B Rotate Z input**: changing Z to 45 updates canvas to `rotate(45deg)`; negative values work; arrow keys nudge ±1deg | 🟡 | build ✅ | — |
| **24B Rotate X/Y inputs**: changing X to 30 adds `rotateX(30deg)` before `rotate(...)`; setting X back to 0 removes it from CSS | 🟡 | build ✅ | — |
| **24B Add Scale**: clicking "+" activates with X=1, Y=1; canvas gets `scaleX(1) scaleY(1)` | 🟡 | build ✅ | — |
| **24B Scale X/Y inputs**: changing X to 1.5 updates canvas to `scaleX(1.5)`; step 0.01; Shift+arrow = ±0.1 | 🟡 | build ✅ | — |
| **24B Add Skew**: clicking "+" activates with X=0, Y=0; canvas gets `skewX(0deg) skewY(0deg)` | 🟡 | build ✅ | — |
| **24B Skew X/Y inputs**: changing X to 15 updates canvas to `skewX(15deg)` | 🟡 | build ✅ | — |
| **24B Remove section**: clicking "×" on an active section removes all its functions from the transform CSS; other active sections are preserved | 🟡 | build ✅ | — |
| **24B Combined transforms**: all 4 sections active simultaneously produces valid combined CSS: `translateX(50px) translateY(0px) rotate(45deg) scaleX(1.5) scaleY(1.5) skewX(10deg) skewY(0deg)` | 🟡 | build ✅ | — |
| **24C Undo/redo**: adding translate → Ctrl+Z → removed; Ctrl+Shift+Z → restored | 🟡 | build ✅ | — |
| **24C transform not in Effects section**: the generic keyword row for `transform` no longer appears in the Effects accordion | 🟡 | build ✅ | — |
| **24C Existing transform parses correctly**: opening an instance with `transform: rotate(45deg) scale(1.5)` shows Rotate active (Z=45) and Scale active (X=1.5, Y=1.5) | 🟡 | build ✅ | — |
| **24C Multi-select fan-out**: with 2+ instances selected, adding/editing a transform applies to all selected instances | 🟡 | build ✅ | — |

---

## nova-builder / v8.14.0 — Box shadows + text shadows (Phase 23 · Minor · Sonnet · 2026-07-06)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **23A Box Shadow panel visible**: selecting any instance shows a "Box Shadow" section in the right panel with a "+" button, even when no shadow is set | 🟡 | build ✅ | — |
| **23A Text Shadow panel visible**: selecting any instance shows a "Text Shadow" section below Box Shadow, even when no shadow is set | 🟡 | build ✅ | — |
| **23B Add box shadow**: clicking "+" in Box Shadow panel adds a default layer (0px 4px 8px 0px rgba(0,0,0,0.25)) and applies it to the canvas | 🟡 | build ✅ | — |
| **23B Add text shadow**: clicking "+" in Text Shadow panel adds a default layer (0px 4px 8px rgba(0,0,0,0.25)) and applies it to the canvas | 🟡 | build ✅ | — |
| **23B Add multiple box shadows**: clicking "+" multiple times adds independent shadow layers; all are applied as a comma-separated `box-shadow` CSS value | 🟡 | build ✅ | — |
| **23B X offset numeric input**: changing X in a box shadow layer updates the canvas; ↑/↓ arrow keys nudge by 1px; Shift+↑/↓ nudges by 10px | 🟡 | build ✅ | — |
| **23B Y offset numeric input**: changing Y updates the canvas shadow position | 🟡 | build ✅ | — |
| **23B Blur radius input**: changing blur updates canvas; value clamped to ≥0 | 🟡 | build ✅ | — |
| **23B Spread radius input (box only)**: changing spread updates canvas; negative spread reduces the shadow | 🟡 | build ✅ | — |
| **23B Color swatch**: clicking color swatch opens browser color picker; selecting a new color immediately updates canvas shadow color | 🟡 | build ✅ | — |
| **23B Inset toggle (box only)**: clicking "out"/"in" toggles the inset keyword; canvas updates immediately; button turns purple when inset | 🟡 | build ✅ | — |
| **23B Delete shadow layer**: clicking × on a layer removes it; if last layer is removed, `box-shadow: none` is applied; Undo restores | 🟡 | build ✅ | — |
| **23C Undo/redo**: adding a shadow layer → Ctrl+Z → layer removed; Ctrl+Shift+Z → layer restored | 🟡 | build ✅ | — |
| **23C boxShadow not in Effects section**: the generic keyword row for `boxShadow` no longer appears in the Effects accordion — only the dedicated Shadow panel shows it | 🟡 | build ✅ | — |
| **23C textShadow not in Effects section**: same as above for `textShadow` | 🟡 | build ✅ | — |
| **23C Existing shadow parses correctly**: opening an instance that already has a `box-shadow` value (e.g. set by AI compose) shows the parsed layer(s) in the editor with correct x/y/blur/spread/color values | 🟡 | build ✅ | — |
| **23C Multi-select fan-out**: with 2+ instances selected, adding/editing a shadow applies to all selected instances simultaneously | 🟡 | build ✅ | — |

---

## nova-builder / v8.13.0 — Canvas right-click context menu (Phase 21 · Minor · Sonnet · 2026-07-06)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **21A Right-click suppresses native menu**: right-clicking any canvas element does not show the browser's native context menu | 🟡 | build ✅ | — |
| **21A Instance selected on right-click**: right-clicking an element selects it in the Navigator before the context menu appears | 🟡 | build ✅ | — |
| **21A Right-click on background**: right-clicking empty canvas area (no `[data-ws-selector-id]`) does nothing — no message sent, no menu | 🟡 | build ✅ | — |
| **21B Menu appears at cursor position**: menu portal appears at the right-clicked position in the builder window, correctly offset by iframe position and zoom | 🟡 | build ✅ | — |
| **21B Menu clamped to viewport**: menu never clips off the right or bottom edge of the browser window | 🟡 | build ✅ | — |
| **21B Escape closes menu**: pressing Escape dismisses the context menu | 🟡 | build ✅ | — |
| **21B Click-outside closes menu**: clicking anywhere outside the menu card dismisses it | 🟡 | build ✅ | — |
| **21B Copy**: stores selected subtree in `$clipboard`; does not mutate the tree; subsequent Paste or ⌘V shows the item | 🟡 | build ✅ | — |
| **21B Cut**: stores subtree in clipboard then deletes the instance; canvas updates; Undo restores | 🟡 | build ✅ | — |
| **21B Paste**: pastes clipboard subtree as sibling-after the right-clicked instance; new clone selected; Paste item hidden when clipboard is empty | 🟡 | build ✅ | — |
| **21B Duplicate**: clones the right-clicked instance with fresh IDs; clone inserted after original; clone selected | 🟡 | build ✅ | — |
| **21B Wrap in Box**: wraps right-clicked instance in a new Box; Box becomes selected | 🟡 | build ✅ | — |
| **21B Select parent**: selects the parent instance of the right-clicked element; no-op on root instance | 🟡 | build ✅ | — |
| **21B Delete**: removes right-clicked instance; selection cleared; Undo restores | 🟡 | build ✅ | — |
| **21B Zoom correctness**: at 150% canvas zoom, menu still appears at the correct visual position aligned to where the user clicked | 🟡 | build ✅ | — |

---

## nova-builder / v8.12.0 — Command palette ⌘K (Phase 20 · Minor · Sonnet · 2026-07-06)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **20A ⌘K opens palette**: pressing ⌘K (macOS) or Ctrl+K (Windows) in the builder opens the command palette overlay | 🟡 | build ✅ | — |
| **20A ⌘K toggles closed**: pressing ⌘K again while palette is open closes it | 🟡 | build ✅ | — |
| **20A Escape closes**: pressing Escape anywhere in the palette closes it | 🟡 | build ✅ | — |
| **20A Backdrop click closes**: clicking the semi-opaque backdrop outside the palette card closes it | 🟡 | build ✅ | — |
| **20B Search autofocus**: opening palette auto-focuses the search input; query cleared on re-open | 🟡 | build ✅ | — |
| **20B Pages group**: all project pages listed under "Pages" heading; clicking an item navigates to that page | 🟡 | build ✅ | — |
| **20B Components group**: registered components (≤40) listed under "Components"; clicking inserts instance as child of selected/root | 🟡 | build ✅ | — |
| **20B Actions — Duplicate**: fires duplicateInstance on selected; new clone selected; palette closes | 🟡 | build ✅ | — |
| **20B Actions — Delete**: fires deleteInstance on selected; selection cleared; palette closes | 🟡 | build ✅ | — |
| **20B Actions — Wrap in Box**: wraps selected instance in a new Box; Box selected; palette closes | 🟡 | build ✅ | — |
| **20B Actions — Undo / Redo**: fires undo()/redo() and closes palette | 🟡 | build ✅ | — |
| **20B Actions — Open AI**: sets `$aiPanelOpen = true` and closes palette | 🟡 | build ✅ | — |
| **20B Keyboard navigation**: ↑/↓ move active highlight; Enter fires highlighted item's action; mouseEnter syncs highlight | 🟡 | build ✅ | — |
| **20B Active item scrolls into view**: rapidly navigating with arrow keys keeps active item visible in the scrollable list | 🟡 | build ✅ | — |
| **20B Search filtering**: typing "box" filters to Box component + Wrap in Box action; empty query shows all | 🟡 | build ✅ | — |
| **20B "No results" state**: query with no matches shows "No results for '…'" message | 🟡 | build ✅ | — |
| **20B Footer hint bar**: ↑↓ / ↵ / Esc key hints always visible at palette bottom | 🟡 | build ✅ | — |

---

## nova-builder / v8.11.0 — Pages: SEO fields + folder organization (Phase 19 · Minor · Sonnet · 2026-07-06)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **19A SEO toggle button**: active page row shows "▼ SEO" button; clicking expands SEO panel; clicking "▲ SEO" collapses it | 🟡 | build ✅ | — |
| **19A Browser title field**: input pre-filled with `page.title` (falls back to `page.name`); blur/Enter commits via `updatePageSeo({ title })` | 🟡 | build ✅ | — |
| **19A Meta description field**: textarea pre-filled with `page.meta.description`; blur commits via `updatePageSeo({ description })` | 🟡 | build ✅ | — |
| **19A Noindex checkbox**: checked when `page.meta.excludePageFromSearch === "true"`; onChange immediately calls `updatePageSeo({ noindex })` | 🟡 | build ✅ | — |
| **19A SEO undo**: `captureSnapshot()` called before each SEO mutation; Ctrl+Z reverts SEO field change | 🟡 | build ✅ | — |
| **19B `createPage` folder registration**: new page ID added to `rootFolderId` folder's `children`; page visible in folder tree after creation | 🟡 | build ✅ | — |
| **19B `deletePage` folder cleanup**: deleted page ID removed from its folder's `children`; stale ID no longer lingers | 🟡 | build ✅ | — |
| **19B `createFolder`**: creates folder with name + derived slug; appended to root folder's `children`; appears in pages tree | 🟡 | build ✅ | — |
| **19B `renameFolder`**: folder name + slug updated; root folder cannot be renamed | 🟡 | build ✅ | — |
| **19B `deleteFolder`**: folder deleted; its page children reparented to the folder's parent | 🟡 | build ✅ | — |
| **19B FolderItem expand/collapse**: clicking ▶/▼ toggles folder children; children indented with left guide line | 🟡 | build ✅ | — |
| **19B FolderItem rename**: double-click folder name → inline input; Enter/blur commits; Escape cancels | 🟡 | build ✅ | — |
| **19B FolderItem delete**: hover shows × button; clicking triggers confirm dialog → deletes folder, reparents pages | 🟡 | build ✅ | — |
| **19B Folder-tree rendering**: pages panel renders from `rootFolderId` → `folder.children`; folders render as FolderItem wrapping their page children | 🟡 | build ✅ | — |
| **19B "+ Folder" button**: footer shows "+ Page" and "+ Folder"; clicking "+ Folder" shows inline name form; Enter creates folder | 🟡 | build ✅ | — |

---

## nova-builder / v8.10.0 — Navigator: cross-parent DnD + keyboard navigation (Phase 18 · Minor · Sonnet · 2026-07-05)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **18A `dropPosition` type**: `DndState` now has `dropPosition: "above" | "below" | "into" | null` replacing `dropAbove: boolean` | 🟡 | build ✅ | — |
| **18A `canAcceptChildren`**: text-only components (Heading, Paragraph, RichText, Bold, Italic, Span, Label, Code, TextBlock) rejected as drop-into targets | 🟡 | build ✅; logic: dragging onto Heading in middle zone → no "into" highlight | — |
| **18A Cycle guard `isAncestorOf`**: dragging a parent onto its own descendant → rejected before any mutation | 🟡 | build ✅; browser: drag Box onto its child → drop rejected (no move) | — |
| **18A Cross-parent drop (above/below)**: drag an instance from parent A and drop above/below a child of parent B → instance moves to correct position in B | 🟡 | build ✅; browser: drag row from one section to sibling row in another → correct position | — |
| **18A Drop-into container**: drag instance to middle zone of an expanded container → instance appended as last child of that container | 🟡 | build ✅; browser: drag onto middle of Box → "into" purple highlight → drop → appears as last child | — |
| **18A Same-parent reorder preserved**: dragging within same parent still works correctly (uses `reorderInParent`) | 🟡 | build ✅; browser: reorder siblings → order updates in navigator and canvas | — |
| **18A Undo after cross-parent move**: `captureSnapshot()` called before `moveToNewParent`; Ctrl+Z restores original position | 🟡 | build ✅; browser: cross-parent drag → Ctrl+Z → instance back in original parent | — |
| **18B TreeRow "above" indicator**: dashed purple border-top on target row when drop position is "above" | 🟡 | build ✅; browser: drag to top quarter of row → dashed line appears at top | — |
| **18B TreeRow "below" indicator**: dashed purple border-bottom on target row when drop position is "below" | 🟡 | build ✅; browser: drag to bottom quarter of row → dashed line at bottom | — |
| **18B TreeRow "into" indicator**: purple-tinted background + dashed outline on target row when drop position is "into" | 🟡 | build ✅; browser: drag to middle of container row → row highlights purple with outline | — |
| **18C ArrowDown/Up navigation**: selects next/previous visible row in flattened tree (respects expand/collapse state) | 🟡 | build ✅; browser: select a row → ArrowDown → next visible row selected; ArrowUp → goes back | — |
| **18C ArrowRight expand/enter**: collapsed node → expand; expanded node → select first child | 🟡 | build ✅; browser: ArrowRight on collapsed Box → expands; ArrowRight again → selects first child | — |
| **18C ArrowLeft collapse/parent**: expanded node with children → collapse; leaf or collapsed → select parent | 🟡 | build ✅; browser: ArrowLeft on expanded Box → collapses; ArrowLeft on leaf → parent selected | — |
| **18C Keyboard guard**: ArrowKey nav skips when focus is in INPUT / TEXTAREA / contenteditable element | 🟡 | build ✅; browser: click rename input → arrow keys don't navigate tree | — |

---

## nova-builder / v8.9.0 — Canvas zoom + viewport controls (Phase 17 · Minor · Sonnet · 2026-07-05)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **17A `$canvasZoom`**: `atom<number>(1)` in nano-states; range 0.1–3.0; builder-side only (not synced to canvas iframe) | 🟡 | build ✅ | — |
| **17B Ctrl+scroll zoom**: wheel listener with `{ passive: false }` on canvas container ref; activates on `ctrlKey || metaKey`; proportional step (smooth trackpad, ~10% mouse); clamped 0.1–3.0; rounded to 2dp | 🟡 | build ✅; browser: Ctrl+scroll on canvas → zoom changes smoothly | — |
| **17B Pinch zoom**: trackpad pinch → browser maps to `ctrlKey + deltaY`; covered by same wheel handler | 🟡 | build ✅; browser: pinch on canvas → canvas scales | — |
| **17B Scale wrapper**: `transform: scale(zoom); transform-origin: top center; transition: 0.12s`; iframe inside has `height: calc(100vh - 80px)` (explicit, not 100%); marginBottom extends scroll area proportionally at zoom > 1 | 🟡 | build ✅; browser: zoom > 1 → canvas scrollable to reveal content below | — |
| **17B Canvas interactivity at zoom**: click-to-select uses `closest('[data-ws-selector-id]')` — DOM traversal, not screen coords — remains correct at all zoom levels | 🟡 | build ✅; browser: zoom to 50% → click an element → correctly selected in navigator | — |
| **17B Ctrl+0 reset**: `$canvasZoom.set(1)` fires from keyboard handler; works regardless of focused element | 🟡 | build ✅; browser: Ctrl+scroll to 75% → Ctrl+0 → resets to 100% | — |
| **17B Ctrl+Shift+1 fit-to-width**: `fitToWidth()` reads container clientWidth and breakpoint maxWidth; `fitZoom = min(1, containerW / bp.maxWidth)`; desktop (no maxWidth) → 100% | 🟡 | build ✅; browser: switch to Mobile breakpoint → Ctrl+Shift+1 → zoom adjusts so 375px canvas fits container | — |
| **17C Topbar zoom cluster**: `−` / `75%` / `+` pill group between breakpoints and right section; clicking `%` resets to 100%; `%` highlighted purple when zoom ≠ 1; `−` decrements 10 pp; `+` increments 10 pp | 🟡 | build ✅; browser: + / − buttons change zoom; display shows correct percentage | — |

---

## nova-builder / v8.8.0 — Multi-select (Phase 16 · Minor · Sonnet · 2026-07-05)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **16A `$multiSelectedInstanceIds`**: `atom<string[]>([])` in `nano-states.ts`; plain array, JSON-serializable; empty = single-select mode | 🟡 | build ✅ | — |
| **16B `deleteMultipleInstances`**: skips instances whose ancestor is also in the delete set; deletes remaining top-level selected in order; returns `{ updated, deletedCount }` | 🟡 | build ✅; logic review: ancestor-skip correctly prevents double-delete | — |
| **16B `duplicateMultipleInstances`**: same ancestor-skip logic; clones each top-level selected instance and inserts after original; returns `{ updated, newRootIds }` | 🟡 | build ✅ | — |
| **16C TreeRow multi-select highlight**: `multiSelectedIds` prop; `isMultiSelected` = id in array and not primary; purple tint `rgba(124,58,237,0.25)` background; hover bg skipped for multi-selected rows | 🟡 | build ✅; browser: Ctrl+click → row turns purple | — |
| **16C TreeRow modifier-aware click**: `onClick` receives `e.ctrlKey || e.metaKey || e.shiftKey`; passed to `onSelect(id, withModifier)` | 🟡 | build ✅ | — |
| **16D Navigator handleSelect modifier**: Ctrl/Shift+click → toggle `id` in `$multiSelectedInstanceIds`; also sets primary selection; plain click → clear multi-select + set primary | 🟡 | build ✅; browser: Ctrl+click 3 rows → 3 purple; plain click → all deselected but new | — |
| **16E StyleInspector multi-write**: `writeStyle` reads `$multiSelectedInstanceIds`; when 2+ selected, fans out the write to ALL selected instances (each gets own StyleSource); `captureSnapshot()` called once | 🟡 | build ✅; browser: 2 selected → change width → both instances update in canvas | — |
| **16E StyleInspector intersection**: when 2+ selected, shows only properties present on ALL selected instances; uses primary instance decl values for display | 🟡 | build ✅; browser: select 2 instances with different props → only shared props appear | — |
| **16E MultiSelectHeader**: "N instances selected · Showing shared properties only" replaces `InstanceHeader` when multi-select active; `AddPropertyRow` hidden in multi-select mode | 🟡 | build ✅; browser: 2+ selected → header updates, add-row hidden | — |
| **16F Footer multi-select badge**: shows purple pill "N selected — Ctrl+D duplicate · Del delete" when `multiSelectedIds.length > 1`; hides breadcrumb in multi-select mode | 🟡 | build ✅; browser: Ctrl+click 2 nodes → footer shows "2 selected" pill | — |
| **16G Delete multi-select (keyboard)**: Delete/Backspace with 2+ selected → `deleteMultipleInstances` deletes all; clears `$multiSelectedInstanceIds`; clears primary selection | 🟡 | build ✅; browser: select 3 → Delete → all 3 gone; Ctrl+Z restores | — |
| **16G Duplicate multi-select (keyboard)**: Ctrl+D with 2+ selected → `duplicateMultipleInstances`; new root IDs become new multi-selection; primary selection set to first new root | 🟡 | build ✅; browser: select 2 → Ctrl+D → 2 new clones highlighted | — |

---



> A feature may be described as *working* in `SPEC.md` only once it has a ✅ row here.
> **Verification levels** (be honest about which):
> - ✅ **Verified** — automated test/typecheck green **and** manually QA'd in the browser.
> - 🟡 **Code-verified, needs manual QA** — code path audited/typechecked and unit-tested where possible, but the interactive behavior has NOT been clicked through in a browser. (Most editor interactions sit here until a human confirms.)
> - 🔴 **Broken / not implemented** — known gap.
>
> **Process:** when you manually confirm a 🟡 item, flip it to ✅ and date it. When you add a feature, add a row (start 🟡). Reviewer of record + date in the last column.
>
> _Seeded 2026-06-15 from the v1.4 code audit. Items are 🟡 unless covered by automated tests, because no browser QA pass has been recorded yet._

---

## nova-builder / v8.7.0 — CSS States + breakpoint-scoped styling (Phase 15 · Minor · Sonnet · 2026-07-05)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **15A `$selectedState`**: `atom<CSSState>("")`; values: `""` + 6 pseudo-states; resets to `""` on page navigation | 🟡 | build ✅ | — |
| **15B StateSelector pills**: 7 pills in scrollable row; clicking selects state; active highlighted purple; row background tinted when state ≠ "" | 🟡 | build ✅; browser: click ":hover" → pill activates, inspector header tinted | — |
| **15C writeStyle breakpoint override**: edit `width` at base bp while on Mobile breakpoint → creates mobile-specific decl with correct `breakpointId`; does NOT mutate base decl | 🟡 | build ✅; browser: switch to mobile bp → edit width → switch back to desktop → original unchanged | — |
| **15C writeStyle state**: add `backgroundColor` while `:hover` is active → decl has `state: ":hover"`; Default view → no backgroundColor shown | 🟡 | build ✅; browser: hover pill → add bg-color → switch to Default → prop gone | — |
| **15D filter shows only matching state**: switch to `:hover` → only hover-state decls shown; no base styles bleed through | 🟡 | build ✅; browser: ":hover" pill → styles from :hover only | — |
| **15E breakpoint cascade**: base styles visible when on non-base breakpoint; if same property exists at active-bp and base, active-bp value shown | 🟡 | build ✅; browser: add `display:flex` at base; switch to mobile → still see it; add mobile-specific `display:block` → inspector shows `display:block` | — |
| **15F AddPropertyRow state-aware**: add property while `:hover` active → decl has correct state; key format `srcId:bpId::hover:property` | 🟡 | build ✅; browser: ":hover" active → add `color:red` → Default view → no `color` property shown | — |

---

## nova-builder / v8.6.0 — Edit operations (Phase 14 · Minor · Sonnet · 2026-07-05)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **14A `lib/edit-operations.ts`**: `cloneSubtree` deep-clones subtree with fresh `inst_<8>` IDs; `buildParentMap`; `makeInstanceId` | 🟡 | build ✅; unit-review: IDs are re-minted correctly, no shared references | — |
| **14B `deleteInstance`**: removes instance from `$instances`; removes ID from parent's children; returns `{ updated, deleted: false }` if root (no parent) | 🟡 | build ✅; browser: Delete key → selected node removed; root delete → no-op | — |
| **14C `duplicateInstance`**: deep-clones with new IDs; inserts clone immediately after original in parent's children | 🟡 | build ✅; browser: Ctrl+D → duplicate appears below, is selected | — |
| **14D `pasteInstance`**: re-mints all IDs from clipboard; inserts after selected (or appends to root if nothing selected) | 🟡 | build ✅; browser: Ctrl+C → Ctrl+V × 3 → 3 unique instances, no ID collision | — |
| **14E keyboard Ctrl+C**: copies selected instance subtree to `$clipboard` (full snapshot of all instances + rootId) | 🟡 | build ✅; browser: Ctrl+C with selection → Topbar Paste button enables | — |
| **14E keyboard Ctrl+V**: pastes clipboard as sibling after selected instance with re-minted IDs; `captureSnapshot()` before write | 🟡 | build ✅; browser: paste → new instance created; Ctrl+Z reverts | — |
| **14E keyboard Ctrl+D**: duplicates selected; `captureSnapshot()` before write; new instance selected after | 🟡 | build ✅; browser: Ctrl+D → duplicate selected in navigator | — |
| **14E keyboard Delete/Backspace**: deletes selected (guarded: no-op if active element is input/textarea/contenteditable) | 🟡 | build ✅; browser: Del → gone; typing in style value field → Del doesn't remove | — |
| **14F Topbar toolbar**: Copy / Paste / Duplicate / Delete buttons; Copy+Dup+Del disabled when nothing selected; Paste disabled when clipboard empty | 🟡 | build ✅; browser: buttons gray out with no selection; click confirms keyboard parity | — |
| **14G ContextMenu refactor**: `handleDelete` / `handleDuplicate` use `deleteInstance` / `duplicateInstance` from `lib/edit-operations`; `handleWrapInBox` uses `makeInstanceId`; internal `uid()` + `deepCloneSubtree()` removed | 🟡 | build ✅; browser: right-click duplicate/delete still work | — |

---

## nova-builder / v8.5.0 — Assets panel + R2 upload (Phase 13 · Minor · Sonnet · 2026-07-05)

> Build passes 0 errors. All items 🟡 until browser QA. Requires R2 env vars to be set.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **13A `lib/r2.ts`**: `NovaAsset` type; `uploadToR2` / `deleteFromR2` via S3Client; `makeAssetKey` / `assetPublicUrl` helpers | 🟡 | build ✅; browser: upload PNG → returned url resolves to R2 object | — |
| **13B `POST /api/assets`**: auth-gated; validates MIME type + size ≤10 MB; uploads to R2; returns `NovaAsset` | 🟡 | build ✅; browser: valid upload → 201 with asset object | — |
| **13B rejection**: unsupported MIME → 415; oversized → 413 | 🟡 | build ✅; browser: .pdf upload → error message shown | — |
| **13C `DELETE /api/assets/[assetId]`**: auth-gated; verifies key prefix; calls `deleteFromR2`; non-fatal on R2 error | 🟡 | build ✅; browser: delete → R2 object removed | — |
| **13D upload flow**: `+ Upload` → file picker → `POST /api/assets` → added to `$assets` Map → thumbnail in grid | 🟡 | build ✅; browser: upload image → appears without refresh | — |
| **13D grid**: 3-column thumbnails; image = `<img>` preview; font = 🔤 icon; tooltip with name + size | 🟡 | build ✅; browser: multiple assets render correctly | — |
| **13D insert**: Image instance selected → "Insert" hover button → sets `src` prop → canvas renders image; `captureSnapshot()` before write | 🟡 | build ✅; browser: select Image → insert asset → canvas updates | — |
| **13D delete**: "Delete" hover button → DELETE route → removed from `$assets` → grid updates; `captureSnapshot()` before removal | 🟡 | build ✅; browser: delete → gone from grid; Ctrl+Z restores | — |
| **13D context hint**: "Click an image to set it as src" shown when Image instance selected | 🟡 | build ✅; browser: select Image → hint visible | — |
| **13D empty state**: no assets → 🖼 icon + "No assets yet." message | 🟡 | build ✅; browser: fresh project → empty state | — |

---

## nova-builder / v8.4.0 — Inline text editing (Phase 12 · Minor · Sonnet · 2026-07-04)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **12A dblclick to edit**: `canvas.tsx` dblclick on `[data-ws-selector-id]` → checks text-only children → enters `contentEditable`, blue outline, cursor at end | 🟡 | build ✅; browser: double-click Heading/Paragraph → cursor appears in text | — |
| **12A Enter to commit**: `onEditKeydown` Enter → `commit()` → `postMessage nova:textCommit` → text saved | 🟡 | build ✅; browser: edit text → Enter → new text visible in canvas + right panel | — |
| **12A Escape to cancel**: `onEditKeydown` Escape → `cancel()` → original text restored, no postMessage | 🟡 | build ✅; browser: edit text → Escape → original text restored | — |
| **12A Blur commits**: `onEditBlur` via `requestAnimationFrame` → `commit()` (Escape preempts via rAF timing) | 🟡 | build ✅; browser: edit text → click elsewhere → text committed | — |
| **12A Selection guard**: click handler skips when `[contenteditable="true"]` active; dblclick stops propagation | 🟡 | build ✅; browser: editing text → click elsewhere → no selection flicker | — |
| **12B Builder textCommit handler**: `page.tsx` `message` listener for `nova:textCommit` → `captureSnapshot()` → `$instances.set()` with updated text children | 🟡 | build ✅; browser: edit committed → Ctrl+Z → original text restored | — |
| **12B Undo after text edit**: `captureSnapshot()` called before `$instances` mutation → undo stack captures pre-edit state | 🟡 | build ✅; browser: type new text → Enter → Ctrl+Z → reverts to previous text | — |

---

## nova-builder / v8.3.0 — Canvas interactions + undo/redo + AddPropertyRow (Phase 11 · Minor · Sonnet · 2026-07-02)

> Build passes 0 errors. No unit tests (apps/nova-builder has no test runner). All items are 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **11A Canvas click-to-select**: click event listener in `canvas.tsx` reads `[data-ws-selector-id]`, sets `$selectedInstanceSelector` | 🟡 | build ✅; browser: click element → right panel updates | — |
| **11A Canvas hover**: `mouseover` listener sets `$hoveredInstanceSelector`; `webstudio-component.tsx` adds `data-ws-hovered` attribute | 🟡 | build ✅; browser: hover over elements → dashed outline visible | — |
| **11B Selection outline**: `[data-ws-selected]` CSS: `2px solid #7c3aed` injected in `app/canvas/page.tsx` | 🟡 | build ✅; browser: click → solid purple outline on selected element | — |
| **11B Hover outline**: `[data-ws-hovered]:not([data-ws-selected])` CSS: `1px dashed rgba(124,58,237,0.5)` | 🟡 | build ✅; browser: hover → dashed outline (not on selected element) | — |
| **11C Breakpoint canvas resize**: `$selectedBreakpoint.maxWidth` constrains iframe width; centering flex container; `transition: width 0.2s ease` | 🟡 | build ✅; browser: select ≤768px breakpoint → canvas narrows, gray background visible on sides | — |
| **11D `lib/history.ts`**: snapshot stack (max 50); `captureSnapshot()` / `undo()` / `redo()`; `$canUndo` / `$canRedo` atoms | 🟡 | build ✅; no test runner | — |
| **11D captureSnapshot wired**: StyleInspector (`writeStyle`), SettingsPanel (`handleChange`), ContextMenu (delete/duplicate/wrap), useDnd (drop), usePageCrud (createPage/deletePage), applyWSComposition (bulk update) | 🟡 | build ✅; browser: edit style → Ctrl+Z → reverts | — |
| **11D Keyboard**: Ctrl+Z = undo; Ctrl+Shift+Z = redo; Ctrl+Y = redo (in builder page keydown handler) | 🟡 | build ✅; browser: trigger mutation → keyboard shortcuts work | — |
| **11D Footer ↩/↪ buttons**: reactive disabled state via `$canUndo`/`$canRedo`; click ↩ = undo, ↪ = redo | 🟡 | build ✅; browser: buttons enable only when history stack non-empty | — |
| **11E AddPropertyRow**: dual inputs (property name with datalist, value); `parseNewValue()` infers unit/color/keyword; commits on Enter/blur with `captureSnapshot()` | 🟡 | build ✅; browser: type `display` + `flex` → canvas element becomes flex | — |

---

## nova-builder / v8.2.0 — Projects CRUD + writable StyleInspector + Publish MVP (Phase 10B–D · Minor · Sonnet · 2026-07-01)

> Build passes 0 errors. All items 🟡 until browser QA. Phase 10A (package extraction from reference/) deferred to Phase 12.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **10B Projects list**: `GET /api/projects` → Supabase `getUserProjects()` → card grid in `/projects` page | 🟡 | build ✅; browser: login → `/projects` shows real project cards | — |
| **10B Create project**: `POST /api/projects` → `createProject()` + `emptyProjectSchema()` seed → navigates to `/builder/[id]` | 🟡 | build ✅; browser: "New Project" modal → name → creates + opens builder | — |
| **10B Delete project**: `DELETE /api/projects/[id]` → `deleteProject()` owner-check; inline confirm in UI | 🟡 | build ✅; browser: delete button → confirm → project removed from list | — |
| **10B Unauthenticated redirect**: `/projects` page redirects to `/login` if no session | 🟡 | build ✅; browser: open `/projects` without login → redirects | — |
| **10C writeStyle()**: creates local `StyleSource` if needed; mutates `$styles` Map; `captureSnapshot()` before write | 🟡 | build ✅; browser: click style value → edit → canvas updates | — |
| **10C StyleValueEditor unit**: number input + unit select (`px/%/rem/em/vw/vh/fr/ch`); Arrow keys step ±1 / Shift ±10 | 🟡 | build ✅; browser: edit width → canvas box narrows/widens | — |
| **10C StyleValueEditor color**: `<input type="color">` + hex display; onChange mutates `$styles` | 🟡 | build ✅; browser: change background color → canvas updates immediately | — |
| **10C StyleValueEditor keyword**: text input for `display`/`flex-direction` etc. | 🟡 | build ✅; browser: change `display` to `flex` → canvas layout changes | — |
| **10D `/preview/[projectId]`**: public (no-auth) page; loads project, seeds atoms, SyncClient leader, canvas iframe; no builder chrome | 🟡 | build ✅; browser: open preview URL in incognito → canvas renders without editor UI | — |
| **10D Share button**: "Share ↗" in Topbar copies `/preview/${id}` to clipboard; shows "✓ Copied" for 2s | 🟡 | build ✅; browser: click Share → notification shown, clipboard contains URL | — |

---

## nova-builder / v8.1.0 — AI Panel wiring (Phase 9 · Minor · Sonnet · 2026-07-01)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **$aiPanelOpen atom**: `lib/nano-states.ts` exports `atom<boolean>(false)` | 🟡 | build ✅ | — |
| **AI toggle button**: Topbar right section; purple accent; active highlight when open | 🟡 | build ✅; browser: "AI" button visible; click toggles panel | — |
| **AIPanel.tsx**: fixed overlay; textarea prompt; `POST /api/ai` with `{userMessage, projectId}`; spinner; component summary on success; credits remaining display | 🟡 | build ✅; browser: enter prompt → Generate → response shown | — |
| **Apply to page**: `applyWSComposition(result.composition)` → atoms updated → canvas re-renders → panel closes | 🟡 | build ✅; browser: Apply → canvas shows AI-generated layout | — |
| **Error forwarding**: API errors (daily limit, insufficient credits, 422 patch invalid) shown in panel without crash | 🟡 | build ✅; browser: test with 0-credit account → error message shown | — |
| **Escape closes panel**: `useEffect` keydown listener on `isOpen` | 🟡 | build ✅; browser: open panel → Escape → closes | — |
| **Discard**: resets to idle without applying; prompt cleared | 🟡 | build ✅; browser: Generate → Discard → panel returns to idle | — |

---

## nova-builder / v8.0.0 — Left sidebar v2 (Phase 8 · Minor · Sonnet · 2026-07-01)

> Build passes 0 errors. All items 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| Navigator expand/collapse: `▶`/`▼` toggle; `$expandedIds` atom; auto-expand ancestors on selection change; `sessionStorage` persist | 🟡 | build ✅; browser: click `▶` → children appear; select nested item → ancestors auto-expand | — |
| Navigator context menu: right-click portal (rename inline / delete / duplicate subtree / wrap in Box); Escape / click-outside dismisses | 🟡 | build ✅; browser: right-click node → menu appears with correct items | — |
| Navigator DnD reorder: HTML5 drag; same-parent-only constraint; dashed drop indicator | 🟡 | build ✅; browser: drag sibling up/down → reorders; cross-parent drag → rejected | — |
| Pages CRUD: `usePageCrud.ts` — create / rename (inline double-click) / delete (guard: cannot delete last page) | 🟡 | build ✅; browser: "+" → name + path → new page appears; delete last page → rejected | — |
| Components panel: grouped by `WsComponentMeta.category`; click inserts as child of selected instance | 🟡 | build ✅; browser: click Box → instance appears in Navigator tree | — |
| Sidebar resize handle: 4 px right-edge drag; range 180–360 px; `localStorage("nova-sidebar-width")` persist | 🟡 | build ✅; browser: drag right edge → sidebar widens; persists on reload | — |

---

## LEGACY — apps/studio (Craft.js system, deprecated)

> Everything below this line covers `apps/studio` (the old Craft.js-based editor) and the legacy
> package suite (`packages/schema`, `packages/editor`, `packages/registry`, `packages/renderer`).
> **nova-builder users: see sections above only.**
> These entries are kept for historical reference. Flip rows to ✅ only in browser QA of `apps/studio`.

---

## Core data / logic — apps/studio (automated tests exist)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **v3.2.1 Cloudflare Deploy Hotfix** (Fixed TOML syntax swallowing assets, restored deploy hook) | ✅ | Cloudflare dashboard & network tab confirmed | tests · 2026-06-17 |
| Schema validation (Project/Page/Element/Props) | ✅ | `packages/schema` unit tests | tests · 2026-06-15 |
| Migration chain 1.0→1.4 (incl. Hero/Navbar decomposition) | ✅ | `migration.test.ts` (11) | tests · 2026-06-15 |
| Editor operations (clone/insert/move/remove/dup/group/ungroup) | ✅ | `operations.test.ts` (32) | tests · 2026-06-15 |
| Editor commands registry | ✅ | `editorCommands.test.ts` (12) | tests · 2026-06-15 |
| Template apply + id re-mint | ✅ | `applyTemplate.test.ts` | tests · 2026-06-15 |
| Git readProject + migrate-on-load | ✅ | `readProject.test.ts` | tests · 2026-06-15 |
| Codegen `generateAll` / pageFile / propsToJSX | ✅ | renderer tests (33) | tests · 2026-06-15 |
| Block registry integrity / schema introspection | ✅ | registry tests (84) | tests · 2026-06-15 |
| `schemaToNodes`/`nodesToSchema` round-trip incl. `classOverrides` **and `_novaName`** | ✅ | `adapter.test.ts` round-trip test | tests · 2026-06-16 |
| `cn()` base+override merge — override wins on conflict (the v1.4 style fix) | ✅ | `cn.test.ts` (5) | tests · 2026-06-16 |
| Publish sources match v1.4 contract (Hero/Navbar children-only, Section single-layer, TextBlock h1) | ✅ | `sources.test.ts` v1.4 block | tests · 2026-06-16 |
| `propsToJSX` strips `_nova*`, keeps `classOverrides` | ✅ | `propsToJSX.test.ts` | tests · 2026-06-16 |
| Block contract unified (`classOverrides` + internal `cn`); published sources generated from registry, drift-guarded | ✅ | registry/editor/renderer + `sources.test.ts` drift test | tests · 2026-06-16 |
| ADR-028: 1.4→1.5 migration moves visual props (TextBlock/Section/Column) → `classOverrides`; props removed | ✅ | `migration.test.ts` 1.4→1.5 test | tests · 2026-06-16 |
| Phase 4 cleanup: `cmdGroupNodes` regression fixed; `settings` field + 15 files removed (TD-013); Navbar/Footer padding (TD-015); stale AI hints rewritten (TD-025); Footer 1.5→1.6 migration | ✅ | typecheck all + registry 76 / editor 74 / renderer 39 / schema 53 / git 12 | tests · 2026-06-16 |
| ADR-028: migrated/new blocks render identically (rendered parity) | 🟡 | migration is class-for-class faithful by construction; visual confirm = Phase 5 QA | — |

## v2.5.0 — Marketing / auth / dashboard UI revamp + credit-policy reconciliation
> Additive UI work (Minor bump). Plan: [`doc/audit_v2.0/marketing_revamp_plan.md`](audit_v2.0/marketing_revamp_plan.md).
> Pages are typecheck-only (no component test runner); interactive/visual behavior is 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `lib/crypto.ts` AES-256-GCM round-trip / tamper / malformed / key-length guard | ✅ | `crypto.test.ts` (7) — incl. fresh-IV, iv:tag:ciphertext shape, GCM auth-fail; **fixed** empty-string round-trip (guard checks missing segment, not falsy) | tests · 2026-06-17 |
| Payment webhook credit grants reconciled to `pricing-policy.md` (Pro 4000 not 500; top-ups 200/1000/4000 not 500/200/100; removed buggy `"1000".includes("100")` substring match) | 🟡 | typecheck ✅; numbers match §3/§4 + `0004_credit_allowances.sql`; end-to-end needs a real Lemon Squeezy webhook delivery | — |
| Landing page revamp (hero mockup, stats, how-it-works, bento grid, testimonials, pricing w/ annual toggle, FAQ, footer) | 🟡 | typecheck ✅; pricing block matches policy (Free 200 / Pro 4,000 / $19·$15-annual); fixed dead Tailwind `perspective-1000 rotate-x-2`→arbitrary transform, dead `/grid.svg`→CSS grid, raw `<img>` eslint-disable | — |
| Login page 2-column value-prop + trust signals | 🟡 | typecheck ✅; GitHub OAuth callback `/projects` unchanged; visual QA pending | — |
| Projects page (time-of-day greeting, initials avatar menu, search, empty state, branch/date cards) + `ProjectsClient` | 🟡 | typecheck ✅; client search filter is pure; browser QA for hover/menu/empty state | — |
| Connect-repo flow (repo search, select, connect) | 🟡 | typecheck ✅; fixed no-op `custom-scrollbar`→`dark-scroll`, `...`→`…`; browser QA for fetch/select/connect | — |
| UI syntax validation (`eslint` config added to CI, fixed `react/no-unescaped-entities` in `page.tsx` and `LeftPanel.tsx`) | ✅ | `pnpm turbo lint` passes locally and in CI/CD | tests · 2026-06-17 |

## v4.1.0 — Hybrid credit model: metered tiers + daily cap + prepaid bucket (ADR-038)
> Billing rework (Minor; changes Pro behavior). Resolves TD-026. Pure logic is unit-tested;
> DB migration + route enforcement + UI need a live Supabase apply + browser QA → 🟡.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `decideCreditSource()` bucket selection (monthly-first, top-up bypasses daily cap; daily_cap vs insufficient) | ✅ | `tiers.test.ts` (10) incl. exact-cap boundary, empty-monthly→topup, uncapped paid tiers | tests · 2026-06-17 |
| Tier entitlements metered (Free 200/Pro 4000/Max 15000/Team 5000; no tier unlimited — TD-026) + Free daily cap 40 | ✅ | `tiers.test.ts` allowance + `dailyCreditCap` + `hasUnlimitedAI=false` assertions | tests · 2026-06-17 |
| `0006_two_bucket_credits.sql` — topup bucket column, `from_topup`, 2-bucket `deduct_credit`, monthly-only `reset_monthly_credits`, 1yr topup expiry | 🟡 | SQL written + typecheck of callers ✅; needs Supabase apply + a real deduction/reset/expiry run | — |
| `/api/ai` daily-cap + two-bucket deduction (Pro now metered, deducts) | 🟡 | code path + typecheck ✅; live AI op + concurrent daily-cap behavior need DB + browser QA | — |
| Webhook top-ups → prepaid bucket (+1yr expiry); Pro activation → monthly bucket | 🟡 | typecheck ✅; needs a real Lemon Squeezy `order_created`/`subscription` delivery | — |
| `/api/me` returns combined balance + breakdown (monthly/topup/dailyCap/dailyRemaining) | 🟡 | typecheck ✅; client hydration + counter display = browser QA | — |

## v5.19.0 — Group / Ungroup as a first-class primitive (Minor · Phase C)
> Pure ops audited + hardened (document-order, sibling-only, no-op guards) and unit-tested ✅;
> ⌘G/⌘⇧G shortcuts + ⌘K Group/Ungroup are runtime 🟡. Phase C continues. (Roadmap = Sonnet; built on Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `groupNodes` wraps children in **DOCUMENT order** regardless of selection/click order; group sits at earliest selected sibling's slot | ✅ | `grouping.test.ts` document-order block | tests · 2026-06-22 |
| **Sibling-only**; group-of-one / empty / cross-parent / <2-siblings = **no-op** (no singleton or cross-parent wrappers) | ✅ | `grouping.test.ts` no-op guards block | tests · 2026-06-22 |
| `ungroupNode` lifts children into parent at the group's slot, in order; empty container = no-op | ✅ | `grouping.test.ts` ungroup block | tests · 2026-06-22 |
| **group → ungroup round-trip === identity** (ids, types, order, props) | ✅ | `grouping.test.ts` round-trip (13 total) | tests · 2026-06-22 |
| `cmdGroupNodes` selects new group + document order; single-selection no-op; `cmdUngroupNode` leaf no-op | ✅ | `grouping.test.ts` cmd wrappers block | tests · 2026-06-22 |
| ⌘K **Group** (`canGroup`: >=2 same-parent siblings) + **Ungroup** (`canUngroup`: one container w/ children) enablement | ✅ | `commandRegistry.test.ts` enablement block (+2) | tests · 2026-06-22 |
| **⌘G** groups multi-selection · **⌘⇧G** ungroups (input-guarded keydown); ⌘K Group/Ungroup dispatch on-canvas | 🟡 | typecheck ✅; live group/ungroup + selection = browser QA | — |

## v7.0.2 — One source of truth, stage 3 (capstone): Document-first insert + gesture adapter, I2 (Major · Phase F)
> ADR-042 stage 3. `cmdInsertBlock` is unit-tested ✅. Block-insert re-points + the `updateElements`→
> `commitCanvasGesture` rename + `CRAFT_READONLY` retirement are typecheck ✅. **Phase F architecture is
> logic-complete** but stays 🟡 — the gesture adapter (native DnD + inline text) and the end-to-end model
> need browser QA before Phase F → ✅. Legacy code is reframed/retained, not deleted (cheap rollback);
> dead-code deletion is a post-QA follow-up. (Roadmap = Opus; Major = architecture migration.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **`cmdInsertBlock`** — gated new-block insertion (canPlaceType / registry DropRules); illegal target → same-ref no-op | ✅ | `editor/operations/__tests__/cmdMoveNode.test.ts` (+5; 19 in file, editor 185) | tests · 2026-06-26 |
| **`buildBlockElementSchema`** — pure registry→Element builder (defaults + defaultChildren, ids minted) for Document-first insert | ✅ (logic) | `apps/studio/.../buildElement.ts`; typecheck ✅ | typecheck · 2026-06-26 |
| **Click-insert Document-first** — Blocks-panel click, Layers add-above/below/append, layout presets → `cmdInsertBlock` via `useDocumentWrite` (was `actions.addNodeTree`) | 🟡 | typecheck ✅; live insert + presets = browser QA | — |
| **`updateElements` → `commitCanvasGesture` (E1/E2 gesture adapter)** — renamed + reclassified as the ONE narrow Craft→Document path; reached only by native DnD (E1) + inline-text commit (E2); zero-payload marker (no re-deserialize/memory bomb) | ✅ (logic) | `projectStore.ts`; `CraftProvider` onNodesChange doc; typecheck 8/8 ✅ | typecheck · 2026-06-26 |
| **`CRAFT_READONLY` retired** — the binary flip scaffolding is gone; the model is a permanent "discrete=Document-first, gesture=adapter" split (`flags.ts` deleted, export removed, guard removed) | ✅ | `pnpm typecheck` 8/8; grep `CRAFT_READONLY` = 0 | tests · 2026-06-26 |
| **Inline-text commit = E2** — contentEditable local while typing; commit via the gesture adapter (documented) | 🟡 | `makeCraftComponent` E2 comment; typecheck ✅; live inline edit = browser QA | — |
| **Native panel drag = E1** — `connectors.create` (panel→canvas) captured by the gesture adapter | 🟡 | typecheck ✅; live drag-create = browser QA | — |
| **Audit (measurable)** — zero production `actions.move`/`actions.delete`/`actions.addNodeTree`/`CRAFT_READONLY`; remaining Craft writes = E1 panel-drag + 2 transient previews (gap/resize) + E2 inline-text — all documented exceptions | ✅ | grep audit `apps/studio/src` | tests · 2026-06-26 |
| **Phase F end-to-end (Document sole authority)** | 🟡 | **browser QA gate**: drag/resize/snapping/marquee/Layers/Components/AI patch/publish — no interaction regression vs v6.x; then flip Phase F → ✅ + follow-up dead-code deletion | — |

## v7.0.1 — One source of truth, stage 2: structural gestures Document-first, I2 (Major · Phase F)
> ADR-042 stage 2. The command-layer legality gate (`cmdMoveNode`/`cmdDropRelative`) is unit-tested ✅.
> Re-pointed structural surfaces (Layers DnD/move/delete/rename, ContextMenu Extract, RenderNode
> delete/resize/nudge) are runtime 🟡 (no app test runner). **Audit:** zero production `actions.move`/
> `actions.delete` remain. (Roadmap = Opus; Major = architecture migration.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **`cmdMoveNode`** — gated raw move; legality (`canMoveInto`/registry DropRules) enforced ONCE in the command layer; illegal/self/descendant → same-ref no-op | ✅ | `editor/operations/__tests__/cmdMoveNode.test.ts` (14 tests; editor 180) | tests · 2026-06-26 |
| **`cmdDropRelative`** — before/after/inside drop; index computed in the post-removal sibling array (same-parent reorder lands where the indicator showed); routes through cmdMoveNode | ✅ | `cmdMoveNode.test.ts` drop-relative block | tests · 2026-06-26 |
| **Registry DropRules lookup** — single `getDropRules` from `registry.craftConfig` feeds the command-layer gate; no UI re-implements drop rules | ✅ (logic) | `apps/studio/.../dropRules.ts`; typecheck ✅ | typecheck · 2026-06-26 |
| **Layers DnD Document-first** — reparent/reorder commit → `cmdDropRelative`; legality via registry rules (no try/catch on Craft) | 🟡 | typecheck ✅; live drag reparent/reorder + illegal-drop rejection = browser QA | — |
| **Layers move-up/down + delete + rename Document-first** — `cmdMoveUp`/`cmdMoveDown`/`cmdDelete` via `run`; rename → `setNodeProps` | 🟡 | typecheck ✅; live move/delete/rename = browser QA | — |
| **ContextMenu "Extract block" Document-first** — lift node after its parent via `cmdMoveNode` (was `actions.move`) | 🟡 | typecheck ✅; live extract = browser QA | — |
| **RenderNode delete (✕) Document-first** — `removeNode` + clear selection (was `actions.delete`) | 🟡 | typecheck ✅; live delete + selection clear = browser QA | — |
| **RenderNode resize Document-first (commit-on-pointer-up)** — transient Craft preview during drag, **exactly one** Document history entry per completed gesture (fixes one-marker-per-pointermove) | 🟡 | typecheck ✅; live resize + single undo step = browser QA | — |
| **RenderNode arrow-nudge Document-first** — each keypress is one discrete `setNodeProps` Document edit | 🟡 | typecheck ✅; live nudge = browser QA | — |
| **Audit: no production `actions.move`/`actions.delete`** — every structural move/delete routes through the command layer; remaining `actions.setProp` are the 2 transient drag previews (gap/resize, committed via Document on pointer-up); `actions.addNodeTree`/`connectors.create` (block insert) → v7.0.2; `actions.setHidden` = E3 editor-only | ✅ | grep audit `apps/studio/src` | tests · 2026-06-26 |
| **Phase F remaining** — native DnD (E1) + inline text (E2) + block-insert (add) Document-first; flip `CRAFT_READONLY=true`; remove dead bridge (v7.0.2) | 🔴 not built | — | v7.0.2 |

## v7.0.0 — One source of truth, stage 1: Document-first prop/style edits, I2 (Major · Phase F)
> ADR-042 migration. The pure foundation (`setNodeProps`/`setNodeProp`) is unit-tested ✅. The
> `CRAFT_READONLY` flag + transient-edit infra + `useDocumentWrite` are typecheck ✅. The re-pointed
> interactive surfaces (props/style/align/tidy/gap) are runtime 🟡 — apps/studio has no test runner,
> so Document-first behavior needs browser QA. Phase F flips to ✅ only after the full migration
> (v7.0.2) + browser QA. (Roadmap = Opus; Major = architecture migration.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **ADR-042 migration design** — current/target architecture, full sync-path audit, risks, rollback, exceptions E1–E3 (capture-and-reapply DnD, inline-text local, setHidden editor-only) | ✅ | `doc/ADR.md` ADR-042 | docs · 2026-06-25 |
| **`setNodeProps` / `setNodeProp`** — pure Document-edit counterpart of `actions.setProp`; immutable, deep-clones props, same-ref no-op when id absent | ✅ | `editor/operations/__tests__/setNodeProps.test.ts` (11 tests; editor 166) | tests · 2026-06-25 |
| **`CRAFT_READONLY` flag + `onNodesChange` guard** — when true, the canvas-edit reconciliation bridge is inert (false in v7.0.0; rollback switch) | ✅ | `editor/model/flags.ts`; `CraftProvider` guard; typecheck 8/8 | typecheck · 2026-06-25 |
| **Transient-edit infra** — `beginTransientCanvasEdit`/`endTransientCanvasEdit` suppress the bridge during a drag preview; gesture commits one Document step on pointer-up | ✅ (logic) | `CraftProvider.tsx`; typecheck ✅ | typecheck · 2026-06-25 |
| **`useDocumentWrite` helper** — single app entry point: run pure transform on active page → `applyExternalSchema`; same-ref no-op skips history | ✅ (logic) | `apps/studio/.../useDocumentWrite.ts`; typecheck ✅ | typecheck · 2026-06-25 |
| **Props panel edits Document-first** — `RightPanel.handleChange` → `setNodeProps` (was `actions.setProp`) | 🟡 | typecheck ✅; live prop edit + selection survival = browser QA | — |
| **Style panel edits Document-first** — `StylePanel.mutate` (all classOverrides controls) + free-position toggle (atomic node+parent) → `setNodeProps` | 🟡 | typecheck ✅; live style toggles + free-position = browser QA | — |
| **Align bar Document-first** — `AlignBar` self-align → `setNodeProps` | 🟡 | typecheck ✅; live self-align = browser QA | — |
| **Tidy layout (⌘K) Document-first** — `CommandPalette.tidyLayout` → `setNodeProps` | 🟡 | typecheck ✅; live tidy = browser QA | — |
| **Gap-drag Document-first (commit-on-pointer-up)** — `LayoutOverlay` previews via transient Craft edit, commits ONE Document step on release (also fixes one-marker-per-pointermove) | 🟡 | typecheck ✅; live gap drag + single undo step = browser QA | — |
| **Pre-existing rules-of-hooks fix** — 3 post-early-return `useCallback`s in RightPanel (from v6.2.0) converted to plain functions; lint green | ✅ | `pnpm turbo lint` passes | tests · 2026-06-25 |
| **Phase F remaining** — layers DnD + delete + rename (v7.0.1); native DnD (E1) + inline text (E2) + flip `CRAFT_READONLY` + remove dead bridge (v7.0.2) | 🔴 not built | — | v7.0.1/7.0.2 |

## v6.4.0 — Export golden tests + TD-024 close, I8 (Minor · Phase E)
> `generateAll` snapshot tests seed + I1/I10 regression guard unit-tested ✅.
> No UI changes. (Roadmap = Sonnet; built on Sonnet.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Suite A: minimal document snapshot** — Box + TextBlock page file + block sources match snapshot; any codegen change fails immediately | ✅ | `renderer/__tests__/generateAll.snapshot.test.ts` (3 snapshot tests) | tests · 2026-06-25 |
| **Suite B: I8 no-override parity** — `generateAll(docWithInstance)` ≡ `generateAll(docWithDetached)` (`toEqual`, not snapshot) | ✅ | `generateAll.snapshot.test.ts` I8 no-override parity test | tests · 2026-06-25 |
| **Suite B: I8 override parity** — `generateAll(docWithOverrideInstance)` ≡ `generateAll(detachedResolvedOverrideDoc)`; mirrors the no-override test | ✅ | `generateAll.snapshot.test.ts` override parity test | tests · 2026-06-25 |
| **Override value in output** — override-carrying Instance generates page file containing "Submit" not master default "Save" | ✅ | `generateAll.snapshot.test.ts` override-content test | tests · 2026-06-25 |
| **Suite C: full-block snapshot** — all 16 registry block types + ComponentMaster + Instance; full files bundle snapshotted; block codegen regressions caught | ✅ | `generateAll.snapshot.test.ts` (4 total snapshots committed) | tests · 2026-06-25 |
| **I1/I10 regression guard** — `schemaToNodes(nodesToSchema(docWithInstance))` preserves Instance node (never baked by serialization round-trip; only `generateAll` may resolve) | ✅ | `editor/craft-adapter/__tests__/instanceRoundTrip.test.ts` (+2 tests; 14 total) | tests · 2026-06-25 |
| **TD-024 MITIGATED** — codegen regressions covered by golden tests; final exported Next.js build remains manual QA | ✅ | `memory/project_nova_technical_debts.md` TD-024 updated | tests · 2026-06-25 |

## v6.3.0 — AI patch normalization + pre-validation, I6 (Minor · Phase E)
> `normalizeAIPatch` + `validateAIPatch` are pure + unit-tested ✅. Pipeline wired into the API route ✅.
> AI panel retry button is 🟡 (needs browser QA). (Roadmap = Sonnet; built on Sonnet.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **`normalizeAIPatch`** — `set-prop classOverrides` replace → merge (union, existing-first, dedup, case-sensitive); `set-props classOverrides` same; all other ops pass through unchanged; never mutates input | ✅ | `ai/src/__tests__/normalizePatch.test.ts` (11 tests) | tests · 2026-06-25 |
| **Deduplication** — class already in current list is not added again | ✅ | `normalizePatch.test.ts` dedup test | tests · 2026-06-25 |
| **Stable ordering** — existing classes come first; new classes appended in their incoming order | ✅ | `normalizePatch.test.ts` ordering test | tests · 2026-06-25 |
| **`validateAIPatch`** — rejects unknown element id (not in any page element tree) with deterministic reason + `badOp`; returns first failing op | ✅ | `ai/src/__tests__/validator.test.ts` (12 tests) | tests · 2026-06-25 |
| **Component projection-node rejection** — targeting a `ComponentMaster.root.id` (which exists only in `project.components[]`, not in any page) fails with clear reason | ✅ | `validator.test.ts` projection-node test | tests · 2026-06-25 |
| **Unknown op rejection** — an unrecognized op type fails with reason containing the op name | ✅ | `validator.test.ts` unknown-op test | tests · 2026-06-25 |
| **`add-child` parent validation** — accepts valid element id OR valid page id; rejects non-existent | ✅ | `validator.test.ts` add-child tests | tests · 2026-06-25 |
| **Empty patch is always valid** | ✅ | `validator.test.ts` empty-patch test | tests · 2026-06-25 |
| **API route pipeline** — normalize → validate → apply; 422 returned on validation failure before `applySmartPatch`; credits NOT deducted on 422 (ADR-006) | ✅ | `apps/studio/src/app/api/ai/route.ts`; typecheck 8/8 ✅ | typecheck · 2026-06-25 |
| **AI panel retry button** — 422 error message shows "Patch invalid: …" + "↺ Retry" button that re-runs the same prompt without adding a user message again | 🟡 | typecheck ✅; browser QA: button visible, retry fires, no credit deducted until success | — |

## v6.2.0 — Instance override editing (Minor · Phase D)
> `cmdSetInstanceOverride` / `cmdClearInstanceOverride` pure commands + Inspector override rows are
> unit-tested ✅. Interactive inspector editing is 🟡 (needs browser QA). (Roadmap = Sonnet; built on Sonnet.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **`cmdSetInstanceOverride`** — writes sparse prop delta; validates type === INSTANCE_TYPE; **equality-based no-op** (returns original array if effective value already equals incoming) | ✅ | `editor/components/__tests__/overrideCommands.test.ts` (11 tests; editor 153) | tests · 2026-06-25 |
| **`cmdClearInstanceOverride`** — removes key; removes entry when empty; no-op if key absent | ✅ | `overrideCommands.test.ts` cmdClearInstanceOverride block | tests · 2026-06-25 |
| **set then clear = identity** (round-trip + structural equality) | ✅ | `overrideCommands.test.ts` identity test | tests · 2026-06-25 |
| **classOverrides override = full array replacement** (not additive merge — user explicitly replaces) | ✅ | `overrideCommands.test.ts` classOverrides test | tests · 2026-06-25 |
| **I10 propagation** — master prop change propagates to instances without override; instances with an override keep their override | ✅ | `overrideCommands.test.ts` I10 block | tests · 2026-06-25 |
| Override **round-trip survival** — override set via cmd survives `nodesToSchema(schemaToNodes())` intact | ✅ | `overrideCommands.test.ts` round-trip test | tests · 2026-06-25 |
| **Inspector override rows** (RightPanel) — propSchema-driven rows for master root type (text/url/color fields strictly from registry schema); dot badge when overridden; × reset icon | 🟡 | typecheck ✅; live dot badge + field edit + reset = browser QA | — |
| **`classOverrides` override row** — space-separated display; save splits to `string[]`; dot badge + × reset | 🟡 | typecheck ✅; visual verify = browser QA | — |
| Inspector **detach button** pinned at bottom of scrollable override section | 🟡 | typecheck ✅; layout verify = browser QA | — |
| Equality no-op preserves history — no history step created when value unchanged | 🟡 | enforced by cmd returning same reference; `applyExternalSchema` skipped; verify = browser QA (history length stays constant) | — |

## v6.1.1 — Components on the canvas (render + instantiate UI) (Minor · Phase D)
> Canvas Instance rendering + LeftPanel Components section + inspector badge/detach are all 🟡
> (typecheck ✅ + unit-tested ✅; interactive behavior needs browser QA). Round-trip guard added.
> (Roadmap = Sonnet; built on Sonnet.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **Instance round-trip guard** — `schemaToNodes` emits `resolvedName:"Instance"` (never `UnknownBlock`); `nodesToSchema` restores `type:"Instance"` + `{masterId,overrides}` unchanged; double round-trip = identity | ✅ | `editor/craft-adapter/__tests__/instanceRoundTrip.test.ts` (12 tests; editor 142) | tests · 2026-06-25 |
| `schemaToNodes` Instance special-case — `isCanvas:false`, `nodes:[]`, no `_novaUnknownType` leaked | ✅ | `instanceRoundTrip.test.ts` schemaToNodes block | tests · 2026-06-25 |
| **Canvas Instance rendering** — `InstanceBlock` registered via `extraResolver` in CraftProvider; resolves master via store + `resolveInstance`; renders via `ElementTreeRenderer` (registry components, `pointerEvents:none`); dashed purple outline; missing master → placeholder | 🟡 | typecheck ✅; z-layer guard passes; live render = browser QA | — |
| Instance **non-enterable** (double-click no-op; resolved tree has no Craft child nodes) | 🟡 | enforced by `makeCraftComponent` (no `inlineEditProp`) + `isCanvas:false`; verify = browser QA | — |
| `CraftProvider.extraResolver` — app-layer resolver extension without package circular dependency | ✅ | typecheck ✅; merged via `useMemo([])` (stable reference) | tests · 2026-06-25 |
| **LeftPanel Components section** — lists `project.components` by name; "Insert" button calls `cmdInstantiate` + `applyExternalSchema` at page root end | 🟡 | typecheck ✅; live insert + selection = browser QA | — |
| **Inspector Instance badge** — "Component" chip + master name header + "Detach instance" button (calls `cmdDetachInstance` + `applyExternalSchema`) when Instance selected | 🟡 | typecheck ✅; live detach from inspector = browser QA | — |
| Empty-components state — "No components yet" instruction with ⌘K hint | 🟡 | typecheck ✅; visual verify = browser QA | — |

## v6.1.0 — Components/Symbols, part 2: canvas + renderer (Major · Phase D)
> Renderer/export + pure commands unit-tested ✅. The ⌘K Create/Detach actions are runtime 🟡.
> (Roadmap = Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| Model relocated to `@studio/schema` (so renderer + editor share it); `resolveInstancesInTree` tree-wide resolver | ✅ | `schema/components/__tests__/resolve.test.ts` (schema 90) | tests · 2026-06-22 |
| **Export consumes `resolveInstance`** — `generateAll` flattens instances before codegen; no `Instance` tags emitted (I8) | ✅ | `renderer/__tests__/instanceCodegen.test.ts` | tests · 2026-06-22 |
| **Instance render === detached render** (byte-identical codegen; ids aside) | ✅ | `instanceCodegen.test.ts` integrity test + `resolve.test.ts` stripIds | tests · 2026-06-22 |
| `cmdCreateComponentFromSelection` — lifts selection to a master, **preserves lifted stable ids**, replaces with an Instance; multi-select → master children in DOCUMENT order (group rule) | ✅ | `editor/components/__tests__/commands.test.ts` (editor 130) | tests · 2026-06-22 |
| `cmdInstantiate` / `cmdDetachInstance` (bake + re-mint) + create→detach round-trip | ✅ | `commands.test.ts` | tests · 2026-06-22 |
| ⌘K **Create component** + **Detach instance** (gated by `canDetach`) wired via project store | 🟡 | typecheck ✅; on-canvas behavior = browser QA | — |

## v6.0.0 — Components/Symbols, part 1: the model (Major · schema 4.0 · **opens Phase D**)
> Pure model + schema migration unit-tested ✅. NO canvas UI yet (create-from-selection /
> instantiate / detach / override-edit land in v6.1.0). (Roadmap = Opus; Major = schema migration.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| Schema: `ComponentMaster` (id/name/root) + `OverrideMap` + `Instance` convention; `components[]` on Project (optional, additive) | ✅ | `@studio/schema` typecheck + `migration.test.ts` | tests · 2026-06-22 |
| Migration **3.0→4.0** — seeds `components: []`, bumps version, **no-op for projects without components**; pages untouched | ✅ | `migration.test.ts` 3.0→4.0 block (schema 74) | tests · 2026-06-22 |
| `resolveInstance(master, overrides)` — sparse per-prop override **keyed by stable element id** (not path); override wins, rest inherits; stale keys ignored | ✅ | `components.test.ts` overrides/round-trip | tests · 2026-06-22 |
| **I10**: propagation (master edits flow through except where overridden) | ✅ | `components.test.ts` propagation block | tests · 2026-06-22 |
| **I10**: determinism + purity (`resolve(m,o) === resolve(m,o)`; frozen inputs don't throw; no mutation) | ✅ | `components.test.ts` determinism block | tests · 2026-06-22 |
| **I10**: dangling/missing master → safe deterministic placeholder (never crashes) | ✅ | `components.test.ts` missing-master block | tests · 2026-06-22 |
| `detachInstance` — bakes resolved tree + **remints fresh unique ids** + drops the ref (not an Instance) | ✅ | `components.test.ts` detach block (editor 136) | tests · 2026-06-22 |
| Renderer/export consume `resolveInstance` (preserving I8); canvas UI | 🔴 not built | — | v6.1.0 |

## v5.21.0 — Inspector polish: direct numeric editing (Minor · Phase C — **completes Phase C logic**)
> Pure `numericField.ts` unit-tested ✅; the `NumericInput` interaction (type/Enter/blur/Esc/arrows/
> scrub) wired into the StylePanel fixed-size row is runtime 🟡. (Roadmap = Sonnet; built on Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `parseNumeric` — finite parse + clamp; null on empty/`abc`/Infinity/NaN | ✅ | `numericField.test.ts` parseNumeric block | tests · 2026-06-22 |
| `formatNumeric` + `parse(format(v)) === v` round-trip (precision-normalized) | ✅ | `numericField.test.ts` format block | tests · 2026-06-22 |
| `commitNumeric` — valid→normalized; **invalid/empty→prev (never NaN)**; empty+allowEmpty→null | ✅ | `numericField.test.ts` commit block | tests · 2026-06-22 |
| `stepValue` — arrow ±step, Shift = shiftStep (×10 default), clamp, **float-error normalized** (0.1+0.2→0.3) | ✅ | `numericField.test.ts` step block | tests · 2026-06-22 |
| `scrubDelta` — accumulates from drag-start total, sensitivity (px/step), clamp + normalize | ✅ | `numericField.test.ts` scrub block (15 total) | tests · 2026-06-22 |
| `NumericInput` editing contract: type→Enter/blur commit; **Esc cancels (no write)**; arrows step; drag-unit scrub | 🟡 | typecheck ✅; live editing/scrub = browser QA | — |
| Wired into StylePanel fixed-size (px) row via existing `onChange` writer (no schema change) | 🟡 | typecheck ✅; on-canvas resize-via-inspector = browser QA | — |

> History note: scrub writes live per pointermove (Nova's known one-marker-per-move limitation); the
> ideal single-entry-on-pointer-up awaits the global history-batching fix — intentionally NOT done here.

## v5.20.0 — Keyboard map as a single source of truth (Minor · Phase C)
> Pure keymap unit-tested ✅ (incl. integrity invariants); the keydown refactor + "?" help overlay
> are runtime 🟡. Phase C continues (inspector polish remains). (Roadmap = Sonnet; built on Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `keymap.ts` — ASCII chords ("Mod+Shift+G"); parse/normalize/format round-trip; platform-aware display via `formatChord` (glyphs via `String.fromCharCode`, ASCII source) | ✅ | `keymap.test.ts` parse/normalize/format blocks | tests · 2026-06-22 |
| `matchChord` — typed finite `ShortcutContext`; "global" always-on; **most-specific context wins** | ✅ | `keymap.test.ts` match + precedence blocks | tests · 2026-06-22 |
| Conflict guard (no two bindings share a (chord, context)); same chord across contexts allowed | ✅ | `keymap.test.ts` conflict guard block | tests · 2026-06-22 |
| **Bidirectional integrity** — every keymap commandId exists in registry; every shortcut-bearing command resolves to a binding; **registry carries NO hard-coded shortcut strings** | ✅ | `keymap.test.ts` integrity block | tests · 2026-06-22 |
| Reserved-browser-chord guard (Mod+L/R/T/W/N/Q/P/S) | ✅ | `keymap.test.ts` reserved block | tests · 2026-06-22 |
| Labels DERIVED via `shortcutLabel`/`formatChord` in palette + help (no glyph hard-coding) | ✅ (logic) / 🟡 (render) | typecheck ✅; on-screen labels = browser QA | — |
| `page.tsx` keydown dispatches through `matchChord` (input-guarded; active contexts) | 🟡 | typecheck ✅; live shortcuts = browser QA | — |
| "Keyboard shortcuts" help overlay (open via "?", z-popover, grouped, derived labels) | 🟡 | typecheck ✅; open/close + content = browser QA | — |

## v5.18.0 — "Tidy Layout" recommendation engine (Minor · Phase C)
> Conservative band-based layout inference; pure engine unit-tested ✅; the ⌘K "Tidy layout" apply is
> runtime 🟡. Phase C continues (keyboard shortcuts, inspector polish). (Roadmap = Sonnet; built on Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `recommendLayout` — band-based row/column detection + gap from band gaps (`snapGap` to Tailwind scale); no padding inference | ✅ | `autoArrange.test.ts` row/column + snapGap blocks | tests · 2026-06-22 |
| **Grid only when REGULAR & full** (rows×cols === n); L-shape / staggered / partial / single → "none" (no-op) | ✅ | `autoArrange.test.ts` grid + low-confidence blocks | tests · 2026-06-22 |
| `applyTidy` strips prior layout classes + adds inferred; no-op (input copy) on "none"; already-arranged stable | ✅ | `autoArrange.test.ts` applyTidy block (13 total) | tests · 2026-06-22 |
| "Tidy layout" ⌘K command on selected container → bounded classOverrides (zoom-scaled rects) | 🟡 | typecheck ✅; on-canvas tidy result = browser QA | — |

## v5.17.0 — Gated free-position model (Minor · Phase C · the unlock)
> Pure free-position model (round-trip + clamp + enter/exit) is unit-tested ✅; the StylePanel toggle is
> runtime 🟡. No schema change (bounded classOverrides only). (Roadmap = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `freePosition.ts` — `PositionMode` (flow/free); `parse`/`writeFreePosition` round-trip; `isFreePositioned` | ✅ | `freePosition.test.ts` (parse/mode + round-trip blocks) | tests · 2026-06-22 |
| `toFreePosition` (child rel. parent, scale=zoom), `moveBy` (clamped to parent), `exitFreePosition`, `ensureRelative` | ✅ | `freePosition.test.ts` toFreePosition/moveBy/exit blocks (15 total) | tests · 2026-06-22 |
| StylePanel **Free position** toggle (gated to child-of-container): enter → child `absolute`+`left/top` + parent `relative`; exit → flow | 🟡 | typecheck ✅; toggle + on-canvas absolute placement = browser QA | — |
| Unlocks: resize / align-distribute / snapped-move deltas now have a legal application target (free elements) | 🟡 | model ready; end-to-end apply on free elements = browser QA | — |

## v5.16.0 — Align & distribute (multi-selection) (Minor · Phase C)
> Pure align/distribute geometry + the expressibility gate are unit-tested ✅. Application is gated to
> free-positioned elements (Nova is flow-first) and DISABLED otherwise — never approximated; the toolbar
> apply is runtime 🟡. (Roadmap = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `alignDeltas` — 6 edges (left/centerX/right/top/middleY/bottom) vs selection bounds → `{id,dx,dy}[]`, no-op <2 | ✅ | `alignDistribute.test.ts` align blocks (h/v edges, single/2-item, already-aligned) | tests · 2026-06-22 |
| `distributeDeltas` — h/v, **outermost fixed + inner equal-gap**, order-stable (input order), no-op <3 | ✅ | `alignDistribute.test.ts` distribute block (A/C fixed B moves, unsorted input, vertical) | tests · 2026-06-22 |
| `isAlignExpressible`/`isDistributeExpressible` — require all selected free-positioned (absolute/fixed) | ✅ | `alignDistribute.test.ts` expressibility block (16 total) | tests · 2026-06-22 |
| MultiSelectToolbar align (6) + distribute (2) buttons; disabled (greyed, tooltip) unless expressible; enabled ops write bounded `left-[]`/`top-[]` | 🟡 | typecheck ✅; gating + apply on absolute elements = browser QA | — |

## v5.15.0 — Style-panel inspector clarity & discoverability (Minor · Phase C)
> Scope = per-section summaries + section-scoped reset + visibility (NOT full commercial-grade inline
> editing). Pure summary/reset is unit-tested ✅; the panel UI is runtime 🟡. (Roadmap = Sonnet; built on Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `styleSummary.ts` — single source of section→prefix map; `summarizeSection` ({hasOverrides, resettable, count, classes}) | ✅ | `styleSummary.test.ts` (summarize + classInGroup blocks) | tests · 2026-06-22 |
| `resetSection` — explicit semantics (removes ONLY that section's classes, incl. variants), idempotent, preserves others | ✅ | `styleSummary.test.ts` reset block | tests · 2026-06-22 |
| summary↔reset round-trip + `sectionActive` consistency | ✅ | `styleSummary.test.ts` round-trip + consistency blocks (13 total) | tests · 2026-06-22 |
| StylePanel de-duped to import the single source (no drift); per-Section one-click **Reset** when active | 🟡 | typecheck ✅; reset-button behavior + section dots = browser QA | — |

## v5.14.0 — Per-position DnD geometry + drop indicator (Minor · Phase C)
> The pure drop resolver (contract, midpoint, end-of-list, self-reorder off-by-one, indicator geometry)
> is exhaustively unit-tested ✅. The indicator overlay renders during drag 🟡; aligning Craft's actual
> drop index to `dropTarget.dropIndex` is the remaining runtime integration 🟡. (Roadmap = Sonnet; built on Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `dropTarget.ts` `computeDropTarget` — contract `{dropIndex, placement, targetSiblingId?, indicatorRect?}`; midpoint rule (row/column); end-of-list (drop below last → index n) | ✅ | `dropTarget.test.ts` (column/row + end-of-list blocks) | tests · 2026-06-22 |
| Self-reorder off-by-one (dragged from the target container → final index after removal); no-op detection | ✅ | `dropTarget.test.ts` self-reorder block (B below C → 2; to end → 3; no-op === fromIndex) | tests · 2026-06-22 |
| Empty-container "inside" + single-child + indicator-line geometry (spans container, one space) | ✅ | `dropTarget.test.ts` empty/single + indicator-geometry blocks (18 total) | tests · 2026-06-22 |
| `DropIndicator` resolves the deepest canvas container under the pointer + renders the computed line during drag (z-canvas-overlay, additive/defensive) | 🟡 | typecheck ✅; indicator visibility during drag = browser QA | — |
| Craft final drop index aligned to `dropTarget.dropIndex` (precise landing replacing coarse drop) | 🟡 | geometry ready; Craft drop-handler integration + QA pending | — |

## v5.13.0 — Command registry + ⌘K palette (Minor · Phase C)
> Scope = registry + palette (not a full keyboard model). The pure registry + ranking + availability
> are unit-tested ✅; the ⌘K overlay is runtime 🟡 until browser QA. (Roadmap model = Sonnet; built on Opus.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `commandRegistry.ts` — `CommandDefinition` (action + `isEnabled`) vs `CommandContext`; `COMMANDS` (16, synonym keywords) | ✅ | `commandRegistry.test.ts` (registry + availability blocks) | tests · 2026-06-22 |
| `filterCommands` ranking (title prefix > word-boundary > substring > keyword), deterministic tie-break; empty/no-match | ✅ | `commandRegistry.test.ts` ranking block (12 total) | tests · 2026-06-22 |
| Registry invariant: unique command ids | ✅ | `commandRegistry.test.ts` `hasUniqueIds(COMMANDS)` | tests · 2026-06-22 |
| `CommandPalette` ⌘K/Ctrl-K overlay (portaled z-popover, arrow/Enter/Esc, disabled rows), dispatches editor + UI actions; context via `resolveEffectiveSelection` | 🟡 | typecheck ✅; open/nav/run/close + input-focus behavior = browser QA | — |

## v5.12.0 — Marquee (drag-rectangle) multi-select (Minor · Phase C · TD-016)
> Pure hit-testing + selection-combination are unit-tested ✅; the canvas drag/paint layer is runtime
> 🟡 until browser QA. Additive/toggle selection shipped now (Shift=add, Ctrl/Cmd=toggle).
> (Roadmap model = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `marquee.ts` — `normalizeRect`, `passedThreshold`, `marqueeHits` (intersect/contain, document-order, deterministic) | ✅ | `marquee.test.ts` (normalize/threshold/intersect/contain/degenerate blocks) | tests · 2026-06-22 |
| `selectionModeFromEvent` (Shift=add, Ctrl/Cmd=toggle, else replace) + `applyMarqueeSelection` (replace/add/toggle, order-stable) | ✅ | `marquee.test.ts` (mode-from-event + apply blocks; 13 total) | tests · 2026-06-22 |
| `MarqueeLayer` — empty-canvas drag paints a rect (portaled, z-canvas-overlay), hit-tests ROOT-descendant node rects, writes `uiStore.selectNodes` (I3), zoom-safe | 🟡 | typecheck ✅; canvas drag-select + background-vs-node start = browser QA | — |
| Modifier-aware marquee (Shift add / Ctrl/Cmd toggle) wired from the release event | 🟡 | typecheck ✅; modifier behavior = browser QA | — |

## v5.11.0 — Snapping + smart guides + measure overlays (Minor · Phase C)
> Pure snapping geometry (precedence + determinism + equal-spacing + measure) is exhaustively
> unit-tested ✅; the guide/measure overlays + resize-snap drag are runtime 🟡 until browser QA.
> (Roadmap model = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `snapGuides.ts` `computeSnap` — precedence (overlap>edge>center>spacing), axes independent (corner), threshold, no-match passthrough | ✅ | `snapGuides.test.ts` (alignment + threshold + precedence blocks) | tests · 2026-06-22 |
| Deterministic tie-breaking (priority→distance→position→delta), order-independent of input array | ✅ | `snapGuides.test.ts` determinism test ([a,b] === [b,a]) | tests · 2026-06-22 |
| Equal-spacing (distribution) — same-parent only, equal-gap centering, loses to in-range edge | ✅ | `snapGuides.test.ts` equal-spacing block | tests · 2026-06-22 |
| `snapValue` (single resize edge), `edgeCandidates`, `measureGaps` (cross-axis-overlap nearest gaps) | ✅ | `snapGuides.test.ts` snapValue/edgeCandidates/measureGaps blocks (19 total) | tests · 2026-06-22 |
| Resize drag snaps moving edges to sibling/parent lines (threshold ÷ zoom) + draws guide lines (pink = spacing) | 🟡 | typecheck ✅; on-canvas snap feel = browser QA | — |
| Alt-held distance-to-sibling measure badges during resize | 🟡 | typecheck ✅; visual = browser QA | — |

## v5.10.0 — On-canvas resize + W·H badge + arrow-nudge (Minor · Phase C · TD-017)
> Pure resize math + the resize→layoutModel round-trip are unit-tested ✅; the overlay handles, live
> badge, and arrow-nudge are runtime 🟡 until browser QA. (Roadmap model = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `resizeMath.ts` — `resizeTo` (delta + snap + min-clamp), `nudgeSize` (±1 / Shift ±10), 8px floor | ✅ | `resizeMath.test.ts` (14: snap/clampMin/resizeTo/nudgeSize + constants) | tests · 2026-06-22 |
| Resize & nudge → `layoutModel` round-trip lossless (Fixed px parses back identical; main-axis Fill→Fixed drops `flex-1`) | ✅ | `resizeMath.test.ts` round-trip block (drag width, nudge height, Fill→Fixed) | tests · 2026-06-22 |
| RenderNode E/S/SE resize handles (cursors ew/ns/nwse; portaled to body @ z-canvas-overlay; zoom-corrected) → Fixed via layoutModel | 🟡 | typecheck ✅; drag behaviour + cursor feel + on-canvas resize = browser QA | — |
| Live W·H badge during drag | 🟡 | typecheck ✅; visual = browser QA | — |
| Arrow-key nudge (±1, Shift ±10) of selected node; ignored in inputs/contentEditable | 🟡 | typecheck ✅; key handling + no typing conflict = browser QA | — |

## v5.9.0 — Auto-layout Hug/Fill/Fixed sizing (Minor · Phase C spine)
> The canonical translation layer is pure + round-trip-tested ✅; the StylePanel control + parent-context
> detection are runtime 🟡 until browser QA. (Roadmap model = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `layoutModel.ts` — context-aware sizing intent ↔ Tailwind `classOverrides` (Hug/Fill/Fixed; main-axis `flex-1` vs cross/no-flex `w/h-full`; merge preserves variant + unrelated classes) | ✅ | `layoutModel.test.ts` (11) | tests · 2026-06-22 |
| **Round-trip guarantee** `parse(write(intent,ctx),ctx) === intent` for all modes × axes × contexts (+ from non-empty class lists) | ✅ | `layoutModel.test.ts` exhaustive round-trip block | tests · 2026-06-22 |
| StylePanel **Size** control (Width/Height: Hug/Fill/Fixed + px), reads/writes via the pure layer; parent flex-direction detected as context; `self-*` left to AlignBar | 🟡 | typecheck ✅; control interaction + on-canvas effect = browser QA | — |

## v5.8.0 — I1/I3/I4/I5 conformance + I9 perf baseline (Minor · Phase B)
> Makes the canvas-edit-fidelity invariants checked-in-code. Pure logic (round-trip, clear-mirror,
> replay guard, perf stats) is unit-tested ✅; runtime undo/redo + selection stay 🟡 until browser QA;
> I9 frame numbers are captured at the QA gate. (Roadmap model = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| **I1** round-trip fidelity `nodesToSchema(schemaToNodes(els)) ≡ els` (known + unknown blocks) | ✅ | `roundTrip.property.test.ts` (3: 200 seeded trees w/ `NOVA_RT_SEED` replay, known+unknown coverage, explicit unknown-block lossless case) | tests · 2026-06-22 |
| **I4** `withReplay` single guarded history coordinator (reentrancy-safe; flag always reset) | ✅ | `replayGuard.test.ts` (3: holds+resets, resets on throw, nested once) | tests · 2026-06-22 |
| I4 page.tsx undo/redo refactored to `withReplay`; store/coordinator consistency dev-guard in `updateElements` | 🟡 | typecheck ✅; in-place undo/redo behavior = browser QA | — |
| **I3** `shouldClearCraftSelection` pure clear-mirror rule (uiStore single-writer) | ✅ | `effectiveSelection.test.ts` (+4 clear-mirror cases, 11 total) | tests · 2026-06-22 |
| I3 `RightPanelWithSync` wired to `shouldClearCraftSelection` | 🟡 | typecheck ✅; phantom-selection behavior = browser QA | — |
| **I5** render-loop dev guard: canvas edit must not bump `canvasSyncToken`; replay-flag tracks coordinator | 🟡 | code path + typecheck ✅; dev-warn only fires on regression in browser | — |
| **I9** `perf.ts` marker + `PERF_BUDGETS` + `summarize`/`withinBudget` | ✅ | `perf.test.ts` (10: percentiles, budget pass/fail/unknown, record/report/reset) | tests · 2026-06-22 |
| I9 marker wired into LayoutOverlay reposition + `updateElements`; budgets/procedure in `doc/perf-baseline.md` | 🟡 | wired + dev-only; live frame numbers (`overlay.reposition`/`canvas.commit`) captured at QA gate | — |

## v5.7.0 — I7 UI Layering Contract (Minor · Phase B · ADR-041)
> Fixes the reported bug where canvas overlays cover the Style panel. Pure scale + guard are unit-tested;
> the on-screen stacking result is 🟡 until browser QA. (Roadmap model = Sonnet; built on Opus this session.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `src/lib/zLayers.ts` — named z-layer scale (`canvas<canvas-overlay<chrome<popover<modal<toast`), single source for Tailwind `z-<layer>` + `--z-*` vars | ✅ | `zLayers.test.ts` (7: six layers, strict ascending order, `canvas-overlay<chrome`, popover/modal/toast above chrome, unique values, no-raw-z source scan) | tests · 2026-06-22 |
| Magic z-indexes replaced with layer tokens across 11 editor files (RenderNode/AlignBar/LayoutOverlay/MultiSelectToolbar/RightPanel/LeftPanel/TopBar/ContextMenu/Toaster/Onboarding/VercelSettings) | ✅ | `zLayers.test.ts` raw-z scan passes; `pnpm typecheck` 8/8 | tests · 2026-06-22 |
| Chrome (TopBar/Left/RightPanel) establishes a `z-chrome` stacking context dominating all `canvas-overlay` portals | 🟡 | code path + shell analysis ✅; on-screen result = browser QA (select element flush to right edge → toolbar/AlignBar beneath the panel) | — |
| Tailwind default `z-0…z-50` preserved for user `classOverrides`; user z bounded inside the canvas transform context | 🟡 | safelist unchanged + typecheck ✅; visual confirm = browser QA | — |

## v5.6.0 — Nova Document Model (Minor · Phase A of the Design-Mode plan)
> Doc + pure constants only — no behavior change. The model doc is review-level; the invariant index is
> unit-tested. (Roadmap-assigned model = Sonnet; built by Opus this session — model switching is user-controlled.)

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `doc/MODEL.md` — representations & authority, two edit directions, I1–I10 catalog, design-mode north-star, Hug/Fill/Fixed paradigm, bug-triage methodology, doc hierarchy | ✅ | authored + doc review; added to README canonical list + SPEC companion docs | review · 2026-06-21 |
| `packages/editor/src/model/invariants.ts` — I1–I10 named, deep-frozen, exported from `@studio/editor` | ✅ | `invariants.test.ts` (7 tests: id list/order, no dupes, entry-set==ids, key↔id, non-empty name/statement, frozen catalog+entries, named lookups) | tests · 2026-06-21 |
| ADR.md invariant cross-reference + ADR-004 mis-attribution correction (render-loop = ADR-002/039) | ✅ | ADR.md updated; map matches MODEL.md Part III.2 | review · 2026-06-21 |

## v5.5.0 — UX & Performance debt resolution (Minor, Sonnet · TD-028/029/030)
> Resolves three debts from audit Clusters 2 and 4. Pure logic (flat-tree helpers + overflow detection)
> is fully unit-tested. Runtime interactions (DnD drag, virtual scroll, badge rendering) are 🟡 until
> browser-QA'd at the Phase-D gate.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| TD-028: `AlignBar` no longer mutates parent node — `setParentClass`/`setJustify`/`setItems` removed; only selected node's `self-*` classes are mutated | 🟡 | `pnpm typecheck` 8/8 clean; browser alignment behavior = QA gate | — |
| TD-028: Read-only `flex→`/`flex↓` context label shows parent direction without touching it | 🟡 | typecheck ✅; visual output = browser QA | — |
| TD-029: `layersUtils.ts` — `flattenTree(ids, nodes, depth): FlatNode[]` DFS traversal + `ITEM_H = 32` | ✅ | `layersUtils.test.ts` (13 tests: empty, leaf, missing id, partial-missing, DFS order, depth=0/increment/non-zero, multiple roots, wide tree, deep 5-level, mixed complex) | tests · 2026-06-18 |
| TD-029: `LeftPanel` DnD migrated to `@dnd-kit/core` PointerSensor (distance:4) + before/inside/after drop-position via `[data-layer]` bounding rect | 🟡 | typecheck ✅; drag-and-drop correctness = browser QA | — |
| TD-029: Flat DFS + virtual window (scroll+ResizeObserver, OVERSCAN=8, padding-trick) replaces recursive unvirtualized render | 🟡 | typecheck ✅; large-tree scroll performance = browser QA | — |
| TD-030: `simpleModeUtils.ts` — `SIMPLE_KNOWN_CLASSES` union set + `simpleModeOverflow(overrides)` → `"none" \| "mixed" \| "custom"` | ✅ | `simpleModeUtils.test.ts` (17 tests: empty, all-known, single-known, arbitrary/custom, all-unknown, mixed, hover:/dark:/md: variant stripping for known+unknown) | tests · 2026-06-18 |
| TD-030: Amber "Custom"/"Mixed" badge visible in SimpleModePanel when Advanced-mode classes are active | 🟡 | typecheck ✅; badge render + correct copy = browser QA | — |

## v5.4.0 — TD-007 Playwright E2E harness (Minor, Sonnet · ADR-015)
> Harness authored and structured correctly. Green runs require: (1) `pnpm install` to
> pull `@playwright/test`, (2) a running dev server, (3) auth state in `e2e/.auth/user.json`.
> All rows 🟡 until confirmed at the Phase-D QA gate.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `playwright.config.ts` — chromium project, `storageState` auth reuse, retries:1, 30s timeout | ✅ | file authored; excluded from `tsc` (tsconfig.e2e.json); config structure valid | review · 2026-06-18 |
| `e2e/fixtures.ts` — route mocks for `/api/project/*` / `/api/me` / `/api/ai`; `editorPage` + `editorPageLowCredits` fixtures | ✅ | authored; mocks use `route.fulfill` (network-boundary isolation, ADR-015) | review · 2026-06-18 |
| `e2e/auth.setup.ts` — storageState auth setup with step-by-step instructions (codegen + Option B CI bypass) | ✅ | authored; runs as Playwright "setup" project before chromium | review · 2026-06-18 |
| `editor-load.spec.ts` — canvas visible, icon rail, empty-state prompt, publish button | ✅ | authored; browser run passed | review · 2026-06-18 |
| `add-block.spec.ts` — click "Text Block" in Blocks panel → visible in Layers tree; primitive block presence | ✅ | authored; browser run passed | review · 2026-06-18 |
| `undo-redo.spec.ts` — add block → Ctrl+Z (canvas marker replayed via Craft-native) → gone; Ctrl+Y → restored | ✅ | authored; exercises v5.0.0 unified history coordinator; browser run passed | review · 2026-06-18 |
| `credit-gate.spec.ts` — 0-credit user sees "insufficient" message + disabled AI input; 200-credit user sees counter | ✅ | authored; exercises v4.1.0/v4.2.0 credit UX; browser run passed | review · 2026-06-18 |
| ADR-015 flipped 🧪 not built → ✅ harness / ✅ runs | ✅ | ADR.md updated | review · 2026-06-18 |

## v5.3.0 — TD-023 buildable export scaffold (Minor, Sonnet)
> `generateAll` now emits the three files needed for a standalone Next.js build.
> Pure generator logic is fully unit-tested; actual `npm run build` on a real exported
> repo is browser/CI-gated (TD-024).

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `generatePackageJson({projectName?})` — emits `package.json` with `tailwind-merge`+all Next.js deps, dev/build/start scripts, slugified name | ✅ | `scaffold.test.ts` (7 tests: dep checks, scripts, name slug, fallback, JSON validity) | tests · 2026-06-18 |
| `POSTCSS_CONFIG_SOURCE` — `module.exports` with tailwindcss + autoprefixer plugins | ✅ | `scaffold.test.ts` (2 tests) | tests · 2026-06-18 |
| `GLOBALS_CSS_SOURCE` — `@tailwind base/components/utilities` directives | ✅ | `scaffold.test.ts` (3 tests) | tests · 2026-06-18 |
| `generateScaffold({projectName?})` — returns `{package.json, postcss.config.js, app/globals.css}` | ✅ | `scaffold.test.ts` (2 tests: key set, name forwarding) | tests · 2026-06-18 |
| `generateAll` emits scaffold files alongside page/block files; project name flows to `package.json` name | ✅ | `scaffold.test.ts` (6 integration tests via `generateAll`) | tests · 2026-06-18 |
| Exported repo actually builds (`npm install && npm run build`) | 🟡 | logic ✅; real build + deploy verification = TD-024 (QA gate) | — |

## v5.2.0 — TD-003 pluggable rate-limiter (Minor, Sonnet)
> Replaces the per-instance `Map` in `middleware.ts` with a pluggable fixed-window limiter.
> Upstash path is runtime-only (needs real env vars); pure logic is fully unit-tested.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `shouldBlock(count,max)` pure decision + `advance(entry,windowMs,now)` window-reset — extracted, unit-tested | ✅ | `rateLimit.test.ts` (5 + 4 tests) | tests · 2026-06-18 |
| `createMapLimiter` — allows up to max, blocks max+1, resets after window, isolates keys | ✅ | `rateLimit.test.ts` (4 tests: allow/block/reset/isolation) | tests · 2026-06-18 |
| `createUpstashLimiter` — sends INCR+EXPIRE NX pipeline to Upstash REST, passes/blocks on count, fails-open on non-ok / network error | ✅ | `rateLimit.test.ts` (5 tests: payload shape, pass, block, non-ok, throw) | tests · 2026-06-18 |
| `createDefaultLimiter` — picks Upstash when `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN` set; picks Map otherwise | ✅ | `rateLimit.test.ts` (2 env-selection tests) | tests · 2026-06-18 |
| `middleware.ts` wired to `createDefaultLimiter`; lazy `getCheck()` singleton; `export async function middleware` | ✅ | `pnpm typecheck` 8/8 clean | tests · 2026-06-18 |
| Shared-store rate limiting (multi-instance production with Upstash configured) | 🟡 | logic ✅; real Upstash instance + multi-instance load test = runtime QA | — |

## v5.1.1 — Runtime robustness & type cleanup (Patch, Haiku)
> Debt cleanup, no behavior change. Fully unit-testable / typecheck-only — no browser dependency.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| TD-004 lazy Supabase: `getSupabase()` + `supabase` Proxy — import never touches env; clean error at call time on missing env | ✅ | `supabase-server.test.ts` (throws clear error when env absent) + typecheck; call sites (`supabase.from(...)`) unchanged | tests · 2026-06-17 |
| TD-010 removed `NovaRootCanvas as UserComponent<...>` cast (typed props as `Record<string,unknown>`) | ✅ | `pnpm typecheck` 8/8 clean with the cast gone | tests · 2026-06-17 |
| TD-006 (RenderNode portal race) confirmed already resolved (ADR-032 → `document.body`); TD-008/009 accepted constraints | ✅ | code inspection; documented in memory | review · 2026-06-17 |

## v5.1.0 — Craft-fork IDs: mint `node_<8>` at creation (Minor, Sonnet · ADR-040, C5.2)
> Pinned pnpm patch of `@craftjs/core` createNode + retire `toNovaId()`. Closes TD-001/002. No schema
> change. Patch/guard is unit-tested; the end-to-end create-flow is browser-QA-gated (batched post-v5).

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `@craftjs/core` patch mints `"node_"+getRandomId(8)` at node creation (`patches/@craftjs__core@0.2.12.patch`, registered in root `pnpm.patchedDependencies`) | ✅ | `craftIdMint.test.ts` reads the installed entry + asserts the patched mint — CI guard fails if the patch stops applying | tests · 2026-06-17 |
| `toNovaId()` removed; `nodesToSchema` passes ids through verbatim + dev-only `assertNovaId` warn-guard; call sites (`useEditorCommands`, `MultiSelectToolbar`) drop normalization | ✅ | `adapter.test.ts` rewritten for pass-through (8) + typecheck all 8 packages | tests · 2026-06-17 |
| Drag-from-panel / click-to-add produce a `node_<8>` id immediately (no transient nanoid); duplicate/group/delete target the right node; no dev-guard warnings | 🟡 | logic ✅; live Craft create-flow + schema inspection = browser QA | — |

## v5.0.0 — Hybrid unified undo + selection desync fix (Major, Opus · ADR-039, reverses ADR-009)
> Audit Cluster 6 (C6). Replaces the 20-snapshot history with an interleaved timeline (Craft-native
> canvas history + schema steps). C5.2 (Craft-fork IDs) deferred → v5.1.0. No schema change.
> Pure reducers are unit-tested; the interactive undo/redo/selection behavior is **browser-QA-gated**
> (batched post-v5) so it stays 🟡 until clicked through.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `unifiedHistory` pure reducer — push/undo/redo/clear, future-clear, MAX cap, **interleaved canvas+schema ordering** (newest-first), immutability | ✅ | `unifiedHistory.test.ts` (8) | tests · 2026-06-17 |
| `resolveEffectiveSelection`/`primarySelection` — multi-select wins, Craft fallback, empty-when-both-empty (phantom-selection fix) | ✅ | `effectiveSelection.test.ts` (7) | tests · 2026-06-17 |
| projectStore wired to unified history: canvas markers (lockstep, zero-payload — no memory bomb), schema steps for page/theme/AI, `replaying` guard | 🟡 | typecheck ✅; lockstep with Craft history + replay-guard timing need browser QA | — |
| Coordinator undo/redo (`EditorWorkspace`): canvas step → `Craft.history.undo/redo` in place (no remount, keeps selection); schema step → snapshot reapply | 🟡 | typecheck ✅; in-place vs remount behavior + cross-source interleave = browser QA | — |
| Selection desync fix: uiStore single-writer; `RightPanelWithSync` mirrors programmatic clears → Craft; commands resolve via `primarySelection` | 🟡 | typecheck ✅; phantom-delete + sticky-selection + multi-select interplay need browser QA | — |
| TopBar undo/redo enablement from unified history (`canUndo`/`canRedo`) | 🟡 | typecheck ✅; visual enable/disable state = browser QA | — |

## v4.2.0 — Credit UX surfacing (Minor, Sonnet)
> Surfaces the v4.1.0 two-bucket model in the editor UI. No DB/schema change;
> pure logic (creditDisplay.ts) is unit-tested; interactive/visual behavior is 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| `creditDisplay.ts` — `formatCredits`, `isDailyCapWarning`, `creditBreakdownText`, `clientCreditBlockReason` pure helpers | ✅ | `creditDisplay.test.ts` (18) — boundary cases for all 4 helpers | tests · 2026-06-17 |
| `userStore` extended with `monthlyCredits`, `topupCredits`, `dailyCap`, `dailyRemaining`; `consumeCredit` decrements `dailyRemaining` optimistically | 🟡 | typecheck ✅; store initialises with correct defaults; browser hydration from `/api/me` needs QA | — |
| TopBar credit widget: combined total + tooltip breakdown; Free daily badge (amber when ≤ 2× min op cost); removed dead `hasUnlimitedAI` / "Unlimited" branch | 🟡 | typecheck ✅; visual render + badge threshold + tooltip text need browser QA | — |
| `buildTopupCheckoutUrl(credits, githubId)` in `checkout.ts` — 3 package sizes (200/1000/4000); requires `NEXT_PUBLIC_LEMONSQUEEZY_TOPUP_{N}_URL` env vars | 🟡 | typecheck ✅; real checkout redirect needs env + browser QA | — |
| AI panel footer: daily sub-cap row (Free only), `daily_cap` vs `insufficient` error messages, `TopupButtons` one-click purchase links | 🟡 | typecheck ✅; error state + button appearance + checkout redirect need browser QA | — |
| Post-AI-op async `/api/me` refetch updates breakdown fields in store | 🟡 | typecheck ✅; timing + race-free behavior needs browser QA with real Supabase | — |
| TierSwitcher re-hydration updated to pull new breakdown fields | 🟡 | typecheck ✅; needs browser QA with test account tier switch | — |

## v4.0.0 — Brittle-preset decomposition + rich text/media (ADR-037)
> Major (schema `2.0 → 3.0`, transformative migration). Block/component & migration
> logic is unit-tested; canvas interactions (inline edit, drag into shells) are 🟡 until browser QA.

| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C3.1 HeroSection renders children directly (slice()/`React.Children.toArray` hack removed); `split-*` → 2-col grid, `canMoveIn` gains `Box` | ✅ | `sources.test.ts` "no children-slicing hack"; HeroSection source children-only | tests · 2026-06-17 |
| C3.1 migration `2.0→3.0` wraps legacy split heroes into two `Box` columns (idempotent; centered untouched) | ✅ | `migration.test.ts` 3 hero cases (split-wrap, centered, idempotency) | tests · 2026-06-17 |
| C3.5 FeatureCard/PricingCard are `isCanvas` shells rendering children only (no `title`/`price`/`features` props) | ✅ | `sources.test.ts` v4.0.0 contract (children-only, no content props); `registry.smoke.test.ts` defaults pass schema | tests · 2026-06-17 |
| C3.5 migration `2.0→3.0` decomposes Feature `icon/title/description` + Pricing `plan/price/period/features` → child TextBlocks (Pricing keeps CTA Button) | ✅ | `migration.test.ts` FeatureCard + PricingCard `2.0→3.0` cases + updated full-chain | tests · 2026-06-17 |
| C3.5 `defaultChildren` reproduce the old card layout on fresh insert; AI hints rewritten to child-based shape | 🟡 | `defaultChildren` set + `*.ai.ts` rewritten; typecheck ✅; browser QA: drag card, confirm child TextBlocks/Button in Layers tree | — |
| C3.3 Button/Link support inline label editing (`_novaEditing`/`inlineEditProp:"label"`, parity with TextBlock) | 🟡 | components render editable `<span>` when `_novaEditing`; `inlineEditProp` wired in index.ts; typecheck ✅; browser QA: double-click a Button/Link, edit, blur to commit | — |
| C3.4 exported Image uses `next/image` (`fill`+`sizes`), no raw `<img>`; `auto`→`aspect-video` fallback | ✅ | `sources.test.ts` v4.0.0 contract (`next/image`, no `<img>`, `auto` fallback); transform drift-guarded | tests · 2026-06-17 |
| C3.4 Image flexible aspect ratios (`3/4`, `3/2`, `21/9` added) in editor + export | ✅ | `Image.schema.ts` enum + live/generated source map; `schemaIntrospect`/smoke green | tests · 2026-06-17 |
| C3.4 exported Next project actually builds with `next/image` (sized parent, `auto` fallback) | 🟡 | code-gen verified by `sources.test.ts`; real exported-build render not agent-testable (TD-024/TD-027) | — |
| `createDefaultProject` / `LATEST_VERSION` / `versionChain` stamp `3.0`; all migrate-to-latest assertions updated | ✅ | schema 72 + git readProject + template + defaults tests green | tests · 2026-06-17 |

## v3.1.0 — Box primitive + layout presets + Section `as` prop (ADR-036)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C1.1 `Box` block: polymorphic (`as` prop), `isCanvas`, no `canMoveIn` restriction, `bgColor` defaults to `transparent` | ✅ | `box.test.ts` (7) + `schemaIntrospect.test.ts` Box section; `registry.smoke.test.ts` + `sources.test.ts` include Box | tests · 2026-06-17 |
| C1.1 `Box` published to `sources.ts` (16 blocks, drift-guarded) | ✅ | `generateSources.mjs --emit` regenerated; `sources.test.ts` sync + valid-TSX tests | tests · 2026-06-17 |
| C1.3 `Section` gains `as` prop with default `"section"` (backward-compat, no migration) | ✅ | `schemaIntrospect.test.ts` Section `as` enum test; existing Section tests pass without change | tests · 2026-06-17 |
| C1.2 LeftPanel layout presets group ("2 Col", "3 Col", "Sidebar L/R") inject nested `Box` trees | 🟡 | `LAYOUT_PRESETS` constant + `buildPresetElement` helper; typecheck ✅; browser QA needed (click preset, confirm nested Box nodes appear in Layers tree) | — |
| C1.1 Box appears in Blocks picker under Primitives; drag-to-canvas works | 🟡 | `PRIMITIVE_BLOCKS` set updated; typecheck ✅; browser QA needed | — |

## v3.0.0 — Recursive props schema, 1.6 → 2.0 (ADR-035)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C10.1 `PropsValueSchema` fully recursive (array-of-objects + nested records accepted; non-serializable rejected) | ✅ | `props.schema.test.ts` (9) + `element.schema.test.ts` updated (deep-nesting now accepted, function rejected) | tests · 2026-06-17 |
| C10.1 migration `1.6 → 2.0` additive (version bump, data preserved; array-of-objects survives full chain + `ProjectSchema.parse`) | ✅ | `migration.test.ts` 1.6→2.0 cases; whole suite re-asserts latest = `2.0` | tests · 2026-06-17 |
| `createDefaultProject` / `LATEST_VERSION` / `versionChain` stamp `2.0`; all migrate-to-latest assertions updated | ✅ | schema 67 + git readProject + template + defaults tests green | tests · 2026-06-17 |
| **Deferred — C6** (rip `historyStore` → Craft-native undo; unify selection) | 🔴 | NOT done in v3.0.0 — reverses ADR-009, browser-only-verifiable, no E2E harness. Re-scoped on roadmap, gated on QA capability (ADR-035 scope note) | — |
| **Deferred — C5.2** (mint real `node_<8>` IDs via Craft fork) | 🔴 | NOT done in v3.0.0 — reverses ADR-012 (no public node-id override), browser-only-verifiable. Re-scoped on roadmap | — |

## v2.4.0 — AI semantic (targetId) patching (ADR-034)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C8.3 NovaPatch types (`SetPropOp`/`SetPropsOp`/`AddChildOp`/`RemoveOp`) defined in `semanticPatch.ts` | ✅ | 22-test suite: all 4 ops, nested elements, immutability, Zod validation, sequential ops, smart-dispatch; typecheck ✅ | tests · 2026-06-16 |
| C8.3 `applySemanticPatch` — ID-based tree search, throws on unknown targetId, Zod-validates result | ✅ | `semanticPatch.test.ts` happy paths + error paths | tests · 2026-06-16 |
| C8.3 `applySmartPatch` — routes RFC 6902 to legacy applier, NovaPatch to semantic applier | ✅ | dispatcher tests in `semanticPatch.test.ts` | tests · 2026-06-16 |
| C8.3 API route uses `applySmartPatch` (backward-compat with any cached RFC 6902 responses) | 🟡 | code path audited + typecheck ✅; live AI call needed to confirm end-to-end schema mutation | — |
| C8.3 System prompt rewritten: NovaPatch format, NOVA PATCH OPS section, OUTPUT FORMAT EXAMPLE updated | 🟡 | prompt reviewed; functional QA = real AI session producing `set-prop`/`add-child` ops | — |

## v2.3.0 — Inspector-panel performance & robustness (ADR-033)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C4.1 PropsPanel text/number/textarea inputs debounced 300 ms | 🟡 | `DebouncedTextInput`/`DebouncedTextarea`/`DebouncedNumberInput` components + `useDebounce` hook; typecheck ✅; UI behavior (no lag/jitter during typing) needs browser QA | — |
| C4.2 Zod `_def` introspection isolated to `fieldDescriptors.ts` in registry (zero private Zod API in PropsPanel) | ✅ | `getFieldDescriptors` exported from `@studio/registry`; `WeakMap` cache; existing PropsPanel-dependent functionality covered by registry smoke tests + typecheck | tests · 2026-06-16 |
| C4.3 LeftPanel layer tree auto-scroll during drag (48 px zone, 8 px/frame) | 🟡 | code reviewed; `onDragOver` + `requestAnimationFrame` implementation; browser QA needed (drag a node, hold near bottom edge, confirm list scrolls) | — |
| C4.4 StylePanel bg/text color shows arbitrary value instead of "—" when advanced class set | 🟡 | `BG_COLOR_VALUES` guard + dynamic option injection for `bgVal`/`resolvedTextColorVal`; typecheck ✅; visual confirm in browser: set `bg-gradient-to-r` in Advanced, switch to Default → Color field shows "gradient-to-r ↵" | — |

## v2.2.0 — Canvas overlay portaling (ADR-032)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C2 RenderNode toolbar portals to `document.body` + zoom subscription | 🟡 | typecheck ✅; portal target verified by code review; visual alignment at zoom≠1 needs browser QA | — |
| C2 AlignBar portals to `document.body` + tethers to selected node bbox via `position:fixed` | 🟡 | typecheck ✅; tether logic: `getBoundingClientRect` + scroll/resize/zoom listeners; browser QA | — |
| C2 LayoutOverlay portals to `document.body` + rAF reposition + ResizeObserver + zoom subscription | 🟡 | typecheck ✅; margin-vs-gap guard (`cssColGap/cssRowGap >= 2`) verified by code review; browser QA | — |
| TD-018 overlays correctly positioned at zoom 50%, 75%, 100% (all three overlays) | 🟡 | implementation complete; needs manual QA: set zoom to 50%/75%, select a block, confirm toolbar/AlignBar/gap bands are correctly placed | — |

## v2.1.1 — Code-export crash & deploy fixes (ADR-031)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C7.1 component name sanitization (strips leading non-alpha, fallback "Page") | ✅ | `pageFile.test.ts` — 3 sanitization cases | tests · 2026-06-16 |
| C7.2 string props via `JSON.stringify` (preserves `\n`, no manual escaper) | ✅ | `propsToJSX.test.ts` — updated 4 cases + new newline test | tests · 2026-06-16 |
| C7.3 `generateAll` throws on unknown block type (no dangling imports) | ✅ | `sources.test.ts` — "generateAll guards (C7.3)" | tests · 2026-06-16 |
| C7.4 page wraps in React fragment instead of `<main className="min-h-screen…">` | ✅ | `pageFile.test.ts` — C7.4 wrapper test | tests · 2026-06-16 |
| C9.3 `triggerVercelDeploy` removed from publish route (relies on native GitHub→Vercel) | ✅ | code removed; typecheck clean; existing `vercel.test.ts` tests the function itself | tests · 2026-06-16 |
| C10.2 `migrateToLatest` does not mutate its input (`structuredClone`) | ✅ | `migration.test.ts` — "does not mutate the input object (C10.2)" | tests · 2026-06-16 |
| C10.3 `migrateToLatest` throws friendly error for non-Nova input | ✅ | `migration.test.ts` — "throws a friendly error for non-Nova input (C10.3)" | tests · 2026-06-16 |

## v3.2.0 — Cloudflare Workers Staging Deployment (ADR-033)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| Build-time crash `supabaseUrl is required` resolved | ✅ | Fallback variables added to `supabase-server.ts` to allow CI static analysis | tests · 2026-06-17 |
| Cloudflare Wrangler Node.js compat crash (`Could not resolve "crypto"`) | ✅ | Bumped `compatibility_date` to `2024-09-23` in `wrangler.toml` and upgraded `wrangler` to `^4.0.0` in `package.json` | config · 2026-06-17 |
| GitHub Actions deprecation warnings resolved | ✅ | Bumped setup-node to Node.js 22 | config · 2026-06-17 |
| OpenNext esbuild Go Regex crash (`(?g)`) on `build:cf` | ✅ | Created `patch-open-next.js` in `postinstall` to remove the invalid `g` regex flag dynamically from `open-next` | config · 2026-06-17 |
| AWS SDK browser export crash (`index.browser.js`) | ✅ | Created `patch-aws-sdk.js` to modify `package.json` in `.next/standalone` to bypass broken exports before `wrangler deploy` | config · 2026-06-17 |
| NextAuth Cloudflare `https.request` crash on OAuth | ✅ | Bypassed `openid-client` by overriding `token.request` and `userinfo.request` with native `fetch` in `auth.ts` | auth · 2026-06-17 |
| NextAuth `localhost:3000` redirect_uri mismatch bug | ✅ | Forced `NEXTAUTH_URL` into token payload and `wrangler.toml` to bypass Next.js build-time static evaluation on Cloudflare | auth · 2026-06-17 |

## v2.1.0 — Security & data-integrity (ADR-030)
| Feature | Level | Evidence | Reviewer · date |
|---|---|---|---|
| C5.1 unknown/unmigrated block → `UnknownBlock` fallback (children preserved, lossless round-trip) | ✅ | `adapter.test.ts` unknown-type block (3) | tests · 2026-06-16 |
| C8.2 `extractJsonPatch` recovers patch array from fences + conversational preamble | ✅ | `patcherAgent.test.ts` (incl. preamble + `extractJsonPatch` 5) | tests · 2026-06-16 |
| C1.4 `hasBgOverride` detects arbitrary (`bg-[…]`) + gradient backgrounds | ✅ | `novaStyle.test.ts` arbitrary/gradient block | tests · 2026-06-16 |
| C3.2 TextBlock no raw-HTML injection (no `dangerouslySetInnerHTML`) | 🟡 | source guard `sources.test.ts` ✅; in-editor edit-mode XSS behavior = browser QA | — |
| C9.1/C9.2 AI rate limit counts pre-logged `ai_request` markers (race + unlimited-tier bypass fixed) | 🟡 | route logic + migration `0005_ai_request_marker.sql` written; needs DB apply + concurrent-request verify | — |
| C8.1 publish deletes ghost files (`sha:null` tombstones, scoped to Nova-managed paths) | 🟡 | code path written; needs a real GitHub publish to confirm | — |

## Editor interactions (need browser QA)
| Feature | Level | Notes | Reviewer · date |
|---|---|---|---|
| Click-select → Props/Style panel targets it | 🟡 | sync via `RightPanelWithSync` (Craft→uiStore) | — |
| LeftPanel layer tree rendering (fixed `react-hooks/rules-of-hooks` crash caused by early return before `useState`) | ✅ | logic audited, `eslint` rules pass | tests · 2026-06-17 |
| Shift/Ctrl-click multi-select accumulates | 🟡 | **fixed this session** (single-writer sync); needs manual confirm | — |
| Drag block from panel → canvas + drop indicator | 🟡 | Craft DnD; never browser-confirmed post-v1.4 | — |
| Add block via click / Layers "+" + `defaultChildren` | 🟡 | `buildBlockElement` traced correct | — |
| Style panel writes apply on canvas (post-`cn()` fix) | 🟡 | merge logic now ✅ unit-tested (`cn.test.ts`); end-to-end canvas render still needs browser QA | — |
| Column/Stats/Testimonials column-count picker (ZodUnion) | 🟡 | **fixed this session** | — |
| Section layout overrides reach children (single-layer) | 🟡 | **fixed this session** | — |
| Layers rename (F2 + context menu) persists across reload | 🟡 | round-trip persistence now ✅ unit-tested (`_novaName`); F2/display UI still needs browser QA | — |
| Style "Clear all" + per-class `×` reset | 🟡 | added this session | — |
| Group → Section / Ungroup (via context menu) | 🟡 | Ungroup reachability **fixed this session** | — |
| Undo/redo (Ctrl+Z/Y) | 🟡 | logic sound (ADR-009) | — |
| AlignBar / gap-drag LayoutOverlay | 🟡 | works at zoom=1 only (TD-018) | — |
| Inline text edit (double-click TextBlock) | 🟡 | path traced | — |
| Responsive viewport switch | 🟡 | — | — |
| Zoom (input now 25–100%) | 🟡 | overlays offset at ≠100% (TD-018) | — |
| AI chat → patch applied to canvas | 🟡 | — | — |
| Publish (Free: project.json / Pro: .tsx) | 🟡 | ⚠️ Pro output diverges — see below | — |
| Credit allowances (free 200 / pro 4000 / max 15000 / team 5000) | 🟡 | migration `0004_credit_allowances.sql` + `supabase-server.ts` grant written; needs DB apply + manual verify | — |
| Pages CRUD + SEO; Templates save/apply | 🟡 | — | — |

## Known broken / not implemented
| Item | Level | Ref |
|---|---|---|
| W1 marquee (drag-rectangle select) | 🔴 not implemented | TD-016 |
| W3 element resize handles + free-position | 🔴 not implemented | TD-017 |
| Pro publish: block sources drift / `cx` no twMerge | ✅ resolved | ADR-027: sources GENERATED from live blocks (`cn`/tailwind-merge), drift-guarded by `sources.test.ts` · 2026-06-16 |
| Pro publish: exported Next project actually builds + renders identically | 🟡 | unify+codegen verified by typecheck/vitest; deploy build not agent-testable (TD-024) |
| Pro publish: exported repo has `tailwind-merge` installed | 🔴 | publish route must inject the dep (TD-023) |
| Theme tab tokens unused in editor | 🟡 labeled export-only (ADR-029); full token binding deferred | TD-019 |
| Footer decomposed (links → child Link nodes, migration 1.5→1.6) | ✅ migration tested (`migration.test.ts`); in-editor insert/render = Phase 5 QA | TD-021 |
| Row flex primitive block | ✅ registered + registry-covered; in-editor drag/insert = Phase 5 QA | TD-022 |
| Layers "hide" not persisted | 🔴 (session-only) | — |
| E2E (Playwright) suite | ✅ built & runs | ADR-015 |
| Overlays mispositioned at zoom ≠ 1 | 🟡 | TD-018 — portaling fix implemented (ADR-032); needs browser QA at zoom 50%/75% |
| Pro AI metering contradiction (tiers.ts unlimited vs policy/DB 4000) | ✅ resolved | **TD-026 RESOLVED in v4.1.0 (ADR-038):** all tiers metered in `tiers.ts` (Pro 4000, Free 200); `/api/ai` deducts for all; logic unit-tested. Runtime enforcement = v4.1.0 🟡 rows above. · 2026-06-17 |

> **Next action to convert 🟡 → ✅:** run the step-by-step **[QA-PHASE5.md](QA-PHASE5.md)** checklist on a real project, flip confirmed rows here (dated), and file any failure as 🔴 + a TD.
