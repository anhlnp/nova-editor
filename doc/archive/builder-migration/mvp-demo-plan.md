# Nova — MVP Demo Plan (fundraising)

> **Source of truth for the demo direction**, ratified after the startup review (2026-06-29). Supersedes
> the broad editor-parity sequence ([redesign-webstudio-parity.md](redesign-webstudio-parity.md) G1–G12)
> as the *current focus* — parity work is deferred behind the demo (only perf, which blocks the demo, is
> pulled forward). Commercial-stack options: [commercial-flow-alternatives.md](commercial-flow-alternatives.md).
> Gate-0 findings (the perf root cause): [VERIFIED.md](VERIFIED.md) + memory.

## North Star

> **One flawless end-to-end flow that shows the vision** — *prompt → AI builds → refine (no login) →
> publish (gated)* — smooth even where parts are mock, and honest about every limit.

Advisor's bar (29/06): (1) one complete user flow, mock-where-needed but smooth; (2) full product
vision; (3) transparency about what's missing + roadmap. *"If you have it all, go commercial; if not, at
least show the vision."*

---

## USP (proposed — validate with user research, feedback #3)

Edit is **not** a USP (advisor #1). Nova's real structural assets: **clean Next.js/Tailwind code you own
(I8 export parity) · a structured Document model + visual editor · AI that composes from a *registered*
block/style vocabulary · a no-login start.** The differentiator is the *combination*, aimed at the gap
between AI code-gen (v0/Lovable — code, weak visual editing) and no-code builders (Wix/Framer — visual,
but locked in) and webstudio (ownership + visual, but **not AI-first**).

| # | USP statement | Target | Differentiates vs |
|---|---|---|---|
| **★ U1 (recommended)** | **"The AI website builder with no lock-in — start from a prompt, no signup; refine visually; own the real Next.js/Tailwind code whenever you want."** | both: non-tech (Track A) + dev/agency (Track B) | Wix/Ladipage (locked) · v0 (no real editor) · webstudio (not AI-first) |
| U2 | **"AI that serves your idea, not its templates"** — composes from a curated system, tells you exactly what it can/can't do | SMB/marketers burned by template lock-in | template builders; black-box AI |
| U3 | **"Prompt → production Next.js in minutes — the code is yours"** | developers/agencies | walled-garden builders |

**Recommendation: U1.** It turns the two real weaknesses raised (GitHub friction; AI imposing
templates) into the *story* (no lock-in; AI serves intent), and the two-track model
([commercial-flow-alternatives.md](commercial-flow-alternatives.md)) literally delivers it.
**Caveat (advisor #3):** positioning must be validated with real users — do a quick user-journey
study before locking copy. The USP is the user's + advisor's final call; this is the proposal.

---

## The one flow (what the demo does)

```
Landing (clear USP + "Describe your website…")        ◀── INPUT, no login
   └─▶ AI composes from REGISTERED blocks/styles
         with a transparency note: "used Hero/Features/Pricing ✓ · CMS ⏳ not yet"
         └─▶ Editor opens (no login, local IndexedDB) — refine visually   ◀── "edit like the craft.js demo site"
               └─▶ Preview link  name.nova.app                            ◀── shareable
                     └─▶ Publish / Save  🔒 login (email/Google/guest-upgrade — NOT GitHub)  ◀── OUTPUT
                           └─▶ (Track B, opt-in) Eject: ZIP / your GitHub / your Vercel       ◀── own your code
```

AI behavior (fixes advisor #2): **AI never invents templates — it arranges nova's registered blocks +
bounded Tailwind to match the described intent, and states coverage explicitly.** "Universal minimum":
the user feels heard, is steered to supported styles, and told clearly when something isn't supported.

---

## Scope

**In (must be real & smooth):** prompt input · AI compose-from-registry · editor refine (no login) ·
theme/contrast that looks good · preview link · transparency badges.
**Gated behind login (email/Google/guest — no GitHub):** publish to a managed `*.nova.app` · save to
cloud.
**Mock-but-honest (UI + "demo/coming" badge):** custom domain · CMS/data · team/accounts · commercial
billing flow.
**Out for the demo:** editor-parity G1–G12 (except perf), multiplayer, Components/Symbols polish,
Figma-grade gizmos.

---

## Priority stack (replaces G1–G12 as the active plan)

| P | Work | Why (feedback) | Real/mock | Done when |
|---|---|---|---|---|
| **P0** | **Fix editor perf** — deserialize-per-edit (Gate-0 root cause): scope deserialize to affected subtree, or in-place Craft update for discrete edits + commit-on-pointer-up (candidate **ADR-043**; partial walk-back of Phase F's full re-deserialize, keeping Document authority) | demo can't be smooth while laggy; Gate-0 ❌; ADR-042 Risk #3 | real | edit hero/large page with no lag; K3/K6 pass |
| **P1** | **AI compose-from-prompt** — LLM emits a Document from the registered block catalog + bounded Tailwind; transparency note of coverage | advisor #2 (AI serves intent, not templates) + the demo's heart + USP | real (nova has AI+registry; add initial-generation) | a prompt produces a sensible, editable page; unsupported asks are stated, not faked |
| ↳ P1 status | **◐ logic done (🟡 browser QA)** 2026-06-27: `compose.prompt.ts` + `composerAgent` (mirrors patcher, 3-retry, reuses extractJsonPatch) + **pure `validateComposition`** (drops hallucinated types→`droppedTypes`, mints fresh `node_<8>` ids, schema-guards; 6 tests) + `AI_COMPONENT_NAMES` (registry vocabulary) + `POST /api/ai/generate` (reuses auth/credits/rate-limit; no charge on empty result) + `AIComposePrompt` UI on the empty canvas (describe→generate→loads via applyExternalSchema; **coverage banner** "Built with … / Not yet supported …"). Typecheck 8/8, AI 86, app 284. | | |
| **P2** | **Theme/contrast, app-wide** (dark+light, accessible contrast) | "nhìn quá kém"; first impression | real | passes contrast check in both themes |
| **P3** | **No-login front door (Track A)** — guest editing (IndexedDB) + email/Google save; managed `*.nova.app` deploy via NOVA's Cloudflare (ADR-033); GitHub → opt-in Track B | GitHub friction; commercial flow | real (free tiers) | a stranger can prompt→edit→get a live link without GitHub |
| **P4** | **Transparency layer** — badges/notes on supported vs mock vs roadmap, everywhere | advisor #3, #4; demo honesty | real (UI) | every non-real part is labeled |
| **P5** | **Vision artifact** — short deck/mock of the full product (the parts not built) | advisor #6 "show the vision" | mock | a pitch-ready vision view |

**Order is also the dependency order:** P0 unblocks a usable editor; P1 is the centerpiece; P2/P3 make
it presentable + frictionless; P4/P5 make it pitch-ready.

---

## What we explicitly DON'T do now (and say so — transparency)

Editor-parity G1–G12 (Navigator depth, Assets panel, provenance, DnD never-error, Settings tag/id/class,
etc.), Components/Symbols, multiplayer, CMS/data binding. These live in the **vision** (P5) + roadmap,
shown but not built. This is the anti-overengineering fix (advisor #4): one flow perfect, the rest honest.

## The three fundraising assets (advisor #6)

1. **One smooth flow** = the In-scope path above (mock where needed, gated where login is required).
2. **Full vision** = P5 artifact + the roadmap (parity, CMS, collab, own-code eject).
3. **Transparency** = P4 badges + a one-page "where we are / what's missing / what's next."

## Open / next

- USP: validate U1 with a quick user-journey study before locking demo copy (advisor #3).
- P0 perf fix likely needs a short design note (**ADR-043**) — pick subtree-deserialize vs in-place +
  commit-on-pointer-up.
- Wire Track A with the lightest real stack: **guest + IndexedDB now**, add Supabase (email/Google +
  cloud snapshot) when a real save is needed — both free, no GitHub
  ([commercial-flow-alternatives.md](commercial-flow-alternatives.md)).
