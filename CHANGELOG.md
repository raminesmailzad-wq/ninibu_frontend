# Changelog

## v0.14.0 — WHO Growth Intelligence
- نمودارهای استاندارد WHO به صفحه سلامت و رشد کودک اضافه شد و روند واقعی کودک روی منحنی‌های مرجع نمایش داده می‌شود.
- شاخص‌های وزن نسبت به سن، قد/طول نسبت به سن، BMI نسبت به سن و دور سر نسبت به سن مطابق داده خروجی Backend v0.23.0 پشتیبانی می‌شوند.
- آخرین Z-score و صدک تقریبی نمایش داده می‌شود و وضعیت فقط به‌صورت موقعیت نسبت به بازه‌های SD بیان می‌شود، نه تشخیص پزشکی.
- نمودار responsive است و در موبایل اسکرول افقی ایجاد نمی‌کند.
- تاریخ نقاط نمودار همچنان جلالی/فارسی است و هیچ تغییری در Modal، Date Picker، لوگو، routing یا Analytics تأییدشده ایجاد نشده است.

## v0.13.0 — Targeted Advertising + Commerce / Marketplace
- فاز v0.12 تبلیغات هدفمند تکمیل شد: جایگاه‌های امن، برچسب صریح «حمایت‌شده»، ثبت impression/click/dismiss و تنظیمات رضایت کاربر.
- تبلیغ در صفحات خصوصی سلامت کودک، دارو، حساسیت، تشخیص و مشاوره خصوصی قرار نمی‌گیرد و هیچ داده سلامت به delivery/event تبلیغات ارسال نمی‌شود.
- فروشگاه v0.13 با مسیر واقعی `/shop`، کاتالوگ محصول، جزئیات و variant، سبد خرید، checkout preview، سفارش‌ها، لغو سفارش و شروع پرداخت اضافه شد.
- Checkout نهایی با اطلاعات تحویل‌گیرنده/آدرس مطابق قرارداد Backend v0.22.2 تکمیل شد و به‌صورت Modal مرکزی روی مسیر `/shop/checkout` باز می‌شود.
- مسیرهای محصول، سبد، checkout و سفارش برای Back/Forward، Refresh، Deep Link و Funnel Analytics مستقل هستند.
- رویدادهای commerce فقط شناسه‌های فنی و مرحله Funnel را ثبت می‌کنند و داده سلامت/فرزند یا متن آزاد وارد Analytics نمی‌شود.
- ظاهر تأییدشده، لوگو، Modal مرکزی، Date Picker جلالی و قرارداد تاریخ فرانت/بک‌اند بدون تغییر باقی ماند.

## v0.11.0 — Action Center & resumable journeys
- داشبورد یک بخش «برای اقدام» دارد که رزرو نیمه‌کاره، رزرو پیش‌رو، مشاوره منتظر پاسخ والد، اعلان خوانده‌نشده و پیگیری نزدیک واکسن را یکجا نشان می‌دهد.
- Draft رزرو در sessionStorage تا ۷ روز نگه‌داری می‌شود و با بستن Modal فوراً پاک نمی‌شود؛ کاربر می‌تواند از داشبورد ادامه دهد یا آن را کنار بگذارد.
- رزروها و مشاوره‌ها مسیر جزئیات واقعی دارند (`/services/bookings/:id` و `/services/consultations/:id`) تا Action Center، Refresh، Deep Link و Back/Forward روی همان مورد کار کنند.
- مرکز اعلان‌ها می‌تواند از Action Center باز شود بدون تغییر URL یا قرارداد Backend.
- Analytics برای بازکردن آیتم‌های Action Center، ذخیره/ادامه/حذف Draft رزرو و جزئیات رزرو/مشاوره توسعه یافت؛ متن فرم، تاریخ انتخاب‌شده، شناسه کودک و داده سلامت همچنان ارسال نمی‌شود.
- Modal/Date Picker جلالی، ظاهر تأییدشده داشبورد و قرارداد API بدون تغییر باقی مانده‌اند.
- v0.12.0 همچنان فقط برای زیرساخت تبلیغات هدفمند محفوظ است.

