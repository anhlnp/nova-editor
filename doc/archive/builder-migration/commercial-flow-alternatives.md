# Nova — Ideal Commercial Flow & Alternatives

> **Why this doc.** The startup review (2026-06-29) asked: *what does the ideal commercial flow look
> like, with as many alternatives as possible, free + commercial-friendly* (e.g. **no forced GitHub
> login**) — spelled out clearly like webstudio's docs.
>
> **Guiding principle (the fix for "GitHub scares users"):**
> **GitHub is OPTIONAL — an opt-in "eject/own-your-code" path, NEVER the entry gate.**
> Default path = managed cloud, free tier, email/Google/anonymous auth. This is exactly webstudio's
> model: every project gets a free `*.wstd.io` subdomain and is deployed to Cloudflare edge *for* the
> user; GitHub appears only under **Self-Hosting/Export**.

---

## The ideal commercial happy-path

```
 Land ─▶ Describe (prompt / NL template)  ◀── INPUT (no login)
   └─▶ AI composes from REGISTERED blocks/styles (transparent: "supported ✓ / coming ⏳")
        └─▶ Edit & refine (visual editor, no-login playground — like craft.js demo site)
             └─▶ Save  ── email / Google / magic-link / "continue as guest" (NO GitHub)
                  └─▶ Share preview  ── free subdomain  yoursite.nova.app  (password-optional)
                       └─▶ Publish  ── managed deploy (Cloudflare/Vercel via NOVA's account)  🔒 login-gated
                            └─▶ Custom domain  ── CNAME + auto-DNS (Entri)
                                 └─▶ Grow  ── forms/CTA · CMS/data · analytics
                                      └─▶ (optional) Eject  ── ZIP / your GitHub / your Vercel  ◀── OWN YOUR CODE
```

Two-track rule: **Track A (default, non-technical/commercial):** managed cloud, no GitHub, ever.
**Track B (opt-in, developers):** export/eject to own infra (this is where GitHub lives — by choice).

---

## Stage-by-stage alternatives

Legend: **★** = recommended default · **Free** = usable free tier · **No-GH** = no GitHub login needed.

### 1. Auth / Account (the entry — must NOT force GitHub)
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ Supabase Auth** (email magic-link + Google) | ✓ | ✓ | free tier, also gives DB+storage in one |
| Clerk | ✓ (10k MAU) | ✓ | best DX, drop-in UI |
| Auth.js / NextAuth (email/Google/credentials) | ✓ | ✓ | already in nova for GitHub — add email/Google providers |
| Firebase Auth | ✓ | ✓ | |
| Better-Auth / Lucia (self-host) | ✓ | ✓ | full control |
| WorkOS / Stytch | ✓ tier | ✓ | enterprise SSO later |
| **Guest / anonymous** | ✓ | ✓ | edit with no account; upgrade to save (key for demo) |

### 2. Project storage (the Document / project.json)
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ IndexedDB (local-first)** | ✓ | ✓ | already in nova; the no-login playground store |
| **★ Supabase Postgres** | ✓ 500MB | ✓ | cloud sync for logged-in users |
| Cloudflare D1 (SQLite) | ✓ | ✓ | pairs with Workers deploy |
| Turso (libSQL) | ✓ | ✓ | edge SQLite, generous free |
| Neon (Postgres) | ✓ | ✓ | serverless Postgres |
| Firebase Firestore | ✓ | ✓ | realtime doc store |
| PocketBase / Appwrite (self-host) | ✓ | ✓ | DB+auth+storage in one binary |
| MongoDB Atlas | ✓ 512MB | ✓ | document model fits Element tree |
| *(current)* GitHub `project.json` | ✓ | ✗ | → demote to **Track B eject only** |

### 3. Sync (local ↔ cloud, multi-device, future collab)
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ IndexedDB + debounced snapshot → Supabase** | ✓ | ✓ | simplest; matches nova's draft model |
| Liveblocks | ✓ tier | ✓ | real-time multiplayer, presence |
| PartyKit (Cloudflare) | ✓ | ✓ | cheap realtime rooms |
| Yjs + y-websocket / y-supabase | ✓ | ✓ | CRDT (webstudio uses immerhin-style sync) |
| Convex | ✓ | ✓ | reactive backend, sync built-in |
| ElectricSQL / Replicache | ✓ tier | ✓ | local-first sync engines |

### 4. Assets / media
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ Cloudflare R2** | ✓ 10GB, no egress fee | ✓ | nova already references R2 |
| Supabase Storage | ✓ 1GB | ✓ | one vendor with auth+DB |
| UploadThing | ✓ tier | ✓ | easiest DX for uploads |
| Cloudinary / ImageKit | ✓ | ✓ | transforms + CDN |
| Bunny.net / Backblaze B2 | cheap | ✓ | low-cost CDN/storage |

