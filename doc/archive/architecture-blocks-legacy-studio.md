# Nova — Block Authoring Guide

> How to design a registry block. This is the **how-to / decision-rule** companion to [`COMPONENTS.md`](COMPONENTS.md) (reference tables) and [`ADR.md`](ADR.md) (decisions ADR-012/016/022-026). Current as of **v1.4 / schema 1.4**.

## Two tiers of blocks

| Tier | Blocks | Idea |
|---|---|---|
| **Primitives** | `Section`, `Row` (flex), `Column` (grid), `TextBlock`, `Image`, `Button`, `Link` | Blank building blocks; compose structure manually. (Set: `PRIMITIVE_BLOCKS` in `LeftPanel.tsx`.) |
| **Presets** | `HeroSection`, `Navbar`, `Footer`, `FeatureCard`, `PricingCard`, `FAQ`, `Stats`, `Testimonials` | Opinionated, pre-styled. Fast to add; outgrow → rebuild from primitives. |

## Canvas containers (`isCanvas: true`) and their `canMoveIn`

| Block | `canMoveIn` |
|---|---|
| `Section` | *(undefined = accepts all)* |
| `Row` | *(undefined = accepts all)* |
| `Column` | FeatureCard, PricingCard, TextBlock, Button, Image |
| `Footer` | Link, Button |
| `HeroSection` | TextBlock, Button, Image |
| `Navbar` | Link, Button, Image |
| `PricingCard` | Button |

All other blocks are `isCanvas: false` (leaf nodes).

## The `isCanvas` decision rule (writing a new block)
1. **Contains `<a>`/`<button>` a user may want to style individually?** → `isCanvas: true`; those elements MUST be child Craft nodes (Link/Button), never plain JSX.
2. **Multi-region layout where each region's content is user-controlled?** → `isCanvas: true`.
3. **Pure content display (cards/stats), no interactive sub-elements?** → `isCanvas: false`, content via props.

**Core invariant (ADR-024):** every DOM element a user may independently style must be a real Craft node, not JSX inside a monolith.
All interactive sub-elements are now child nodes (Footer was decomposed in v1.6 — its links are child `Link` nodes).

## Styling contract — CRITICAL (ADR-022/023)
- Visual styling lives in `props.classOverrides: string[]` (bounded Tailwind classes from the Style panel). `makeCraftComponent` injects them; the block merges them onto its base classes.
- **Always merge via `cn()`** (`packages/registry/src/utils/cn.ts`, wraps `tailwind-merge`) — **never string concatenation.** Conflicting utilities (base `gap-6` + override `gap-8`) must dedupe so the override wins. String concat leaves both → CSS source-order decides → "style edits don't apply".
- **Avoid responsive (`md:`) variants in base classes** for properties the Style panel controls (padding, text size) — a non-responsive override loses to a `md:` base at desktop.
- For prop-driven inline colors, gate with `hasBgOverride/hasTextColorOverride/hasBorderColorOverride` (novaStyle.ts) so a class override wins over the inline `style`.
- **Single-layer containers (ADR-025):** a container renders `{children}` directly (no inner wrapper), so layout overrides act on the content. See `Section.tsx`.
- Editor-only metadata uses `_nova*` prop keys (e.g. `_novaName`), stripped on publish (ADR-026).

## `defaultChildren` pattern
Canvas blocks with a meaningful default structure declare `defaultChildren` in their `RegistryBlock`. On insert, `LeftPanel.buildBlockElement()` resolves each child type and nests it as a real Craft node.
```typescript
// packages/registry/src/blocks/Navbar/index.ts
defaultChildren: [
  { type: "Link", props: { label: "Nova", href: "/", classOverrides: ["mr-auto","font-bold","text-xl","text-indigo-600","no-underline"] } }, // brand
  { type: "Link", props: { label: "Features", href: "#features" } },
  { type: "Link", props: { label: "Pricing", href: "#pricing" } },
  { type: "Button", props: { label: "Sign Up", href: "/signup", variant: "primary" } },
],
```

## `canMoveIn` convention
Composite canvas blocks MUST set `rules.canMoveIn` explicitly (whitelist). Empty array = no children; `undefined` = accept all (only `Section`).

## Props vs Style (current + v2.0 direction)
- **Today:** some blocks still carry visual props (TextBlock `fontSize/align/...`, Section `bgColor/padding/...`) that overlap the Style panel. With `cn()` the Style panel wins, so these are redundant/confusing (TD-020).
- **v2.0 (ADR-028, accepted):** props = **content + semantics only** (`content`, `tag`, `label/href/variant`, `src/alt`, `items[]`); visual props removed and migrated into `classOverrides`. Because `PropsPanel` is schema-driven, dropping a field from the Zod schema auto-removes its control.

## Decomposition reference
| Block | Interactive children | Source |
|---|---|---|
| HeroSection | title/subtitle → `TextBlock`, CTA → `Button` (decomposed by 1.3→1.4 migration + `defaultChildren`) | `migrations/runner.ts` |
| Navbar | brand/nav links → `Link`, CTA → `Button` | migration + `defaultChildren` |
| PricingCard | CTA → `Button` | migration + `defaultChildren` |
| Footer | links → `Link` (decomposed v1.6) | migration `1.5→1.6` + `defaultChildren` |

## Schema migrations
Don't duplicate the chain here — the authoritative list is `packages/schema/src/migrations/runner.ts` (`versionChain`) and [`ADR.md`](ADR.md). Current latest: **1.4**. Rule (ADR-013): every schema change ships a migration entry + tests.
