import { describe, expect, it } from "vitest";
import { calculateTotal, mayReleaseInventory, poundsToPence } from "../lib/commerce";

describe("currency and inventory domain invariants", () => {
  it("converts decimal GBP input exactly to integer pence", () => {
    expect(poundsToPence("0.99")).toBe(99);
    expect(poundsToPence("12.5")).toBe(1250);
    expect(poundsToPence("100")).toBe(10000);
  });
  it("rejects excess decimals and negative amounts", () => {
    expect(() => poundsToPence("1.999")).toThrow();
    expect(() => poundsToPence("-1")).toThrow();
  });
  it("calculates totals using minor units", () => {
    expect(calculateTotal(199, 3)).toBe(597);
    expect(() => calculateTotal(199, 21)).toThrow();
  });
  it("releases inventory only for unpaid reservations", () => {
    expect(mayReleaseInventory("PENDING_PAYMENT")).toBe(true);
    expect(mayReleaseInventory("PAID")).toBe(false);
    expect(mayReleaseInventory("EXPIRED")).toBe(false);
  });
});
