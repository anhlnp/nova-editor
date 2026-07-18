# Nova Editor — Product Requirements Document
**Version:** 1.0 (MVP — **Built**)  
**Status:** Implemented. Phases 1–5 complete. Last audited 2026-06-14 (7/7 packages typecheck, 151 unit tests pass).  
**Language:** English  

> This document supersedes STUDIO_PRD.md v0.1. It is both the original design spec and — via the Implementation Status section below — the as-built record. Where the code and a code snippet in this doc disagree, **the code is the source of truth**; the inline snippets are illustrative of the original design intent.

---

## 0. Implementation Status (v1.0 — as built)

**Verification (2026-06-14):** `pnpm turbo typecheck test --force` → 7/7 packages typecheck, 151 unit tests pass (schema 36, registry 71, git 6, ai 22, renderer 16).

**Post-v1.0 QA fixes (applied during v1.1 manual QA):**
- `next.config.ts` → `next.config.mjs` (Next.js 14 does not support TS config); `webpack.resolve.extensionAlias` added for ESM workspace package `.js`→`.ts` resolution.
- `getOrProvisionUser` pattern: self-healing auth for sessions where Supabase user row was missing. All token routes updated.
- `SignOutButton` added to `/projects` header; editor logo links back to `/projects`.
- `supabase/migrations/0001_init.sql` must be manually run in Supabase SQL Editor before the app works (tables do not auto-create).
- `/api/setup-check` diagnostic endpoint added (dev-only) — checks all env vars + DB connectivity + table/RPC existence.
- **Craft ROOT deserialization crash:** `schemaToNodes` was setting ROOT's `type.resolvedName = "div"` — not registered in the Craft resolver → crash on editor load. Fixed: introduced `NovaRootCanvas` (a registered canvas component), updated `schemaToNodes` to use `resolvedName: "NovaRootCanvas"`, registered in `CraftProvider`'s resolver.

