# Environment Variables

All variables go in `apps/studio/.env.local` (never commit this file).

## Required for development

```env
# GitHub OAuth app (create at github.com/settings/developers)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=          # openssl rand -base64 32

# Supabase (DB only — no file storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Required for image uploads

See [cloudflare-r2.md](./cloudflare-r2.md) for bucket setup.

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=nova-uploads
R2_PUBLIC_URL=https://pub-<hash>.r2.dev   # your bucket's public URL
```

## Required for payments

See [store.md](./store.md) for Lemon Squeezy + PayOS setup.

```env
# Lemon Squeezy
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_SIGNING_SECRET=
NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID=

# PayOS (Vietnam QR payments)
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=

# Dev override — skip payment gate and act as Pro user
NEXT_PUBLIC_FORCE_PRO=true
```

## Optional

```env
# Vercel deploy integration (Pro users)
VERCEL_TOKEN=
VERCEL_TEAM_ID=          # optional, for team accounts
```

## Quick start

```bash
cp apps/studio/.env.example apps/studio/.env.local
# Fill in the values above, then:
pnpm dev
```
