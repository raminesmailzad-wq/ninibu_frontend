"use client";

export type AnalyticsPrimitive = string | number | boolean | null;
export type AnalyticsProperties = Record<string, AnalyticsPrimitive | undefined>;

export type NinibuAnalyticsEvent = {
  event_id: string;
  event_name: string;
  occurred_at: string;
  session_id: string;
  sequence: number;
  path: string;
  properties: Record<string, AnalyticsPrimitive>;
};

type ActiveFunnel = {
  funnel: string;
  key: string;
  step: string;
  started_at: string;
  updated_at: string;
  properties: Record<string, AnalyticsPrimitive>;
};

const SESSION_KEY = "ninibu_analytics_session_id";
const SESSION_STARTED_KEY = "ninibu_analytics_session_started";
const SEQUENCE_KEY = "ninibu_analytics_sequence";
const QUEUE_KEY = "ninibu_analytics_queue_v1";
const FUNNELS_KEY = "ninibu_analytics_funnels_v1";
const MAX_QUEUE = 100;

// Keep analytics deliberately coarse. Values entered by parents, child identifiers,
// health notes, selected dates/times, search queries and free text must never be added here.
const ALLOWED_PROPERTIES = new Set([
  "section", "route", "has_query", "reason", "engagement_ms", "from_section", "to_section",
  "from_route", "target_route", "tab", "source", "action", "flow", "form", "modal", "result",
  "funnel", "funnel_key", "step", "previous_step", "elapsed_ms", "service_id", "payment_required",
  "sandbox_success", "status", "category", "content_type", "result_type", "page", "position", "count",
  "product_id", "cart_item_id", "quantity", "item_count", "payment_ready", "order_id", "provider",
  "personalized", "location", "interest",
]);

function safeSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const current = window.sessionStorage.getItem(SESSION_KEY);
    if (current) return current;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return crypto.randomUUID();
  }
}

function nextSequence(): number {
  if (typeof window === "undefined") return 0;
  try {
    const current = Number(window.sessionStorage.getItem(SEQUENCE_KEY) || "0");
    const next = Number.isSafeInteger(current) ? current + 1 : 1;
    window.sessionStorage.setItem(SEQUENCE_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

function sanitize(properties: AnalyticsProperties = {}): Record<string, AnalyticsPrimitive> {
  return Object.fromEntries(
    Object.entries(properties).filter(
      (entry): entry is [string, AnalyticsPrimitive] => ALLOWED_PROPERTIES.has(entry[0]) && entry[1] !== undefined,
    ),
  );
}

function readQueue(): NinibuAnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(-MAX_QUEUE) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: NinibuAnalyticsEvent[]) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_QUEUE))); } catch { /* storage unavailable */ }
}

function queueEvent(payload: NinibuAnalyticsEvent) {
  const queue = readQueue();
  queue.push(payload);
  writeQueue(queue);
}

function endpoint(): string {
  return process.env.NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT?.trim() || "";
}

async function sendEvent(payload: NinibuAnalyticsEvent, beaconPreferred = true): Promise<boolean> {
  const target = endpoint();
  if (!target || typeof window === "undefined") return false;
  const body = JSON.stringify(payload);

  if (beaconPreferred) {
    try {
      if (navigator.sendBeacon) {
        const sent = navigator.sendBeacon(target, new Blob([body], { type: "application/json" }));
        if (sent) return true;
      }
    } catch { /* fetch fallback */ }
  }

  try {
    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getBufferedAnalyticsEvents(): NinibuAnalyticsEvent[] {
  return readQueue();
}

export function flushAnalyticsQueue() {
  if (typeof window === "undefined" || !endpoint()) return;
  const queue = readQueue();
  if (!queue.length) return;
  writeQueue([]);
  void Promise.all(queue.map((event) => sendEvent(event, false))).then((results) => {
    const failed = queue.filter((_, index) => !results[index]);
    if (failed.length) writeQueue([...failed, ...readQueue()]);
  });
}

export function trackEvent(eventName: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;

  const payload: NinibuAnalyticsEvent = {
    event_id: crypto.randomUUID(),
    event_name: eventName,
    occurred_at: new Date().toISOString(),
    session_id: safeSessionId(),
    sequence: nextSequence(),
    path: `${window.location.pathname}${window.location.search}`,
    properties: sanitize(properties),
  };

  const windowWithDataLayer = window as Window & { dataLayer?: unknown[] };
  windowWithDataLayer.dataLayer?.push({ event: "ninibu_event", ninibu: payload });
  window.dispatchEvent(new CustomEvent("ninibu:analytics", { detail: payload }));

  if (!endpoint()) {
    // Keep a short session-local diagnostic buffer until a real collector is configured.
    queueEvent(payload);
    return;
  }
  void sendEvent(payload).then((sent) => { if (!sent) queueEvent(payload); });
}

export function ensureAnalyticsSession() {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(SESSION_STARTED_KEY)) return;
    window.sessionStorage.setItem(SESSION_STARTED_KEY, new Date().toISOString());
  } catch { /* still emit */ }
  trackEvent("session_started", { source: "web" });
  flushAnalyticsQueue();
}

