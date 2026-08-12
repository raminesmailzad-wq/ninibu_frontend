"use client";

import { Baby, ChevronDown } from "lucide-react";
import type { Child } from "@ninibu/types";
import { childAge } from "@/lib/format";

export function ChildSwitcher({ items, activeId, onChange }: { items: Child[]; activeId?: number; onChange: (id: number) => void }) {
  const active = items.find((child) => child.id === activeId) ?? items[0];
  if (!active) return null;
  return <label className="child-switcher">
    <span className="child-avatar" aria-hidden="true"><Baby size={20} /></span>
    <span className="child-switcher-copy">
      <small>فرزند فعال</small>
      <strong>{active.first_name} {active.last_name}</strong>
      <em>{childAge(active.birth_date)}</em>
    </span>
    <select aria-label="انتخاب فرزند" value={active.id} onChange={(event) => onChange(Number(event.target.value))}>
      {items.map((child) => <option key={child.id} value={child.id}>{child.first_name} {child.last_name}</option>)}
    </select>
    <ChevronDown size={17} className="child-switcher-chevron" aria-hidden="true" />
  </label>;
}