## v0.10.0 — UX analytics & funnel observability
- Analytics foundation upgraded from simple event emission to a bounded session queue with retry support, event sequence numbers and explicit session-start events.
- Route analytics now records visible engagement time and page-exit reason while avoiding hidden-tab time inflation.
- Generic funnel lifecycle added: started, resumed, step viewed, completed, abandoned and interrupted.
- Service booking now keeps a resumable funnel and records abandonment when the modal is closed or the user navigates away from that booking route.
- Health quick actions (growth, vaccination, visit) now expose open/save/abandon funnel signals.
- Community interactions, Discover tabs/search result types, recommendation feedback, explicit nearby-care requests and Profile form actions now emit coarse analytics events.
- Analytics property allow-list prevents accidental transmission of child IDs, health values, free text, search queries, dates/times or geolocation coordinates.
- Existing URLs, visuals, Modal stack and Jalali Date Picker are unchanged.
- No Backend/API contract change.

## v0.9.0 — Route-based navigation & funnel analytics foundation
- ناوبری اصلی داشبورد از state داخلی به URL واقعی منتقل شد: `/dashboard`, `/health`, `/community`, `/discover`, `/services`, `/profile`.
- تب‌های خدمات مسیر مستقل دارند: `/services/bookings` و `/services/consultations`.
- جریان رزرو مسیر مرحله‌ای دارد: `schedule` → `review` → `payment` → `success` و state ضروریِ غیرحساس برای refresh در `sessionStorage` نگه‌داری می‌شود.
- دکمه بازگشت از history واقعی مرورگر/Next Router استفاده می‌کند.
- پایه Analytics provider-neutral اضافه شد: page view، navigation و funnel رزرو با eventهای privacy-safe؛ اطلاعات پزشکی، نام کودک، متن یادداشت و تاریخ/ساعت انتخابی وارد analytics نمی‌شوند.
- ارسال analytics اختیاری است و فقط با `NEXT_PUBLIC_NINIBU_ANALYTICS_ENDPOINT` فعال می‌شود؛ در غیر این صورت event hookهای محلی/dataLayer در دسترس‌اند.
- ظاهر تأییدشده v0.8.x، Modalهای مرکزی و Date Picker جلالی بدون تغییر رفتاری حفظ شدند.

## v0.8.3
- Refined the internal back-navigation control so it no longer consumes header layout width.
- Back action is now a compact icon control with subtle hover/focus feedback.
- Mobile placement is overlaid beside the menu control to preserve the previous header composition.

## v0.8.1 — Internal navigation history
- Added an in-app navigation history for dashboard sections that do not change the URL path.
- Added a Back control in the app header on desktop and mobile.
- Main menu, dashboard shortcuts and logo navigation now participate in the same history stack.

## v0.8.0 — Dashboard Clarity & Visual Refresh
- کنتراست داشبورد و پوسته داخلی افزایش یافت بدون تغییر فایل یا ظاهر لوگو.
- soft colorهای بنفش، صورتی، سبز و خنثی فقط در محیط authenticated app عمیق‌تر شدند.
- border، shadow، متن‌های ثانویه و کارت‌های سفید واضح‌تر شدند تا بخش‌ها روی پس‌زمینه گم نشوند.
- Hero، دسترسی‌های سریع، کارت‌های رشد/سلامت و پیشنهادها سلسله‌مراتب بصری واضح‌تری دارند.
- مسیرهای جامعه والدین، مشاوره و مراکز نزدیک در انتهای داشبورد قابل کلیک شدند.
- استاندارد Modal وسط صفحه و Jalali Date Picker لایه دوم بدون تغییر حفظ شد.
- هیچ تغییر Backend/API لازم نیست.

