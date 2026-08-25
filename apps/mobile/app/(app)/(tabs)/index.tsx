import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { href } from '@/lib/navigation';
import type {
  ListAllergiesResponse,
  ListChildMedicationsResponse,
  ListGrowthMeasurementsResponse,
  ListMedicalVisitsResponse,
  ListVaccinationsResponse,
  NotificationUnreadCount,
  RecommendationListResponse,
  BookingListResponse,
  ConsultationQuestionListResponse,
} from '@ninibu/types';
import { formatJalaliShortDate, toPersianDigits } from '@ninibu/datetime';
import { api, apiPaths } from '@/lib/api';
import { useChild } from '@/providers/ChildProvider';
import { useSession } from '@/providers/SessionProvider';
import { Badge, Card, EmptyState, Header, IconButton, Loading, Screen, SectionTitle, Stat } from '@/components/ui';
import { ChildSwitcher } from '@/components/ChildSwitcher';
import { SponsoredSlot } from '@/components/SponsoredSlot';
import { colors, typography } from '@/theme';

type DashboardData = {
  growth?: ListGrowthMeasurementsResponse;
  vaccines?: ListVaccinationsResponse;
  allergies?: ListAllergiesResponse;
  meds?: ListChildMedicationsResponse;
  visits?: ListMedicalVisitsResponse;
  recs?: RecommendationListResponse;
  unread: number;
  bookings?: BookingListResponse;
  consultations?: ConsultationQuestionListResponse;
};

