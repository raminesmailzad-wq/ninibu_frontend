import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { href } from '@/lib/navigation';
import type { City, Country, Profile, Province } from '@ninibu/types';
import { api, apiPaths } from '@/lib/api';
import { Button, Card, ChoiceModal, Field, JalaliDateModalInput, Screen, SelectField } from '@/components/ui';
import { useSession } from '@/providers/SessionProvider';
import { colors, typography } from '@/theme';

type Step = 'parent' | 'residence' | 'child';

type Option = { id: number; name: string; value: string };

export default function Onboarding() {
  const session = useSession();
  const [step, setStep] = useState<Step>('parent');
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [parentBirthDate, setParentBirthDate] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [child, setChild] = useState({ first_name: '', last_name: '', gender: '', birth_date: '' });
  const [modal, setModal] = useState<'country' | 'province' | 'city' | 'gender' | 'childGender' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Profile>(apiPaths.profile).then((next) => {
      setProfile(next);
      setParentBirthDate(next.birth_date ?? '');
      if (next.onboarding_step === 'residence') setStep('residence');
      if (next.onboarding_step === 'child') setStep('child');
    }).catch(() => {});
    api<Country[]>(apiPaths.countries).then(setCountries).catch(() => {});
  }, []);

  async function saveParent() {
    setLoading(true);
    setError('');
    try {
      if (!profile.first_name?.trim()) throw new Error('نام خود را وارد کنید.');
      await api(apiPaths.profile, {
        method: 'PATCH',
        body: JSON.stringify({
          first_name: profile.first_name.trim(),
          last_name: profile.last_name?.trim() || '',
          birth_date: parentBirthDate || null,
          gender: profile.gender || null,
          onboarding_step: 'residence',
        }),
      });
      setStep('residence');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ذخیره اطلاعات والد انجام نشد.');
    } finally {
      setLoading(false);
    }
  }

  async function countryChanged(country: Country) {
    setProfile((current) => ({ ...current, country, province: undefined, city: undefined }));
    setCities([]);
    try { setProvinces(await api<Province[]>(`${apiPaths.provinces}?country_id=${country.id}`)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'استان‌ها دریافت نشدند.'); }
  }

  async function provinceChanged(province: Province) {
    setProfile((current) => ({ ...current, province, city: undefined }));
    try { setCities(await api<City[]>(`${apiPaths.cities}?province_id=${province.id}`)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'شهرها دریافت نشدند.'); }
  }

  async function saveResidence() {
    setLoading(true);
    setError('');
    try {
      await api(apiPaths.profile, {
        method: 'PATCH',
        body: JSON.stringify({
          country_id: profile.country?.id,
          province_id: profile.province?.id,
          city_id: profile.city?.id,
          residence_address: profile.residence_address || '',
          onboarding_step: 'child',
        }),
      });
      setStep('child');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ذخیره محل سکونت انجام نشد.');
    } finally {
      setLoading(false);
    }
  }

  async function saveChild() {
    setLoading(true);
    setError('');
    try {
      if (!child.first_name.trim()) throw new Error('نام فرزند را وارد کنید.');
      if (!child.birth_date) throw new Error('تاریخ تولد فرزند را انتخاب کنید.');
      if (!child.gender) throw new Error('جنسیت فرزند را انتخاب کنید.');
      await api(apiPaths.children, {
        method: 'POST',
        body: JSON.stringify({
          ...child,
          first_name: child.first_name.trim(),
          last_name: child.last_name.trim(),
          blood_type: null,
          birth_weight_grams: null,
          birth_height_cm: null,
          birth_head_circumference_cm: null,
          notes: '',
        }),
      });
      await api(apiPaths.onboardingComplete, { method: 'POST', body: JSON.stringify({ skip_preferences: true }) });
      await session.refresh();
      router.replace(href('/'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ثبت فرزند انجام نشد.');
    } finally {
      setLoading(false);
    }
  }

  if (!session.ready) return null;
  if (!session.authenticated) return <Redirect href={href("/login")} />;
  if (session.onboardingComplete) return <Redirect href={href("/")} />;

  const progress = step === 'parent' ? 1 : step === 'residence' ? 2 : 3;
  const genders: Option[] = [
    { id: 1, name: 'زن', value: 'female' },
    { id: 2, name: 'مرد', value: 'male' },
    { id: 3, name: 'سایر / ترجیح می‌دهم نگویم', value: 'other' },
  ];
  const childGenders: Option[] = [
    { id: 1, name: 'دختر', value: 'female' },
    { id: 2, name: 'پسر', value: 'male' },
    { id: 3, name: 'سایر', value: 'other' },
  ];

  return <Screen>
    <View style={styles.top}><View /><Text style={styles.progress}>{new Intl.NumberFormat('fa-IR').format(progress)} از ۳</Text></View>
    <View style={styles.bar}><View style={[styles.fill, { width: `${progress / 3 * 100}%` }]} /></View>
    <Card style={styles.card}>
      {step === 'parent' ? <>
        <Text style={styles.title}>اول کمی با شما آشنا شویم</Text>
        <Text style={styles.copy}>این اطلاعات برای شخصی‌سازی تجربه شماست.</Text>
        <Field label="نام" value={profile.first_name || ''} onChangeText={(value) => setProfile((current) => ({ ...current, first_name: value }))} />
        <Field label="نام خانوادگی" value={profile.last_name || ''} onChangeText={(value) => setProfile((current) => ({ ...current, last_name: value }))} />
        <JalaliDateModalInput label="تاریخ تولد (اختیاری)" value={parentBirthDate} onChange={setParentBirthDate} />
        <SelectField label="جنسیت (اختیاری)" value={genders.find((item) => item.value === profile.gender)?.name} placeholder="انتخاب کنید" onPress={() => setModal('gender')} />
        <Button title="ادامه" onPress={saveParent} loading={loading} />
      </> : step === 'residence' ? <>
        <Text style={styles.title}>کجا زندگی می‌کنید؟</Text>
        <Text style={styles.copy}>برای پیشنهاد خدمات و مراکز مناسب شهر شما.</Text>
        <SelectField label="کشور" value={profile.country?.local_name || profile.country?.name} placeholder="انتخاب کشور" onPress={() => setModal('country')} />
        <SelectField label="استان" value={profile.province?.local_name || profile.province?.name} placeholder="انتخاب استان" onPress={() => setModal('province')} />
        <SelectField label="شهر" value={profile.city?.local_name || profile.city?.name} placeholder="انتخاب شهر" onPress={() => setModal('city')} />
        <Field label="آدرس (اختیاری)" value={profile.residence_address || ''} onChangeText={(value) => setProfile((current) => ({ ...current, residence_address: value }))} />
        <Button title="ادامه" onPress={saveResidence} loading={loading} />
      </> : <>
        <Text style={styles.title}>فرزندتان را اضافه کنید</Text>
        <Text style={styles.copy}>اطلاعات پزشکی را بعداً از بخش سلامت فرزند تکمیل می‌کنید.</Text>
        <Field label="نام" value={child.first_name} onChangeText={(value) => setChild((current) => ({ ...current, first_name: value }))} />
        <Field label="نام خانوادگی" value={child.last_name} onChangeText={(value) => setChild((current) => ({ ...current, last_name: value }))} />
        <JalaliDateModalInput label="تاریخ تولد" value={child.birth_date} onChange={(value) => setChild((current) => ({ ...current, birth_date: value }))} required />
        <SelectField label="جنسیت" value={childGenders.find((item) => item.value === child.gender)?.name} placeholder="انتخاب کنید" onPress={() => setModal('childGender')} />
        <Button title="ورود به نینیبو" onPress={saveChild} loading={loading} />
      </>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Card>

    <ChoiceModal visible={modal === 'country'} title="کشور" items={countries} label={(item) => item.local_name || item.name} onChoose={countryChanged} onClose={() => setModal(null)} />
    <ChoiceModal visible={modal === 'province'} title="استان" items={provinces} label={(item) => item.local_name || item.name} onChoose={provinceChanged} onClose={() => setModal(null)} />
    <ChoiceModal visible={modal === 'city'} title="شهر" items={cities} label={(item) => item.local_name || item.name} onChoose={(item) => setProfile((current) => ({ ...current, city: item }))} onClose={() => setModal(null)} />
    <ChoiceModal visible={modal === 'gender'} title="جنسیت" items={genders} label={(item) => item.name} onChoose={(item) => setProfile((current) => ({ ...current, gender: item.value }))} onClose={() => setModal(null)} />
    <ChoiceModal visible={modal === 'childGender'} title="جنسیت فرزند" items={childGenders} label={(item) => item.name} onChoose={(item) => setChild((current) => ({ ...current, gender: item.value }))} onClose={() => setModal(null)} />
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingTop: 8 },
  progress: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', color: colors.primary },
  bar: { height: 7, borderRadius: 99, backgroundColor: '#fff', overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  fill: { height: '100%', backgroundColor: colors.primary },
  card: { gap: 15 },
  title: { fontFamily: typography.bold, fontSize: 22, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', color: colors.foreground },
  copy: { fontFamily: typography.regular, fontSize: 12, lineHeight: 20, color: colors.muted, textAlign: 'right', writingDirection: 'rtl' },
  error: { fontFamily: typography.regular, fontSize: 10.5, color: colors.danger, textAlign: 'right', writingDirection: 'rtl', backgroundColor: colors.dangerSoft, padding: 10, borderRadius: 12 },
});
