# SOLID Principle Audit — Nova Builder

> Run: `pnpm solid:audit` from the repo root.
> Script: `scripts/solid-audit.mjs`
> Scope: ALL non-ws packages — `apps/nova-builder/src/`, `apps/studio/src/`, `packages/ai/src/`, `packages/deploy/src/`, `packages/editor/src/`, `packages/git/src/`, `packages/registry/src/`, `packages/renderer/src/`, `packages/schema/src/`
> Audit gate: runs after every tier completes. BLOCKING violations must be fixed before the next tier starts.
> Legacy policy: deprecated packages (`apps/studio/`, `packages/editor/`, `packages/registry/`, `packages/renderer/`, `packages/schema/`) are capped at WARN for S1 size violations — they are being sunsetted, not refactored.

---

## Checks Reference

| Check | Principle | Threshold | Severity |
|-------|-----------|-----------|----------|
| **S1** — File too large | Single Responsibility | >400 lines → WARN, >700 → BLOCKING | 🟡 / 🔴 |
| **S2** — Write-path mixed with UI components | Single Responsibility | captureSnapshot + >5 UI sub-functions in same file | 🟡 |
| **O1** — Inline OR dispatch chain | Open / Closed | `prop === "x" \|\| prop === "y" \|\| prop === "z"` inline | 🟡 |
| **O2** — StyleInspector panel count | Open / Closed | Each new panel forces 4 edits to StyleInspector | ⚪ INFO |
| **L1** — Inconsistent Panel interface | Liskov | Panels exported from `*Editor.tsx` with >2 required props | 🟡 |
| **I1** — Fat prop type | Interface Segregation | Props type with >5 fields | 🟡 |
| **I2** — Unused destructured props | Interface Segregation | Props destructured but body never references them | 🟡 |
| **D1** — Duplicated write-path functions | Dependency Inversion | `uid/ensureSrc/writeProperty` in ≥2 files (BLOCKING at ≥4) | 🟡 / 🔴 |
| **D2** — Supabase in builder/canvas component | Dependency Inversion | Direct Supabase import in UI layer | 🔴 BLOCKING |

---

## Tier 1 Audit — Phases 13–22 (retroactive)

> Tier 1 audit was run retroactively after the Tier 2 SOLID initiative created the audit script. At the time Tier 1 phases were completed, no audit script existed. The findings below reflect the state of the codebase that accumulated during Tier 1 development and were found + fixed during the Tier 2 audit cycle.

**Audit run date:** 2026-07-06
**Version at audit:** v8.17.0 (pre-fix)
**Files scanned:** 83

### Findings

| Check | Severity | File | Description |
|-------|----------|------|-------------|
| S1 | 🔴 BLOCKING | `builder/StyleInspector.tsx` | 790 lines — mixed section grouping, state management, multi-select logic, StateSelector, AddPropertyRow, panel registry |
| D1 | 🔴 BLOCKING | 5 files | `uid()` + `ensureSrc()` + write-path duplicated in: `ShadowEditor.tsx`, `TransformEditor.tsx`, `TransitionEditor.tsx`, `FilterEditor.tsx`, `left-sidebar/components/index.tsx` |
| S1 | 🟡 WARN | `builder/TransitionEditor.tsx` | 501 lines |
| S1 | 🟡 WARN | `app/builder/[projectId]/page.tsx` | 555 lines |
| S1 | 🟡 WARN | `builder/ShadowEditor.tsx` | 402 lines |
| O1 | 🟡 WARN | `builder/StyleInspector.tsx` | Inline OR chain for DEDICATED property dispatch (pre-refactor) |
| L1 | 🟡 WARN | `builder/ShadowEditor.tsx` | `ShadowPanel` exports 5 required props vs the 2-prop standard interface |
| I1/I2 | 🟡 WARN | `left-sidebar/navigator/TreeRow.tsx` | Props type has 33 fields |
| I1/I2 | 🟡 WARN | `left-sidebar/pages/PageItem.tsx` | Props type has 15 fields; `canDelete`, `onRename`, `onDelete` unused |
| I1/I2 | 🟡 WARN | `left-sidebar/navigator/ContextMenu.tsx` | 9 fields; `onStartRename` unused |

