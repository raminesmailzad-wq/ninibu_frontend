import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mobile = path.join(root, 'apps/mobile');

const checks = [
  ['احراز هویت', 'app/(auth)/login.tsx', ['login(', 'signupRequestOtp', 'signup(', 'forgotRequestOtp', 'resetPassword']],
  ['آن‌بوردینگ', 'app/onboarding.tsx', ['profile', 'countries', 'provinces', 'cities', 'children', 'onboardingComplete']],
  ['خانه', 'app/(app)/(tabs)/index.tsx', ['ChildSwitcher', 'bookings', 'consultations', 'recommendations', 'SponsoredSlot', '/health', '/maternal-health', '/community', '/services', '/discover', '/shop']],
  ['سلامت فرزند', 'app/(app)/(tabs)/health.tsx', ['childGrowthMeasurements', 'childGrowthChart', 'childVaccinations', 'childAllergies', 'childMedications', 'childMedicalVisits', 'childHealthTimeline', 'childNutritionRecommendations']],
  ['سلامت مادر', 'src/screens/MaternalHealthScreen.tsx', ['maternalHealthProfile', 'maternalHealthCycles', 'maternalHealthBreastfeeding', 'maternalHealthCheckIns', 'maternalHealthGuidance']],
  ['جامعه', 'app/(app)/(tabs)/community.tsx', ['communityFeed', 'communityGroups', 'communityProfile', 'SponsoredSlot']],
  ['گروه جامعه', 'app/(app)/community/groups/[groupId].tsx', ['communityGroupJoin', 'communityGroupLeave', 'communityGroupPosts']],
  ['پست/دیدگاه جامعه', 'app/(app)/community/posts/[postId].tsx', ['communityPostComments', 'communityPostReactions', 'communityPostReaction', 'communityCommentReactions', 'communityCommentReaction', 'communityReports']],
  ['کشف و محتوا', 'app/(app)/(tabs)/discover.tsx', ['personalizationFeed', 'personalizationFeedback', 'contentCategories', 'contentBookmarks', 'contentBookmark', 'contentDetail', 'searchSuggestions', 'searchTrending', 'searchHistory', 'searchEvents', 'careLocationDiscover', 'requestForegroundPermissionsAsync', 'SponsoredSlot']],
  ['خدمات و رزرو', 'app/(app)/services.tsx', ['commerceServices', 'serviceAvailability', 'bookings', 'bookingCancel', 'bookingReschedule', 'orderPayments', 'sandboxPaymentSucceed', 'sandboxPaymentFail']],
  ['مشاوره', 'app/(app)/services.tsx', ['consultationCategories', 'consultationQuestions', 'consultationPublicQuestions', 'consultationQuestionAnswers', 'consultationAnswerAccept', 'consultationQuestionClose', 'consultationQuestionReopen']],
  ['فروشگاه', 'app/(app)/shop.tsx', ['commerceProducts', 'commerceProduct', 'commerceCart', 'commerceCartItems', 'commerceCheckoutPreview', 'commerceOrders', 'commerceOrder', 'commerceOrderCancel', 'orderPayments', 'sandboxPaymentSucceed', 'sandboxPaymentFail']],
  ['اعلان‌ها', 'app/(app)/notifications.tsx', ['notifications', 'notificationRead', 'notificationsReadAll', 'notificationPreferences']],
  ['پروفایل', 'app/(app)/profile.tsx', ['profile', 'children', 'countries', 'provinces', 'cities', 'advertisingPreferences', 'خروج از حساب', 'افزودن فرزند']],
];

const problems = [];
for (const [name, relative, markers] of checks) {
  const file = path.join(mobile, relative);
  if (!fs.existsSync(file)) {
    problems.push(`${name}: فایل ${relative} وجود ندارد`);
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  for (const marker of markers) {
    if (!source.includes(marker)) problems.push(`${name}: قابلیت/نشانه ${marker} پیدا نشد`);
  }
}

const tabLayoutPath = path.join(mobile, 'app/(app)/(tabs)/_layout.tsx');
if (!fs.existsSync(tabLayoutPath)) problems.push('Tab layout وجود ندارد');
else {
  const tabLayout = fs.readFileSync(tabLayoutPath, 'utf8');
  for (const label of ['خانه', 'سلامت فرزند', 'سلامت مادر', 'جامعه', 'بیشتر']) {
    if (!tabLayout.includes(label)) problems.push(`Tab: ${label} پیدا نشد`);
  }
}

const morePath = path.join(mobile, 'app/(app)/(tabs)/more.tsx');
if (!fs.existsSync(morePath)) problems.push('صفحه بیشتر وجود ندارد');
else {
  const more = fs.readFileSync(morePath, 'utf8');
  for (const route of ['/discover', '/services', '/shop', '/notifications', '/profile']) {
    if (!more.includes(route)) problems.push(`More: مسیر ${route} پیدا نشد`);
  }
}

const maternalTab = path.join(mobile, 'app/(app)/(tabs)/maternal-health.tsx');
if (!fs.existsSync(maternalTab)) problems.push('سلامت مادر باید Tab مستقل داشته باشد');

const allFiles = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.tsx?$/.test(entry.name)) allFiles.push(target);
  }
}
walk(path.join(mobile, 'app'));
walk(path.join(mobile, 'src'));
const allMobile = allFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
if (/kicker|eyebrow|section-kicker/i.test(allMobile)) problems.push('UI: تیتر ریز بالای تیتر اصلی (kicker/eyebrow) هنوز در سورس موبایل وجود دارد');

const forbiddenLegacy = ['app-example', 'app/(auth)/index.tsx', 'app/index.tsx', 'app/(app)/maternal-health.tsx'];
for (const relative of forbiddenLegacy) {
  if (fs.existsSync(path.join(mobile, relative))) problems.push(`مسیر قدیمی/تکراری باید حذف شود: ${relative}`);
}

if (problems.length) {
  console.error('[mobile-parity-audit] failed');
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}
console.log(`[mobile-parity-audit] passed ${checks.length} user-access capability groups; web/mobile parity markers are present`);
