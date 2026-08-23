"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, Clock3, MapPin, MessageCircleQuestion, Search, Stethoscope } from "lucide-react";
import type { Child, CommerceCategory, Profile, ServiceListResponse, ServiceOffering } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ServiceBookingModal } from "./service-booking-modal";
import { BookingsPanel } from "./bookings-panel";
import { ConsultationsPanel } from "./consultations-panel";
import { formatMoney, serviceDeliveryLabel } from "./services-data";
import { bookingRoute, bookingRouteState, servicesTabFromPathname, type BookingStage } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";

export function ServicesHub({ child, profile }: { child: Child; profile?: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const tab = servicesTabFromPathname(pathname);

  function selectTab(next: "services" | "bookings" | "consultations") {
    const href = next === "services" ? "/services" : `/services/${next}`;
    if (href === pathname) return;
    trackEvent("services_tab_selected", { tab: next, target_route: href });
    router.push(href);
  }

  return <section className="services-page">
    <div className="services-hero">
      <div><span className="eyebrow">خدمات نینیبو</span><h1>مشاوره، دوره و رزرو خدمات</h1><p>خدمات مناسب را پیدا کن، زمان آزاد ببین و بدون دادن دسترسی ناخواسته به پرونده سلامت {child.first_name} رزرو انجام بده.</p></div>
      <div className="services-hero-meta"><span><MapPin size={16} /> {profile?.city?.local_name || profile?.city?.name || "شهر ثبت نشده"}</span><span><Stethoscope size={16} /> کودک فعال: {child.first_name}</span></div>
    </div>
    <div className="ninibu-free-note surface-card"><strong>استفاده از نینیبو رایگان است.</strong><span>پرداخت فقط زمانی انجام می‌شود که یک خدمت، مشاوره یا دوره پولی رزرو کنید؛ مدل درآمد نینیبو از کارمزد ارائه‌دهنده خدمت است و اشتراک عمومی نداریم.</span></div>
    <div className="services-tabs" role="tablist">
      <button className={tab === "services" ? "is-active" : ""} onClick={() => selectTab("services")}><Stethoscope size={17} /> خدمات</button>
      <button className={tab === "bookings" ? "is-active" : ""} onClick={() => selectTab("bookings")}><CalendarDays size={17} /> رزروهای من</button>
      <button className={tab === "consultations" ? "is-active" : ""} onClick={() => selectTab("consultations")}><MessageCircleQuestion size={17} /> مشاوره</button>
    </div>
    {tab === "services" && <ServiceCatalog child={child} />}
    {tab === "bookings" && <BookingsPanel />}
    {tab === "consultations" && <ConsultationsPanel child={child} />}
  </section>;
}

function ServiceCatalog({ child }: { child: Child }) {
  const router = useRouter();
  const pathname = usePathname();
  const routeState = bookingRouteState(pathname);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const categories = useQuery({ queryKey: ["commerce", "categories"], queryFn: () => clientApi<CommerceCategory[]>("/api/ninibu/commerce/categories") });
  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("category_id", categoryId);
    return params.toString();
  }, [search, categoryId]);
  const services = useQuery({ queryKey: ["commerce", "services", queryString], queryFn: () => clientApi<ServiceListResponse>(`/api/ninibu/commerce/services?${queryString}`) });
  const items = useMemo(() => services.data?.items ?? [], [services.data]);
  const selectedFromList = routeState ? items.find((item) => item.id === routeState.serviceId) : undefined;
  const selectedService = useQuery({
    queryKey: ["services", "detail", routeState?.serviceId],
    queryFn: () => clientApi<ServiceOffering>(`/api/ninibu/commerce/services/${routeState!.serviceId}`),
    enabled: Boolean(routeState),
    placeholderData: selectedFromList,
  });

  function openBooking(service: ServiceOffering) {
    trackEvent("booking_started", { funnel: "service_booking", step: "schedule", service_id: service.id });
    router.push(bookingRoute(service.id, "schedule"));
  }

  const changeBookingStage = useCallback((stage: BookingStage) => {
    if (!routeState) return;
    const href = bookingRoute(routeState.serviceId, stage);
    if (href !== pathname) router.replace(href);
  }, [routeState?.serviceId, pathname, router]);

  return <div className="service-catalog">
    <div className="service-toolbar surface-card"><label className="service-search"><Search size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی مشاور، دوره یا خدمت…" /></label><Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">همه دسته‌ها</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></div>
    {services.isLoading && <div className="service-list-state">در حال دریافت خدمات…</div>}
    {services.isError && <div className="service-list-state error-state">فهرست خدمات دریافت نشد. <button onClick={() => services.refetch()}>تلاش دوباره</button></div>}
    {!services.isLoading && !services.isError && items.length === 0 && <div className="services-empty"><Search size={28} /><strong>خدمتی پیدا نشد</strong><p>عبارت جست‌وجو یا دسته‌بندی را تغییر بده.</p></div>}
    <div className="service-grid">{items.map((service) => <article className="service-card surface-card" key={service.id}>
      <div className="service-card-icon"><Stethoscope size={22} /></div>
      <div className="service-card-tags"><span>{service.category_name || "خدمت"}</span><span>{serviceDeliveryLabel[service.delivery_type] || service.delivery_type}</span></div>
      <h3>{service.name}</h3><p>{service.description}</p>
      <div className="service-card-provider"><span>{service.seller_name || "ارائه‌دهنده تأییدشده"}</span>{service.duration_minutes && <span><Clock3 size={14} /> {new Intl.NumberFormat("fa-IR").format(service.duration_minutes)} دقیقه</span>}</div>
      <footer><strong>{formatMoney(service.price_amount, service.currency)}</strong><button onClick={() => openBooking(service)}>دیدن زمان‌ها <ChevronLeft size={16} /></button></footer>
    </article>)}</div>
    {routeState && selectedService.isLoading && <div className="service-modal-route-loading">در حال آماده‌سازی رزرو…</div>}
    {routeState && selectedService.data && <ServiceBookingModal
      service={selectedService.data}
      child={child}
      stage={routeState.stage}
      onStageChange={changeBookingStage}
      onClose={() => router.push("/services")}
      onViewBookings={() => router.push("/services/bookings")}
    />}
  </div>;
}
