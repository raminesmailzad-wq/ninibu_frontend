# Routing & Analytics — Frontend v0.9.0

## Stable routes
- `/dashboard`
- `/health`
- `/community`
- `/discover`
- `/services`
- `/services/bookings`
- `/services/consultations`
- `/profile`
- `/services/{serviceId}/book/schedule`
- `/services/{serviceId}/book/review`
- `/services/{serviceId}/book/payment`
- `/services/{serviceId}/book/success`

## Booking funnel events
- `booking_started`
- `booking_funnel_step_viewed`
- `booking_date_selected`
- `booking_slot_selected`
- `booking_submit_clicked`
- `booking_submit_failed`
- `booking_payment_redirected`
- `booking_completed`
- `booking_abandoned` when the user explicitly closes the flow before success

Funnel drop-off can also be inferred from the last `booking_funnel_step_viewed` event when there is no matching completion event.

## Privacy rule
Generic analytics intentionally excludes child/profile identifiers, names, health values, free-text notes, search text, selected booking date and selected booking time. Service offering IDs are allowed as opaque commerce identifiers.

## Collector integration
Set `NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT` to a first-party collector or analytics gateway when persistence is ready. Feature code does not need to change. Events are also emitted through `window` event `ninibu:analytics` and a compatible `dataLayer` hook.
