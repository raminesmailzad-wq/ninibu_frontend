import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {
  BreastfeedingLog,
  MaternalCheckIn,
  MaternalCycle,
  MaternalGuidanceResponse,
  MaternalLifeStage,
  MaternalProfile,
} from '@ninibu/types';
import { formatJalaliShortDate, todayGregorianDate, toPersianDigits } from '@ninibu/datetime';
import { api, apiPaths } from '@/lib/api';
import {
  Badge,
  Button,
  Card,
  ChoiceModal,
  EmptyState,
  ErrorState,
  Field,
  FormModal,
  Header,
  JalaliDateModalInput,
  Loading,
  Screen,
  SectionTitle,
  SegmentedControl,
  SelectField,
} from '@/components/ui';
import { useChild } from '@/providers/ChildProvider';
import { colors, typography } from '@/theme';

const stages: Array<{ id: number; key: MaternalLifeStage; label: string }> = [
  { id: 1, key: 'menstrual', label: 'چرخه و سلامت عمومی' },
  { id: 2, key: 'preconception', label: 'آمادگی برای بارداری' },
  { id: 3, key: 'pregnancy', label: 'بارداری' },
  { id: 4, key: 'postpartum', label: 'پس از زایمان' },
  { id: 5, key: 'breastfeeding', label: 'شیردهی' },
  { id: 6, key: 'perimenopause', label: 'پیش‌یائسگی' },
  { id: 7, key: 'menopause', label: 'یائسگی' },
];

type LogMode = 'cycle' | 'feed' | 'check';

type ProfileDraft = {
  life_stage: MaternalLifeStage;
  first_period_date: string;
  last_period_date: string;
  last_delivery_date: string;
  breastfeeding: boolean;
  notes: string;
};

export default function MaternalHealthScreen() {
  const { selected } = useChild();
  const [profile, setProfile] = useState<MaternalProfile>();
  const [guidance, setGuidance] = useState<MaternalGuidanceResponse>();
  const [cycles, setCycles] = useState<MaternalCycle[]>([]);
  const [feeds, setFeeds] = useState<BreastfeedingLog[]>([]);
  const [checks, setChecks] = useState<MaternalCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [logMode, setLogMode] = useState<LogMode | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [p, g, c, b, k] = await Promise.all([
        api<MaternalProfile>(apiPaths.maternalHealthProfile),
        api<MaternalGuidanceResponse>(apiPaths.maternalHealthGuidance),
        api<{ items: MaternalCycle[] }>(apiPaths.maternalHealthCycles),
        api<{ items: BreastfeedingLog[] }>(apiPaths.maternalHealthBreastfeeding),
        api<{ items: MaternalCheckIn[] }>(apiPaths.maternalHealthCheckIns),
      ]);
      setProfile(p);
      setGuidance(g);
      setCycles(c.items ?? []);
      setFeeds(b.items ?? []);
      setChecks(k.items ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'اطلاعات سلامت مادر دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const stageLabel = stages.find((item) => item.key === profile?.life_stage)?.label ?? 'سلامت مادر';
  const latest = useMemo(() => {
    const entries = [
      ...cycles.map((item) => ({ key: `cycle-${item.id}`, date: item.started_at, title: 'چرخه', detail: cycleDetail(item) })),
      ...feeds.map((item) => ({ key: `feed-${item.id}`, date: item.started_at, title: 'شیردهی', detail: feedingDetail(item) })),
      ...checks.map((item) => ({ key: `check-${item.id}`, date: item.recorded_at, title: 'حال مادر', detail: checkDetail(item) })),
    ];
    return entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 6);
  }, [cycles, feeds, checks]);

  return <Screen refreshing={loading} onRefresh={load}>
    <Header title="سلامت مادر" subtitle="مسیر مستقل برای چرخه، بارداری، شیردهی و مراقبت از خود" />

    {error ? <ErrorState message={error} onRetry={load} /> : loading ? <Loading /> : <>
      <Card style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}><Ionicons name="heart-circle" size={26} color={colors.accent} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{stageLabel}</Text>
            <Text style={styles.heroCopy}>این پرونده از سلامت و رشد فرزند جداست و فقط اطلاعات مربوط به سلامت مادر را نگه می‌دارد.</Text>
          </View>
        </View>
        <View style={styles.heroActions}>
          <View style={{ flex: 1 }}><Button title="ویرایش پروفایل" icon="create-outline" onPress={() => setProfileOpen(true)} /></View>
          <View style={{ flex: 1 }}><Button title="ثبت حال امروز" variant="secondary" icon="happy-outline" onPress={() => setLogMode('check')} /></View>
        </View>
        <Text style={styles.disclaimer}>این بخش برای آموزش و پیگیری است و جایگزین تشخیص یا تجویز پزشک نیست.</Text>
      </Card>

      <SectionTitle title="امروز چه چیزی می‌خواهید ثبت کنید؟" />
      <View style={styles.quickGrid}>
        <QuickCard icon="calendar-outline" title="چرخه" text="شروع دوره و علائم" onPress={() => setLogMode('cycle')} />
        <QuickCard icon="water-outline" title="شیردهی" text="مدت و توضیحات" onPress={() => setLogMode('feed')} />
        <QuickCard icon="moon-outline" title="حال من" text="خلق، خواب و انرژی" onPress={() => setLogMode('check')} />
      </View>

      <SectionTitle title="برای این دوره" />
      {guidance?.items?.length ? guidance.items.map((item) => <Card key={item.code}>
        <View style={styles.guideHead}>
          <View style={styles.guideIcon}><Ionicons name="sparkles" size={18} color={colors.primary} /></View>
          <Text style={styles.guideTitle}>{item.title}</Text>
          <Badge tone={item.safety_level === 'medical_review' ? 'warning' : 'purple'}>{item.safety_level === 'medical_review' ? 'نیازمند توجه پزشکی' : 'راهنمای عمومی'}</Badge>
        </View>
        <Text style={styles.copy}>{item.summary}</Text>
        {item.actions?.map((action) => <View key={action} style={styles.guideAction}><Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} /><Text style={styles.guideActionText}>{action}</Text></View>)}
      </Card>) : <EmptyState title="راهنمایی هنوز آماده نیست" text="با تکمیل پروفایل سلامت مادر، راهنماهای مرتبط اینجا نمایش داده می‌شوند." />}

      <SectionTitle title="پیگیری‌های من" />
      {latest.length ? latest.map((item) => <Card key={item.key} style={styles.recordCard}>
        <View style={styles.recordIcon}><Ionicons name={item.title === 'چرخه' ? 'calendar-outline' : item.title === 'شیردهی' ? 'water-outline' : 'heart-outline'} size={19} color={colors.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.recordTitle}>{item.title} · {formatJalaliShortDate(item.date)}</Text>
          <Text style={styles.recordMeta}>{item.detail || 'بدون توضیح'}</Text>
        </View>
      </Card>) : <EmptyState title="هنوز سابقه‌ای ثبت نشده" text="ثبت‌های کوتاه روزانه کمک می‌کنند روندها را بهتر ببینید." />}
    </>}

    <MaternalProfileModal
      visible={profileOpen}
      profile={profile}
      onClose={() => setProfileOpen(false)}
      onSaved={async (next) => {
        setProfile(next);
        setProfileOpen(false);
        await load();
      }}
    />
    <MaternalLogModal mode={logMode} childId={selected?.id} onClose={() => setLogMode(null)} onSaved={async () => { setLogMode(null); await load(); }} />
  </Screen>;
}