## v0.7.0 — Profile & Family Management
- پروفایل حساب از حالت صرفاً نمایشی به بخش قابل ویرایش ارتقا یافت.
- ویرایش نام، نام خانوادگی، تاریخ تولد جلالی و جنسیت والد با API موجود پروفایل.
- ویرایش کشور، استان، شهر و آدرس با انتخاب‌های وابسته جغرافیایی.
- بخش خانواده با کارت فرزندان، سن، تاریخ تولد جلالی و انتخاب فرزند فعال.
- افزودن فرزند جدید از داخل پروفایل با Date Picker جلالی و Modal استاندارد وسط صفحه.
- تمام فرم‌های این فاز از ModalPortal مرکزی و Date Picker nested با z-index بالاتر استفاده می‌کنند.
- هیچ تغییر قرارداد Backend لازم نیست.


## v0.6.6
- Jalali Date Picker: direct Persian year selection added.
- Jalali Date Picker: direct Persian month selection added.
- Existing centered nested-modal behavior and Gregorian API values preserved.

# v0.6.5

- یکپارچه‌سازی تمام فرم‌های modal روی Portal مرکزی و بازشدن در مرکز viewport.
- حذف رفتار drawer/bottom-sheet برای فرم‌ها در دسکتاپ و موبایل.
- قفل اسکرول با شمارنده مشترک برای modalهای تو در تو.
- Date Picker جلالی به‌صورت nested modal با z-index بالاتر از فرم اصلی.
- Escape فقط بالاترین modal را می‌بندد.

# Changelog

## v0.6.4
- Centered quick-action modal stack.
- Jalali date picker uses a higher modal layer over forms.
- Prevented page/horizontal scrolling caused by nested date pickers.


## 0.6.3
- بازگردانی Date Picker به تمام ورودی‌های تاریخ و تبدیل تقویم به جلالی/فارسی.
- انتخاب و نمایش تاریخ در فرانت جلالی است؛ مقدار ارسالی به API همچنان میلادی `YYYY-MM-DD` است.
- Date Picker بدون وابستگی خارجی جدید پیاده‌سازی شد تا مشکل resolve پکیج تکرار نشود.

## v0.6.1 — Workspace resolution hotfix

- Fixed Next.js/Turbopack build error `Module not found: Can't resolve '@ninibu/datetime'`.
- Frontend runtime date helpers are now resolved through the stable local alias `@/lib/datetime`, so replacing a release does not require a newly-created workspace symlink for the date module.
- Jalali/Persian UI date behavior and Gregorian/ISO API payload behavior are unchanged.

## 0.6.0 — 2026-08-13

### Added
- Full in-app Notification Center connected to the existing Backend v0.22.2 notification APIs.
- All/unread filtering, pagination, mark-one-read and mark-all-read flows.
- Per-category notification preference management and quiet-hours editing.
- Persian notification category/priority labels and responsive desktop/mobile drawer UI.
- Notification boundary tests for Go zero timestamps and Persian/ASCII clock conversion.

### Changed
- Header notification badge now opens the real Notification Center instead of being display-only.
- Notification timestamps use centralized Jalali/Persian formatting and relative-time presentation.
- Quiet-hour inputs display Persian digits while API payloads remain ASCII `HH:MM`.
- Workspace package versions updated to 0.6.0.
- Frontend release package no longer carries Postman artifacts because the backend contract did not change.

### Privacy / Safety
- Advertising and commerce notification preferences remain explicit opt-ins and separate from sensitive health data.
- Notification preferences use only the existing backend notification contract; no new health-data sharing path is introduced.

## 0.5.0 — 2026-08-12

