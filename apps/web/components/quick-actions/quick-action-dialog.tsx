"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartNoAxesColumnIncreasing, CheckCircle2, Stethoscope, Syringe, X } from "lucide-react";
import type { Child, GrowthMeasurement, MedicalVisit, Vaccination } from "@ninibu/types";
import { growthMeasurementSchema, medicalVisitQuickSchema, vaccinationQuickSchema } from "@ninibu/validation";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export type QuickAction = "growth" | "vaccination" | "visit";

function today() { return new Date().toLocaleDateString("en-CA"); }

export function QuickActionDialog({ action, child, onClose }: { action: QuickAction | null; child: Child; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (action && !dialog.open) dialog.showModal();
    if (!action && dialog.open) dialog.close();
  }, [action]);

  return <dialog ref={ref} className="quick-dialog" onClose={onClose} onCancel={onClose}>
    {action && <div className="quick-dialog-inner">
      <button className="dialog-close" onClick={onClose} aria-label="بستن"><X size={20} /></button>
      {action === "growth" && <GrowthForm child={child} onDone={onClose} />}
      {action === "vaccination" && <VaccinationForm child={child} onDone={onClose} />}
      {action === "visit" && <VisitForm child={child} onDone={onClose} />}
    </div>}
  </dialog>;
}

function GrowthForm({ child, onDone }: { child: Child; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ measured_at: today(), weight_kg: "", height_cm: "", head_circumference_cm: "" });
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (body: unknown) => clientApi<GrowthMeasurement>(`/api/ninibu/children/${child.id}/growth-measurements`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["child", child.id] }); onDone(); }
  });
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const parsed = growthMeasurementSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "اطلاعات رشد معتبر نیست"); return; }
    const body = {
      measured_at: form.measured_at,
      weight_grams: form.weight_kg ? Math.round(Number(form.weight_kg) * 1000) : null,
      height_millimeters: form.height_cm ? Math.round(Number(form.height_cm) * 10) : null,
      head_circumference_millimeters: form.head_circumference_cm ? Math.round(Number(form.head_circumference_cm) * 10) : null,
      care_location_id: null, location_name: "", notes: ""
    };
    try { await mutation.mutateAsync(body); } catch (e) { setError(e instanceof Error ? e.message : "ثبت رشد انجام نشد"); }
  }
  return <form onSubmit={submit} className="quick-form">
    <DialogHeading icon={ChartNoAxesColumnIncreasing} title="ثبت رشد" text={`اندازه‌گیری جدید برای ${child.first_name}`} />
    <Field label="تاریخ اندازه‌گیری"><Input type="date" dir="ltr" value={form.measured_at} onChange={(e) => setForm((p) => ({ ...p, measured_at: e.target.value }))} /></Field>
    <div className="grid-two"><Field label="وزن (کیلوگرم)"><Input inputMode="decimal" dir="ltr" placeholder="12.4" value={form.weight_kg} onChange={(e) => setForm((p) => ({ ...p, weight_kg: e.target.value }))} /></Field><Field label="قد (سانتی‌متر)"><Input inputMode="decimal" dir="ltr" placeholder="89" value={form.height_cm} onChange={(e) => setForm((p) => ({ ...p, height_cm: e.target.value }))} /></Field></div>
    <Field label="دور سر (سانتی‌متر)"><Input inputMode="decimal" dir="ltr" placeholder="48" value={form.head_circumference_cm} onChange={(e) => setForm((p) => ({ ...p, head_circumference_cm: e.target.value }))} /></Field>
    {error && <p className="dialog-error">{error}</p>}
    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "در حال ثبت…" : "ثبت اندازه‌گیری"}</Button>
  </form>;
}

