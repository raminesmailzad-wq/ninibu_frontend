"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarHeart, ChartNoAxesColumnIncreasing, HeartPulse, Pill, ScanLine, ShieldAlert, Syringe, Stethoscope } from "lucide-react";
import type { Child, GrowthChart, HealthTimelineResponse, ListAllergiesResponse, ListChildMedicationsResponse, ListGrowthMeasurementsResponse, ListMedicalVisitsResponse, ListVaccinationsResponse } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { formatDate, formatNumber, timelineTypeLabel, visitTypeLabel } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuickAction } from "@/components/quick-actions/quick-action-dialog";
import { GrowthStandardChart } from "@/components/health/growth-standard-chart";
import { NutritionRecommendations } from "@/components/health/nutrition-recommendations";
import { BookletImportModal } from "@/components/health/booklet-import-modal";

export function HealthDashboard({ child, onQuickAction }: { child: Child; onQuickAction: (action: QuickAction) => void }) {
  const [bookletImportOpen, setBookletImportOpen] = useState(false);
  const growth = useQuery({ queryKey: ["child", child.id, "growth", "health"], queryFn: () => clientApi<ListGrowthMeasurementsResponse>(`/api/ninibu/children/${child.id}/growth-measurements?limit=6`) });
  const growthChart = useQuery({ queryKey: ["child", child.id, "growth-chart", "who"], queryFn: () => clientApi<GrowthChart>(`/api/ninibu/children/${child.id}/growth-chart`) });
  const vaccinations = useQuery({ queryKey: ["child", child.id, "vaccinations", "health"], queryFn: () => clientApi<ListVaccinationsResponse>(`/api/ninibu/children/${child.id}/vaccinations?limit=1`) });
  const allergies = useQuery({ queryKey: ["child", child.id, "allergies", "health"], queryFn: () => clientApi<ListAllergiesResponse>(`/api/ninibu/children/${child.id}/allergies?limit=3&status=active`) });
  const medications = useQuery({ queryKey: ["child", child.id, "medications", "health"], queryFn: () => clientApi<ListChildMedicationsResponse>(`/api/ninibu/children/${child.id}/medications?limit=3&status=active`) });
  const visits = useQuery({ queryKey: ["child", child.id, "visits", "health"], queryFn: () => clientApi<ListMedicalVisitsResponse>(`/api/ninibu/children/${child.id}/medical-visits?limit=3`) });
  const timeline = useQuery({ queryKey: ["child", child.id, "timeline"], queryFn: () => clientApi<HealthTimelineResponse>(`/api/ninibu/children/${child.id}/health-timeline?limit=8`) });

  const latestGrowth = growth.data?.items[0];
  const hasAnyError = growth.isError || growthChart.isError || vaccinations.isError || allergies.isError || medications.isError || visits.isError || timeline.isError;

  return <div className="health-page">
    <section className="page-intro">
      <div><span className="section-kicker">پرونده خصوصی {child.first_name}</span><h1>سلامت و رشد فرزند</h1><p>روند رشد، واکسن‌ها، حساسیت‌ها، داروها و ویزیت‌ها در یک نمای واحد.</p></div>
      <div className="health-page-actions">
        <button onClick={() => onQuickAction("growth")}><ChartNoAxesColumnIncreasing size={18} /> ثبت رشد</button>
        <button onClick={() => setBookletImportOpen(true)}><ScanLine size={18} /> انتقال از دفترچه</button>
        <button onClick={() => onQuickAction("vaccination")}><Syringe size={18} /> واکسن</button>
        <button onClick={() => onQuickAction("visit")}><Stethoscope size={18} /> ویزیت</button>
      </div>
    </section>

    {hasAnyError && <div className="health-warning"><ShieldAlert size={18} /><span>بخشی از اطلاعات دریافت نشد. سایر بخش‌های پرونده همچنان قابل استفاده‌اند.</span></div>}

    <NutritionRecommendations child={child} />

    <section className="health-stat-grid">
      <HealthStat icon={Syringe} label="واکسن ثبت‌شده" value={vaccinations.data ? vaccinations.data.pagination.total : undefined} loading={vaccinations.isLoading} />
      <HealthStat icon={ShieldAlert} label="حساسیت فعال" value={allergies.data ? allergies.data.pagination.total : undefined} loading={allergies.isLoading} />
      <HealthStat icon={Pill} label="داروی فعال" value={medications.data ? medications.data.pagination.total : undefined} loading={medications.isLoading} />
      <HealthStat icon={CalendarHeart} label="ویزیت ثبت‌شده" value={visits.data ? visits.data.pagination.total : undefined} loading={visits.isLoading} />
    </section>

    <section className="health-columns">
      <article className="surface-card health-growth-detail">
        <div className="card-heading"><div><span className="card-icon purple"><Activity size={20} /></span><div><small>آخرین وضعیت</small><h3>رشد {child.first_name}</h3></div></div></div>
        {growth.isLoading ? <Skeleton className="health-detail-skeleton" /> : latestGrowth ? <>
          <div className="metric-row health-metrics">
            <div className="metric"><small>وزن</small><strong>{formatNumber(latestGrowth.weight_kg)}</strong><span>کیلوگرم</span></div>
            <div className="metric"><small>قد</small><strong>{formatNumber(latestGrowth.height_cm)}</strong><span>سانتی‌متر</span></div>
            <div className="metric"><small>دور سر</small><strong>{formatNumber(latestGrowth.head_circumference_cm)}</strong><span>سانتی‌متر</span></div>
          </div>
          <div className="measurement-history">
            <small>آخرین اندازه‌گیری‌ها</small>
            {growth.data?.items.slice(0, 4).map((item) => <div key={item.id}><span>{formatDate(item.measured_at)}</span><strong>{item.weight_kg ? `${formatNumber(item.weight_kg)} kg` : item.height_cm ? `${formatNumber(item.height_cm)} cm` : "ثبت رشد"}</strong></div>)}
          </div>
        </> : <EmptyHealth text="هنوز داده‌ای برای رشد ثبت نشده" />}
      </article>

      <article className="surface-card recent-health-card">
        <div className="card-heading"><div><span className="card-icon pink"><HeartPulse size={20} /></span><div><small>رکوردهای فعال و اخیر</small><h3>مرور سریع</h3></div></div></div>
        <div className="health-record-list">
          <RecordGroup icon={ShieldAlert} title="حساسیت‌ها" loading={allergies.isLoading} empty="حساسیت فعالی ثبت نشده">
            {allergies.data?.items.map((item) => <RecordRow key={item.id} title={item.allergen_name} meta={`${severityLabel(item.severity)} · ${item.allergy_type}`} />)}
          </RecordGroup>
          <RecordGroup icon={Pill} title="داروهای فعال" loading={medications.isLoading} empty="داروی فعالی ثبت نشده">
            {medications.data?.items.map((item) => <RecordRow key={item.id} title={item.medication_name} meta={item.frequency || formatDate(item.started_at)} />)}
          </RecordGroup>
          <RecordGroup icon={Stethoscope} title="ویزیت‌های اخیر" loading={visits.isLoading} empty="ویزیتی ثبت نشده">
            {visits.data?.items.map((item) => <RecordRow key={item.id} title={visitTypeLabel(item.visit_type)} meta={`${formatDate(item.visited_at)}${item.doctor_name ? ` · ${item.doctor_name}` : ""}`} />)}
          </RecordGroup>
        </div>
      </article>
    </section>

    {growthChart.isLoading ? <section className="surface-card who-growth-card"><Skeleton className="who-growth-loading" /></section> : growthChart.data ? <GrowthStandardChart chart={growthChart.data} childName={child.first_name} /> : <section className="surface-card who-growth-card"><div className="mini-error">نمودار رشد در حال حاضر در دسترس نیست.</div></section>}

    <BookletImportModal childId={child.id} childName={child.first_name} open={bookletImportOpen} onClose={() => setBookletImportOpen(false)} />

    <section className="surface-card timeline-card">
      <div className="card-heading"><div><span className="card-icon subtle"><Activity size={20} /></span><div><small>تاریخچه یکپارچه</small><h3>خط زمانی سلامت</h3></div></div></div>
      {timeline.isLoading ? <div className="timeline-loading"><Skeleton /><Skeleton /><Skeleton /></div> : timeline.data?.items.length ? <div className="timeline-list">
        {timeline.data.items.map((item) => <article key={`${item.type}-${item.entity_id}-${item.occurred_at}`} className="timeline-item">
          <span className="timeline-dot" />
          <div className="timeline-copy"><div><strong>{item.title}</strong><span>{formatDate(item.occurred_at)}</span></div><p>{item.summary || timelineTypeLabel(item.type)}</p><small>{timelineTypeLabel(item.type)}{item.verification_status ? ` · ${verificationLabel(item.verification_status)}` : ""}</small></div>
        </article>)}
      </div> : <EmptyHealth text="خط زمانی سلامت هنوز خالی است" />}
    </section>
  </div>;
}

