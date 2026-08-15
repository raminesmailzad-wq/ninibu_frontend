"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  gregorianToJalali,
  gregorianToJalaliInput,
  isValidJalaliDate,
  jalaliInputToGregorian,
  jalaliToGregorian,
  toPersianDigits,
  todayGregorianDate,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ModalPortal } from "@/components/ui/modal-portal";

type Props = {
  value?: string;
  onChange: (gregorianValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
};

type MonthView = { year: number; month: number };

const MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];
const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function normalizeVisual(value: string): string {
  return toPersianDigits(value.replace(/[.\-]/g, "/").replace(/[^0-9۰-۹٠-٩/]/g, "").slice(0, 10));
}

function parseGregorian(value?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "");
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function viewFromGregorian(value?: string | null): MonthView {
  const parsed = parseGregorian(value) ?? parseGregorian(todayGregorianDate())!;
  const jalali = gregorianToJalali(parsed.year, parsed.month, parsed.day);
  return { year: jalali.year, month: jalali.month };
}

function jalaliFromGregorian(value?: string | null) {
  const parsed = parseGregorian(value);
  return parsed ? gregorianToJalali(parsed.year, parsed.month, parsed.day) : null;
}

function jalaliDateToGregorian(year: number, month: number, day: number): string | null {
  if (!isValidJalaliDate(year, month, day)) return null;
  const converted = jalaliToGregorian(year, month, day);
  return `${converted.year}-${pad(converted.month)}-${pad(converted.day)}`;
}

function monthLength(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isValidJalaliDate(year, 12, 30) ? 30 : 29;
}

function firstWeekday(year: number, month: number): number {
  const gregorian = jalaliToGregorian(year, month, 1);
  // JS: Sunday=0. Persian calendar grid: Saturday=0.
  return (new Date(gregorian.year, gregorian.month - 1, gregorian.day, 12).getDay() + 1) % 7;
}

function moveMonth(view: MonthView, delta: number): MonthView {
  const zeroBased = view.year * 12 + (view.month - 1) + delta;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12 + 12) % 12 + 1 };
}

function jalaliYearFromGregorian(value?: string | null): number | null {
  return jalaliFromGregorian(value)?.year ?? null;
}

function buildYearOptions(viewYear: number, todayYear: number, min?: string, max?: string): number[] {
  const minYear = jalaliYearFromGregorian(min);
  const maxYear = jalaliYearFromGregorian(max);
  // Wide enough for parent/child birth dates while still allowing future scheduling.
  const start = minYear ?? Math.min(viewYear, todayYear) - 125;
  const end = maxYear ?? Math.max(viewYear, todayYear) + 20;
  return Array.from({ length: Math.max(1, end - start + 1) }, (_, index) => start + index);
}

