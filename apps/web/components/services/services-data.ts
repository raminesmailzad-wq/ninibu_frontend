import type { Booking } from "@ninibu/types";

export const serviceDeliveryLabel: Record<string, string> = {
  online: "آنلاین",
  in_person: "حضوری",
  hybrid: "حضوری / آنلاین",
  onsite: "در محل"
};

export const bookingStatusLabel: Record<string, string> = {
  pending_payment: "در انتظار پرداخت",
  confirmed: "تأیید شده",
  cancelled: "لغو شده",
  completed: "انجام شده",
  no_show: "عدم حضور",
  expired: "منقضی شده"
};

export const consultationStatusLabel: Record<string, string> = {
  draft: "پیش‌نویس",
  open: "باز",
  assigned: "ارجاع‌شده",
  answered: "پاسخ داده شده",
  waiting_for_parent: "منتظر پاسخ شما",
  closed: "بسته",
  cancelled: "لغو شده"
};

export const consultationPrivacyLabel: Record<string, string> = {
  private: "خصوصی",
  anonymous_public: "عمومی ناشناس",
  public: "عمومی"
};

export function formatMoney(amount: number, currency: string) {
  if (amount === 0) return "رایگان";
  const formatted = new Intl.NumberFormat("fa-IR").format(amount);
  const unit = currency.toUpperCase() === "IRR" ? "ریال" : currency;
  return `${formatted} ${unit}`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatDateOnly(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fa-IR", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export function dedupeBookings(items: Booking[]) {
  const map = new Map<number, Booking>();
  for (const booking of items) map.set(booking.id, booking);
  return Array.from(map.values());
}
