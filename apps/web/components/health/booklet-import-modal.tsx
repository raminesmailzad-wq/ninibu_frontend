"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpenCheck, Camera, Check, FileImage, LoaderCircle, ShieldCheck, X } from "lucide-react";
import type { ConfirmDocumentImportResponse, DocumentImport, DocumentImportPageType } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { ModalPortal } from "@/components/ui/modal-portal";
import { JalaliDateInput } from "@/components/ui/jalali-date-input";

const pages: Array<{ value: DocumentImportPageType; title: string; hint: string; unit: string }> = [
  { value: "weight_for_age", title: "وزن نسبت به سن", hint: "نسخه فعلی، پنل سال اول (۰ تا ۱۲ ماه) دفترچه را می‌خواند.", unit: "کیلوگرم" },
  { value: "height_for_age", title: "قد نسبت به سن", hint: "نمودار قد از تولد تا ۵ سالگی.", unit: "سانتی‌متر" },
  { value: "head_circumference_for_age", title: "دور سر نسبت به سن", hint: "نمودار دور سر از تولد تا ۲ سالگی.", unit: "سانتی‌متر" },
];

type ReviewRow = { itemId: number; accepted: boolean; measuredAt: string; value: string; confidence: number; warning?: string; unit: string; ageMonths: number };

