// PayOS (VietQR) adapter — all PayOS constants and helpers live here.

export const PAYOS_API_URL = "https://api-merchant.payos.vn/v2/payment-requests";

// Plan slug → one-time VND price.
export const PAYOS_PRICES_VND: Record<string, number> = {
  pro: 290_000,
  max: 690_000,
  team: 1_190_000,
  credits: 99_000,
};

export function buildPayosSignData(fields: {
  amount: number;
  cancelUrl: string;
  description: string;
  orderCode: number;
  returnUrl: string;
}): string {
  // PayOS signature: alphabetically sorted core fields joined with &.
  return `amount=${fields.amount}&cancelUrl=${fields.cancelUrl}&description=${fields.description}&orderCode=${fields.orderCode}&returnUrl=${fields.returnUrl}`;
}
