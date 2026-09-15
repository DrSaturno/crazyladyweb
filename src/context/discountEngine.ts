import type { DiscountRule } from "../types/commerce";

export interface DiscountQuote {
  valid: boolean;
  code: string;
  ruleId?: string;
  amount: number;
  freeShipping: boolean;
  message: string;
}

export function parseDiscountDate(value: string, endOfDay: boolean) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(dateOnly ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}` : value).getTime();
  return Number.isNaN(parsed) ? (endOfDay ? Number.POSITIVE_INFINITY : 0) : parsed;
}

/** Lógica pura de checkout: separada de CommerceDataContext para poder probarla sin renderizar React. */
export function quoteDiscount(discounts: DiscountRule[], subtotal: number, code: string, now: number = Date.now()): DiscountQuote {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, code: "", amount: 0, freeShipping: false, message: "Ingresá un código." };
  const discount = discounts.find((item) => item.code.toUpperCase() === normalized);
  if (!discount || discount.status !== "active") return { valid: false, code: normalized, amount: 0, freeShipping: false, message: "El código no está disponible." };
  const startTime = parseDiscountDate(discount.startsAt, false);
  const endTime = discount.endsAt ? parseDiscountDate(discount.endsAt, true) : Number.POSITIVE_INFINITY;
  if (now < startTime) return { valid: false, code: normalized, amount: 0, freeShipping: false, message: "El código todavía no está vigente." };
  if (now > endTime) return { valid: false, code: normalized, amount: 0, freeShipping: false, message: "El código venció." };
  if (discount.usageLimit !== undefined && discount.usageCount >= discount.usageLimit) return { valid: false, code: normalized, amount: 0, freeShipping: false, message: "El código alcanzó su límite de usos." };
  if (subtotal < discount.minimumAmount) return { valid: false, code: normalized, amount: 0, freeShipping: false, message: `La compra mínima para este código es $${discount.minimumAmount.toLocaleString("es-AR")}.` };
  const amount = discount.type === "percentage" ? Math.round(subtotal * discount.value / 100) : discount.type === "fixed" ? Math.min(subtotal, discount.value) : 0;
  return { valid: true, code: discount.code, ruleId: discount.id, amount, freeShipping: discount.type === "free_shipping", message: discount.type === "free_shipping" ? "Envío gratis aplicado." : `Descuento de $${amount.toLocaleString("es-AR")} aplicado.` };
}
