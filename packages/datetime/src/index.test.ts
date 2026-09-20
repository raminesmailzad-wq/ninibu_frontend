import { describe, expect, it } from "vitest";
import { gregorianToJalali, gregorianToJalaliInput, jalaliInputToGregorian, jalaliToGregorian, toPersianDigits } from "./index";

describe("Jalali/Gregorian boundary", () => {
  it("converts Nowruz 1405", () => {
    expect(jalaliToGregorian(1405, 1, 1)).toEqual({ year: 2026, month: 3, day: 21 });
    expect(gregorianToJalali(2026, 3, 21)).toEqual({ year: 1405, month: 1, day: 1 });
  });
  it("accepts Persian digits and produces backend ISO date", () => {
    expect(jalaliInputToGregorian("۱۴۰۵/۰۵/۲۱")).toBe("2026-08-12");
  });
  it("converts backend date back to Persian input", () => {
    expect(gregorianToJalaliInput("2026-08-12")).toBe("۱۴۰۵/۰۵/۲۱");
  });
  it("rejects invalid Jalali dates", () => {
    expect(jalaliInputToGregorian("۱۴۰۵/۱۳/۰۱")).toBeNull();
  });
  it("renders Persian digits", () => {
    expect(toPersianDigits("1405/05/21")).toBe("۱۴۰۵/۰۵/۲۱");
  });
});
