# Ninibu Frontend v0.6.0

## Notification Center & Preferences

The header notification indicator is now an interactive Notification Center backed by the existing Backend v0.22.2 notification APIs.

Highlights:

- All and unread notification inboxes with pagination.
- Mark-one-read and mark-all-read actions.
- Persian category and priority presentation.
- Jalali/Persian notification date-time display and relative time.
- Per-category in-app notification preferences.
- Quiet hours displayed with Persian digits and sent as backend `HH:MM` values.
- Go zero timestamps are suppressed from the user interface.
- Responsive desktop drawer and mobile bottom sheet behavior.

No backend contract or database migration is required for this frontend release.
