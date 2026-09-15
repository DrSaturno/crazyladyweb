import { describe, expect, it } from "vitest";
import type { Producto } from "../data/catalogo";
import type { DiscountRule, StoreSettings } from "../types/commerce";
import { buildOrderQuote } from "./orderEngine";

const SETTINGS: StoreSettings = { nombreTienda: "Crazy Lady Seeds", email: "", whatsapp: "", descuentoTransferencia: 10, envioBase: 3000, compraInvitado: true, mercadoPagoActivo: false };

function producto(overrides: Partial<Producto> = {}): Producto {
  return { id: "sem-2", slug: "amnesia-x4", nombre: "Amnesia x4", banco: "Crazy Lady Seeds", categoria: "semilla", origen: "nacional", tipo: "feminizada", genetica: "sativa", precio: 21000, stock: 10, presentacion: "x4", visible_web: true, ...overrides };
}

function discount(overrides: Partial<DiscountRule> = {}): DiscountRule {
  return { id: "d1", code: "PROBAR10", type: "percentage", value: 10, minimumAmount: 0, usageCount: 0, status: "active", startsAt: "2026-01-01", createdAt: "", updatedAt: "", ...overrides };
}

describe("buildOrderQuote", () => {
  it("regression: resolves price and name from the live catalog, never from the cart's cached snapshot", () => {
    // Este es el bug real de esta sesión: el carrito traía Amnesia x4 a $21.000 pero el admin ya la
    // había subido a $99.000. El pedido tiene que salir a $99.000, no al precio viejo del carrito.
    const stale = producto({ precio: 21000, nombre: "Amnesia x4 (nombre viejo)" });
    const live = producto({ precio: 99000, nombre: "Amnesia x4" });
    const quote = buildOrderQuote({ items: [{ producto: stale, cantidad: 1 }], products: [live], discounts: [], settings: SETTINGS, paymentMethod: "mercado_pago" });
    expect(quote.subtotal).toBe(99000);
    expect(quote.resolved[0].product.precio).toBe(99000);
    expect(quote.resolved[0].product.nombre).toBe("Amnesia x4");
  });

  it("throws when the product no longer exists in the live catalog", () => {
    const cart = producto();
    expect(() => buildOrderQuote({ items: [{ producto: cart, cantidad: 1 }], products: [], discounts: [], settings: SETTINGS, paymentMethod: "mercado_pago" })).toThrow(/stock suficiente/);
  });

  it("throws when the live product is hidden (visible_web false), even with plenty of stock", () => {
    const cart = producto();
    const hidden = producto({ visible_web: false, stock: 999 });
    expect(() => buildOrderQuote({ items: [{ producto: cart, cantidad: 1 }], products: [hidden], discounts: [], settings: SETTINGS, paymentMethod: "mercado_pago" })).toThrow(/stock suficiente/);
  });

  it("throws when the requested quantity exceeds live stock", () => {
    const cart = producto();
    const low = producto({ stock: 2 });
    expect(() => buildOrderQuote({ items: [{ producto: cart, cantidad: 5 }], products: [low], discounts: [], settings: SETTINGS, paymentMethod: "mercado_pago" })).toThrow(/stock suficiente/);
  });

  it("sums multiple lines using each line's own live price", () => {
    const a = producto({ id: "a", precio: 10000 });
    const b = producto({ id: "b", precio: 5000 });
    const quote = buildOrderQuote({ items: [{ producto: a, cantidad: 2 }, { producto: b, cantidad: 3 }], products: [a, b], discounts: [], settings: SETTINGS, paymentMethod: "mercado_pago" });
    expect(quote.subtotal).toBe(2 * 10000 + 3 * 5000);
  });

  it("applies a valid discount code and rejects an invalid one with its message", () => {
    const live = producto();
    const valid = buildOrderQuote({ items: [{ producto: live, cantidad: 1 }], products: [live], discounts: [discount()], settings: SETTINGS, paymentMethod: "mercado_pago", discountCode: "PROBAR10" });
    expect(valid.promotionDiscount).toBe(2100); // 10% de 21000
    expect(() => buildOrderQuote({ items: [{ producto: live, cantidad: 1 }], products: [live], discounts: [discount({ status: "paused" })], settings: SETTINGS, paymentMethod: "mercado_pago", discountCode: "PROBAR10" })).toThrow("El código no está disponible.");
  });

  it("only applies the transfer discount for paymentMethod=transferencia, computed after the promo discount", () => {
    const live = producto();
    const noTransfer = buildOrderQuote({ items: [{ producto: live, cantidad: 1 }], products: [live], discounts: [], settings: SETTINGS, paymentMethod: "mercado_pago" });
    expect(noTransfer.transferDiscount).toBe(0);
    const withTransfer = buildOrderQuote({ items: [{ producto: live, cantidad: 1 }], products: [live], discounts: [discount()], settings: SETTINGS, paymentMethod: "transferencia", discountCode: "PROBAR10" });
    // subtotal 21000, -10% promo = 18900 restante, -10% transferencia sobre eso = 1890
    expect(withTransfer.promotionDiscount).toBe(2100);
    expect(withTransfer.transferDiscount).toBe(1890);
    expect(withTransfer.total).toBe(21000 - 2100 - 1890 + SETTINGS.envioBase);
  });

  it("zeroes shipping for a free_shipping promotion and keeps it otherwise", () => {
    const live = producto();
    const free = buildOrderQuote({ items: [{ producto: live, cantidad: 1 }], products: [live], discounts: [discount({ type: "free_shipping", value: 0 })], settings: SETTINGS, paymentMethod: "mercado_pago", discountCode: "PROBAR10" });
    expect(free.envio).toBe(0);
    const paid = buildOrderQuote({ items: [{ producto: live, cantidad: 1 }], products: [live], discounts: [], settings: SETTINGS, paymentMethod: "mercado_pago" });
    expect(paid.envio).toBe(SETTINGS.envioBase);
  });
});
