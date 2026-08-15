"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { AdvertisingPreferences } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const DEFAULTS: AdvertisingPreferences = { personalized_ads_enabled: false, location_based_ads_enabled: false, interest_based_ads_enabled: false };

export function AdvertisingPreferencesPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["advertising", "preferences"], queryFn: () => clientApi<AdvertisingPreferences>("/api/ninibu/advertising/preferences") });
  const [draft, setDraft] = useState<AdvertisingPreferences>(DEFAULTS);
  useEffect(() => { if (query.data) setDraft({ ...DEFAULTS, ...query.data }); }, [query.data]);
  const save = useMutation({
    mutationFn: () => clientApi<AdvertisingPreferences>("/api/ninibu/advertising/preferences", { method: "PATCH", body: JSON.stringify(draft) }),
    onSuccess: (data) => { queryClient.setQueryData(["advertising", "preferences"], data); trackEvent("advertising_preferences_saved", { personalized: data.personalized_ads_enabled, location: data.location_based_ads_enabled, interest: data.interest_based_ads_enabled }); }
  });

  return <section className="surface-card ad-preferences-card">
    <header><span className="profile-card-icon"><ShieldCheck size={18} /></span><div><strong>تنظیمات تبلیغات</strong><p>هدف‌گیری مکانی یا بر اساس علاقه فقط با رضایت شما فعال می‌شود؛ اطلاعات سلامت کودک برای تبلیغات استفاده نمی‌شود.</p></div></header>
    {query.isError ? <p className="ad-pref-error">تنظیمات تبلیغات دریافت نشد.</p> : <div className="ad-pref-options">
      <PreferenceToggle icon={Sparkles} label="تبلیغات شخصی‌سازی‌شده" hint="اجازه استفاده از ترجیحات مجاز عمومی" checked={draft.personalized_ads_enabled} onChange={(checked) => setDraft((current) => ({ ...current, personalized_ads_enabled: checked, ...(checked ? {} : { location_based_ads_enabled: false, interest_based_ads_enabled: false }) }))} />
      <PreferenceToggle icon={MapPin} label="هدف‌گیری بر اساس شهر" hint="فقط شهر ثبت‌شده؛ بدون استفاده از موقعیت دقیق یا داده سلامت" checked={draft.location_based_ads_enabled} onChange={(checked) => setDraft((current) => ({ ...current, personalized_ads_enabled: checked ? true : current.personalized_ads_enabled, location_based_ads_enabled: checked }))} />
      <PreferenceToggle icon={Sparkles} label="هدف‌گیری بر اساس علایق" hint="فقط علایق عمومی انتخاب‌شده شما" checked={draft.interest_based_ads_enabled} onChange={(checked) => setDraft((current) => ({ ...current, personalized_ads_enabled: checked ? true : current.personalized_ads_enabled, interest_based_ads_enabled: checked }))} />
    </div>}
    <footer><small>هر سه گزینه به‌صورت پیش‌فرض خاموش هستند.</small><Button disabled={query.isLoading || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "در حال ذخیره…" : "ذخیره تنظیمات"}</Button></footer>
  </section>;
}

function PreferenceToggle({ icon: Icon, label, hint, checked, onChange }: { icon: typeof Sparkles; label: string; hint: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="ad-pref-row"><span><Icon size={17} /></span><div><strong>{label}</strong><small>{hint}</small></div><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}
