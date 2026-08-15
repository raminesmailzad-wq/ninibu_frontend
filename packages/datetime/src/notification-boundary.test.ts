import { describe, expect, it } from "vitest";
import {
  formatPersianClockInput,
  isBackendDateTimePresent,
  isValidBackendClock,
  normalizeBackendClock
} from "./index";

describe("notification date/time boundary", () => {
  it("treats Go zero timestamps as absent", () => {
    expect(isBackendDateTimePresent("0001-01-01T00:00:00Z")).toBe(false);
    expect(isBackendDateTimePresent("2026-08-12T08:30:00Z")).toBe(true);
  });

  it("shows Persian clock digits but emits ASCII HH:MM", () => {
    expect(formatPersianClockInput("22:00")).toBe("۲۲:۰۰");
    expect(normalizeBackendClock("۲۲:۰۰")).toBe("22:00");
    expect(isValidBackendClock("۲۲:۰۰")).toBe(true);
    expect(isValidBackendClock("۲۵:۰۰")).toBe(false);
  });
});
