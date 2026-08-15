import type { Booking } from "@ninibu/types";
import { formatJalaliDateTime, formatJalaliDay } from "@/lib/datetime";

export const serviceDeliveryLabel: Record<string, string> = { online: "آنلاین", in_person: "حضوری", hybrid: "حضوری / آنلاین", onsite: "در محل" };
export const bookingStatusLabel: Record<string, string> = { pending_payment: "در انتظار پرداخت", confirmed: "تأیید شده", cancelled: "لغو شده", completed: "انجام شده", no_show: "عدم حضور", expired: "منقضی شده" };
export const consultationStatusLabel: Record<string, string> = { draft: "پیش‌نویس", open: "باز", assigned: "ارجاع‌شده", answered: "پاسخ داده شده", waiting_for_parent: "منتظر پاسخ شما", closed: "بسته", cancelled: "لغو شده" };
export const consultationPrivacyLabel: Record<string, string> = { private: "خصوصی", anonymous_public: "عمومی ناشناس", public: "عمومی" };

export function formatMoney(amount: number, currency: string) {
  if (amount === 0) return "رایگان";
  const formatted = new Intl.NumberFormat("fa-IR").format(amount);
  const unit = currency.toUpperCase() === "IRR" ? "ریال" : currency;
  return `${formatted} ${unit}`;
}
export function formatDateTime(value: string) { return formatJalaliDateTime(value); }
export function formatDateOnly(value: string) { return formatJalaliDay(value); }
export function dedupeBookings(items: Booking[]) { const map = new Map<number, Booking>(); for (const booking of items) map.set(booking.id, booking); return Array.from(map.values()); }
