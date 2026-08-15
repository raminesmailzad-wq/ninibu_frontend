import type { NotificationItem } from "@ninibu/types";
import { isBackendDateTimePresent } from "@/lib/datetime";

export const notificationCategoryLabels: Record<string, string> = {
  health: "سلامت",
  vaccination: "واکسن",
  medication: "دارو",
  growth: "رشد",
  consultation: "مشاوره",
  community: "هم‌فکری",
  system: "سیستم",
  advertising: "پیشنهادهای تجاری",
  commerce: "خرید و خدمات"
};

export const notificationPriorityLabels: Record<string, string> = {
  low: "کم",
  normal: "عادی",
  medium: "متوسط",
  high: "مهم",
  urgent: "فوری"
};

export function notificationCategoryLabel(category: string) {
  return notificationCategoryLabels[category] ?? category;
}

export function notificationPriorityLabel(priority: string) {
  return notificationPriorityLabels[priority] ?? priority;
}

export function notificationTimestamp(item: NotificationItem): string | undefined {
  const candidates = [item.read_at, item.delivered_at, item.sent_at, item.scheduled_at, item.created_at];
  return candidates.find((value) => isBackendDateTimePresent(value));
}
