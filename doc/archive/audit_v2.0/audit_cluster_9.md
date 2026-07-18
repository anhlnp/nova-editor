# EXHAUSTIVE Audit Report - Cluster 9: API & Integration Infrastructure

This cluster governs the backend API routes, third-party deployments (Vercel), and security policies (Rate Limiting, Auth). The audit reveals critical financial vulnerabilities where a malicious user could drain the operator's AI budget.

---

## 1. Comprehensive Issue Identification

### A. The "Trailing" Rate Limit Vulnerability (Race Condition)
1. **The Flaw:** In `apps/studio/src/app/api/ai/route.ts`, the rate limit (max 10 operations/min) is enforced by counting rows in the Supabase `credit_transactions` table. However, the system only inserts a row into this table *after* the AI operation finishes successfully (which takes 10–30 seconds). 
2. **The Consequence:** Because the check happens before the operation, but the logging happens after, a user can fire 100 concurrent requests to `/api/ai`. Since none have finished yet, the database shows 0 transactions. All 100 requests will bypass the rate limit, hitting the LLM API concurrently and instantly draining the platform's API credits.

### B. The "Unlimited Tier" Infinite DDoS Bug
1. **The Flaw:** For users on "Unlimited AI" tiers (e.g., `max` or `team`), the API skips the `deductCredit()` function entirely (Step 10 in `ai/route.ts`).
2. **The Consequence:** Since `deductCredit()` is the exact function responsible for inserting rows into the `credit_transactions` table, Unlimited users *never* generate transaction rows. Because the rate limiter relies on counting these rows, **Unlimited users are completely immune to rate limiting**. An unlimited user could run a script to send 10,000 requests per minute, costing the operator thousands of dollars in Anthropic/OpenAI bills in a single day.

### C. The Redundant Vercel "Double Build"
1. **The Flaw:** In `packages/deploy/src/vercel.ts`, the platform manually calls the Vercel REST API to trigger a deployment (`https://api.vercel.com/v13/deployments`) pointing to the GitHub repository branch.
2. **The Consequence:** Vercel natively monitors connected GitHub repositories via webhooks. When `publishFiles.ts` commits code to GitHub, GitHub automatically pings Vercel, which starts a deployment. By manually triggering the Vercel API immediately after the Git push, Nova forces Vercel to queue a **second, duplicate build** for the exact same commit. This wastes the user's Vercel build minutes (which are strictly capped on Vercel's Hobby/Pro plans).

---

## 2. Architectural Decisions & Recommendations

The current backend relies too heavily on Supabase for transient state (rate limits) and misunderstands Vercel's native Git integrations.

### Issue A & B: Financial Vulnerabilities in AI Routing
**Option A: Fix the Database Logic**
- **Concept:** Insert a "pending" transaction row *before* calling the AI, and update its status to "completed" afterward. Ensure Unlimited users also generate "0-cost" transaction rows so the rate limit query can count them.
- **Pros:** Keeps all logic inside Supabase without adding new infrastructure.
- **Cons:** Supabase/PostgreSQL is too slow for high-concurrency rate limiting and will still suffer from microsecond race conditions.

**Option B: Edge-based Rate Limiting (Redis / Upstash)**
- **Concept:** Move rate limiting out of PostgreSQL entirely. Use `@upstash/ratelimit` or Vercel KV at the Edge middleware layer to block requests *before* they even hit the Next.js API route. Use the `userId` as the token bucket key.
- **Pros:** 100% immune to race conditions. Instantly blocks DDoS attempts. Protects the PostgreSQL database from connection exhaustion.
- **Cons:** Requires provisioning an Upstash Redis database.

🏆 **Recommendation for v2.0:** **Option B**. API rate limiting must always happen at the Edge via Redis, never via a trailing SQL `COUNT()` query. 

### Issue C: Redundant Deployments
**Option A: Delete `triggerVercelDeploy`**
- **Concept:** Rely entirely on Vercel's native GitHub integration. When Nova pushes to GitHub, Vercel handles the rest automatically.
- **Pros:** Zero code to maintain. No double-builds.
- **Cons:** The Nova UI won't immediately get a `deployUrl` returned from the API; it will have to poll GitHub deployment statuses or instruct the user to check Vercel.

**Option B: Use Vercel Deploy Hooks (Webhooks)**
- **Concept:** Instead of using the heavy Vercel REST API, provide a text input in the Nova UI for a "Vercel Deploy Hook URL". When publishing, Nova just POSTs to that URL. Disable Vercel's automatic Git integration.
- **Pros:** Full control over when builds happen.
- **Cons:** More setup required from the end user.

🏆 **Recommendation for v2.0:** **Option A**. The magic of modern frameworks is native Git integration. Let GitHub and Vercel handle the CI/CD pipeline natively. Just push the code and trust the webhook.
