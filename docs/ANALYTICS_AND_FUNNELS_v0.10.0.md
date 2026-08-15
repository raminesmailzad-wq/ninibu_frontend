# Analytics and Funnel Observability — v0.10.0

This frontend release keeps analytics provider-neutral. `NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT` may point to a collector later; product components do not depend on a vendor SDK. Events are also exposed through `window.dataLayer` and the `ninibu:analytics` browser event.

## Privacy boundary

The analytics helper applies an explicit property allow-list. Do not add child IDs, health measurements, diagnoses, notes, consultation text, search queries, selected dates/times, addresses or coordinates to product analytics. Service IDs are allowed because they identify public catalog entities rather than health records.

## Funnel semantics

Funnels persist in `sessionStorage` so refresh and route-stage transitions can be resumed. Booking distinguishes stage transitions inside the same service funnel from navigation away. Closing the booking modal or navigating out of that service booking path records abandonment; closing the tab records interruption so later analysis can classify session-end drop-off without pretending the user explicitly cancelled.

## Core events

- `session_started`
- `page_view` / `page_exit` with visible `engagement_ms`
- `funnel_started` / `funnel_resumed` / `funnel_step_viewed` / `funnel_completed` / `funnel_abandoned` / `funnel_interrupted`
- booking-specific compatibility events from v0.9.0
- health quick-action open/save/close events
- coarse Community, Discover/Search, Care, Services and Profile interaction events
