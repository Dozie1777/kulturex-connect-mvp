export const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  EXPIRED: "EXPIRED",
} as const;

export const LISTING_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
} as const;

export function toMinorUnits(value: number): number {
  if (!Number.isInteger(value) || value < 0) throw new Error("Price must be non-negative minor units.");
  return value;
}

export function calculateTotal(unitPriceMinor: number, quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("Invalid quantity.");
  const total = toMinorUnits(unitPriceMinor) * quantity;
  if (!Number.isSafeInteger(total)) throw new Error("Amount exceeds supported precision.");
  return total;
}

export function mayReleaseInventory(status: string): boolean {
  return status === ORDER_STATUS.PENDING_PAYMENT;
}
