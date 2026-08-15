"use client";

import type { Booking, Payment } from "@ninibu/types";
import type { BookingStage } from "@/lib/routes";

export type BookingDraft = {
  selectedDate?: string;
  selectedSlot?: string;
  attachChild?: boolean;
  booking?: Booking | null;
  payment?: Payment | null;
  stage?: BookingStage;
  serviceName?: string;
  savedAt?: string;
};

export type BookingDraftSummary = {
  serviceId: number;
  serviceName: string;
  stage: BookingStage;
  savedAt?: string;
};

const PREFIX = "ninibu_booking_draft_";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function bookingDraftKey(serviceId: number) {
  return `${PREFIX}${serviceId}`;
}

function normalizeStage(draft: BookingDraft): BookingStage {
  if (draft.booking && (draft.booking.status === "confirmed" || draft.booking.status === "completed")) return "success";
  if (draft.booking && draft.payment) return "payment";
  if (draft.selectedSlot) return draft.stage === "payment" ? "review" : (draft.stage ?? "review");
  return "schedule";
}

export function readBookingDraft(serviceId: number): BookingDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(bookingDraftKey(serviceId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as BookingDraft;
    return { ...parsed, stage: normalizeStage(parsed) };
  } catch {
    return {};
  }
}

export function writeBookingDraft(serviceId: number, draft: BookingDraft) {
  if (typeof window === "undefined") return;
  const next: BookingDraft = {
    ...draft,
    stage: normalizeStage(draft),
    savedAt: new Date().toISOString(),
  };
  try { window.sessionStorage.setItem(bookingDraftKey(serviceId), JSON.stringify(next)); } catch { /* storage unavailable */ }
}

export function removeBookingDraft(serviceId: number) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(bookingDraftKey(serviceId)); } catch { /* storage unavailable */ }
}

export function listBookingDraftSummaries(): BookingDraftSummary[] {
  if (typeof window === "undefined") return [];
  const summaries: BookingDraftSummary[] = [];
  try {
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (!key?.startsWith(PREFIX)) continue;
      const serviceId = Number(key.slice(PREFIX.length));
      if (!Number.isSafeInteger(serviceId) || serviceId <= 0) continue;
      const draft = readBookingDraft(serviceId);
      const savedAtMs = draft.savedAt ? Date.parse(draft.savedAt) : NaN;
      if (Number.isFinite(savedAtMs) && Date.now() - savedAtMs > MAX_AGE_MS) {
        removeBookingDraft(serviceId);
        continue;
      }
      if (draft.stage === "success") {
        removeBookingDraft(serviceId);
        continue;
      }
      if (!draft.selectedDate && !draft.selectedSlot && !draft.booking && !draft.payment) continue;
      summaries.push({
        serviceId,
        serviceName: draft.serviceName?.trim() || "خدمت انتخاب‌شده",
        stage: normalizeStage(draft),
        savedAt: draft.savedAt,
      });
    }
  } catch {
    return [];
  }
  return summaries.sort((a, b) => Date.parse(b.savedAt ?? "") - Date.parse(a.savedAt ?? ""));
}