### 5. Preview / staging (shareable link)
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ Free subdomain** `name.nova.app` (per project) | ✓ | ✓ | webstudio's wstd.io model; password-optional |
| Host preview URL (Cloudflare Pages / Vercel preview) | ✓ | ✓ | auto preview per deploy |

### 6. Publish / deploy — **managed, no user GitHub** (Track A)
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ Cloudflare Workers/Pages via NOVA's account** | ✓ | ✓ | webstudio's exact model; nova already has CF deploy (ADR-033) |
| Vercel via NOVA's account (deploy API/token) | ✓ tier | ✓ | no user GitHub; nova deploys for them |
| Netlify via API (direct file push / "drop") | ✓ | ✓ | no Git needed |
| **Eject options (Track B, opt-in):** ZIP download · your Vercel · your Netlify · your Cloudflare · **your GitHub** · GitHub Pages · VPS/Docker/Coolify | ✓ | (GH = opt-in) | mirrors webstudio Self-Hosting list |

### 7. Custom domain
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ Free subdomain default** + custom via CNAME/TXT | ✓ | ✓ | |
| Entri (auto-DNS, in-app) | ✓ | ✓ | webstudio uses it — "configure automatically" |
| Cloudflare for SaaS (custom hostnames) | ✓ tier | ✓ | scale to many client domains (agencies) |

### 8. Forms / CTA backend (the "CTA" output)
| Option | Free | No-GH | Note |
|---|---|---|---|
| **★ Built-in endpoint → Supabase + email notify** | ✓ | ✓ | owns the data, on-brand |
| Web3Forms | ✓ (no account) | ✓ | dead-simple |
| Formspree / Basin / Getform / Formspark | ✓ tier | ✓ | |
| Tally / Typeform embed | ✓ | ✓ | richer forms |

### 9. Data / CMS (dynamic content — deferred pillar; list per webstudio)
| Option | Free | No-GH | Note |
|---|---|---|---|
| Airtable / Baserow(OSS) / NocoDB | ✓ | ✓ | webstudio integrates these |
| Notion (as CMS) | ✓ | ✓ | |
| Supabase (tables as CMS) | ✓ | ✓ | one-vendor |
| Sanity / Hygraph / Flotiq / Contentful | ✓ tier | ✓ | headless CMS |
| Strapi / Directus (self-host) | ✓ | ✓ | own it |
| WordPress (headless) | ✓ | ✓ | migrate existing content |

### 10. Automation / integration
Zapier · Make · **n8n (self-host, free)** · Pabbly — all webhook-based, no GitHub.

### 11. Analytics
**Cloudflare Web Analytics (free)** · Umami (free/self) · PostHog (free tier) · Plausible · Vercel Analytics · GA4.

### 12. Billing / monetization
**★ Lemon Squeezy** (Merchant-of-Record, already in nova) · Paddle (MoR) · Polar.sh (MoR, dev-friendly) · Stripe (most control, you handle tax).

### 13. AI provider (already multi-provider in nova, ADR-011)
Anthropic · OpenAI · Google + **free: Groq · OpenRouter · Mistral**. No change needed.

---

## Nova now → ideal (the gap)

| Stage | Nova now | Ideal commercial | Action |
|---|---|---|---|
| Auth | GitHub OAuth only | email/Google/guest | **add non-GitHub auth** (Supabase/Clerk) |
| Storage | GitHub repo + IndexedDB draft | IndexedDB + Supabase cloud | **add managed cloud store**; GitHub → eject only |
| Publish | GitHub→Vercel/Cloudflare | managed deploy (no user GH) + free subdomain | **decouple publish from user GitHub** |
| Sync | local draft only | local + cloud snapshot | add debounced cloud sync |
| Assets | R2 (partial) | R2/Supabase | keep |
| Billing | Lemon Squeezy ✓ | ✓ | keep |
| AI | multi-provider ✓ | compose-from-registry + transparency | refine behavior (not vendor) |
| Eject | (is the only path) | opt-in ZIP/GitHub/Vercel | reframe as Track B |

**One-line takeaway:** the entire commercial fix is **"add a managed Track A (email auth + cloud store +
managed deploy + free subdomain) and demote GitHub to opt-in Track B."** Everything else nova largely
has. This is webstudio's posture, achievable with free tiers (Supabase + Cloudflare cover auth+DB+
storage+deploy at $0 to start).

## For the demo (which to actually wire vs mock)
- **Real, free, no-GitHub:** Supabase (auth+DB+storage, one free project) **or** stay fully local
  (IndexedDB) + guest mode → zero signup friction for the demo.
- **Managed deploy:** reuse nova's existing Cloudflare path (ADR-033) under NOVA's account → user gets a
  `*.nova.app` link without connecting anything.
- **Mock-but-honest:** custom domain, CMS, team/accounts → show the UI + a "coming / demo" badge.
- **Gate behind login only:** publish to custom domain, save-to-your-GitHub (Track B).
