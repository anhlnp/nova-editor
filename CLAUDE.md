# Nova Builder — Claude Code Process Rules

These rules apply to EVERY phase of development. They are non-negotiable and must be followed in order for every implementation session.

---

## Mandatory 6-step process per phase

### Step 1 — CLASSIFY (before any code)

Determine the version bump and model:

| Change type | Bump | semver digit | Model to use |
|-------------|------|-------------|--------------|
| Patch: label/text/color/minor UI tweak | Patch | `X.Y.Z+1` | Haiku |
| Minor: new feature, new panel, new API route | Minor | `X.Y+1.0` | Sonnet |
| Major: breaking schema change, architecture change | Major | `X+1.0.0` | Opus |

State the bump and model at the start of every phase. Do not skip this.

**Important:** phase number is NOT the version number. A Minor phase bumps the middle digit only. A Phase 25 that is Minor on a v8.10.0 codebase produces v8.11.0, not v25.0.0.

### Step 2 — READ (before any code)

Read ALL of the following before writing a single line:

1. `doc/SPEC.md` — current system state, what's already built
2. `doc/CHANGELOG.md` — what's been done, version history
3. `doc/VERIFIED.md` — what has passed QA vs what is 🟡
4. `doc/ADR.md` — architectural decisions that constrain the implementation
5. **Every file you will modify** — read it fully before editing
6. **The reference implementation** — if porting from Webstudio, read the exact file in `reference/webstudio/apps/builder/app/builder/features/[name]/` before starting

Never code from memory of what a file "probably" contains. Always read first.

### Step 3 — IMPLEMENT

Write the code. Follow these sub-rules:

- No comments unless the WHY is non-obvious
- No error handling for impossible cases
- No extra abstractions beyond what the task requires
- TypeScript must compile — run `pnpm --filter @nova/builder tsc --noEmit` when uncertain
- The `/canvas` route must always remain public (no auth redirect) — ADR-NB-003
- Apply the **SOLID principles** (see section below) — they are the default coding standard

### Step 4 — BUILD & CI QUALITY GATE

Run ALL of these local checks after every phase, in order. Zero tolerance for errors — every one must pass before Step 5, and before any `git push`:

```bash
# 1. Type safety
pnpm --filter @nova/builder typecheck
# 2. Lint
pnpm --filter @nova/builder lint
# 3. Unit tests (all packages)
pnpm test
# 4. SOLID audit (0 blocking required)
pnpm solid:audit
# 5. Next.js production build
pnpm --filter @nova/builder build
# 6. Cloudflare/OpenNext deploy bundle — MUST pass or the Workers Build fails on push
pnpm --filter @nova/builder build:cf
```

**Why step 6 is mandatory:** `next build` (step 5) and the Cloudflare **Workers Build** (`build:cf` = `opennextjs-cloudflare build`) are different bundlers. `next build` can pass while the Workers Build fails — this is exactly what silently breaks production deploys after a green-CI push. The GitHub Actions CI (`ci.yml`: Lint / Test / Type Check) does NOT run `build:cf`, so the ONLY place this is caught before the Cloudflare Dashboard build is your local step 6. Always run it before pushing.

Known deploy traps that pass `next build` but fail `build:cf`:
- `export const runtime = "edge"` on any route/page → *"cannot use the edge runtime. OpenNext requires edge runtime function to be defined in a separate function."* Fix: remove the edge runtime declaration (the whole Worker already runs on the Workers runtime).
- Node-only APIs at module top level in a route that OpenNext can't polyfill.
- Missing `nodejs_compat` compatibility flag in `wrangler.toml` for a dependency that needs it.

Deploy trap that passes `build:cf` (and a green deploy) but breaks the LIVE app — validate with `wrangler deploy --dry-run`:
- `wrangler.toml` must use `[assets] directory = ".open-next/assets", binding = "ASSETS"` (NOT the legacy `[site] bucket = ...`). OpenNext 1.x serves `/_next/static/*` and images via `env.ASSETS.fetch(...)`; with `[site]` there is no `env.ASSETS` binding → static JS chunks 404 → the client never hydrates → the deployed app renders but nothing is interactive (this passes e2e because dev serves assets fine). `wrangler deploy --dry-run` should list `env.ASSETS (Assets)` and "Read N files from the assets directory".
- Build-time `NEXT_PUBLIC_*` vars and server secrets must be configured in the Cloudflare Workers Build env + Worker secrets — `.env.local` is gitignored and never reaches Cloudflare, so a green build can still ship a bundle with `undefined` public envs.

#### Session batching & e2e scoping (Tier P onward — 2026-07-13)

