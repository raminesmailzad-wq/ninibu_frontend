"use client";

import { formatPersianTime } from "@/lib/datetime";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CalendarDays, ExternalLink, RefreshCw, XCircle } from "lucide-react";
import type { Booking, BookingListResponse, ServiceAvailability } from "@ninibu/types";
import { clientApi, NinibuApiError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModalPortal } from "@/components/ui/modal-portal";
import { bookingStatusLabel, dedupeBookings, formatDateOnly, formatDateTime, formatMoney } from "./services-data";
import { bookingDetailRoute, bookingDetailRouteState } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";

export function BookingsPanel() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const routeBookingId = bookingDetailRouteState(pathname);
  const query = useQuery({ queryKey: ["bookings"], queryFn: () => clientApi<BookingListResponse>("/api/ninibu/bookings?limit=100") });
  const items = useMemo(() => dedupeBookings(query.data?.items ?? []).sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()), [query.data]);
  const selectedFromList = routeBookingId ? items.find((item) => item.id === routeBookingId) : undefined;
  const detailQuery = useQuery({
    queryKey: ["bookings", "detail", routeBookingId],
    queryFn: () => clientApi<Booking>(`/api/ninibu/bookings/${routeBookingId}`),
    enabled: Boolean(routeBookingId),
    placeholderData: selectedFromList,
  });
  const selected = detailQuery.data ?? selectedFromList ?? null;

  function openBookingDetail(booking: Booking) {
    const href = bookingDetailRoute(booking.id);
    trackEvent("booking_detail_opened", { source: "bookings", target_route: href, status: booking.status });
    router.push(href);
  }

  if (query.isLoading) return <div className="service-list-state">در حال دریافت رزروها…</div>;
  if (query.isError) return <div className="service-list-state error-state">رزروها دریافت نشدند. <button onClick={() => query.refetch()}>تلاش دوباره</button></div>;
  if (items.length === 0) return <div className="services-empty"><CalendarDays size={28} /><strong>هنوز رزروی نداری</strong><p>از بخش خدمات، زمان مناسب را انتخاب و رزرو کن.</p></div>;

  return <div className="bookings-list">
    {items.map((booking) => <article className="booking-card surface-card" key={booking.id}>
      <div className="booking-card-main">
        <span className={`booking-status status-${booking.status}`}>{bookingStatusLabel[booking.status] || booking.status}</span>
        <h3>{booking.service_name || `خدمت #${new Intl.NumberFormat("fa-IR").format(booking.service_offering_id)}`}</h3>
        <p>{booking.seller_name || "ارائه‌دهنده خدمت"}</p>
        <div className="booking-card-facts"><span><CalendarClock size={15} /> {formatDateTime(booking.starts_at)}</span><span>{formatMoney(booking.price_amount_snapshot, booking.currency)}</span></div>
      </div>
      <div className="booking-card-actions">
        {booking.meeting?.meeting_url && <a className="booking-meeting-link" href={booking.meeting.meeting_url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> ورود به جلسه</a>}
        <Button variant="outline" onClick={() => openBookingDetail(booking)}>جزئیات</Button>
      </div>
    </article>)}
    {routeBookingId && detailQuery.isLoading && <div className="service-modal-route-loading">در حال دریافت جزئیات رزرو…</div>}
    {selected && <BookingActions booking={selected} onClose={() => router.push("/services/bookings")} onChanged={async () => { await queryClient.invalidateQueries({ queryKey: ["bookings"] }); await queryClient.invalidateQueries({ queryKey: ["bookings", "detail", routeBookingId] }); }} />}
  </div>;
}

