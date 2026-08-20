"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Megaphone, X } from "lucide-react";
import type { AdvertisingDeliveryItem, AdvertisingDeliveryResponse } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";

export type SafeAdPlacement = "home_feed" | "community_feed" | "community_group_feed" | "public_content_list" | "public_content_detail" | "search_results" | "consultation_categories";

function eventBody(
  requestId: string,
  creativeId: number,
  eventType: "impression" | "click" | "dismiss",
  metadata: Record<string, string>,
) {
  return { request_id: requestId, creative_id: creativeId, event_type: eventType, metadata };
}

function destinationOf(item: AdvertisingDeliveryItem): { kind: "internal" | "external" | "none"; value?: string } {
  const creative = item.creative;
  const type = creative.destination_type ?? "";
  const value = creative.destination_value ?? creative.destination_url ?? creative.internal_path;
  if (!value) return { kind: "none" };
  if (type === "external_url" || /^https?:\/\//i.test(value)) return { kind: "external", value };
  if (type === "community_group" && /^\d+$/.test(value)) return { kind: "internal", value: `/community/groups/${value}` };
  if (type === "consultation_category" && /^\d+$/.test(value)) return { kind: "internal", value: `/services/consultations?category_id=${value}` };
  return { kind: "internal", value: value.startsWith("/") ? value : `/${value}` };
}

export function SponsoredSlot({ placement, className = "" }: { placement: SafeAdPlacement; className?: string }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<AdvertisingDeliveryResponse | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(() => new Set());
  const impressions = useRef(new Set<number>());

  useEffect(() => {
    let cancelled = false;
    clientApi<AdvertisingDeliveryResponse>(`/api/ninibu/advertising/placements/${placement}/items?language=fa&platform=web&app_version=0.13.0&limit=1`)
      .then((data) => { if (!cancelled) setDelivery(data); })
      .catch(() => { if (!cancelled) setDelivery(null); });
    return () => { cancelled = true; };
  }, [placement]);

  const item = useMemo(() => delivery?.items.find((candidate) => candidate.sponsored && !dismissed.has(candidate.creative.id)), [delivery, dismissed]);

  useEffect(() => {
    if (!item || !delivery?.request_id || impressions.current.has(item.creative.id)) return;
    impressions.current.add(item.creative.id);
    void clientApi("/api/ninibu/advertising/events", { method: "POST", body: JSON.stringify(eventBody(delivery.request_id, item.creative.id, "impression", { screen: placement })) }).catch(() => undefined);
  }, [item, delivery?.request_id]);

  if (!item || !delivery?.request_id) return null;
  const activeItem = item;
  const requestId = delivery.request_id;
  const destination = destinationOf(activeItem);

  async function record(type: "click" | "dismiss") {
    try {
      await clientApi("/api/ninibu/advertising/events", {
        method: "POST",
        body: JSON.stringify(
          eventBody(
            requestId,
            activeItem.creative.id,
            type,
            type === "click" ? { destination: destination.kind } : { screen: placement },
          ),
        ),
      });
    } catch {}
  }

  async function openDestination() {
    if (destination.kind === "none" || !destination.value) return;
    void record("click");
    if (destination.kind === "external") window.open(destination.value, "_blank", "noopener,noreferrer");
    else router.push(destination.value);
  }

  async function dismiss() {
    setDismissed((current) => new Set(current).add(activeItem.creative.id));
    await record("dismiss");
  }

  return <aside className={`sponsored-slot ${className}`} aria-label="تبلیغ حمایت‌شده">
    <div className="sponsored-slot-mark"><Megaphone size={17} /><span>حمایت‌شده</span></div>
    <div className="sponsored-slot-copy">
      <strong>{activeItem.creative.title || "پیشنهاد تبلیغاتی"}</strong>
      {activeItem.creative.body && <p>{activeItem.creative.body}</p>}
    </div>
    {destination.kind !== "none" && <button type="button" className="sponsored-slot-action" onClick={openDestination}>{activeItem.creative.call_to_action || "مشاهده"}{destination.kind === "external" && <ExternalLink size={13} />}</button>}
    <button type="button" className="sponsored-slot-dismiss" onClick={dismiss} aria-label="بستن تبلیغ" title="این تبلیغ را نبین"><X size={14} /></button>
  </aside>;
}
