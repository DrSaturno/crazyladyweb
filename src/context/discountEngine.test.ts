import { describe, expect, it } from "vitest";
import type { DiscountRule } from "../types/commerce";
import { quoteDiscount } from "./discountEngine";

const NOW = new Date("2026-09-15T12:00:00").getTime();

function rule(overrides: Partial<DiscountRule> = {}): DiscountRule {
  return {
    id: "discount-1", code: "BIENVENIDA10", type: "percentage", value: 10, minimumAmount: 0,
    usageCount: 0, status: "active", startsAt: "2026-01-01", createdAt: "", updatedAt: "",
    ...overrides,
  };
}

describe("quoteDiscount", () => {
  it("rejects an empty code without looking at the rule list", () => {
    const quote = quoteDiscount([rule()], 10000, "   ", NOW);
    expect(quote).toEqual({ valid: false, code: "", amount: 0, freeShipping: false, message: "Ingresá un código." });
  });

  it("is case-insensitive and trims whitespace", () => {
    const quote = quoteDiscount([rule()], 10000, "  bienvenida10  ", NOW);
    expect(quote.valid).toBe(true);
    expect(quote.code).toBe("BIENVENIDA10");
  });

  it("rejects a code that does not exist", () => {
    const quote = quoteDiscount([rule()], 10000, "NOEXISTE", NOW);
    expect(quote).toMatchObject({ valid: false, message: "El código no está disponible." });
  });

  it("rejects a draft or paused code the same way as a missing one", () => {
    const quote = quoteDiscount([rule({ status: "draft" })], 10000, "BIENVENIDA10", NOW);
    expect(quote.valid).toBe(false);
    expect(quote.message).toBe("El código no está disponible.");
  });

  it("rejects a code before its start date and after its end date", () => {
    const notYet = quoteDiscount([rule({ startsAt: "2026-12-01" })], 10000, "BIENVENIDA10", NOW);
    expect(notYet).toMatchObject({ valid: false, message: "El código todavía no está vigente." });

    const expired = quoteDiscount([rule({ endsAt: "2026-01-31" })], 10000, "BIENVENIDA10", NOW);
    expect(expired).toMatchObject({ valid: false, message: "El código venció." });
  });

  it("treats endsAt as inclusive through the end of that calendar day", () => {
    const sameDayEnd = new Date("2026-09-15T23:59:00").getTime();
    const quote = quoteDiscount([rule({ endsAt: "2026-09-15" })], 10000, "BIENVENIDA10", sameDayEnd);
    expect(quote.valid).toBe(true);
  });

  it("rejects once the usage limit is reached", () => {
    const quote = quoteDiscount([rule({ usageLimit: 5, usageCount: 5 })], 10000, "BIENVENIDA10", NOW);
    expect(quote).toMatchObject({ valid: false, message: "El código alcanzó su límite de usos." });
  });

  it("rejects when the subtotal is below the minimum purchase", () => {
    const quote = quoteDiscount([rule({ minimumAmount: 50000 })], 20000, "BIENVENIDA10", NOW);
    expect(quote.valid).toBe(false);
    expect(quote.message).toContain("50.000");
  });

  it("computes a percentage discount rounded to the nearest peso", () => {
    const quote = quoteDiscount([rule({ value: 15 })], 33333, "BIENVENIDA10", NOW);
    expect(quote.valid).toBe(true);
    expect(quote.amount).toBe(5000); // 15% de 33333 = 4999.95 -> redondea a 5000
  });

  it("caps a fixed discount at the subtotal so it can never go negative", () => {
    const quote = quoteDiscount([rule({ type: "fixed", value: 999999 })], 10000, "BIENVENIDA10", NOW);
    expect(quote.amount).toBe(10000);
  });

  it("returns zero amount and freeShipping=true for a free_shipping rule", () => {
    const quote = quoteDiscount([rule({ type: "free_shipping", value: 0 })], 10000, "BIENVENIDA10", NOW);
    expect(quote).toMatchObject({ valid: true, amount: 0, freeShipping: true, message: "Envío gratis aplicado." });
  });

  it("returns the ruleId for a valid quote so the caller can register usage", () => {
    const quote = quoteDiscount([rule({ id: "rule-42" })], 10000, "BIENVENIDA10", NOW);
    expect(quote.ruleId).toBe("rule-42");
  });
});
