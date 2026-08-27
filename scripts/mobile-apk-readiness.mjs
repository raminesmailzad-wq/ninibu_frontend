import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mobile = path.join(root, 'apps/mobile');
const problems = [];
const warnings = [];

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { problems.push(`JSON نامعتبر: ${path.relative(root, file)} (${error.message})`); return {}; }
}

const rootPackage = readJson(path.join(root, 'package.json'));
const mobilePackage = readJson(path.join(mobile, 'package.json'));
const app = readJson(path.join(mobile, 'app.json'))?.expo ?? {};
const eas = readJson(path.join(mobile, 'eas.json'));
const expectedVersion = mobilePackage.version;

if (!expectedVersion) problems.push('version در apps/mobile/package.json تعیین نشده است');
if (rootPackage.version !== expectedVersion) problems.push(`نسخه root (${rootPackage.version}) با mobile (${expectedVersion}) یکسان نیست`);
if (app.version !== expectedVersion) problems.push(`نسخه app.json (${app.version}) با mobile (${expectedVersion}) یکسان نیست`);
if (app.android?.package !== 'com.ninibu.app') problems.push('Android package باید com.ninibu.app باشد');
if (!Number.isInteger(app.android?.versionCode) || app.android.versionCode < 1) problems.push('android.versionCode معتبر نیست');
if (eas?.build?.preview?.android?.buildType !== 'apk') problems.push('EAS preview باید android.buildType=apk داشته باشد');
if (eas?.build?.preview?.env?.EXPO_PUBLIC_NINIBU_BACKEND_URL !== 'https://ninibu.com') problems.push('Backend URL پروفایل preview باید https://ninibu.com باشد');

for (const dependency of ['expo', 'expo-router', 'expo-font', 'expo-secure-store', 'expo-splash-screen', 'expo-location', 'expo-linking', 'expo-system-ui', 'react-native-webview', 'react', 'react-native']) {
  if (!mobilePackage.dependencies?.[dependency]) problems.push(`dependency لازم وجود ندارد: ${dependency}`);
}

for (const asset of ['assets/icon.png', 'assets/adaptive-icon.png', 'assets/splash.png', 'assets/ninibu-logo.png']) {
  if (!fs.existsSync(path.join(mobile, asset))) problems.push(`asset لازم وجود ندارد: ${asset}`);
}

const requiredFontFiles = ['YekanBakhFaNum-Regular.ttf', 'YekanBakhFaNum-Bold.ttf'];
for (const font of requiredFontFiles) {
  if (!fs.existsSync(path.join(mobile, 'assets/fonts', font))) {
    problems.push(`فونت لازم برای APK وجود ندارد: apps/mobile/assets/fonts/${font}`);
  }
}
const mediumFont = path.join(mobile, 'assets/fonts', 'YekanBakhFaNum-Medium.ttf');
if (!fs.existsSync(mediumFont)) {
  warnings.push('YekanBakhFaNum-Medium.ttf موجود نیست؛ وزن Medium به‌صورت امن از Regular استفاده می‌کند');
}

const lockPath = path.join(root, 'pnpm-lock.yaml');
if (!fs.existsSync(lockPath)) {
  warnings.push('pnpm-lock.yaml داخل بسته مبنا نبود؛ پس از جایگزینی پروژه، pnpm install --no-frozen-lockfile را یک بار اجرا کنید');
} else {
  const lock = fs.readFileSync(lockPath, 'utf8');
  if (!/\n  apps\/mobile:\n/.test(lock)) problems.push('pnpm-lock.yaml فاقد importer مربوط به apps/mobile است؛ pnpm install --no-frozen-lockfile را یک بار اجرا کنید');
  for (const specifier of ['expo-font', 'expo-location', 'expo-linking', 'expo-system-ui', 'react-native-webview']) if (!lock.includes(`${specifier}:`)) problems.push(`pnpm-lock.yaml هنوز ${specifier} را ثبت نکرده است`);
  if (lock.includes('react-native-maps:')) problems.push('pnpm-lock.yaml هنوز react-native-maps را دارد؛ pnpm install --no-frozen-lockfile را اجرا کنید');
}


if (mobilePackage.dependencies?.['react-native-maps']) problems.push('react-native-maps باید از اپ موبایل حذف شده باشد');
const appConfigPath = path.join(mobile, 'app.config.js');
if (fs.existsSync(appConfigPath)) {
  const appConfig = fs.readFileSync(appConfigPath, 'utf8');
  if (/GOOGLE_MAPS|googleMapsApiKey|androidGoogleMapsApiKey|googleMaps\s*:/.test(appConfig)) problems.push('تنظیمات Google Maps هنوز در app.config.js باقی مانده است');
}
const discoverPath = path.join(mobile, 'app/(app)/(tabs)/discover.tsx');
if (fs.existsSync(discoverPath)) {
  const discover = fs.readFileSync(discoverPath, 'utf8');
  if (!discover.includes('OpenStreetMap')) problems.push('صفحه مراکز باید از OpenStreetMap component استفاده کند');
  if (discover.includes('react-native-maps')) problems.push('صفحه مراکز هنوز react-native-maps را import می‌کند');
}

for (const legacy of ['app-example', 'app/(auth)/index.tsx', 'app/index.tsx', 'app/(app)/maternal-health.tsx']) {
  if (fs.existsSync(path.join(mobile, legacy))) problems.push(`مسیر legacy باقی مانده: ${legacy}`);
}

const generatedFont = path.join(mobile, 'src/theme/generated-font.ts');
if (fs.existsSync(generatedFont) && !fs.readFileSync(generatedFont, 'utf8').includes('HAS_YEKANBAKH_FANUM = true')) {
  warnings.push('generated-font.ts هنوز false است؛ ابتدا pnpm mobile:prepare-font را اجرا کنید');
}

if (warnings.length) {
  console.warn('[mobile-apk-readiness] warnings');
  for (const warning of warnings) console.warn(` - ${warning}`);
}
if (problems.length) {
  console.error('[mobile-apk-readiness] failed');
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}
console.log(`[mobile-apk-readiness] ready for EAS preview APK — version ${expectedVersion}, android versionCode ${app.android.versionCode}`);
