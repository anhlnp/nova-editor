# Plan: Revamp Landing Page, Login Page, and Projects Page (v2.4.0)

> **Status: ✅ SHIPPED as v2.5.0** (Minor bump — additive UI, no schema change). Title keeps the
> original "v2.4.0" engine reference from when this plan was written. Audit + prettify pass
> 2026-06-17: pages typecheck-clean; reconciled the payment webhook credit grants to
> `pricing-policy.md`; added `crypto.ts` unit tests. See `doc/VERIFIED.md` → "v2.5.0" section.

## Context
Upgrading the interface of 3 core pages to dramatically improve UX, visual design, and marketing conversion rates, ensuring the presentation matches the true power of the Nova v2.4.0 engine.
- **Landing Page**: Currently too minimalist, outdated pricing ($29 instead of $19), lacks visual proof (no editor screenshots), and misses key v2.x features like AI Semantic Patching.
- **Login Page**: Too simple, missing a strong value proposition context to convince users before they authenticate.
- **Projects Page**: Basic header, barebones empty state, and project cards lack visual polish and metadata.

**Objective:** Apply the Nova design system (dark bg `#0f0f1a`, `nova-*` violet palette) and elevate the UX with modern sections (Bento grids, Hero mockups), micro-animations, and high-converting copy.

---

