import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow, typography } from '@/theme';
import { gregorianToJalaliInput, jalaliInputToGregorian, todayJalaliInput, toPersianDigits } from '@ninibu/datetime';

export function Screen({
  children,
  refreshing = false,
  onRefresh,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[s.screenContent, contentStyle]}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[s.screenContent, { flex: 1 }, contentStyle]}>{children}</View>
  );
  return <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>{body}</SafeAreaView>;
}

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return <View style={s.header}>
    <View style={s.headerCopy}>
      <Text style={s.h1}>{title}</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return <View style={s.sectionHead}>
    <View style={{ flex: 1 }}><Text style={s.sectionTitle}>{title}</Text></View>
    {action}
  </View>;
}

export function Badge({ children, tone = 'purple' }: { children: ReactNode; tone?: 'purple' | 'pink' | 'green' | 'warning' | 'gray' }) {
  const map = {
    purple: [colors.primarySoft, colors.primaryStrong],
    pink: [colors.accentSoft, '#C94E7A'],
    green: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    gray: [colors.mutedBackground, colors.muted],
  } as const;
  return <View style={[s.badge, { backgroundColor: map[tone][0] }]}><Text style={[s.badgeText, { color: map[tone][1] }]}>{children}</Text></View>;
}

export function Button({
  title,
  onPress,
  loading,
  disabled = false,
  variant = 'primary',
  icon,
  compact = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}) {
  const container = variant === 'primary' ? s.btnPrimary : variant === 'secondary' ? s.btnSecondary : variant === 'danger' ? s.btnDanger : s.btnGhost;
  const textStyle = variant === 'primary' || variant === 'danger' ? s.btnTextLight : s.btnText;
  const iconColor = variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary;
  return <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [s.btn, container, compact && s.btnCompact, (disabled || loading) && s.disabled, pressed && !disabled && !loading && s.pressed]}
  >
    {loading ? <ActivityIndicator color={iconColor} /> : <>
      {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color={iconColor} /> : null}
      <Text style={[textStyle, compact && s.btnTextCompact]}>{title}</Text>
    </>}
  </Pressable>;
}

export function IconButton({ icon, onPress, badge, label }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; badge?: number; label?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}>
    <Ionicons name={icon} size={21} color={colors.foreground} />
    {badge ? <View style={s.dot}><Text style={s.dotText}>{badge > 99 ? '۹۹+' : new Intl.NumberFormat('fa-IR').format(badge)}</Text></View> : null}
  </Pressable>;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType = 'default',
  multiline = false,
  hint,
  error,
  editable = true,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  hint?: string;
  error?: string;
  editable?: boolean;
  maxLength?: number;
}) {
  return <View style={s.field}>
    <View style={s.labelRow}>
      <Text style={s.label}>{label}</Text>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#A39CAB"
      secureTextEntry={secure}
      keyboardType={keyboardType}
      multiline={multiline}
      editable={editable}
      maxLength={maxLength}
      autoCapitalize="none"
      textAlign="right"
      selectionColor={colors.primary}
      style={[s.input, multiline && s.inputMultiline, !editable && s.inputDisabled, error && s.inputError]}
    />
    {error ? <Text style={s.errorText}>{error}</Text> : null}
  </View>;
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return <Card><View style={s.center}>
    <View style={[s.emptyIcon, { backgroundColor: colors.dangerSoft }]}><Ionicons name="cloud-offline-outline" size={26} color={colors.danger} /></View>
    <Text style={s.errorTitle}>دریافت اطلاعات ناموفق بود</Text>
    <Text style={s.errorCopy}>{message || 'ارتباط با سرور را بررسی کنید.'}</Text>
    {onRetry ? <Button title="تلاش دوباره" variant="secondary" onPress={onRetry} /> : null}
  </View></Card>;
}

export function EmptyState({ icon = 'sparkles-outline', title, text, action }: { icon?: keyof typeof Ionicons.glyphMap; title: string; text?: string; action?: ReactNode }) {
  return <Card><View style={s.center}>
    <View style={s.emptyIcon}><Ionicons name={icon} size={24} color={colors.primary} /></View>
    <Text style={s.emptyTitle}>{title}</Text>
    {text ? <Text style={s.emptyCopy}>{text}</Text> : null}
    {action}
  </View></Card>;
}

export function Loading({ label = 'در حال دریافت اطلاعات…' }: { label?: string }) {
  return <View style={s.loading}><ActivityIndicator color={colors.primary} /><Text style={s.sub}>{label}</Text></View>;
}

export function Divider() { return <View style={s.divider} />; }

