"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Baby,
  CalendarDays,
  Check,
  Edit3,
  Home,
  LogOut,
  MapPin,
  Plus,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import type { Child, City, Country, Profile, Province } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { childAge } from "@/lib/format";
import { formatJalaliDate, todayGregorianDate } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { JalaliDateInput } from "@/components/ui/jalali-date-input";
import { ModalPortal } from "@/components/ui/modal-portal";
import { Select } from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";
import { AdvertisingPreferencesPanel } from "@/components/advertising/advertising-preferences";

const GENDER_LABELS: Record<string, string> = {
  female: "زن / دختر",
  male: "مرد / پسر",
  other: "سایر",
};

type ProfilePanelProps = {
  profile?: Profile;
  children: Child[];
  activeChildId?: number;
  onSelectChild: (childId: number) => void;
  onLogout: () => void;
};

export function ProfilePanel({ profile, children, activeChildId, onSelectChild, onLogout }: ProfilePanelProps) {
  const [modal, setModal] = useState<"parent" | "residence" | "child" | null>(null);

  const ownerChildren = useMemo(() => children.filter((child) => child.access?.is_owner !== false), [children]);

  return <section className="profile-page profile-v07">
    <div className="profile-hero-card profile-hero-v07">
      <span className="profile-avatar">{(profile?.first_name || "ن").slice(0, 1)}</span>
      <div className="profile-hero-copy">
        <span className="eyebrow">حساب نینیبو</span>
        <h2>{profile?.first_name || "کاربر"} {profile?.last_name || ""}</h2>
        <p>{profile?.mobile || ""}</p>
      </div>
      <Button variant="outline" onClick={() => { trackEvent("profile_form_opened", { form: "parent_profile" }); setModal("parent"); }}><Edit3 size={16} /> ویرایش مشخصات</Button>
    </div>

    <div className="profile-overview-grid">
      <article className="surface-card profile-overview-card">
        <span className="profile-card-icon"><CalendarDays size={18} /></span>
        <div><small>تاریخ تولد</small><strong>{formatJalaliDate(profile?.birth_date)}</strong><p>{profile?.gender ? GENDER_LABELS[profile.gender] ?? profile.gender : "جنسیت ثبت نشده"}</p></div>
      </article>
      <article className="surface-card profile-overview-card">
        <span className="profile-card-icon"><MapPin size={18} /></span>
        <div><small>محل سکونت</small><strong>{profile?.city?.local_name || profile?.city?.name || "ثبت نشده"}</strong><p>{profile?.province?.local_name || profile?.province?.name || "برای پیشنهادهای محلی تکمیل کنید"}</p></div>
        <button className="profile-card-action" type="button" onClick={() => { trackEvent("profile_form_opened", { form: "residence" }); setModal("residence"); }} aria-label="ویرایش محل سکونت"><Edit3 size={15} /></button>
      </article>
      <article className="surface-card profile-overview-card">
        <span className="profile-card-icon"><ShieldCheck size={18} /></span>
        <div><small>وضعیت حساب</small><strong>{profile?.onboarding_completed ? "راه‌اندازی کامل" : "نیاز به تکمیل"}</strong><p>{new Intl.NumberFormat("fa-IR").format(children.length)} فرزند متصل</p></div>
      </article>
    </div>

    <section className="profile-family-section surface-card">
      <header className="profile-section-head">
        <div><span className="eyebrow">خانواده</span><h3>فرزندان شما</h3><p>برای هر فرزند پرونده و داشبورد مستقل دارید.</p></div>
        <Button onClick={() => { trackEvent("profile_form_opened", { form: "add_child" }); setModal("child"); }}><Plus size={17} /> افزودن فرزند</Button>
      </header>

      <div className="profile-child-grid">
        {ownerChildren.map((child) => {
          const isActive = child.id === activeChildId;
          return <article key={child.id} className={`profile-child-card ${isActive ? "is-active" : ""}`}>
            <div className="profile-child-head">
              <span className="profile-child-avatar"><Baby size={20} /></span>
              <div><strong>{child.first_name} {child.last_name}</strong><small>{childAge(child.birth_date)}</small></div>
              {isActive && <span className="profile-active-badge"><Check size={12} /> فعال</span>}
            </div>
            <dl>
              <div><dt>تولد</dt><dd>{formatJalaliDate(child.birth_date)}</dd></div>
              <div><dt>جنسیت</dt><dd>{GENDER_LABELS[child.gender] ?? child.gender ?? "—"}</dd></div>
            </dl>
            {!isActive && <Button variant="outline" onClick={() => { trackEvent("profile_active_child_selected", { source: "family_card" }); onSelectChild(child.id); }}>انتخاب این فرزند</Button>}
          </article>;
        })}
        {ownerChildren.length === 0 && <div className="profile-family-empty"><Baby size={25} /><strong>هنوز فرزندی ثبت نشده</strong><p>اولین فرزند را اضافه کنید تا داشبورد سلامت فعال شود.</p></div>}
      </div>
    </section>

    <AdvertisingPreferencesPanel />

    <section className="profile-account-actions surface-card">
      <div><span className="profile-card-icon"><UserRound size={18} /></span><div><strong>تنظیمات حساب</strong><p>شماره موبایل فعلی: {profile?.mobile || "—"}</p></div></div>
      <Button variant="outline" onClick={onLogout}><LogOut size={17} /> خروج از حساب</Button>
    </section>

    {modal === "parent" && profile && <ParentProfileModal profile={profile} onClose={() => setModal(null)} />}
    {modal === "residence" && profile && <ResidenceModal profile={profile} onClose={() => setModal(null)} />}
    {modal === "child" && <AddChildModal onClose={() => setModal(null)} />}
  </section>;
}

