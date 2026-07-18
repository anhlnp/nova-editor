# Nova No-Code Editor — Memory Index

## Canonical docs (in repo `doc/` — source of truth as of v2.0 doc reset, 2026-06-15)
- `doc/SPEC.md` — current product behavior (THE spec; per-version PRDs archived to `doc/archive/`)
- `doc/ADR.md` — architecture decision log (ADR-001→026 + v2.0 proposals 027-029)
- `doc/COMPONENTS.md` — per-component/package reference tables
- `doc/VERIFIED.md` — feature ledger (✅ verified / 🟡 needs manual QA / 🔴 broken)
> Memory below = working context + debt; defer to the docs above for current truth.

- [User Profile](user_profile.md) — role, preferences, Vietnamese, UX philosophy
- [Feedback: Working Style](feedback_working_style.md) — how to collaborate; v2.0 doc model + verified-gate + model tiering
- [Project: Nova Overview](project_nova_overview.md) — repo location, stack, pointers to canonical docs
- [Project: Technical Debts](project_nova_technical_debts.md) — live debt / TD list (TD-013…022)
- [Project: Design-Mode Initiative](project_nova_design_mode.md) — Figma/Unity/v0 parity; Document Model (MODEL.md) + I1–I10 invariants; phased A–F plan; Phase B done; Phase C (direct-manipulation) IN PROGRESS — v5.9.0 (auto-layout sizing, layoutModel.ts) + v5.10.0 (resize/nudge, resizeMath.ts) + v5.11.0 (snapping/guides/measure, snapGuides.ts) + v5.12.0 (marquee, marquee.ts) + v5.13.0 (command palette ⌘K) + v5.14.0 (per-position DnD, dropTarget.ts) + v5.15.0 (inspector clarity, styleSummary.ts) + v5.16.0 (align/distribute, alignDistribute.ts) + v5.17.0 (gated free-position, freePosition.ts) + v5.18.0 (Tidy Layout, autoArrange.ts) + v5.19.0 (Group/Ungroup first-class — document-order, sibling-only, ⌘G/⌘⇧G + ⌘K) + v5.20.0 (keymap single source of truth — keymap.ts, derived labels, integrity guards, "?" KeyboardHelp) + v5.21.0 (inspector direct numeric editing — numericField.ts + NumericInput) done; **Phase C LOGIC COMPLETE** (runtime 🟡 pending browser QA). **Phase D OPEN:** v6.0.0 (Major, schema **4.0**) Components/Symbols MODEL done — ComponentMaster/OverrideMap/Instance + components[] + 3.0→4.0 migration; pure resolveInstance/detachInstance (overrides keyed by stable element id), I10-tested. v6.1.0 (Major) renderer+commands done — model relocated to @studio/schema; export consumes resolveInstancesInTree (I8); cmdCreateComponentFromSelection (preserves stable ids) / cmdInstantiate / cmdDetachInstance; ⌘K Create/Detach 🟡; remaining 🟡 = canvas Instance rendering + LeftPanel instantiate + inspector indicator; then v6.2 override editing

- [Project: Strategic Pivot](project_nova_strategic_pivot.md) — verified-depth over breadth; demo-first/local-first front door; webstudio-parity audit framing (2026-06-26)
- [Project: Editor Redesign](project_nova_editor_redesign.md) — webstudio editor-parity first (segmented Settings/Style, left icon-rail, modes), Nova gizmos as ceiling; defer CMS; full plan in doc/redesign-webstudio-parity.md (2026-06-26)
- [Project: Gate 0 Findings](project_nova_gate0_findings.md) — first browser audit (2026-06-27): Phase F deserialize-per-edit = lag+broken-edits root cause (ADR-042 Risk#3); Gate 0 FAILED; MVP reprioritize → single AI-prompt demo flow + perf P0 + theme/contrast
- **CURRENT FOCUS → [MVP Demo Plan](../doc/mvp-demo-plan.md)** (doc/mvp-demo-plan.md, 2026-06-29) — supersedes G1–G12 parity as active plan. North star = ONE flow: prompt→AI compose-from-registry→edit(no-login)→publish(gated, no GitHub). USP recommend **U1 "AI builder, no lock-in"** (validate w/ users). Priority: P0 perf-fix(ADR-043?) → P1 AI-compose → P2 theme/contrast → P3 Track-A no-login → P4 transparency → P5 vision artifact. Commercial stack: doc/commercial-flow-alternatives.md
  - **DONE (logic, 🟡 browser QA), 2026-06-27:** P0 perf (ADR-043 targeted projection + K3 scoped-sub + page-switch selection clear); **P1 AI-compose** (compose.prompt/composerAgent/validateComposition + AI_COMPONENT_NAMES + POST /api/ai/generate + AIComposePrompt UI on empty canvas w/ coverage transparency). Next un-started: P2 theme/contrast, P3 no-login Track-A, P4 transparency-wide, P5 vision. See [[project-nova-gate0-findings]].

> Historical status/plan memories (v1.0–v1.4) were removed 2026-06-15 — superseded by `doc/SPEC.md` + `doc/VERIFIED.md` and `doc/archive/prd*.md`. UX detail lives in `doc/ux-design.md`.
