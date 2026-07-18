# Nova — Interaction Performance Baseline (I9)

> Enforces invariant **I9** ([MODEL.md](MODEL.md)): drag and overlay-reposition stay within a frame
> budget so the editor feels 60fps. This doc owns the **target thresholds** and the **capture
> procedure**; the instrumentation lives in `apps/studio/src/lib/perf.ts` (`measure` / `summarize` /
> `withinBudget`, unit-tested in `perf.test.ts`).

## Budgets (target thresholds)

60fps ⇒ a ~16.7 ms frame. Editor work that runs *per frame* during an interaction must stay well under
that, leaving headroom for browser layout/paint. Source of truth: `PERF_BUDGETS` in `perf.ts`.

| Label | What it measures | Budget (p95) | Instrumented at |
|---|---|---:|---|
| `overlay.reposition` | gap-band overlay reposition on scroll / resize / zoom | **≤ 4 ms** | `LayoutOverlay.tsx` rAF reposition |
| `canvas.commit` | schema reconcile per canvas edit / drag tick | **≤ 8 ms** | `projectStore.updateElements` |

`withinBudget(label, stat)` passes when `stat.p95 ≤ budget`. These are *targets for future
enforcement* — once real numbers are captured (below), a perf CI gate can assert them.

## How to capture (browser, dev build)

1. `pnpm --filter @studio/app dev` → open a project with a moderately large tree (≥ ~200 nodes).
2. Interact for ~30 s: drag blocks, resize gaps, scroll/zoom the canvas, switch viewports.
3. In the devtools console: `window.__novaPerf()` → returns `{ label: { count, mean, p50, p95, max } }`.
4. Record the `p95`/`max` per label in the table below; compare against the budget.

Recording is **dev-only** (`PERF_ENABLED = NODE_ENV !== "production"`); in production `measure` runs the
op but retains no samples (zero overhead beyond one `performance.now()` pair, skipped entirely in prod).

## Measured baseline

🟡 **TBD at the browser-QA gate** — this env is typecheck/unit-only (SPEC §2), so live frame numbers are
captured during the Phase-D manual QA pass and filled in here.

| Label | p50 | p95 | max | within budget? | captured |
|---|---:|---:|---:|:--:|---|
| `overlay.reposition` | — | — | — | 🟡 | — |
| `canvas.commit` | — | — | — | 🟡 | — |
