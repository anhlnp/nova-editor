# Nova — AI Architecture Decisions

**Status:** Current as of v1.4. Deep-dive on the AI subsystem; pricing numbers are owned by [`pricing-policy.md`](pricing-policy.md), not here.

---

## 1. Provider Abstraction

Every AI provider implements the `AIProvider` interface (`packages/ai/src/providers/base.ts`):

```typescript
interface AIProvider {
  readonly id: ProviderName;
  readonly name: string;
  complete(messages: AIMessage[], opts: CompleteOptions): Promise<string>;
}
```

The factory `getProvider(name)` resolves the `AI_PROVIDER` env var to a concrete class. Adding a new provider is one file + one line in `registry.ts`.

### Supported providers

| ID | Class | SDK | Free tier |
|---|---|---|---|
| `anthropic` | `AnthropicProvider` | `@anthropic-ai/sdk` (native) | ❌ paid |
| `openai` | `OpenAIProvider` | `openai` (native) | ❌ paid |
| `google` | `GoogleProvider` | `@google/generative-ai` (native) | ✅ AI Studio key |
| `groq` | `GroqProvider` | `openai` (custom baseURL) | ✅ no CC |
| `openrouter` | `OpenRouterProvider` | `openai` (custom baseURL) | ✅ `:free` models |
| `mistral` | `MistralProvider` | `openai` (custom baseURL) | ✅ open models |

Groq, OpenRouter, and Mistral reuse the `openai` npm package by overriding `baseURL` — no extra dependency.

### Model choices per provider

| Provider | Planner model (fast) | Patcher model (capable) |
|---|---|---|
| Anthropic | `claude-haiku-4-5-20251001` | `claude-sonnet-4-6` |
| OpenAI | `gpt-4o-mini` | `gpt-4o` |
| Google | `gemini-2.5-flash` | `gemini-2.5-pro` |
| Groq | `llama-3.1-8b-instant` | `llama-3.3-70b-versatile` |
| OpenRouter | `meta-llama/llama-3.1-8b-instruct:free` | `google/gemma-3-27b-it:free` |
| Mistral | `open-mistral-7b` | `open-mixtral-8x7b` |

**Planner**: cheap, fast — translates user message into a structured plan array. Max 500 tokens output.
**Patcher**: capable — translates plan + schema context into RFC 6902 JSON Patch operations.

---

## 2. Two-Agent Pipeline

```
User message
    │
    ▼
plannerAgent(provider, userMessage, schemaContext + historyContext)
    │  → PlanStep[] = [{ action, target, value }, ...]
    │
    ▼
patcherAgent(provider, registryHints, plan, currentSchema)
    │  → JSON Patch operations (RFC 6902)
    │
    ▼
applyAndValidatePatch(currentSchema, patches)
    │  → ProjectSchema.parse() — throws on invalid AI output
    │
    ▼
New schema committed to store
```

**Why two agents?**
- Planner uses the cheapest model — most user requests need only 3–5 plan steps
- Patcher uses the capable model — it must generate valid JSON paths and types
- Splitting keeps cost low: 80% of the token budget goes to patcher, only 20% to planner
- Planner failure is non-fatal (returns empty plan; patcher still runs)

**Server-safe import boundary:**
The AI route imports `buildAIHints()` from `@studio/registry/ai` (not `@studio/registry`). The `/ai` sub-path only imports `.ai.ts` files — zero React hooks. The full registry (settings, components) stays client-side only.

---

## 3. Credit System

