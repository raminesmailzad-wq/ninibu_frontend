import { formatJalaliDate } from "@/lib/datetime";

export function formatNumber(value?: number | null, maximumFractionDigits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits }).format(value);
}

export function formatDate(value?: string | null): string {
  return formatJalaliDate(value);
}

export function childAge(birthDate: string): string {
  const birth = new Date(`${birthDate}T12:00:00`);
  const now = new Date();
  if (Number.isNaN(birth.getTime()) || birth > now) return "";
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 1) return "کمتر از یک ماه";
  if (months < 24) return `${new Intl.NumberFormat("fa-IR").format(months)} ماهه`;
  const years = Math.floor(months / 12);
  const remain = months % 12;
  return remain ? `${new Intl.NumberFormat("fa-IR").format(years)} سال و ${new Intl.NumberFormat("fa-IR").format(remain)} ماه` : `${new Intl.NumberFormat("fa-IR").format(years)} ساله`;
}

export function visitTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    routine_checkup: "چکاپ دوره‌ای", illness: "بیماری", emergency: "اورژانسی", follow_up: "پیگیری",
    vaccination: "واکسیناسیون", consultation: "مشاوره", hospitalization: "بستری", other: "سایر"
  };
  return labels[value] ?? value;
}

export function timelineTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    growth_measurement: "رشد", vaccination: "واکسن", allergy: "حساسیت", medical_visit: "ویزیت",
    diagnosis: "تشخیص", treatment: "درمان", prescription: "نسخه", child_medication: "دارو"
  };
  return labels[value] ?? value;
}
