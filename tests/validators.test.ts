import { describe, expect, it } from "vitest";
import { checkoutSchema, listingSchema, registerSchema } from "../lib/validators";

describe("API input contracts", () => {
  it("normalizes the account email and enforces long passwords", () => {
    expect(registerSchema.parse({ name: "Dozie", email: "Dozie@EXAMPLE.com", password: "strong-password-123" }).email).toBe("dozie@example.com");
    expect(registerSchema.safeParse({ name: "Dozie", email: "a@b.com", password: "short" }).success).toBe(false);
  });
  it("rejects untrusted seller IDs and floating-point prices", () => {
    const listing = { title: "Ankara fabric", description: "Handwoven fabric from Ghana", origin: "Ghana", category: "Fashion", priceMinor: 1999, stock: 2 };
    expect(listingSchema.safeParse(listing).success).toBe(true);
    expect(listingSchema.safeParse({ ...listing, sellerId: "someone-else" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...listing, priceMinor: 19.99 }).success).toBe(false);
  });
  it("accepts only integer checkout quantities", () => {
    expect(checkoutSchema.safeParse({ listingId: "abc", quantity: 2 }).success).toBe(true);
    expect(checkoutSchema.safeParse({ listingId: "abc", quantity: 1.5 }).success).toBe(false);
  });
});
