"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HeartHandshake, Sparkles, X } from "lucide-react";
import type { MaternalGuidanceResponse, MaternalLifeStage, MaternalProfile } from "@ninibu/types";
import { clientApi, NinibuApiError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JalaliDateInput } from "@/components/ui/jalali-date-input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { todayGregorianDate } from "@/lib/datetime";

const stages: Array<{ value: MaternalLifeStage; label: string }> = [
  { value: "menstrual", label: "چرخه و سلامت عمومی" },
  { value: "preconception", label: "آمادگی برای بارداری" },
  { value: "pregnancy", label: "بارداری" },
  { value: "postpartum", label: "پس از زایمان" },
  { value: "breastfeeding", label: "شیردهی" },
  { value: "perimenopause", label: "پیش‌یائسگی" },
  { value: "menopause", label: "یائسگی" },
];

type Mode = "profile" | "cycle" | "breastfeeding" | "checkin";

export function MaternalHealthPanel() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("profile");
  const profile = useQuery({ queryKey: ["maternal-health", "profile"], queryFn: () => clientApi<MaternalProfile>("/api/ninibu/maternal-health/profile") });
  const guidance = useQuery({ queryKey: ["maternal-health", "guidance"], queryFn: () => clientApi<MaternalGuidanceResponse>("/api/ninibu/maternal-health/guidance") });
  const stage = stages.find((item) => item.value === profile.data?.life_stage)?.label ?? "سلامت مادر";

  return <>
    <section className="surface-card maternal-health-card">
      <div className="card-heading">
        <div>
          <span className="card-icon pink"><HeartHandshake size={20} /></span>
          <div>
            <small>مسیر سلامت والد</small>
            <h3>سلامت مادر</h3>
          </div>
        </div>
      </div>
      <p>این صفحه مستقل از سلامت و رشد فرزند است و برای پیگیری چرخه، بارداری، ریکاوری پس از زایمان، شیردهی و حال عمومی شما طراحی شده است.</p>
      <div className="maternal-health-summary">
        <strong>{profile.isLoading ? "در حال دریافت اطلاعات…" : stage}</strong>
        <span>{guidance.data?.items[0]?.summary ?? "با تکمیل پروفایل، راهنمای مرحله‌ای و نکات مراقبتی همین‌جا نمایش داده می‌شود."}</span>
      </div>
      <div className="maternal-actions">
        <Button onClick={() => { setMode("profile"); setOpen(true); }}>تکمیل پروفایل سلامت مادر</Button>
        <Button variant="secondary" onClick={() => { setMode("checkin"); setOpen(true); }}>ثبت حال امروز</Button>
      </div>
      <small className="maternal-health-disclaimer">این بخش برای آموزش و پیگیری است و جایگزین مراجعه، تشخیص یا تجویز پزشک نیست.</small>
    </section>
    {open && <MaternalModal initialMode={mode} profile={profile.data} guidance={guidance.data} onClose={() => setOpen(false)} />}
  </>;
}

