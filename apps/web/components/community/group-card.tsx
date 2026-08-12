"use client";

import { Check, Clock3, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import type { CommunityGroup } from "@ninibu/types";
import { Button } from "@/components/ui/button";
import { membershipLabel } from "./community-data";

export function GroupCard({ group, busy, onOpen, onJoin, onLeave }: { group: CommunityGroup; busy?: boolean; onOpen: () => void; onJoin: () => void; onLeave: () => void }) {
  const active = group.membership_status === "active";
  const pending = group.membership_status === "pending";
  return <article className="community-group-card surface-card">
    <button className="community-group-main" onClick={onOpen}>
      <span className="community-group-avatar">{group.name.slice(0, 1)}</span>
      <div className="community-group-copy">
        <div className="community-group-title-row">
          <strong>{group.name}</strong>
          {group.is_official && <span className="official-badge"><ShieldCheck size={13}/> رسمی</span>}
        </div>
        <p>{group.description || "گروه والدین نینیبو"}</p>
        <div className="community-group-meta">
          <span><UsersRound size={13}/>{new Intl.NumberFormat("fa-IR").format(group.member_count)} عضو</span>
          <span>{group.visibility === "public" ? "عمومی" : <><LockKeyhole size={12}/> خصوصی</>}</span>
          <span>{group.category.name}</span>
        </div>
      </div>
    </button>
    <div className="community-group-actions">
      {active ? <Button variant="outline" disabled={busy} onClick={onLeave}><Check size={16}/>{membershipLabel(group.membership_status)}</Button>
        : pending ? <Button variant="secondary" disabled><Clock3 size={16}/>{membershipLabel(group.membership_status)}</Button>
        : group.membership_policy === "invitation_only" ? <Button variant="outline" disabled><LockKeyhole size={16}/>فقط با دعوت</Button>
        : <Button disabled={busy} onClick={onJoin}>{group.membership_policy === "approval_required" ? "درخواست عضویت" : "عضویت"}</Button>}
      <Button variant="ghost" onClick={onOpen}>مشاهده گروه</Button>
    </div>
  </article>;
}
