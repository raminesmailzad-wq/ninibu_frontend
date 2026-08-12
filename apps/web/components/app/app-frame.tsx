"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Plus, RotateCcw, X } from "lucide-react";
import type { ListChildrenResponse, NotificationUnreadCount, Profile } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { ChildSwitcher } from "@/components/app/child-switcher";
import { DesktopNavigation, MobileNavigation, type AppSection } from "@/components/app/navigation";
import { Dashboard } from "@/components/dashboard/dashboard";
import { HealthDashboard } from "@/components/health/health-dashboard";
import { Community } from "@/components/community/community";
import { ServicesHub } from "@/components/services/services-hub";
import { QuickActionDialog, type QuickAction } from "@/components/quick-actions/quick-action-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const ACTIVE_CHILD_KEY = "ninibu_active_child_id";

export function AppFrame({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<AppSection>("home");
  const [activeChildId, setActiveChildId] = useState<number | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const stored = Number(window.localStorage.getItem(ACTIVE_CHILD_KEY));
    return Number.isSafeInteger(stored) && stored > 0 ? stored : undefined;
  });
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => clientApi<Profile>("/api/ninibu/profile") });
  const childrenQuery = useQuery({ queryKey: ["children"], queryFn: () => clientApi<ListChildrenResponse>("/api/ninibu/children?limit=100") });
  const unreadQuery = useQuery({ queryKey: ["notifications", "unread-count"], queryFn: () => clientApi<NotificationUnreadCount>("/api/ninibu/notifications/unread-count") });

  const childItems = childrenQuery.data?.items;
  const children = useMemo(() => childItems ?? [], [childItems]);
  const activeChild = useMemo(
    () => children.find((child) => child.id === activeChildId) ?? children[0],
    [children, activeChildId]
  );

  function changeActiveChild(id: number) {
    setActiveChildId(id);
    window.localStorage.setItem(ACTIVE_CHILD_KEY, String(id));
  }

  async function logout() {
    await fetch("/api/ninibu/auth/logout", { method: "POST" });
    window.localStorage.removeItem(ACTIVE_CHILD_KEY);
    onLogout();
  }

  if (profileQuery.isLoading || childrenQuery.isLoading) {
    return <div className="app-loading-shell">
      <aside className="sidebar"><Skeleton className="skeleton-logo" /><Skeleton className="skeleton-child" /><Skeleton className="skeleton-nav" /></aside>
      <main className="app-main"><Skeleton className="skeleton-header" /><div className="dashboard-grid"><Skeleton className="skeleton-hero" /><Skeleton className="skeleton-card" /><Skeleton className="skeleton-card" /></div></main>
    </div>;
  }

  if (profileQuery.isError || childrenQuery.isError) {
    return <main className="fatal-state">
      <div className="fatal-icon"><RotateCcw size={28} /></div>
      <h1>اتصال به نینیبو برقرار نشد</h1>
      <p>اطلاعات حساب یا فرزندان دریافت نشد. Backend را بررسی کنید و دوباره تلاش کنید.</p>
      <Button onClick={() => { profileQuery.refetch(); childrenQuery.refetch(); }}>تلاش دوباره</Button>
    </main>;
  }

  if (!activeChild) {
    return <main className="fatal-state">
      <div className="fatal-icon"><Plus size={28} /></div>
      <h1>هنوز فرزندی ثبت نشده</h1>
      <p>برای استفاده از داشبورد سلامت ابتدا یک فرزند به حساب اضافه کنید.</p>
    </main>;
  }

  const profile = profileQuery.data;
  const unreadCount = unreadQuery.data?.count ?? 0;

  return <div className="app-layout">
    <aside className={`sidebar ${mobileMenu ? "is-open" : ""}`}>
      <div className="sidebar-head">
        <button className="brand-lockup" onClick={() => setSection("home")} aria-label="خانه نینیبو">
          <Image src="/brand/ninibu-logo.png" alt="نینیبو" width={512} height={512} priority />
        </button>
        <button className="sidebar-close" onClick={() => setMobileMenu(false)} aria-label="بستن منو"><X size={20} /></button>
      </div>
      <ChildSwitcher items={children} activeId={activeChild.id} onChange={changeActiveChild} />
      <DesktopNavigation active={section} onChange={(next) => { setSection(next); setMobileMenu(false); }} />
      <div className="sidebar-footer">
        <div className="mini-profile">
          <span>{(profile?.first_name || "ن").slice(0, 1)}</span>
          <div><strong>{profile?.first_name || "کاربر نینیبو"} {profile?.last_name || ""}</strong><small>{profile?.city?.local_name || profile?.city?.name || "محل سکونت ثبت نشده"}</small></div>
        </div>
        <button className="logout-link" onClick={logout}><LogOut size={18} /> خروج</button>
      </div>
    </aside>
    {mobileMenu && <button className="sidebar-scrim" aria-label="بستن منو" onClick={() => setMobileMenu(false)} />}

    <main className="app-main">
      <header className="app-header">
        <div className="app-header-copy">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="باز کردن منو"><Menu size={21} /></button>
          <div><span>سلام {profile?.first_name || ""} 👋</span><strong>امروز حال {activeChild.first_name} چطوره؟</strong></div>
        </div>
        <div className="app-header-actions">
          <button className="notification-button" aria-label={`${unreadCount} اعلان خوانده‌نشده`}>
            <Bell size={20} />
            {unreadCount > 0 && <span>{unreadCount > 99 ? "۹۹+" : new Intl.NumberFormat("fa-IR").format(unreadCount)}</span>}
          </button>
          <div className="mobile-child-switcher"><ChildSwitcher items={children} activeId={activeChild.id} onChange={changeActiveChild} /></div>
        </div>
      </header>

      <div className="app-content">
        {section === "home" && <Dashboard child={activeChild} profile={profile} onQuickAction={setQuickAction} onOpenHealth={() => setSection("health")} />}
        {section === "health" && <HealthDashboard child={activeChild} onQuickAction={setQuickAction} />}
        {section === "community" && <Community accountProfile={profile} />}
        {section === "services" && <ServicesHub child={activeChild} profile={profile} />}
        {section === "profile" && <ProfilePanel profile={profile} childrenCount={children.length} onLogout={logout} />}
      </div>
    </main>

    <MobileNavigation active={section} onChange={setSection} />
    <QuickActionDialog action={quickAction} child={activeChild} onClose={() => setQuickAction(null)} />
  </div>;
}

