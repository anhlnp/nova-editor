# Store Setup: Lemon Squeezy + PayOS

Nova uses two payment systems:
- **Lemon Squeezy** — global subscription billing (Pro tier, USD/EUR)
- **PayOS** — Vietnamese QR code payments with automatic bank transfer detection

---

## Lemon Squeezy (Global)

### 1. Create a store

1. Sign up at [app.lemonsqueezy.com](https://app.lemonsqueezy.com)
2. Go to Store → Settings → enable **Test Mode** for development
3. Create a Product → type: Subscription → add a variant "Pro Monthly" (e.g. $9/mo)
4. Copy the Variant ID → set as `NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID`

### 2. API credentials

Settings → API → Create API key → set as `LEMONSQUEEZY_API_KEY`

Settings → Webhooks → Add endpoint:
- URL: `https://your-domain.com/api/webhooks/lemonsqueezy`
- Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`
- Copy signing secret → `LEMONSQUEEZY_SIGNING_SECRET`

Store ID (in URL when viewing your store) → `LEMONSQUEEZY_STORE_ID`

### 3. Test mode

In Lemon Squeezy dashboard → Store → Enable test mode, then use test card:
- Card: `4242 4242 4242 4242`
- Expiry: any future date
- CVV: any 3 digits

Webhooks in test mode fire to your webhook URL with test data.

### 4. Local dev — skip payment entirely

Set in `.env.local`:
```env
NEXT_PUBLIC_FORCE_PRO=true
```

This bypasses the tier check in `useUserStore` so you can use Pro features without a subscription. **Never set this in production.**

---

## PayOS (Vietnam)

PayOS auto-generates VietQR codes and detects bank transfers via webhook — no manual Zalo/Momo checking.

### 1. Register

1. Sign up at [payos.vn](https://payos.vn)
2. Create a payment channel → link your business bank account
3. From the dashboard, copy:
   - **Client ID** → `PAYOS_CLIENT_ID`
   - **API Key** → `PAYOS_API_KEY`
   - **Checksum Key** → `PAYOS_CHECKSUM_KEY`

### 2. Webhook

PayOS calls your server when a payment is confirmed:
- Endpoint: `https://your-domain.com/api/webhooks/payos`
- Configure in PayOS dashboard → Webhook URL

The webhook payload includes the order code and amount. Verify the checksum using `PAYOS_CHECKSUM_KEY` before upgrading the user's tier.

### 3. SDK

```bash
pnpm add @payos/node --filter @studio/app
```

Usage:
```typescript
import PayOS from "@payos/node";

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

const link = await payos.createPaymentLink({
  orderCode: Date.now(),
  amount: 199000,         // VND
  description: "Nova Pro",
  returnUrl: `${baseUrl}/payment/success`,
  cancelUrl: `${baseUrl}/payment/cancel`,
});
// link.checkoutUrl → redirect user here for QR page
```

### 4. Pricing

Suggested Vietnam pricing: **199,000 VND/month** (≈ $8 USD). Lemon Squeezy handles international customers; PayOS handles Vietnamese customers who prefer bank transfer.

---

## Database schema

After a successful payment webhook, update `users.tier` in Supabase:
```sql
UPDATE users SET tier = 'pro' WHERE id = $userId;
```

See [database.md](./database.md) for full schema.