export function JalaliDateInput({ value = "", onChange, required, disabled, className, min, max, ...props }: Props) {
  const [visual, setVisual] = useState(() => gregorianToJalaliInput(value));
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<MonthView>(() => viewFromGregorian(value));

  const selected = useMemo(() => jalaliFromGregorian(value), [value]);
  const todayGregorian = todayGregorianDate();
  const todayJalali = useMemo(() => jalaliFromGregorian(todayGregorian), [todayGregorian]);

  useEffect(() => {
    const next = gregorianToJalaliInput(value);
    if (next && next !== visual) setVisual(next);
    if (!value && visual === "") setInvalid(false);
    // Typed partial values must not be overwritten while the parent still holds the last valid Gregorian value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function validate(next: string): { gregorian: string | null; valid: boolean } {
    const gregorian = jalaliInputToGregorian(next);
    const valid = Boolean(gregorian) && (!min || gregorian! >= min) && (!max || gregorian! <= max);
    return { gregorian, valid };
  }

  function update(nextRaw: string) {
    const next = normalizeVisual(nextRaw);
    setVisual(next);
    if (!next) {
      setInvalid(Boolean(required));
      onChange("");
      return;
    }
    const { gregorian, valid } = validate(next);
    setInvalid(next.length >= 10 && !valid);
    if (gregorian && valid) {
      onChange(gregorian);
      setView(viewFromGregorian(gregorian));
    }
  }

  function openCalendar() {
    if (disabled) return;
    setView(viewFromGregorian(value));
    setOpen(true);
  }

  function toggleCalendar() {
    if (disabled) return;
    if (!open) {
      openCalendar();
      return;
    }
    setOpen(false);
  }

  function selectDay(day: number) {
    const gregorian = jalaliDateToGregorian(view.year, view.month, day);
    if (!gregorian || (min && gregorian < min) || (max && gregorian > max)) return;
    onChange(gregorian);
    setVisual(gregorianToJalaliInput(gregorian));
    setInvalid(false);
    setOpen(false);
  }

  const days = Array.from({ length: monthLength(view.year, view.month) }, (_, index) => index + 1);
  const offset = firstWeekday(view.year, view.month);
  const yearOptions = useMemo(
    () => buildYearOptions(view.year, todayJalali?.year ?? view.year, min, max),
    [view.year, todayJalali?.year, min, max],
  );

  function monthHasSelectableDay(year: number, month: number): boolean {
    const first = jalaliDateToGregorian(year, month, 1);
    const last = jalaliDateToGregorian(year, month, monthLength(year, month));
    if (!first || !last) return false;
    if (min && last < min) return false;
    if (max && first > max) return false;
    return true;
  }

  const calendarDialog = open ? <ModalPortal
    ariaLabel="انتخاب تاریخ جلالی"
    onClose={() => setOpen(false)}
    layer="nested"
    backdropClassName="jalali-calendar-modal-backdrop"
    contentClassName="jalali-calendar-modal"
  >
    <div className="jalali-calendar-modal-topbar">
      <strong>انتخاب تاریخ</strong>
      <button type="button" onClick={() => setOpen(false)} aria-label="بستن انتخاب‌گر تاریخ">
        <X size={18} />
      </button>
    </div>
    <div className="jalali-calendar">
      <div className="jalali-calendar-head">
        <button type="button" onClick={() => setView((current) => moveMonth(current, -1))} aria-label="ماه قبل"><ChevronRight size={18} /></button>
        <div className="jalali-calendar-selectors">
          <label>
            <select
              value={view.month}
              onChange={(event) => setView((current) => ({ ...current, month: Number(event.target.value) }))}
              aria-label="انتخاب ماه جلالی"
            >
              {MONTHS.map((monthName, index) => {
                const month = index + 1;
                return <option key={monthName} value={month} disabled={!monthHasSelectableDay(view.year, month)}>{monthName}</option>;
              })}
            </select>
          </label>
          <label>
            <select
              value={view.year}
              onChange={(event) => setView((current) => ({ ...current, year: Number(event.target.value) }))}
              aria-label="انتخاب سال جلالی"
            >
              {yearOptions.map((year) => <option key={year} value={year}>{toPersianDigits(year)}</option>)}
            </select>
          </label>
        </div>
        <button type="button" onClick={() => setView((current) => moveMonth(current, 1))} aria-label="ماه بعد"><ChevronLeft size={18} /></button>
      </div>
      <div className="jalali-calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="jalali-calendar-grid">
        {Array.from({ length: offset }, (_, index) => <span className="jalali-calendar-empty" key={`empty-${index}`} />)}
        {days.map((day) => {
          const gregorian = jalaliDateToGregorian(view.year, view.month, day)!;
          const isDisabled = Boolean((min && gregorian < min) || (max && gregorian > max));
          const isSelected = selected?.year === view.year && selected.month === view.month && selected.day === day;
          const isToday = todayJalali?.year === view.year && todayJalali.month === view.month && todayJalali.day === day;
          return <button
            key={day}
            type="button"
            className={cn("jalali-calendar-day", isSelected && "is-selected", isToday && "is-today")}
            onClick={() => selectDay(day)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            aria-current={isToday ? "date" : undefined}
            aria-label={`${toPersianDigits(day)} ${MONTHS[view.month - 1]} ${toPersianDigits(view.year)}`}
          >{toPersianDigits(day)}</button>;
        })}
      </div>
      <div className="jalali-calendar-foot">
        <button type="button" onClick={() => {
          const today = todayGregorianDate();
          if ((!min || today >= min) && (!max || today <= max)) {
            onChange(today);
            setVisual(gregorianToJalaliInput(today));
            setView(viewFromGregorian(today));
            setInvalid(false);
            setOpen(false);
          }
        }}>امروز</button>
        {!required && <button type="button" onClick={() => { onChange(""); setVisual(""); setInvalid(false); setOpen(false); }}>پاک کردن</button>}
      </div>
    </div>
  </ModalPortal> : null;

  return <div className={cn("jalali-date-field", invalid && "is-invalid", open && "is-open")}> 
    <div className="jalali-date-control">
      <Input
        {...props}
        type="text"
        dir="ltr"
        inputMode="numeric"
        autoComplete="off"
        placeholder="۱۴۰۵/۰۵/۲۱"
        value={visual}
        required={required}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn("jalali-date-input", className)}
        onChange={(event) => update(event.target.value)}
        onFocus={() => { if (!disabled) openCalendar(); }}
        onBlur={() => setInvalid(Boolean(required && !visual) || (Boolean(visual) && !validate(visual).valid))}
      />
      <button
        type="button"
        className="jalali-date-trigger"
        onClick={toggleCalendar}
        disabled={disabled}
        aria-label="باز کردن تقویم جلالی"
        aria-expanded={open}
      >
        <CalendarDays size={19} />
      </button>
    </div>

    {calendarDialog}

    {invalid && <small className="jalali-date-hint">تاریخ جلالی معتبر انتخاب یا وارد کنید؛ مثال: ۱۴۰۵/۰۵/۲۱</small>}
  </div>;
}
