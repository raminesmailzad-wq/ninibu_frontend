"use client";

import { CalendarDays, Compass, HeartPulse, Home, MessageCircleMore, ShoppingBag, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppSection = "home" | "health" | "community" | "discover" | "services" | "shop" | "profile";

const items: Array<{ key: AppSection; label: string; icon: typeof Home }> = [
  { key: "home", label: "خانه", icon: Home },
  { key: "health", label: "سلامت", icon: HeartPulse },
  { key: "community", label: "جامعه", icon: MessageCircleMore },
  { key: "discover", label: "کشف", icon: Compass },
  { key: "services", label: "خدمات", icon: CalendarDays },
  { key: "shop", label: "فروشگاه", icon: ShoppingBag },
  { key: "profile", label: "پروفایل", icon: UserRound }
];

export function DesktopNavigation({ active, onChange }: { active: AppSection; onChange: (section: AppSection) => void }) {
  return <nav className="desktop-nav" aria-label="ناوبری اصلی">
    {items.map(({ key, label, icon: Icon }) => <button key={key} className={cn("nav-item", active === key && "is-active")} onClick={() => onChange(key)}>
      <Icon size={20} /> <span>{label}</span>
    </button>)}
  </nav>;
}

const mobileItems = items.filter((item) => item.key !== "profile");

export function MobileNavigation({ active, onChange }: { active: AppSection; onChange: (section: AppSection) => void }) {
  return <nav className="mobile-nav" aria-label="ناوبری اصلی">
    {mobileItems.map(({ key, label, icon: Icon }) => <button key={key} className={cn("mobile-nav-item", active === key && "is-active")} onClick={() => onChange(key)}>
      <Icon size={20} /> <span>{label}</span>
    </button>)}
  </nav>;
}
