"use client";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Salad } from "lucide-react";
import type { Child, ChildNutritionRecommendationListResponse } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export function NutritionRecommendations({ child }: { child: Child }) {
  const query = useQuery({ queryKey: ["child", child.id, "nutrition-recommendations"], queryFn: () => clientApi<ChildNutritionRecommendationListResponse>(`/api/ninibu/children/${child.id}/nutrition-recommendations`) });
  const items = (query.data?.items ?? []).filter((item) => item.status === "active");
  return <section className="surface-card nutrition-recommendations-card"><div className="card-heading"><div><span className="card-icon subtle"><Salad size={20}/></span><div><small>متصل به پرونده کودک</small><h3>غذا و ویتامین پیشنهادی</h3></div></div></div>{query.isLoading ? <Skeleton className="record-skeleton" /> : items.length ? <div className="nutrition-recommendation-list">{items.map((item) => <article key={item.id}><div className="nutrition-recommendation-head"><div><strong>{item.title}</strong><span>{item.clinician_name}{item.clinician_specialty ? ` · ${item.clinician_specialty}` : ""}</span></div><em><BadgeCheck size={15}/> متخصص تأییدشده</em></div><p>{item.guidance}</p>{item.rationale && <small>دلیل پیشنهاد: {item.rationale}</small>}{item.follow_up_at && <small>پیگیری پیشنهادی: {formatDate(item.follow_up_at)}</small>}</article>)}</div> : <div className="empty-health"><Salad size={22}/><p>هنوز توصیه تغذیه‌ای ثبت نشده است. پزشک دارای دسترسی می‌تواند بر اساس داده‌های پرونده پیشنهاد ثبت کند.</p></div>}<div className="nutrition-safety-note">مکمل و ویتامین توسط نینیبو به‌صورت خودکار تجویز نمی‌شود؛ توصیه‌های این بخش فقط از متخصص تأییدشده نمایش داده می‌شوند.</div></section>;
}
