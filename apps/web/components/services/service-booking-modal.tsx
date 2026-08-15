"use client";

import { formatPersianTime } from "@/lib/datetime";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, CreditCard, MapPin, Monitor, X } from "lucide-react";
import type { Booking, Child, Payment, ServiceAvailability, ServiceOffering } from "@ninibu/types";
import { clientApi, NinibuApiError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModalPortal } from "@/components/ui/modal-portal";
import { formatDateOnly, formatDateTime, formatMoney, serviceDeliveryLabel } from "./services-data";
import { abandonFunnel, advanceFunnel, completeFunnel, startFunnel, trackEvent } from "@/lib/analytics";
import type { BookingStage } from "@/lib/routes";
import { readBookingDraft, removeBookingDraft, writeBookingDraft } from "@/lib/booking-drafts";

export function ServiceBookingModal({
  service,
  child,
  stage,
  onStageChange,
  onClose,
  onViewBookings,
}: {
  service: ServiceOffering;
  child: Child;
  stage: BookingStage;
  onStageChange: (stage: BookingStage) => void;
  onClose: () => void;
  onViewBookings: () => void;
}) {
  const queryClient = useQueryClient();
  const initialDraft = useMemo(() => readBookingDraft(service.id), [service.id]);
  const [selectedDate, setSelectedDate] = useState(initialDraft.selectedDate ?? "");
  const [selectedSlot, setSelectedSlot] = useState(initialDraft.selectedSlot ?? "");
  const [attachChild, setAttachChild] = useState(initialDraft.attachChild ?? true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(initialDraft.booking ?? null);
  const [payment, setPayment] = useState<Payment | null>(initialDraft.payment ?? null);
  const previousStage = useRef<BookingStage | null>(null);
  const initialFunnelStage = useRef<BookingStage>(stage);

  const detailQuery = useQuery({
    queryKey: ["services", "detail", service.id],
    queryFn: () => clientApi<ServiceOffering>(`/api/ninibu/commerce/services/${service.id}`),
    initialData: service
  });
  const availabilityQuery = useQuery({
    queryKey: ["services", "availability", service.id],
    queryFn: () => clientApi<ServiceAvailability>(`/api/ninibu/commerce/services/${service.id}/available-slots`)
  });

  const days = useMemo(() => availabilityQuery.data?.days.filter((day) => day.slots.some((slot) => slot.available)) ?? [], [availabilityQuery.data]);
  const activeDate = selectedDate || days[0]?.date || "";
  const slots = useMemo(() => days.find((day) => day.date === activeDate)?.slots.filter((slot) => slot.available) ?? [], [days, activeDate]);
  const activeService = detailQuery.data ?? service;
  const analyticsFunnelKey = String(service.id);

  useEffect(() => {
    startFunnel("service_booking", analyticsFunnelKey, initialFunnelStage.current, { service_id: service.id });
    if (initialDraft.savedAt) {
      trackEvent("booking_draft_resumed", { funnel: "service_booking", step: initialFunnelStage.current, service_id: service.id, source: "saved_draft" });
    }
  }, [analyticsFunnelKey, initialDraft.savedAt, service.id]);

  useEffect(() => {
    writeBookingDraft(service.id, { selectedDate, selectedSlot, attachChild, booking, payment, stage, serviceName: service.name });
  }, [service.id, service.name, selectedDate, selectedSlot, attachChild, booking, payment, stage]);

  useEffect(() => {
    if (stage !== "payment" || !booking?.id) return;
    let cancelled = false;
    void clientApi<Booking>(`/api/ninibu/bookings/${booking.id}`).then((fresh) => {
      if (cancelled) return;
      setBooking(fresh);
      writeBookingDraft(service.id, { selectedDate, selectedSlot, attachChild, booking: fresh, payment, stage: "payment", serviceName: service.name });
      if (fresh.status === "confirmed") {
        trackEvent("booking_completed", { funnel: "service_booking", service_id: service.id, payment_required: true });
        completeFunnel("service_booking", analyticsFunnelKey, { service_id: service.id, payment_required: true });
        onStageChange("success");
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [stage, booking?.id, service.id, service.name, selectedDate, selectedSlot, attachChild, payment, onStageChange, analyticsFunnelKey]);

  useEffect(() => {
    if (stage === "review" && !selectedSlot) {
      onStageChange("schedule");
      return;
    }
    if (stage === "payment" && (!booking || !payment)) {
      onStageChange(selectedSlot ? "review" : "schedule");
      return;
    }
    if (stage === "success" && !booking) {
      onStageChange(selectedSlot ? "review" : "schedule");
      return;
    }
    if (previousStage.current === stage) return;
    previousStage.current = stage;
    advanceFunnel("service_booking", analyticsFunnelKey, stage, { service_id: service.id });
    trackEvent("booking_funnel_step_viewed", {
      funnel: "service_booking",
      step: stage,
      service_id: service.id,
    });
  }, [stage, service.id, selectedSlot, booking, payment, onStageChange, analyticsFunnelKey]);

  async function createBooking() {
    if (!selectedSlot) {
      setError("لطفاً یکی از زمان‌های آزاد را انتخاب کنید.");
      onStageChange("schedule");
      return;
    }
    trackEvent("booking_submit_clicked", { funnel: "service_booking", step: "review", service_id: service.id });
    setSubmitting(true);
    setError("");
    try {
      const created = await clientApi<Booking>("/api/ninibu/bookings", {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ service_offering_id: service.id, child_id: attachChild ? child.id : undefined, starts_at: selectedSlot, notes: notes.trim() })
      });
      setBooking(created);
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      if (created.payment_required && created.order_id) {
        const createdPayment = await clientApi<Payment>(`/api/ninibu/commerce/orders/${created.order_id}/payments`, {
          method: "POST",
          headers: { "Idempotency-Key": crypto.randomUUID() },
          body: JSON.stringify({ provider: process.env.NEXT_PUBLIC_NINIBU_PAYMENT_PROVIDER?.trim() || "sandbox" })
        });
        setPayment(createdPayment);
        writeBookingDraft(service.id, { selectedDate: activeDate, selectedSlot, attachChild, booking: created, payment: createdPayment, stage: "payment", serviceName: service.name });
        onStageChange("payment");
      } else {
        writeBookingDraft(service.id, { selectedDate: activeDate, selectedSlot, attachChild, booking: created, payment: null, stage: "success", serviceName: service.name });
        trackEvent("booking_completed", { funnel: "service_booking", service_id: service.id, payment_required: false });
        completeFunnel("service_booking", analyticsFunnelKey, { service_id: service.id, payment_required: false });
        onStageChange("success");
      }
    } catch (caught) {
      setError(caught instanceof NinibuApiError ? caught.message : "رزرو انجام نشد. دوباره تلاش کنید.");
      trackEvent("booking_submit_failed", { funnel: "service_booking", step: "review", service_id: service.id });
    } finally {
      setSubmitting(false);
    }
  }

  async function sandboxResult(success: boolean) {
    if (!payment) return;
    trackEvent("booking_payment_result_selected", { funnel: "service_booking", service_id: service.id, sandbox_success: success });
    setSubmitting(true);
    setError("");
    try {
      const updatedPayment = await clientApi<Payment>(`/api/ninibu/payments/sandbox/${payment.id}/${success ? "succeed" : "fail"}`, { method: "POST" });
      setPayment(updatedPayment);
      let updatedBooking = booking;
      if (booking) {
        updatedBooking = await clientApi<Booking>(`/api/ninibu/bookings/${booking.id}`);
        setBooking(updatedBooking);
      }
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      writeBookingDraft(service.id, { selectedDate: activeDate, selectedSlot, attachChild, booking: updatedBooking, payment: updatedPayment, stage: success ? "success" : "payment", serviceName: service.name });
      if (success && (updatedPayment.status === "paid" || updatedBooking?.status === "confirmed")) {
        trackEvent("booking_completed", { funnel: "service_booking", service_id: service.id, payment_required: true });
        completeFunnel("service_booking", analyticsFunnelKey, { service_id: service.id, payment_required: true });
        onStageChange("success");
      }
    } catch (caught) {
      setError(caught instanceof NinibuApiError ? caught.message : "نتیجه پرداخت ثبت نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    if (stage !== "success") {
      writeBookingDraft(service.id, { selectedDate: activeDate, selectedSlot, attachChild, booking, payment, stage, serviceName: service.name });
      trackEvent("booking_abandoned", { funnel: "service_booking", step: stage, service_id: service.id });
      trackEvent("booking_draft_saved", { funnel: "service_booking", step: stage, service_id: service.id });
      abandonFunnel("service_booking", analyticsFunnelKey, { service_id: service.id, reason: "modal_closed" });
    } else {
      removeBookingDraft(service.id);
    }
    onClose();
  }

  function viewBookings() {
    removeBookingDraft(service.id);
    trackEvent("booking_success_view_bookings", { funnel: "service_booking", service_id: service.id });
    onViewBookings();
  }

  if (booking && (stage === "success" || !booking.payment_required || payment?.status === "paid" || booking.status === "confirmed")) {
    return <ModalFrame onClose={closeModal} title="رزرو ثبت شد">
      <div className="booking-success">
        <span><CheckCircle2 size={28} /></span>
        <h3>وقت شما ثبت شد</h3>
        <p>{booking.service_name || service.name}</p>
        <dl>
          <div><dt>زمان</dt><dd>{formatDateTime(booking.starts_at)}</dd></div>
          <div><dt>شماره رزرو</dt><dd dir="ltr">{booking.booking_number}</dd></div>
          <div><dt>وضعیت</dt><dd>{booking.status === "confirmed" ? "تأیید شده" : booking.status}</dd></div>
        </dl>
        <Button onClick={viewBookings}>مشاهده رزروها</Button>
      </div>
    </ModalFrame>;
  }

  if (booking && payment) {
    const httpRedirect = payment.redirect_url?.startsWith("https://") || payment.redirect_url?.startsWith("http://");
    return <ModalFrame onClose={closeModal} title="پرداخت رزرو">
      <div className="payment-step">
        <span className="service-modal-icon"><CreditCard size={24} /></span>
        <h3>{formatMoney(payment.amount, payment.currency)}</h3>
        <p>برای قطعی شدن این زمان، پرداخت باید قبل از پایان مهلت رزرو تأیید شود.</p>
        {booking.hold_expires_at && <div className="booking-hold-note"><Clock3 size={16} /> مهلت نگه‌داری: {formatDateTime(booking.hold_expires_at)}</div>}
        {payment.provider === "sandbox" && <div className="sandbox-box">
          <strong>درگاه آزمایشی توسعه</strong>
          <p>این کنترل فقط برای Sandbox Backend است و تراکنش واقعی انجام نمی‌دهد.</p>
          <div><Button disabled={submitting} onClick={() => sandboxResult(true)}>شبیه‌سازی پرداخت موفق</Button><Button variant="outline" disabled={submitting} onClick={() => sandboxResult(false)}>پرداخت ناموفق</Button></div>
        </div>}
        {httpRedirect && <Button onClick={() => {
          trackEvent("booking_payment_redirected", { funnel: "service_booking", service_id: service.id });
          window.location.assign(payment.redirect_url ?? "");
        }}>رفتن به درگاه پرداخت</Button>}
        {payment.status === "failed" && <p className="service-error">{payment.failure_message || "پرداخت ناموفق بود. یک رزرو جدید یا پرداخت مجدد ایجاد کنید."}</p>}
        {error && <p className="service-error">{error}</p>}
      </div>
    </ModalFrame>;
  }

  return <ModalFrame onClose={closeModal} title="رزرو خدمت">
    <div className="service-booking-content">
      <div className="service-modal-head">
        <span className="service-modal-icon">{activeService.delivery_type === "online" ? <Monitor size={23} /> : <MapPin size={23} />}</span>
        <div><span>{activeService.category_name || "خدمات نینیبو"}</span><h2>{activeService.name}</h2><p>{activeService.seller_name || "ارائه‌دهنده تأییدشده"}</p></div>
      </div>
      <div className="service-facts">
        <span><Clock3 size={15} /> {activeService.duration_minutes ? `${new Intl.NumberFormat("fa-IR").format(activeService.duration_minutes)} دقیقه` : "مدت متغیر"}</span>
        <span><CalendarDays size={15} /> {serviceDeliveryLabel[activeService.delivery_type] || activeService.delivery_type}</span>
        <strong>{formatMoney(activeService.price_amount, activeService.currency)}</strong>
      </div>
      <p className="service-description">{activeService.description}</p>

      <section className="booking-slot-section">
        <div className="service-section-title"><div><strong>انتخاب زمان</strong><small>{availabilityQuery.data?.timezone || ""}</small></div></div>
        {availabilityQuery.isLoading && <div className="slot-loading">در حال دریافت زمان‌های آزاد…</div>}
        {availabilityQuery.isError && <div className="service-error">برای این خدمت برنامه زمان‌بندی فعالی پیدا نشد.</div>}
        {!availabilityQuery.isLoading && !availabilityQuery.isError && days.length === 0 && <div className="service-empty-mini">در بازه فعلی زمان آزادی وجود ندارد.</div>}
        {days.length > 0 && <>
          <div className="booking-days">{days.map((day) => <button type="button" key={day.date} className={activeDate === day.date ? "is-active" : ""} onClick={() => {
            setSelectedDate(day.date);
            setSelectedSlot("");
            setError("");
            writeBookingDraft(service.id, { selectedDate: day.date, selectedSlot: "", attachChild, booking, payment, stage: "schedule", serviceName: service.name });
            trackEvent("booking_date_selected", { funnel: "service_booking", step: "schedule", service_id: service.id });
            onStageChange("schedule");
          }}>{formatDateOnly(day.date)}<small>{new Intl.NumberFormat("fa-IR").format(day.slots.length)} زمان</small></button>)}</div>
          <div className="booking-slots">{slots.map((slot) => <button type="button" key={slot.starts_at} className={selectedSlot === slot.starts_at ? "is-active" : ""} onClick={() => {
            setSelectedDate(activeDate);
            setSelectedSlot(slot.starts_at);
            setError("");
            writeBookingDraft(service.id, { selectedDate: activeDate, selectedSlot: slot.starts_at, attachChild, booking, payment, stage: "review", serviceName: service.name });
            trackEvent("booking_slot_selected", { funnel: "service_booking", step: "review", service_id: service.id });
            onStageChange("review");
          }}>{formatPersianTime(slot.starts_at)}</button>)}</div>
        </>}
      </section>

      <label className="attach-child-row"><input type="checkbox" checked={attachChild} onChange={(event) => setAttachChild(event.target.checked)} /><span><strong>این رزرو برای {child.first_name} است</strong><small>رزرو کودک فقط کودک را به وقت مرتبط می‌کند و دسترسی درمانی جدیدی به ارائه‌دهنده نمی‌دهد.</small></span></label>
      <label className="service-notes"><span>یادداشت برای ارائه‌دهنده <small>اختیاری</small></span><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="مثلاً توضیح کوتاه درباره هدف جلسه؛ اطلاعات پزشکی حساس را فقط در جای مناسب ثبت کنید." /></label>
      {stage === "review" && selectedSlot && <div className="booking-funnel-hint">زمان انتخاب شد؛ در صورت تأیید، مرحله بعد ثبت رزرو و در صورت نیاز پرداخت است.</div>}
      {error && <p className="service-error">{error}</p>}
      <Button disabled={submitting || !selectedSlot} onClick={createBooking}>{submitting ? "در حال ثبت…" : activeService.price_amount > 0 ? "ادامه و پرداخت" : "ثبت رزرو رایگان"}</Button>
    </div>
  </ModalFrame>;
}

function ModalFrame({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <ModalPortal ariaLabel={title} onClose={onClose} backdropClassName="service-modal-backdrop" contentClassName="service-modal">
    <header><strong>{title}</strong><button type="button" onClick={onClose} aria-label="بستن"><X size={19} /></button></header>
    {children}
  </ModalPortal>;
}