export default function Home() {
  const { selected, loading: childrenLoading } = useChild();
  const { profile, user } = useSession();
  const [data, setData] = useState<DashboardData>({ unread: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const [growth, vaccines, allergies, meds, visits, recs, unread, bookings, consultations] = await Promise.all([
        api<ListGrowthMeasurementsResponse>(`${apiPaths.childGrowthMeasurements(selected.id)}?limit=1`),
        api<ListVaccinationsResponse>(`${apiPaths.childVaccinations(selected.id)}?limit=50`),
        api<ListAllergiesResponse>(`${apiPaths.childAllergies(selected.id)}?limit=1&status=active`),
        api<ListChildMedicationsResponse>(`${apiPaths.childMedications(selected.id)}?limit=1&status=active`),
        api<ListMedicalVisitsResponse>(`${apiPaths.childMedicalVisits(selected.id)}?limit=1`),
        api<RecommendationListResponse>(`${apiPaths.recommendations}?limit=3&child_id=${selected.id}`),
        api<NotificationUnreadCount>(apiPaths.notificationUnreadCount),
        api<BookingListResponse>(`${apiPaths.bookings}?limit=20`),
        api<ConsultationQuestionListResponse>(`${apiPaths.consultationQuestions}?limit=50`),
      ]);
      setData({ growth, vaccines, allergies, meds, visits, recs, unread: unread.count, bookings, consultations });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'اطلاعات داشبورد دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [selected?.id]);

  const latestGrowth = data.growth?.items[0];
  const latestVisit = data.visits?.items[0];
  const nextVaccine = [...(data.vaccines?.items ?? [])]
    .filter((item) => item.next_dose_due_at)
    .sort((a, b) => String(a.next_dose_due_at).localeCompare(String(b.next_dose_due_at)))[0];
  const upcomingBooking = [...(data.bookings?.items ?? [])].filter((item) => item.status === 'confirmed' && Date.parse(item.starts_at) >= Date.now()).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
  const waitingConsultation = [...(data.consultations?.items ?? [])].filter((item) => item.status === 'waiting_for_parent').sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))[0];
  const firstName = profile?.first_name || user?.first_name || 'والد عزیز';

  if (childrenLoading) return <Screen><Loading /></Screen>;
  if (!selected) return <Screen><Header title="نینیبو" /><EmptyState icon="happy-outline" title="هنوز فرزندی ثبت نشده" text="از بخش پروفایل یک فرزند اضافه کنید." /></Screen>;

  return <Screen refreshing={loading} onRefresh={load}>
    <Header
      title={`سلام ${firstName} 👋`}
      subtitle="نمای امروز خانواده شما"
      right={<IconButton icon="notifications-outline" badge={data.unread} label="اعلان‌ها" onPress={() => router.push(href('/notifications'))} />}
    />
    <ChildSwitcher />
    <SponsoredSlot placement="home_feed" />

    {error ? <Card><Text style={styles.error}>{error}</Text></Card> : null}

    <Card style={styles.hero}>
      <View style={styles.heroIcon}><Ionicons name="sparkles" size={24} color={colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroTitle}>{selected.first_name}</Text>
        <Text style={styles.heroText}>سلامت فرزند و سلامت مادر دو مسیر مستقل دارند تا اطلاعات هرکدام واضح و مرتب باقی بماند.</Text>
      </View>
    </Card>

    <SectionTitle title="برای پرونده فرزند" />
    <View style={styles.quick}>
      <Quick icon="analytics-outline" title="رشد" subtitle="وزن، قد یا دور سر" onPress={() => router.push(href('/health?action=growth'))} />
      <Quick icon="medical-outline" title="واکسن" subtitle="دوز و تاریخ تزریق" onPress={() => router.push(href('/health?action=vaccine'))} />
      <Quick icon="medkit-outline" title="ویزیت" subtitle="پزشک و مراجعه" onPress={() => router.push(href('/health?action=visit'))} />
    </View>

    <SectionTitle title="سلامت خانواده" />
    <View style={styles.familyGrid}>
      <FamilyPath
        icon="heart"
        title="سلامت فرزند"
        text={`رشد، واکسن، دارو و ویزیت‌های ${selected.first_name}`}
        onPress={() => router.push(href('/health'))}
      />
      <FamilyPath
        icon="heart-circle"
        title="سلامت مادر"
        text="چرخه، بارداری، شیردهی و مراقبت از خود"
        accent
        onPress={() => router.push(href('/maternal-health'))}
      />
    </View>


    {(upcomingBooking || waitingConsultation || data.unread > 0) ? <>
      <SectionTitle title="برای اقدام" />
      <View style={{ gap: 8 }}>
        {upcomingBooking ? <Path icon="calendar-outline" title="رزرو پیش‌رو" text={`${upcomingBooking.service_name || 'خدمت رزروشده'} · ${formatJalaliShortDate(upcomingBooking.starts_at)}`} onPress={() => router.push(href('/services'))} /> : null}
        {waitingConsultation ? <Path icon="chatbubble-ellipses-outline" title="مشاوره منتظر پاسخ شماست" text={waitingConsultation.title} onPress={() => router.push(href('/services'))} /> : null}
        {data.unread > 0 ? <Path icon="notifications-outline" title="اعلان خوانده‌نشده" text={`${toPersianDigits(data.unread)} اعلان نیاز به بررسی دارد`} onPress={() => router.push(href('/notifications'))} /> : null}
      </View>
    </> : null}

    <SectionTitle title={`وضعیت ${selected.first_name}`} />
    <Card>
      <View style={styles.cardHead}>
        <View><Text style={styles.cardTitle}>رشد</Text></View>
        <Ionicons name="stats-chart" size={21} color={colors.primary} />
      </View>
      {loading && !latestGrowth ? <Loading /> : latestGrowth ? <>
        <View style={styles.stats}>
          <Stat label="وزن" value={latestGrowth.weight_kg ? toPersianDigits(latestGrowth.weight_kg) : '—'} unit="کیلوگرم" />
          <Stat label="قد" value={latestGrowth.height_cm ? toPersianDigits(latestGrowth.height_cm) : '—'} unit="سانتی‌متر" />
          <Stat label="دور سر" value={latestGrowth.head_circumference_cm ? toPersianDigits(latestGrowth.head_circumference_cm) : '—'} unit="سانتی‌متر" />
        </View>
        <Text style={styles.foot}>ثبت‌شده در {formatJalaliShortDate(latestGrowth.measured_at)}</Text>
      </> : <Text style={styles.emptyCopy}>هنوز اندازه‌گیری رشد ثبت نشده است.</Text>}
    </Card>

    <Card>
      <View style={styles.cardHead}>
        <View><Text style={styles.cardTitle}>سلامت فرزند</Text></View>
        <Ionicons name="heart" size={21} color={colors.accent} />
      </View>
      <Summary icon="medical" label="واکسن بعدی" value={nextVaccine ? `${nextVaccine.vaccine_name} · ${formatJalaliShortDate(nextVaccine.next_dose_due_at)}` : 'مورد زمان‌بندی‌شده‌ای پیدا نشد'} />
      <Summary icon="bandage" label="داروی فعال" value={`${new Intl.NumberFormat('fa-IR').format(data.meds?.pagination.total || 0)} مورد`} />
      <Summary icon="shield-checkmark" label="حساسیت فعال" value={`${new Intl.NumberFormat('fa-IR').format(data.allergies?.pagination.total || 0)} مورد`} />
      <Summary icon="calendar" label="آخرین ویزیت" value={latestVisit ? formatJalaliShortDate(latestVisit.visited_at) : 'هنوز ویزیتی ثبت نشده'} />
    </Card>

    <SectionTitle title="پیشنهادهای نینیبو" />
    {data.recs?.items?.length ? data.recs.items.map((item) => <Card key={item.id}>
      <View style={styles.recTop}><Badge tone={item.priority === 'high' ? 'warning' : 'purple'}>{item.category}</Badge><Ionicons name="sparkles" size={20} color={colors.primary} /></View>
      <Text style={styles.recTitle}>{item.title}</Text>
      <Text style={styles.recBody}>{item.message}</Text>
      {item.medical_notice ? <Text style={styles.notice}>{item.medical_notice}</Text> : null}
    </Card>) : <EmptyState title="فعلاً پیشنهاد تازه‌ای نداریم" text="با استفاده بیشتر از نینیبو، پیشنهادهای مرتبط اینجا ظاهر می‌شوند." />}

    <SectionTitle title="بخش‌های دیگر" />
    <View style={{ gap: 9 }}>
      <Path icon="chatbubbles-outline" title="جامعه والدین" text="تجربه‌ها، گروه‌ها و دیدگاه‌ها" onPress={() => router.push(href('/community'))} />
      <Path icon="calendar-outline" title="خدمات و مشاوره" text="رزرو خدمت و پرسش از متخصص" onPress={() => router.push(href('/services'))} />
      <Path icon="compass-outline" title="کشف و محتوا" text="مطالب و پیشنهادهای مرتبط" onPress={() => router.push(href('/discover'))} />
      <Path icon="bag-handle-outline" title="فروشگاه" text="محصولات و سفارش‌ها" onPress={() => router.push(href('/shop'))} />
    </View>
  </Screen>;
}

