import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/password";

describe("password hashing", () => {
  it("uses a unique salt and verifies only the correct password", async () => {
    const first = await hashPassword("different-secure-password");
    const second = await hashPassword("different-secure-password");
    expect(first).not.toBe(second);
    expect(await verifyPassword("different-secure-password", first)).toBe(true);
    expect(await verifyPassword("incorrect-password", first)).toBe(false);
  });
  it("rejects invalid stored hashes", async () => {
    expect(await verifyPassword("a", "invalid")).toBe(false);
  });
});