### Added
- Full **Discover** surface with explainable personalized recommendations, Knowledge Base, unified Search and verified CareLocation discovery.
- Knowledge library filters by category/content type and requests child-age-appropriate public educational content when an active child is available.
- Knowledge article detail with published revision, medical-review badge, disclaimers, FAQ, sources, bookmark and helpful/not-helpful feedback.
- Unified search across knowledge content, community, clinicians, services, products and sellers with suggestions, trends, history and result-click analytics.
- Verified care-location discovery by residence city or one-time browser geolocation, including distance and OpenStreetMap handoff for public center coordinates.
- Shared `@ninibu/datetime` package for Persian/Jalali display and Jalali→Gregorian form conversion.
- Jalali date input component for parent birth date, child birth date, growth measurement, vaccination and medical-visit forms.
- Regression tests for Nowruz conversion, Persian digits and Gregorian backend payload dates.
- New Next.js BFF routes for Knowledge, Search, CareLocation discovery and personalization feedback/signals.

### Changed
- All user-visible calendar dates use the Persian calendar and Persian digits (`fa-IR-u-ca-persian-nu-persian`).
- Date-only form values are entered as Jalali (`۱۴۰۵/۰۵/۲۱`) but converted to Gregorian (`2026-08-12`) before reaching the backend boundary.
- Booking/consultation date-time and slot rendering uses the centralized Jalali formatting policy.
- Community relative-time fallback dates use the Jalali calendar.
- Mobile primary navigation includes Discover; Profile remains reachable from the side menu.
- Workspace package versions updated to 0.5.0.

### Privacy / Safety
- One-time geolocation is requested only after an explicit **Nearby me** action and is not persisted to profile/localStorage by the frontend.
- Care discovery consumes the backend verified public directory endpoint.
- Health records are not sent to Search, Advertising or CareLocation discovery. Child age is used only as a public educational-content audience filter.
- Personalized cards show an explanation/reason and keep sponsored advertising outside the organic recommendation/search surface.

## 0.4.0 — 2026-08-10

### Added
- Full Services hub replacing the previous Services placeholder.
- Public commerce service catalog with search/category filter and service cards.
- Live booking availability, date/slot selection and child-aware booking.
- Free-service booking and paid-service payment initialization.
- Sandbox payment success/failure controls for local development when provider is `sandbox`.
- Booking history, detail, meeting link, cancellation and rescheduling.
- Parent consultation UI with private/public/anonymous-public modes.
- Consultation categories, question composer, own/public lists and question detail.
- Official specialist answer badge, answer acceptance and follow-up messages.
- Consultation close/reopen lifecycle and rule-based backend suggestions.
- Shared TypeScript contracts for consultation, commerce services, booking and payment.
- Shared API path builders and Next.js BFF routes for all flows used in this release.
- Helper tests for booking de-duplication and API paths.

### Changed
- Workspace package versions updated to 0.4.0.
- Services item in desktop/mobile navigation now opens the real Services/Booking/Consultation surface.

### Compatibility
- Backend v0.22.2 has a duplicate append in `modules/booking/service.go` `ListBookings`; the frontend defensively de-duplicates identical booking IDs so the UI does not show duplicates. This is a backend bugfix candidate and not a change to booking semantics.

### Privacy / Safety
- Booking child association does not imply clinician health-record consent.
- Consultation is kept separate from the private health record.
- Public consultation only uses backend-permitted answered/closed questions.
- System suggestions are labeled as general guidance and not diagnosis/prescription.
- Browser auth tokens remain in HttpOnly BFF cookies.

## 0.3.2
- Fixed React 19/ESLint strict lint failures in AppFrame.
- Stabilized child collection memoization and removed synchronous setState from effects.
- Renamed ChildSwitcher `children` prop to `items` to follow React conventions.
- Replaced raw logo `<img>` with Next.js `<Image>`.
- Stabilized Community group list memoization.
- Named PostCSS config export.

## 0.3.1
- Fixed TypeScript strictness issues in active-child selection and Community composer.

## 0.3.0
- Added full Community & Parent Groups product surface.