function MaternalProfileModal({ visible, profile, onClose, onSaved }: { visible: boolean; profile?: MaternalProfile; onClose: () => void; onSaved: (profile: MaternalProfile) => Promise<void> }) {
  const [draft, setDraft] = useState<ProfileDraft>(() => profileDraft(profile));
  const [stageOpen, setStageOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (visible) { setDraft(profileDraft(profile)); setError(''); } }, [visible, profile]);

  async function save() {
    setBusy(true);
    setError('');
    try {
      const next = await api<MaternalProfile>(apiPaths.maternalHealthProfile, {
        method: 'PATCH',
        body: JSON.stringify({
          life_stage: draft.life_stage,
          first_period_date: draft.first_period_date || '',
          last_period_date: draft.last_period_date || '',
          last_delivery_date: draft.last_delivery_date || '',
          breastfeeding: draft.breastfeeding,
          notes: draft.notes.trim(),
        }),
      });
      await onSaved(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ذخیره پروفایل سلامت مادر انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  const stageLabel = stages.find((item) => item.key === draft.life_stage)?.label;
  return <>
    <FormModal visible={visible} title="پروفایل سلامت مادر" subtitle="اطلاعات پایه برای شخصی‌سازی راهنمای سلامت مادر" onClose={onClose}>
      <SelectField label="مرحله فعلی" value={stageLabel} placeholder="انتخاب مرحله" onPress={() => setStageOpen(true)} />
      <View style={styles.formGrid}>
        <View style={{ flex: 1 }}><JalaliDateModalInput label="اولین قاعدگی" value={draft.first_period_date} onChange={(value) => setDraft((current) => ({ ...current, first_period_date: value }))} /></View>
        <View style={{ flex: 1 }}><JalaliDateModalInput label="آخرین قاعدگی" value={draft.last_period_date} onChange={(value) => setDraft((current) => ({ ...current, last_period_date: value }))} /></View>
      </View>
      <JalaliDateModalInput label="آخرین زایمان" value={draft.last_delivery_date} onChange={(value) => setDraft((current) => ({ ...current, last_delivery_date: value }))} />
      <Pressable onPress={() => setDraft((current) => ({ ...current, breastfeeding: !current.breastfeeding }))} style={styles.checkRow}>
        <View style={[styles.checkbox, draft.breastfeeding && styles.checkboxActive]}>{draft.breastfeeding ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}</View>
        <View style={{ flex: 1 }}><Text style={styles.checkTitle}>در حال شیردهی هستم</Text><Text style={styles.checkSub}>برای نمایش راهنمای شیردهی و ثبت‌های مرتبط فعال کنید.</Text></View>
      </Pressable>
      <Field label="یادداشت یا توصیه پزشک" value={draft.notes} onChangeText={(value) => setDraft((current) => ({ ...current, notes: value }))} multiline placeholder="نکته‌ای که برای پیگیری سلامت شما مهم است…" />
      {error ? <Text style={styles.formError}>{error}</Text> : null}
      <Button title="ذخیره پروفایل" loading={busy} onPress={save} />
    </FormModal>
    <ChoiceModal visible={stageOpen} title="مرحله فعلی" items={stages} label={(item) => item.label} onChoose={(item) => setDraft((current) => ({ ...current, life_stage: item.key }))} onClose={() => setStageOpen(false)} />
  </>;
}

function MaternalLogModal({ mode, childId, onClose, onSaved }: { mode: LogMode | null; childId?: number; onClose: () => void; onSaved: () => Promise<void> }) {
  const [date, setDate] = useState(todayGregorianDate());
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [notes, setNotes] = useState('');
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mode) return;
    setDate(todayGregorianDate());
    setPrimary('');
    setSecondary('');
    setNotes('');
    setFlow('medium');
    setError('');
  }, [mode]);

  async function save() {
    if (!mode) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'cycle') {
        const pain = secondary ? Number(secondary) : undefined;
        if (pain != null && (!Number.isFinite(pain) || pain < 0 || pain > 10)) throw new Error('شدت درد باید عددی بین ۰ تا ۱۰ باشد.');
        await api(apiPaths.maternalHealthCycles, { method: 'POST', body: JSON.stringify({ started_at: date, flow, pain_level: pain, notes: notes.trim() }) });
      } else if (mode === 'feed') {
        const duration = primary ? Number(primary) : undefined;
        if (duration != null && (!Number.isFinite(duration) || duration <= 0)) throw new Error('مدت شیردهی باید بیشتر از صفر باشد.');
        await api(apiPaths.maternalHealthBreastfeeding, {
          method: 'POST',
          body: JSON.stringify({ child_id: childId, started_at: new Date().toISOString(), duration_minutes: duration, feeding_method: 'breast', notes: notes.trim() }),
        });
      } else {
        const energy = secondary ? Number(secondary) : undefined;
        if (energy != null && (!Number.isFinite(energy) || energy < 0 || energy > 10)) throw new Error('میزان انرژی باید عددی بین ۰ تا ۱۰ باشد.');
        await api(apiPaths.maternalHealthCheckIns, {
          method: 'POST',
          body: JSON.stringify({ recorded_at: date, mood: primary.trim(), sleep_quality: notes.trim(), energy_level: energy }),
        });
      }
      await onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ثبت اطلاعات انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'cycle' ? 'ثبت چرخه' : mode === 'feed' ? 'ثبت شیردهی' : 'ثبت حال امروز';
  return <FormModal visible={!!mode} title={title} subtitle="اطلاعات را کوتاه و دقیق ثبت کنید؛ بعداً قابل پیگیری است." onClose={onClose}>
    {mode !== 'feed' ? <JalaliDateModalInput label="تاریخ" value={date} onChange={setDate} required /> : null}
    {mode === 'cycle' ? <>
      <Text style={styles.fieldLabel}>شدت خونریزی</Text>
      <SegmentedControl items={[{ value: 'light' as const, label: 'کم' }, { value: 'medium' as const, label: 'متوسط' }, { value: 'heavy' as const, label: 'زیاد' }]} value={flow} onChange={setFlow} />
      <Field label="شدت درد از ۰ تا ۱۰" value={secondary} onChangeText={setSecondary} keyboardType="number-pad" placeholder="مثلاً ۶" />
      <Field label="یادداشت" value={notes} onChangeText={setNotes} multiline placeholder="علائم یا نکات این دوره…" />
    </> : mode === 'feed' ? <>
      <Field label="مدت شیردهی (دقیقه)" value={primary} onChangeText={setPrimary} keyboardType="number-pad" placeholder="مثلاً ۲۰" />
      <Field label="یادداشت" value={notes} onChangeText={setNotes} multiline placeholder="نکات مربوط به شیردهی…" />
    </> : <>
      <Field label="حال روحی" value={primary} onChangeText={setPrimary} placeholder="مثلاً خوب، خسته یا مضطرب" />
      <Field label="انرژی از ۰ تا ۱۰" value={secondary} onChangeText={setSecondary} keyboardType="number-pad" placeholder="مثلاً ۷" />
      <Field label="کیفیت خواب و یادداشت" value={notes} onChangeText={setNotes} multiline placeholder="خواب و نکات امروز…" />
    </>}
    {error ? <Text style={styles.formError}>{error}</Text> : null}
    <Button title="ثبت اطلاعات" loading={busy} onPress={save} />
  </FormModal>;
}

