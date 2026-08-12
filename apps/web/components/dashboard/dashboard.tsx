"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarHeart, ChartNoAxesColumnIncreasing, HeartPulse, MapPin, MessagesSquare, Pill, Plus, ShieldCheck, Sparkles, Syringe, Stethoscope } from "lucide-react";
import type { Child, ListAllergiesResponse, ListChildMedicationsResponse, ListGrowthMeasurementsResponse, ListMedicalVisitsResponse, ListVaccinationsResponse, Profile, RecommendationListResponse } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { childAge, formatDate, formatNumber, visitTypeLabel } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { QuickAction } from "@/components/quick-actions/quick-action-dialog";

export function Dashboard({ child, profile, onQuickAction, onOpenHealth }: { child: Child; profile?: Profile; onQuickAction: (action: QuickAction) => void; onOpenHealth: () => void }) {
  const growth = useQuery({ queryKey: ["child", child.id, "growth", "latest"], queryFn: () => clientApi<ListGrowthMeasurementsResponse>(`/api/ninibu/children/${child.id}/growth-measurements?limit=1`) });
  const vaccinations = useQuery({ queryKey: ["child", child.id, "vaccinations", "dashboard"], queryFn: () => clientApi<ListVaccinationsResponse>(`/api/ninibu/children/${child.id}/vaccinations?limit=50`) });
  const allergies = useQuery({ queryKey: ["child", child.id, "allergies", "active-count"], queryFn: () => clientApi<ListAllergiesResponse>(`/api/ninibu/children/${child.id}/allergies?limit=1&status=active`) });
  const medications = useQuery({ queryKey: ["child", child.id, "medications", "active-count"], queryFn: () => clientApi<ListChildMedicationsResponse>(`/api/ninibu/children/${child.id}/medications?limit=1&status=active`) });
  const visits = useQuery({ queryKey: ["child", child.id, "visits", "latest"], queryFn: () => clientApi<ListMedicalVisitsResponse>(`/api/ninibu/children/${child.id}/medical-visits?limit=1`) });
  const recommendations = useQuery({ queryKey: ["child", child.id, "recommendations", "dashboard"], queryFn: () => clientApi<RecommendationListResponse>(`/api/ninibu/recommendations?limit=3&child_id=${child.id}`) });

  const latestGrowth = growth.data?.items[0];
  const latestVisit = visits.data?.items[0];
  const nextDose = (vaccinations.data?.items ?? [])
    .filter((item) => item.next_dose_due_at && new Date(`${item.next_dose_due_at}T00:00:00`) >= new Date(new Date().toDateString()))
    .sort((a, b) => String(a.next_dose_due_at).localeCompare(String(b.next_dose_due_at)))[0];

  return <div className="dashboard-page">
    <section className="welcome-card">
      <div className="welcome-copy">
        <Badge tone="accent"><Sparkles size={14} /> همراه روزهای رشد {child.first_name}</Badge>
        <h1>{child.first_name}، {childAge(child.birth_date)}</h1>
        <p>یک نمای سریع از رشد و پرونده سلامت؛ بدون اینکه لازم باشد بین چند صفحه بگردید.</p>
        <div className="welcome-meta">
          <span><MapPin size={16} /> {profile?.city?.local_name || profile?.city?.name || "شهر ثبت نشده"}</span>
          <span><ShieldCheck size={16} /> پرونده سلامت خصوصی</span>
        </div>
      </div>
      <div className="welcome-orbit" aria-hidden="true"><span /><span /><HeartPulse size={46} /></div>
    </section>

    <section className="quick-actions-section">
      <div className="section-heading"><div><span className="section-kicker">کارهای پرتکرار</span><h2>دسترسی سریع</h2></div></div>
      <div className="quick-actions-grid">
        <QuickActionButton icon={ChartNoAxesColumnIncreasing} label="ثبت رشد" hint="وزن، قد یا دور سر" onClick={() => onQuickAction("growth")} />
        <QuickActionButton icon={Syringe} label="ثبت واکسن" hint="دوز و تاریخ تزریق" onClick={() => onQuickAction("vaccination")} />
        <QuickActionButton icon={Stethoscope} label="ثبت ویزیت" hint="پزشک و نوع مراجعه" onClick={() => onQuickAction("visit")} />
      </div>
    </section>

    <section className="overview-grid">
      <article className="surface-card growth-card">
        <div className="card-heading"><div><span className="card-icon purple"><ChartNoAxesColumnIncreasing size={20} /></span><div><small>آخرین اندازه‌گیری</small><h3>رشد</h3></div></div><button className="text-link" onClick={onOpenHealth}>جزئیات <ArrowLeft size={15} /></button></div>
        {growth.isLoading ? <MetricSkeleton /> : growth.isError ? <MiniError /> : latestGrowth ? <>
          <div className="metric-row">
            <Metric label="وزن" value={formatNumber(latestGrowth.weight_kg)} unit="کیلوگرم" />
            <Metric label="قد" value={formatNumber(latestGrowth.height_cm)} unit="سانتی‌متر" />
            <Metric label="دور سر" value={formatNumber(latestGrowth.head_circumference_cm)} unit="سانتی‌متر" />
          </div>
          <p className="card-footnote">ثبت‌شده در {formatDate(latestGrowth.measured_at)}</p>
        </> : <EmptyCompact text="هنوز اندازه‌گیری رشد ثبت نشده" action="ثبت اولین اندازه‌گیری" onClick={() => onQuickAction("growth")} />}
      </article>

      <article className="surface-card health-card">
        <div className="card-heading"><div><span className="card-icon pink"><HeartPulse size={20} /></span><div><small>خلاصه پرونده</small><h3>سلامت</h3></div></div><button className="text-link" onClick={onOpenHealth}>پرونده <ArrowLeft size={15} /></button></div>
        <div className="health-summary-list">
          <SummaryLine icon={Syringe} label="واکسن بعدی" value={nextDose ? `${nextDose.vaccine_name} · ${formatDate(nextDose.next_dose_due_at)}` : "مورد زمان‌بندی‌شده‌ای پیدا نشد"} loading={vaccinations.isLoading} />
          <SummaryLine icon={Pill} label="داروی فعال" value={medications.data ? `${new Intl.NumberFormat("fa-IR").format(medications.data.pagination.total)} مورد` : "—"} loading={medications.isLoading} />
          <SummaryLine icon={ShieldCheck} label="حساسیت فعال" value={allergies.data ? `${new Intl.NumberFormat("fa-IR").format(allergies.data.pagination.total)} مورد` : "—"} loading={allergies.isLoading} />
          <SummaryLine icon={CalendarHeart} label="آخرین ویزیت" value={latestVisit ? `${visitTypeLabel(latestVisit.visit_type)} · ${formatDate(latestVisit.visited_at)}` : "هنوز ویزیتی ثبت نشده"} loading={visits.isLoading} />
        </div>
      </article>
    </section>

    <section className="recommendation-section">
      <div className="section-heading"><div><span className="section-kicker">برای شما</span><h2>پیشنهادهای نینیبو</h2></div></div>
      {recommendations.isLoading ? <div className="recommendation-grid"><Skeleton className="recommendation-skeleton" /><Skeleton className="recommendation-skeleton" /><Skeleton className="recommendation-skeleton" /></div> : recommendations.isError ? <MiniError /> : recommendations.data?.items.length ? <div className="recommendation-grid">
        {recommendations.data.items.map((item) => <article key={item.id} className="recommendation-card">
          <div className="recommendation-top"><span className="card-icon subtle"><Sparkles size={18} /></span><Badge tone={item.priority === "high" ? "warning" : "default"}>{item.category}</Badge></div>
          <h3>{item.title}</h3><p>{item.message}</p><small>{reasonLabel(item.reason_code)}</small>
        </article>)}
      </div> : <div className="empty-recommendations"><Sparkles size={22} /><div><strong>فعلاً پیشنهاد تازه‌ای نداریم</strong><p>با استفاده بیشتر از نینیبو، پیشنهادهای مرتبط اینجا ظاهر می‌شوند.</p></div></div>}
    </section>

    <section className="discovery-strip">
      <DiscoveryItem icon={MessagesSquare} title="جامعه والدین" text="تجربه‌ها و گروه‌های والدین" />
      <DiscoveryItem icon={Stethoscope} title="مشاوره" text="پرسش از متخصصان تاییدشده" />
      <DiscoveryItem icon={MapPin} title="مراکز نزدیک" text="مراکز تاییدشده شهر شما" />
    </section>
  </div>;
}

