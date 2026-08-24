"use client";

import { useEffect, useState } from "react";
import type { City, Country, Profile, Province } from "@ninibu/types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { JalaliDateInput } from "@/components/ui/jalali-date-input";
import { Select } from "@/components/ui/select";
import { resolveApiErrorMessage } from "@/lib/client-api";

type Step = "parent" | "residence" | "child";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers || {}) } });
  } catch {
    throw new Error("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
  }
  let json: { success?: boolean; data?: T; error?: { code?: string; message?: string } };
  try {
    json = await response.json() as { success?: boolean; data?: T; error?: { code?: string; message?: string } };
  } catch {
    throw new Error("پاسخ سرور قابل خواندن نیست. لطفاً دوباره تلاش کنید.");
  }
  if (!json.success) throw new Error(resolveApiErrorMessage(json.error, response.status));
  return json.data as T;
}

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>("parent");
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [child, setChild] = useState({ first_name: "", last_name: "", gender: "", birth_date: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Profile>("/api/ninibu/profile").then((item) => {
      setProfile(item);
      if (item.onboarding_step === "residence") setStep("residence");
      if (item.onboarding_step === "child") setStep("child");
    }).catch(() => {});
    api<Country[]>("/api/ninibu/geo/countries").then(setCountries).catch(() => {});
  }, []);

  async function saveParent() {
    setLoading(true); setError("");
    try {
      await api("/api/ninibu/profile", { method: "PATCH", body: JSON.stringify({ first_name: profile.first_name, last_name: profile.last_name, birth_date: profile.birth_date || null, gender: profile.gender || null, onboarding_step: "residence" }) });
      setStep("residence");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "خطا در ذخیره اطلاعات"); }
    finally { setLoading(false); }
  }

  async function countryChanged(id: number) {
    setProfile((current) => ({ ...current, country: { id } as Country, province: undefined, city: undefined }));
    setCities([]);
    if (id) setProvinces(await api<Province[]>(`/api/ninibu/geo/provinces?country_id=${id}`));
  }

  async function provinceChanged(id: number) {
    setProfile((current) => ({ ...current, province: { id } as Province, city: undefined }));
    if (id) setCities(await api<City[]>(`/api/ninibu/geo/cities?province_id=${id}`));
  }

  async function saveResidence() {
    setLoading(true); setError("");
    try {
      await api("/api/ninibu/profile", { method: "PATCH", body: JSON.stringify({ country_id: profile.country?.id, province_id: profile.province?.id, city_id: profile.city?.id, residence_address: profile.residence_address || "", onboarding_step: "child" }) });
      setStep("child");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "خطا در ذخیره اطلاعات"); }
    finally { setLoading(false); }
  }

  async function saveChild() {
    setLoading(true); setError("");
    try {
      await api("/api/ninibu/children", { method: "POST", body: JSON.stringify({ ...child, blood_type: null, birth_weight_grams: null, birth_height_cm: null, birth_head_circumference_cm: null, notes: "" }) });
      await api("/api/ninibu/profile/onboarding/complete", { method: "POST", body: JSON.stringify({ skip_preferences: true }) });
      onComplete();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ثبت فرزند انجام نشد"); }
    finally { setLoading(false); }
  }

  const progress = step === "parent" ? 1 : step === "residence" ? 2 : 3;
  return <section className="onboarding-shell">
    <div className="onboarding-head"><span>راه‌اندازی نینیبو</span><strong>{progress} از 3</strong></div>
    <div className="progress"><i style={{ width: `${progress / 3 * 100}%` }} /></div>

    {step === "parent" && <div className="panel">
      <h1>اول کمی با شما آشنا شویم</h1><p>این اطلاعات برای شخصی‌سازی تجربه شماست.</p>
      <div className="grid-two"><Field label="نام"><Input value={profile.first_name ?? ""} onChange={(event) => setProfile((current) => ({ ...current, first_name: event.target.value }))} /></Field><Field label="نام خانوادگی"><Input value={profile.last_name ?? ""} onChange={(event) => setProfile((current) => ({ ...current, last_name: event.target.value }))} /></Field></div>
      <Field label="تاریخ تولد جلالی (اختیاری)"><JalaliDateInput value={profile.birth_date?.slice(0, 10) ?? ""} onChange={(birth_date) => setProfile((current) => ({ ...current, birth_date }))} /></Field>
      <Field label="جنسیت (اختیاری)"><Select value={profile.gender ?? ""} onChange={(event) => setProfile((current) => ({ ...current, gender: event.target.value }))}><option value="">انتخاب کنید</option><option value="female">زن</option><option value="male">مرد</option><option value="other">سایر / ترجیح می‌دهم نگویم</option></Select></Field>
      <Button onClick={saveParent} disabled={loading}>ادامه</Button>
    </div>}

    {step === "residence" && <div className="panel">
      <h1>کجا زندگی می‌کنید؟</h1><p>برای پیشنهاد خدمات و مراکز مناسب شهر شما.</p>
      <Field label="کشور"><Select value={profile.country?.id ?? ""} onChange={(event) => countryChanged(Number(event.target.value))}><option value="">انتخاب کشور</option>{countries.map((country) => <option key={country.id} value={country.id}>{country.local_name || country.name}</option>)}</Select></Field>
      <Field label="استان"><Select value={profile.province?.id ?? ""} onChange={(event) => provinceChanged(Number(event.target.value))}><option value="">انتخاب استان</option>{provinces.map((province) => <option key={province.id} value={province.id}>{province.local_name || province.name}</option>)}</Select></Field>
      <Field label="شهر"><Select value={profile.city?.id ?? ""} onChange={(event) => setProfile((current) => ({ ...current, city: { id: Number(event.target.value) } as City }))}><option value="">انتخاب شهر</option>{cities.map((city) => <option key={`${city.province_id}-${city.id}`} value={city.id}>{city.local_name || city.name}</option>)}</Select></Field>
      <Field label="آدرس (اختیاری)"><Input value={profile.residence_address ?? ""} onChange={(event) => setProfile((current) => ({ ...current, residence_address: event.target.value }))} /></Field>
      <Button onClick={saveResidence} disabled={loading}>ادامه</Button>
    </div>}

    {step === "child" && <div className="panel">
      <h1>فرزندتان را اضافه کنید</h1><p>اطلاعات پزشکی را بعداً از بخش سلامت تکمیل می‌کنید.</p>
      <div className="grid-two"><Field label="نام"><Input value={child.first_name} onChange={(event) => setChild((current) => ({ ...current, first_name: event.target.value }))} /></Field><Field label="نام خانوادگی"><Input value={child.last_name} onChange={(event) => setChild((current) => ({ ...current, last_name: event.target.value }))} /></Field></div>
      <Field label="تاریخ تولد جلالی"><JalaliDateInput required value={child.birth_date} onChange={(birth_date) => setChild((current) => ({ ...current, birth_date }))} /></Field>
      <Field label="جنسیت"><Select value={child.gender} onChange={(event) => setChild((current) => ({ ...current, gender: event.target.value }))}><option value="">انتخاب کنید</option><option value="female">دختر</option><option value="male">پسر</option><option value="other">سایر</option></Select></Field>
      <Button onClick={saveChild} disabled={loading}>ورود به نینیبو</Button>
    </div>}
    {error && <p className="error panel-error">{error}</p>}
  </section>;
}
