"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BellRing, CalendarCheck2, CalendarHeart, ChartNoAxesColumnIncreasing, HeartHandshake, HeartPulse, MapPin, MessageCircleReply, MessagesSquare, Pill, Plus, ShieldCheck, Sparkles, Syringe, Stethoscope, X } from "lucide-react";
import type { BookingListResponse, Child, ConsultationQuestionListResponse, ListAllergiesResponse, ListChildMedicationsResponse, ListGrowthMeasurementsResponse, ListMedicalVisitsResponse, ListVaccinationsResponse, Profile, RecommendationListResponse } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { childAge, formatDate, formatNumber, visitTypeLabel } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { QuickAction } from "@/components/quick-actions/quick-action-dialog";
import { bookingDetailRoute, bookingRoute, consultationRoute } from "@/lib/routes";
import { listBookingDraftSummaries, removeBookingDraft, type BookingDraftSummary } from "@/lib/booking-drafts";
import { dedupeBookings, formatDateTime } from "@/components/services/services-data";
import { trackEvent } from "@/lib/analytics";
import { SponsoredSlot } from "@/components/advertising/sponsored-slot";

export function Dashboard({ child, profile, unreadCount, onQuickAction, onOpenHealth, onOpenMaternalHealth, onOpenNotifications, onNavigate }: { child: Child; profile?: Profile; unreadCount: number; onQuickAction: (action: QuickAction) => void; onOpenHealth: () => void; onOpenMaternalHealth: () => void; onOpenNotifications: () => void; onNavigate: (section: "community" | "discover" | "services") => void }) {
  const router = useRouter();
  const [bookingDrafts, setBookingDrafts] = useState<BookingDraftSummary[]>([]);
  const growth = useQuery({ queryKey: ["child", child.id, "growth", "latest"], queryFn: () => clientApi<ListGrowthMeasurementsResponse>(`/api/ninibu/children/${child.id}/growth-measurements?limit=1`) });
  const vaccinations = useQuery({ queryKey: ["child", child.id, "vaccinations", "dashboard"], queryFn: () => clientApi<ListVaccinationsResponse>(`/api/ninibu/children/${child.id}/vaccinations?limit=50`) });
  const allergies = useQuery({ queryKey: ["child", child.id, "allergies", "active-count"], queryFn: () => clientApi<ListAllergiesResponse>(`/api/ninibu/children/${child.id}/allergies?limit=1&status=active`) });
  const medications = useQuery({ queryKey: ["child", child.id, "medications", "active-count"], queryFn: () => clientApi<ListChildMedicationsResponse>(`/api/ninibu/children/${child.id}/medications?limit=1&status=active`) });
  const visits = useQuery({ queryKey: ["child", child.id, "visits", "latest"], queryFn: () => clientApi<ListMedicalVisitsResponse>(`/api/ninibu/children/${child.id}/medical-visits?limit=1`) });
  const recommendations = useQuery({ queryKey: ["child", child.id, "recommendations", "dashboard"], queryFn: () => clientApi<RecommendationListResponse>(`/api/ninibu/recommendations?limit=3&child_id=${child.id}`) });
  const bookings = useQuery({ queryKey: ["bookings", "dashboard-action-center"], queryFn: () => clientApi<BookingListResponse>("/api/ninibu/bookings?limit=20") });
  const consultations = useQuery({ queryKey: ["consultations", "dashboard-action-center"], queryFn: () => clientApi<ConsultationQuestionListResponse>("/api/ninibu/consultations/questions?limit=50") });

  useEffect(() => { setBookingDrafts(listBookingDraftSummaries()); }, []);

  const latestGrowth = growth.data?.items[0];
  const latestVisit = visits.data?.items[0];
  const nextDose = (vaccinations.data?.items ?? [])
    .filter((item) => item.next_dose_due_at && new Date(`${item.next_dose_due_at}T00:00:00`) >= new Date(new Date().toDateString()))
    .sort((a, b) => String(a.next_dose_due_at).localeCompare(String(b.next_dose_due_at)))[0];

  const resumeDraft = bookingDrafts[0];
  const upcomingBooking = useMemo(() => dedupeBookings(bookings.data?.items ?? [])
    .filter((item) => item.status === "confirmed" && Date.parse(item.starts_at) >= Date.now())
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0], [bookings.data]);
  const consultationWaiting = useMemo(() => (consultations.data?.items ?? [])
    .filter((item) => item.status === "waiting_for_parent")
    .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))[0], [consultations.data]);
  const vaccineDueSoon = useMemo(() => {
    const candidate = (vaccinations.data?.items ?? [])
      .filter((item) => item.next_dose_due_at)
      .sort((a, b) => String(a.next_dose_due_at).localeCompare(String(b.next_dose_due_at)))[0];
    if (!candidate?.next_dose_due_at) return undefined;
    const due = Date.parse(`${candidate.next_dose_due_at}T12:00:00`);
    return Number.isFinite(due) && due <= Date.now() + 30 * 24 * 60 * 60 * 1000 ? candidate : undefined;
  }, [vaccinations.data]);

  function openAction(target: string, action: string) {
    trackEvent("action_center_item_opened", { source: "dashboard", action, target_route: target });
    router.push(target);
  }

  function dismissDraft(serviceId: number) {
    removeBookingDraft(serviceId);
    setBookingDrafts((current) => current.filter((item) => item.serviceId !== serviceId));
    trackEvent("booking_draft_dismissed", { source: "dashboard", service_id: serviceId });
  }

  const hasActionItems = Boolean(resumeDraft || upcomingBooking || consultationWaiting || unreadCount > 0 || vaccineDueSoon);

  return <div className="dashboard-page">
    <section className="welcome-card">
      <div className="welcome-copy">
        <Badge tone="accent"><Sparkles size={14} /> همراه روزهای رشد {child.first_name}</Badge>
        <h1>{child.first_name}، {childAge(child.birth_date)}</h1>
        <p>داشبورد را بازطراحی کردیم تا پرونده سلامت فرزند، مسیر سلامت مادر و اقدام‌های روزانه با فاصله‌گذاری و خوانایی بهتر در دسترس باشند.</p>
        <div className="welcome-meta">
          <span><MapPin size={16} /> {profile?.city?.local_name || profile?.city?.name || "شهر ثبت نشده"}</span>
          <span><ShieldCheck size={16} /> پرونده سلامت خصوصی</span>
        </div>
      </div>
      <div className="welcome-orbit" aria-hidden="true"><span /><span /><HeartPulse size={46} /></div>
    </section>

    <SponsoredSlot placement="home_feed" className="dashboard-sponsored-slot" />

    <section className="quick-actions-section">
      <div className="section-heading"><div><span className="section-kicker">کارهای پرتکرار</span><h2>دسترسی سریع</h2></div></div>
      <div className="quick-actions-grid">
        <QuickActionButton icon={ChartNoAxesColumnIncreasing} label="ثبت رشد" hint="وزن، قد یا دور سر" onClick={() => onQuickAction("growth")} />
        <QuickActionButton icon={Syringe} label="ثبت واکسن" hint="دوز و تاریخ تزریق" onClick={() => onQuickAction("vaccination")} />
        <QuickActionButton icon={Stethoscope} label="ثبت ویزیت" hint="پزشک و نوع مراجعه" onClick={() => onQuickAction("visit")} />
      </div>
    </section>

    <section className="action-center-section">
      <div className="section-heading"><div><span className="section-kicker">ادامه مسیر</span><h2>برای اقدام</h2></div><small className="action-center-note">کارهای نیمه‌کاره و مواردی که نیاز به توجه شما دارند</small></div>
      {!hasActionItems ? <div className="action-center-empty surface-card"><CalendarCheck2 size={21} /><div><strong>فعلاً کاری منتظر شما نیست</strong><p>رزرو، مشاوره، اعلان یا یادآوری مهم بعدی اینجا ظاهر می‌شود.</p></div></div> : <div className="action-center-grid">
        {resumeDraft && <ActionCenterCard icon={CalendarCheck2} tone="purple" title="ادامه رزرو نیمه‌کاره" description={`${resumeDraft.serviceName} · ${bookingStageLabel(resumeDraft.stage)}`} actionLabel="ادامه" onClick={() => openAction(bookingRoute(resumeDraft.serviceId, resumeDraft.stage), "resume_booking")} onDismiss={() => dismissDraft(resumeDraft.serviceId)} />}
        {upcomingBooking && <ActionCenterCard icon={CalendarHeart} tone="pink" title="رزرو پیش‌رو" description={`${upcomingBooking.service_name || "خدمت رزروشده"} · ${formatDateTime(upcomingBooking.starts_at)}`} actionLabel="مشاهده رزرو" onClick={() => openAction(bookingDetailRoute(upcomingBooking.id), "upcoming_booking")} />}
        {consultationWaiting && <ActionCenterCard icon={MessageCircleReply} tone="purple" title="مشاوره منتظر پاسخ شماست" description="یک گفت‌وگوی مشاوره برای ادامه نیاز به پاسخ شما دارد." actionLabel="ادامه گفت‌وگو" onClick={() => openAction(consultationRoute(consultationWaiting.id), "consultation_waiting")} />}
        {unreadCount > 0 && <ActionCenterCard icon={BellRing} tone="pink" title={`${new Intl.NumberFormat("fa-IR").format(unreadCount)} اعلان خوانده‌نشده`} description="یادآوری‌ها و رویدادهای تازه را بررسی کنید." actionLabel="مشاهده اعلان‌ها" onClick={() => { trackEvent("action_center_item_opened", { source: "dashboard", action: "unread_notifications" }); onOpenNotifications(); }} />}
        {vaccineDueSoon && <ActionCenterCard icon={Syringe} tone="purple" title="پیگیری واکسن نزدیک است" description={`${vaccineDueSoon.vaccine_name} · ${formatDate(vaccineDueSoon.next_dose_due_at)}`} actionLabel="مشاهده سلامت" onClick={() => { trackEvent("action_center_item_opened", { source: "dashboard", action: "vaccine_due", target_route: "/health" }); onOpenHealth(); }} />}
      </div>}
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
        <div className="card-heading"><div><span className="card-icon pink"><HeartPulse size={20} /></span><div><small>خلاصه پرونده</small><h3>سلامت فرزند</h3></div></div><button className="text-link" onClick={onOpenHealth}>پرونده <ArrowLeft size={15} /></button></div>
        <div className="health-summary-list">
          <SummaryLine icon={Syringe} label="واکسن بعدی" value={nextDose ? `${nextDose.vaccine_name} · ${formatDate(nextDose.next_dose_due_at)}` : "مورد زمان‌بندی‌شده‌ای پیدا نشد"} loading={vaccinations.isLoading} />
          <SummaryLine icon={Pill} label="داروی فعال" value={medications.data ? `${new Intl.NumberFormat("fa-IR").format(medications.data.pagination.total)} مورد` : "—"} loading={medications.isLoading} />
          <SummaryLine icon={ShieldCheck} label="حساسیت فعال" value={allergies.data ? `${new Intl.NumberFormat("fa-IR").format(allergies.data.pagination.total)} مورد` : "—"} loading={allergies.isLoading} />
          <SummaryLine icon={CalendarHeart} label="آخرین ویزیت" value={latestVisit ? `${visitTypeLabel(latestVisit.visit_type)} · ${formatDate(latestVisit.visited_at)}` : "هنوز ویزیتی ثبت نشده"} loading={visits.isLoading} />
        </div>
      </article>
    </section>

    <section className="family-spotlight-grid">
      <article className="surface-card maternal-spotlight-card">
        <div className="card-heading"><div><span className="card-icon pink"><HeartHandshake size={20} /></span><div><small>مسیر مستقل</small><h3>سلامت مادر</h3></div></div><button className="text-link" onClick={onOpenMaternalHealth}>ورود <ArrowLeft size={15} /></button></div>
        <p>سلامت مادر از پرونده سلامت فرزند جدا شده تا مدیریت چرخه، بارداری، شیردهی و حال عمومی در مسیر مخصوص خودش انجام شود.</p>
        <div className="maternal-spotlight-actions">
          <button type="button" onClick={onOpenMaternalHealth}>رفتن به مسیر سلامت مادر</button>
          <small>مسیر جدید با ظاهر و فاصله‌گذاری بهینه در داشبورد در دسترس است.</small>
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

    <section className="discovery-strip" aria-label="مسیرهای پیشنهادی">
      <DiscoveryItem icon={MessagesSquare} title="جامعه والدین" text="تجربه‌ها و گروه‌های والدین" onClick={() => onNavigate("community")} />
      <DiscoveryItem icon={Stethoscope} title="مشاوره" text="پرسش از متخصصان تاییدشده" onClick={() => onNavigate("services")} />
      <DiscoveryItem icon={MapPin} title="مراکز نزدیک" text="مراکز تاییدشده شهر شما" onClick={() => onNavigate("discover")} />
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
function DiscoveryItem({ icon: Icon, title, text, onClick }: { icon: typeof MessagesSquare; title: string; text: string; onClick: () => void }) { return <button type="button" className="discovery-item" onClick={onClick}><span><Icon size={20} /></span><div><strong>{title}</strong><small>{text}</small></div><ArrowLeft size={16} className="discovery-arrow" /></button>; }
function ActionCenterCard({ icon: Icon, tone, title, description, actionLabel, onClick, onDismiss }: { icon: typeof CalendarCheck2; tone: "purple" | "pink"; title: string; description: string; actionLabel: string; onClick: () => void; onDismiss?: () => void }) {
  return <article className="action-center-card surface-card">
    <span className={`action-center-icon ${tone}`}><Icon size={19} /></span>
    <div className="action-center-copy"><strong>{title}</strong><p>{description}</p></div>
    <button type="button" className="action-center-action" onClick={onClick}>{actionLabel}<ArrowLeft size={14} /></button>
    {onDismiss && <button type="button" className="action-center-dismiss" onClick={onDismiss} aria-label="حذف از ادامه مسیر" title="دیگر نشان نده"><X size={14} /></button>}
  </article>;
}
function bookingStageLabel(stage: string) {
  const labels: Record<string, string> = { schedule: "انتخاب زمان", review: "تأیید رزرو", payment: "پرداخت", success: "تکمیل‌شده" };
  return labels[stage] ?? "ادامه رزرو";
}
function reasonLabel(reason: string) { const map: Record<string, string> = { vaccine_due: "بر اساس برنامه واکسن", visit_follow_up_due: "بر اساس پیگیری ویزیت", growth_check_due: "بر اساس روند رشد", matches_explicit_interest: "بر اساس علایق انتخابی شما", similar_to_bookmarked_content: "مشابه محتوای ذخیره‌شده" }; return map[reason] ?? "پیشنهاد هوشمند و قابل توضیح"; }
