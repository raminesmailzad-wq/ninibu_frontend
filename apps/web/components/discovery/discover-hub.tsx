"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Bookmark,
  Building2,
  ChevronLeft,
  Compass,
  Crosshair,
  LocateFixed,
  MapPin,
  Search,
  Sparkles,
  Stethoscope,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  X
} from "lucide-react";
import type {
  CareLocationListResponse,
  Child,
  KnowledgeCategory,
  KnowledgeContent,
  KnowledgeContentListResponse,
  PersonalizationFeedResponse,
  Profile,
  SearchHistory,
  SearchItem,
  SearchResponse,
  SearchSuggestionsResponse,
  SearchTrend
} from "@ninibu/types";
import { formatJalaliDate, formatRelativeFa } from "@/lib/datetime";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KnowledgeDetailDrawer } from "./knowledge-detail";
import { careLocationTypeLabels, contentTypeLabels, recommendationReasonLabels, searchTypeLabels } from "./discovery-data";
import { trackEvent } from "@/lib/analytics";

type DiscoverTab = "smart" | "knowledge" | "search" | "care";
type Coordinates = { lat: number; lng: number };

const faNumber = new Intl.NumberFormat("fa-IR-u-nu-persian");

function childAgeDays(birthDate: string) {
  const born = new Date(`${birthDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(born)) return undefined;
  return Math.max(0, Math.floor((Date.now() - born) / 86_400_000));
}

function itemsOf<T>(value: T[] | { items?: T[] } | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value?.items ?? [];
}

export function DiscoverHub({ child, profile }: { child: Child; profile?: Profile }) {
  const [tab, setTab] = useState<DiscoverTab>("smart");
  const [selectedSlug, setSelectedSlug] = useState("");

  function changeTab(next: DiscoverTab, source = "tab") {
    if (next === tab) return;
    trackEvent("discover_tab_selected", { tab: next, source });
    setTab(next);
  }

  function openKnowledge(slug: string, source: string) {
    trackEvent("discover_content_opened", { content_type: "knowledge_content", source });
    setSelectedSlug(slug);
  }

  return <section className="discover-page">
    <div className="discover-hero">
      <div>
        <span className="eyebrow"><Compass size={15}/> کشف نینیبو</span>
        <h1>پیدا کن، بخوان و آگاهانه انتخاب کن</h1>
        <p>محتوای معتبر، جست‌وجوی یکپارچه، پیشنهادهای قابل توضیح و مراکز درمانی تأییدشده؛ بدون استفاده از پرونده سلامت برای تبلیغات.</p>
      </div>
      <div className="discover-hero-badge"><Sparkles size={22}/><div><strong>پیشنهاد برای {child.first_name}</strong><small>بر اساس علایق و فعالیت‌های مجاز</small></div></div>
    </div>

    <nav className="discover-tabs" aria-label="بخش‌های کشف">
      <DiscoverTabButton active={tab === "smart"} onClick={() => changeTab("smart")} icon={Sparkles}>برای شما</DiscoverTabButton>
      <DiscoverTabButton active={tab === "knowledge"} onClick={() => changeTab("knowledge")} icon={BookOpen}>دانشنامه</DiscoverTabButton>
      <DiscoverTabButton active={tab === "search"} onClick={() => changeTab("search")} icon={Search}>جست‌وجو</DiscoverTabButton>
      <DiscoverTabButton active={tab === "care"} onClick={() => changeTab("care")} icon={MapPin}>مراکز درمانی</DiscoverTabButton>
    </nav>

    {tab === "smart" && <SmartFeed child={child} onOpenKnowledge={(slug) => openKnowledge(slug, "smart_feed")} onJump={(next) => changeTab(next, "shortcut")} />}
    {tab === "knowledge" && <KnowledgeLibrary child={child} onOpen={(slug) => openKnowledge(slug, "knowledge_library")} />}
    {tab === "search" && <UnifiedSearch onOpenKnowledge={(slug) => openKnowledge(slug, "search_result")} />}
    {tab === "care" && <CareDiscovery profile={profile} />}

    {selectedSlug && <KnowledgeDetailDrawer slug={selectedSlug} onClose={() => setSelectedSlug("")} />}
  </section>;
}

function DiscoverTabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: typeof Sparkles; children: ReactNode }) {
  return <button className={active ? "is-active" : ""} onClick={onClick}><Icon size={17}/><span>{children}</span></button>;
}

function SmartFeed({ child, onOpenKnowledge, onJump }: { child: Child; onOpenKnowledge: (slug: string) => void; onJump: (tab: DiscoverTab) => void }) {
  const queryClient = useQueryClient();
  const feed = useQuery({
    queryKey: ["personalization", "feed", child.id],
    queryFn: () => clientApi<PersonalizationFeedResponse>(`/api/ninibu/recommendations/feed?limit=12&child_id=${child.id}`)
  });
  const feedback = useMutation({
    mutationFn: ({ id, type }: { id: number; type: "helpful" | "not_interested" }) => clientApi(`/api/ninibu/recommendations/${id}/feedback`, { method: "POST", body: JSON.stringify({ feedback_type: type }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["personalization", "feed", child.id] })
  });

  return <div className="discover-stack">
    <section className="discover-section">
      <div className="section-heading"><div><span className="section-kicker">پیشنهاد هوشمند</span><h2>برای شما و {child.first_name}</h2></div><small>قابل توضیح و بدون هدف‌گیری پزشکی</small></div>
      {feed.isLoading ? <DiscoveryState>در حال آماده‌کردن پیشنهادها…</DiscoveryState> : feed.isError ? <DiscoveryState error>پیشنهادها دریافت نشدند.</DiscoveryState> : feed.data?.items.length ? <div className="smart-grid">
        {feed.data.items.map((item) => <article className="smart-card" key={item.recommendation_id}>
          <div className="smart-card-top"><span><Sparkles size={18}/></span><em>{searchTypeLabels[item.entity_type] || item.entity_type}</em></div>
          <h3>{item.title}</h3><p>{item.summary || "پیشنهاد مرتبط با علایق و فعالیت‌های شما در نینیبو."}</p>
          <small>{recommendationReasonLabels[item.reason_code] || "پیشنهاد قابل توضیح نینیبو"}</small>
          <footer>
            {item.entity_type === "knowledge_content" && typeof item.metadata?.slug === "string" ? <button onClick={() => onOpenKnowledge(String(item.metadata?.slug))}>مشاهده <ChevronLeft size={14}/></button> : <span/>}
            <div><button title="مفید بود" disabled={feedback.isPending} onClick={() => { trackEvent("recommendation_feedback", { action: "helpful", result_type: item.entity_type }); feedback.mutate({ id: item.recommendation_id, type: "helpful" }); }}><ThumbsUp size={15}/></button><button title="علاقه ندارم" disabled={feedback.isPending} onClick={() => { trackEvent("recommendation_feedback", { action: "not_interested", result_type: item.entity_type }); feedback.mutate({ id: item.recommendation_id, type: "not_interested" }); }}><ThumbsDown size={15}/></button></div>
          </footer>
        </article>)}
      </div> : <DiscoveryState>هنوز پیشنهاد شخصی‌سازی‌شده‌ای نداریم؛ با مطالعه و جست‌وجو بهتر می‌شود.</DiscoveryState>}
    </section>

    <section className="discovery-shortcuts">
      <button onClick={() => onJump("knowledge")}><BookOpen size={20}/><div><strong>دانشنامه والدین</strong><small>محتوای منتشرشده و بازبینی‌شده</small></div><ChevronLeft size={17}/></button>
      <button onClick={() => onJump("search")}><Search size={20}/><div><strong>جست‌وجوی همه نینیبو</strong><small>محتوا، گروه، متخصص، خدمت و فروشگاه</small></div><ChevronLeft size={17}/></button>
      <button onClick={() => onJump("care")}><MapPin size={20}/><div><strong>مراکز تاییدشده نزدیک</strong><small>بر اساس شهر یا موقعیت لحظه‌ای شما</small></div><ChevronLeft size={17}/></button>
    </section>
  </div>;
}

function KnowledgeLibrary({ child, onOpen }: { child: Child; onOpen: (slug: string) => void }) {
  const [category, setCategory] = useState("");
  const [contentType, setContentType] = useState("");
  const age = childAgeDays(child.birth_date);
  const categories = useQuery({ queryKey: ["content", "categories"], queryFn: () => clientApi<KnowledgeCategory[] | { items: KnowledgeCategory[] }>("/api/ninibu/content/categories") });
  const bookmarks = useQuery({ queryKey: ["content", "bookmarks"], queryFn: () => clientApi<KnowledgeContent[] | { items: KnowledgeContent[] }>("/api/ninibu/content/bookmarks") });
  const query = new URLSearchParams({ language: "fa", page: "1", limit: "24" });
  if (category) query.set("category", category);
  if (contentType) query.set("type", contentType);
  if (typeof age === "number") query.set("child_age_days", String(age));
  const contents = useQuery({
    queryKey: ["content", "list", category, contentType, age],
    queryFn: () => clientApi<KnowledgeContentListResponse>(`/api/ninibu/content?${query.toString()}`)
  });
  const bookmarkIds = useMemo(() => new Set(itemsOf(bookmarks.data).map((item) => item.id)), [bookmarks.data]);

  return <section className="discover-section">
    <div className="section-heading"><div><span className="section-kicker">دانشنامه نینیبو</span><h2>مطالب آموزشی برای والدین</h2></div><small>نمایش تاریخ انتشار با تقویم جلالی</small></div>
    <div className="knowledge-filters">
      <Select value={category} onChange={(event) => { setCategory(event.target.value); trackEvent("knowledge_filter_changed", { category: event.target.value || "all", action: "category" }); }} aria-label="دسته محتوا">
        <option value="">همه دسته‌ها</option>{itemsOf(categories.data).map((item) => <option value={item.code} key={item.id}>{item.name}</option>)}
      </Select>
      <Select value={contentType} onChange={(event) => { setContentType(event.target.value); trackEvent("knowledge_filter_changed", { content_type: event.target.value || "all", action: "content_type" }); }} aria-label="نوع محتوا">
        <option value="">همه انواع</option>{Object.entries(contentTypeLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
      </Select>
    </div>
    {contents.isLoading ? <DiscoveryState>در حال دریافت مطالب…</DiscoveryState> : contents.isError ? <DiscoveryState error>دانشنامه در دسترس نیست.</DiscoveryState> : contents.data?.items.length ? <div className="knowledge-grid">
      {contents.data.items.map((item) => <button className="knowledge-card" key={item.id} onClick={() => onOpen(item.slug)}>
        <div><span className="badge">{contentTypeLabels[item.content_type] || item.content_type}</span>{bookmarkIds.has(item.id) && <Bookmark size={16} fill="currentColor"/>}</div>
        <h3>{item.title}</h3><p>{item.summary || "برای مشاهده جزئیات این مطلب را باز کنید."}</p>
        <footer><small>{item.published_at ? formatJalaliDate(item.published_at) : "در انتظار انتشار"}</small><ChevronLeft size={16}/></footer>
      </button>)}
    </div> : <DiscoveryState>مطلبی با این فیلتر پیدا نشد.</DiscoveryState>}
  </section>;
}

function UnifiedSearch({ onOpenKnowledge }: { onOpenKnowledge: (slug: string) => void }) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [type, setType] = useState("");
  const deferredInput = useDeferredValue(input.trim());

  const suggestions = useQuery({
    queryKey: ["search", "suggestions", deferredInput],
    queryFn: () => clientApi<SearchSuggestionsResponse>(`/api/ninibu/search/suggestions?q=${encodeURIComponent(deferredInput)}&limit=6`),
    enabled: deferredInput.length >= 2 && !submitted
  });
  const trends = useQuery({ queryKey: ["search", "trending"], queryFn: () => clientApi<SearchTrend[] | { items: SearchTrend[] }>("/api/ninibu/search/trending?limit=8") });
  const history = useQuery({ queryKey: ["search", "history"], queryFn: () => clientApi<SearchHistory[] | { items: SearchHistory[] }>("/api/ninibu/search/history?limit=10") });
  const results = useQuery({
    queryKey: ["search", "results", submitted, type],
    queryFn: async () => {
      const params = new URLSearchParams({ q: submitted, language: "fa", page: "1", limit: "30" });
      if (type) params.set("type", type);
      const result = await clientApi<SearchResponse>(`/api/ninibu/search?${params.toString()}`);
      void clientApi("/api/ninibu/search/events", { method: "POST", body: JSON.stringify({ event_type: "search", query: result.query || submitted, result_count: result.total, request_id: crypto.randomUUID() }) }).catch(() => undefined);
      trackEvent("discover_search_results", { result_type: type || "all", count: result.total });
      return result;
    },
    enabled: Boolean(submitted)
  });
  const clearHistory = useMutation({
    mutationFn: () => clientApi("/api/ninibu/search/history", { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["search", "history"] })
  });
  const deleteHistory = useMutation({
    mutationFn: (id: number) => clientApi(`/api/ninibu/search/history/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["search", "history"] })
  });

  function runSearch(value = input) {
    const q = value.trim();
    if (!q) return;
    setInput(q);
    setSubmitted(q);
    trackEvent("discover_search_submitted", { result_type: type || "all" });
  }

  function clickResult(item: SearchItem, position: number) {
    trackEvent("discover_search_result_opened", { result_type: item.type, position });
    if (results.data) {
      void clientApi("/api/ninibu/search/events", { method: "POST", body: JSON.stringify({ event_type: "result_click", query: results.data.query || submitted, result_count: results.data.total, selected_entity_type: item.type, selected_entity_id: item.id, position, request_id: crypto.randomUUID() }) }).catch(() => undefined);
    }
    const slug = typeof item.metadata?.slug === "string" ? item.metadata.slug : "";
    if (item.type === "knowledge_content" && slug) onOpenKnowledge(slug);
  }

  return <section className="discover-section search-section">
    <div className="section-heading"><div><span className="section-kicker">جست‌وجوی عمومی</span><h2>در نینیبو چه چیزی می‌خواهید پیدا کنید؟</h2></div><small>فقط اطلاعات عمومی و قابل کشف</small></div>
    <form className="unified-searchbar" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
      <Search size={18}/><Input value={input} onChange={(event) => { setInput(event.target.value); if (submitted) setSubmitted(""); }} placeholder="مثلاً خواب کودک، واکسیناسیون یا متخصص تغذیه" />
      <Select value={type} onChange={(event) => setType(event.target.value)} aria-label="نوع نتیجه"><option value="">همه</option>{Object.entries(searchTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
      <Button type="submit">جست‌وجو</Button>
    </form>

    {!submitted && suggestions.data?.suggestions?.length ? <div className="search-suggestions">{suggestions.data.suggestions.map((suggestion) => <button key={suggestion} onClick={() => runSearch(suggestion)}><Search size={14}/>{suggestion}</button>)}</div> : null}

    {!submitted ? <div className="search-before-grid">
      <div className="search-side-card"><header><div><TrendingUp size={18}/><strong>جست‌وجوهای پرطرفدار</strong></div></header><div className="trend-list">{itemsOf(trends.data).length ? itemsOf(trends.data).map((item) => <button key={item.id} onClick={() => runSearch(item.query)}>{item.query}<small>{faNumber.format(item.search_count)} جست‌وجو</small></button>) : <p>هنوز روند عمومی کافی ثبت نشده است.</p>}</div></div>
      <div className="search-side-card"><header><div><Search size={18}/><strong>جست‌وجوهای اخیر شما</strong></div>{itemsOf(history.data).length > 0 && <button className="text-action" disabled={clearHistory.isPending} onClick={() => clearHistory.mutate()}>پاک کردن همه</button>}</header><div className="history-list">{itemsOf(history.data).length ? itemsOf(history.data).map((item) => <div key={item.id}><button onClick={() => runSearch(item.query)}><span>{item.query}</span><small>{formatRelativeFa(item.created_at)}</small></button><button aria-label="حذف از تاریخچه" disabled={deleteHistory.isPending} onClick={() => deleteHistory.mutate(item.id)}><X size={14}/></button></div>) : <p>هنوز جست‌وجویی ثبت نشده است.</p>}</div></div>
    </div> : results.isLoading ? <DiscoveryState>در حال جست‌وجو…</DiscoveryState> : results.isError ? <DiscoveryState error>جست‌وجو انجام نشد.</DiscoveryState> : <div className="search-results">
      <div className="search-results-head"><strong>{faNumber.format(results.data?.total ?? 0)} نتیجه برای «{submitted}»</strong><button className="text-action" onClick={() => { setSubmitted(""); setInput(""); }}>جست‌وجوی جدید</button></div>
      {results.data?.results.length ? results.data.results.map((item, index) => <button className="search-result-card" key={`${item.type}-${item.id}`} onClick={() => clickResult(item, index + 1)}>
        <span className="search-result-icon">{item.type === "clinician" ? <Stethoscope size={18}/> : item.type === "community_group" ? <Building2 size={18}/> : <BookOpen size={18}/>}</span>
        <div><small>{searchTypeLabels[item.type] || item.type}</small><strong>{item.title}</strong><p>{item.summary || ""}</p><footer>{item.published_at && <span>{formatJalaliDate(item.published_at)}</span>}{item.tags?.slice(0, 3).map((tag) => <em key={tag}>{tag}</em>)}</footer></div><ChevronLeft size={17}/>
      </button>) : <DiscoveryState>نتیجه‌ای پیدا نشد.</DiscoveryState>}
    </div>}
  </section>;
}

function CareDiscovery({ profile }: { profile?: Profile }) {
  const [coords, setCoords] = useState<Coordinates>();
  const [kind, setKind] = useState("");
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);
  const cityId = profile?.city?.id;
  const params = new URLSearchParams({ page: "1", limit: "20" });
  if (coords) {
    params.set("lat", String(coords.lat)); params.set("lng", String(coords.lng)); params.set("radius_km", "15");
  } else if (cityId) params.set("city_id", String(cityId));
  if (kind) params.set("type", kind);
  const care = useQuery({
    queryKey: ["care-locations", coords?.lat, coords?.lng, cityId, kind],
    queryFn: () => clientApi<CareLocationListResponse>(`/api/ninibu/care-locations/discover?${params.toString()}`),
    enabled: Boolean(coords || cityId)
  });

  function locate() {
    setLocationError("");
    trackEvent("care_nearby_requested", { source: "explicit_user_action" });
    if (!navigator.geolocation) { setLocationError("مرورگر شما دریافت موقعیت را پشتیبانی نمی‌کند."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
        trackEvent("care_nearby_result", { result: "granted" });
      },
      () => {
        setLocationError("اجازه موقعیت داده نشد یا موقعیت قابل دریافت نبود.");
        setLocating(false);
        trackEvent("care_nearby_result", { result: "denied_or_failed" });
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }

  return <section className="discover-section">
    <div className="section-heading"><div><span className="section-kicker">دایرکتوری سلامت</span><h2>مراکز درمانی تأییدشده</h2></div><small>موقعیت دقیق شما ذخیره نمی‌شود</small></div>
    <div className="care-toolbar">
      <Select value={kind} onChange={(event) => { setKind(event.target.value); trackEvent("care_filter_changed", { category: event.target.value || "all" }); }} aria-label="نوع مرکز"><option value="">همه مراکز</option>{Object.entries(careLocationTypeLabels).filter(([key]) => !["home", "other"].includes(key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
      <Button variant="outline" disabled={locating} onClick={locate}><LocateFixed size={17}/>{locating ? "در حال دریافت…" : "نزدیک من"}</Button>
      {coords && <button className="text-action" onClick={() => setCoords(undefined)}>بازگشت به شهر محل سکونت</button>}
    </div>
    <div className="care-context"><Crosshair size={16}/><span>{coords ? "نتایج بر اساس موقعیت لحظه‌ای دستگاه نمایش داده می‌شوند و این مختصات در پروفایل ذخیره نمی‌شوند." : cityId ? `نمایش مراکز تأییدشده در ${profile?.city?.local_name || profile?.city?.name || "شهر محل سکونت"}.` : "برای نمایش مراکز، شهر محل سکونت را در پروفایل ثبت کنید یا گزینه «نزدیک من» را بزنید."}</span></div>
    {locationError && <p className="care-error">{locationError}</p>}
    {!coords && !cityId ? <DiscoveryState>شهر محل سکونت ثبت نشده است؛ می‌توانید فقط برای همین جست‌وجو اجازه موقعیت بدهید.</DiscoveryState> : care.isLoading ? <DiscoveryState>در حال دریافت مراکز…</DiscoveryState> : care.isError ? <DiscoveryState error>مراکز درمانی دریافت نشدند.</DiscoveryState> : care.data?.items.length ? <div className="care-grid">
      {care.data.items.map((item) => <article className="care-card" key={item.id}>
        <div className="care-card-icon"><Building2 size={20}/></div><div className="care-card-copy"><small>{careLocationTypeLabels[item.type] || "مرکز درمانی"}</small><h3>{item.name}</h3><p>{item.address || [item.city, item.province].filter(Boolean).join("، ") || "نشانی عمومی مرکز"}</p><footer>{typeof item.distance_km === "number" && <span><MapPin size={14}/>{faNumber.format(item.distance_km)} کیلومتر</span>}{typeof item.latitude === "number" && typeof item.longitude === "number" && <a href={`https://www.openstreetmap.org/?mlat=${item.latitude}&mlon=${item.longitude}#map=16/${item.latitude}/${item.longitude}`} target="_blank" rel="noreferrer">نمایش روی نقشه</a>}</footer></div>
      </article>)}
    </div> : <DiscoveryState>مرکز تأییدشده‌ای با این فیلتر پیدا نشد.</DiscoveryState>}
  </section>;
}

function DiscoveryState({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div className={`discovery-state ${error ? "is-error" : ""}`}>{children}</div>;
}
