// PayOS (VietQR) adapter — all PayOS constants and helpers live here.

export const PAYOS_API_URL = "https://api-merchant.payos.vn/v2/payment-requests";

// Plan slug → one-time VND price.
export const PAYOS_PRICES_VND: Record<string, number> = {
  pro: 10000,
  max: 10000,
  team: 10000,
  credits: 10000,
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
