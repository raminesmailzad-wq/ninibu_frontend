# Notification Center — Frontend v0.6.0

Backend target: v0.22.2.

## UX

- The authenticated header bell opens the notification center.
- Inbox supports all/unread filters and backend pagination.
- Reading one item or all items invalidates both inbox and unread-count queries.
- Preferences are category based; in-app delivery is editable in this phase.
- Push, SMS and email are presented as unavailable until delivery support exists server-side.
- Advertising and commerce keep the backend opt-in defaults and are never silently enabled by the client.

## Date/time boundary

- All notification timestamps received from the backend are Gregorian ISO values.
- The UI renders them only through `@ninibu/datetime` Jalali/Persian formatters.
- Go zero timestamps are not rendered.
- Quiet hours are shown with Persian digits but normalized to ASCII `HH:MM` for API payloads.

## BFF

The web app proxies these authenticated backend contracts:

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count` (already present before v0.6)
- `POST /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/read-all`
- `GET /api/v1/notification-preferences`
- `PATCH /api/v1/notification-preferences`
