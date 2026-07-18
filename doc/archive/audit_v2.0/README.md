# Nova Editor v2.0 - Mega Audit Archive

This directory contains 10 in-depth Audit reports (`audit_cluster_1.md` through `audit_cluster_10.md`), dissecting the entire Nova Editor v2.0 codebase in preparation for the official launch. These reports contain critical warnings regarding performance, security, and data integrity, accompanied by **ADRs (Architecture Decision Records)** for each identified issue.

> [!TIP]
> Keep this directory intact during the bug-fixing process. Once all issues are resolved, this folder will be archived in archive folder as a technical reference for the team.

> [!NOTE]
> These findings are scheduled into numbered, model-assigned releases in **[`../ROADMAP.md`](../ROADMAP.md)** (cluster → release mapping; verified against live code).

---

## The 10 Audited Clusters
1. **Cluster 1 (Layout Primitives):** Section, Row, Column, and the Micro-Primitives architecture.
2. **Cluster 2 (Canvas Chrome):** Zoom coordinate mismatch bugs (TD-018) and Viewport-Relative Portaling techniques.
3. **Cluster 3 (Content & Presets):** XSS vulnerabilities in TextBlock and Drag-and-Drop illusions in Presets.
4. **Cluster 4 (Inspector Panels):** RAM spikes due to PropsPanel re-renders and HTML5 Drag/Drop flaws.
5. **Cluster 5 (Core Sync & Adapters):** Child component Data Loss risks caused by the Zod Adapter.
6. **Cluster 6 (State Management):** Undo/Redo "Sledgehammer" causing Memory Leaks by cloning the entire DOM 20 times.
7. **Cluster 7 (Renderer & Code Export):** Broken JSX strings due to line breaks and invalid filename generation crashing Vercel builds.
8. **Cluster 8 (AI Engine & Git Sync):** Ghost Files accumulation on GitHub and AI crashes caused by conversational Markdown.
9. **Cluster 9 (API Infrastructure):** Financial DDoS vulnerabilities (Unlimited Tiers bypass) and Supabase/Redis Race Conditions.
10. **Cluster 10 (Data Contracts):** Zod Schema banning Arrays of Objects, severely restricting developer creativity.

---

## 🎯 Recommended Fix Order (Prioritization Tracks)

Do not fix these issues sequentially from 1 to 10. Software architecture dictates that you must secure the "Foundation" (Data/Security) before fixing the "Paint" (UI). Divide the team to tackle these **4 Execution Tracks**:

### Track 1: Critical Security & Data Integrity
*Issues that cause immediate financial loss or user data loss. Must be fixed first.*
- **[Cluster 9]** Fix the "Unlimited AI" tier rate-limit bypass. Must log zero-cost transactions so the system can count them. Move the Rate Limit logic to the edge (Upstash Redis) instead of Supabase.
- **[Cluster 8]** Fix the GitHub Trees API Ghost Files bug. Explicitly inject `{ sha: null }` for deleted files to prevent repository bloat.
- **[Cluster 5]** Replace `continue` with rendering an `<UnknownBlock>` in `schemaToNodes.ts` to completely eliminate the risk of permanently deleting users' child components.

### Track 2: Core Architecture Refactoring
*Resolve technical debt in the State and Schema layers.*
- **[Cluster 10]** Loosen the `PropsValueSchema` using `z.lazy()` to allow Array of Objects structures, unlocking the power of Custom Blocks.
- **[Cluster 6]** Eradicate the RAM-hogging `historyStore`. Return Undo/Redo authority back to Craft.js's native engine.
- **[Cluster 5]** Remove the dangerous `slice(0, 8)` ID string hack. Let Craft/Nanoid directly generate IDs with the `node_` prefix.

### Track 3: Editor UI & UX
*Once the core is stable, fix the interactive UI layer.*
- **[Cluster 1 & 2]** Unify the Micro-Primitive philosophy (`Box` instead of `Row/Column`). Migrate all LayoutOverlays to `document.body` (Portaling) to permanently resolve Zoom coordinate bugs.
- **[Cluster 4]** Add `useDebounce` (300ms) to the `PropsPanel` to rescue typing performance. Migrate the Drag-and-Drop library to `@dnd-kit/core`.
- **[Cluster 3]** Remove rigid Composite Blocks (Presets). Implement `DOMPurify` to block XSS attacks in the TextBlock.

### Track 4: Code Export Renderer
*Handle the final step before web deployment.*
- **[Cluster 7]** Use `JSON.stringify()` wrapped in curly braces `{}` for all string Props to preserve `\n` line breaks. Add regex sanitization for Component names (keeping only alphanumeric chars) before Next.js export to prevent `SyntaxError` crashes. Remove the redundant `triggerVercelDeploy` API call.
