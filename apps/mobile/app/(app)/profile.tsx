import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { href } from '@/lib/navigation';
import type { AdvertisingPreferences, Child, City, Country, Profile, Province } from '@ninibu/types';
import { formatJalaliDate } from '@ninibu/datetime';
import { api, apiPaths } from '@/lib/api';
import { Badge, Button, Card, ChoiceModal, Field, FormModal, Header, IconButton, JalaliDateModalInput, Screen, SelectField } from '@/components/ui';
import { useChild } from '@/providers/ChildProvider';
import { useSession } from '@/providers/SessionProvider';
import { colors, typography } from '@/theme';

type Edit = 'parent' | 'residence' | 'child' | null;
type Choice = 'gender' | 'childGender' | 'country' | 'province' | 'city' | null;

const genders = [
  { id: 1, value: 'female', label: 'زن / دختر' },
  { id: 2, value: 'male', label: 'مرد / پسر' },
  { id: 3, value: 'other', label: 'سایر' },
];

export default function ProfileScreen() {
  const session = useSession();
  const childCtx = useChild();
  const [edit, setEdit] = useState<Edit>(null);
  const [ads, setAds] = useState<AdvertisingPreferences>({ personalized_ads_enabled: false, location_based_ads_enabled: false, interest_based_ads_enabled: false });
  const [adBusy, setAdBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<AdvertisingPreferences>(apiPaths.advertisingPreferences)
      .then((item) => setAds((current) => ({ ...current, ...item })))
      .catch(() => {});
  }, []);

  const profile = session.profile;

  async function logout() {
    await session.signOut();
    router.replace(href('/login'));
  }

  async function saveAds() {
    setAdBusy(true);
    setError('');
    try {
      setAds(await api<AdvertisingPreferences>(apiPaths.advertisingPreferences, { method: 'PATCH', body: JSON.stringify(ads) }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ذخیره تنظیمات تبلیغات انجام نشد.');
    } finally {
      setAdBusy(false);
    }
  }

  return <Screen>
    <Header title="حساب و خانواده" subtitle="مشخصات والد، فرزندان و حریم خصوصی" />

    <Card>
      <View style={s.hero}>
        <View style={s.avatar}><Text style={s.avatarText}>{(profile?.first_name || 'ن').slice(0, 1)}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>{profile?.first_name || 'کاربر'} {profile?.last_name || ''}</Text>
          <Text style={s.mobile}>{profile?.mobile || session.user?.mobile || ''}</Text>
        </View>
        <IconButton icon="create-outline" onPress={() => setEdit('parent')} label="ویرایش مشخصات" />
      </View>
      <View style={s.profileMeta}>
        <Meta label="تولد" value={profile?.birth_date ? formatJalaliDate(profile.birth_date) : 'ثبت نشده'} />
        <Meta label="شهر" value={profile?.city?.local_name || profile?.city?.name || 'ثبت نشده'} />
      </View>
      <Button title="ویرایش محل سکونت" variant="secondary" icon="location-outline" onPress={() => setEdit('residence')} />
    </Card>

    <View style={s.heading}>
      <View><Text style={s.headingTitle}>فرزندان شما</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="افزودن فرزند" style={s.add} onPress={() => setEdit('child')}><Ionicons name="add" size={20} color="white" /></Pressable>
    </View>

    {childCtx.children.map((child) => <Pressable key={child.id} onPress={() => childCtx.select(child.id)}>
      <Card style={child.id === childCtx.selected?.id ? s.selectedCard : undefined}>
        <View style={s.child}>
          <View style={s.childIcon}><Ionicons name="happy-outline" size={21} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.childName}>{child.first_name} {child.last_name}</Text>
            <Text style={s.childMeta}>تولد {formatJalaliDate(child.birth_date)} · {genders.find((item) => item.value === child.gender)?.label || child.gender}</Text>
          </View>
          {child.id === childCtx.selected?.id ? <Badge>فعال</Badge> : <Ionicons name="chevron-back" size={18} color={colors.muted} />}
        </View>
      </Card>
    </Pressable>)}

    <Card>
      <View style={s.privacyHead}>
        <View style={s.privacyIcon}><Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.privacyTitle}>تنظیمات تبلیغات</Text>
          <Text style={s.privacyText}>اطلاعات سلامت کودک برای تبلیغات استفاده نمی‌شود. این گزینه‌ها فقط ترجیحات عمومی مجاز را کنترل می‌کنند.</Text>
        </View>
      </View>
      <Toggle label="تبلیغات شخصی‌سازی‌شده" value={ads.personalized_ads_enabled} onChange={(value) => setAds((current) => ({ ...current, personalized_ads_enabled: value, ...(!value ? { location_based_ads_enabled: false, interest_based_ads_enabled: false } : {}) }))} />
      <Toggle label="هدف‌گیری بر اساس شهر" value={ads.location_based_ads_enabled} onChange={(value) => setAds((current) => ({ ...current, personalized_ads_enabled: value ? true : current.personalized_ads_enabled, location_based_ads_enabled: value }))} />
      <Toggle label="هدف‌گیری بر اساس علایق" value={Boolean(ads.interest_based_ads_enabled)} onChange={(value) => setAds((current) => ({ ...current, personalized_ads_enabled: value ? true : current.personalized_ads_enabled, interest_based_ads_enabled: value }))} />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Button title="ذخیره تنظیمات تبلیغات" variant="secondary" loading={adBusy} onPress={saveAds} />
    </Card>

    <Button title="خروج از حساب" variant="danger" icon="log-out-outline" onPress={logout} />

    {edit ? <ProfileModal
      mode={edit}
      profile={profile}
      onClose={() => setEdit(null)}
      onSaved={async () => {
        await session.refresh();
        await childCtx.reload();
        setEdit(null);
      }}
    /> : null}
  </Screen>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <View style={s.meta}><Text style={s.metaLabel}>{label}</Text><Text style={s.metaValue}>{value}</Text></View>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <View style={s.toggle}>
    <Text style={s.toggleLabel}>{label}</Text>
    <Switch value={value} onValueChange={onChange} trackColor={{ false: '#D8D3DE', true: colors.primarySoft }} thumbColor={value ? colors.primary : '#8B8492'} />
  </View>;
}