**Total at audit:** 2 BLOCKING · 9 WARN · 0 INFO

### Fixes applied (as part of Tier 2 audit cycle)

| Fix | What changed |
|-----|-------------|
| D1 BLOCKING | Created `lib/styleWriteHelper.ts` — single `writeStyleProperty()` export; removed duplicate write-path blocks from all 4 editor files |
| D1 false-positive | Renamed `uid()` → `newInstanceId()` in `left-sidebar/components/index.tsx` (instance ID generation, not style source) |
| S1 BLOCKING | Extracted `StateSelector` → `StyleStateSelector.tsx` (~65 lines); extracted `AddPropertyRow` + `parseNewValue` + `CSS_PROP_SUGGESTIONS` → `StyleAddProperty.tsx` (~130 lines); `StyleInspector.tsx` reduced from 790 → 612 lines |
| O1 WARN (P26) | Replaced inline OR chain with `const DEDICATED = new Set([...])` dispatch |

---

## Tier 2 Audit — Phases 23–30 (current tier)

**Audit run date:** 2026-07-06
**Version at audit:** v8.18.0 (post-fix)
**Files scanned:** 85

### Results

| Check | Severity | Count | Status |
|-------|----------|-------|--------|
| S1 — File too large (BLOCKING >700) | 🔴 | 0 | ✅ Fixed |
| S1 — File too large (WARN >400) | 🟡 | 4 | Open |
| S2 — Mixed write-path + UI | 🟡 | 0 | ✅ None |
| O1 — Inline OR chain | 🟡 | 0 | ✅ Fixed |
| O2 — StyleInspector panel count | ⚪ | 1 | Tracking |
| L1 — Inconsistent Panel interface | 🟡 | 1 | Open |
| I1 — Fat prop type | 🟡 | 5 | Open |
| I2 — Unused destructured props | 🟡 | 4 | Open |
| D1 — Duplicated write-path | 🔴 | 0 | ✅ Fixed |
| D2 — Supabase in builder/canvas | 🔴 | 0 | ✅ None |

**Total:** 0 BLOCKING · 14 WARN · 1 INFO — **Tier gate passes.**

### Remaining WARNs (to file as phases in Tier 3 roadmap)

| Check | File | Fix |
|-------|------|-----|
| S1 | `app/builder/[projectId]/page.tsx` (555 lines) | Extract canvas workspace, keyboard handler, sidebar state into separate hooks |
| S1 | `builder/ShadowEditor.tsx` (402 lines) | Barely over threshold — low priority |
| S1 | `builder/StyleInspector.tsx` (612 lines) | Further extract `StyleValueEditor` + `EditablePropRow` + `StyleSection` |
| S1 | `builder/TransitionEditor.tsx` (461 lines) | Extract `TransitionLayerRow` and `AnimationLayerRow` to separate files |
| L1 | `builder/ShadowEditor.tsx` | `ShadowPanel` needs `label`, `cssProperty`, `type` extra props — unify to standard `PanelProps` or make a thin wrapper |
| I1/I2 | `left-sidebar/navigator/TreeRow.tsx` | 33-field prop type — split into `TreeRowData` + `TreeRowCallbacks` |
| I1/I2 | `left-sidebar/pages/PageItem.tsx` | 15-field prop type — split display/action props |
| I1/I2 | `left-sidebar/navigator/ContextMenu.tsx` | 9 fields, `onStartRename` unused — remove or wire up |
| I1/I2 | `left-sidebar/pages/FolderItem.tsx` | 8 fields, `onToggle`/`onRename`/`onDelete` unused |
| I1/I2 | `left-sidebar/components/ComponentItem.tsx` | 7 fields, `label` unused |
| O2 | `builder/StyleInspector.tsx` | Panel self-registration (Phase 27+ registry) |

---

---

## Full-Project Audit — All Non-WS Packages (v8.18.2)

**Audit run date:** 2026-07-06
**Version at audit:** v8.18.2
**Files scanned:** 396 (across 9 packages)
**Packages:** nova-builder, studio, ai, deploy, editor, git, registry, renderer, schema