> **Numbers live in code + DB, not here** (prior duplication drifted out of sync). Authoritative sources:
> - Per-op cost: `PROVIDER_CREDIT_COST` in `packages/ai/src/providers/base.ts` — currently **anthropic 12 · openai 8 · google 6 · groq/openrouter/mistral 1** (free providers' `1` is rate-limit only).
> - Monthly allowance / refill: `reset_monthly_credits()` in `supabase/migrations/0004_credit_allowances.sql` — **free 200 · pro 4000 · max 15000 · team 5000**.
> - Pricing policy, rationale, planned tiers, top-ups: [`pricing-policy.md`](pricing-policy.md) (the single owner).

Mechanism (stable): credits are a metered usage unit; deducted only after a valid schema (ADR-006); Pro skips deduction entirely (UI shows "unlimited").

### Credit flow

```
POST /api/ai
  1. Check user.tier === "free" AND credits_remaining >= creditCost  [402 if not]
  2. Rate-limit: max 10 ops/minute via credit_transactions table    [429 if exceeded]
  3. Run planner → patcher → applyAndValidatePatch
  4. On success: deduct_credit(userId, projectId, creditCost)       [SQL RPC, atomic]
  5. On failure: no deduction (ADR-006)
```

The `deduct_credit` SQL function is atomic — it updates `users.credits_remaining` and inserts into `credit_transactions` in a single transaction. The `credit_transactions` table also drives the per-minute rate limiter (counts `ai_operation` rows in the last 60s).

---

## 4. Conversation Model

### Design decision: per-project multi-conversations

The AI chat UI works like a proper chatbot (ChatGPT / Claude) — users can have multiple independent threads within a project. Each project has its own conversation list, sorted by last activity.

**Alternatives considered:**
- **Single global thread per user**: Confusing when switching projects — the AI has context from a different codebase.
- **Single thread per project**: Simple, but users can't try different approaches in isolation.
- **Per-project multi-conversations** ✅: Chosen. Clean UX — each project is self-contained; users can experiment freely.

### Database schema

```sql
-- One conversation = one thread within a project
create table ai_conversations (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  user_id      uuid not null references users(id) on delete cascade,
  title        text not null default 'New conversation',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Messages are scoped to a conversation
create table ai_messages (
  id              uuid primary key,
  conversation_id uuid references ai_conversations(id) on delete cascade,
  project_id      uuid references projects(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  role            text not null,      -- 'user' | 'assistant'
  content         text not null,
  provider        text,               -- provider id (assistant messages)
  credits_used    integer,            -- credits deducted (0 for free providers)
  created_at      timestamptz not null
);

-- Auto-bump updated_at on every new message
create trigger touch_ai_conversation
  after insert on ai_messages for each row
  execute function touch_conversation_updated_at();
```

The `updated_at` trigger means the conversation list stays sorted by last activity with no app-level update needed.

### Lazy conversation creation

Conversations are **not** created when the user clicks "New conversation" — only when they send the first message. The client sends `conversationId: null` on first send; the server auto-creates the conversation (using the first message as the title) and returns `conversationId` in the response. Subsequent messages in the same chat include the resolved ID.

This prevents orphan conversations from users who open a new chat and close the panel without typing.

### API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/ai/conversations` | `GET` | List conversations for a project (`?projectId=`) |
| `/api/ai/conversations` | `POST` | Create a named conversation (manual create, not needed for lazy flow) |
| `/api/ai/conversations/[id]` | `DELETE` | Delete conversation + cascade messages |
| `/api/ai/messages` | `GET` | Fetch messages for a conversation (`?conversationId=`) |
| `/api/ai` | `POST` | Run AI operation; auto-creates conversation if `conversationId` is null |

### UI: two-view drill-down

The AI panel has two views:

1. **Conversation list** (default): All conversations for the project, sorted by `updated_at desc`. "New conversation" button + per-item delete.
2. **Chat view**: Back button + conversation title + provider selector + message history + input. Navigated to by clicking a conversation or sending the first message in a new thread.

The list re-fetches from the server when the user navigates back, so new conversations appear immediately.

### Multi-turn context window

The last 20 messages from the active conversation are included in the planner prompt as plain text:
```
Recent conversation:
User: Make the hero dark blue
AI: Applied 2 change(s): /pages/0/elements/0/props/bgColor, ...
User: Now add a CTA button below
```

Only the last 20 messages are sent to keep token usage bounded. The full history is available in the UI for the user to scroll.

---

## 5. Security Boundaries

**`@studio/registry/ai` sub-path**: Server-safe. Only imports `.ai.ts` files (pure strings). The main `@studio/registry` entry point imports React components and must never be used in API routes.

**`@/lib/supabase-server`**: Server-only. Uses the Supabase service role key — never import in client components. `SUPABASE_SERVICE_KEY` is not prefixed with `NEXT_PUBLIC_` and is never sent to the browser.

**Credit deduction**: Only happens after `ProjectSchema.parse()` succeeds (ADR-006). Failed AI operations don't cost the user anything.

**Rate limiting**: 10 AI ops/minute per user, enforced server-side via `credit_transactions` table. Client-side UI guards are UX-only and not a security boundary.

---

## 6. Open Questions / Future Work

- **Token-level credit tracking**: Currently credits are flat per-operation. A proper implementation would count actual input+output tokens and cost based on exact token price per model. Requires model-specific token counting (each provider SDK exposes usage in the response).

- **Streaming**: Currently the patcher waits for the full response. Streaming would let the UI show incremental output. Requires changes to the `AIProvider.complete()` interface (add `stream()` method) and SSE on the route.

- **Conversation branching**: The current model is a linear thread per project. Users might want to branch ("try this instead"). Not planned.

- **AI message search**: No search over chat history. Low priority until history grows long.
