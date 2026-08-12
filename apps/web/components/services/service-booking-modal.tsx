"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, CreditCard, MapPin, Monitor, X } from "lucide-react";
import type { Booking, Child, Payment, ServiceAvailability, ServiceOffering } from "@ninibu/types";
import { clientApi, NinibuApiError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateOnly, formatDateTime, formatMoney, serviceDeliveryLabel } from "./services-data";

export function ServiceBookingModal({ service, child, onClose }: { service: ServiceOffering; child: Child; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [attachChild, setAttachChild] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

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

  async function createBooking() {
    if (!selectedSlot) {
      setError("لطفاً یکی از زمان‌های آزاد را انتخاب کنید.");
      return;
    }
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
          body: JSON.stringify({})
        });
        setPayment(createdPayment);
      }
    } catch (caught) {
      setError(caught instanceof NinibuApiError ? caught.message : "رزرو انجام نشد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  async function sandboxResult(success: boolean) {
    if (!payment) return;
    setSubmitting(true);
    setError("");
    try {
      const updatedPayment = await clientApi<Payment>(`/api/ninibu/payments/sandbox/${payment.id}/${success ? "succeed" : "fail"}`, { method: "POST" });
      setPayment(updatedPayment);
      if (booking) {
        const updatedBooking = await clientApi<Booking>(`/api/ninibu/bookings/${booking.id}`);
        setBooking(updatedBooking);
      }
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch (caught) {
      setError(caught instanceof NinibuApiError ? caught.message : "نتیجه پرداخت ثبت نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  if (booking && (!booking.payment_required || payment?.status === "paid" || booking.status === "confirmed")) {
    return <ModalFrame onClose={onClose} title="رزرو ثبت شد">
      <div className="booking-success">
        <span><CheckCircle2 size={28} /></span>
        <h3>وقت شما ثبت شد</h3>
        <p>{booking.service_name || service.name}</p>
        <dl>
          <div><dt>زمان</dt><dd>{formatDateTime(booking.starts_at)}</dd></div>
          <div><dt>شماره رزرو</dt><dd dir="ltr">{booking.booking_number}</dd></div>
          <div><dt>وضعیت</dt><dd>{booking.status === "confirmed" ? "تأیید شده" : booking.status}</dd></div>
        </dl>
        <Button onClick={onClose}>مشاهده رزروها</Button>
      </div>
    </ModalFrame>;
  }

  if (booking && payment) {
    const httpRedirect = payment.redirect_url?.startsWith("https://") || payment.redirect_url?.startsWith("http://");
    return <ModalFrame onClose={onClose} title="پرداخت رزرو">
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
        {httpRedirect && <Button onClick={() => window.location.assign(payment.redirect_url ?? "")}>رفتن به درگاه پرداخت</Button>}
        {payment.status === "failed" && <p className="service-error">{payment.failure_message || "پرداخت ناموفق بود. یک رزرو جدید یا پرداخت مجدد ایجاد کنید."}</p>}
        {error && <p className="service-error">{error}</p>}
      </div>
    </ModalFrame>;
  }

  return <ModalFrame onClose={onClose} title="رزرو خدمت">
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
          <div className="booking-days">{days.map((day) => <button type="button" key={day.date} className={activeDate === day.date ? "is-active" : ""} onClick={() => { setSelectedDate(day.date); setSelectedSlot(""); }}>{formatDateOnly(day.date)}<small>{new Intl.NumberFormat("fa-IR").format(day.slots.length)} زمان</small></button>)}</div>
          <div className="booking-slots">{slots.map((slot) => <button type="button" key={slot.starts_at} className={selectedSlot === slot.starts_at ? "is-active" : ""} onClick={() => setSelectedSlot(slot.starts_at)}>{new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date(slot.starts_at))}</button>)}</div>
        </>}
      </section>

      <label className="attach-child-row"><input type="checkbox" checked={attachChild} onChange={(event) => setAttachChild(event.target.checked)} /><span><strong>این رزرو برای {child.first_name} است</strong><small>رزرو کودک فقط کودک را به وقت مرتبط می‌کند و دسترسی درمانی جدیدی به ارائه‌دهنده نمی‌دهد.</small></span></label>
      <label className="service-notes"><span>یادداشت برای ارائه‌دهنده <small>اختیاری</small></span><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="مثلاً توضیح کوتاه درباره هدف جلسه؛ اطلاعات پزشکی حساس را فقط در جای مناسب ثبت کنید." /></label>
      {error && <p className="service-error">{error}</p>}
      <Button disabled={submitting || !selectedSlot} onClick={createBooking}>{submitting ? "در حال ثبت…" : activeService.price_amount > 0 ? "ادامه و پرداخت" : "ثبت رزرو رایگان"}</Button>
    </div>
  </ModalFrame>;
}

function ModalFrame({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="service-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="service-modal" role="dialog" aria-modal="true" aria-label={title}>
      <header><strong>{title}</strong><button type="button" onClick={onClose} aria-label="بستن"><X size={19} /></button></header>
      {children}
    </div>
  </div>;
}
