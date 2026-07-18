# Cloudflare R2 Setup

Nova uses R2 for image uploads. Zero egress fees vs Supabase Storage. API-compatible with S3.

## 1. Create a bucket

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → R2 Object Storage → Create bucket
2. Bucket name: `nova-uploads` (or any name — set in `R2_BUCKET_NAME`)
3. Location: Auto (or nearest region to your users)

## 2. Enable public access

1. Bucket → Settings → Public Access → Allow Access
2. Copy the public URL — looks like `https://pub-<hash>.r2.dev`
3. Set `R2_PUBLIC_URL` to this value (no trailing slash)

## 3. Create API token

1. Cloudflare dashboard → R2 → Manage R2 API tokens → Create API token
2. Permissions: **Object Read & Write** (limit to your bucket)
3. Copy:
   - Account ID (top right on the dashboard, or R2 overview page) → `R2_ACCOUNT_ID`
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY` (shown once)

## 4. CORS policy (for browser uploads)

In bucket settings → CORS, add:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

Nova uploads go through the server-side API route (`/api/project/[id]/upload`) so browser CORS is only needed if you add direct client-side uploads in future.

## 5. Free tier limits

- 10 GB storage / month free
- 1M Class A operations (writes) / month free
- 10M Class B operations (reads) / month free
- **Zero egress fees** — key advantage over Supabase Storage

## File constraints (enforced in `apps/studio/src/lib/r2.ts`)

- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- Max size: 5 MB per file
- Key format: `{projectId}/{userId}/{timestamp}-{filename}`
