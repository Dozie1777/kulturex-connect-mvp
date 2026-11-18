import { describe, expect, it } from "vitest";
import { analyseContent } from "../lib/moderation";

describe("contact-sharing moderation", () => {
  it("accepts an ordinary product description", () => {
    expect(analyseContent("Handmade Ankara bag from Ghana").approved).toBe(true);
  });
  it("flags email addresses and phone numbers", () => {
    expect(analyseContent("Contact seller@example.com to buy").approved).toBe(false);
    expect(analyseContent("Call +44 7700 900123").approved).toBe(false);
  });
  it("flags off-platform chat requests", () => {
    expect(analyseContent("DM me on WhatsApp").riskLevel).toBe("medium");
  });
});