function VaccinationForm({ child, onDone }: { child: Child; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ vaccine_name: "", dose_number: "1", administered_at: today(), next_dose_due_at: "" });
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (body: unknown) => clientApi<Vaccination>(`/api/ninibu/children/${child.id}/vaccinations`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["child", child.id] }); onDone(); }
  });
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const parsed = vaccinationQuickSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "اطلاعات واکسن معتبر نیست"); return; }
    try { await mutation.mutateAsync({ vaccine_id: null, vaccine_name: form.vaccine_name.trim(), dose_number: Number(form.dose_number), administered_at: form.administered_at, next_dose_due_at: form.next_dose_due_at, batch_number: "", manufacturer: "", care_location_id: null, location_name: "", notes: "" }); }
    catch (e) { setError(e instanceof Error ? e.message : "ثبت واکسن انجام نشد"); }
  }
  return <form onSubmit={submit} className="quick-form">
    <DialogHeading icon={Syringe} title="ثبت واکسن" text={`واکسیناسیون ${child.first_name}`} />
    <Field label="نام واکسن"><Input placeholder="مثلاً MMR" value={form.vaccine_name} onChange={(e) => setForm((p) => ({ ...p, vaccine_name: e.target.value }))} /></Field>
    <div className="grid-two"><Field label="شماره دوز"><Input type="number" min="1" max="20" dir="ltr" value={form.dose_number} onChange={(e) => setForm((p) => ({ ...p, dose_number: e.target.value }))} /></Field><Field label="تاریخ تزریق"><Input type="date" dir="ltr" value={form.administered_at} onChange={(e) => setForm((p) => ({ ...p, administered_at: e.target.value }))} /></Field></div>
    <Field label="تاریخ دوز بعدی (اختیاری)"><Input type="date" dir="ltr" value={form.next_dose_due_at} onChange={(e) => setForm((p) => ({ ...p, next_dose_due_at: e.target.value }))} /></Field>
    <p className="dialog-note">ثبت این فرم جایگزین توصیه پزشک یا برنامه رسمی واکسیناسیون نیست.</p>
    {error && <p className="dialog-error">{error}</p>}
    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "در حال ثبت…" : "ثبت واکسن"}</Button>
  </form>;
}

function VisitForm({ child, onDone }: { child: Child; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ visited_at: today(), visit_type: "routine_checkup", doctor_name: "", chief_complaint: "" });
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (body: unknown) => clientApi<MedicalVisit>(`/api/ninibu/children/${child.id}/medical-visits`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["child", child.id] }); onDone(); }
  });
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const parsed = medicalVisitQuickSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || "اطلاعات ویزیت معتبر نیست"); return; }
    try { await mutation.mutateAsync({ visited_at: form.visited_at, visit_type: form.visit_type, chief_complaint: form.chief_complaint.trim(), symptoms: "", examination_notes: "", doctor_name: form.doctor_name.trim(), doctor_specialty: "", care_location_id: null, location_name: "", follow_up_at: "", notes: "" }); }
    catch (e) { setError(e instanceof Error ? e.message : "ثبت ویزیت انجام نشد"); }
  }
  return <form onSubmit={submit} className="quick-form">
    <DialogHeading icon={Stethoscope} title="ثبت ویزیت" text={`مراجعه پزشکی ${child.first_name}`} />
    <div className="grid-two"><Field label="تاریخ ویزیت"><Input type="date" dir="ltr" value={form.visited_at} onChange={(e) => setForm((p) => ({ ...p, visited_at: e.target.value }))} /></Field><Field label="نوع مراجعه"><Select value={form.visit_type} onChange={(e) => setForm((p) => ({ ...p, visit_type: e.target.value }))}><option value="routine_checkup">چکاپ دوره‌ای</option><option value="illness">بیماری</option><option value="follow_up">پیگیری</option><option value="vaccination">واکسیناسیون</option><option value="consultation">مشاوره</option><option value="emergency">اورژانسی</option><option value="hospitalization">بستری</option><option value="other">سایر</option></Select></Field></div>
    <Field label="نام پزشک (اختیاری)"><Input value={form.doctor_name} onChange={(e) => setForm((p) => ({ ...p, doctor_name: e.target.value }))} /></Field>
    <Field label="دلیل مراجعه (اختیاری)"><Input value={form.chief_complaint} onChange={(e) => setForm((p) => ({ ...p, chief_complaint: e.target.value }))} /></Field>
    {error && <p className="dialog-error">{error}</p>}
    <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "در حال ثبت…" : "ثبت ویزیت"}</Button>
  </form>;
}

function DialogHeading({ icon: Icon, title, text }: { icon: typeof CheckCircle2; title: string; text: string }) {
  return <div className="dialog-heading"><span><Icon size={22} /></span><div><h2>{title}</h2><p>{text}</p></div></div>;
}
