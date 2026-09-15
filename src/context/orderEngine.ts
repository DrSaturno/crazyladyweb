import type { Producto } from "../data/catalogo";
import type { DiscountRule, StoreSettings } from "../types/commerce";
import { quoteDiscount, type DiscountQuote } from "./discountEngine";

export interface ResolvedOrderLine {
  product: Producto;
  cantidad: number;
}

export interface OrderQuote {
  resolved: ResolvedOrderLine[];
  subtotal: number;
  promotion: DiscountQuote | null;
  promotionDiscount: number;
  transferDiscount: number;
  descuento: number;
  envio: number;
  total: number;
}

export interface BuildOrderQuoteInput {
  /** Solo se usa `producto.id` de cada línea para ubicar el producto vivo — el precio/nombre del carrito se ignora a propósito. */
  items: { producto: Producto; cantidad: number }[];
  products: Producto[];
  discounts: DiscountRule[];
  settings: StoreSettings;
  paymentMethod: "transferencia" | "mercado_pago";
  discountCode?: string;
  now?: number;
}

/**
 * Lógica pura de checkout: separada de CommerceDataContext para poder probarla sin renderizar React.
 * El precio y el nombre de cada línea SIEMPRE se resuelven contra `products` (el catálogo vivo), nunca
 * contra la foto que trae el carrito — ver "Principios no negociables" en docs/ADMIN_SPEC.md.
 * Lanza un Error con mensaje para mostrar al comprador si algo no es válido (sin stock, código vencido, etc.).
 */
export function buildOrderQuote(input: BuildOrderQuoteInput): OrderQuote {
  const resolved: ResolvedOrderLine[] = input.items.map((line) => {
    const product = input.products.find((item) => item.id === line.producto.id);
    if (!product || product.visible_web === false || product.stock < line.cantidad) {
      throw new Error(`No hay stock suficiente de ${line.producto.nombre}. Revisá el carrito antes de confirmar.`);
    }
    return { product, cantidad: line.cantidad };
  });

  const subtotal = resolved.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0);
  const promotion = input.discountCode ? quoteDiscount(input.discounts, subtotal, input.discountCode, input.now) : null;
  if (promotion && !promotion.valid) throw new Error(promotion.message);

  const promotionDiscount = promotion?.amount ?? 0;
  const transferDiscount = input.paymentMethod === "transferencia" ? Math.round((subtotal - promotionDiscount) * input.settings.descuentoTransferencia / 100) : 0;
  const descuento = promotionDiscount + transferDiscount;
  const envio = promotion?.freeShipping ? 0 : input.settings.envioBase;
  const total = subtotal - descuento + envio;

  return { resolved, subtotal, promotion, promotionDiscount, transferDiscount, descuento, envio, total };
}