### Built
| Area | Status | Notes |
|------|--------|-------|
| `packages/schema` | ✅ | Zod tree schema, ID generators, migration runner (v1.0 only, no migrations yet), defaults factory |
| `packages/registry` | ✅ | **10 blocks**: HeroSection, Button, TextBlock, Section, Navbar, Footer, FeatureCard, PricingCard, Column, Image |
| `packages/editor` | ⚠️ | Craft adapters, `CraftProvider` (`onNodesChange` + render-loop guard), draft autosave, history store. See limitation ① |
| `packages/ai` | ✅ | **Multi-provider** (ADR-011): Anthropic / OpenAI / Google. planner + patcher + applyAndValidatePatch |
| `packages/git` | ✅ | Octokit read/write/publishFiles/checkConflict |
| `packages/renderer` | ✅ | `generateAll()` (async — Prettier v3), pageFile/layoutFile/propsToJSX, routeToFilePath, embedded block sources |
| `packages/deploy` | ❌ | **Not built** — specced in §8.7, deferred to a later release (Vercel auto-deploy works via Vercel's own GitHub integration) |
| `apps/studio` | ✅ | NextAuth GitHub OAuth, Supabase server client, 3 Zustand stores, 9 API routes, editor workspace, marketing/auth/dashboard pages |
| Database | ✅ | `supabase/migrations/0001_init.sql` — tables, RLS, `deduct_credit` + `reset_monthly_credits` RPCs (previously this lived only as prose in §7/§10) |
| Credits / paywall / anti-abuse | ✅ | Credit-after-validation (ADR-006), tier paywall on publish, account-age check, per-user 10/min rate limit |
| Payments | ✅ | Lemon Squeezy webhook (timing-safe signature), Free→Pro upgrade button |
| Monthly reset cron | ✅ | `GET /api/cron/reset-credits` (Bearer `CRON_SECRET`), scheduled **daily** in `apps/studio/vercel.json` — idempotent per-user via `credits_reset_at` (intentionally differs from the `0 0 1 * *` shown in §10/§16, so Pro billing dates that aren't the 1st are handled) |

### Deviations from the original spec
- **Craft.js is an npm dependency, not a fork.** ADR-004 called for forking. The render-loop guard and adapters live in `packages/editor` instead. This works for prop-edit/AI/undo flows but blocks the canvas-DnD limitation below — resolving it properly is what the fork was for.
- **`generateAll()` is async** (Prettier v3's `format()` is async); the publish route awaits it.
- **AI is multi-provider** (ADR-011) — the original spec assumed Anthropic-only.

### Known limitations (NOT production-verified — need a browser / E2E)
1. **Canvas drag-and-drop & click-to-select are not wired.** Registry components don't call Craft's `useNode`, so today editing happens via the **Layers panel → select → Right panel** (edit props / delete) and via **AI**. Dragging a block from the Blocks panel onto the canvas, and click-selecting on the canvas, need `useNode` connectors on each component.
2. **Newly dragged blocks get Craft-generated IDs**, not the `node_<8>` format, so such a schema fails `ProjectSchema.parse()` (which would break the AI flow after a drag). This is exactly what ADR-004's fork was meant to control. Fixing ① and ② together is the headline item for v1.1.
3. **No automated E2E tests** for `apps/studio` / `packages/editor` (per §15 these were deferred). The v1.0 audit found real bugs that unit tests could not catch — E2E is a v1.1 priority.

---

## Table of Contents

0. [Implementation Status (v1.0 — as built)](#0-implementation-status-v10--as-built)
1. [Product Vision](#1-product-vision)
2. [Non-Goals — Scope Freeze](#2-non-goals--scope-freeze)
3. [Architecture Decision Log](#3-architecture-decision-log)
4. [System Architecture](#4-system-architecture)
5. [Data Models](#5-data-models)
6. [Authentication & Token Flow](#6-authentication--token-flow)
7. [Database — Supabase](#7-database--supabase)
8. [Package Specifications](#8-package-specifications)
   - 8.1 [packages/schema](#81-packagesschema)
   - 8.2 [packages/registry](#82-packagesregistry)
   - 8.3 [packages/editor](#83-packageseditor)
   - 8.4 [packages/ai](#84-packagesai)
   - 8.5 [packages/git](#85-packagesgit)
   - 8.6 [packages/renderer](#86-packagesrenderer)
   - 8.7 [packages/deploy](#87-packagesdeploy)
9. [apps/studio](#9-appsstudio)
10. [Credit System](#10-credit-system)
11. [Paywall Enforcement](#11-paywall-enforcement)
12. [Anti-Abuse](#12-anti-abuse)
13. [Environment Variables](#13-environment-variables)
14. [TypeScript & Build Config](#14-typescript--build-config)
15. [Testing Strategy](#15-testing-strategy)
16. [CI/CD](#16-cicd)
17. [Business Model & Pricing](#17-business-model--pricing)
18. [Reference Repositories (Snipe Map)](#18-reference-repositories-snipe-map)
19. [Risk Register](#19-risk-register)
20. [Launch Roadmap](#20-launch-roadmap)

---

## 1. Product Vision

**One line:** An AI-powered visual editor that writes React code and syncs it to a user's GitHub repository.

**Core loop:**
```
User prompt → AI patches JSON Schema → Visual Editor renders → Export React code → Git push
```

**Differentiation:**

| Tool | Output | Code ownership | Git sync |
|------|--------|----------------|----------|
| Webflow | HTML/CSS | ❌ | ❌ |
| Framer | React (runtime-locked) | Partial | ❌ |
| **Nova** | Clean React/Next.js .tsx | ✅ Full | ✅ |

**Target users (MVP):**
1. **Primary:** Freelance developers building landing pages for clients. Need speed; don't want boilerplate.
2. **Secondary:** Agency developers automating repetitive UI work.

---

## 2. Non-Goals — Scope Freeze

Do not add any of these in MVP. No exceptions.

| Feature | Reason excluded |
|---------|-----------------|
| Two-way sync (React Code → Schema) | AST parsing of arbitrary user code is years of work. |
| Custom user-defined components | Requires a runtime browser compiler + security sandbox. |
| Real-time collaboration | Requires CRDT/OT backend. Out of scope for v1. |
| Visual CSS breakpoint editor | Schema-first covers 90% of use cases without it. |
| AI writing raw React JSX | All AI output is JSON Patch only. No raw code from AI. |
| Self-hosted option | Adds infrastructure burden before PMF. |
| Image upload | URL-only for MVP. Users paste URLs. No S3/Cloudinary integration. |
| Template library | Release 2. Not MVP. |
| SSO / team accounts | Release 2. Not MVP. |
| SEO field editor | SEO fields removed from MVP schema entirely. Add in v1.1. |

---

## 3. Architecture Decision Log

These are irreversible architectural choices with explicit rationale. Read this before touching any package.

---

### ADR-001: Schema is the single source of truth

**Decision:** The `project.json` file is the only authoritative state of a project. All other representations (visual canvas, React code) derive from it.

**Consequence:** If `project.json` is valid, the system is in a valid state. Period.

---

### ADR-002: One-way data flow only — Schema → Code

**Decision:** Data flows in one direction: `Schema → Canvas` and `Schema → React Code`. There is no reverse path.

**Consequence:** After a user exports `.tsx` files and edits them in their code editor, those edits cannot be imported back into Nova. This is a feature, not a bug — it eliminates the class of bugs caused by roundtrip parsing.

---

### ADR-003: Git operations are server-side only via GitHub REST API

**Decision:** `packages/git` wraps `@octokit/rest` and is called exclusively from Next.js API routes on the server. There is no `isomorphic-git`, no `LightningFS`, and no browser-side git.

**Why this changes from v0.1:** The v0.1 PRD specified browser-side git with isomorphic-git + LightningFS. This has two fatal flaws:
1. The GitHub OAuth token must reach the browser, creating an XSS attack surface.
2. Since git runs in the browser, a free-tier user can open DevTools, extract the token, and call `git push` directly — the paywall is unenforceable.

**Consequence:** Draft schema is stored in browser `localStorage` (not in a git VFS). All GitHub operations (read, write, commit) go through authenticated Next.js API routes where tier checks are enforced server-side.

---

### ADR-004: Fork Craft.js into packages/editor

**Decision:** Fork `prevwong/craft.js`. Do not use it as an npm dependency.

**Why:** We need to intercept `onChange` at the core level and pipe it through `nodesToSchema()`. Upstream API changes would break us. The fork gives us stability.

**Consequence:** Craft.js upstream bug fixes and features require manual cherry-picking. Acceptable cost.

---

### ADR-005: Element IDs use nanoid, never UUID

**Decision:** All element IDs are generated with `nanoid(10)`, prefixed by type:  
- Elements: `node_<nanoid(8)>` (e.g. `node_aB3kR7mN`)  
- Pages: `page_<nanoid(6)>` (e.g. `page_xK2mRp`)

**Why nanoid over UUID v4:** Shorter (10 chars vs 36), URL-safe, equally collision-resistant for our use case. Less visual noise in JSON diffs.

**Library:** `nanoid` (ESM-only package, already supported in Next.js 13+).

---

### ADR-006: Credits deducted after successful schema validation only

**Decision:** 1 credit is deducted when an AI operation results in a valid schema. If the AI call fails (network error, 5xx), or if the JSON Patch produces an invalid schema after 3 retries: 0 credits deducted.

**Why:** Deducting before the call creates UX friction for server errors. Deducting after ensures the user only pays for value delivered.

**Implementation note:** Deduction happens at the end of `POST /api/ai/route.ts`, after `ProjectSchema.parse()` succeeds.

---

### ADR-007: schemaVersion is a string, not a number

**Decision:** The root schema field is `"schemaVersion": "1.0"` (not `"version": "2"`). Semantic versioning format: `"MAJOR.MINOR"`.

**Why:** Integer versions don't convey compatibility intent. `"1.0"` → `"1.1"` = backward-compatible. `"1.0"` → `"2.0"` = breaking change.

**Current version:** `"1.0"` at MVP launch.

---

### ADR-008: GitHub default branch is detected at project creation, not hardcoded

**Decision:** When a user connects a repo, the system fetches the default branch via Octokit (`GET /repos/{owner}/{repo}`) and stores it in the user's project record in Supabase. All git operations use the stored branch name.

**Why:** Hardcoding `"main"` fails for repos using `"master"` or custom branch names.

---

### ADR-011: Multi-provider AI — provider-agnostic interface with runtime selection

**Decision:** `packages/ai` exposes a single `AIProvider` interface. Concrete adapters implement it for Anthropic Claude, OpenAI GPT, and Google Gemini. The active provider is selected at request time via the `AI_PROVIDER` environment variable (server default) **or** a per-request `provider` field sent by the client UI.

**Providers supported at launch:**

| Provider | Planner model | Patcher model | Env key |
|----------|--------------|--------------|---------|
| `anthropic` (default) | `claude-haiku-4-5-20251001` | `claude-sonnet-4-6` | `ANTHROPIC_API_KEY` |
| `openai` | `gpt-4o-mini` | `gpt-4o` | `OPENAI_API_KEY` |
| `google` | `gemini-1.5-flash` | `gemini-1.5-pro` | `GOOGLE_GENERATIVE_AI_API_KEY` |

**Interface contract** (in `packages/ai/src/providers/base.ts`):
```typescript
export interface AIProvider {
  readonly name: string;
  complete(messages: AIMessage[], opts: CompleteOptions): Promise<string>;
}
```

**Why:** Users who already pay for OpenAI or Gemini API keys should not be forced to also pay for Anthropic. Adding providers later (Mistral, Ollama, etc.) requires only a new adapter file — no changes to planner/patcher logic.

**Consequence:** The system prompt and JSON-Patch-only constraint are enforced at the agent layer, not inside provider adapters. Every provider receives the same system prompt. Differences in model capabilities are handled by choosing the right model tier per provider (fast cheap for planner, capable for patcher).

**Per-user provider preference:** Stored in `uiStore.aiProvider` (client-side only; resets on page load). The API route reads `req.body.provider` and falls back to `process.env.AI_PROVIDER ?? "anthropic"`.

---

### ADR-009: Undo/Redo is a schema-level history stack in Zustand

**Decision:** Undo/Redo maintains a rolling array of the last 20 schema states in `projectStore`. Ctrl+Z pops the stack. Craft.js undo is disabled.

**Why:** Craft.js undo tracks its own internal node tree, not our schema. If we use Craft's undo, our schema store gets out of sync.

---

### ADR-010: Props are restricted to JSON-serializable primitives

**Decision:** Component props may only contain: `string`, `number`, `boolean`, `null`, `string[]`, or flat `Record<string, string | number | boolean>`. No functions, no `undefined`, no class instances.

**Enforcement:** `z.record(SerializableValueSchema)` in every block's `HeroSection.schema.ts`. Zod rejects anything else at the boundary.

**Why:** Props must survive `JSON.stringify()` → `JSON.parse()` roundtrip without loss. This is required for IndexedDB storage, AI patching, and git serialization.

---

## 4. System Architecture

### 4.1 Monorepo structure

```
nova-editor/
├── apps/
│   └── studio/                        # Next.js 14 App Router — the product
│
├── packages/
│   ├── schema/                        # ① Zod types + canonical project.json shape
│   ├── registry/                      # ② UI block library (component + schema + AI hints)
│   ├── editor/                        # ③ Forked Craft.js + schema adapter
│   ├── ai/                            # ④ AI agent (planner + patcher, JSON Patch only)
│   ├── git/                           # ⑤ GitHub REST API wrapper via @octokit/rest
│   ├── renderer/                      # ⑥ Schema → .tsx file generator (Pro paywall)
│   └── deploy/                        # ⑦ Vercel deploy trigger (Pro paywall, optional)
│
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .github/workflows/ci.yml
```

### 4.2 Toolchain

| Tool | Decision | Reason |
|------|----------|--------|
| Monorepo | Turborepo | Best caching, first-class Next.js + pnpm support |
| Package manager | pnpm 8.x | Workspace support, hoisting control |
| Framework | Next.js 14 (App Router) | API routes for auth/AI/git proxy |
| UI components | Tailwind CSS + shadcn/ui | Move fast, no custom CSS |
| State (client) | Zustand 4.x | Simple, no boilerplate |
| Schema validation | Zod 3.x | Runtime safety + TypeScript inference |
| Visual editor | Craft.js (forked) | Only headless React drag-drop engine |
| GitHub operations | @octokit/rest (server-side) | Secure, no browser token exposure |
| Draft storage | localForage | Async IndexedDB, client-side only |
| AI provider | Anthropic Claude | Best structured JSON output |
| Payments | Lemon Squeezy | MoR, VAT handled globally, PPP built-in |
| User DB | Supabase (PostgreSQL) | Credits, tier, GitHub tokens |

---

## 5. Data Models

### 5.1 Canonical project.json

This is the exact shape every `project.json` file must conform to. No variations.

```json
{
  "schemaVersion": "1.0",
  "meta": {
    "name": "My Landing Page",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-15T12:00:00.000Z"
  },
  "pages": [
    {
      "id": "page_xK2mRp",
      "name": "Home",
      "route": "/",
      "elements": [
        {
          "id": "node_aB3kR7mN",
          "type": "HeroSection",
          "props": {
            "title": "Welcome",
            "subtitle": "Build faster.",
            "bgColor": "#ffffff",
            "align": "center"
          },
          "children": [
            {
              "id": "node_cD9pL2qX",
              "type": "Button",
              "props": {
                "label": "Get Started",
                "variant": "primary",
                "href": "/signup"
              },
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

**Rules:**
- `schemaVersion` MUST be `"1.0"` for MVP launch. Migration runner will handle future versions.
- `meta.createdAt` is set once on project init, never updated.
- `meta.updatedAt` is updated on every schema change.
- `pages` MUST have at least 1 element.
- `elements` CAN be empty array (blank page).
- `id` fields are generated by `nanoid` — see ADR-005.
- `props` values MUST be JSON-serializable primitives — see ADR-010.

### 5.2 Default schema for new projects

When a user initializes a new project (no `project.json` found in repo), the system creates this exact default:

```json
{
  "schemaVersion": "1.0",
  "meta": {
    "name": "New Project",
    "createdAt": "{{ISO_DATE}}",
    "updatedAt": "{{ISO_DATE}}"
  },
  "pages": [
    {
      "id": "{{page_nanoid}}",
      "name": "Home",
      "route": "/",
      "elements": [
        {
          "id": "{{node_nanoid}}",
          "type": "HeroSection",
          "props": {
            "title": "Welcome to Your New Page",
            "subtitle": "Edit this hero section or use AI to redesign it.",
            "bgColor": "#ffffff",
            "align": "center"
          },
          "children": []
        },
        {
          "id": "{{node_nanoid}}",
          "type": "Footer",
          "props": {
            "copyright": "© 2026 My Company",
            "links": []
          },
          "children": []
        }
      ]
    }
  ]
}
```

`{{placeholder}}` values are filled at runtime. This default schema is defined as a factory function in `packages/schema/src/defaults.ts`.

---

## 6. Authentication & Token Flow

### 6.1 Overview

```
User clicks "Login with GitHub"
        ↓
GitHub OAuth App → returns code
        ↓
NextAuth callback (/api/auth/callback/github)
        ↓
NextAuth jwt() callback: stores accessToken in encrypted JWT cookie
        ↓
Server-side API routes: getServerSession() → session.accessToken
        ↓
packages/git: receives token as function argument (never from client)
```

**The GitHub access token NEVER reaches the browser.** It lives exclusively in the encrypted NextAuth JWT cookie (httpOnly, secure, sameSite: lax), read only by server-side API routes via `getServerSession()`.

### 6.2 NextAuth configuration

```typescript
// apps/studio/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request repo write access for Pro users
          // (Free users only need repo:read, but requesting both upfront
          // avoids a re-auth flow when user upgrades)
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // On first sign-in, persist the GitHub access token into the JWT
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = profile?.id?.toString();
        token.githubLogin = profile?.login;
        token.githubEmail = profile?.email;
        token.accountCreatedAt = profile?.created_at; // For anti-abuse check
      }
      return token;
    },
    async session({ session, token }) {
      // Expose ONLY what the client needs (no access token here)
      session.user.githubLogin = token.githubLogin as string;
      session.user.githubId = token.githubId as string;
      // DO NOT expose accessToken in session object
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### 6.3 How server routes get the token

```typescript
// Pattern used by ALL server-side API routes that need GitHub access
import { getToken } from "next-auth/jwt";

export async function POST(request: Request) {
  const token = await getToken({ req: request as any });
  if (!token?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const githubToken = token.accessToken as string;
  // Pass to packages/git as an argument — never store in client state
  await gitClient.readFile({ token: githubToken, ... });
}
```

### 6.4 User registration on first login

On first OAuth login, a server-side hook upserts the user into Supabase:

```typescript
// In jwt() callback, after setting token fields:
await upsertUser({
  githubId: token.githubId,
  githubLogin: token.githubLogin,
  githubEmail: token.githubEmail,
  githubAccountCreatedAt: token.accountCreatedAt,
  encryptedAccessToken: encrypt(account.access_token), // AES-256
});
```

The encrypted token is stored in Supabase as a backup (for background jobs). The live token comes from the JWT cookie, not Supabase.

---

## 7. Database — Supabase

**Principle:** Supabase stores ONLY billing data and user metadata. No project schemas, no code, no files. All project content lives in the user's GitHub repo and their browser.

### 7.1 Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id                TEXT UNIQUE NOT NULL,
  github_login             TEXT NOT NULL,
  github_email             TEXT,
  github_access_token_enc  TEXT,           -- AES-256 encrypted, for background jobs only
  github_account_created_at TIMESTAMPTZ,   -- Used for anti-abuse age check
  tier                     TEXT NOT NULL DEFAULT 'free' 
                             CHECK (tier IN ('free', 'pro')),
  credits_remaining        INTEGER NOT NULL DEFAULT 20 
                             CHECK (credits_remaining >= 0),
  credits_reset_at         TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  lemonsqueezy_customer_id TEXT,           -- Set after first payment
  lemonsqueezy_sub_id      TEXT,           -- Set after Pro subscription
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table (metadata only — project content lives in GitHub)
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repo_owner      TEXT NOT NULL,           -- GitHub org or user login
  repo_name       TEXT NOT NULL,
  repo_full_name  TEXT NOT NULL,           -- "owner/repo" composite
  default_branch  TEXT NOT NULL DEFAULT 'main', -- Detected at project creation
  vercel_token_enc TEXT,                   -- Encrypted Vercel token (optional)
  vercel_project_id TEXT,                  -- Vercel project ID (optional)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, repo_full_name)
);

-- Credit transactions (audit log)
CREATE TABLE credit_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  delta       INTEGER NOT NULL,           -- Negative = consumed, positive = added
  reason      TEXT NOT NULL              
                CHECK (reason IN (
                  'monthly_reset',        -- Automatic monthly refill
                  'initial_grant',        -- Credits given on signup
                  'topup_purchase',       -- User bought a booster pack
                  'ai_operation',         -- Successful AI patch
                  'refund_on_error'       -- Server error refund
                )),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
```

### 7.2 Row-Level Security

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Only service role (server-side) can access all rows
-- No client-side Supabase access. All queries go through Next.js API routes.
-- RLS is a defense-in-depth measure.
```

**Implementation note:** Never import the Supabase client in client components. Only import in `apps/studio/src/lib/supabase-server.ts` which uses `SUPABASE_SERVICE_KEY` (server-only env var).

---

## 8. Package Specifications

---

### 8.1 `packages/schema`

**Purpose:** Defines and validates all data shapes in the system. Every other package imports its types from here.

**Rule:** Every value entering the system from outside (GitHub file content, AI output, URL params) MUST be validated by a Zod schema from this package before touching application state.

#### File structure

```
packages/schema/src/
├── index.ts                    # Re-exports everything
├── schemas/
│   ├── element.schema.ts       # Element (node) type — recursive
│   ├── page.schema.ts          # Page type
│   ├── project.schema.ts       # Root project.json shape
│   └── props.schema.ts         # Serializable props validator
├── defaults.ts                 # Factory function for default project
├── migrations/
│   ├── runner.ts               # Migration chain runner
│   └── (empty for v1.0)        # First migration file added when v1.1 breaks schema
└── utils/
    └── generateId.ts           # nanoid wrappers for element/page IDs
```

#### Complete Zod implementation

```typescript
// schemas/props.schema.ts
// Only JSON-serializable primitives allowed in props (ADR-010)
import { z } from "zod";

const SerializableLeaf = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const SerializableArray = z.array(SerializableLeaf);

export const PropsValueSchema = z.union([
  SerializableLeaf,
  SerializableArray,
  z.record(SerializableLeaf),
]);

export const PropsSchema = z.record(PropsValueSchema);
```

```typescript
// schemas/element.schema.ts
import { z } from "zod";
import { PropsSchema } from "./props.schema";

// Self-referential recursive type
export type Element = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: Element[];
};

export const ElementSchema: z.ZodType<Element> = z.lazy(() =>
  z.object({
    id:       z.string().regex(/^node_[A-Za-z0-9_-]{8}$/, 
                               "Element ID must be 'node_' + 8 nanoid chars"),
    type:     z.string().min(1, "type must be a non-empty string"),
    props:    PropsSchema,
    children: z.array(ElementSchema),
  })
);
```

```typescript
// schemas/page.schema.ts
import { z } from "zod";
import { ElementSchema } from "./element.schema";

export const PageSchema = z.object({
  id:       z.string().regex(/^page_[A-Za-z0-9_-]{6}$/,
                             "Page ID must be 'page_' + 6 nanoid chars"),
  name:     z.string().min(1).max(64),
  route:    z.string().regex(/^\/[a-z0-9\/\-]*$/, 
                             "Route must start with / and contain only lowercase a-z, 0-9, /, -"),
  elements: z.array(ElementSchema),
});

export type Page = z.infer<typeof PageSchema>;
```

```typescript
// schemas/project.schema.ts
import { z } from "zod";
import { PageSchema } from "./page.schema";

export const ProjectSchema = z.object({
  schemaVersion: z.string().regex(/^\d+\.\d+$/, "Must be 'MAJOR.MINOR' format"),
  meta: z.object({
    name:      z.string().min(1).max(128),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  pages: z.array(PageSchema).min(1, "Project must have at least one page"),
});

export type Project = z.infer<typeof ProjectSchema>;
```

```typescript
// utils/generateId.ts
import { nanoid } from "nanoid";

// ADR-005: node_ prefix + 8 nanoid chars
export function generateElementId(): string {
  return `node_${nanoid(8)}`;
}

// ADR-005: page_ prefix + 6 nanoid chars
export function generatePageId(): string {
  return `page_${nanoid(6)}`;
}
```

```typescript
// defaults.ts
import { generateElementId, generatePageId } from "./utils/generateId";
import type { Project } from "./schemas/project.schema";

export function createDefaultProject(name = "New Project"): Project {
  const now = new Date().toISOString();
  return {
    schemaVersion: "1.0",
    meta: { name, createdAt: now, updatedAt: now },
    pages: [
      {
        id: generatePageId(),
        name: "Home",
        route: "/",
        elements: [
          {
            id: generateElementId(),
            type: "HeroSection",
            props: {
              title: "Welcome to Your New Page",
              subtitle: "Edit this hero section or use AI to redesign it.",
              bgColor: "#ffffff",
              align: "center",
            },
            children: [],
          },
          {
            id: generateElementId(),
            type: "Footer",
            props: {
              copyright: `© ${new Date().getFullYear()} My Company`,
              links: [],
            },
            children: [],
          },
        ],
      },
    ],
  };
}
```

```typescript
// migrations/runner.ts
import { ProjectSchema, type Project } from "../schemas/project.schema";

// Migrations are added here as the schema evolves.
// Each migration transforms from one version to the next.
// At MVP launch, there are no migrations (only version "1.0" exists).
type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>;

const migrations: Record<string, MigrationFn> = {
  // Example for future use:
  // "1.0→1.1": (data) => ({ ...data, schemaVersion: "1.1", pages: data.pages.map(...) }),
};

export function migrateToLatest(raw: unknown): Project {
  let data = raw as Record<string, unknown>;
  
  // Detect old integer-versioned schemas from v0.1 and convert
  if (typeof data.version === "number" || typeof data.version === "string") {
    data.schemaVersion = "1.0";
    delete data.version;
  }

  // Run migration chain
  const latestVersion = "1.0";
  let currentVersion = data.schemaVersion as string;

  while (currentVersion !== latestVersion) {
    const key = `${currentVersion}→...`; // will be populated as versions grow
    const migrateFn = migrations[key];
    if (!migrateFn) {
      throw new Error(`No migration found from schema version "${currentVersion}"`);
    }
    data = migrateFn(data);
    currentVersion = data.schemaVersion as string;
  }

  return ProjectSchema.parse(data);
}
```

**Reference repos:**
| Repo | Path | Why |
|------|------|-----|
| `webstudio-is/webstudio` | `packages/project/src/` | Best Zod tree schema design in the wild |
| `BuilderIO/builder` | `packages/core/src/types/element.ts` | How they type the `inputs` field |

---

### 8.2 `packages/registry`

**Purpose:** The library of all UI blocks available in the editor. If a block isn't in this package, it cannot be placed on the canvas.

**MVP block count:** 10 blocks at launch. Expandable without breaking changes.

#### File structure (per block)

```
packages/registry/src/blocks/HeroSection/
├── index.ts                   # Re-export: { component, schema, defaults, settings, aiHints, craftConfig }
├── HeroSection.tsx            # The React component (renders on canvas AND in exported code)
├── HeroSection.schema.ts      # Zod schema for this block's props + defaults
├── HeroSection.settings.tsx   # shadcn/ui inspector panel (right panel in editor)
└── HeroSection.ai.ts          # Plain-text description for LLM system prompt injection
```

#### Block contract — every block MUST export this shape

```typescript
// packages/registry/src/types.ts
import { z } from "zod";

export interface RegistryBlock {
  // The React component that renders in the editor canvas AND in exported code
  component: React.ComponentType<Record<string, unknown>>;
  
  // Zod schema for props validation
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  
  // Default props for when this block is first dropped
  defaults: Record<string, unknown>;
  
  // The inspector panel rendered in the right panel when this block is selected
  settings: React.ComponentType<{
    nodeId: string;
    props:  Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
  }>;
  
  // Plain text hints injected into the AI system prompt
  aiHints: string;
  
  // Craft.js configuration
  craftConfig: {
    displayName: string;
    isCanvas: boolean;      // true = can have children dropped inside it
    rules?: {
      canMoveIn?: string[]; // Only these component types can be dropped as children
                            // Empty array = accepts no children. Undefined = accepts all.
    };
  };
}
```

#### Complete example — HeroSection

```typescript
// HeroSection.tsx
// Uses Tailwind. Fully responsive by default.
// All responsive breakpoints are BUILT INTO the component (not controlled by AI props).
import React from "react";
import { useNode } from "@craftjs/core";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  bgColor: string;
  align: "left" | "center" | "right";
  children?: React.ReactNode;
}

export function HeroSection({
  title = "Welcome",
  subtitle = "Your subtitle here",
  bgColor = "#ffffff",
  align = "center",
  children,
}: HeroSectionProps) {
  const { connectors: { connect, drag } } = useNode();
  
  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[align];

  return (
    <section
      ref={ref => connect(drag(ref!))}
      style={{ backgroundColor: bgColor }}
      className={`w-full py-16 px-4 md:py-24 md:px-8 flex flex-col ${alignClass}`}
    >
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
      <p  className="text-base md:text-xl text-gray-600 mb-8 max-w-2xl">{subtitle}</p>
      {children && <div className="flex flex-wrap gap-4">{children}</div>}
    </section>
  );
}

// Required: Craft.js static config
HeroSection.craft = {
  displayName: "Hero Section",
  props: {
    title: "Welcome",
    subtitle: "Your subtitle here",
    bgColor: "#ffffff",
    align: "center",
  },
  rules: {
    canMoveIn: ["Button"],  // Only Button components can be dropped inside
  },
};
```

```typescript
// HeroSection.schema.ts
import { z } from "zod";

export const HeroSectionPropsSchema = z.object({
  title:    z.string().default("Welcome"),
  subtitle: z.string().default("Your subtitle here"),
  bgColor:  z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#ffffff"),
  align:    z.enum(["left", "center", "right"]).default("center"),
});

export const HeroSectionDefaults = HeroSectionPropsSchema.parse({});
```

```typescript
// HeroSection.settings.tsx
// Inspector UI rendered in the right panel when HeroSection is selected
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SettingsProps {
  nodeId: string;
  props:  Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

export function HeroSectionSettings({ props, onChange }: SettingsProps) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Title</Label>
        <Input
          value={props.title as string}
          onChange={e => onChange("title", e.target.value)}
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input
          value={props.subtitle as string}
          onChange={e => onChange("subtitle", e.target.value)}
        />
      </div>
      <div>
        <Label>Background Color</Label>
        <input
          type="color"
          value={props.bgColor as string}
          onChange={e => onChange("bgColor", e.target.value)}
          className="w-full h-10 rounded border"
        />
      </div>
      <div>
        <Label>Alignment</Label>
        <Select
          value={props.align as string}
          onValueChange={val => onChange("align", val)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

```typescript
// HeroSection.ai.ts
// This string is injected verbatim into the AI system prompt.
// Write it as if you're writing documentation for the AI to read.
export const aiHints = `
### HeroSection
A full-width hero banner. Typically placed as the first element on a page.

Props (all required, no optional props):
- title (string): Main headline. Max 80 characters recommended.
- subtitle (string): Supporting text below the title. Max 160 characters.
- bgColor (string): Hex color code for background. Example: "#1a1a2e"
- align ("left" | "center" | "right"): Text alignment. Default: "center"

Children: Only "Button" components may be placed inside HeroSection.

Common AI usage:
- "Make the hero dark" → set bgColor to a dark hex like "#0f172a"  
- "Add a CTA button" → add a Button as a child element
- "Center the text" → set align to "center"

Do NOT set: padding, font size, or other CSS. These are hardcoded in the component.
`;
```

#### MVP Block list

| Block | isCanvas | Accepts children |
|-------|----------|-----------------|
| `HeroSection` | yes | `Button` only |
| `Button` | no | none |
| `TextBlock` | no | none |
| `ImageBlock` | no | none |
| `Section` | yes | any block |
| `Column` | yes | any block |
| `Navbar` | no | none |
| `Footer` | no | none |
| `FeatureCard` | no | none |
| `PricingCard` | no | none |

**Responsive design rule:** Every block's Tailwind classes MUST include at least `md:` breakpoint variants. Blocks render full-width on mobile and switch to designed layout on `md:` (768px+).

#### Registry index and resolver

```typescript
// packages/registry/src/index.ts
import { HeroSection } from "./blocks/HeroSection";
import { Button }      from "./blocks/Button";
// ... all blocks

export const registry: Record<string, RegistryBlock> = {
  HeroSection,
  Button,
  TextBlock,
  ImageBlock,
  Section,
  Column,
  Navbar,
  Footer,
  FeatureCard,
  PricingCard,
};

// Used by Craft.js Editor component's `resolver` prop
export function buildCraftResolver() {
  return Object.fromEntries(
    Object.entries(registry).map(([name, block]) => [name, block.component])
  );
}

// Used by packages/ai to build the AI system prompt
export function buildAIHints(): string {
  return Object.entries(registry)
    .map(([_, block]) => block.aiHints)
    .join("\n\n");
}
```

#### Block generator CLI (to avoid boilerplate hell)

```bash
# Create all 4 files for a new block with correct templates
pnpm nova:generate-block TestimonialCard

# Output:
# ✓ packages/registry/src/blocks/TestimonialCard/index.ts
# ✓ packages/registry/src/blocks/TestimonialCard/TestimonialCard.tsx
# ✓ packages/registry/src/blocks/TestimonialCard/TestimonialCard.schema.ts
# ✓ packages/registry/src/blocks/TestimonialCard/TestimonialCard.settings.tsx
# ✓ packages/registry/src/blocks/TestimonialCard/TestimonialCard.ai.ts
# Remember to add TestimonialCard to packages/registry/src/index.ts
```

The CLI is a Node.js script at `packages/registry/scripts/generate-block.ts` using `fs.copyFileSync` from template files.

---

### 8.3 `packages/editor`

**Purpose:** The visual drag-and-drop canvas. A fork of Craft.js with adapters that translate between Craft's internal node tree and our `Project` schema.

#### File structure

```
packages/editor/src/
├── index.ts
├── CraftProvider.tsx          # Wraps the editor workspace; initializes Craft
├── craft-adapter/
│   ├── schemaToNodes.ts       # Project elements → Craft SerializedNodes (on load)
│   └── nodesToSchema.ts       # Craft SerializedNodes → Project elements (on change)
└── storage/
    ├── draftStorage.ts        # localForage read/write for draft schema
    └── historyStore.ts        # Zustand slice for undo/redo (ADR-009)
```

#### schemaToNodes.ts

```typescript
import type { SerializedNodes } from "@craftjs/core";
import type { Element } from "@studio/schema";
import { registry } from "@studio/registry";

export function schemaToNodes(elements: Element[]): SerializedNodes {
  const nodes: SerializedNodes = {
    ROOT: {
      type:        { resolvedName: "div" },
      props:       {},
      parent:      undefined as any,
      displayName: "Root",
      custom:      {},
      isCanvas:    true,
      nodes:       elements.map(e => e.id),
      linkedNodes: {},
    },
  };

  function processElement(el: Element, parentId: string) {
    const blockConfig = registry[el.type];
    
    nodes[el.id] = {
      type:        { resolvedName: el.type },
      props:       el.props,
      parent:      parentId,
      displayName: blockConfig?.craftConfig.displayName ?? el.type,
      custom:      {},
      isCanvas:    blockConfig?.craftConfig.isCanvas ?? false,
      nodes:       el.children.map(c => c.id),
      linkedNodes: {},
    };
    
    el.children.forEach(child => processElement(child, el.id));
  }

  elements.forEach(el => processElement(el, "ROOT"));
  return nodes;
}
```

#### nodesToSchema.ts

```typescript
import type { SerializedNodes } from "@craftjs/core";
import type { Element } from "@studio/schema";

export function nodesToSchema(craftNodes: SerializedNodes): Element[] {
  function buildElement(nodeId: string): Element {
    const node = craftNodes[nodeId];
    return {
      id:       nodeId,
      type:     node.type.resolvedName,
      props:    node.props,
      children: node.nodes.map(childId => buildElement(childId)),
    };
  }
  
  const root = craftNodes["ROOT"];
  return root.nodes.map(id => buildElement(id));
}
```

#### CraftProvider.tsx — the bridge

```typescript
// The critical bridge between Craft.js state and our schema store
// Implements ADR-004 (no render loops) and ADR-009 (schema-level undo/redo)

import { Editor, Frame, Element } from "@craftjs/core";
import { buildCraftResolver } from "@studio/registry";
import { useProjectStore } from "@/store/projectStore";
import { schemaToNodes } from "./craft-adapter/schemaToNodes";
import { nodesToSchema } from "./craft-adapter/nodesToSchema";
import { saveDraft }     from "./storage/draftStorage";

let isApplyingExternalPatch = false; // ADR-009: Render loop guard

interface CraftProviderProps {
  projectId: string;
  children:  React.ReactNode;
}

export function CraftProvider({ projectId, children }: CraftProviderProps) {
  const { draftSchema, setElements } = useProjectStore();
  
  function handleCraftChange(query: any) {
    // GUARD: Skip if we're the ones who triggered this change
    if (isApplyingExternalPatch) return;
    
    const nodes = query.getSerializedNodes();
    const elements = nodesToSchema(nodes);
    setElements(elements); // Updates Zustand, triggers debounced saveDraft
  }
  
  return (
    <Editor
      resolver={buildCraftResolver()}
      onRender={handleCraftChange}
    >
      {children}
    </Editor>
  );
}

// Called by AI patch handler and schema migration (external changes to canvas)
export function applySchemaToCanvas(
  editorActions: any,
  elements: Element[]
) {
  isApplyingExternalPatch = true;
  try {
    const nodes = schemaToNodes(elements);
    editorActions.history.ignore().deserialize(nodes);
  } finally {
    isApplyingExternalPatch = false;
  }
}
```

#### draftStorage.ts — debounced auto-save

```typescript
import localforage from "localforage";
import debounce from "lodash-es/debounce";
import type { Project } from "@studio/schema";

const DRAFT_KEY = (projectId: string) => `nova:draft:${projectId}`;

interface Draft {
  schema:   Project;
  savedAt:  number; // Unix timestamp ms
}

export const saveDraft = debounce(
  async (projectId: string, schema: Project): Promise<void> => {
    await localforage.setItem<Draft>(DRAFT_KEY(projectId), {
      schema,
      savedAt: Date.now(),
    });
  },
  1500 // 1.5 seconds after last change
);

export async function loadDraft(projectId: string): Promise<Draft | null> {
  return localforage.getItem<Draft>(DRAFT_KEY(projectId));
}

export async function clearDraft(projectId: string): Promise<void> {
  await localforage.removeItem(DRAFT_KEY(projectId));
}
```

#### historyStore.ts — Undo/Redo (ADR-009)

```typescript
// Zustand slice: keep last 20 schema states for undo/redo
import type { Project } from "@studio/schema";

const MAX_HISTORY = 20;

interface HistoryState {
  past:   Project[];
  future: Project[];
  
  pushHistory:  (snapshot: Project) => void;
  undo:         () => Project | null;
  redo:         () => Project | null;
  clearHistory: () => void;
}

export const createHistorySlice = (set: any, get: any): HistoryState => ({
  past:   [],
  future: [],
  
  pushHistory(snapshot) {
    set((state: HistoryState) => ({
      past:   [...state.past.slice(-MAX_HISTORY + 1), snapshot],
      future: [], // New action clears redo stack
    }));
  },
  
  undo() {
    const { past } = get();
    if (past.length < 2) return null; // Need at least 2: current + one to go back to
    const previous = past[past.length - 2];
    set((state: HistoryState) => ({
      past:   state.past.slice(0, -1),
      future: [state.past[state.past.length - 1], ...state.future],
    }));
    return previous;
  },
  
  redo() {
    const { future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    set((state: HistoryState) => ({
      past:   [...state.past, future[0]],
      future: state.future.slice(1),
    }));
    return next;
  },
  
  clearHistory() {
    set({ past: [], future: [] });
  },
});
```

---

### 8.4 `packages/ai`

**Purpose:** Takes natural language from the user → produces a JSON Patch array (RFC 6902) → the calling code applies it to the draft schema.

**Hard constraint:** The AI NEVER writes React, JSX, TypeScript, HTML, or CSS. All output is JSON Patch only. This is enforced by the system prompt, and validated by Zod after the call.

**Multi-provider support:** See ADR-011. Provider is selected at runtime; all providers receive the same system prompt and return the same JSON Patch format.

#### File structure

```
packages/ai/src/
├── index.ts
├── providers/
│   ├── base.ts                # AIProvider interface + AIMessage type
│   ├── anthropic.ts           # Claude (haiku planner, sonnet patcher)
│   ├── openai.ts              # GPT (gpt-4o-mini planner, gpt-4o patcher)
│   ├── google.ts              # Gemini (flash planner, pro patcher)
│   └── registry.ts            # getProvider(name) factory
├── agents/
│   ├── plannerAgent.ts        # Provider-agnostic: user text → structured plan
│   └── patcherAgent.ts        # Provider-agnostic: plan → RFC 6902 JSON Patch array
├── prompts/
│   └── system.prompt.ts       # Static rules + registry hints slot
└── utils/
    └── applyPatch.ts          # Wrapper around fast-json-patch + Zod validation
```

#### System prompt

```typescript
// prompts/system.prompt.ts
export function buildSystemPrompt(registryHints: string): string {
  return `
You are the AI engine for Nova Editor, a visual React page builder.
You edit pages by producing JSON Patch operations (RFC 6902).

═══════════════════════════════════════
HARD RULES — Violating any of these makes your entire output invalid:
═══════════════════════════════════════
1. Output ONLY a raw JSON array of RFC 6902 patch operations.
   No markdown fences. No explanations. No surrounding text. Nothing else.
   
2. NEVER write React, JSX, TypeScript, CSS, or HTML. Not even in string values.

3. ONLY reference "type" values from the AVAILABLE COMPONENTS list below.
   If a component name you need is not in the list: do not use it. Output [].

4. ONLY reference "path" values that exist in the CURRENT SCHEMA.
   Never guess or invent paths.

5. When adding a new element (op: "add"), it MUST include:
   - "id": a string starting with "node_" followed by 8 alphanumeric chars
   - "type": a valid component name
   - "props": an object with the required props for that component type
   - "children": an empty array []
   
6. If you are unsure, output an empty array: []
   An empty array is always valid. An invalid patch is never acceptable.

═══════════════════════════════════════
AVAILABLE COMPONENTS:
═══════════════════════════════════════
${registryHints}

═══════════════════════════════════════
OUTPUT FORMAT EXAMPLE:
═══════════════════════════════════════
[
  { "op": "replace", "path": "/pages/0/elements/0/props/bgColor", "value": "#0f172a" },
  { "op": "add", "path": "/pages/0/elements/-", "value": {
      "id": "node_aB3kR7mN",
      "type": "Button",
      "props": { "label": "Get Started", "variant": "primary", "href": "/signup" },
      "children": []
    }
  }
]
`.trim();
}
```

#### plannerAgent.ts

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // API key from server env

export interface PlanStep {
  action: string;   // e.g., "change background color"
  target: string;   // e.g., "elements[0] (HeroSection)"
  value:  string;   // e.g., "dark navy #0f172a"
}

export async function plannerAgent(
  userMessage: string,
  schemaContext: string
): Promise<PlanStep[]> {
  const response = await client.messages.create({
    model:      "claude-haiku-4-5-20251001", // Fast + cheap for planning
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `
Given this page schema, what changes are needed to fulfill this request?
"${userMessage}"

Schema summary: ${schemaContext}

Output ONLY a JSON array of { action, target, value } objects. No explanation.
Example: [{ "action": "change color", "target": "HeroSection background", "value": "#0f172a" }]
      `.trim(),
    }],
  });
  
  const text = response.content[0].type === "text" ? response.content[0].text : "[]";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
```

#### patcherAgent.ts

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "../prompts/system.prompt";
import { buildAIHints }      from "@studio/registry";
import type { Project }      from "@studio/schema";
import type { PlanStep }     from "./plannerAgent";

const client = new Anthropic();

export async function patcherAgent(
  plan:          PlanStep[],
  currentSchema: Project,
  onRetry?:      (attempt: number, error: string) => void
): Promise<any[]> {
  const systemPrompt = buildSystemPrompt(buildAIHints());
  const userMessage  = `
Current schema:
${JSON.stringify(currentSchema, null, 2)}

Planned changes:
${JSON.stringify(plan, null, 2)}

Produce the JSON Patch array to implement these changes.
`;

  let lastError = "";
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await client.messages.create({
        model:      "claude-sonnet-4-6",
        max_tokens: 2000,
        system:     systemPrompt,
        messages: attempt === 1
          ? [{ role: "user", content: userMessage }]
          : [
              { role: "user",      content: userMessage },
              { role: "assistant", content: "[]" }, // Pretend AI gave empty on prev attempt
              { role: "user",      content: 
                `Your previous output caused this error: "${lastError}". ` +
                `Try again with corrected paths and values.` },
            ],
      });
      
      const text = response.content[0].type === "text" 
        ? response.content[0].text 
        : "[]";
      
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (err) {
      lastError = String(err);
      onRetry?.(attempt, lastError);
      if (attempt === 3) throw new Error(`patcherAgent failed after 3 attempts: ${lastError}`);
    }
  }
  
  return []; // Unreachable, satisfies TypeScript
}
```

#### applyPatch.ts

```typescript
import { applyPatch as jsonPatchApply } from "fast-json-patch";
import { ProjectSchema, type Project } from "@studio/schema";

export function applyAndValidatePatch(
  currentSchema: Project,
  patches:        any[]
): Project {
  if (patches.length === 0) return currentSchema;
  
  // Deep clone to avoid mutating the current schema
  const clone = JSON.parse(JSON.stringify(currentSchema));
  
  const result = jsonPatchApply(clone, patches, /* validate: */ true);
  
  // Always Zod-validate the result
  // This throws if the AI produced an invalid structure
  return ProjectSchema.parse(result.newDocument);
}
```

---

### 8.5 `packages/git`

**Purpose:** Server-side GitHub operations via `@octokit/rest`. Never called from the browser.

> **Note (departure from v0.1):** v0.1 used `isomorphic-git` + `LightningFS` in the browser. This was changed per **ADR-003** because (a) GitHub tokens must not reach the browser, and (b) the paywall cannot be enforced for browser-side git operations.

#### File structure

```
packages/git/src/
├── index.ts
├── client.ts              # Octokit instance factory
├── commands/
│   ├── readProject.ts     # Read project.json from repo
│   ├── writeProject.ts    # Commit project.json to repo (Free tier)
│   ├── publishFiles.ts    # Commit project.json + .tsx files (Pro tier)
│   └── checkConflict.ts   # Detect if remote is ahead of our last-read SHA
└── types.ts               # Shared types for this package
```

#### client.ts

```typescript
import { Octokit } from "@octokit/rest";

export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}
```

#### readProject.ts — load project.json on editor open

```typescript
import { createOctokit } from "../client";
import { migrateToLatest, type Project } from "@studio/schema";

interface ReadProjectArgs {
  token:  string;
  owner:  string;
  repo:   string;
  branch: string; // From Supabase projects.default_branch — never hardcoded
}

interface ReadProjectResult {
  project: Project | null;  // null = file doesn't exist yet (new project)
  sha:     string | null;   // Current file SHA (needed for update calls)
}

export async function readProject(args: ReadProjectArgs): Promise<ReadProjectResult> {
  const octokit = createOctokit(args.token);
  
  try {
    const response = await octokit.repos.getContent({
      owner: args.owner,
      repo:  args.repo,
      path:  "project.json",
      ref:   args.branch,
    });
    
    if (Array.isArray(response.data)) {
      throw new Error("project.json is a directory, not a file");
    }
    
    const content = Buffer.from(
      (response.data as any).content, 
      "base64"
    ).toString("utf-8");
    
    const raw = JSON.parse(content);
    const project = migrateToLatest(raw); // Runs migrations if schema is outdated
    
    return { project, sha: (response.data as any).sha };
  } catch (err: any) {
    if (err.status === 404) {
      return { project: null, sha: null }; // New project — caller creates default
    }
    throw err;
  }
}
```

#### writeProject.ts — Free tier: schema-only commit

```typescript
import { createOctokit } from "../client";
import type { Project } from "@studio/schema";

interface WriteProjectArgs {
  token:         string;
  owner:         string;
  repo:          string;
  branch:        string;
  project:       Project;
  currentSha:    string | null; // null = create new file
  authorName:    string;        // GitHub user's display name
  authorEmail:   string;        // GitHub user's email
}

export async function writeProject(args: WriteProjectArgs): Promise<string> {
  const octokit  = createOctokit(args.token);
  const content  = Buffer.from(
    JSON.stringify(args.project, null, 2), 
    "utf-8"
  ).toString("base64");
  
  const response = await octokit.repos.createOrUpdateFileContents({
    owner:   args.owner,
    repo:    args.repo,
    path:    "project.json",
    message: `feat: update project schema via Nova Editor`,
    content,
    sha:     args.currentSha ?? undefined,
    branch:  args.branch,
    committer: {
      name:  args.authorName,
      email: args.authorEmail,
    },
  });
  
  // Return new SHA for subsequent operations
  return (response.data.content as any).sha;
}
```

#### publishFiles.ts — Pro tier: schema + generated .tsx files

```typescript
import { createOctokit } from "../client";
import type { Project } from "@studio/schema";

interface PublishFilesArgs {
  token:       string;
  owner:       string;
  repo:        string;
  branch:      string;
  project:     Project;
  files:       Record<string, string>; // path → file content
  authorName:  string;
  authorEmail: string;
}

export async function publishFiles(args: PublishFilesArgs): Promise<void> {
  const octokit = createOctokit(args.token);
  
  // GitHub Trees API allows committing multiple files atomically
  
  // Step 1: Get current HEAD SHA
  const { data: ref } = await octokit.git.getRef({
    owner: args.owner,
    repo:  args.repo,
    ref:   `heads/${args.branch}`,
  });
  const headSha = ref.object.sha;
  
  // Step 2: Create blobs for all files
  const treeItems = await Promise.all([
    // Always include project.json
    createBlob(octokit, args.owner, args.repo, 
               JSON.stringify(args.project, null, 2))
      .then(sha => ({ path: "project.json", mode: "100644" as const, type: "blob" as const, sha })),
    // All generated .tsx files
    ...Object.entries(args.files).map(([path, content]) =>
      createBlob(octokit, args.owner, args.repo, content)
        .then(sha => ({ path, mode: "100644" as const, type: "blob" as const, sha }))
    ),
  ]);
  
  // Step 3: Create tree
  const { data: tree } = await octokit.git.createTree({
    owner:     args.owner,
    repo:      args.repo,
    tree:      treeItems,
    base_tree: headSha,
  });
  
  // Step 4: Create commit
  const { data: commit } = await octokit.git.createCommit({
    owner:   args.owner,
    repo:    args.repo,
    message: "feat: publish via Nova Editor",
    tree:    tree.sha,
    parents: [headSha],
    author:  { name: args.authorName, email: args.authorEmail },
  });
  
  // Step 5: Update branch reference
  await octokit.git.updateRef({
    owner: args.owner,
    repo:  args.repo,
    ref:   `heads/${args.branch}`,
    sha:   commit.sha,
  });
}

async function createBlob(
  octokit: any, owner: string, repo: string, content: string
): Promise<string> {
  const { data } = await octokit.git.createBlob({
    owner,
    repo,
    content:  Buffer.from(content, "utf-8").toString("base64"),
    encoding: "base64",
  });
  return data.sha;
}
```

#### checkConflict.ts — detect remote changes before publish

```typescript
import { createOctokit } from "../client";

export async function checkConflict(args: {
  token:      string;
  owner:      string;
  repo:       string;
  branch:     string;
  lastKnownSha: string; // SHA of project.json when user opened the editor
}): Promise<boolean> {
  const octokit = createOctokit(args.token);
  
  try {
    const response = await octokit.repos.getContent({
      owner: args.owner,
      repo:  args.repo,
      path:  "project.json",
      ref:   args.branch,
    });
    
    const currentSha = (response.data as any).sha;
    return currentSha !== args.lastKnownSha; // true = conflict
  } catch {
    return false; // If file doesn't exist, no conflict
  }
}
```

**Conflict resolution policy:**  
When `checkConflict()` returns `true`, the API route creates a branch `nova/draft-{unix-ts}`, pushes there, and returns a PR URL to the client. The client shows a banner: *"Your changes were saved to a new branch. [Open Pull Request →]"*.  
Force-push is NOT offered in MVP. The user must resolve conflicts via GitHub's PR interface.

---

### 8.6 `packages/renderer`

**Purpose:** Converts a `Project` schema into `.tsx` source files. This package is the Pro paywall feature. It is never called from client code — only from `apps/studio/src/app/api/publish/route.ts` after a Pro tier check.

#### File structure

```
packages/renderer/src/
├── index.ts
├── generators/
│   ├── pageFile.ts            # Generates one .tsx page file per page
│   ├── layoutFile.ts          # Generates app/layout.tsx with Navbar/Footer
│   └── propsToJSX.ts          # Converts props object → JSX attribute string
└── utils/
    └── format.ts              # Prettier formatter
```

#### propsToJSX.ts — fixes the boolean prop bug from v0.1

```typescript
// v0.1 bug: `${k}=${JSON.stringify(v)}` produced disabled="true" instead of disabled={true}
// This function generates correct JSX prop syntax for all primitive types.

export function propsToJSXString(props: Record<string, unknown>): string {
  return Object.entries(props)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? key : `${key}={false}`;         // disabled or disabled={false}
      }
      if (typeof value === "number") {
        return `${key}={${value}}`;                    // size={16}
      }
      if (typeof value === "string") {
        // Escape double-quotes inside the string
        const escaped = value.replace(/"/g, '\\"');
        return `${key}="${escaped}"`;                  // title="Hello"
      }
      if (Array.isArray(value) || typeof value === "object") {
        return `${key}={${JSON.stringify(value)}}`;   // items={[...]}
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join("\n        ");
}
```

#### pageFile.ts — generates one page .tsx file

```typescript
import type { Page, Element } from "@studio/schema";
import { propsToJSXString } from "./propsToJSX";
import { format } from "../utils/format";

export function generatePageFile(page: Page): string {
  // Collect unique component types used on this page
  const usedTypes = new Set<string>();
  function collectTypes(elements: Element[]) {
    elements.forEach(el => {
      usedTypes.add(el.type);
      collectTypes(el.children);
    });
  }
  collectTypes(page.elements);
  
  const imports = Array.from(usedTypes)
    .map(type => `import { ${type} } from "@/components/blocks/${type}";`)
    .join("\n");
  
  function renderElement(el: Element, indent = 2): string {
    const padding = " ".repeat(indent * 2);
    const props = propsToJSXString(el.props as Record<string, unknown>);
    
    if (el.children.length === 0) {
      return `${padding}<${el.type}\n${padding}  ${props}\n${padding}/>`;
    }
    
    const childrenStr = el.children
      .map(child => renderElement(child, indent + 1))
      .join("\n");
    
    return `${padding}<${el.type}\n${padding}  ${props}\n${padding}>\n${childrenStr}\n${padding}</${el.type}>`;
  }
  
  const componentName = page.name
    .split(/\s+|\//)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("") + "Page";
  
  const body = page.elements.map(el => renderElement(el)).join("\n");
  
  const raw = `
    ${imports}
    
    export default function ${componentName}() {
      return (
        <main>
          ${body}
        </main>
      );
    }
  `;
  
  return format(raw);
}
```

#### Output path generation — handles nested routes

```typescript
// Converts page.route → file path for Next.js App Router
// Fixes the nested route gap from v0.1 (e.g. "/about/team" → "app/about/team/page.tsx")
export function routeToFilePath(route: string): string {
  if (route === "/") return "app/page.tsx";
  
  // Strip leading slash, split, reconstruct path
  const parts = route.replace(/^\//, "").split("/").filter(Boolean);
  return `app/${parts.join("/")}/page.tsx`;
}
// Examples:
// "/" → "app/page.tsx"
// "/about" → "app/about/page.tsx"
// "/about/team" → "app/about/team/page.tsx"
// "/blog/[slug]" → "app/blog/[slug]/page.tsx"
```

#### format.ts — always Prettier

```typescript
import * as prettier from "prettier";

export function format(code: string): string {
  return prettier.format(code, {
    parser:      "typescript",
    semi:        true,
    singleQuote: false,
    printWidth:  80,
    trailingComma: "es5",
  });
}
```

#### Full output structure (what gets committed to user's repo)

```
user-github-repo/
├── app/
│   ├── page.tsx                          # From page[0] (route "/")
│   ├── about/
│   │   └── page.tsx                      # From page[1] (route "/about")
│   └── layout.tsx                        # Generated once: Navbar + Footer wrapper
├── components/
│   └── blocks/                           # Block components copied from registry
│       ├── HeroSection.tsx
│       ├── Button.tsx
│       └── ...
└── project.json                          # Always committed alongside code
```

---

### 8.7 `packages/deploy`

**Purpose:** Trigger a Vercel deployment after a successful git push.

**This feature is OPTIONAL for MVP.** If the user has not connected a Vercel account, `packages/deploy` is simply not called. The `publishFiles` operation still succeeds — Vercel's own GitHub integration will auto-deploy if the user has connected their repo in Vercel directly.

**User connection flow:**
1. In project settings, user pastes their Vercel token (generated at vercel.com/account/tokens)
2. User pastes their Vercel Project ID (found in project settings)
3. These are stored encrypted in `projects.vercel_token_enc` and `projects.vercel_project_id` in Supabase

```typescript
// packages/deploy/src/vercel.ts
export async function triggerVercelDeploy(
  vercelToken: string,
  repoFullName: string,
  branch:       string
): Promise<{ deployUrl: string }> {
  const res = await fetch("https://api.vercel.com/v13/deployments", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${vercelToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name:      repoFullName.split("/")[1],
      gitSource: { type: "github", repoId: repoFullName, ref: branch },
    }),
  });
  
  if (!res.ok) {
    // Don't throw — a deploy failure should not block the publish flow
    console.error("Vercel deploy trigger failed:", await res.text());
    return { deployUrl: "" };
  }
  
  const data = await res.json();
  return { deployUrl: `https://${data.url}` };
}
```

---

## 9. `apps/studio`

### 9.1 Route structure

```
apps/studio/src/app/
│
├── (marketing)/
│   └── page.tsx                          # Landing page (public)
│
├── (auth)/
│   └── login/
│       └── page.tsx                      # GitHub OAuth entry + "Login with GitHub" button
│
├── (dashboard)/
│   ├── layout.tsx                        # Auth guard: redirect to /login if no session
│   └── projects/
│       ├── page.tsx                      # List user's GitHub repos + connected projects
│       └── connect/page.tsx             # Step-by-step repo connection flow
│
├── editor/
│   └── [projectId]/
│       ├── layout.tsx                   # Loads project from GitHub, init Craft, wrap providers
│       └── page.tsx                     # Editor workspace (Canvas + panels + topbar)
│
└── api/
    ├── auth/
    │   └── [...nextauth]/route.ts       # NextAuth GitHub provider
    ├── ai/
    │   └── route.ts                     # POST: run AI patch (server-side Anthropic call)
    ├── project/
    │   ├── [projectId]/route.ts         # GET: read project.json from GitHub
    │   └── [projectId]/publish/route.ts # POST: publish (paywall checked here)
    └── payment/
        └── webhook/route.ts             # Lemon Squeezy webhook → update Supabase tier/credits
```

### 9.2 Repo connection flow (projects/connect)

```
Step 1: "Connect a GitHub Repository"
  → GitHub OAuth (if not already logged in)
  → List user's repos via Octokit (GET /user/repos)
  → User selects a repo from the list

Step 2: System fetches repo metadata:
  → GET /repos/{owner}/{repo} → stores default_branch in Supabase
  → Attempts to read project.json:
       Found  → migrateToLatest() → display "Resume existing project"
       Not found → createDefaultProject() → display "Initialize new project"

Step 3: "Initialize" button
  → Creates project record in Supabase
  → If new: commits default project.json to GitHub via writeProject()
  → Redirects to /editor/[projectId]
```

### 9.3 Editor workspace layout

```
┌────────────────────────────────────────────────────────────────────┐
│ TOPBAR                                                             │
│ [Nova Logo] [Project Name ▾] [Page: Home ▾]  [Undo][Redo]  [Publish]│
├─────────────────┬──────────────────────────────┬───────────────────┤
│                 │                              │                   │
│  LEFT PANEL     │  CANVAS                      │  RIGHT PANEL      │
│  (280px)        │  (flex-1)                    │  (280px)          │
│                 │                              │                   │
│  Tabs:          │  Craft.js Editor area        │  Properties       │
│  [Layers][Blocks│  Live preview of the page    │  panel for        │
│  [AI Chat]      │  Click to select elements    │  selected block   │
│                 │  Drag to reorder             │                   │
│                 │  Drop from blocks panel      │  (from block's    │
│  Credits left:  │                              │  .settings.tsx)   │
│  [███░░] 18/20  │                              │                   │
└─────────────────┴──────────────────────────────┴───────────────────┘
```

### 9.4 Page management

The **"Page: Home ▾"** dropdown in the topbar:
- Lists all pages in the schema by name
- Clicking a page: switches `activePage` in `projectStore`, re-renders canvas with that page's elements
- "+ Add Page" option: opens a modal to enter page name + route, appends to schema
- Min 1 page: delete is disabled if only 1 page exists

### 9.5 Zustand stores

```typescript
// store/projectStore.ts
interface ProjectState {
  project:         Project | null;
  activePage:      string | null;      // Page ID currently shown on canvas
  isDirty:         boolean;
  isPublishing:    boolean;
  lastKnownSha:    string | null;      // SHA of project.json at last GitHub read (for conflict check)
  
  setProject:      (p: Project) => void;
  setActivePage:   (pageId: string) => void;
  updateElements:  (elements: Element[]) => void;  // Called by Craft onChange
  markClean:       () => void;
}

// store/userStore.ts  
interface UserState {
  githubLogin:     string | null;
  githubEmail:     string | null;
  tier:            "free" | "pro";
  creditsRemaining: number;
  
  setUser:         (u: Partial<UserState>) => void;
  consumeCredit:   () => void;
  refundCredit:    () => void;
}

// store/uiStore.ts
interface UIState {
  selectedNodeId:  string | null;
  leftPanelTab:    "layers" | "blocks" | "ai";
  isAIProcessing:  boolean;
  
  selectNode:      (id: string | null) => void;
  setLeftTab:      (tab: UIState["leftPanelTab"]) => void;
  setAIProcessing: (v: boolean) => void;
}
```

### 9.6 API routes

#### POST /api/ai/route.ts — AI patch (server-side)

```typescript
// Enforces: auth, credit check, runs AI, validates result, deducts credit (ADR-006)
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase-server";
import { plannerAgent } from "@studio/ai";
import { patcherAgent } from "@studio/ai";
import { applyAndValidatePatch } from "@studio/ai";

export async function POST(req: Request) {
  // 1. Auth check
  const token = await getToken({ req: req as any });
  if (!token?.githubId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  
  // 2. Credit check (before AI call to fail fast)
  const user = await supabase.getUser(token.githubId as string);
  if (user.credits_remaining <= 0) {
    return Response.json({ error: "No credits remaining" }, { status: 402 });
  }
  
  const { userMessage, currentSchema, projectId } = await req.json();
  
  try {
    // 3. Run AI
    const plan    = await plannerAgent(userMessage, JSON.stringify(currentSchema));
    const patches = await patcherAgent(plan, currentSchema);
    const newSchema = applyAndValidatePatch(currentSchema, patches); // Throws on invalid output
    
    // 4. Deduct credit ONLY on success (ADR-006)
    await supabase.deductCredit(user.id, projectId);
    
    return Response.json({ schema: newSchema, patchCount: patches.length });
    
  } catch (err: any) {
    // 5. No credit deducted on failure
    return Response.json({ error: err.message }, { status: 500 });
  }
}
```

#### POST /api/project/[projectId]/publish/route.ts — Paywall enforced here

```typescript
export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const token = await getToken({ req: req as any });
  if (!token?.githubId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  
  const user    = await supabase.getUser(token.githubId as string);
  const project = await supabase.getProject(params.projectId, user.id);
  
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
  
  const { schema, lastKnownSha } = await req.json();
  const githubToken = token.accessToken as string;
  
  // ── PAYWALL CHECK ────────────────────────────────────────────────
  // Free tier: schema-only sync (no .tsx export)
  // Pro tier: full code export
  const isPro = user.tier === "pro";
  // ────────────────────────────────────────────────────────────────
  
  // Conflict check before writing
  const hasConflict = await checkConflict({
    token:        githubToken,
    owner:        project.repo_owner,
    repo:         project.repo_name,
    branch:       project.default_branch,
    lastKnownSha: lastKnownSha,
  });
  
  if (hasConflict) {
    // Create a draft branch instead of force-pushing
    const draftBranch = `nova/draft-${Date.now()}`;
    // ... create branch + publish to it + return PR URL
    return Response.json({ conflict: true, prUrl: "..." });
  }
  
  if (isPro) {
    // Generate .tsx files
    const { generateAll } = await import("@studio/renderer");
    const files = generateAll(schema);
    
    await publishFiles({
      token:       githubToken,
      owner:       project.repo_owner,
      repo:        project.repo_name,
      branch:      project.default_branch,
      project:     schema,
      files,
      authorName:  token.githubLogin as string,
      authorEmail: token.githubEmail as string || `${token.githubLogin}@users.noreply.github.com`,
    });
    
    // Optional: trigger Vercel deploy if configured
    if (project.vercel_token_enc && project.vercel_project_id) {
      const vercelToken = decrypt(project.vercel_token_enc);
      await triggerVercelDeploy(vercelToken, project.repo_full_name, project.default_branch);
    }
    
  } else {
    // Free tier: schema only
    await writeProject({
      token:       githubToken,
      owner:       project.repo_owner,
      repo:        project.repo_name,
      branch:      project.default_branch,
      project:     schema,
      currentSha:  lastKnownSha,
      authorName:  token.githubLogin as string,
      authorEmail: token.githubEmail as string || `${token.githubLogin}@users.noreply.github.com`,
    });
  }
  
  return Response.json({ success: true });
}
```

---

## 10. Credit System

### Credit lifecycle

| Event | Delta | Timing |
|-------|-------|--------|
| Account created | +20 (free) | On first login |
| New month (free tier) | Reset to 20 | Cron job: 1st of each month |
| New month (Pro tier) | Reset to 500 | Cron job: on billing cycle date |
| Successful AI operation | -1 | After `ProjectSchema.parse()` succeeds |
| AI server error (5xx) | 0 | No deduction — ADR-006 |
| Pro subscription active | +480 (top-up to 500) | Via Lemon Squeezy webhook |
| Booster pack purchase | +100 or +200 | Via Lemon Squeezy webhook |

### Monthly credit reset (Cron)

```typescript
// apps/studio/src/app/api/cron/reset-credits/route.ts
// Called by Vercel Cron: schedule "0 0 1 * *" (1st of each month, midnight UTC)
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  await supabase.rpc("reset_monthly_credits");
  return new Response("OK");
}
```

```sql
-- Supabase stored procedure
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
  -- Free tier: reset to 20
  UPDATE users SET credits_remaining = 20
  WHERE tier = 'free' AND credits_reset_at <= NOW();
  
  -- Pro tier: reset to 500
  UPDATE users SET credits_remaining = 500
  WHERE tier = 'pro' AND credits_reset_at <= NOW();
  
  -- Advance reset date by 1 month
  UPDATE users SET credits_reset_at = NOW() + INTERVAL '1 month'
  WHERE credits_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;
```

### What "1 AI credit" costs internally

| Model | Avg tokens (in+out) | Cost/credit |
|-------|---------------------|-------------|
| claude-haiku (planner) | ~1000 in + 200 out | ~$0.0002 |
| claude-sonnet (patcher) | ~2500 in + 500 out | ~$0.009 |
| Blended per operation | | **~$0.005–$0.01** |

**Selling price of 1 credit:** ~$0.05 (Global). Gross margin: **~80-90%**.

---

## 11. Paywall Enforcement

**The paywall is enforced exclusively server-side in `POST /api/project/[projectId]/publish/route.ts`.**  
Client-side UI only hides the "Export Code" option visually — it is not the security boundary.

| Feature | Free | Pro | Where enforced |
|---------|------|-----|----------------|
| Visual editor (drag-drop) | ✅ | ✅ | n/a (client-side only, no server cost) |
| AI patches | ✅ (20/mo) | ✅ (500/mo) | `/api/ai` — credit check before call |
| Schema-only git sync | ✅ | ✅ | `/api/project/publish` — writes `project.json` only |
| `.tsx` code export | ❌ | ✅ | `/api/project/publish` — checks `user.tier === "pro"` |
| Vercel auto-deploy trigger | ❌ | ✅ | Same route — only runs if isPro |

**Why this is secure:** GitHub tokens never reach the browser (ADR-003). Publish actions are API calls to our server. The server checks `user.tier` from Supabase before running any Pro logic. There is no browser-accessible code path to trigger `publishFiles()` directly.

---

## 12. Anti-Abuse

### Free tier abuse prevention (fake account spam)

**Problem:** Users create multiple free GitHub accounts to get infinite 20-credit batches.

**Solution:** On first login, check the GitHub account's creation date.

```typescript
// In NextAuth jwt() callback
const accountCreatedAt = new Date(profile?.created_at as string);
const ageInDays = (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24);

// In upsertUser():
const initialCredits = ageInDays < 30 ? 5 : 20;
// New accounts (<30 days old) get 5 credits, not 20
```

**Rate limiting:** Max 10 AI requests per user per minute.

```typescript
// Middleware check in /api/ai/route.ts
// Uses Supabase to count recent calls
const recentCalls = await supabase
  .from("credit_transactions")
  .select("id", { count: "exact" })
  .eq("user_id", user.id)
  .eq("reason", "ai_operation")
  .gte("created_at", new Date(Date.now() - 60_000).toISOString());

if (recentCalls.count >= 10) {
  return Response.json({ error: "Rate limit exceeded. Max 10 AI calls per minute." }, { status: 429 });
}
```

---

## 13. Environment Variables

**Three environments:**

| Variable | Dev (localhost) | Preview (Vercel branch) | Production |
|----------|-----------------|------------------------|------------|
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://{branch}.nova.vercel.app` | `https://nova.app` |
| `NEXTAUTH_SECRET` | any 32-char random | same as prod | same as prod |
| `GITHUB_CLIENT_ID` | Nova (Local) OAuth App | Nova (Preview) OAuth App | Nova (Prod) OAuth App |
| `GITHUB_CLIENT_SECRET` | Nova (Local) secret | Nova (Preview) secret | Nova (Prod) secret |
| `ANTHROPIC_API_KEY` | your dev key | same as prod | same as prod |
| `SUPABASE_URL` | dev project URL | same as prod | same as prod |
| `SUPABASE_SERVICE_KEY` | dev service role key | same as prod | same as prod |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | test secret | same as prod | same as prod |
| `ENCRYPTION_KEY` | 32-char hex key | same as prod | same as prod |
| `CRON_SECRET` | any random string | same as prod | same as prod |
| `NEXT_PUBLIC_APP_ENV` | `development` | `preview` | `production` |

**`.env.local` template (commit this as `.env.example`, gitignore the real file):**

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# GitHub OAuth — create at github.com/settings/developers
# Name: "Nova Studio (Local)" | Callback: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=

# Supabase — server-side only, never expose to browser
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Payments
LEMONSQUEEZY_WEBHOOK_SECRET=

# Encryption key for storing GitHub/Vercel tokens in Supabase (32-char hex)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=

# Cron security
CRON_SECRET=

# Feature flags
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_MAX_FREE_CREDITS=20
```

**GitHub OAuth App setup — create 3 apps:**

| App Name | Callback URL |
|----------|-------------|
| Nova Studio (Local) | `http://localhost:3000/api/auth/callback/github` |
| Nova Studio (Preview) | `https://*.nova.vercel.app/api/auth/callback/github` |
| Nova Studio (Prod) | `https://nova.app/api/auth/callback/github` |

---

## 14. TypeScript & Build Config

### tsconfig.base.json (root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@studio/schema":   ["packages/schema/src/index.ts"],
      "@studio/registry": ["packages/registry/src/index.ts"],
      "@studio/ai":       ["packages/ai/src/index.ts"],
      "@studio/git":      ["packages/git/src/index.ts"],
      "@studio/renderer": ["packages/renderer/src/index.ts"],
      "@studio/editor":   ["packages/editor/src/index.ts"]
    }
  }
}
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {},
    "test": {
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 15. Testing Strategy

**Rule:** Tests are required for logic packages. No tests for UI components at MVP.

| Package | Required tests | Why |
|---------|---------------|-----|
| `packages/schema` | ✅ Unit | Migrations must be deterministic and correct |
| `packages/ai` | ✅ Unit | JSON Patch application must be reliable |
| `packages/git` | ✅ Unit (mocked Octokit) | Conflict detection, path generation |
| `packages/renderer` | ✅ Unit | JSX prop rendering, route-to-path conversion |
| `packages/registry` | ⚠️ Smoke only | Verify each block exports the correct shape |
| `packages/editor` | ❌ Skip | Craft.js is hard to unit test; covered by E2E |
| `apps/studio` | ❌ Skip for MVP | E2E too slow; manual QA for now |

**Test framework:** Vitest (faster than Jest, native ESM support).

```bash
# Run all tests
pnpm test

# Run specific package
pnpm --filter @studio/schema test
```

**Minimum test cases for `packages/schema`:**

```typescript
// packages/schema/src/migrations/runner.test.ts
describe("migrateToLatest", () => {
  it("passes valid v1.0 schema through unchanged", () => { ... });
  it("converts old integer-version schema to v1.0", () => { ... });
  it("throws on unknown version with no migration path", () => { ... });
});

describe("ElementSchema", () => {
  it("validates a valid element", () => { ... });
  it("rejects element with function as prop value", () => { ... });
  it("rejects element with invalid ID format", () => { ... });
  it("validates deeply nested children", () => { ... });
});
```

---

## 16. CI/CD

### GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      
      - run: pnpm install --frozen-lockfile
      
      - name: Typecheck
        run: pnpm turbo typecheck
      
      - name: Lint
        run: pnpm turbo lint
      
      - name: Test
        run: pnpm turbo test
```

### Vercel deployment

- **Production:** Auto-deploys on push to `main`
- **Preview:** Auto-deploys on every PR (each PR gets a unique preview URL)
- **Configuration:** Zero config — Vercel auto-detects Turborepo + Next.js

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reset-credits",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

---

## 17. Business Model & Pricing

### Tier structure

| Feature | Free | Pro |
|---------|------|-----|
| Visual editor (drag-drop) | ✅ Unlimited | ✅ Unlimited |
| AI credits / month | 20 | 500 |
| Schema Git sync (`project.json` only) | ✅ | ✅ |
| Export `.tsx` code | ❌ | ✅ |
| Vercel auto-deploy trigger | ❌ | ✅ |

### Pricing

| Market | Free | Pro/month |
|--------|------|-----------|
| Global | $0 | $29 |
| Vietnam (PPP) | 0đ | 299,000đ |

### Credit top-up packs (one-time, no expiry)

| Pack | Global | Vietnam | Internal cost | Margin |
|------|--------|---------|--------------|--------|
| Booster 100 | $5 | 49,000đ | ~$0.50 | ~90% |
| Booster 200 | $9 | 89,000đ | ~$1.00 | ~89% |
| Booster 500 | $19 | 189,000đ | ~$2.50 | ~87% |

### Payment infrastructure

**Use Lemon Squeezy — never Stripe directly for MVP:**
- Merchant of Record: handles global VAT/GST automatically
- PPP discounts applied automatically based on IP country
- Webhook events: `subscription_created`, `subscription_updated`, `order_created`
- Webhook handler at `/api/payment/webhook` updates Supabase `users.tier` and `credits_remaining`

---

## 18. Reference Repositories (Snipe Map)

Targeted patterns to study — never clone wholesale.

| Package | Repo | Exact path | What to extract |
|---------|------|------------|-----------------|
| `packages/registry` | `BuilderIO/builder` | `packages/react/src/blocks/` | `Builder.registerComponent` pattern with typed inputs array |
| `packages/schema` | `webstudio-is/webstudio` | `packages/project/src/` | Zod-based tree node schema with recursive types |
| `packages/ai` | `All-Hands-AI/OpenHands` | `openhands/agenthub/*.prompt` | System prompt structure that enforces JSON-only output |
| `packages/editor` | `prevwong/craft.js` | `packages/core/src/editor/`, `useNode.ts` | Internal SerializedNodes model before forking |
| `packages/renderer` | `BuilderIO/mitosis` | `packages/core/src/generators/react/` | How to generate clean JSX from a tree structure |
| `packages/git` | `octokit/octokit.js` | `README.md` examples | GitHub Trees API multi-file commit pattern |

**Do NOT copy from these repos:**

| Repo | What to avoid |
|------|---------------|
| `webstudio-is/webstudio` | Their canvas system, CSS property editor, hosting logic |
| `All-Hands-AI/OpenHands` | Agent orchestration, sandboxed execution, Docker setup |
| `BuilderIO/builder` | Visual editor UI, CDN layer, enterprise feature flags |

---

## 19. Risk Register

All risks have explicit mitigations. No "monitor and hope."

| Risk | Severity | Mitigation |
|------|----------|------------|
| **AI produces invalid JSON Patch** | High | Zod validates after patch. Retry up to 3× with error context in prompt. After 3× failure: return error to user, deduct 0 credits. |
| **Remote branch conflict on publish** | High | `checkConflict()` before every write. On conflict: auto-create `nova/draft-{ts}` branch, return PR URL to user. Never force-push. |
| **GitHub token compromise via XSS** | Critical | Token never reaches browser (ADR-003). CSP headers block inline scripts. All git via server API routes only. |
| **Craft.js render loop** | High | `isApplyingExternalPatch` flag in `CraftProvider.tsx`. External patches go through `applySchemaToCanvas()` which sets the flag. Canvas `onChange` skips when flag is true. |
| **Component registry growth slows down** | Medium | `pnpm nova:generate-block` CLI creates all 4 files from templates. Without this tool, each new block takes 2+ hours. Build the CLI before building blocks 6–10. |
| **Free tier credit abuse** | Medium | GitHub account age check (<30 days → 5 credits). Rate limit: 10 AI calls/min/user. IP-level rate limiting via Vercel Edge middleware for future phase. |
| **Supabase service key exposed** | Critical | `SUPABASE_SERVICE_KEY` is server-only env var. Never in `NEXT_PUBLIC_*` vars. Never imported in client components. Enforce via ESLint rule. |
| **Large repo causes GitHub API timeout** | Low | `readProject()` reads only `project.json` (single file), not the full repo. No clone. Timeout risk is near-zero. |
| **Vercel deploy trigger fails** | Low | `triggerVercelDeploy()` logs the error but does NOT throw. Publish succeeds regardless. User sees "Deployed" status; Vercel may auto-deploy from its own GitHub integration anyway. |
| **props type drift (AI sets invalid types)** | Medium | `PropsSchema = z.record(SerializableValueSchema)` rejects functions, undefined, class instances. AI's JSON output cannot produce non-serializable values by definition. |

---

## 20. Launch Roadmap

### Phase 1 — Foundation (Weeks 1–4)
- [ ] Set up Turborepo + pnpm workspace (root config, `tsconfig.base.json`)
- [ ] `packages/schema`: Zod schemas, ID generators, migration runner, defaults factory
- [ ] `packages/schema`: Unit tests (migration, validation, ID format)
- [ ] `packages/registry`: First 5 blocks with CLI generator tool (HeroSection, Button, Text, Section, Navbar)
- [ ] `packages/git`: Octokit wrappers for read/write/conflict-check
- [ ] Add .gitignore

### Phase 2 — Editor Core (Weeks 5–8)
- [ ] Fork Craft.js into `packages/editor`
- [ ] `schemaToNodes()` + `nodesToSchema()` adapters
- [ ] `CraftProvider` with render-loop guard
- [ ] Draft auto-save + recovery (localForage + debounce)
- [ ] Undo/Redo history store
- [ ] `apps/studio`: GitHub OAuth (NextAuth), Supabase upsert on first login
- [ ] `apps/studio`: Repo connection flow (`/projects/connect`)
- [ ] `apps/studio`: Editor layout (Canvas + panels + topbar)

### Phase 3 — AI Co-pilot (Weeks 9–12)
- [x] `packages/ai`: provider interface (ADR-011) + Anthropic / OpenAI / Gemini adapters
- [x] `packages/ai`: plannerAgent + patcherAgent (provider-agnostic) + applyAndValidatePatch
- [x] `POST /api/ai/route.ts`: server proxy, credit check, rate limit, deduction, provider routing
- [x] AI chat panel in left panel with provider selector (Claude / GPT / Gemini)
- [x] Credit display in editor topbar
- [x] `POST /api/payment/webhook/route.ts`: Lemon Squeezy → Supabase tier/credits update

**Environment variables added for Phase 3:**
- `AI_PROVIDER` — default provider: `anthropic` | `openai` | `google` (default: `anthropic`)
- `OPENAI_API_KEY` — required if `AI_PROVIDER=openai` or user selects OpenAI in UI
- `GOOGLE_GENERATIVE_AI_API_KEY` — required if `AI_PROVIDER=google` or user selects Gemini

### Phase 4 — Export & Publish (Weeks 13–16)
- [x] `packages/renderer`: pageFile generator, propsToJSX, layoutFile, Prettier format (async)
- [x] `POST /api/project/[id]/publish/route.ts`: paywall check, conflict check, git publish
- [x] Conflict resolution → draft branch → PR URL display
- [ ] `packages/deploy`: Vercel deploy trigger (optional — gated by user setting, deferred)
- [x] Remaining 5 registry blocks (Footer, FeatureCard, PricingCard, Column, Image)
- [x] Lemon Squeezy checkout link (Free → Pro upgrade button in editor TopBar; `buildCheckoutUrl` embeds github_id for the webhook)

**Notes:**
- `generateAll(schema)` is async (Prettier v3 format() is async). Publish route updated to `await generateAll(schema)`.
- Block component sources embedded as string constants in `packages/renderer/src/blocks/sources.ts` — no runtime fs access required, works in Vercel serverless.
- `components/blocks/{Type}.tsx` files generated alongside page files; user's project needs `tailwindcss` configured.

### Phase 5 — GTM (Weeks 17–20)
- [x] Polish: editor loading state + load-failure error screen (Retry / Back to projects)
- [x] Monthly credit reset cron job — `GET /api/cron/reset-credits` (Bearer `CRON_SECRET`) → `reset_monthly_credits()` RPC; scheduled daily in `apps/studio/vercel.json` (idempotent — only refills users past `credits_reset_at`)
- [x] Anti-abuse: account age check (`upsertUser`, Phase 2) + per-user rate limit (10 AI ops/min, `/api/ai`, Phase 3)
- [ ] IP-level rate limiting via Vercel Edge middleware (deferred per §12 — future phase)
- [ ] Soft launch: Vietnamese developer communities (tặng 3 months Pro for feedback)
- [ ] Hard launch: Product Hunt + Hacker News + X

**Database:** All tables, RLS, and the `deduct_credit` / `reset_monthly_credits` RPCs are committed in `supabase/migrations/0001_init.sql`. `deduct_credit` writes a `reason='ai_operation'` row — the per-minute rate limiter in `/api/ai` counts those, so the two are coupled by contract; do not change that reason without updating the limiter.

**Env vars added in Phase 5:**
- `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL` — hosted checkout URL for the upgrade button
- `CRON_SECRET` — already listed in §13; now consumed by the credit-reset cron route

---

## Appendix: The first file to write

Every other package depends on the schema. Before touching `apps/studio` or `packages/editor`, the schema must compile without errors.

```typescript
// FILE: packages/schema/src/schemas/element.schema.ts
// This is the schema for a single node in the page tree.
// Everything else in the system exists to read, display, or modify values 
// that conform to this shape.

import { z } from "zod";

const SerializableLeaf = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const PropsSchema = z.record(z.union([
  SerializableLeaf,
  z.array(SerializableLeaf),
  z.record(SerializableLeaf),
]));

export type Element = {
  id:       string;
  type:     string;
  props:    Record<string, unknown>;
  children: Element[];
};

export const ElementSchema: z.ZodType<Element> = z.lazy(() =>
  z.object({
    id:       z.string().regex(/^node_[A-Za-z0-9_-]{8}$/),
    type:     z.string().min(1),
    props:    PropsSchema,
    children: z.array(ElementSchema),
  })
);

// Verify the recursive type resolves at runtime:
// ElementSchema.parse({ id: "node_aB3kR7mN", type: "HeroSection", props: { title: "Hi" }, children: [] })
// → Should not throw.
```

Once this file compiles and its unit tests pass, proceed to `packages/registry`, then `packages/editor`, then `apps/studio`. Never build in the reverse order.