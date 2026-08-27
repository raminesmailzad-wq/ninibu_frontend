"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpenText, CircleDollarSign, FileImage, LayoutDashboard, LogOut, MapPinned, Megaphone, MessageSquareWarning, Settings2, ShieldCheck, Store, UsersRound } from "lucide-react";
import type { AuthSession, User } from "@ninibu/types";
import { AdminLogin } from "@/components/admin/admin-login";
import { Button } from "@/components/ui/button";
import { AdminDashboardPanel } from "@/components/admin/dashboard-panel";
import { AdminContentPanel } from "@/components/admin/content-panel";
import { AdminAdvertisingPanel } from "@/components/admin/advertising-panel";
import { AdminProvidersPanel } from "@/components/admin/providers-panel";
import { AdminCommunityPanel } from "@/components/admin/community-panel";
import { AdminUsersPanel } from "@/components/admin/users-panel";
import { AdminFinancePanel } from "@/components/admin/finance-panel";
import { AdminSystemPanel } from "@/components/admin/system-panel";
import { AdminMediaPanel } from "@/components/admin/media-panel";
import { AdminCareLocationsPanel } from "@/components/admin/care-locations-panel";

type Section = "dashboard" | "content" | "media" | "care-locations" | "advertising" | "providers" | "community" | "users" | "finance" | "system";
type Phase = "loading" | "login" | "forbidden" | "ready";

const nav: Array<{ key: Section; label: string; icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "نمای کلی", icon: LayoutDashboard },
  { key: "content", label: "محتوا", icon: BookOpenText },
  { key: "media", label: "رسانه و فایل", icon: FileImage },
  { key: "care-locations", label: "مراکز و نقشه", icon: MapPinned },
  { key: "advertising", label: "تبلیغات", icon: Megaphone },
  { key: "providers", label: "ارائه‌دهندگان", icon: Store },
  { key: "community", label: "جامعه و گزارش‌ها", icon: MessageSquareWarning },
  { key: "users", label: "کاربران و دسترسی", icon: UsersRound },
  { key: "finance", label: "مالی و کمیسیون", icon: CircleDollarSign },
  { key: "system", label: "سیستم و Audit", icon: Settings2 },
];

function sectionFromPath(pathname: string): Section {
  const part = pathname.replace(/^\/admin\/?/, "").split("/")[0] as Section;
  return nav.some((item) => item.key === part) ? part : "dashboard";
}

export function AdminShell() {
  const pathname = usePathname();
  const router = useRouter();
  const section = sectionFromPath(pathname);
  const [phase, setPhase] = useState<Phase>("loading");
  const [user, setUser] = useState<User>();
  const isStaff = useMemo(() => user?.role === "admin" || user?.role === "super_admin", [user]);

  async function resolve() {
    try {
      const response = await fetch("/api/ninibu/auth/session", { cache: "no-store" });
      const body = await response.json() as { data?: AuthSession };
      if (!body.data?.authenticated || !body.data.user) { setUser(undefined); setPhase("login"); return; }
      setUser(body.data.user);
      setPhase(["admin", "super_admin"].includes(body.data.user.role) ? "ready" : "forbidden");
    } catch { setPhase("login"); }
  }

  useEffect(() => { void resolve(); }, []);

  async function logout() {
    await fetch("/api/ninibu/auth/logout", { method: "POST" });
    setUser(undefined); setPhase("login");
  }

  if (phase === "loading") return <div className="admin-loading"><div className="admin-loading-mark">n</div><strong>در حال بررسی دسترسی مدیریت…</strong></div>;
  if (phase === "login") return <div className="center-stage admin-login-stage"><div className="admin-login-copy"><ShieldCheck size={34}/><div><strong>پنل مدیریت نینیبو</strong><span>ورود فقط برای Admin و Super Admin</span></div></div><AdminLogin onAuthenticated={resolve} /></div>;
  if (phase === "forbidden" || !isStaff) return <main className="admin-forbidden"><ShieldCheck size={42}/><h1>دسترسی مدیریت ندارید</h1><p>این حساب با نقش <b>{user?.role || "user"}</b> وارد شده است. پنل ادمین فقط برای حساب‌های مدیریتی در دسترس است.</p><div><Button onClick={() => router.push("/dashboard")}>بازگشت به نینیبو</Button><Button variant="outline" onClick={logout}>خروج از حساب</Button></div></main>;

  return <div className="admin-layout">
    <aside className="admin-sidebar">
      <button className="admin-brand" onClick={() => router.push("/admin")}><Image src="/brand/ninibu-logo.png" alt="نینیبو" width={512} height={512}/><span>مدیریت</span></button>
      <div className="admin-role-card"><ShieldCheck size={18}/><div><strong>{user?.first_name || "مدیر"} {user?.last_name || ""}</strong><span>{user?.role === "super_admin" ? "Super Admin" : "Admin"}</span></div></div>
      <nav>{nav.map(({ key, label, icon: Icon }) => <button key={key} className={section === key ? "is-active" : ""} onClick={() => router.push(key === "dashboard" ? "/admin" : `/admin/${key}`)}><Icon size={19}/><span>{label}</span></button>)}</nav>
      <div className="admin-sidebar-bottom"><button onClick={() => router.push("/dashboard")}><BarChart3 size={18}/>اپ اصلی</button><button onClick={logout}><LogOut size={18}/>خروج</button></div>
    </aside>
    <main className="admin-main">
      {section === "dashboard" && <AdminDashboardPanel onNavigate={(key) => router.push(`/admin/${key}`)} />}
      {section === "content" && <AdminContentPanel />}
      {section === "media" && <AdminMediaPanel />}
      {section === "care-locations" && <AdminCareLocationsPanel />}
      {section === "advertising" && <AdminAdvertisingPanel />}
      {section === "providers" && <AdminProvidersPanel />}
      {section === "community" && <AdminCommunityPanel />}
      {section === "users" && <AdminUsersPanel currentUser={user!} />}
      {section === "finance" && <AdminFinancePanel />}
      {section === "system" && <AdminSystemPanel isSuperAdmin={user?.role === "super_admin"} />}
    </main>
  </div>;
}
