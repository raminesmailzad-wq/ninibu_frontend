"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ensureAnalyticsSession, handleRouteFunnelTransition, snapshotActiveFunnels, trackEvent } from "@/lib/analytics";
import { sectionFromPathname } from "@/lib/routes";

export function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    ensureAnalyticsSession();
    const section = sectionFromPathname(pathname);
    let visibleStarted = document.visibilityState === "visible" ? performance.now() : null;
    let visibleElapsed = 0;
    let emitted = false;

    trackEvent("page_view", {
      section,
      route: pathname,
      has_query: Boolean(window.location.search),
    });

    const visibility = () => {
      if (document.visibilityState === "hidden" && visibleStarted !== null) {
        visibleElapsed += performance.now() - visibleStarted;
        visibleStarted = null;
      } else if (document.visibilityState === "visible" && visibleStarted === null) {
        visibleStarted = performance.now();
      }
    };

    const emitExit = (reason: string) => {
      if (emitted) return;
      emitted = true;
      if (visibleStarted !== null) visibleElapsed += performance.now() - visibleStarted;
      trackEvent("page_exit", {
        section,
        route: pathname,
        engagement_ms: Math.max(0, Math.round(visibleElapsed)),
        reason,
      });
    };

    const pageHide = () => {
      emitExit("pagehide");
      snapshotActiveFunnels("pagehide");
    };

    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pageHide);
    return () => {
      const nextPath = window.location.pathname;
      emitExit("route_change");
      if (nextPath !== pathname) handleRouteFunnelTransition(pathname, nextPath);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pageHide);
    };
  }, [pathname]);

  return null;
}
