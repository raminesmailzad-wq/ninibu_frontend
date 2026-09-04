import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {
  ChildNutritionRecommendationListResponse,
  GrowthChart,
  HealthTimelineResponse,
  ListAllergiesResponse,
  ListChildMedicationsResponse,
  ListGrowthMeasurementsResponse,
  ListMedicalVisitsResponse,
  ListVaccinationsResponse,
} from '@ninibu/types';
import { formatJalaliShortDate, toPersianDigits, todayGregorianDate } from '@ninibu/datetime';
import { api, apiPaths } from '@/lib/api';
import { useChild } from '@/providers/ChildProvider';
import { Badge, Button, Card, EmptyState, ErrorState, Field, FormModal, Header, JalaliDateModalInput, Loading, Screen, SectionTitle, SegmentedControl } from '@/components/ui';
import { ChildSwitcher } from '@/components/ChildSwitcher';
import { BookletImportModal } from '@/components/BookletImportModal';
import { GrowthMiniChart } from '@/components/GrowthMiniChart';
import { colors, typography } from '@/theme';

type Tab = 'growth' | 'vaccines' | 'visits' | 'allergies' | 'meds';
type Action = 'growth' | 'vaccine' | 'visit' | null;

export default function Health() {
  const { selected } = useChild();
  const params = useLocalSearchParams<{ action?: string }>();
  const [tab, setTab] = useState<Tab>('growth');
  const [action, setAction] = useState<Action>(null);
  const [bookletImportOpen, setBookletImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [growth, setGrowth] = useState<ListGrowthMeasurementsResponse>();
  const [chart, setChart] = useState<GrowthChart>();
  const [vaccines, setVaccines] = useState<ListVaccinationsResponse>();
  const [visits, setVisits] = useState<ListMedicalVisitsResponse>();
  const [allergies, setAllergies] = useState<ListAllergiesResponse>();
  const [meds, setMeds] = useState<ListChildMedicationsResponse>();
  const [nutrition, setNutrition] = useState<ChildNutritionRecommendationListResponse>();
  const [timeline, setTimeline] = useState<HealthTimelineResponse>();

  useEffect(() => {
    if (params.action === 'growth' || params.action === 'vaccine' || params.action === 'visit') {
      setAction(params.action);
      router.setParams({ action: undefined });
    }
  }, [params.action]);

  async function load() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const [g, c, v, vi, a, m, n, t] = await Promise.all([
        api<ListGrowthMeasurementsResponse>(`${apiPaths.childGrowthMeasurements(selected.id)}?limit=50`),
        api<GrowthChart>(apiPaths.childGrowthChart(selected.id)),
        api<ListVaccinationsResponse>(`${apiPaths.childVaccinations(selected.id)}?limit=100`),
        api<ListMedicalVisitsResponse>(`${apiPaths.childMedicalVisits(selected.id)}?limit=100`),
        api<ListAllergiesResponse>(`${apiPaths.childAllergies(selected.id)}?limit=100`),
        api<ListChildMedicationsResponse>(`${apiPaths.childMedications(selected.id)}?limit=100`),
        api<ChildNutritionRecommendationListResponse>(apiPaths.childNutritionRecommendations(selected.id)),
        api<HealthTimelineResponse>(`${apiPaths.childHealthTimeline(selected.id)}?limit=20`),
      ]);
      setGrowth(g);
      setChart(c);
      setVaccines(v);
      setVisits(vi);
      setAllergies(a);
      setMeds(m);
      setNutrition(n);
      setTimeline(t);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'پرونده سلامت فرزند دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [selected?.id]);

  if (!selected) return <Screen><Header title="سلامت فرزند" /><EmptyState title="فرزندی برای نمایش پرونده وجود ندارد" /></Screen>;

  return <Screen refreshing={loading} onRefresh={load}>
    <Header title="سلامت فرزند" subtitle={`رشد و سوابق سلامت ${selected.first_name}`} />
    <ChildSwitcher />
    <SegmentedControl<Tab>
      value={tab}
      onChange={setTab}
      items={[
        { value: 'growth', label: 'رشد' },
        { value: 'vaccines', label: 'واکسن' },
        { value: 'visits', label: 'ویزیت' },
        { value: 'allergies', label: 'حساسیت' },
        { value: 'meds', label: 'دارو' },
      ]}
    />

    {error ? <ErrorState message={error} onRetry={load} /> : loading ? <Loading /> : tab === 'growth' ? <GrowthView data={growth} chart={chart} onAdd={() => setAction('growth')} onImport={() => setBookletImportOpen(true)} /> : tab === 'vaccines' ? <VaccinesView data={vaccines} onAdd={() => setAction('vaccine')} /> : tab === 'visits' ? <VisitsView data={visits} onAdd={() => setAction('visit')} /> : tab === 'allergies' ? <AllergiesView data={allergies} /> : <MedsView data={meds} />}

    <NutritionRecommendationsView data={nutrition} />
    <HealthTimelineView data={timeline} />
    <QuickForm action={action} childId={selected.id} onClose={() => setAction(null)} onSaved={async () => { setAction(null); await load(); }} />
    <BookletImportModal visible={bookletImportOpen} childId={selected.id} childName={selected.first_name} birthDate={selected.birth_date} onClose={() => setBookletImportOpen(false)} onSaved={load} />
  </Screen>;
}

function GrowthView({ data, chart, onAdd, onImport }: { data?: ListGrowthMeasurementsResponse; chart?: GrowthChart; onAdd: () => void; onImport: () => void }) {
  const latest = data?.items[0];
  const indicator = chart?.indicators?.weight_for_age;
  return <>
    <SectionTitle title="روند رشد" action={<View style={styles.growthActions}><Button compact title="از دفترچه" icon="scan-outline" variant="secondary" onPress={onImport} /><Button compact title="ثبت رشد" icon="add" onPress={onAdd} /></View>} />
    <Card>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>روند وزن</Text>
        {indicator?.latest ? <Badge tone={Math.abs(indicator.latest.z_score) >= 2 ? 'warning' : 'green'}>{`صدک ${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(indicator.latest.percentile)}`}</Badge> : null}
      </View>
      <GrowthMiniChart points={chart?.series.weight_kg || []} />
      {latest ? <View style={styles.metricRow}>
        <Metric label="وزن" value={latest.weight_kg} unit="کیلوگرم" />
        <Metric label="قد" value={latest.height_cm} unit="سانتی‌متر" />
        <Metric label="دور سر" value={latest.head_circumference_cm} unit="سانتی‌متر" />
      </View> : null}
      {chart?.standard?.disclaimer ? <Text style={styles.disclaimer}>{chart.standard.disclaimer}</Text> : null}
    </Card>
    <SectionTitle title="اندازه‌گیری‌ها" />
    {data?.items.length ? data.items.map((item) => <Card key={item.id} style={styles.listCard}>
      <View style={{ flex: 1 }}><Text style={styles.listTitle}>{formatJalaliShortDate(item.measured_at)}</Text><Text style={styles.listSub}>{[item.weight_kg ? `${toPersianDigits(item.weight_kg)} کیلوگرم` : null, item.height_cm ? `${toPersianDigits(item.height_cm)} سانتی‌متر` : null, item.head_circumference_cm ? `دور سر ${toPersianDigits(item.head_circumference_cm)}` : null].filter(Boolean).join(' · ')}</Text></View>
      <Ionicons name="analytics-outline" size={20} color={colors.primary} />
    </Card>) : <EmptyState title="هنوز اندازه‌گیری ثبت نشده" />}
  </>;
}

function Metric({ label, value, unit }: { label: string; value?: number; unit: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value == null ? '—' : toPersianDigits(value)}</Text><Text style={styles.metricUnit}>{unit}</Text></View>;
}

function VaccinesView({ data, onAdd }: { data?: ListVaccinationsResponse; onAdd: () => void }) {
  return <>
    <SectionTitle title="واکسن‌ها" action={<Button compact title="ثبت واکسن" icon="add" onPress={onAdd} />} />
    {data?.items.length ? data.items.map((item) => <Card key={item.id} style={styles.listCard}>
      <View style={styles.listIcon}><Ionicons name="medical-outline" size={19} color={colors.accent} /></View>
      <View style={{ flex: 1 }}><Text style={styles.listTitle}>{item.vaccine_name} · دوز {toPersianDigits(item.dose_number)}</Text><Text style={styles.listSub}>تزریق {formatJalaliShortDate(item.administered_at)}{item.next_dose_due_at ? ` · نوبت بعد ${formatJalaliShortDate(item.next_dose_due_at)}` : ''}</Text></View>
    </Card>) : <EmptyState title="واکسن ثبت‌شده‌ای وجود ندارد" />}
  </>;
}

function VisitsView({ data, onAdd }: { data?: ListMedicalVisitsResponse; onAdd: () => void }) {
  return <>
    <SectionTitle title="ویزیت‌ها" action={<Button compact title="ثبت ویزیت" icon="add" onPress={onAdd} />} />
    {data?.items.length ? data.items.map((item) => <Card key={item.id} style={styles.listCard}>
      <View style={styles.listIcon}><Ionicons name="medkit-outline" size={19} color={colors.primary} /></View>
      <View style={{ flex: 1 }}><Text style={styles.listTitle}>{item.doctor_name || 'ویزیت پزشکی'}</Text><Text style={styles.listSub}>{formatJalaliShortDate(item.visited_at)} · {visitLabel(item.visit_type)}{item.chief_complaint ? ` · ${item.chief_complaint}` : ''}</Text></View>
    </Card>) : <EmptyState title="ویزیتی ثبت نشده" />}
  </>;
}

function AllergiesView({ data }: { data?: ListAllergiesResponse }) {
  return <>
    <SectionTitle title="حساسیت‌ها" />
    {data?.items.length ? data.items.map((item) => <Card key={item.id} style={styles.listCard}>
      <View style={styles.listIcon}><Ionicons name="shield-outline" size={19} color={colors.warning} /></View>
      <View style={{ flex: 1 }}><Text style={styles.listTitle}>{item.allergen_name}</Text><Text style={styles.listSub}>{allergyTypeLabel(item.allergy_type)} · شدت {severityLabel(item.severity)}</Text></View>
      <Badge tone={item.status === 'active' ? 'warning' : 'gray'}>{item.status === 'active' ? 'فعال' : 'غیرفعال'}</Badge>
    </Card>) : <EmptyState title="حساسیتی ثبت نشده" />}
  </>;
}

function MedsView({ data }: { data?: ListChildMedicationsResponse }) {
  return <>
    <SectionTitle title="داروها" />
    {data?.items.length ? data.items.map((item) => <Card key={item.id} style={styles.listCard}>
      <View style={styles.listIcon}><Ionicons name="bandage-outline" size={19} color={colors.primary} /></View>
      <View style={{ flex: 1 }}><Text style={styles.listTitle}>{item.medication_name}</Text><Text style={styles.listSub}>از {formatJalaliShortDate(item.started_at)}{item.dose_value ? ` · ${toPersianDigits(item.dose_value)} ${item.dose_unit || ''}` : ''}</Text></View>
      <Badge tone={item.status === 'active' ? 'green' : 'gray'}>{item.status === 'active' ? 'فعال' : statusLabel(item.status)}</Badge>
    </Card>) : <EmptyState title="دارویی ثبت نشده" />}
  </>;
}

function NutritionRecommendationsView({ data }: { data?: ChildNutritionRecommendationListResponse }) {
  const active = (data?.items || []).filter((item) => item.status === 'active');
  return <>
    <SectionTitle title="غذا و ویتامین پیشنهادی" />
    {active.length ? active.map((item) => <Card key={item.id}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}><Text style={styles.listTitle}>{item.title}</Text><Text style={styles.listSub}>{item.clinician_name}{item.clinician_specialty ? ` · ${item.clinician_specialty}` : ''}</Text></View>
        <Badge tone="green">تأیید متخصص</Badge>
      </View>
      <Text style={styles.nutritionBody}>{item.guidance}</Text>
      {item.rationale ? <Text style={styles.nutritionReason}>دلیل پیشنهاد: {item.rationale}</Text> : null}
      <Text style={styles.disclaimer}>مکمل یا ویتامین را فقط طبق توصیه پزشک و بدون تغییر خودسرانه مصرف کنید.</Text>
    </Card>) : <EmptyState icon="nutrition-outline" title="هنوز توصیه‌ای از پزشک ثبت نشده" text="در صورت نیاز، پزشک دارای دسترسی به پرونده می‌تواند برنامه غذایی یا مکمل را ثبت کند." />}
  </>;
}

