import { describe, expect, it, test } from "vitest";
import { addCalendarMonthsDateOnly, completedAgeMonths, gregorianToJalali, gregorianToJalaliInput, jalaliInputToGregorian, jalaliToGregorian, toPersianDigits } from "./index";

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

test("addCalendarMonthsDateOnly clamps month-end birthdays", () => {
  expect(addCalendarMonthsDateOnly("2024-01-31", 1)).toBe("2024-02-29");
  expect(addCalendarMonthsDateOnly("2023-01-31", 1)).toBe("2023-02-28");
});

test("completedAgeMonths uses calendar anniversaries", () => {
  expect(completedAgeMonths("2024-01-31", "2024-02-28")).toBe(0);
  expect(completedAgeMonths("2024-01-31", "2024-02-29")).toBe(1);
  expect(completedAgeMonths("2024-01-31", "2024-03-31")).toBe(2);
});
