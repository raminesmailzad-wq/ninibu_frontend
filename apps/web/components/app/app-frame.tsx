"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LogOut, Menu, Plus, RotateCcw, X } from "lucide-react";
import type { ListChildrenResponse, NotificationUnreadCount, Profile } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { ChildSwitcher } from "@/components/app/child-switcher";
import { DesktopNavigation, MobileNavigation, type AppSection } from "@/components/app/navigation";
import { Dashboard } from "@/components/dashboard/dashboard";
import { HealthDashboard } from "@/components/health/health-dashboard";
import { Community } from "@/components/community/community";
import { ServicesHub } from "@/components/services/services-hub";
import { DiscoverHub } from "@/components/discovery/discover-hub";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { QuickActionDialog, type QuickAction } from "@/components/quick-actions/quick-action-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfilePanel } from "@/components/profile/profile-panel";
import { ShopHub } from "@/components/shop/shop-hub";
import { SponsoredSlot } from "@/components/advertising/sponsored-slot";
import { RouteAnalytics } from "@/components/app/route-analytics";
import { sectionFromPathname, sectionRoutes } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";
import { MaternalHealthHub } from "@/components/health/maternal-health-hub";

const ACTIVE_CHILD_KEY = "ninibu_active_child_id";

export function AppFrame({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const section: AppSection = sectionFromPathname(pathname);
  const [activeChildId, setActiveChildId] = useState<number | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const stored = Number(window.localStorage.getItem(ACTIVE_CHILD_KEY));
    return Number.isSafeInteger(stored) && stored > 0 ? stored : undefined;
  });
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notificationOpenRequest, setNotificationOpenRequest] = useState(0);

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: () => clientApi<Profile>("/api/ninibu/profile") });
  const childrenQuery = useQuery({ queryKey: ["children"], queryFn: () => clientApi<ListChildrenResponse>("/api/ninibu/children?limit=100") });
  const unreadQuery = useQuery({ queryKey: ["notifications", "unread-count"], queryFn: () => clientApi<NotificationUnreadCount>("/api/ninibu/notifications/unread-count") });

  const childItems = childrenQuery.data?.items;
  const children = useMemo(() => childItems ?? [], [childItems]);
  const activeChild = useMemo(
    () => children.find((child) => child.id === activeChildId) ?? children[0],
    [children, activeChildId]
  );

  function navigateTo(next: AppSection) {
    const href = sectionRoutes[next];
    if (href === pathname) return;
    trackEvent("navigation_selected", { from_section: section, to_section: next, target_route: href });
    router.push(href);
  }

  function goBack() {
    trackEvent("navigation_back", { from_section: section, from_route: pathname });
    router.back();
  }

  function changeActiveChild(id: number) {
    trackEvent("active_child_changed", { section, source: "child_switcher" });
    setActiveChildId(id);
    window.localStorage.setItem(ACTIVE_CHILD_KEY, String(id));
  }

  async function logout() {
    trackEvent("logout_clicked", { section });
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
      <p>اطلاعات حساب یا فرزندان دریافت نشد. دوباره تلاش کنید و در صورت تداوم مشکل، سرویس‌ها را بررسی کنید.</p>
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
  const headerSubtitle = section === "maternal" ? `سلام ${profile?.first_name || ""} 👋` : `سلام ${profile?.first_name || ""} 👋`;
  const headerTitle = section === "maternal" ? "امروز حال شما چطوره؟" : `امروز حال ${activeChild.first_name} چطوره؟`;

  return <div className="app-layout">
    <RouteAnalytics />
    <aside className={`sidebar ${mobileMenu ? "is-open" : ""}`}>
      <div className="sidebar-head">
        <button className="brand-lockup" onClick={() => navigateTo("home")} aria-label="خانه نینیبو">
          <Image src="/brand/ninibu-logo.png" alt="نینیبو" width={512} height={512} priority />
        </button>
        <button className="sidebar-close" onClick={() => setMobileMenu(false)} aria-label="بستن منو"><X size={20} /></button>
      </div>
      <ChildSwitcher items={children} activeId={activeChild.id} onChange={changeActiveChild} />
      <DesktopNavigation active={section} onChange={(next) => { navigateTo(next); setMobileMenu(false); }} />
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
          {pathname !== "/dashboard" && <button className="app-back-button" type="button" onClick={goBack} aria-label="بازگشت به صفحه قبل" title="بازگشت"><ArrowRight size={16} /></button>}
          <div><span>{headerSubtitle}</span><strong>{headerTitle}</strong></div>
        </div>
        <div className="app-header-actions">
          <NotificationCenter unreadCount={unreadCount} openRequest={notificationOpenRequest} />
          <div className="mobile-child-switcher"><ChildSwitcher items={children} activeId={activeChild.id} onChange={changeActiveChild} /></div>
        </div>
      </header>

      <div className="app-content">
        {section === "home" && <Dashboard child={activeChild} profile={profile} unreadCount={unreadCount} onQuickAction={setQuickAction} onOpenHealth={() => navigateTo("health")} onOpenMaternalHealth={() => navigateTo("maternal")} onOpenNotifications={() => setNotificationOpenRequest((current) => current + 1)} onNavigate={navigateTo} />}
        {section === "health" && <HealthDashboard child={activeChild} onQuickAction={setQuickAction} />}
        {section === "maternal" && <MaternalHealthHub />}
        {section === "community" && <><SponsoredSlot placement="community_feed" className="section-sponsored-slot" /><Community accountProfile={profile} /></>}
        {section === "discover" && <><SponsoredSlot placement="public_content_list" className="section-sponsored-slot" /><DiscoverHub child={activeChild} profile={profile} /></>}
        {section === "services" && <ServicesHub child={activeChild} profile={profile} />}
        {section === "shop" && <ShopHub profile={profile} />}
        {section === "profile" && <ProfilePanel profile={profile} children={children} activeChildId={activeChild.id} onSelectChild={changeActiveChild} onLogout={logout} />}
      </div>
    </main>

    <MobileNavigation active={section} onChange={navigateTo} />
    <QuickActionDialog action={quickAction} child={activeChild} onClose={() => setQuickAction(null)} />
  </div>;
}