export function BookletImportModal({ childId, childName, open, onClose }: { childId: number; childName: string; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [pageType, setPageType] = useState<DocumentImportPageType>("weight_for_age");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<DocumentImport | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) {
      setPageType("weight_for_age"); setFile(null); setResult(null); setRows([]); setBusy(false); setError("");
    }
  }, [open]);

  const selectedPage = useMemo(() => pages.find((p) => p.value === pageType) ?? pages[0], [pageType]);
  if (!open) return null;

  async function analyze() {
    if (!file) { setError("ابتدا یک عکس واضح از صفحه نمودار انتخاب کنید."); return; }
    setBusy(true); setError("");
    try {
      const form = new FormData();
      form.append("page_type", pageType);
      form.append("consent_acknowledged", "true");
      form.append("file", file);
      const data = await clientApi<DocumentImport>(`/api/ninibu/children/${childId}/document-imports/growth-chart`, { method: "POST", body: form });
      setResult(data);
      setRows(data.items.map((item) => ({ itemId: item.id, accepted: item.confidence >= 0.55, measuredAt: item.suggested_measured_at, value: String(item.suggested_value), confidence: item.confidence, warning: item.warning, unit: item.unit, ageMonths: item.age_months })));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تحلیل تصویر انجام نشد.");
    } finally { setBusy(false); }
  }

  async function confirm() {
    if (!result) return;
    const accepted = rows.filter((row) => row.accepted);
    if (!accepted.length) { setError("حداقل یک مقدار را برای ثبت تأیید کنید."); return; }
    if (accepted.some((row) => !row.measuredAt || !Number.isFinite(Number(row.value)) || Number(row.value) <= 0)) { setError("تاریخ و مقدار ردیف‌های تأییدشده را بررسی کنید."); return; }
    setBusy(true); setError("");
    try {
      await clientApi<ConfirmDocumentImportResponse>(`/api/ninibu/children/${childId}/document-imports/${result.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({ items: rows.map((row) => ({ item_id: row.itemId, accepted: row.accepted, measured_at: row.measuredAt, value: Number(row.value) })) }),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["child", childId, "growth"] }),
        queryClient.invalidateQueries({ queryKey: ["child", childId, "growth", "health"] }),
        queryClient.invalidateQueries({ queryKey: ["child", childId, "growth-chart"] }),
        queryClient.invalidateQueries({ queryKey: ["child", childId, "growth-chart", "who"] }),
      ]);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت مقادیر استخراج‌شده انجام نشد.");
    } finally { setBusy(false); }
  }

  return <ModalPortal ariaLabel="انتقال سوابق رشد از دفترچه سلامت" onClose={busy ? () => undefined : onClose} closeOnBackdrop={!busy} contentClassName="booklet-import-modal">
    <header className="booklet-import-head">
      <div><span className="section-kicker">Smart Booklet Import</span><h2>انتقال رشد {childName} از دفترچه</h2><p>عکس فقط برای استخراج داده پردازش می‌شود و پس از تحلیل در نینیبو نگهداری نمی‌شود.</p></div>
      <button type="button" className="booklet-close" onClick={onClose} disabled={busy} aria-label="بستن"><X size={20} /></button>
    </header>

    {!result ? <div className="booklet-import-body">
      <div className="booklet-privacy"><ShieldCheck size={20} /><div><strong>ثبت نهایی فقط با تأیید شما</strong><span>این قابلیت OCR عمومی نیست؛ برای قالب متداول دفترچه سلامت کودک و خطوط دست‌نویس آبی/سرمه‌ای بهینه شده است.</span></div></div>
      <div className="booklet-page-types" role="radiogroup" aria-label="نوع نمودار">
        {pages.map((page) => <button type="button" role="radio" aria-checked={pageType === page.value} className={pageType === page.value ? "is-active" : ""} key={page.value} onClick={() => { setPageType(page.value); setResult(null); setError(""); }}>
          <BookOpenCheck size={18} /><span><strong>{page.title}</strong><small>{page.hint}</small></span>{pageType === page.value ? <Check size={18} /> : null}
        </button>)}
      </div>
      <label className="booklet-file-zone">
        {preview ? <img src={preview} alt="پیش‌نمایش صفحه دفترچه" /> : <span className="booklet-file-placeholder"><FileImage size={30} /><strong>عکس صفحه «{selectedPage.title}» را انتخاب کنید</strong><small>JPEG یا PNG · کل نمودار داخل تصویر باشد · نور یکنواخت و کمترین زاویه ممکن</small></span>}
        <input type="file" accept="image/jpeg,image/png" capture="environment" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(""); }} />
      </label>
      {file ? <div className="booklet-file-name"><Camera size={16} /><span>{file.name}</span><button type="button" onClick={() => setFile(null)}>تغییر عکس</button></div> : null}
      {error ? <div className="booklet-error">{error}</div> : null}
      <div className="booklet-actions"><button type="button" className="primary" onClick={analyze} disabled={!file || busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <Camera size={18} />}{busy ? "در حال تحلیل تصویر…" : "تحلیل و استخراج مقادیر"}</button><button type="button" onClick={onClose} disabled={busy}>انصراف</button></div>
    </div> : <div className="booklet-import-body">
      <div className="booklet-review-summary"><div><strong>{new Intl.NumberFormat("fa-IR").format(rows.length)}</strong><span>نقطه پیشنهادی</span></div><div><strong>{new Intl.NumberFormat("fa-IR", { style: "percent", maximumFractionDigits: 0 }).format(result.overall_confidence)}</strong><span>اطمینان کلی</span></div><p>هر ردیف را با دفترچه تطبیق دهید. تاریخ و مقدار قابل اصلاح است.</p></div>
      <div className="booklet-review-list">
        {rows.map((row, index) => <article className={row.accepted ? "booklet-review-row is-accepted" : "booklet-review-row"} key={row.itemId}>
          <label className="booklet-check"><input type="checkbox" checked={row.accepted} onChange={(e) => setRows((old) => old.map((r, i) => i === index ? { ...r, accepted: e.target.checked } : r))} /><span>{row.accepted ? "ثبت شود" : "رد شود"}</span></label>
          <div className="booklet-row-fields"><JalaliDateInput value={row.measuredAt} onChange={(value) => setRows((old) => old.map((r, i) => i === index ? { ...r, measuredAt: value } : r))} disabled={!row.accepted} /><label><span>مقدار ({row.unit === "kg" ? "kg" : "cm"})</span><input inputMode="decimal" value={row.value} disabled={!row.accepted} onChange={(e) => setRows((old) => old.map((r, i) => i === index ? { ...r, value: e.target.value } : r))} /></label></div>
          <div className="booklet-confidence"><span className={row.confidence < .7 ? "low" : ""}>{new Intl.NumberFormat("fa-IR", { style: "percent", maximumFractionDigits: 0 }).format(row.confidence)} اطمینان</span><small>سن تقریبی روی نمودار: {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(row.ageMonths)} ماه</small></div>
          {row.warning ? <p className="booklet-row-warning">{row.warning}</p> : null}
        </article>)}
      </div>
      {error ? <div className="booklet-error">{error}</div> : null}
      <div className="booklet-actions"><button type="button" className="primary" onClick={confirm} disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}{busy ? "در حال ثبت…" : "تأیید و افزودن به پرونده"}</button><button type="button" onClick={() => { setResult(null); setRows([]); setError(""); }} disabled={busy}>گرفتن عکس دیگر</button></div>
    </div>}
  </ModalPortal>;
}