function BookingActions({ booking, onClose, onChanged }: { booking: Booking; onClose: () => void; onChanged: (booking: Booking) => Promise<void> }) {
  const [mode, setMode] = useState<"view" | "cancel" | "reschedule">("view");
  const [reason, setReason] = useState("");
  const [slot, setSlot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const availability = useQuery({
    queryKey: ["services", "availability", booking.service_offering_id, "reschedule"],
    queryFn: () => clientApi<ServiceAvailability>(`/api/ninibu/commerce/services/${booking.service_offering_id}/available-slots`),
    enabled: mode === "reschedule"
  });
  const days = useMemo(() => availability.data?.days.filter((day) => day.slots.length > 0) ?? [], [availability.data]);

  async function cancelBooking() {
    if (!reason.trim()) return setError("دلیل لغو را وارد کنید.");
    setBusy(true); setError("");
    try {
      const updated = await clientApi<Booking>(`/api/ninibu/bookings/${booking.id}/cancel`, { method: "POST", body: JSON.stringify({ reason: reason.trim() }) });
      await onChanged(updated); setMode("view");
    } catch (caught) { setError(caught instanceof NinibuApiError ? caught.message : "لغو رزرو انجام نشد."); }
    finally { setBusy(false); }
  }

  async function rescheduleBooking() {
    if (!slot) return setError("زمان جدید را انتخاب کنید.");
    setBusy(true); setError("");
    try {
      const updated = await clientApi<Booking>(`/api/ninibu/bookings/${booking.id}/reschedule`, { method: "POST", body: JSON.stringify({ starts_at: slot }) });
      await onChanged(updated); setMode("view"); setSlot("");
    } catch (caught) { setError(caught instanceof NinibuApiError ? caught.message : "تغییر زمان انجام نشد."); }
    finally { setBusy(false); }
  }

  const actionable = booking.status === "confirmed" || booking.status === "pending_payment";
  return <ModalPortal ariaLabel="جزئیات رزرو" onClose={onClose} backdropClassName="service-modal-backdrop" contentClassName="service-modal booking-detail-modal">
      <header><strong>جزئیات رزرو</strong><button onClick={onClose} aria-label="بستن"><XCircle size={19} /></button></header>
      <div className="booking-detail-body">
        <div className="booking-detail-title"><span className={`booking-status status-${booking.status}`}>{bookingStatusLabel[booking.status] || booking.status}</span><h2>{booking.service_name || "خدمت رزروشده"}</h2><p>{booking.seller_name || "ارائه‌دهنده"}</p></div>
        <dl className="booking-detail-grid"><div><dt>زمان</dt><dd>{formatDateTime(booking.starts_at)}</dd></div><div><dt>شماره رزرو</dt><dd dir="ltr">{booking.booking_number}</dd></div><div><dt>مبلغ</dt><dd>{formatMoney(booking.price_amount_snapshot, booking.currency)}</dd></div><div><dt>منطقه زمانی</dt><dd dir="ltr">{booking.timezone}</dd></div></dl>
        {booking.notes && <div className="booking-note"><strong>یادداشت شما</strong><p>{booking.notes}</p></div>}
        {booking.refund_may_be_required && <div className="booking-warning">این رزرو پرداخت شده است و لغو ممکن است نیازمند فرایند بازپرداخت باشد.</div>}

        {mode === "view" && <div className="booking-detail-actions">
          {booking.meeting?.meeting_url && <a className="booking-meeting-link wide" href={booking.meeting.meeting_url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> ورود به جلسه آنلاین</a>}
          {actionable && <Button variant="outline" onClick={() => setMode("reschedule")}><RefreshCw size={16} /> تغییر زمان</Button>}
          {actionable && <Button variant="outline" onClick={() => setMode("cancel")}><XCircle size={16} /> لغو رزرو</Button>}
        </div>}

        {mode === "cancel" && <div className="booking-action-box"><strong>لغو رزرو</strong><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="دلیل لغو" />{error && <p className="service-error">{error}</p>}<div><Button disabled={busy} onClick={cancelBooking}>تأیید لغو</Button><Button variant="ghost" onClick={() => { setMode("view"); setError(""); }}>انصراف</Button></div></div>}

        {mode === "reschedule" && <div className="booking-action-box"><strong>انتخاب زمان جدید</strong>{availability.isLoading && <p>در حال دریافت زمان‌ها…</p>}{availability.isError && <p className="service-error">زمان‌های آزاد دریافت نشد.</p>}<div className="reschedule-days">{days.map((day) => <div key={day.date}><span>{formatDateOnly(day.date)}</span><div>{day.slots.map((item) => <button key={item.starts_at} className={slot === item.starts_at ? "is-active" : ""} onClick={() => setSlot(item.starts_at)}>{formatPersianTime(item.starts_at)}</button>)}</div></div>)}</div>{error && <p className="service-error">{error}</p>}<div><Button disabled={busy || !slot} onClick={rescheduleBooking}>ثبت زمان جدید</Button><Button variant="ghost" onClick={() => { setMode("view"); setError(""); }}>انصراف</Button></div></div>}
      </div>
  </ModalPortal>;
}