function MaternalModal({ initialMode, profile, guidance, onClose }: { initialMode: Mode; profile?: MaternalProfile; guidance?: MaternalGuidanceResponse; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [stage, setStage] = useState<MaternalLifeStage>(profile?.life_stage ?? "menstrual");
  const [firstPeriodDate, setFirstPeriodDate] = useState(profile?.first_period_date ?? "");
  const [lastPeriodDate, setLastPeriodDate] = useState(profile?.last_period_date ?? "");
  const [lastDeliveryDate, setLastDeliveryDate] = useState(profile?.last_delivery_date ?? "");
  const [breastfeeding, setBreastfeeding] = useState(Boolean(profile?.breastfeeding));
  const [notes, setNotes] = useState(profile?.notes ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setStage(profile.life_stage);
    setFirstPeriodDate(profile.first_period_date ?? "");
    setLastPeriodDate(profile.last_period_date ?? "");
    setLastDeliveryDate(profile.last_delivery_date ?? "");
    setBreastfeeding(profile.breastfeeding);
    setNotes(profile.notes ?? "");
  }, [profile]);

  const update = useMutation({
    mutationFn: () => clientApi<MaternalProfile>("/api/ninibu/maternal-health/profile", {
      method: "PATCH",
      body: JSON.stringify({
        life_stage: stage,
        first_period_date: firstPeriodDate || "",
        last_period_date: lastPeriodDate || "",
        last_delivery_date: lastDeliveryDate || "",
        breastfeeding,
        notes,
      }),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["maternal-health"] });
      onClose();
    },
    onError: (cause) => setError(cause instanceof NinibuApiError ? cause.message : "ذخیره اطلاعات انجام نشد."),
  });

  return <ModalPortal ariaLabel="سلامت مادر" onClose={onClose} backdropClassName="service-modal-backdrop" contentClassName="maternal-health-modal">
    <header>
      <div>
        <small>پرونده مستقل مادر</small>
        <strong>سلامت مادر و شیردهی</strong>
      </div>
      <button type="button" onClick={onClose} aria-label="بستن پنجره سلامت مادر"><X size={18} /></button>
    </header>

    <div className="maternal-modal-body">
      <div className="maternal-modal-tabs">
        <button type="button" className={mode === "profile" ? "is-active" : ""} onClick={() => setMode("profile")}>پروفایل سلامت</button>
        <button type="button" className={mode === "cycle" ? "is-active" : ""} onClick={() => setMode("cycle")}>ثبت چرخه</button>
        <button type="button" className={mode === "breastfeeding" ? "is-active" : ""} onClick={() => setMode("breastfeeding")}>ثبت شیردهی</button>
        <button type="button" className={mode === "checkin" ? "is-active" : ""} onClick={() => setMode("checkin")}>حال امروز</button>
      </div>

      {mode === "profile" && <div className="maternal-form">
        <section className="maternal-form-section">
          <h4>مرحله فعلی زندگی</h4>
          <p>با انتخاب مرحله فعلی، راهنمای مراقبتی مناسب‌تری در این صفحه نمایش داده می‌شود.</p>
          <Field label="مرحله فعلی">
            <Select value={stage} onChange={(event) => setStage(event.target.value as MaternalLifeStage)}>
              {stages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
          </Field>
        </section>

        <section className="maternal-form-section">
          <h4>چرخه و سوابق مهم</h4>
          <div className="maternal-form-grid">
            <Field label="تاریخ اولین قاعدگی">
              <JalaliDateInput value={firstPeriodDate} onChange={setFirstPeriodDate} />
            </Field>
            <Field label="آخرین قاعدگی">
              <JalaliDateInput value={lastPeriodDate} onChange={setLastPeriodDate} />
            </Field>
          </div>
          <div className="maternal-form-grid">
            <Field label="آخرین زایمان">
              <JalaliDateInput value={lastDeliveryDate} onChange={setLastDeliveryDate} />
            </Field>
            <label className="maternal-check">
              <input type="checkbox" checked={breastfeeding} onChange={(event) => setBreastfeeding(event.target.checked)} />
              <span>در حال شیردهی هستم</span>
            </label>
          </div>
        </section>

        <section className="maternal-form-section">
          <h4>یادداشت و توضیحات</h4>
          <Field label="یادداشت شخصی یا توصیه پزشک">
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="هر نکته‌ای که برای پیگیری سلامت مادر مهم است اینجا بنویسید." />
          </Field>
        </section>

        {error && <p className="service-error">{error}</p>}

        <div className="maternal-actions">
          <Button disabled={update.isPending} onClick={() => update.mutate()}>{update.isPending ? "در حال ذخیره…" : "ذخیره پروفایل سلامت"}</Button>
          <Button variant="outline" onClick={onClose}>انصراف</Button>
        </div>

        <div className="maternal-guidance">
          <div><Sparkles size={17} /><strong>راهنمای این مرحله</strong></div>
          {(guidance?.items.length ? guidance.items : [{ code: "empty", title: "هنوز راهنمایی ثبت نشده", summary: "بعد از تکمیل اطلاعات این بخش، توصیه‌ها و نکات آموزشی اینجا نمایش داده می‌شوند." }]).map((item) => (
            <article key={item.code}>
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </div>}

      {mode === "cycle" && <MaternalLogForm kind="cycle" onDone={async () => {
        await queryClient.invalidateQueries({ queryKey: ["maternal-health"] });
        setMode("profile");
      }} />}

      {mode === "breastfeeding" && <MaternalLogForm kind="breastfeeding" onDone={async () => {
        await queryClient.invalidateQueries({ queryKey: ["maternal-health"] });
        setMode("profile");
      }} />}

      {mode === "checkin" && <MaternalLogForm kind="checkin" onDone={async () => {
        await queryClient.invalidateQueries({ queryKey: ["maternal-health"] });
        setMode("profile");
      }} />}
    </div>
  </ModalPortal>;
}

function MaternalLogForm({ kind, onDone }: { kind: "cycle" | "breastfeeding" | "checkin"; onDone: () => Promise<void> }) {
  const [date, setDate] = useState(todayGregorianDate());
  const [value, setValue] = useState("");
  const [second, setSecond] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      if (kind === "cycle") {
        await clientApi("/api/ninibu/maternal-health/cycles", {
          method: "POST",
          body: JSON.stringify({ started_at: date, flow: value || "medium", pain_level: second ? Number(second) : undefined, notes }),
        });
      } else if (kind === "breastfeeding") {
        await clientApi("/api/ninibu/maternal-health/breastfeeding", {
          method: "POST",
          body: JSON.stringify({ started_at: new Date().toISOString(), duration_minutes: value ? Number(value) : undefined, feeding_method: "breast", notes }),
        });
      } else {
        await clientApi("/api/ninibu/maternal-health/check-ins", {
          method: "POST",
          body: JSON.stringify({ recorded_at: date, mood: value, sleep_quality: second, notes }),
        });
      }
      await onDone();
    } catch (cause) {
      setError(cause instanceof NinibuApiError ? cause.message : "ثبت اطلاعات انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="maternal-form">
    <section className="maternal-form-section">
      <h4>{kind === "cycle" ? "ثبت چرخه" : kind === "breastfeeding" ? "ثبت شیردهی" : "ثبت حال امروز"}</h4>
      <p>{kind === "cycle" ? "شدت و علائم این دوره را ثبت کنید." : kind === "breastfeeding" ? "مدت و توضیحات مربوط به شیردهی را ذخیره کنید." : "حال روحی، کیفیت خواب و نکات امروز را وارد کنید."}</p>
      {kind !== "breastfeeding" && <Field label="تاریخ">
        <JalaliDateInput value={date} onChange={setDate} required />
      </Field>}
      {kind === "cycle" && <div className="maternal-form-grid">
        <Field label="شدت خونریزی"><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="کم / متوسط / زیاد" /></Field>
        <Field label="شدت درد از ۰ تا ۱۰"><Input inputMode="numeric" value={second} onChange={(event) => setSecond(event.target.value)} placeholder="مثلاً ۶" /></Field>
      </div>}
      {kind === "breastfeeding" && <Field label="مدت شیردهی (دقیقه)"><Input inputMode="numeric" value={value} onChange={(event) => setValue(event.target.value)} placeholder="مثلاً ۲۰" /></Field>}
      {kind === "checkin" && <div className="maternal-form-grid">
        <Field label="حال روحی"><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="مثلاً خوب / خسته / مضطرب" /></Field>
        <Field label="کیفیت خواب"><Input value={second} onChange={(event) => setSecond(event.target.value)} placeholder="مثلاً خوب / متوسط / ضعیف" /></Field>
      </div>}
      <Field label="یادداشت"><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="توضیحات تکمیلی اینجا ثبت می‌شود." /></Field>
    </section>

    {error && <p className="service-error">{error}</p>}

    <div className="maternal-actions">
      <Button disabled={busy} onClick={save}>{busy ? "در حال ثبت…" : "ثبت اطلاعات"}</Button>
    </div>
  </div>;
}
