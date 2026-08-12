import type { CommunityPostType, CommunityReactionType, CommunityReportReason } from "@ninibu/types";

export const postTypeLabels: Record<CommunityPostType, string> = {
  question: "سؤال",
  experience: "تجربه",
  discussion: "گفت‌وگو",
  tip: "نکته",
  poll: "نظرسنجی",
  announcement: "اطلاعیه"
};

export const reactionLabels: Array<{ type: CommunityReactionType; label: string; emoji: string }> = [
  { type: "like", label: "پسندیدم", emoji: "♡" },
  { type: "helpful", label: "مفید", emoji: "✦" },
  { type: "support", label: "همراهتم", emoji: "🤝" },
  { type: "thanks", label: "ممنون", emoji: "🌷" }
];

export const reportReasons: Array<{ value: CommunityReportReason; label: string }> = [
  { value: "medical_misinformation", label: "اطلاعات پزشکی نادرست" },
  { value: "dangerous_advice", label: "توصیه خطرناک" },
  { value: "harassment", label: "آزار یا توهین" },
  { value: "spam", label: "هرزنامه" },
  { value: "advertising", label: "تبلیغات نامرتبط" },
  { value: "privacy_violation", label: "نقض حریم خصوصی" },
  { value: "inappropriate_content", label: "محتوای نامناسب" },
  { value: "other", label: "سایر" }
];

export function membershipLabel(status?: string) {
  if (status === "active") return "عضو هستید";
  if (status === "pending") return "در انتظار تأیید";
  if (status === "muted") return "محدود شده";
  if (status === "banned") return "مسدود شده";
  return "عضویت";
}
