# v0.23.2 — MapLibre v6 production build fix

## v0.23.2 — 2026-08-27

- Fixed Admin Care Location form initialization TypeScript error (`x` was referenced outside scope).
- Fixed MapLibre single-point bounds handling under strict `noUncheckedIndexedAccess` TypeScript settings.
- Production `next build` now passes the two TypeScript failures reported after the v0.23.1 MapLibre ESM fix.

- Fixed Next.js 16 Turbopack build failure caused by the removed MapLibre GL JS v6 default export.
- Care Map now imports `Map`, `Marker`, `LngLatBounds`, `NavigationControl` and `AttributionControl` as ESM named exports.
- Frontend/Expo release metadata bumped to 0.23.2 (Android/iOS build 29).

# v0.23.0 — Admin CMS, Media Library and Care Directory

- Completed Admin CMS CRUD for content metadata, categories and tags while preserving revision/review/publish workflow.
- Added sanitized Rich Text editing with approved media insertion.
- Added Media Library with multipart image/file upload, rights/licence metadata, preview, edit and delete.
- Added full Care Location CRUD with searchable table + map, verification workflow, services/specialties and source metadata.
- Added binary-safe upload/public-media BFF routes and web rendering for rich HTML.
- Kept the public website and native Expo app in the same monorepo; mobile is 0.23.0 / Android versionCode 28.
- Requires Ninibu Backend v0.29.0.

# v0.22.0 — Care Map + Unified Search

- Added MapLibre-based care map on Web and react-native-maps on Mobile.
- Added care-location filtering, nearby discovery and unified Search navigation into the map.

# v0.21.2 — Expo Android APK readiness and final user parity

- Fixed the final TypeScript nullability errors in service booking and SponsoredSlot.
- Strengthened web/mobile user-access parity audit across 14 capability groups.
- Removed remaining small kicker/eyebrow labels above primary titles in mobile UI.
- YekanBakh FaNum preparation now distinguishes complete Regular/Medium/Bold assets from partial assets.
- Added `mobile:apk-check` to validate fonts, EAS preview APK config, Android identifiers/assets, lockfile and legacy routes.
- Added EAS lifecycle hooks so font preparation/preflight runs on the cloud builder and mobile typecheck runs after install/prebuild.
- Preview and development EAS profiles build installable Android APK artifacts; production remains store-oriented.
- App version is 0.21.2 / Android versionCode 25.

# v0.21.1 — Expo legacy-route/font-audit fix

- Fixed `mobile-font-audit` failure after overlay upgrades from v0.20.0.
- `mobile-preflight` now removes legacy `app/(auth)/index.tsx`, root `app/index.tsx`, and old maternal-health alias before audits/typecheck.
- Keeps the current `/login` auth route and independent `/maternal-health` route.
- No dependency changes from v0.21.0; existing regenerated `pnpm-lock.yaml` remains valid.
- Android versionCode: 24; app version: 0.21.1.

# v0.21.0 — Expo mobile user parity + YekanBakh FaNum

- ممیزی کامل دسترسی‌های کاربر عادی بین پنل وب و اپ موبایل.
- تکمیل Home action center با رزرو پیش‌رو، مشاوره منتظر پاسخ و اعلان‌ها.
- تکمیل سلامت فرزند با Health Timeline در کنار WHO، واکسن، ویزیت، دارو، حساسیت و تغذیه.
- سلامت مادر به‌صورت Tab مستقل و جدا از پرونده فرزند حفظ شد.
- تکمیل Community: پروفایل جامعه، ساخت پست، گروه‌های من، واکنش‌ها، پاسخ به دیدگاه و گزارش محتوا.
- تکمیل Discover: دانشنامه و جزئیات، bookmark، جست‌وجو/ترند/تاریخچه، personalization و مراکز نزدیک با expo-location.
- تکمیل Services/Consultations: رزرو، جزئیات، لغو/تغییر زمان، لینک جلسه، پرسش عمومی/شخصی، پاسخ، follow-up، accept، close/reopen.
- اضافه شدن Sponsored Slotهای کاربر برای Home/Community/Discover مطابق وب.
- آماده‌سازی کل UI موبایل برای YekanBakh FaNum با expo-font و اسکریپت تشخیص فایل فونت دارای مجوز.
- حذف kicker/eyebrowهای ریز بالای تیترهای اصلی در UI موبایل.
- اضافه شدن mobile-parity-audit به preflight.
- Android versionCode: 23 و app version: 0.21.0.