- **Batching:** consecutive **Patch/Minor** phases are implemented together in ONE session/prompt (e.g. "M0 + MV1 + MV2"); every **Major** phase gets its OWN session. Within a batch: implement phase-by-phase, bump semver sequentially per phase, but run the six-gate check **once at the end of the batch** (not per phase). Docs (Step 5) are updated once at the end with one CHANGELOG entry per version.
- **E2E is NOT part of the six-gate check.** Run only the e2e specs that cover the area being changed (`npx playwright test e2e/<relevant>.spec.ts`), plus any NEW spec added by the phase. The FULL `pnpm test:e2e` suite runs only at tier gates / before a production push, not per phase — it is slow and its coverage is still incomplete (e.g. no Google-OAuth login spec), so a full green run neither proves the phase nor is required by it.
- **Local Quality Gate First**: All six checks above (typecheck, lint, test, SOLID, `build`, **`build:cf`**) MUST pass 100% locally before pushing code to `main` that triggers a production deployment. A push is only allowed when a green `build:cf` has been produced from the exact tree being pushed.
- **Cloudflare Workers Builds (`Workers Builds: nova-editor`)**: Cloudflare Dashboard is the designated engine for bundling and *deploying* production Workers. Do NOT duplicate the Cloudflare *deploy* inside GitHub Actions (`deploy-cloudflare.yml`) or redundant CI build jobs. Running `build:cf` locally is a **validation** of the bundle (it does not deploy), and is required — it is not a duplicate deploy.
- If any of the six checks fails locally, fix it immediately before moving to Step 5. Do not push or document a broken build. After a push, if the `Workers Builds: nova-editor` check still fails, reproduce it locally with `pnpm --filter @nova/builder build:cf`, fix the root cause, and re-push — never leave `main` with a failing Workers Build.

### Step 5 — UPDATE DOCS (after every phase, without exception)

Update ALL of these after every implemented phase:

**`doc/CHANGELOG.md`** — add a new version entry:
```markdown
## [X.Y.Z] — YYYY-MM-DD

### Phase N — Feature name (Minor/Sonnet)
- NX — description of what was built
```

**`doc/VERIFIED.md`** — add new rows for every testable behavior, marked 🟡:
```
| NX | [Feature description] | 🟡 |
```

**`doc/SPEC.md`** — update the deferred/upcoming table; move the feature from "upcoming" to the relevant section if it changed the system description

**`doc/ADR.md`** — add a new ADR-NB entry if an architectural decision was made during implementation

### Step 6 — BUMP VERSION

Update the version in `apps/nova-builder/package.json` using strict semver from the **previous version**:

| Bump type | Rule | Example (from v8.10.0) |
|-----------|------|------------------------|
| Patch | increment Z, keep X.Y | v8.10.0 → v8.10.1 |
| Minor | increment Y, reset Z to 0 | v8.10.0 → v8.11.0 |
| Major | increment X, reset Y.Z to 0 | v8.10.0 → v9.0.0 |

Read `package.json` first to get the actual previous version. Do NOT use the phase number as the version.

### Step 7 — OUTPUT NEXT PHASE PROMPT

After bumping the version, output this block verbatim at the end of your response so the user can paste it as the opening message of the next chat or phase. Look up the next phase name from `doc/ROADMAP.md` (using the ROADMAP phase table, skipping any phases already implemented).

```
---
▶ NEXT PHASE PROMPT — copy and paste this to continue:

Start Phase [N+1] — [Name from ROADMAP.md]

Current version: v[X.Y.Z] (Phase [N] complete, all 🟡).
Follow the 6-step process: CLASSIFY → READ → IMPLEMENT → BUILD → DOCS → BUMP → NEXT PROMPT.
---
```

This step is mandatory. Never omit it. It prevents the user from having to reconstruct context manually between phases.

---

## SOLID principles (default coding standard)

These apply to every file written in this codebase — nova-builder, packages/ai, and any shared package.

### S — Single Responsibility
Each module, component, or function has exactly **one reason to change**.

- One CSS editor file = one property group (`ShadowEditor`, `TransformEditor`, `FilterEditor` — not a combined file)
- One React component = one UI job (panel header, layer row, value input — each separate)
- If you find yourself writing "and" to describe what a function does, split it

### O — Open / Closed
New behavior is added by **extension** (new files, new entries in a set), not by editing existing working code.

- Adding a new CSS property editor means: new file + add to `DEDICATED` Set in `StyleInspector` + render the panel — no changes to any existing editor
- Adding a new filter function means: add to `FN_CFG` map — no changes to the parsing or rendering logic
- Prefer data-driven dispatch (maps/sets) over `if/else if` chains that grow with every feature

### L — Liskov Substitution
Components and functions that share an interface must be **freely interchangeable**.

- All panel components share `{ instanceId: string; currentCss: string }` — any panel can slot into StyleInspector's render list without special-casing
- The `writeProperty` helper works identically for any CSS property — callers don't need to know which property is being written

### I — Interface Segregation
Keep interfaces **small and focused**. Never force a component to depend on props it does not use.

- `PanelProps = { instanceId, currentCss }` — panels don't receive the full `StyleDecl` or atom reference; they only get the data they render
- If a new editor needs a third prop, add it to that editor only — do not add it to the shared interface
- Prefer many small, named prop types over a single catch-all `props: Record<string, unknown>`

### D — Dependency Inversion
Depend on **abstractions** (atoms, interfaces, helper functions), not on concrete infrastructure.

