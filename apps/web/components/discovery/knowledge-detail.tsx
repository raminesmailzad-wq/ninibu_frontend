"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, ExternalLink, FileText, ShieldCheck, ThumbsDown, ThumbsUp, X } from "lucide-react";
import type { KnowledgeContent, KnowledgeDetail } from "@ninibu/types";
import { formatJalaliDate } from "@/lib/datetime";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { contentTypeLabels } from "./discovery-data";

export function KnowledgeDetailDrawer({ slug, onClose }: { slug: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<"helpful" | "not_helpful" | "">("");
  const detail = useQuery({ queryKey: ["content", "detail", slug], queryFn: () => clientApi<KnowledgeDetail>(`/api/ninibu/content/${encodeURIComponent(slug)}`) });
  const bookmarks = useQuery({ queryKey: ["content", "bookmarks"], queryFn: () => clientApi<KnowledgeContent[]>("/api/ninibu/content/bookmarks") });
  const content = detail.data?.content;
  const bookmarked = useMemo(() => Boolean(content && bookmarks.data?.some((item) => item.id === content.id)), [bookmarks.data, content]);

  const bookmarkMutation = useMutation({
    mutationFn: async () => { if (content) await clientApi(`/api/ninibu/content/${content.id}/bookmark`, { method: bookmarked ? "DELETE" : "POST" }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["content", "bookmarks"] })
  });
  const feedbackMutation = useMutation({ mutationFn: async (type: "helpful" | "not_helpful") => {
    if (!content) return;
    await clientApi(`/api/ninibu/content/${content.id}/interactions`, { method: "POST", body: JSON.stringify({ interaction_type: type, request_id: crypto.randomUUID() }) });
    setFeedback(type);
  }});

  useEffect(() => {
    if (!content?.id) return;
    void clientApi(`/api/ninibu/content/${content.id}/interactions`, { method: "POST", body: JSON.stringify({ interaction_type: "view", request_id: crypto.randomUUID() }) }).catch(() => undefined);
  }, [content?.id]);

  return <div className="knowledge-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="knowledge-drawer" role="dialog" aria-modal="true" aria-label="جزئیات محتوا">
      <header><div><small>{content ? contentTypeLabels[content.content_type] || "محتوا" : "دانشنامه"}</small><strong>{content?.title || "در حال دریافت…"}</strong></div><button onClick={onClose} aria-label="بستن"><X size={19} /></button></header>
      {detail.isLoading && <div className="discover-empty">در حال دریافت مطلب…</div>}
      {detail.isError && <div className="discover-empty">دریافت مطلب انجام نشد. دوباره تلاش کنید.</div>}
      {detail.data && <div className="knowledge-scroll">
        <div className="knowledge-title-row"><div><span className="eyebrow">{contentTypeLabels[detail.data.content.content_type] || "محتوا"}</span><h1>{detail.data.revision.title || detail.data.content.title}</h1>{detail.data.revision.summary && <p>{detail.data.revision.summary}</p>}</div>{detail.data.content.medical_review_required && <span className="medical-reviewed"><ShieldCheck size={16} /> بازبینی پزشکی</span>}</div>
        <div className="knowledge-meta"><span>انتشار: {formatJalaliDate(detail.data.revision.published_at || detail.data.content.published_at)}</span><span>ویرایش: {formatJalaliDate(detail.data.revision.updated_at)}</span></div>
        {detail.data.disclaimers.length > 0 && <div className="knowledge-disclaimer"><ShieldCheck size={18} /><div>{detail.data.disclaimers.map((item) => <p key={item.id}>{item.text}</p>)}</div></div>}
        <article className="knowledge-body">{detail.data.revision.body}</article>
        {detail.data.faqs.length > 0 && <section className="knowledge-section"><h2>پرسش‌های پرتکرار</h2>{detail.data.faqs.map((faq) => <details key={faq.id}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>}
        {detail.data.sources.length > 0 && <section className="knowledge-section"><h2>منابع</h2><div className="knowledge-sources">{detail.data.sources.map((source) => <article key={source.id}><div><FileText size={16} /><div><strong>{source.title}</strong><small>{source.publisher || source.source_type}{source.publication_date ? ` · ${formatJalaliDate(source.publication_date)}` : ""}</small></div></div>{source.url && <a href={source.url} target="_blank" rel="noreferrer"><ExternalLink size={15} /> منبع</a>}</article>)}</div></section>}
        <section className="knowledge-feedback"><div><strong>این مطلب مفید بود؟</strong><small>بازخورد شما برای بهترشدن پیشنهادها استفاده می‌شود.</small></div><div><button className={feedback === "helpful" ? "is-active" : ""} disabled={feedbackMutation.isPending} onClick={() => feedbackMutation.mutate("helpful")}><ThumbsUp size={16} /> بله</button><button className={feedback === "not_helpful" ? "is-active" : ""} disabled={feedbackMutation.isPending} onClick={() => feedbackMutation.mutate("not_helpful")}><ThumbsDown size={16} /> نه</button></div></section>
      </div>}
      {content && <footer><Button variant="outline" disabled={bookmarkMutation.isPending} onClick={() => bookmarkMutation.mutate()}>{bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />} {bookmarked ? "ذخیره شده" : "ذخیره مطلب"}</Button></footer>}
    </aside>
  </div>;
}