function ProfileModal({ mode, profile, onClose, onSaved }: { mode: Exclude<Edit, null>; profile?: Profile; onClose: () => void; onSaved: () => Promise<void> }) {
  const [choice, setChoice] = useState<Choice>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [parent, setParent] = useState({ first_name: profile?.first_name || '', last_name: profile?.last_name || '', birth_date: profile?.birth_date || '', gender: profile?.gender || '' });
  const [residence, setResidence] = useState({ country: profile?.country as Country | undefined, province: profile?.province as Province | undefined, city: profile?.city as City | undefined, address: profile?.residence_address || '' });
  const [child, setChild] = useState({ first_name: '', last_name: '', birth_date: '', gender: '' });

  useEffect(() => {
    if (mode !== 'residence') return;
    api<Country[]>(apiPaths.countries).then(setCountries).catch((cause) => setError(cause instanceof Error ? cause.message : 'فهرست کشورها دریافت نشد.'));
    if (profile?.country?.id) api<Province[]>(`${apiPaths.provinces}?country_id=${profile.country.id}`).then(setProvinces).catch(() => {});
    if (profile?.province?.id) api<City[]>(`${apiPaths.cities}?province_id=${profile.province.id}`).then(setCities).catch(() => {});
  }, [mode, profile?.country?.id, profile?.province?.id]);

  async function save() {
    setBusy(true);
    setError('');
    try {
      if (mode === 'parent') {
        if (!parent.first_name.trim() || !parent.last_name.trim()) throw new Error('نام و نام خانوادگی را وارد کنید.');
        await api<Profile>(apiPaths.profile, { method: 'PATCH', body: JSON.stringify({ first_name: parent.first_name.trim(), last_name: parent.last_name.trim(), birth_date: parent.birth_date || null, gender: parent.gender || null }) });
      } else if (mode === 'residence') {
        if (!residence.country || !residence.province || !residence.city) throw new Error('کشور، استان و شهر را انتخاب کنید.');
        await api<Profile>(apiPaths.profile, { method: 'PATCH', body: JSON.stringify({ country_id: residence.country.id, province_id: residence.province.id, city_id: residence.city.id, residence_address: residence.address.trim() }) });
      } else {
        if (!child.first_name.trim() || !child.last_name.trim() || !child.gender || !child.birth_date) throw new Error('اطلاعات ضروری فرزند را کامل کنید.');
        await api<Child>(apiPaths.children, { method: 'POST', body: JSON.stringify({ first_name: child.first_name.trim(), last_name: child.last_name.trim(), gender: child.gender, birth_date: child.birth_date, blood_type: null, birth_weight_grams: null, birth_height_cm: null, birth_head_circumference_cm: null, notes: '' }) });
      }
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ذخیره اطلاعات انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'parent' ? 'ویرایش مشخصات والد' : mode === 'residence' ? 'ویرایش محل سکونت' : 'افزودن فرزند';
  const subtitle = mode === 'parent' ? 'اطلاعات حساب والد' : mode === 'residence' ? 'برای پیشنهاد خدمات و مراکز نزدیک' : 'اطلاعات پایه فرزند';

  return <>
    <FormModal visible title={title} subtitle={subtitle} onClose={onClose}>
      {mode === 'parent' ? <>
        <Field label="نام" value={parent.first_name} onChangeText={(value) => setParent((current) => ({ ...current, first_name: value }))} />
        <Field label="نام خانوادگی" value={parent.last_name} onChangeText={(value) => setParent((current) => ({ ...current, last_name: value }))} />
        <JalaliDateModalInput label="تاریخ تولد" value={parent.birth_date} onChange={(birth_date) => setParent((current) => ({ ...current, birth_date }))} />
        <SelectField label="جنسیت" value={genders.find((item) => item.value === parent.gender)?.label} placeholder="انتخاب کنید" onPress={() => setChoice('gender')} />
      </> : mode === 'residence' ? <>
        <SelectField label="کشور" value={residence.country?.local_name || residence.country?.name} placeholder="انتخاب کشور" onPress={() => setChoice('country')} />
        <SelectField label="استان" value={residence.province?.local_name || residence.province?.name} placeholder={residence.country ? 'انتخاب استان' : 'ابتدا کشور را انتخاب کنید'} onPress={() => residence.country && setChoice('province')} />
        <SelectField label="شهر" value={residence.city?.local_name || residence.city?.name} placeholder={residence.province ? 'انتخاب شهر' : 'ابتدا استان را انتخاب کنید'} onPress={() => residence.province && setChoice('city')} />
        <Field label="آدرس" value={residence.address} onChangeText={(value) => setResidence((current) => ({ ...current, address: value }))} multiline />
      </> : <>
        <Field label="نام فرزند" value={child.first_name} onChangeText={(value) => setChild((current) => ({ ...current, first_name: value }))} />
        <Field label="نام خانوادگی" value={child.last_name} onChangeText={(value) => setChild((current) => ({ ...current, last_name: value }))} />
        <JalaliDateModalInput label="تاریخ تولد" value={child.birth_date} onChange={(birth_date) => setChild((current) => ({ ...current, birth_date }))} required />
        <SelectField label="جنسیت" value={genders.find((item) => item.value === child.gender)?.label} placeholder="انتخاب کنید" onPress={() => setChoice('childGender')} />
      </>}
      {error ? <Text style={s.errorBox}>{error}</Text> : null}
      <View style={s.modalActions}>
        <Button title="ذخیره" onPress={save} loading={busy} />
        <Button title="انصراف" variant="ghost" onPress={onClose} />
      </View>
    </FormModal>

    <ChoiceModal visible={choice === 'gender' || choice === 'childGender'} title="جنسیت" items={genders} label={(item) => item.label} onChoose={(item) => choice === 'gender' ? setParent((current) => ({ ...current, gender: item.value })) : setChild((current) => ({ ...current, gender: item.value }))} onClose={() => setChoice(null)} />
    <ChoiceModal visible={choice === 'country'} title="کشور" items={countries} label={(item) => item.local_name || item.name} onChoose={async (item) => {
      setResidence((current) => ({ ...current, country: item, province: undefined, city: undefined }));
      setChoice(null);
      try {
        setProvinces(await api<Province[]>(`${apiPaths.provinces}?country_id=${item.id}`));
        setCities([]);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'فهرست استان‌ها دریافت نشد.');
      }
    }} onClose={() => setChoice(null)} />
    <ChoiceModal visible={choice === 'province'} title="استان" items={provinces} label={(item) => item.local_name || item.name} onChoose={async (item) => {
      setResidence((current) => ({ ...current, province: item, city: undefined }));
      setChoice(null);
      try {
        setCities(await api<City[]>(`${apiPaths.cities}?province_id=${item.id}`));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'فهرست شهرها دریافت نشد.');
      }
    }} onClose={() => setChoice(null)} />
    <ChoiceModal visible={choice === 'city'} title="شهر" items={cities} label={(item) => item.local_name || item.name} onChoose={(item) => {
      setResidence((current) => ({ ...current, city: item }));
      setChoice(null);
    }} onClose={() => setChoice(null)} />
  </>;
}