- Editor components write via `writeProperty(instanceId, property, value)` — they never reach into `$styles` directly or call the Supabase client
- Builder components read from nanostores atoms — they never call REST API routes directly
- The write-path abstraction (`captureSnapshot` → fan-out to `$multiSelectedInstanceIds` → mutate atoms) is defined once and reused — callers don't know the implementation details

### Practical checklist per file

Before marking a phase complete, verify each new file:

| Check | Rule |
|-------|------|
| Does this file have one reason to change? | S |
| Can I add the next related feature without editing this file? | O |
| Does every exported component/function honor the same interface contract as peers? | L |
| Are all props used by the component that receives them? | I |
| Does the component talk only to atoms/helpers, never to raw APIs? | D |

---

## QA gate rule

🟡 rows in VERIFIED.md are NOT done. They are code-complete only.

**A feature is "done" only when a human has clicked through it in a browser and flipped the row to ✅.**

Do not start the next tier until QA is completed for the current tier's rows.

The QA checklist is: `doc/qa-nova-builder.md`

---

## SOLID audit gate (after each tier)

After every tier completes (all phases implemented, all 🟡 QA'd to ✅), run:

```
pnpm solid:audit
```

The audit script (`scripts/solid-audit.mjs`) scans `apps/nova-builder/src/` and reports:

| Check | Principle | Threshold |
|-------|-----------|-----------|
| S1 — File too large | Single Responsibility | > 400 lines → WARN, > 700 → BLOCKING |
| S2 — Write-path mixed with UI | Single Responsibility | captureSnapshot + many UI sub-functions in same file |
| O1 — Inline OR dispatch chain | Open / Closed | prop === "x" \|\| prop === "y" inline |
| O2 — StyleInspector panel count | Open / Closed | INFO — tracks how many panels force a reopen |
| L1 — Inconsistent Panel interface | Liskov | Panels with > 2 required props |
| I1 — Fat prop type | Interface Segregation | > 5 fields in a Props type |
| I2 — Unused destructured props | Interface Segregation | Props destructured but body never references them |
| D1 — Duplicated write-path | Dependency Inversion | `uid` / `ensureSrc` / `writeProperty` in ≥ 2 files → BLOCKING at ≥ 4 |
| D2 — Supabase in builder component | Dependency Inversion | BLOCKING — infra import in UI layer |

**Rules:**
- 🔴 BLOCKING violations **must be fixed before the tier gate is passed** (same as a failing build)
- 🟡 WARN violations must be filed as a phase in the next tier's ROADMAP
- ⚪ INFO violations are tracked for awareness

Add a section to `doc/VERIFIED.md` after each tier audit:
```
## SOLID Audit — Tier N (vX.Y.Z)
| Check | Severity | File | Fix scheduled |
```

---

## Tier-per-chat rule

Development is organized in tiers (see `doc/ROADMAP.md`). Each chat session implements one tier:

| Tier | Phases | Milestone |
|------|--------|-----------|
| Tier 1 | P13–22 | MVP launch gate |
| Tier 2 | P23–30 | Professional style controls |
| Tier 3 | P31–36 | Content & structure |
| Tier 4 | P37–43 | Publishing & delivery |
| Tier 5 | P44–50 | AI differentiation |
| Tier 6 | P51–57 | Collaboration |
| Tier 7 | P58–62 | Advanced developer features |
| Tier 8 | P63–67 | Analytics, SEO & growth |
| Tier 9 | P68–73 | Billing & admin |
| Tier 10 | P74–75 | Polish & sunset |

**Start a new chat for each tier.** Open with: "Start Tier N — Phases X–Y" and I will follow the 6-step process for each phase in sequence.

---

## Architectural invariants (from ADR.md)

- **ADR-NB-001:** WebstudioData schema (normalized Maps, schemaVersion "5.0+") — never use Element[]
- **ADR-NB-003:** `/canvas` route is public — no auth redirect, no session cookie, data via `__webstudioSharedSyncEmitter__` only
- **ADR-NB-005:** AI credits deducted ONLY after `validateCompositionWS` passes — never on failure
- **ADR-NB-006:** Undo/redo snapshots target full atom set — not just instances
- **ADR-NB-007:** `packages/ws-*` are the internal copies of Webstudio packages — never import from `reference/` directly in app code

---

## Key file locations

| What | Where |
|------|-------|
| Builder entry | `apps/nova-builder/src/app/builder/[projectId]/page.tsx` |
| Canvas entry | `apps/nova-builder/src/canvas/canvas.tsx` |
| All nanostores atoms | `apps/nova-builder/src/lib/nano-states.ts` + `lib/data-stores.ts` |
| History (undo/redo) | `apps/nova-builder/src/lib/history.ts` |
| StyleInspector | `apps/nova-builder/src/builder/StyleInspector.tsx` |
| Left sidebar | `apps/nova-builder/src/builder/left-sidebar/` |
| AI panel | `apps/nova-builder/src/builder/AIPanel.tsx` |
| Webstudio features reference | `reference/webstudio/apps/builder/app/builder/features/` |
| Active roadmap | `doc/ROADMAP.md` |
| QA checklist | `doc/qa-nova-builder.md` |