function HealthStat({ icon: Icon, label, value, loading }: { icon: typeof Syringe; label: string; value?: number; loading: boolean }) {
  return <article className="health-stat"><span><Icon size={19} /></span><div><small>{label}</small>{loading ? <Skeleton className="stat-number-skeleton" /> : <strong>{value === undefined ? "—" : new Intl.NumberFormat("fa-IR").format(value)}</strong>}</div></article>;
}
function RecordGroup({ icon: Icon, title, loading, empty, children }: { icon: typeof Pill; title: string; loading: boolean; empty: string; children: ReactNode }) {
  const entries = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return <div className="record-group"><div className="record-group-title"><Icon size={17} /><strong>{title}</strong></div>{loading ? <Skeleton className="record-skeleton" /> : entries.length ? children : <p className="record-empty">{empty}</p>}</div>;
}
function RecordRow({ title, meta }: { title: string; meta: string }) { return <div className="record-row"><strong>{title}</strong><span>{meta}</span></div>; }
function EmptyHealth({ text }: { text: string }) { return <div className="empty-health"><HeartPulse size={22} /><p>{text}</p></div>; }
function severityLabel(value: string) { const map: Record<string, string> = { unknown: "نامشخص", mild: "خفیف", moderate: "متوسط", severe: "شدید", life_threatening: "بسیار شدید" }; return map[value] ?? value; }
function verificationLabel(value: string) { const map: Record<string, string> = { self_reported: "ثبت والد", clinician_verified: "تایید متخصص", verified: "تاییدشده", needs_correction: "نیازمند اصلاح" }; return map[value] ?? value; }