function QuickCard({ icon, title, text, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onPress: () => void }) {
  return <Pressable style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.75 }]} onPress={onPress}>
    <View style={styles.quickIcon}><Ionicons name={icon} size={21} color={colors.primary} /></View>
    <Text style={styles.quickTitle}>{title}</Text>
    <Text style={styles.quickText}>{text}</Text>
  </Pressable>;
}

function profileDraft(profile?: MaternalProfile): ProfileDraft {
  return {
    life_stage: profile?.life_stage ?? 'menstrual',
    first_period_date: profile?.first_period_date ?? '',
    last_period_date: profile?.last_period_date ?? '',
    last_delivery_date: profile?.last_delivery_date ?? '',
    breastfeeding: Boolean(profile?.breastfeeding),
    notes: profile?.notes ?? '',
  };
}

function cycleDetail(item: MaternalCycle) {
  const flow = item.flow === 'light' ? 'کم' : item.flow === 'heavy' ? 'زیاد' : item.flow === 'medium' ? 'متوسط' : item.flow;
  return [flow ? `شدت ${flow}` : null, item.pain_level != null ? `درد ${toPersianDigits(item.pain_level)}/۱۰` : null, item.notes].filter(Boolean).join(' · ');
}
function feedingDetail(item: BreastfeedingLog) {
  return [item.duration_minutes ? `${toPersianDigits(item.duration_minutes)} دقیقه` : null, item.feeding_method === 'pumped_milk' ? 'شیر دوشیده' : item.feeding_method === 'mixed' ? 'ترکیبی' : 'شیردهی مستقیم', item.notes].filter(Boolean).join(' · ');
}
function checkDetail(item: MaternalCheckIn) {
  return [item.mood, item.sleep_quality, item.energy_level != null ? `انرژی ${toPersianDigits(item.energy_level)}/۱۰` : null].filter(Boolean).join(' · ');
}