function Quick({ icon, title, subtitle, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void }) {
  return <Pressable style={({ pressed }) => [styles.quickItem, pressed && { opacity: 0.75 }]} onPress={onPress}>
    <View style={styles.quickIcon}><Ionicons name={icon} size={21} color={colors.primary} /></View>
    <Text style={styles.quickTitle}>{title}</Text>
    <Text style={styles.quickSub}>{subtitle}</Text>
  </Pressable>;
}

function FamilyPath({ icon, title, text, onPress, accent = false }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onPress: () => void; accent?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.familyCard, accent && styles.familyCardAccent, pressed && { opacity: 0.78 }]}>
    <View style={[styles.familyIcon, accent && styles.familyIconAccent]}><Ionicons name={icon} size={22} color={accent ? colors.accent : colors.primary} /></View>
    <Text style={styles.familyTitle}>{title}</Text>
    <Text style={styles.familyText}>{text}</Text>
    <View style={styles.familyAction}><Text style={styles.familyActionText}>مشاهده</Text><Ionicons name="chevron-back" size={15} color={colors.primary} /></View>
  </Pressable>;
}

function Summary({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.summary}>
    <View style={styles.sumIcon}><Ionicons name={icon} size={17} color={colors.primary} /></View>
    <View style={{ flex: 1 }}><Text style={styles.sumLabel}>{label}</Text><Text style={styles.sumValue}>{value}</Text></View>
  </View>;
}