export function RowLink({ icon, title, subtitle, onPress, badge }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string; onPress: () => void; badge?: string }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [s.rowLink, pressed && s.rowPressed]}>
    <View style={s.rowIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
    <View style={{ flex: 1 }}>
      <Text style={s.rowTitle}>{title}</Text>
      {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
    </View>
    {badge ? <Badge>{badge}</Badge> : null}
    <Ionicons name="chevron-back" size={18} color={colors.muted} />
  </Pressable>;
}

export function ChoiceModal<T extends { id: number }>({ visible, title, items, label, onChoose, onClose }: { visible: boolean; title: string; items: T[]; label: (item: T) => string; onChoose: (item: T) => void; onClose: () => void }) {
  return <Modal visible={visible} transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
    <View style={s.modalRoot}>
      <Pressable style={s.scrim} onPress={onClose} />
      <SafeAreaView style={s.sheet} edges={['bottom']}>
        <View style={s.sheetHandle} />
        <View style={s.sheetHead}>
          <Text style={s.sheetTitle}>{title}</Text>
          <IconButton icon="close" onPress={onClose} label="بستن" />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.choiceList}>
          {items.map((item) => <Pressable key={item.id} style={({ pressed }) => [s.choice, pressed && s.rowPressed]} onPress={() => { onChoose(item); onClose(); }}>
            <Text style={s.choiceText}>{label(item)}</Text>
            <Ionicons name="chevron-back" size={17} color={colors.muted} />
          </Pressable>)}
        </ScrollView>
      </SafeAreaView>
    </View>
  </Modal>;
}

export function SelectField({ label, value, placeholder, onPress, error }: { label: string; value?: string; placeholder: string; onPress: () => void; error?: string }) {
  return <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <Pressable style={[s.select, error && s.inputError]} onPress={onPress}>
      <Text style={[s.selectText, !value && s.placeholder]}>{value || placeholder}</Text>
      <Ionicons name="chevron-down" size={18} color={colors.muted} />
    </Pressable>
    {error ? <Text style={s.errorText}>{error}</Text> : null}
  </View>;
}

function normalizeAsciiDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