# v0.20.1

- Fix Expo mobile typecheck by excluding/removing stale `app-example` and `.expo` generated route types.
- Move auth screen to explicit `/login` route.
- Remove duplicate maternal-health alias route.
- Normalize mobile navigation URLs and add typed `href()` boundary.
- Fix duplicate React Native `elevation` style declarations.
- Keep Metro on port 8082 for coexistence with backend 8081.

# Changelog

## v0.20.0 — Expo physical-device mobile release

- Kept Expo SDK 54 intentionally for Expo Go physical-device testing during the current SDK transition.
- Moved Metro development server to port 8082 so it does not collide with the Ninibu backend on 8081.
- Added a dedicated bottom tab for maternal health and kept child health as a separate tab.
- Reworked maternal profile, cycle, breastfeeding and daily check-in forms with safe-area/keyboard-aware modals and Jalali date selection.
- Improved child-health quick-entry forms and kept clinician-approved nutrition recommendations in the child health route.
- Hardened community group join/leave and post-comment loading so comment failures no longer hide the post itself.
- Added identified/anonymous comment submission on mobile.
- Centralized Persian API error mapping for network, authentication, validation, access, rate-limit and server errors.
- Added an in-app backend connection test for Expo/device validation.
- Synced mobile app version metadata to 0.20.0 and added EAS preview APK configuration.

## v0.19.2 - Dashboard polish, maternal route, Persian error UX

- Maternal health moved out of child health into `/maternal-health` with its own navigation entry.
- Dashboard spacing, cards, responsive navigation and maternal shortcut were polished.
- YekanBakh is the preferred UI font with safe local/system fallbacks.
- Network, authentication, onboarding and API errors are normalized to Persian before display.
- Child health remains focused on growth, vaccination, medication, allergy, visit and clinician nutrition guidance.

## v0.19.0 - Admin login hardening

- `/admin` now has a dedicated login-only experience with no registration, OTP signup, or password-reset controls.
- Added a server-side proxy for the backend admin-only login endpoint.
- Public Ninibu signup remains available outside the admin console.

## v0.18.1 — Deployment consistency patch

- Updated the Web Docker image fallback to `ninibu-frontend:0.18.1`.
- Updated deployment documentation to the current Admin Control Center release.
- Kept the parent mobile application at v0.17.0; no mobile feature contract changed.
- Aligned the documented backend dependency with Ninibu Backend v0.26.1.

## v0.18.0 — Admin Control Center

- Added Web-only `/admin` control center with Admin/Super Admin role gating.
- Added operational management for content, ads, providers, community reports, users, commission finance, feature flags, global settings and audit events.
- System-setting edits and management-role changes are Super Admin only.
- Added unified authenticated admin BFF proxy and responsive RTL admin UI with centered modals.

## v0.17.0 — Mother/child health, community reliability, free-core model

- Maternal health and breastfeeding UI on Web/Mobile.
- Clinician-verified nutrition recommendation display.
- Mobile post comments and group detail/join flow fixes; Web group membership refresh fix.
- Free-core messaging in services/shop; no subscription UI.

## v0.16.3 — Android bottom safe-area fix

- Fixed the mobile bottom tab bar overlapping Android system navigation controls.
- Bottom tab height and padding now use `react-native-safe-area-context` dynamically.
- Added a minimum bottom padding for gesture-navigation devices while respecting larger 3-button navigation insets.
- Kept the existing five-tab navigation and styling unchanged above the safe-area adjustment.

# v0.16.2 — Mobile post-login routing fix