function ProfileModal({ title, icon, onClose, children }: { title: string; icon: ReactNode; onClose: () => void; children: ReactNode }) {
  return <ModalPortal ariaLabel={title} onClose={onClose} backdropClassName="profile-modal-backdrop" contentClassName="profile-modal">
    <div className="profile-modal-inner">
      <button type="button" className="profile-modal-close" onClick={onClose} aria-label="بستن"><X size={18} /></button>
      <header className="profile-modal-heading"><span>{icon}</span><div><h2>{title}</h2><p>تغییرات پس از ذخیره در حساب شما اعمال می‌شود.</p></div></header>
      {children}
    </div>
  </ModalPortal>;
}

function ParentProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    birth_date: profile.birth_date?.slice(0, 10) || "",
    gender: profile.gender || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setBusy(true); setError("");
    try {
      await clientApi<Profile>("/api/ninibu/profile", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          birth_date: form.birth_date || null,
          gender: form.gender || null,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      trackEvent("profile_form_saved", { form: "parent_profile", result: "success" });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ذخیره اطلاعات انجام نشد");
    } finally { setBusy(false); }
  }

  return <ProfileModal title="ویرایش مشخصات والد" icon={<UserRound size={20} />} onClose={onClose}>
    <div className="profile-modal-form">
      <div className="grid-two">
        <Field label="نام"><Input value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} /></Field>
        <Field label="نام خانوادگی"><Input value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} /></Field>
      </div>
      <Field label="تاریخ تولد جلالی (اختیاری)"><JalaliDateInput value={form.birth_date} max={todayGregorianDate()} onChange={(birth_date) => setForm((current) => ({ ...current, birth_date }))} /></Field>
      <Field label="جنسیت (اختیاری)"><Select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}><option value="">انتخاب کنید</option><option value="female">زن</option><option value="male">مرد</option><option value="other">سایر / ترجیح می‌دهم نگویم</option></Select></Field>
      {error && <p className="dialog-error">{error}</p>}
      <div className="profile-modal-actions"><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={busy || !form.first_name.trim() || !form.last_name.trim()} onClick={save}>{busy ? "در حال ذخیره…" : "ذخیره تغییرات"}</Button></div>
    </div>
  </ProfileModal>;
}

function ResidenceModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [countryId, setCountryId] = useState(profile.country?.id || 0);
  const [provinceId, setProvinceId] = useState(profile.province?.id || 0);
  const [cityId, setCityId] = useState(profile.city?.id || 0);
  const [address, setAddress] = useState(profile.residence_address || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const countries = useQuery({ queryKey: ["geo", "countries"], queryFn: () => clientApi<Country[]>("/api/ninibu/geo/countries") });
  const provinces = useQuery({
    queryKey: ["geo", "provinces", countryId],
    queryFn: () => clientApi<Province[]>(`/api/ninibu/geo/provinces?country_id=${countryId}`),
    enabled: countryId > 0,
  });
  const cities = useQuery({
    queryKey: ["geo", "cities", provinceId],
    queryFn: () => clientApi<City[]>(`/api/ninibu/geo/cities?province_id=${provinceId}`),
    enabled: provinceId > 0,
  });

  async function save() {
    if (!countryId || !provinceId || !cityId) return;
    setBusy(true); setError("");
    try {
      await clientApi<Profile>("/api/ninibu/profile", {
        method: "PATCH",
        body: JSON.stringify({ country_id: countryId, province_id: provinceId, city_id: cityId, residence_address: address.trim() }),
      });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      trackEvent("profile_form_saved", { form: "residence", result: "success" });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ذخیره محل سکونت انجام نشد");
    } finally { setBusy(false); }
  }

  return <ProfileModal title="ویرایش محل سکونت" icon={<Home size={20} />} onClose={onClose}>
    <div className="profile-modal-form">
      <Field label="کشور"><Select value={countryId || ""} onChange={(event) => { setCountryId(Number(event.target.value)); setProvinceId(0); setCityId(0); }}><option value="">انتخاب کشور</option>{countries.data?.map((country) => <option key={country.id} value={country.id}>{country.local_name || country.name}</option>)}</Select></Field>
      <div className="grid-two">
        <Field label="استان"><Select disabled={!countryId || provinces.isLoading} value={provinceId || ""} onChange={(event) => { setProvinceId(Number(event.target.value)); setCityId(0); }}><option value="">انتخاب استان</option>{provinces.data?.map((province) => <option key={province.id} value={province.id}>{province.local_name || province.name}</option>)}</Select></Field>
        <Field label="شهر"><Select disabled={!provinceId || cities.isLoading} value={cityId || ""} onChange={(event) => setCityId(Number(event.target.value))}><option value="">انتخاب شهر</option>{cities.data?.map((city) => <option key={`${city.province_id}-${city.id}`} value={city.id}>{city.local_name || city.name}</option>)}</Select></Field>
      </div>
      <Field label="آدرس (اختیاری)"><Input value={address} onChange={(event) => setAddress(event.target.value)} /></Field>
      {(countries.isError || provinces.isError || cities.isError) && <p className="dialog-error">دریافت اطلاعات جغرافیایی انجام نشد. دوباره تلاش کنید.</p>}
      {error && <p className="dialog-error">{error}</p>}
      <div className="profile-modal-actions"><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={busy || !countryId || !provinceId || !cityId} onClick={save}>{busy ? "در حال ذخیره…" : "ذخیره محل سکونت"}</Button></div>
    </div>
  </ProfileModal>;
}

function AddChildModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ first_name: "", last_name: "", gender: "", birth_date: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.gender || !form.birth_date) return;
    setBusy(true); setError("");
    try {
      await clientApi<Child>("/api/ninibu/children", {
        method: "POST",
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          gender: form.gender,
          birth_date: form.birth_date,
          blood_type: null,
          birth_weight_grams: null,
          birth_height_cm: null,
          birth_head_circumference_cm: null,
          notes: "",
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["children"] });
      trackEvent("profile_form_saved", { form: "add_child", result: "success" });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "افزودن فرزند انجام نشد");
    } finally { setBusy(false); }
  }

  return <ProfileModal title="افزودن فرزند" icon={<Baby size={20} />} onClose={onClose}>
    <div className="profile-modal-form">
      <p className="profile-modal-note">اطلاعات پایه را ثبت کنید؛ اطلاعات پزشکی و رشد از بخش سلامت تکمیل می‌شوند.</p>
      <div className="grid-two">
        <Field label="نام"><Input value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} /></Field>
        <Field label="نام خانوادگی"><Input value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} /></Field>
      </div>
      <Field label="تاریخ تولد جلالی"><JalaliDateInput required value={form.birth_date} max={todayGregorianDate()} onChange={(birth_date) => setForm((current) => ({ ...current, birth_date }))} /></Field>
      <Field label="جنسیت"><Select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))}><option value="">انتخاب کنید</option><option value="female">دختر</option><option value="male">پسر</option><option value="other">سایر</option></Select></Field>
      {error && <p className="dialog-error">{error}</p>}
      <div className="profile-modal-actions"><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={busy || !form.first_name.trim() || !form.last_name.trim() || !form.gender || !form.birth_date} onClick={save}>{busy ? "در حال ثبت…" : "افزودن فرزند"}</Button></div>
    </div>
  </ProfileModal>;
}
