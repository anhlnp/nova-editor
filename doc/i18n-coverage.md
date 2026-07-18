# i18n Coverage & Strategy

Status of builder localization (en + vi) and the strategy for content that keeps growing.

## Two kinds of text — two strategies

Nova has two fundamentally different text sources, and they localize differently:

### 1. Chrome text (builder UI) — dictionary keys
Every label/placeholder/message in the builder UI is a key in the typed dictionary
(`lib/i18n/types.ts` → `en.ts` / `vi.ts`), read via `useI18n()` → `t.builder.*`.
`I18nBuilderDictionary` is a TypeScript interface, so **adding a key forces both
locales to define it** (the build fails otherwise) — this is the guardrail that keeps
en/vi in lockstep. Persistence: the chosen locale is stored in `localStorage` +
a `nova_locale` cookie (`lib/i18n/detector.ts`), so it survives F5; the builder Topbar
now has a `LangToggle` (EN/VI) so it can be changed without leaving the builder.

**Rule for new chrome:** never inline a user-visible string. Add a key to
`I18nBuilderDictionary`, fill en + vi, and reference `t.builder.<key>`.

### 2. Growing content (templates, marketplace items, AI output) — NOT dictionary keys
Templates, community marketplace bundles, and AI-generated page content are **data,
not chrome**. Their volume is unbounded and user-generated, so they must NOT go through
the fixed dictionary (you can't ship a translation for every community item). Strategy:

- **Templates / marketplace items** carry their own `meta.name` / `meta.description`
  in the bundle. Localize these by letting the **author** supply localized meta
  (a future `meta.i18n?: { [locale]: { name, description } }` field on `NovaBundle`,
  resolved at render by the viewer's active locale), falling back to the default
  string. The built-in templates (`lib/templates/data.ts`) are a fixed, small set —
  those *can* move to dictionary keys if desired, but community items cannot.
- **The content a template inserts** (headings, body copy) is the end-user's own
  website content — it is localized by the site owner in the canvas, not by Nova.
- **AI output** is generated in the user's chosen language by prompting the model in
  that locale; it is document content, never chrome.

**Rule:** if the text is authored/generated (grows without bound), keep it as data with
an optional per-locale override; only fixed UI chrome uses the dictionary.

## Chrome coverage — remaining hardcoded strings

Top-level chrome (Topbar, RightPanel tabs, LeftSidebar tabs, CommandPalette,
CoachMarks, context menus) is localized. These deeper panels still contain hardcoded
English and are the backlog for a follow-up sweep:

| File | Approx. strings | Notes |
|------|-----------------|-------|
| ~~`DataBindingPanel.tsx`~~ | ✅ done | VARIABLES/RESOURCES/empty states/placeholders |
| `SEOPanel.tsx` | ~6 | field labels + robots options |
| `left-sidebar/pages/index.tsx` | ~5 | page CRUD labels |
| `StyleTokensPanel.tsx` | ~3 | token CRUD |
| `InteractionsPanel.tsx` | ~2 | trigger/action option labels (`TRIGGERS`, `ACTION_TYPES` arrays) |
| `left-sidebar/styles/index.tsx` | ~2 | |
| `KeyboardShortcutsModal.tsx` | many | shortcut descriptions |
| `CommentsPanel.tsx`, `ActivityPanel.tsx`, `HistoryPanel.tsx` | several | |
| `left-sidebar/assets/index.tsx`, `PageItem.tsx`, `AIPanel.tsx` | several | |

Each follow-up file: add keys to `I18nBuilderDictionary` (en + vi), replace the inline
strings with `t.builder.<key>`. `StyleInspector` property-group headers
(SPACING/TYPOGRAPHY/…) are CSS-property section names — these are conventionally left
in English (like DevTools) but can be keyed if a fully-localized inspector is desired.

## How to verify coverage

Heuristic scan for hardcoded chrome strings:
```
grep -rlnE ">[A-Z][a-z]+ [a-z]+.*<|placeholder=\"[A-Z]" apps/nova-builder/src/builder --include=*.tsx
```
A file appearing here likely has an unlocalized string. Zero hits = chrome fully keyed.
