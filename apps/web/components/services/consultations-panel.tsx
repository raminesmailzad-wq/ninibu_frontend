"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Bot, Check, ChevronLeft, LockKeyhole, MessageCircleQuestion, Plus, Send, Sparkles, X } from "lucide-react";
import type { Child, ConsultationAnswer, ConsultationCategory, ConsultationPrivacy, ConsultationQuestion, ConsultationQuestionListResponse } from "@ninibu/types";
import { clientApi, NinibuApiError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { consultationPrivacyLabel, consultationStatusLabel, formatDateTime } from "./services-data";

export function ConsultationsPanel({ child }: { child: Child }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"mine" | "public">("mine");
  const [composer, setComposer] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const categories = useQuery({ queryKey: ["consultations", "categories"], queryFn: () => clientApi<ConsultationCategory[]>("/api/ninibu/consultations/categories") });
  const questions = useQuery({
    queryKey: ["consultations", view, child.id],
    queryFn: () => clientApi<ConsultationQuestionListResponse>(view === "mine" ? "/api/ninibu/consultations/questions?limit=100" : "/api/ninibu/consultations/public/questions?limit=100")
  });
  const items = useMemo(() => questions.data?.items ?? [], [questions.data]);

  return <div className="consultation-panel">
    <div className="consultation-head">
      <div><span className="section-kicker">مشاوره والدین</span><h2>پرسش از متخصص</h2><p>پرسش غیرهم‌زمان ثبت کن و پاسخ متخصص تأییدشده را در همین بخش دنبال کن.</p></div>
      <Button onClick={() => setComposer(true)}><Plus size={17} /> پرسش جدید</Button>
    </div>
    <div className="consultation-privacy-note"><LockKeyhole size={17} /><div><strong>مشاوره خصوصی از پرونده سلامت جداست</strong><p>انتخاب کودک برای دادن زمینه به پرسش است و به متخصص دسترسی خودکار به پرونده سلامت نمی‌دهد.</p></div></div>
    <div className="consultation-tabs"><button className={view === "mine" ? "is-active" : ""} onClick={() => setView("mine")}>پرسش‌های من</button><button className={view === "public" ? "is-active" : ""} onClick={() => setView("public")}>پرسش‌های عمومی پاسخ‌داده‌شده</button></div>

    {questions.isLoading && <div className="service-list-state">در حال دریافت پرسش‌ها…</div>}
    {questions.isError && <div className="service-list-state error-state">پرسش‌ها دریافت نشدند. <button onClick={() => questions.refetch()}>تلاش دوباره</button></div>}
    {!questions.isLoading && !questions.isError && items.length === 0 && <div className="services-empty"><MessageCircleQuestion size={28} /><strong>{view === "mine" ? "هنوز پرسشی ثبت نکردی" : "پرسش عمومی موجود نیست"}</strong><p>{view === "mine" ? "برای شروع، یک پرسش جدید برای تیم متخصصان ثبت کن." : "پرسش‌های عمومی فقط بعد از پاسخ و با رعایت حریم خصوصی نمایش داده می‌شوند."}</p></div>}
    <div className="consultation-list">{items.map((question) => <button className="consultation-card surface-card" key={question.id} onClick={() => setSelectedId(question.id)}>
      <div className="consultation-card-top"><span>{question.category.name}</span><em className={`consultation-status status-${question.status}`}>{consultationStatusLabel[question.status] || question.status}</em></div>
      <h3>{question.title}</h3><p>{question.body}</p>
      <footer><span>{consultationPrivacyLabel[question.privacy] || question.privacy}</span><span>{formatDateTime(question.updated_at)}</span><ChevronLeft size={16} /></footer>
    </button>)}</div>

    {composer && <QuestionComposer child={child} categories={categories.data ?? []} onClose={() => setComposer(false)} onCreated={async (created) => { setComposer(false); setSelectedId(created.id); await queryClient.invalidateQueries({ queryKey: ["consultations"] }); }} />}
    {selectedId && <ConsultationDetail questionId={selectedId} isMine={view === "mine"} onClose={() => setSelectedId(null)} onChanged={() => queryClient.invalidateQueries({ queryKey: ["consultations"] })} />}
  </div>;
}

function QuestionComposer({ child, categories, onClose, onCreated }: { child: Child; categories: ConsultationCategory[]; onClose: () => void; onCreated: (question: ConsultationQuestion) => Promise<void> }) {
  const firstCategory = categories[0]?.code ?? "other";
  const [categoryCode, setCategoryCode] = useState(firstCategory);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [privacy, setPrivacy] = useState<ConsultationPrivacy>("private");
  const [attachChild, setAttachChild] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!title.trim() || !body.trim()) return setError("عنوان و متن پرسش را کامل کنید.");
    if (!categoryCode) return setError("دسته‌بندی را انتخاب کنید.");
    setBusy(true); setError("");
    try {
      const created = await clientApi<ConsultationQuestion>("/api/ninibu/consultations/questions", { method: "POST", body: JSON.stringify({ child_id: attachChild ? child.id : undefined, category_code: categoryCode, title: title.trim(), body: body.trim(), privacy }) });
      await onCreated(created);
    } catch (caught) { setError(caught instanceof NinibuApiError ? caught.message : "پرسش ثبت نشد."); }
    finally { setBusy(false); }
  }

  return <div className="service-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="service-modal consultation-composer" role="dialog" aria-modal="true" aria-label="پرسش جدید">
      <header><strong>پرسش جدید</strong><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header>
      <div className="consultation-form">
        <label><span>دسته‌بندی</span><Select value={categoryCode} onChange={(event) => setCategoryCode(event.target.value)}>{categories.map((category) => <option value={category.code} key={category.id}>{category.name}</option>)}</Select></label>
        <label><span>عنوان</span><Input value={title} maxLength={250} onChange={(event) => setTitle(event.target.value)} placeholder="مثلاً چطور برنامه خواب کودک را منظم‌تر کنم؟" /></label>
        <label><span>شرح پرسش</span><Textarea value={body} maxLength={10000} onChange={(event) => setBody(event.target.value)} placeholder="جزئیات لازم را بنویسید. برای اورژانس یا وضعیت فوری از این بخش استفاده نکنید." /></label>
        <label><span>حریم خصوصی</span><Select value={privacy} onChange={(event) => setPrivacy(event.target.value as ConsultationPrivacy)}><option value="private">خصوصی — فقط شما و متخصص مجاز</option><option value="anonymous_public">عمومی ناشناس — بعد از پاسخ قابل مشاهده</option><option value="public">عمومی — بعد از پاسخ با هویت حساب</option></Select></label>
        <label className="attach-child-row"><input type="checkbox" checked={attachChild} onChange={(event) => setAttachChild(event.target.checked)} /><span><strong>پرسش درباره {child.first_name} است</strong><small>این اتصال به‌تنهایی مجوز مشاهده پرونده سلامت ایجاد نمی‌کند.</small></span></label>
        <div className="consultation-safety"><strong>یادآوری ایمنی</strong><p>این بخش برای پاسخ غیرهم‌زمان است. در شرایط اورژانسی یا علائم شدید باید از خدمات درمانی فوری استفاده شود.</p></div>
        {error && <p className="service-error">{error}</p>}
        <Button disabled={busy} onClick={submit}>{busy ? "در حال ثبت…" : "ثبت پرسش"}</Button>
      </div>
    </div>
  </div>;
}

