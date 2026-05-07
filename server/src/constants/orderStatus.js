export const ORDER_STATUS = /** @type {const} */ ({
  PENDING: "PENDING",
  SHIPPING: "SHIPPING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
});

export const ORDER_STATUS_VALUES = /** @type {readonly string[]} */ (Object.values(ORDER_STATUS));

export function normalizeOrderStatus(input) {
  if (!input) return null;
  const value = String(input).trim();
  if (!value) return null;
  const upper = value.toUpperCase();
  return ORDER_STATUS_VALUES.includes(upper) ? upper : null;
}

