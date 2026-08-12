import { describe, expect, it } from "vitest";
import type { Booking } from "@ninibu/types";
import { dedupeBookings, formatMoney } from "./services-data";

const booking = { id: 7, status: "confirmed" } as Booking;

describe("services helpers", () => {
  it("deduplicates booking responses defensively", () => {
    expect(dedupeBookings([booking, booking])).toHaveLength(1);
  });
  it("renders zero price as free", () => {
    expect(formatMoney(0, "IRR")).toBe("رایگان");
  });
});
