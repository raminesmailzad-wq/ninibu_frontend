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
      <div className="card-heading"><div><span className="card-icon pink"><HeartHandshake size={20} /></span><div><small>مسیر سلامت والد</small><h3>سلامت مادر</h3></div></div></div>
      <p>پیگیری چرخه، بارداری، ریکاوری پس از زایمان، شیردهی و حال عمومی مادر در یک مسیر مستقل.</p>
      <div className="maternal-health-summary"><strong>{profile.isLoading ? "در حال دریافت…" : stage}</strong><span>{guidance.data?.items[0]?.summary ?? "راهنمای مرحله‌ای بر اساس وضعیت ثبت‌شده نمایش داده می‌شود."}</span></div>
      <Button onClick={() => { setMode("profile"); setOpen(true); }}>مدیریت سلامت مادر</Button>
      <small className="maternal-health-disclaimer">این بخش آموزشی و پیگیری است و تشخیص یا تجویز پزشکی خودکار انجام نمی‌دهد.</small>
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
  useEffect(() => { if (profile) { setStage(profile.life_stage); setFirstPeriodDate(profile.first_period_date ?? ""); setLastPeriodDate(profile.last_period_date ?? ""); setLastDeliveryDate(profile.last_delivery_date ?? ""); setBreastfeeding(profile.breastfeeding); setNotes(profile.notes ?? ""); } }, [profile]);
  const update = useMutation({ mutationFn: () => clientApi<MaternalProfile>("/api/ninibu/maternal-health/profile", { method: "PATCH", body: JSON.stringify({ life_stage: stage, first_period_date: firstPeriodDate || "", last_period_date: lastPeriodDate || "", last_delivery_date: lastDeliveryDate || "", breastfeeding, notes }) }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["maternal-health"] }); onClose(); }, onError: (e) => setError(e instanceof NinibuApiError ? e.message : "ذخیره انجام نشد.") });

  return <ModalPortal ariaLabel="سلامت مادر" onClose={onClose} backdropClassName="service-modal-backdrop" contentClassName="service-modal maternal-health-modal">
    <header><div><small>پرونده مادر</small><strong>سلامت و شیردهی</strong></div><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header>
    <div className="maternal-modal-tabs"><button className={mode === "profile" ? "is-active" : ""} onClick={() => setMode("profile")}>پروفایل</button><button className={mode === "cycle" ? "is-active" : ""} onClick={() => setMode("cycle")}>چرخه</button><button className={mode === "breastfeeding" ? "is-active" : ""} onClick={() => setMode("breastfeeding")}>شیردهی</button><button className={mode === "checkin" ? "is-active" : ""} onClick={() => setMode("checkin")}>حال من</button></div>
    {mode === "profile" && <div className="maternal-form"><Field label="مرحله فعلی"><Select value={stage} onChange={(e) => setStage(e.target.value as MaternalLifeStage)}>{stages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></Field><div className="grid-two"><Field label="تاریخ اولین قاعدگی"><JalaliDateInput value={firstPeriodDate} onChange={setFirstPeriodDate} /></Field><Field label="آخرین قاعدگی"><JalaliDateInput value={lastPeriodDate} onChange={setLastPeriodDate} /></Field></div><Field label="آخرین زایمان"><JalaliDateInput value={lastDeliveryDate} onChange={setLastDeliveryDate} /></Field><label className="maternal-check"><input type="checkbox" checked={breastfeeding} onChange={(e) => setBreastfeeding(e.target.checked)} /><span>در حال شیردهی هستم</span></label><Field label="یادداشت"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>{error && <p className="service-error">{error}</p>}<Button disabled={update.isPending} onClick={() => update.mutate()}>{update.isPending ? "در حال ذخیره…" : "ذخیره پروفایل"}</Button><div className="maternal-guidance"><div><Sparkles size={17}/><strong>راهنمای این مرحله</strong></div>{guidance?.items.map((item) => <article key={item.code}><strong>{item.title}</strong><p>{item.summary}</p></article>)}</div></div>}
    {mode === "cycle" && <MaternalLogForm kind="cycle" onDone={async () => { await queryClient.invalidateQueries({ queryKey: ["maternal-health"] }); setMode("profile"); }} />}
    {mode === "breastfeeding" && <MaternalLogForm kind="breastfeeding" onDone={async () => { await queryClient.invalidateQueries({ queryKey: ["maternal-health"] }); setMode("profile"); }} />}
    {mode === "checkin" && <MaternalLogForm kind="checkin" onDone={async () => { await queryClient.invalidateQueries({ queryKey: ["maternal-health"] }); setMode("profile"); }} />}
  </ModalPortal>;
}

function MaternalLogForm({ kind, onDone }: { kind: "cycle" | "breastfeeding" | "checkin"; onDone: () => Promise<void> }) {
  const [date, setDate] = useState(todayGregorianDate()); const [value, setValue] = useState(""); const [second, setSecond] = useState(""); const [notes, setNotes] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function save() { setBusy(true); setError(""); try { if (kind === "cycle") await clientApi("/api/ninibu/maternal-health/cycles", { method: "POST", body: JSON.stringify({ started_at: date, flow: value || "medium", pain_level: second ? Number(second) : undefined, notes }) }); else if (kind === "breastfeeding") await clientApi("/api/ninibu/maternal-health/breastfeeding", { method: "POST", body: JSON.stringify({ started_at: new Date().toISOString(), duration_minutes: value ? Number(value) : undefined, feeding_method: "breast", notes }) }); else await clientApi("/api/ninibu/maternal-health/check-ins", { method: "POST", body: JSON.stringify({ recorded_at: date, mood: value, sleep_quality: second, notes }) }); await onDone(); } catch (e) { setError(e instanceof NinibuApiError ? e.message : "ثبت انجام نشد."); } finally { setBusy(false); } }
  return <div className="maternal-form">{kind !== "breastfeeding" && <Field label="تاریخ"><JalaliDateInput value={date} onChange={setDate} required /></Field>}{kind === "cycle" ? <><Field label="شدت خونریزی"><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="light / medium / heavy" /></Field><Field label="شدت درد از ۰ تا ۱۰"><Input inputMode="numeric" value={second} onChange={(e) => setSecond(e.target.value)} /></Field></> : kind === "breastfeeding" ? <Field label="مدت شیردهی (دقیقه)"><Input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} /></Field> : <><Field label="حال روحی"><Input value={value} onChange={(e) => setValue(e.target.value)} /></Field><Field label="کیفیت خواب"><Input value={second} onChange={(e) => setSecond(e.target.value)} /></Field></>}<Field label="یادداشت"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>{error && <p className="service-error">{error}</p>}<Button disabled={busy} onClick={save}>{busy ? "در حال ثبت…" : "ثبت"}</Button></div>;
}