export function JalaliDateModalInput({ label, value, onChange, required = false }: { label: string; value?: string; onChange: (gregorian: string) => void; required?: boolean }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [error, setError] = useState('');
  const visual = useMemo(() => value ? gregorianToJalaliInput(value) : '', [value]);

  function syncDraft() {
    const source = normalizeAsciiDigits(value ? gregorianToJalaliInput(value) : todayJalaliInput()).split('/');
    setYear(source[0] || '1405');
    setMonth(source[1] || '01');
    setDay(source[2] || '01');
    setError('');
  }

  useEffect(() => { if (open) syncDraft(); }, [open, value]);

  function save() {
    const y = normalizeAsciiDigits(year).replace(/\D/g, '').slice(0, 4);
    const m = normalizeAsciiDigits(month).replace(/\D/g, '').slice(0, 2);
    const d = normalizeAsciiDigits(day).replace(/\D/g, '').slice(0, 2);
    const input = `${y.padStart(4, '0')}/${m.padStart(2, '0')}/${d.padStart(2, '0')}`;
    const gregorian = jalaliInputToGregorian(input);
    if (!gregorian) {
      setError('تاریخ جلالی معتبر نیست.');
      return;
    }
    onChange(gregorian);
    setOpen(false);
  }

  return <View style={s.field}>
    <Text style={s.label}>{label}{required ? ' *' : ''}</Text>
    <Pressable style={s.select} onPress={() => setOpen(true)}>
      <Text style={[s.selectText, !visual && s.placeholder]}>{visual || 'انتخاب تاریخ'}</Text>
      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
    </Pressable>
    <Modal visible={open} transparent statusBarTranslucent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={s.modalRoot}>
        <Pressable style={s.scrim} onPress={() => setOpen(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.dateModalWrap}>
          <View style={s.dateModal}>
            <View style={s.sheetHead}>
              <View style={{ flex: 1 }}>
                <Text style={s.sheetTitle}>{label}</Text>
                <Text style={s.dateHelp}>سال، ماه و روز را مستقیم انتخاب یا وارد کنید.</Text>
              </View>
              <IconButton icon="close" onPress={() => setOpen(false)} label="بستن" />
            </View>
            <View style={s.dateLabels}>
              <Text style={s.dateLabel}>روز</Text>
              <Text style={s.dateLabel}>ماه</Text>
              <Text style={[s.dateLabel, { flex: 1.3 }]}>سال</Text>
            </View>
            <View style={s.dateRow}>
              <TextInput value={day} onChangeText={(v) => setDay(normalizeAsciiDigits(v).replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" maxLength={2} style={[s.input, s.datePart]} textAlign="center" placeholder="۲۱" placeholderTextColor="#A39CAB" />
              <TextInput value={month} onChangeText={(v) => setMonth(normalizeAsciiDigits(v).replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" maxLength={2} style={[s.input, s.datePart]} textAlign="center" placeholder="۰۵" placeholderTextColor="#A39CAB" />
              <TextInput value={year} onChangeText={(v) => setYear(normalizeAsciiDigits(v).replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4} style={[s.input, s.dateYear]} textAlign="center" placeholder="۱۴۰۵" placeholderTextColor="#A39CAB" />
            </View>
            <Text style={s.datePreview}>تاریخ انتخابی: {toPersianDigits(`${year || '----'}/${month || '--'}/${day || '--'}`)}</Text>
            {error ? <Text style={s.errorText}>{error}</Text> : null}
            <View style={s.dateActions}>
              <View style={{ flex: 1 }}><Button title="تأیید تاریخ" onPress={save} /></View>
              <View style={{ flex: 1 }}><Button title="انصراف" variant="ghost" onPress={() => setOpen(false)} /></View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  </View>;
}

export function FormModal({ visible, title, subtitle, onClose, children }: { visible: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return <Modal visible={visible} transparent statusBarTranslucent animationType="fade" onRequestClose={onClose}>
    <View style={s.modalRoot}>
      <Pressable style={s.scrim} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.formModalKeyboard}>
        <View style={[s.formModal, { paddingBottom: Math.max(18, insets.bottom + 8) }]}>
          <View style={s.formModalHead}>
            <View style={{ flex: 1 }}>
              <Text style={s.formModalTitle}>{title}</Text>
              {subtitle ? <Text style={s.formModalSubtitle}>{subtitle}</Text> : null}
            </View>
            <IconButton icon="close" onPress={onClose} label="بستن" />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.formModalBody}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>;
}

export function SegmentedControl<T extends string>({ items, value, onChange }: { items: Array<{ value: T; label: string }>; value: T; onChange: (value: T) => void }) {
  return <View style={s.segmented}>
    {items.map((item) => <Pressable key={item.value} onPress={() => onChange(item.value)} style={[s.segment, value === item.value && s.segmentActive]}>
      <Text style={[s.segmentText, value === item.value && s.segmentTextActive]}>{item.label}</Text>
    </Pressable>)}
  </View>;
}

export function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return <View style={s.stat}>
    <Text style={s.statLabel}>{label}</Text>
    <Text style={s.statValue}>{value}</Text>
    {unit ? <Text style={s.statUnit}>{unit}</Text> : null}
  </View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },
  screenContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 112, gap: 14 },
  header: { paddingTop: 8, paddingBottom: 6, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  headerCopy: { flex: 1, alignItems: 'stretch' },
  h1: { fontFamily: typography.bold, fontSize: 25, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  sub: { fontFamily: typography.regular, fontSize: 12, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 20, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 23, borderWidth: 1, borderColor: colors.border, padding: 16, ...shadow },
  sectionHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 4, paddingHorizontal: 2 },
  sectionTitle: { fontFamily: typography.bold, fontSize: 18, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 },
  badgeText: { fontFamily: typography.bold, fontSize: 10, fontWeight: '800', writingDirection: 'rtl' },
  btn: { minHeight: 48, borderRadius: 15, paddingHorizontal: 16, flexDirection: 'row-reverse', gap: 8, alignItems: 'center', justifyContent: 'center' },
  btnCompact: { minHeight: 38, paddingHorizontal: 12, borderRadius: 13 },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#D8D1F4' },
  btnDanger: { backgroundColor: colors.danger },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'transparent' },
  btnTextLight: { fontFamily: typography.bold, color: '#fff', fontWeight: '900', fontSize: 13.5, writingDirection: 'rtl' },
  btnText: { fontFamily: typography.bold, color: colors.primaryStrong, fontWeight: '900', fontSize: 13.5, writingDirection: 'rtl' },
  btnTextCompact: { fontFamily: typography.regular, fontSize: 11.5 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.75 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dot: { position: 'absolute', top: -5, right: -5, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  dotText: { fontFamily: typography.bold, fontSize: 9, color: '#fff', fontWeight: '900' },
  field: { gap: 7, minWidth: 0 },
  labelRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 8 },
  label: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '800', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  hint: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'left' },
  input: { fontFamily: typography.regular, minHeight: 50, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', paddingHorizontal: 14, color: colors.foreground, fontSize: 14, writingDirection: 'rtl' },
  inputMultiline: { fontFamily: typography.regular, minHeight: 112, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' },
  inputDisabled: { fontFamily: typography.regular, opacity: 0.65, backgroundColor: colors.mutedBackground },
  inputError: { fontFamily: typography.regular, borderColor: '#E9A2B0' },
  errorText: { fontFamily: typography.regular, fontSize: 10.5, color: colors.danger, textAlign: 'right', writingDirection: 'rtl', lineHeight: 18 },
  center: { alignItems: 'center', gap: 10, paddingVertical: 10 },
  errorTitle: { fontFamily: typography.bold, fontSize: 14.5, fontWeight: '900', color: colors.danger, writingDirection: 'rtl' },
  errorCopy: { fontFamily: typography.regular, fontSize: 11.5, color: colors.muted, textAlign: 'center', writingDirection: 'rtl', lineHeight: 20 },
  emptyIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: typography.bold, fontSize: 14.5, fontWeight: '900', color: colors.foreground, textAlign: 'center', writingDirection: 'rtl' },
  emptyCopy: { fontFamily: typography.regular, fontSize: 11.5, color: colors.muted, textAlign: 'center', lineHeight: 20, writingDirection: 'rtl' },
  loading: { paddingVertical: 34, alignItems: 'center', gap: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  rowLink: { minHeight: 68, flexDirection: 'row-reverse', alignItems: 'center', gap: 11, paddingVertical: 9, paddingHorizontal: 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowPressed: { backgroundColor: colors.mutedBackground, borderRadius: 14 },
  rowIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: typography.bold, fontSize: 13.5, fontWeight: '800', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  rowSub: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 3, lineHeight: 18 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,24,45,.46)' },
  sheet: { maxHeight: '76%', backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 16, paddingBottom: 8 },
  sheetHandle: { width: 46, height: 5, borderRadius: 99, backgroundColor: '#D9D2E3', alignSelf: 'center', marginVertical: 10 },
  sheetHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingBottom: 10 },
  sheetTitle: { fontFamily: typography.bold, fontSize: 17, fontWeight: '900', writingDirection: 'rtl', color: colors.foreground, textAlign: 'right' },
  choiceList: { paddingBottom: 20 },
  choice: { minHeight: 56, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 },
  choiceText: { fontFamily: typography.regular, fontSize: 13.5, color: colors.foreground, writingDirection: 'rtl', textAlign: 'right' },
  select: { minHeight: 50, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', paddingHorizontal: 14, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  selectText: { fontFamily: typography.regular, flex: 1, fontSize: 13.5, color: colors.foreground, writingDirection: 'rtl', textAlign: 'right' },
  placeholder: { fontFamily: typography.regular, color: '#A39CAB' },
  dateModalWrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 14 },
  dateModal: { backgroundColor: '#fff', borderRadius: 25, padding: 17, gap: 13, ...shadow },
  dateHelp: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 3, lineHeight: 18 },
  dateLabels: { flexDirection: 'row-reverse', gap: 8 },
  dateLabel: { fontFamily: typography.regular, flex: 1, fontSize: 10.5, color: colors.muted, textAlign: 'center', writingDirection: 'rtl' },
  dateRow: { flexDirection: 'row-reverse', gap: 8 },
  datePart: { flex: 1 },
  dateYear: { flex: 1.3 },
  datePreview: { fontFamily: typography.regular, fontSize: 11, color: colors.primaryStrong, textAlign: 'right', writingDirection: 'rtl', backgroundColor: colors.primarySoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  dateActions: { flexDirection: 'row-reverse', gap: 8 },
  formModalKeyboard: { flex: 1, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 18 },
  formModal: { maxHeight: '92%', backgroundColor: '#fff', borderRadius: 27, paddingTop: 16, paddingHorizontal: 16, ...shadow },
  formModalHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  formModalTitle: { fontFamily: typography.bold, fontSize: 18, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  formModalSubtitle: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 18, marginTop: 3 },
  formModalBody: { paddingTop: 15, paddingBottom: 4, gap: 13 },
  segmented: { flexDirection: 'row-reverse', backgroundColor: '#fff', borderRadius: 17, padding: 4, borderWidth: 1, borderColor: colors.border, gap: 3 },
  segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, paddingHorizontal: 5 },
  segmentActive: { backgroundColor: colors.primarySoft },
  segmentText: { fontFamily: typography.bold, fontSize: 11, color: colors.muted, fontWeight: '700', writingDirection: 'rtl', textAlign: 'center' },
  segmentTextActive: { fontFamily: typography.bold, color: colors.primaryStrong, fontWeight: '900' },
  stat: { flex: 1, minWidth: 82, backgroundColor: colors.mutedBackground, borderRadius: 16, padding: 11, alignItems: 'center' },
  statLabel: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, writingDirection: 'rtl' },
  statValue: { fontFamily: typography.bold, fontSize: 20, fontWeight: '900', color: colors.foreground, marginTop: 3 },
  statUnit: { fontFamily: typography.regular, fontSize: 9, color: colors.muted, writingDirection: 'rtl', marginTop: 2 },
});
