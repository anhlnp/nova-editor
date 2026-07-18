# ws-* upstream pin & intentional divergence

> Tier P M0 (v20.0.1). The `packages/ws-*` directories are internal copies of
> Webstudio packages (ADR-NB-007, extraction complete). Any future re-sync must
> preserve the patches listed below.

**Pinned upstream:** `reference/webstudio` @ `65d8a1670f783b1159c7a90cbd64475381eadfae`
("fix: Fix nested collection data variable (#5835)")

## Full drift audit (2026-07-13)

`diff -rq packages/ws-*/src reference/webstudio/packages/<name>/src` → 3 files differ, all accounted for:

| File | Divergence | Verdict |
|------|-----------|---------|
| `ws-react-sdk/src/index.ts` | Nova: `export * from "./context" / "./hook"` — upstream uses `export type *`. Nova's canvas consumes `ReactSdkContext` as a **runtime value** (`<ReactSdkContext.Provider>` in `apps/nova-builder/src/canvas/canvas.tsx`), which a type-only re-export cannot provide. | **Intentional patch — keep** |
| `ws-components/src/html-embed.tsx` | Nova adds `/* webpackIgnore: true */` next to `/* @vite-ignore */` on the dynamic `import(url)`. Next.js (webpack) would otherwise try to statically bundle the runtime-only URL import. | **Intentional patch — keep** |
| `ws-design-system/.../__snapshots__/geometry-utils.test.ts.snap` | Byte-identical after CRLF→LF normalization (reference checkout has CRLF from git autocrlf; the copy was normalized to LF). Tests green on the LF copy. | **EOL artifact — no action** |

## Re-sync procedure

1. Update `reference/webstudio` checkout; note the new commit hash here.
2. `diff -rq` each `packages/ws-*/src` against its reference counterpart.
3. Re-apply the two intentional patches above if overwritten.
4. Run the six-gate check (`css-tree` stays pinned exactly 3.1.0 — ADR-NB-014).