const styles = StyleSheet.create({
  heroCard: { gap: 15, backgroundColor: '#FFFDFE' },
  heroTop: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 12 },
  heroIcon: { width: 50, height: 50, borderRadius: 17, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: typography.bold, fontSize: 21, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  heroCopy: { fontFamily: typography.regular, fontSize: 11.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 20, marginTop: 5 },
  heroActions: { flexDirection: 'row-reverse', gap: 8 },
  disclaimer: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 19, backgroundColor: colors.mutedBackground, padding: 10, borderRadius: 13 },
  quickGrid: { flexDirection: 'row-reverse', gap: 8 },
  quickCard: { flex: 1, minHeight: 120, borderRadius: 19, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', padding: 11, alignItems: 'center', justifyContent: 'center' },
  quickIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', color: colors.foreground, writingDirection: 'rtl', marginTop: 7 },
  quickText: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'center', writingDirection: 'rtl', lineHeight: 16, marginTop: 3 },
  guideHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  guideIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  guideTitle: { fontFamily: typography.bold, flex: 1, fontSize: 13.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  copy: { fontFamily: typography.regular, fontSize: 11.5, color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', lineHeight: 21, marginTop: 9 },
  guideAction: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 7, marginTop: 7 },
  guideActionText: { fontFamily: typography.regular, flex: 1, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 19 },
  recordCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 11 },
  recordIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  recordTitle: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  recordMeta: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 18, marginTop: 4 },
  formGrid: { flexDirection: 'row-reverse', gap: 9 },
  checkRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, backgroundColor: '#fff' },
  checkbox: { width: 21, height: 21, borderRadius: 7, borderWidth: 1.5, borderColor: colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkTitle: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  checkSub: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 17, marginTop: 2 },
  formError: { fontFamily: typography.regular, fontSize: 10.5, color: colors.danger, backgroundColor: colors.dangerSoft, borderRadius: 13, padding: 10, textAlign: 'right', writingDirection: 'rtl', lineHeight: 18 },
  fieldLabel: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '800', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
});
