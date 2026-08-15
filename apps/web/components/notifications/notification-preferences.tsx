"use client";

import { useMemo, useState } from "react";
import { BellRing, Clock3, Mail, MessageSquareText, Smartphone } from "lucide-react";
import type { NotificationPreference, UpdateNotificationPreferencesRequest } from "@ninibu/types";
import {
  formatJalaliDateTime,
  formatPersianClockInput,
  isBackendDateTimePresent,
  isValidBackendClock,
  normalizeBackendClock
} from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { notificationCategoryLabel } from "./notification-data";

type EditablePreference = NotificationPreference & {
  quiet_hours_start_display: string;
  quiet_hours_end_display: string;
};

export function NotificationPreferences({
  items,
  saving,
  error,
  onSave
}: {
  items: NotificationPreference[];
  saving: boolean;
  error?: string;
  onSave: (payload: UpdateNotificationPreferencesRequest) => void;
}) {
  const [draft, setDraft] = useState<EditablePreference[]>(() =>
    items.map((item) => ({
      ...item,
      quiet_hours_start_display: formatPersianClockInput(item.quiet_hours_start),
      quiet_hours_end_display: formatPersianClockInput(item.quiet_hours_end)
    }))
  );

  const invalidQuietHours = useMemo(
    () => draft.some((item) => !isValidBackendClock(item.quiet_hours_start_display) || !isValidBackendClock(item.quiet_hours_end_display)),
    [draft]
  );

  function patch(index: number, next: Partial<EditablePreference>) {
    setDraft((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...next } : item));
  }

  function submit() {
    if (invalidQuietHours) return;
    onSave({
      items: draft.map((item) => ({
        category: item.category,
        in_app_enabled: item.in_app_enabled,
        quiet_hours_start: normalizeBackendClock(item.quiet_hours_start_display) || undefined,
        quiet_hours_end: normalizeBackendClock(item.quiet_hours_end_display) || undefined,
        timezone: item.timezone || "Asia/Tehran"
      }))
    });
  }

  return <div className="notification-preferences">
    <div className="notification-pref-intro">
      <BellRing size={20} />
      <div>
        <strong>تنظیم اعلان‌ها</strong>
        <p>برای هر دسته مشخص کنید اعلان داخل نینیبو نمایش داده شود یا نه. کانال‌های خارجی در این نسخه فعال نیستند.</p>
      </div>
    </div>

    <div className="notification-channel-preview" aria-label="کانال‌های اعلان">
      <span className="is-live"><BellRing size={15} /> داخل برنامه <b>فعال</b></span>
      <span><Smartphone size={15} /> پوش <b>به‌زودی</b></span>
      <span><MessageSquareText size={15} /> پیامک <b>به‌زودی</b></span>
      <span><Mail size={15} /> ایمیل <b>به‌زودی</b></span>
    </div>

    <div className="notification-pref-list">
      {draft.map((item, index) => {
        const optional = item.category === "advertising" || item.category === "commerce";
        return <section className="notification-pref-card" key={item.category}>
          <header>
            <div>
              <strong>{notificationCategoryLabel(item.category)}</strong>
              {optional && <span className="notification-optin-badge">اختیاری</span>}
            </div>
            <label className="notification-switch">
              <input
                type="checkbox"
                checked={item.in_app_enabled}
                onChange={(event) => patch(index, { in_app_enabled: event.target.checked })}
              />
              <span aria-hidden="true" />
              <em>{item.in_app_enabled ? "روشن" : "خاموش"}</em>
            </label>
          </header>

          <div className="quiet-hours-block">
            <div className="quiet-hours-title"><Clock3 size={15} /> ساعات سکوت</div>
            <div className="quiet-hours-fields">
              <label>
                <span>از</span>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={item.quiet_hours_start_display}
                  placeholder="۲۲:۰۰"
                  onChange={(event) => patch(index, { quiet_hours_start_display: event.target.value })}
                  aria-invalid={!isValidBackendClock(item.quiet_hours_start_display)}
                />
              </label>
              <label>
                <span>تا</span>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={item.quiet_hours_end_display}
                  placeholder="۰۷:۰۰"
                  onChange={(event) => patch(index, { quiet_hours_end_display: event.target.value })}
                  aria-invalid={!isValidBackendClock(item.quiet_hours_end_display)}
                />
              </label>
            </div>
            {(!isValidBackendClock(item.quiet_hours_start_display) || !isValidBackendClock(item.quiet_hours_end_display)) &&
              <small className="notification-pref-error">زمان را به شکل ۲۲:۰۰ وارد کنید.</small>}
          </div>

          <footer>
            <span>منطقه زمانی: {item.timezone || "Asia/Tehran"}</span>
            <span>
              {isBackendDateTimePresent(item.updated_at)
                ? `آخرین تغییر: ${formatJalaliDateTime(item.updated_at)}`
                : "هنوز تغییری ثبت نشده"}
            </span>
          </footer>
        </section>;
      })}
    </div>

    {error && <p className="notification-pref-error">{error}</p>}
    <div className="notification-pref-save">
      <Button disabled={saving || invalidQuietHours} onClick={submit}>
        {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
      </Button>
    </div>
  </div>;
}
