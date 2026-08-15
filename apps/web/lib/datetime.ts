export type JalaliDate = { year: number; month: number; day: number };
export type GregorianDate = { year: number; month: number; day: number };

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_LOCALE = "fa-IR-u-ca-persian-nu-persian";
const ZERO_DATE = /^0{4}-0{2}-0{2}|^0001-01-01/;

export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)));
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

function div(a: number, b: number): number { return Math.floor(a / b); }

export function gregorianToJalali(year: number, month: number, day: number): JalaliDate {
  const monthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const adjustedYear = month > 2 ? year + 1 : year;
  let days = 355666 + (365 * year) + div(adjustedYear + 3, 4) - div(adjustedYear + 99, 100) + div(adjustedYear + 399, 400) + day + monthDays[month - 1]!;
  let jalaliYear = -1595 + (33 * div(days, 12053));
  days %= 12053;
  jalaliYear += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jalaliYear += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  if (days < 186) {
    return { year: jalaliYear, month: 1 + div(days, 31), day: 1 + (days % 31) };
  }
  return { year: jalaliYear, month: 7 + div(days - 186, 30), day: 1 + ((days - 186) % 30) };
}

function isGregorianLeap(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function jalaliToGregorian(year: number, month: number, day: number): GregorianDate {
  let jalaliYear = year + 1595;
  let days = -355668 + (365 * jalaliYear) + (div(jalaliYear, 33) * 8) + div((jalaliYear % 33) + 3, 4) + day;
  days += month < 7 ? (month - 1) * 31 : ((month - 7) * 30) + 186;

  let gregorianYear = 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gregorianYear += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days += 1;
  }
  gregorianYear += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gregorianYear += div(days - 1, 365);
    days = (days - 1) % 365;
  }

  let gregorianDay = days + 1;
  const monthLengths = [0, 31, isGregorianLeap(gregorianYear) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gregorianMonth = 1;
  while (gregorianMonth <= 12 && gregorianDay > monthLengths[gregorianMonth]!) {
    gregorianDay -= monthLengths[gregorianMonth]!;
    gregorianMonth += 1;
  }
  return { year: gregorianYear, month: gregorianMonth, day: gregorianDay };
}

export function isValidJalaliDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 31) return false;
  if (month >= 7 && month <= 11 && day > 30) return false;
  if (month === 12 && day > 30) return false;
  const converted = jalaliToGregorian(year, month, day);
  const roundTrip = gregorianToJalali(converted.year, converted.month, converted.day);
  return roundTrip.year === year && roundTrip.month === month && roundTrip.day === day;
}

function pad(value: number): string { return String(value).padStart(2, "0"); }

export function jalaliInputToGregorian(value: string): string | null {
  const normalized = toLatinDigits(value).trim().replace(/[.\-]/g, "/").replace(/\s+/g, "");
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(normalized);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidJalaliDate(year, month, day)) return null;
  const converted = jalaliToGregorian(year, month, day);
  return `${converted.year}-${pad(converted.month)}-${pad(converted.day)}`;
}

export function gregorianToJalaliInput(value?: string | null): string {
  const parsed = parseDateOnly(value);
  if (!parsed) return "";
  const converted = gregorianToJalali(parsed.year, parsed.month, parsed.day);
  return toPersianDigits(`${converted.year}/${pad(converted.month)}/${pad(converted.day)}`);
}

export function todayGregorianDate(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayJalaliInput(date = new Date()): string {
  return gregorianToJalaliInput(todayGregorianDate(date));
}

function parseDateOnly(value?: string | null): GregorianDate | null {
  if (!value || ZERO_DATE.test(value)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { year, month, day };
}

function dateOnlyObject(value?: string | null): Date | null {
  const parsed = parseDateOnly(value);
  return parsed ? new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0, 0) : null;
}

function instantObject(value?: string | null): Date | null {
  if (!value || ZERO_DATE.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatJalaliDate(value?: string | null): string {
  const date = value?.length === 10 ? dateOnlyObject(value) : instantObject(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export function formatJalaliShortDate(value?: string | null): string {
  const date = value?.length === 10 ? dateOnlyObject(value) : instantObject(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function formatJalaliDay(value?: string | null): string {
  const date = value?.length === 10 ? dateOnlyObject(value) : instantObject(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export function formatJalaliDateTime(value?: string | null): string {
  const date = instantObject(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatPersianTime(value?: string | null): string {
  const date = instantObject(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(PERSIAN_LOCALE, { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatRelativeFa(value?: string | null): string {
  const date = instantObject(value);
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff) || diff < 0) return formatJalaliShortDate(value);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${toPersianDigits(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${toPersianDigits(days)} روز پیش`;
  return formatJalaliShortDate(value);
}

export function isBackendDateTimePresent(value?: string | null): value is string {
  if (!value || value.startsWith("0001-01-01")) return false;
  return Number.isFinite(new Date(value).getTime());
}

export function normalizeBackendClock(value: string): string {
  return toLatinDigits(value).replace(/\s/g, "");
}

export function formatPersianClockInput(value?: string | null): string {
  return value ? toPersianDigits(value) : "";
}

export function isValidBackendClock(value: string): boolean {
  if (!value) return true;
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalizeBackendClock(value));
}
