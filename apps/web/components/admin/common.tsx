"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="admin-page-header">
    <div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
    {actions ? <div className="admin-page-actions">{actions}</div> : null}
  </header>;
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`admin-card ${className}`}>{children}</section>;
}

export function AdminStatus({ value }: { value?: string | boolean }) {
  const raw = String(value ?? "unknown").toLowerCase();
  const good = ["active", "verified", "published", "approved", "resolved", "paid", "completed", "true"].includes(raw);
  const warn = ["pending", "draft", "in_review", "under_review", "processing", "waiting_for_parent"].includes(raw);
  const bad = ["inactive", "rejected", "suspended", "hidden", "failed", "cancelled", "false"].includes(raw);
  const tone = good ? "good" : warn ? "warn" : bad ? "bad" : "neutral";
  return <span className={`admin-status ${tone}`}>{statusLabel(raw)}</span>;
}

function statusLabel(value: string) {
  const map: Record<string, string> = {
    active: "فعال", inactive: "غیرفعال", verified: "تأییدشده", pending: "در انتظار", rejected: "ردشده", suspended: "تعلیق",
    published: "منتشرشده", draft: "پیش‌نویس", in_review: "در بررسی", under_review: "در بررسی", approved: "تأییدشده",
    archived: "آرشیو", resolved: "رسیدگی‌شده", dismissed: "مختومه", paid: "پرداخت‌شده", completed: "تکمیل‌شده",
    processing: "در حال پردازش", failed: "ناموفق", cancelled: "لغوشده", true: "فعال", false: "غیرفعال", unknown: "نامشخص"
  };
  return map[value] ?? value;
}

export function AdminModal({ title, description, onClose, children, footer }: { title: string; description?: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
    <button className="admin-modal-scrim" aria-label="بستن" onClick={onClose} />
    <section className="admin-modal">
      <header><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div><Button variant="ghost" className="admin-icon-button" onClick={onClose} aria-label="بستن"><X size={20}/></Button></header>
      <div className="admin-modal-body">{children}</div>
      {footer ? <footer>{footer}</footer> : null}
    </section>
  </div>;
}

export function AdminEmpty({ title, description }: { title: string; description: string }) {
  return <div className="admin-empty"><strong>{title}</strong><p>{description}</p></div>;
}

export function AdminError({ message }: { message: string }) {
  return <div className="admin-error">{message}</div>;
}

export function formatAdminDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatMoney(value: number, currency = "IRR") {
  const label = currency === "IRR" ? "ریال" : currency;
  return `${new Intl.NumberFormat("fa-IR").format(value)} ${label}`;
}