function HealthTimelineView({ data }: { data?: HealthTimelineResponse }) {
  return <>
    <SectionTitle title="خط زمانی سلامت" />
    {data?.items.length ? data.items.map((item) => <Card key={`${item.type}-${item.entity_id}-${item.occurred_at}`} style={styles.listCard}>
      <View style={styles.listIcon}><Ionicons name="time-outline" size={19} color={colors.primary} /></View>
      <View style={{ flex: 1 }}><Text style={styles.listTitle}>{item.title}</Text><Text style={styles.listSub}>{formatJalaliShortDate(item.occurred_at)}{item.summary ? ` · ${item.summary}` : ''}</Text></View>
    </Card>) : <EmptyState icon="time-outline" title="خط زمانی سلامت هنوز خالی است" />}
  </>;
}

function QuickForm({ action, childId, onClose, onSaved }: { action: Action; childId: number; onClose: () => void; onSaved: () => Promise<void> }) {
  const [date, setDate] = useState(todayGregorianDate());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [name, setName] = useState('');
  const [dose, setDose] = useState('1');
  const [doctor, setDoctor] = useState('');
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!action) return;
    setDate(todayGregorianDate());
    setWeight(''); setHeight(''); setHead(''); setName(''); setDose('1'); setDoctor(''); setComplaint(''); setError('');
  }, [action]);

  async function save() {
    if (!action) return;
    setLoading(true);
    setError('');
    try {
      if (action === 'growth') {
        if (!weight && !height && !head) throw new Error('حداقل یک مقدار رشد وارد کنید.');
        await api(apiPaths.childGrowthMeasurements(childId), {
          method: 'POST',
          body: JSON.stringify({ measured_at: date, weight_kg: weight ? Number(weight) : undefined, height_cm: height ? Number(height) : undefined, head_circumference_cm: head ? Number(head) : undefined, notes: '' }),
        });
      } else if (action === 'vaccine') {
        if (!name.trim()) throw new Error('نام واکسن را وارد کنید.');
        await api(apiPaths.childVaccinations(childId), { method: 'POST', body: JSON.stringify({ vaccine_name: name.trim(), dose_number: Number(dose || 1), administered_at: date, notes: '' }) });
      } else {
        await api(apiPaths.childMedicalVisits(childId), { method: 'POST', body: JSON.stringify({ visited_at: date, visit_type: 'routine_checkup', doctor_name: doctor.trim() || undefined, chief_complaint: complaint.trim() || undefined, notes: '' }) });
      }
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ثبت اطلاعات انجام نشد.');
    } finally {
      setLoading(false);
    }
  }

  return <FormModal visible={!!action} title={action === 'growth' ? 'ثبت اندازه‌گیری رشد' : action === 'vaccine' ? 'ثبت واکسن' : 'ثبت ویزیت'} subtitle="اطلاعات این فرم در پرونده سلامت فرزند ذخیره می‌شود." onClose={onClose}>
    <JalaliDateModalInput label="تاریخ" value={date} onChange={setDate} required />
    {action === 'growth' ? <>
      <Field label="وزن (کیلوگرم)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="مثلاً ۸.۵" />
      <Field label="قد (سانتی‌متر)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="مثلاً ۷۲" />
      <Field label="دور سر (سانتی‌متر)" value={head} onChangeText={setHead} keyboardType="decimal-pad" placeholder="مثلاً ۴۴" />
    </> : action === 'vaccine' ? <>
      <Field label="نام واکسن" value={name} onChangeText={setName} placeholder="نام واکسن" />
      <Field label="شماره دوز" value={dose} onChangeText={setDose} keyboardType="number-pad" placeholder="۱" />
    </> : <>
      <Field label="نام پزشک (اختیاری)" value={doctor} onChangeText={setDoctor} placeholder="نام پزشک" />
      <Field label="علت مراجعه (اختیاری)" value={complaint} onChangeText={setComplaint} multiline placeholder="شرح کوتاه علت مراجعه" />
    </>}
    {error ? <Text style={styles.formError}>{error}</Text> : null}
    <Button title="ثبت اطلاعات" onPress={save} loading={loading} />
  </FormModal>;
}

