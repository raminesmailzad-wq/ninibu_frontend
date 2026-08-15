import type { AppSection } from "@/components/app/navigation";

export const sectionRoutes: Record<AppSection, string> = {
  home: "/dashboard",
  health: "/health",
  community: "/community",
  discover: "/discover",
  services: "/services",
  shop: "/shop",
  profile: "/profile",
};

export function sectionFromPathname(pathname: string): AppSection {
  if (pathname.startsWith("/health")) return "health";
  if (pathname.startsWith("/community")) return "community";
  if (pathname.startsWith("/discover")) return "discover";
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/shop")) return "shop";
  if (pathname.startsWith("/profile")) return "profile";
  return "home";
}

export type ServicesTab = "services" | "bookings" | "consultations";

export function servicesTabFromPathname(pathname: string): ServicesTab {
  if (pathname.startsWith("/services/bookings")) return "bookings";
  if (pathname.startsWith("/services/consultations")) return "consultations";
  return "services";
}

export type BookingStage = "schedule" | "review" | "payment" | "success";

export function bookingRoute(serviceId: number | string, stage: BookingStage = "schedule") {
  return `/services/${serviceId}/book/${stage}`;
}

export function bookingRouteState(pathname: string): { serviceId: number; stage: BookingStage } | null {
  const match = /^\/services\/(\d+)\/book(?:\/(schedule|review|payment|success))?\/?$/.exec(pathname);
  if (!match) return null;
  const serviceId = Number(match[1]);
  if (!Number.isSafeInteger(serviceId) || serviceId <= 0) return null;
  return { serviceId, stage: (match[2] as BookingStage | undefined) ?? "schedule" };
}


export function bookingDetailRoute(bookingId: number | string) {
  return `/services/bookings/${bookingId}`;
}

export function bookingDetailRouteState(pathname: string): number | null {
  const match = /^\/services\/bookings\/(\d+)\/?$/.exec(pathname);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function consultationRoute(questionId: number | string) {
  return `/services/consultations/${questionId}`;
}

export function consultationRouteState(pathname: string): number | null {
  const match = /^\/services\/consultations\/(\d+)\/?$/.exec(pathname);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export type ShopRouteState =
  | { view: "catalog" }
  | { view: "product"; id: number }
  | { view: "cart" }
  | { view: "checkout" }
  | { view: "orders" }
  | { view: "order"; id: number };

export function shopRouteState(pathname: string): ShopRouteState {
  const product = /^\/shop\/products\/(\d+)\/?$/.exec(pathname);
  if (product) return { view: "product", id: Number(product[1]) };
  const order = /^\/shop\/orders\/(\d+)\/?$/.exec(pathname);
  if (order) return { view: "order", id: Number(order[1]) };
  if (pathname.startsWith("/shop/cart")) return { view: "cart" };
  if (pathname.startsWith("/shop/checkout")) return { view: "checkout" };
  if (pathname.startsWith("/shop/orders")) return { view: "orders" };
  return { view: "catalog" };
}