function QuickActionButton({ icon: Icon, label, hint, onClick }: { icon: typeof Plus; label: string; hint: string; onClick: () => void }) {
  return <button className="quick-action-button" onClick={onClick}><span><Icon size={21} /></span><div><strong>{label}</strong><small>{hint}</small></div><Plus size={18} className="quick-plus" /></button>;
}
function Metric({ label, value, unit }: { label: string; value: string; unit: string }) { return <div className="metric"><small>{label}</small><strong>{value}</strong><span>{unit}</span></div>; }
function MetricSkeleton() { return <div className="metric-row"><Skeleton className="metric-skeleton" /><Skeleton className="metric-skeleton" /><Skeleton className="metric-skeleton" /></div>; }
function MiniError() { return <div className="mini-error">دریافت اطلاعات با خطا روبه‌رو شد.</div>; }
function EmptyCompact({ text, action, onClick }: { text: string; action: string; onClick: () => void }) { return <div className="empty-compact"><p>{text}</p><button onClick={onClick}>{action}</button></div>; }
function SummaryLine({ icon: Icon, label, value, loading }: { icon: typeof Syringe; label: string; value: string; loading?: boolean }) { return <div className="summary-line"><span className="summary-icon"><Icon size={17} /></span><div><small>{label}</small>{loading ? <Skeleton className="summary-skeleton" /> : <strong>{value}</strong>}</div></div>; }
function DiscoveryItem({ icon: Icon, title, text }: { icon: typeof MessagesSquare; title: string; text: string }) { return <article><span><Icon size={20} /></span><div><strong>{title}</strong><small>{text}</small></div></article>; }
function reasonLabel(reason: string) { const map: Record<string, string> = { vaccine_due: "بر اساس برنامه واکسن", visit_follow_up_due: "بر اساس پیگیری ویزیت", growth_check_due: "بر اساس روند رشد", matches_explicit_interest: "بر اساس علایق انتخابی شما", similar_to_bookmarked_content: "مشابه محتوای ذخیره‌شده" }; return map[reason] ?? "پیشنهاد هوشمند و قابل توضیح"; }