function Path({ icon, title, text, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onPress: () => void }) {
  return <Pressable style={({ pressed }) => [styles.path, pressed && { opacity: 0.75 }]} onPress={onPress}>
    <View style={styles.pathIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
    <View style={{ flex: 1 }}><Text style={styles.pathTitle}>{title}</Text><Text style={styles.pathText}>{text}</Text></View>
    <Ionicons name="chevron-back" size={18} color={colors.muted} />
  </Pressable>;
}

const styles = StyleSheet.create({
  error: { fontFamily: typography.regular, color: colors.danger, textAlign: 'right', writingDirection: 'rtl', fontSize: 11.5, lineHeight: 19 },
  hero: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: '#FAF8FF' },
  heroIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontFamily: typography.bold, fontSize: 21, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  heroText: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 18, marginTop: 4 },
  quick: { flexDirection: 'row-reverse', gap: 8 },
  quickItem: { flex: 1, backgroundColor: '#fff', borderRadius: 19, borderWidth: 1, borderColor: colors.border, padding: 10, alignItems: 'center', minHeight: 112, justifyContent: 'center' },
  quickIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickTitle: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', color: colors.foreground, writingDirection: 'rtl' },
  quickSub: { fontFamily: typography.regular, fontSize: 9, color: colors.muted, textAlign: 'center', writingDirection: 'rtl', marginTop: 3, lineHeight: 15 },
  familyGrid: { flexDirection: 'row-reverse', gap: 9 },
  familyCard: { flex: 1, minHeight: 160, backgroundColor: '#fff', borderRadius: 21, borderWidth: 1, borderColor: colors.border, padding: 13 },
  familyCardAccent: { backgroundColor: '#FFF9FB', borderColor: '#F5D8E3' },
  familyIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  familyIconAccent: { backgroundColor: colors.accentSoft },
  familyTitle: { fontFamily: typography.bold, fontSize: 14, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', marginTop: 10 },
  familyText: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 17, marginTop: 5, flex: 1 },
  familyAction: { flexDirection: 'row-reverse', alignItems: 'center', gap: 3, marginTop: 8 },
  familyActionText: { fontFamily: typography.bold, fontSize: 10.5, color: colors.primaryStrong, fontWeight: '900', writingDirection: 'rtl' },
  cardHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  cardTitle: { fontFamily: typography.bold, fontSize: 17.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  stats: { flexDirection: 'row-reverse', gap: 7 },
  foot: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 10 },
  emptyCopy: { fontFamily: typography.regular, fontSize: 11.5, color: colors.muted, textAlign: 'center', paddingVertical: 12, writingDirection: 'rtl' },
  summary: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  sumIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sumLabel: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl' },
  sumValue: { fontFamily: typography.bold, fontSize: 11.5, fontWeight: '800', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', marginTop: 2, lineHeight: 18 },
  recTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  recTitle: { fontFamily: typography.bold, fontSize: 14.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginTop: 11 },
  recBody: { fontFamily: typography.regular, fontSize: 11.5, color: colors.muted, textAlign: 'right', lineHeight: 20, writingDirection: 'rtl', marginTop: 6 },
  notice: { fontFamily: typography.regular, fontSize: 10, color: colors.warning, textAlign: 'right', writingDirection: 'rtl', marginTop: 8, lineHeight: 18 },
  path: { backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 11, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  pathIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  pathTitle: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  pathText: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
});
