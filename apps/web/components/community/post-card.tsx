"use client";

import { BadgeCheck, Flag, Lock, MessageCircle, Pin, ShieldAlert } from "lucide-react";
import type { CommunityPost, CommunityReactionType } from "@ninibu/types";
import { formatRelativeFa } from "./time";
import { postTypeLabels, reactionLabels } from "./community-data";

export function PostCard({ post, reactionBusy, onOpen, onReact, onReport }: { post: CommunityPost; reactionBusy?: boolean; onOpen: () => void; onReact: (type: CommunityReactionType, active: boolean) => void; onReport: () => void }) {
  return <article className="community-post surface-card">
    <header className="community-post-head">
      <div className="community-author">
        <span className="community-author-avatar">{post.author.is_anonymous ? "؟" : post.author.display_name.slice(0, 1)}</span>
        <div>
          <div className="community-author-name">
            <strong>{post.author.display_name}</strong>
            {post.author.author_type === "verified_clinician" && <span className="clinician-badge"><BadgeCheck size={13}/> متخصص تأییدشده</span>}
            {post.author.is_mine && <span className="mine-badge">شما</span>}
          </div>
          <small>{post.group_name} · {formatRelativeFa(post.published_at)}</small>
        </div>
      </div>
      <div className="community-post-head-actions">
        {post.is_pinned && <span title="سنجاق‌شده"><Pin size={15}/></span>}
        {post.is_locked && <span title="قفل‌شده"><Lock size={15}/></span>}
        <button onClick={onReport} aria-label="گزارش پست"><Flag size={16}/></button>
      </div>
    </header>

    <button className="community-post-body" onClick={onOpen}>
      <span className="post-type-chip">{postTypeLabels[post.post_type]}</span>
      {post.title && <h3>{post.title}</h3>}
      <p>{post.body}</p>
      {post.requires_review && <span className="review-chip"><ShieldAlert size={13}/> در حال بررسی ایمنی</span>}
      {post.medical_disclaimer && <div className="medical-disclaimer">{post.medical_disclaimer}</div>}
    </button>

    <footer className="community-post-footer">
      <div className="reaction-row">
        {reactionLabels.map(({type,label,emoji}) => {
          const summary = post.reactions?.find((item) => item.reaction_type === type);
          return <button key={type} disabled={reactionBusy} className={summary?.reacted_by_me ? "is-reacted" : ""} onClick={() => onReact(type, Boolean(summary?.reacted_by_me))}>
            <span>{emoji}</span>{label}{summary?.count ? <b>{new Intl.NumberFormat("fa-IR").format(summary.count)}</b> : null}
          </button>;
        })}
      </div>
      <button className="comment-count" onClick={onOpen}><MessageCircle size={16}/>{new Intl.NumberFormat("fa-IR").format(post.comment_count)} دیدگاه</button>
    </footer>
  </article>;
}