## Tech Constraints
- Pure Tailwind CSS + `nova-*` tokens (No external UI libraries like Framer Motion or Radix, use native React state).
- Nova colors: `nova-400` (#a78bfa), `nova-500` (#8b5cf6), `nova-600` (#7c3aed), `nova-700` (#6d28d9).
- Font: Inter (already configured in `tailwind.config.ts`).
- Project data available: `id`, `repo_owner`, `repo_name`, `repo_full_name`, `default_branch`, `created_at`.
  - **Note**: `last_synced_at` does not exist in the schema — use `created_at`.
- Session data available: `session.user.githubLogin`, `session.user.githubId`, `session.user.name`, `session.user.email`.
  - **Note**: GitHub avatar URL is not exposed via session — use initials instead.

---

## 1. Landing Page — `apps/studio/src/app/(marketing)/page.tsx`

**Sequential Sections** (Replacing the pure text-only hero with visual dominance and social proof):

### Nav (Minor Enhancement)
- Add a **Pricing anchor link** (`href="#pricing"`).
- Keep the existing "Get started free" button.

### Hero Section (Massive Visual Upgrade)
- Keep the current headline but refine the subtext to emphasize "AI Semantic Patching" and "Production-ready".
- **Add "Trusted by" social proof** below CTAs: "Join 2,000+ developers building with Nova".
- **Add an Avatar Stack** (3-4 overlapping circles with `nova-400/500/600` bg, no real avatars needed).
- **Dashboard Mockup (New)**: Below the text, add a massive, visually striking mockup of the Nova Editor interface. Use a stylized UI representation (or a glowing `div` structure simulating the editor) with a subtle 3D tilt and a `nova-500/20` neon glow effect behind it.

### Stats Bar (New Section)
- 3 stats: "2,000+ projects built", "10M+ AI patches applied", "100% GitHub native".
- Light border top/bottom: `border-y border-white/10 bg-white/5`.
- Text centered, space-around layout.

### How it Works — 3 Steps (Replaces old feature grid)
- 3-step visual timeline:
  - **Step 1:** "Connect your repo" — Setup icon.
  - **Step 2:** "Build visually & Prompt the AI" — Drag-drop & Sparkles icon.
  - **Step 3:** "Push clean React code" — Git commit icon.
- Each step: Giant step number (120px font, low opacity), title, short description.
- **Desktop**: Horizontal layout, steps connected by dashed CSS lines.
- **Mobile**: Vertical stack, no connecting lines.
- Card styling: `bg-white/5 border border-white/10 rounded-xl p-8`.

### Bento Grid Features (New & Modern)
- Replace the boring 3-column grid with a modern, asymmetrical **Bento Grid** (Vercel/Linear style) showcasing 5 key strengths:
  1. **AI Semantic Patching:** "Zero hallucinations. AI edits by Target-ID." (Wide card)
  2. **Next.js & Tailwind Native:** "No lock-in. Real code." (Square card with code snippet)
  3. **GitHub & Vercel Sync:** "Auto-deploy out of the box." (Square card)
  4. **High-Performance Editor:** "60fps Drag & Drop." (Small card)
  5. **Custom Domains:** "Host on your own domain." (Small card)
- **Visuals**: Add `bg-gradient-to-br from-white/10 to-white/5` + gradient border effects (`border border-transparent bg-clip-border` + `bg-gradient-to-br from-nova-400/20 to-white/0`).

### Testimonials (New Section)
- 3 mock testimonial cards to build trust.
- Avatar (initials circle, `nova-400` bg), name, role, quote.
- *Example:* "S", "Sarah Chen", "Frontend Lead", "The AI Semantic Patching is witchcraft. It never breaks my layouts..."
- Card styling: `bg-white/5 border border-white/10 rounded-xl p-6`.
- Layout: `md:grid-cols-3 gap-6`.

### Pricing Section (Critical Data Fixes, ID: `id="pricing"`)
- **Fix the outdated pricing data**: Align exactly with `v2.4.0` official policy.
  - **Free:** $0, **200 AI credits/mo** (not 20).
  - **Pro:** **$19/mo** (not $29), **4,000 AI credits/mo** (not 500). Add "1 Custom Domain" and "Premium Templates" to the feature list.
- **Annual Toggle:** Add a "Billed annually" switch using `useState` to update prices (mock 20% discount UI, no backend logic needed).
- **Comparison Table:** Add a detailed 5-6 feature comparison table below the tiers.
- **Enterprise Hint:** Add a subtle "Need Team seats? Contact us" link below.

### FAQ Section (New)
- 5 expand/collapse items using `useState`:
  1. "Does Nova lock me in?" → "No, export clean Next.js code..."
  2. "What are AI Credits?" → "1 edit = 12 credits. You get 4,000 on Pro..."
  3. "Which GitHub repos work?" → "Any Next.js App Router repo..."
  4. "How does AI know my components?" → "It reads your Zod schema..."
  5. "Can I use it with existing repos?" → "Yes, Nova integrates seamlessly..."
- Styling: `bg-white/5 border border-white/10 rounded-lg p-4`.

### Final CTA Section & Footer (New)
- **CTA:** Large headline: "Ready to build faster?", button to `/login`, subtle `bg-gradient-to-br from-nova-600/10 to-transparent` background.
- **Footer:** 2-col grid. Left: Logo + "© 2024 Nova". Right: Links (GitHub, Docs, Pricing).

---

## 2. Login Page — `apps/studio/src/app/(auth)/login/page.tsx`

**New 2-column layout** (Desktop) / Stacked (Mobile):

### Left Column — Value Proposition
- Headline: "Build React faster with Nova."
- 3 bullet points:
  - "Visual editor meets AI Semantic Patching"
  - "Export clean, production-ready code"
  - "Push directly to your GitHub"
- Mini testimonial: `text-sm text-white/60 italic` — "This cut our dev time in half."
- Styling (Desktop only): `bg-white/5 border border-white/10 rounded-2xl p-8`.

### Right Column — Login Card
- Wrap existing Logo + Title + GitHub Button in a styled card: `bg-white/5 border border-white/10 backdrop-blur rounded-xl p-8`.
- **Add Trust Signals** below the button:
  - "🔒 GitHub access limited to selected repo only"
  - "Your code is never stored on Nova servers"
  - Styling: `text-xs text-white/40 text-center mt-6`.

---

## 3. Projects Page — `apps/studio/src/app/(dashboard)/projects/page.tsx`

### Header (Enhanced)
- **Dynamic Welcome Message**: "Good morning, @[githubLogin]".
  - Time-based greeting: 5am-11am = "morning", 11am-5pm = "afternoon", 5pm+ = "evening".
- **User Avatar**: Circle with initials (`githubLogin.slice(0,2).toUpperCase()`), `bg-nova-400/30`.
- **SignOut Button**: Upgrade styling to `px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-lg transition-colors`.

### Search Bar (New Client Component)
- Input placeholder: "Search projects..."
- Debounced filter (300ms) on `repo_name` or `repo_full_name`.
- Styling: `w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-nova-500`.

### Empty State (Enhanced)
- Add a large abstract geometric SVG icon (~80px).
- Headline: "No projects connected yet."
- 3 bullet points showing what users can do: "Visual Drag & Drop", "AI-powered code generation", "Direct GitHub integration".
- CTA Button: "Connect your first repository".

### Project Cards (Enhanced)
- Add `created_at` formatting (e.g., "Created on MM/DD/YYYY").
- Add Branch Badge: `inline-block px-2 py-1 bg-nova-600/20 text-nova-300 text-xs rounded`.
- Hover Effect: Animated `border-nova-400` on hover.
- Card Styling: `bg-white/5 hover:bg-white/10 border border-white/10 hover:border-nova-500/50 rounded-xl p-5 transition-all`.

### Quick Tip Banner (New, Dismissible)
- Sticky top banner: "💡 Tip: You can connect multiple repos and switch between them in the editor."
- State: `const [showTip, setShowTip] = useState(true)`.
- Styling: `bg-nova-600/10 border border-nova-500/50 rounded-lg p-4 mb-6 flex items-start justify-between`.

---

## Implementation Order
1. **Landing Page:** Implement sections sequentially (Hero Mockup → Stats → How It Works → Bento Grid → Testimonials → Pricing Fixes → FAQ → Footer).
2. **Login Page:** Convert to the 2-column value-prop layout.
3. **Projects Page:** Upgrade Header, add Search, enhance Cards, and build the Empty State.