- Fixed a race after successful mobile authentication where `/auth/me` and `/profile` both succeeded but the router could render `/` before the new SessionProvider state had committed, briefly resolve the user as signed out, and leave the app on the auth screen.
- Added a declarative authenticated-user guard to the Expo Router auth layout. A valid signed-in session now always leaves `/(auth)` and goes to onboarding or the main tabs as appropriate.
- Removed the imperative `router.replace('/')` from the auth completion path; navigation now follows committed session state.
- Added complementary onboarding guards so signed-out users cannot remain on onboarding and completed users cannot get stranded there after session refresh.
- Preserved v0.16.1 safe auth/API diagnostics and production API default (`https://ninibu.com`).

# v0.16.1 — Mobile auth diagnostics

- Production mobile API base defaults to `https://ninibu.com`.
- Added safe Metro diagnostics for auth/session/API requests without printing access/refresh tokens or passwords.
- Login/session validation errors are no longer swallowed silently after a successful auth response.
- Removed `SplashScreen.setOptions` call that warns in Expo Go.

# Changelog

## v0.19.2 - Dashboard polish, maternal route, Persian error UX

- Maternal health moved out of child health into `/maternal-health` with its own navigation entry.
- Dashboard spacing, cards, responsive navigation and maternal shortcut were polished.
- YekanBakh is the preferred UI font with safe local/system fallbacks.
- Network, authentication, onboarding and API errors are normalized to Persian before display.
- Child health remains focused on growth, vaccination, medication, allergy, visit and clinician nutrition guidance.

## 0.16.0 - Native Expo Mobile

- Added `apps/mobile` as a complete Expo SDK 54 / React Native client.
- Added password-first native auth with SecureStore access/refresh token handling and automatic refresh on 401.
- Added Persian RTL onboarding, profile/residence editing, child creation and active-child switching.
- Added mobile dashboard, health/growth, WHO chart context, vaccination and visit quick-entry flows.
- Added community, Discover/Search/personalization, services/bookings/consultations, commerce/cart/orders/payment, notifications/preferences and advertising consent.
- Added real-device development through Expo Go and EAS cloud-build configuration so Android Studio is not required.
- Preserved the v0.15.0 web application and its Next.js BFF/HttpOnly-cookie authentication behavior.

## v0.15.0 — Password-first Authentication + Mediana OTP

- ورود روزمره با شماره موبایل و رمز عبور انجام می‌شود و دیگر پیامک مصرف نمی‌کند.
- OTP فقط برای ثبت‌نام اولیه و بازیابی/تعریف رمز عبور استفاده می‌شود.
- کاربران قدیمی بدون password به مسیر تعریف رمز با OTP هدایت می‌شوند.
- مسیرهای BFF جدید برای login، signup و password reset اضافه شدند.
- اعتبارسنجی رمز قبل از ارسال OTP انجام می‌شود تا پیامک غیرضروری ارسال نشود.

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

## v0.19.2 - Dashboard polish, maternal route, Persian error UX

- Maternal health moved out of child health into `/maternal-health` with its own navigation entry.
- Dashboard spacing, cards, responsive navigation and maternal shortcut were polished.
- YekanBakh is the preferred UI font with safe local/system fallbacks.
- Network, authentication, onboarding and API errors are normalized to Persian before display.
- Child health remains focused on growth, vaccination, medication, allergy, visit and clinician nutrition guidance.

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

## v0.20.0 — Expo Android mobile test
- Dedicated maternal health tab and mobile maternal records flow.
- Reworked child health, dashboard, community comments/groups, profile forms, onboarding, and Persian API errors.
- Expo Go LAN/tunnel scripts run Metro on port 8082 to avoid backend port 8081 conflict.
- EAS preview APK profile prepared.

## 0.20.2 - Expo hook-order runtime fix
- Fixed Android/Expo home screen crash: `Rendered more hooks than during the previous render`.
- Removed conditional `useMemo` execution from the mobile dashboard and made derived vaccine selection hook-free.
- Added `scripts/mobile-hooks-audit.mjs` and wired it into Expo/typecheck preflight so hook-after-early-return regressions fail before runtime.
- Bumped Expo app version to 0.20.2 and Android versionCode to 22.