function ProfilePanel({ profile, childrenCount, onLogout }: { profile?: Profile; childrenCount: number; onLogout: () => void }) {
  return <section className="profile-page">
    <div className="profile-hero-card">
      <span className="profile-avatar">{(profile?.first_name || "ن").slice(0, 1)}</span>
      <div><span className="eyebrow">حساب نینیبو</span><h2>{profile?.first_name} {profile?.last_name}</h2><p>{profile?.mobile}</p></div>
    </div>
    <div className="profile-grid">
      <article className="surface-card"><small>شهر محل اقامت</small><strong>{profile?.city?.local_name || profile?.city?.name || "—"}</strong><p>{profile?.province?.local_name || profile?.province?.name || ""}</p></article>
      <article className="surface-card"><small>فرزندان متصل</small><strong>{new Intl.NumberFormat("fa-IR").format(childrenCount)}</strong><p>قابل تغییر از انتخاب‌گر فرزند</p></article>
      <article className="surface-card"><small>وضعیت راه‌اندازی</small><strong>{profile?.onboarding_completed ? "تکمیل شده" : "ناقص"}</strong><p>اطلاعات اولیه حساب</p></article>
    </div>
    <Button variant="outline" onClick={onLogout}><LogOut size={18} /> خروج از حساب</Button>
  </section>;
}