function visitLabel(value: string) {
  return ({ routine_checkup: 'چکاپ', illness: 'بیماری', emergency: 'اورژانس', follow_up: 'پیگیری', vaccination: 'واکسیناسیون', consultation: 'مشاوره', hospitalization: 'بستری', other: 'سایر' } as Record<string, string>)[value] || value;
}
function severityLabel(value: string) { return ({ unknown: 'نامشخص', mild: 'خفیف', moderate: 'متوسط', severe: 'شدید', life_threatening: 'بسیار شدید' } as Record<string, string>)[value] || value; }
function allergyTypeLabel(value: string) { return ({ food: 'غذایی', medication: 'دارویی', environmental: 'محیطی', insect: 'حشرات', other: 'سایر' } as Record<string, string>)[value] || value; }
function statusLabel(value: string) { return ({ stopped: 'قطع‌شده', completed: 'تکمیل‌شده', inactive: 'غیرفعال' } as Record<string, string>)[value] || value; }

const styles = StyleSheet.create({
  growthActions: { flexDirection: 'row-reverse', gap: 6, flexWrap: 'wrap' },
  cardHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  cardTitle: { fontFamily: typography.bold, fontSize: 14.5, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  metricRow: { flexDirection: 'row-reverse', gap: 7, marginTop: 10 },
  metric: { flex: 1, alignItems: 'center', backgroundColor: colors.mutedBackground, borderRadius: 15, padding: 10 },
  metricLabel: { fontFamily: typography.regular, fontSize: 9, color: colors.muted, writingDirection: 'rtl' },
  metricValue: { fontFamily: typography.bold, fontSize: 18, fontWeight: '900', marginTop: 3, color: colors.foreground },
  metricUnit: { fontFamily: typography.regular, fontSize: 8.5, color: colors.muted, marginTop: 2, writingDirection: 'rtl' },
  disclaimer: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 17, marginTop: 10 },
  listCard: { padding: 13, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  listIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  listTitle: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  listSub: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 4, lineHeight: 18 },
  nutritionBody: { fontFamily: typography.regular, fontSize: 12, color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', lineHeight: 22, marginTop: 10 },
  nutritionReason: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 19, marginTop: 8 },
  formError: { fontFamily: typography.regular, fontSize: 10.5, color: colors.danger, textAlign: 'right', writingDirection: 'rtl', backgroundColor: colors.dangerSoft, borderRadius: 13, padding: 10, lineHeight: 18 },
});