function ConsultationDetail({ questionId, isMine, onClose, onChanged }: { questionId: number; isMine: boolean; onClose: () => void; onChanged: () => Promise<unknown> }) {
  const query = useQuery({ queryKey: ["consultations", "question", questionId], queryFn: () => clientApi<ConsultationQuestion>(`/api/ninibu/consultations/questions/${questionId}`) });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function mutate(path: string, body?: unknown) {
    if (!query.data) return;
    setBusy(true); setError("");
    try {
      await clientApi(path, { method: "POST", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      await query.refetch(); await onChanged();
    } catch (caught) { setError(caught instanceof NinibuApiError ? caught.message : "عملیات انجام نشد."); }
    finally { setBusy(false); }
  }

  async function sendFollowup() {
    if (!message.trim()) return;
    await mutate(`/api/ninibu/consultations/questions/${questionId}/answers`, { body: message.trim() });
    setMessage("");
  }

  const question = query.data;
  return <div className="consultation-detail-backdrop service-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="consultation-detail" role="dialog" aria-modal="true" aria-label="جزئیات مشاوره">
      <header><div><small>مشاوره</small><strong>{question?.category.name || "پرسش"}</strong></div><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header>
      {query.isLoading && <div className="service-list-state">در حال دریافت جزئیات…</div>}
      {query.isError && <div className="service-list-state error-state">جزئیات پرسش دریافت نشد.</div>}
      {question && <div className="consultation-detail-scroll">
        <div className="consultation-question-copy"><div><span className={`consultation-status status-${question.status}`}>{consultationStatusLabel[question.status] || question.status}</span><span>{consultationPrivacyLabel[question.privacy] || question.privacy}</span></div><h1>{question.title}</h1><p>{question.body}</p><small>{formatDateTime(question.created_at)}</small></div>

        {(question.suggestions?.length ?? 0) > 0 && <section className="consultation-suggestions"><div className="consultation-section-heading"><Sparkles size={17} /><strong>پیشنهادهای اولیه نینیبو</strong></div><p className="suggestion-disclaimer">این موارد راهنمای عمومی و محتوایی هستند و جایگزین تشخیص یا تجویز پزشکی نیستند.</p>{question.suggestions?.map((suggestion) => <article key={suggestion.id}><Bot size={16} /><div><strong>{suggestion.title}</strong><p>{suggestion.explanation}</p></div></article>)}</section>}

        <section className="consultation-answers"><div className="consultation-section-heading"><MessageCircleQuestion size={17} /><strong>گفت‌وگو و پاسخ‌ها</strong></div>{(question.answers?.length ?? 0) === 0 && <p className="consultation-no-answer">هنوز پاسخی ثبت نشده است.</p>}{question.answers?.map((answer) => <AnswerCard key={answer.id} answer={answer} canAccept={isMine && !answer.is_accepted} onAccept={() => mutate(`/api/ninibu/consultations/questions/${question.id}/answers/${answer.id}/accept`)} />)}</section>
        {error && <p className="service-error">{error}</p>}
      </div>}
      {question && isMine && <footer className="consultation-detail-footer">
        {question.status !== "closed" && question.status !== "cancelled" && <div className="consultation-followup"><Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="پیام تکمیلی برای ادامه گفت‌وگو…" /><Button disabled={busy || !message.trim()} onClick={sendFollowup}><Send size={16} /> ارسال</Button></div>}
        <div className="consultation-lifecycle">{question.status === "closed" ? <Button variant="outline" disabled={busy} onClick={() => mutate(`/api/ninibu/consultations/questions/${question.id}/reopen`)}>باز کردن دوباره</Button> : <Button variant="ghost" disabled={busy} onClick={() => mutate(`/api/ninibu/consultations/questions/${question.id}/close`)}>بستن پرسش</Button>}</div>
      </footer>}
    </div>
  </div>;
}

function AnswerCard({ answer, canAccept, onAccept }: { answer: ConsultationAnswer; canAccept: boolean; onAccept: () => Promise<void> }) {
  return <article className={`consultation-answer ${answer.is_official ? "is-official" : ""}`}>
    <div className="consultation-answer-head"><span>{answer.is_official ? <BadgeCheck size={17} /> : <MessageCircleQuestion size={17} />}</span><div><strong>{answer.is_official ? "پاسخ رسمی متخصص" : answer.author_type === "parent" ? "پیام والد" : "پاسخ"}</strong><small>{formatDateTime(answer.created_at)}</small></div>{answer.is_accepted && <em><Check size={13} /> پاسخ پذیرفته‌شده</em>}</div>
    <p>{answer.body}</p>
    {canAccept && answer.is_official && <button className="accept-answer" onClick={onAccept}><Check size={14} /> این پاسخ برای من مفید بود</button>}
  </article>;
}
