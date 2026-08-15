# Action Center — v0.11.0

The dashboard Action Center surfaces the next useful continuation without introducing a new backend contract. It can show a resumable booking draft, the nearest confirmed booking, a consultation waiting for parent input, unread notifications and a near-term vaccination follow-up.

Booking drafts are session-local, expire after seven days, and can be dismissed explicitly. Closing a booking modal still emits abandonment analytics, but the parent can resume the saved draft later.

Booking and consultation details now have stable frontend routes so browser history, refresh and deep links preserve context. No sensitive child/health content is added to URLs or analytics events.
