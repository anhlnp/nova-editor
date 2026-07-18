---
name: feedback-working-style
description: How to collaborate — what to avoid, what to do, tested patterns
metadata:
  type: feedback
---

**Docs are part of the deliverable — and follow the v2.0 doc model (set 2026-06-15).** The per-version PRDs are ARCHIVED in `doc/archive/`. The canonical living docs are:
- `doc/SPEC.md` — current product behavior (single source of truth)
- `doc/ADR.md` — architecture decision log (consolidated)
- `doc/COMPONENTS.md` — per-component/package reference tables
- `doc/VERIFIED.md` — feature ledger

**Verified-gate (critical):** a feature is described as *working* in SPEC only after it has a ✅ row in `VERIFIED.md`, which requires automated tests/typecheck green **AND** a manual browser QA pass. Code-traced-but-unclicked features stay 🟡. Don't claim something works without this.

**Model tiering:** major (xN.0, breaking) → Opus · minor (additive) → Sonnet · patch (fix) → Haiku.

**Archive, don't delete** superseded docs (user preference when unsure).

**How to apply:** after any significant change, update SPEC/ADR/COMPONENTS + add/flip the VERIFIED row + update memory, in the same turn.

---

**Workflow for an "update idea" request (semver-driven, set 2026-06-16).**

How the USER frames a request (ideal): *what outcome + why*; the exact error/terminal output if it's a bug (ground truth); optionally the intended bump (fix/feature/breaking) — else the agent classifies.

What the AGENT does, in order:
1. **Classify** the change → bump → model (see `doc/SPEC.md` §11 table): Patch→Haiku, Minor→Sonnet, Major→Opus. Risk/scope, not line count. Unsure → size up.
2. **Read before touching code** (don't work from memory):
   - Always: `doc/SPEC.md` (current behavior) + the relevant `doc/COMPONENTS.md` row + `memory/project_nova_technical_debts.md` (don't re-break a known debt).
   - Block work → `doc/architecture-blocks.md`. AI/credits → `doc/architecture-ai.md` + `doc/pricing-policy.md`. Styling → ADR-022/023/025/028 in `doc/ADR.md`. DB/setup → `doc/setup/`. Decisions → `doc/ADR.md`.
   - The named source of truth, never a doc's copy: schema/migrations (`packages/schema`, `supabase/migrations/*.sql`), credit numbers (`PROVIDER_CREDIT_COST`, `reset_monthly_credits`), tiers (`lib/tiers.ts`).
3. **Implement + test** (add regression tests for the fix, not just rely on green).
4. **Close the loop:** update SPEC/ADR/COMPONENTS, add/flip the `doc/VERIFIED.md` row (🟡 until manual browser QA), note any new debt as a TD.

Prompt template the user can reuse:
> "[fix|feature|breaking] <outcome>. Repro/why: <…>. (Read the relevant doc first; classify the bump; add a test; update VERIFIED.)"

---

**Don't add unasked-for abstractions, comments, or cleanup.** If fixing a bug, don't refactor the surrounding code.

**Why:** "Don't add features, refactor, or introduce abstractions beyond what the task requires."

---

**Terse responses are preferred.** 1–2 sentence summary after completing a task. Don't recap every file touched.

---

**Bug reports from user always include the exact error message or terminal output.** Use that output as ground truth. Read the relevant files before proposing a fix.

**Why:** Prevents fixing the wrong cause (happened with ROOT deserialization crash and resolver reference crash).

---

**Always add explicit `Record<string, T>` type when exporting an object that will be indexed by `string`.** TypeScript's `exactOptionalPropertyTypes` + no-implicit-any catches these in CI even when local tsc doesn't.

**Why:** Multiple CI failures from TS7053 (implicit any on index expressions). The `editorResolver` export was the most recent example.

**How to apply:** `export const foo: Record<string, SomeType> = { ...spread, extra: castIfNeeded }` — always annotate, never let TS infer a non-indexable object type for exported maps.

---

**After finishing every version, hand off the next one (set 2026-06-17).** When a version's work is done, end the turn by giving the user (a) a short status/info recap of what shipped + its bump/model, and (b) a ready-to-paste **prompt for the next version** (following the semver-driven prompt template above, naming the concrete scope from `doc/ROADMAP.md` forward roadmap).

**Why:** the user runs versions back-to-back and wants a frictionless baton pass; they explicitly asked for "info + prompt for the next version" each time a version completes.

---

**Memory files belong at `C:\Users\Administrator\.claude\projects\c--Users-Administrator-Downloads-Github-Clone-nova-nocode-editor\memory\` (the Claude memory path), NOT in the repo directory.** Previous sessions accidentally wrote to the repo. Both locations are now kept in sync, but the canonical path is the Claude one.

---

**Mandatory 6-step process for every nova-builder phase (added 2026-07-05, codified in `CLAUDE.md`).** User explicitly requested this after the 75-phase roadmap was established; always follow in order:

1. **CLASSIFY** — state the bump (Patch/Minor/Major) and model (Haiku/Sonnet/Opus) at the start; do not skip
2. **READ** — read `doc/SPEC.md`, `doc/CHANGELOG.md`, `doc/VERIFIED.md`, `doc/ADR.md`, every file being modified, and the reference implementation in `reference/webstudio/` before writing a single line
3. **IMPLEMENT** — write the code
4. **BUILD TEST** — `pnpm --filter @nova/builder build` must be 0 errors; never document a broken build
5. **UPDATE DOCS** — `doc/CHANGELOG.md` (new version entry), `doc/VERIFIED.md` (new 🟡 rows), `doc/SPEC.md` (feature listed), `doc/ADR.md` if architectural decision
6. **BUMP VERSION** — update `apps/nova-builder/package.json`

**Why:** Without this rule, phases were implemented without reading existing files, docs were not updated, and versions were not bumped. Explicitly required by the user.

**Tier-per-chat cadence:** 75 phases organized into 10 tiers. Each chat session handles one tier (~5–10 phases). Start each chat: "Start Tier N — Phases X–Y". QA gate: never start next tier until current tier's 🟡 rows are flipped to ✅ by a human browser click-through.

**Read before porting from Webstudio:** Always read the exact file in `reference/webstudio/apps/builder/app/builder/features/[name]/` before porting. Never port from memory.