### Results

| Check | Severity | Nova-builder | Legacy/studio | Packages |
|-------|----------|-------------|----------------|----------|
| S1 — File too large (BLOCKING >700) | 🔴 | 0 | 0 (legacy-exempt) | 0 |
| S1 — File too large (WARN >400) | 🟡 | 4 | 8 (legacy) | 2 |
| S2 — Mixed write-path + UI | 🟡 | 0 | 0 | 0 |
| O1 — Inline OR chain | 🟡 | 0 | 0 | 0 |
| O2 — StyleInspector panel count | ⚪ | 1 | 0 | 0 |
| L1 — Inconsistent Panel interface | 🟡 | 1 | 0 | 0 |
| I1 — Fat prop type | 🟡 | 5 | 0 | 0 |
| I2 — Unused destructured props | 🟡 | 4 | 2 | 15 |
| D1 — Duplicated write-path | 🔴 | 0 | 0 | 0 |
| D2 — Supabase in builder/canvas | 🔴 | 0 | 0 | 0 |

**Total:** 0 BLOCKING · 41 WARN · 1 INFO — **Full-project gate passes.**

### Notable findings by package

**`apps/studio/` (legacy)** — 8 S1 WARNs; all capped, never to be fixed; sunset with migration.
- `LeftPanel.tsx` — 2112 lines (largest file in project, Craft-era monolith)
- `StylePanel.tsx` — 1595 lines (14-section Tailwind Craft panel)
- Both carry `// @legacy` deprecation marker; will be deleted when nova-builder reaches parity

**`packages/registry/` (legacy)** — 15 I2 WARNs; Craft block components receive props via Craft resolver that they don't directly use (e.g. `_novaEditing`, `classOverrides`). Craft convention, not a real ISP violation.

**`packages/schema/migrations/runner.ts`** — 519 lines; migration runner is a single-concern file that grows with each migration version. Acceptable for a migration runner — schema migrations are not UI and have no reactivity concerns.

**`packages/ai/`, `packages/deploy/`, `packages/git/`** — 0 violations. All clean.

---

## How to run

```bash
# From repo root:
pnpm solid:audit

# Exit codes:
# 0 = no BLOCKING violations (Warnings OK, tier gate passes)
# 1 = BLOCKING violations found (fix before next tier)
```

---

## Audit decision log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-07-06 | S1 BLOCKING threshold = 700 lines (not 400) | Setting at 400 would flag legitimately complex single-responsibility editor files like `TransitionEditor.tsx` (501 lines) that have one reason to change but require many UI sub-components |
| 2026-07-06 | D1 BLOCKING at ≥4 duplicate files (not ≥2) | Two files sharing a small helper is acceptable; ≥4 copies indicates a systemic DRY failure |
| 2026-07-06 | `@typescript-eslint/no-explicit-any` disabled in ESLint | Intentional: atom Map casts (`Map<string, unknown>` → `Map<string, Src>`) require `any`; the TypeScript compiler handles type safety, not ESLint |
| 2026-07-06 | Left-sidebar I1/I2 WARNs deferred | Navigator/Pages components are event-callback-heavy by nature; refactoring them mid-tier would add churn without user-visible benefit |
| 2026-07-06 | Legacy packages capped at WARN for S1 (not BLOCKING) | `apps/studio/`, `packages/editor/`, `packages/registry/`, `packages/renderer/`, `packages/schema/` are marked `// @legacy` and will be deleted when nova-builder reaches feature parity; fixing their size violations would add churn to deprecated code with no user-visible value |
| 2026-07-06 | `packages/registry/` I2 WARNs accepted as false positives | Craft block components receive props via Craft resolver convention (`_novaEditing`, `classOverrides`) that are framework-injected, not ISP violations; fixing them would break Craft's resolver contract in the legacy app |
| 2026-07-06 | CI test OOM fixed with `--concurrency=1` + 4 GB heap | All test packages (editor, renderer, deploy, git, ai) starting in parallel OOM-crashed the Node.js process (Zone Allocation failed). Sequential execution eliminates the crash; `NODE_OPTIONS=--max-old-space-size=4096` provides headroom for each Vitest worker |
