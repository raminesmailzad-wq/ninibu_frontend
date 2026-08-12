import { describe, expect, it } from "vitest";
import { childAge, visitTypeLabel } from "./format";

describe("format helpers", () => {
  it("maps visit types to Persian labels", () => {
    expect(visitTypeLabel("routine_checkup")).toBe("چکاپ دوره‌ای");
  });

  it("returns a non-empty age label for a past birth date", () => {
    expect(childAge("2024-01-01").length).toBeGreaterThan(0);
  });
});