const s = StyleSheet.create({
  hero: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  avatar: { width: 58, height: 58, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.bold, color: '#fff', fontSize: 26, fontWeight: '900' },
  name: { fontFamily: typography.bold, fontSize: 18, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  mobile: { fontFamily: typography.regular, fontSize: 11, color: colors.muted, textAlign: 'right', marginTop: 4 },
  profileMeta: { flexDirection: 'row-reverse', gap: 9, marginVertical: 14 },
  meta: { flex: 1, backgroundColor: colors.mutedBackground, borderRadius: 15, padding: 11 },
  metaLabel: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'right' },
  metaValue: { fontFamily: typography.bold, fontSize: 11.5, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  heading: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  headingTitle: { fontFamily: typography.bold, fontSize: 19, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  add: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  selectedCard: { borderColor: '#C8BDF0', backgroundColor: '#FCFBFF' },
  child: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  childIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  childName: { fontFamily: typography.bold, fontSize: 13.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  childMeta: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  privacyHead: { flexDirection: 'row-reverse', gap: 10, marginBottom: 8 },
  privacyIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  privacyTitle: { fontFamily: typography.bold, fontSize: 14, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  privacyText: { fontFamily: typography.regular, fontSize: 10.5, lineHeight: 18, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  toggle: { minHeight: 55, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border },
  toggleLabel: { fontFamily: typography.bold, fontSize: 12, fontWeight: '700', writingDirection: 'rtl' },
  error: { fontFamily: typography.regular, color: colors.danger, fontSize: 11, textAlign: 'right', writingDirection: 'rtl', marginVertical: 8 },
  errorBox: { fontFamily: typography.regular, color: colors.danger, fontSize: 11.5, textAlign: 'right', writingDirection: 'rtl', backgroundColor: colors.dangerSoft, padding: 11, borderRadius: 13, lineHeight: 19 },
  modalActions: { gap: 8, paddingTop: 4 },
});
