"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpenText, CircleDollarSign, HeartHandshake, Megaphone, MessageSquareText, ShieldCheck, Store, UsersRound } from "lucide-react";
import type { AdminDashboard, AdminFinanceSummary } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { AdminCard, AdminError, AdminPageHeader, formatMoney } from "@/components/admin/common";

type NavKey = "content" | "advertising" | "providers" | "community" | "users" | "finance" | "system";
const labels: Record<string, string> = { users: "کل کاربران", active_users: "کاربران فعال", children: "پرونده کودک", verified_clinicians: "متخصص تأییدشده", published_content: "محتوای منتشرشده", community_posts: "پست‌های جامعه", open_consultations: "مشاوره‌های باز", active_ad_campaigns: "کمپین فعال", orders: "سفارش‌ها", bookings: "رزروها", reviews: "نقدهای منتشرشده", ai_conversations: "گفت‌وگوهای هوشمند" };
const quick: Array<{ key: NavKey; title: string; desc: string; icon: typeof Store }> = [
  { key: "providers", title: "ارائه‌دهندگان", desc: "تأیید پزشک، مشاور، مدرس و فروشنده", icon: HeartHandshake },
  { key: "content", title: "محتوا", desc: "تدوین، بازبینی پزشکی و انتشار", icon: BookOpenText },
  { key: "advertising", title: "تبلیغات", desc: "تبلیغ‌دهنده، کمپین، خلاقه و گزارش", icon: Megaphone },
  { key: "community", title: "جامعه", desc: "گزارش‌ها و عملیات Moderation", icon: MessageSquareText },
  { key: "users", title: "کاربران و نقش‌ها", desc: "وضعیت حساب و RBAC مدیریتی", icon: UsersRound },
  { key: "finance", title: "مالی و کمیسیون", desc: "گردش خرید و سهم ارائه‌دهندگان", icon: CircleDollarSign },
];

export function AdminDashboardPanel({ onNavigate }: { onNavigate: (key: NavKey) => void }) {
  const dashboard = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => clientApi<AdminDashboard>("/api/ninibu/admin/backoffice/dashboard") });
  const finance = useQuery({ queryKey: ["admin", "finance", "summary"], queryFn: () => clientApi<AdminFinanceSummary>("/api/ninibu/admin/backoffice/finance") });
  const primaryCurrency = finance.data?.currencies[0];
  return <div className="admin-page">
    <AdminPageHeader eyebrow="Control Center" title="مرکز مدیریت نینیبو" description="نمای عملیاتی یکپارچه برای محتوا، جامعه، تبلیغات، ارائه‌دهندگان و جریان‌های تجاری؛ بدون نمایش جزئیات پرونده‌های خصوصی سلامت." />
    {dashboard.isError ? <AdminError message="دریافت نمای مدیریتی ناموفق بود." /> : null}
    <section className="admin-kpi-grid">
      {Object.entries(dashboard.data?.counts ?? {}).map(([key, value]) => <AdminCard key={key} className="admin-kpi"><small>{labels[key] ?? key}</small><strong>{new Intl.NumberFormat("fa-IR").format(value)}</strong></AdminCard>)}
    </section>
    {primaryCurrency ? <AdminCard className="admin-finance-highlight"><div><CircleDollarSign size={24}/><div><small>کمیسیون ثبت‌شده نینیبو</small><strong>{formatMoney(primaryCurrency.commission_amount, primaryCurrency.currency)}</strong></div></div><div><small>فروش پرداخت‌شده</small><b>{formatMoney(primaryCurrency.paid_gross_amount, primaryCurrency.currency)}</b></div><button onClick={() => onNavigate("finance")}>جزئیات مالی</button></AdminCard> : null}
    <div className="admin-section-heading"><div><ShieldCheck size={20}/><div><h2>عملیات اصلی</h2><p>ورود سریع به حوزه‌های حساس مدیریت</p></div></div></div>
    <section className="admin-quick-grid">{quick.map(({ key, title, desc, icon: Icon }) => <button className="admin-quick-card" key={key} onClick={() => onNavigate(key)}><span><Icon size={22}/></span><div><strong>{title}</strong><p>{desc}</p></div></button>)}</section>
    {dashboard.data?.privacy_note ? <div className="admin-privacy-note"><ShieldCheck size={18}/><span>{dashboard.data.privacy_note}</span></div> : null}
  </div>;
}
