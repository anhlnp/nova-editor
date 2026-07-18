---
name: project-nova-strategic-pivot
description: Strategic diagnosis (2026-06-26) — breadth-over-verified-depth problem; demo-first/local-first pivot; webstudio-parity audit framing
metadata:
  type: project
---

Strategic reflection asserted by user 2026-06-26, after asking me to read webstudio reference docs to prepare a nova-vs-webstudio audit.

**Diagnosis (mine, user agreed in framing):** Nova's mental model is sound — Document (`project.json`) is single authority, everything else (Craft live tree, DOM, export) is a projection; spine is invariants I1–I10 ([[project-nova-design-mode]], doc/MODEL.md). The problem is NOT architecture. It is the **verification gap**: nearly everything past v5 is "✅ logic complete / 🟡 runtime pending browser QA" because the dev env is typecheck-only (no browser/E2E harness, per ADR-035). Result: lots of half-features, each behind a 🟡, never assembled+verified into one working flow → "mỗi tính năng chỉ được một tí, demo thành flow thì không đủ cho commercial." Also: superseded ADRs (009/004/012) leave residue (CRAFT_READONLY, updateElements, withReplay) scattered = "kiến trúc lỗi thời chưa cập nhật."

**Pivot the user wants:**
1. **Demo-first / local-first front door.** GitHub auth currently gates editing → commercial users/devs reluctant to grant GitHub. But ADR-003 already keeps the draft in IndexedDB (local-first foundation EXISTS). The fix is positioning, not rearchitecture: enter editor with NO login, persist to IndexedDB; demote GitHub to an optional "Connect to publish" action that appears late.
2. **Depth-over-breadth audit.** Next chat: pick ONE minimal commercial flow (no-login → drag/drop → edit → preview, all local), turn every 🟡 on THAT flow green via real browser verification, freeze features off the flow. Mirror webstudio's posture (narrow but verified core, e2e + manual test-cases.md).

**Why:** webstudio competes by deep+verified core; nova has inverse (great docs/invariants, unverified breadth). User couldn't keep track of the evolution because logic-ship rate >> runtime-verify rate.

**Commercial-flow blueprint (2026-06-29, startup review): doc/commercial-flow-alternatives.md.** Core principle = **two tracks: Track A (default, non-technical/commercial) = managed cloud, free tier, email/Google/guest auth, NO GitHub ever; Track B (opt-in, devs) = eject/own-code, where GitHub lives by choice.** This is webstudio's model (free `*.wstd.io` subdomain + Cloudflare-edge managed deploy for the user; GitHub only under Self-Hosting/Export). Nova's commercial fix = "add managed Track A (Supabase auth+DB+storage OR stay local IndexedDB+guest; managed deploy via NOVA's Cloudflare account per ADR-033; free `*.nova.app` subdomain) and DEMOTE GitHub to opt-in Track B." Doc lists many free/no-GitHub alternatives per stage (auth/storage/sync/assets/preview/deploy/domain/forms/CMS/analytics/billing). Demo: wire Supabase OR fully-local+guest (zero signup), reuse CF deploy for a `*.nova.app` link, mock-but-honest the rest with "coming/demo" badges, gate only publish-to-custom-domain + save-to-your-GitHub behind login.

**How to apply:** When planning nova work, prefer turning existing 🟡 → ✅ on a single demo flow over adding new logic-complete-but-unverified features. Treat local-first/no-login demo as the product front door; GitHub is opt-in Track B, never the entry. See [[project-nova-gate0-findings]] for the MVP reprioritization and [[project-nova-roadmap]] for semver-drift context.