function readFunnels(): ActiveFunnel[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(FUNNELS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeFunnels(funnels: ActiveFunnel[]) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(FUNNELS_KEY, JSON.stringify(funnels)); } catch { /* noop */ }
}

function findFunnel(funnel: string, key: string) {
  return readFunnels().find((item) => item.funnel === funnel && item.key === key);
}

function funnelElapsed(item: ActiveFunnel): number {
  const started = Date.parse(item.started_at);
  return Number.isFinite(started) ? Math.max(0, Date.now() - started) : 0;
}

export function startFunnel(funnel: string, key: string, step: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;
  const funnels = readFunnels();
  const existing = funnels.find((item) => item.funnel === funnel && item.key === key);
  if (existing) {
    trackEvent("funnel_resumed", { funnel, funnel_key: key, step: existing.step, elapsed_ms: funnelElapsed(existing), ...properties });
    return;
  }
  const now = new Date().toISOString();
  const item: ActiveFunnel = { funnel, key, step, started_at: now, updated_at: now, properties: sanitize(properties) };
  writeFunnels([...funnels, item]);
  trackEvent("funnel_started", { funnel, funnel_key: key, step, ...properties });
}

export function advanceFunnel(funnel: string, key: string, step: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;
  const funnels = readFunnels();
  const index = funnels.findIndex((item) => item.funnel === funnel && item.key === key);
  if (index < 0) {
    startFunnel(funnel, key, step, properties);
    return;
  }
  const current = funnels[index];
  if (!current) {
    startFunnel(funnel, key, step, properties);
    return;
  }
  if (current.step === step) return;
  const next: ActiveFunnel = {
    ...current,
    step,
    updated_at: new Date().toISOString(),
    properties: { ...current.properties, ...sanitize(properties) },
  };
  funnels[index] = next;
  writeFunnels(funnels);
  trackEvent("funnel_step_viewed", {
    funnel,
    funnel_key: key,
    step,
    previous_step: current.step,
    elapsed_ms: funnelElapsed(current),
    ...properties,
  });
}

export function completeFunnel(funnel: string, key: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;
  const funnels = readFunnels();
  const current = funnels.find((item) => item.funnel === funnel && item.key === key);
  if (!current) return;
  writeFunnels(funnels.filter((item) => !(item.funnel === funnel && item.key === key)));
  trackEvent("funnel_completed", { funnel, funnel_key: key, step: current.step, elapsed_ms: funnelElapsed(current), ...properties });
}

export function abandonFunnel(funnel: string, key: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;
  const funnels = readFunnels();
  const current = funnels.find((item) => item.funnel === funnel && item.key === key);
  if (!current) return;
  writeFunnels(funnels.filter((item) => !(item.funnel === funnel && item.key === key)));
  trackEvent("funnel_abandoned", { funnel, funnel_key: key, step: current.step, elapsed_ms: funnelElapsed(current), ...properties });
}

export function snapshotActiveFunnels(reason: string) {
  if (typeof window === "undefined") return;
  for (const item of readFunnels()) {
    trackEvent("funnel_interrupted", {
      funnel: item.funnel,
      funnel_key: item.key,
      step: item.step,
      elapsed_ms: funnelElapsed(item),
      reason,
    });
  }
}

export function handleRouteFunnelTransition(fromPath: string, toPath: string) {
  const booking = /^\/services\/(\d+)\/book(?:\/(?:schedule|review|payment|success))?\/?$/.exec(fromPath);
  if (booking) {
    const serviceKey = booking[1];
    if (serviceKey) {
      const stillSameBooking = new RegExp(`^/services/${serviceKey}/book(?:/(?:schedule|review|payment|success))?/?$`).test(toPath);
      if (!stillSameBooking) abandonFunnel("service_booking", serviceKey, { reason: "navigation_away" });
    }
  }

  const commerceCheckout = /^\/shop\/checkout\/?$/.test(fromPath);
  const commercePayment = /^\/shop\/orders\/\d+\/?$/.test(fromPath);
  const continuesCommerce = /^\/shop\/(?:checkout|orders\/\d+)\/?$/.test(toPath);
  if ((commerceCheckout || commercePayment) && !continuesCommerce) {
    abandonFunnel("commerce_checkout", "active_cart", { reason: "navigation_away" });
  }
}

export function hasActiveFunnel(funnel: string, key: string) {
  return Boolean(findFunnel(funnel, key));
}
