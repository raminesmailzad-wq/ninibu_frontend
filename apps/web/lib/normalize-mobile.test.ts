import { describe, expect, it } from "vitest";
import { normalizeIranMobile } from "@ninibu/validation";
describe("normalizeIranMobile",()=>{it("normalizes local format",()=>expect(normalizeIranMobile("09121234567")).toBe("+989121234567"));it("keeps country code",()=>expect(normalizeIranMobile("+989121234567")).toBe("+989121234567"))});
