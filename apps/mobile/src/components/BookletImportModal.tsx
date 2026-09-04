import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import type { ConfirmDocumentImportResponse, DocumentImport, DocumentImportPageType } from '@ninibu/types';
import { api, apiPaths } from '@/lib/api';
import { Badge, Button, Field, FormModal, JalaliDateModalInput } from '@/components/ui';
import { colors, typography } from '@/theme';

type Asset = { uri: string; fileName?: string | null; mimeType?: string | null };
type ReviewRow = { itemId: number; accepted: boolean; measuredAt: string; value: string; confidence: number; warning?: string; unit: string; ageMonths: number };

const pages: Array<{ value: DocumentImportPageType; title: string; hint: string }> = [
  { value: 'weight_for_age', title: 'وزن نسبت به سن', hint: 'پنل سال اول؛ ۰ تا ۱۲ ماه' },
  { value: 'height_for_age', title: 'قد نسبت به سن', hint: 'از تولد تا ۵ سالگی' },
  { value: 'head_circumference_for_age', title: 'دور سر نسبت به سن', hint: 'از تولد تا ۲ سالگی' },
];

export function BookletImportModal({ visible, childId, childName, onClose, onSaved }: { visible: boolean; childId: number; childName: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [pageType, setPageType] = useState<DocumentImportPageType>('weight_for_age');
  const [asset, setAsset] = useState<Asset | null>(null);
  const [result, setResult] = useState<DocumentImport | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      setPageType('weight_for_age'); setAsset(null); setResult(null); setRows([]); setBusy(false); setError('');
    }
  }, [visible]);

  async function takePhoto() {
    setError('');
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { setError('برای عکس گرفتن از دفترچه، اجازه دسترسی به دوربین لازم است.'); return; }
    const picked = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: false });
    if (!picked.canceled && picked.assets[0]) {
      const pickedAsset = picked.assets[0];
      setAsset({ uri: pickedAsset.uri, fileName: pickedAsset.fileName, mimeType: pickedAsset.mimeType || 'image/jpeg' });
      setResult(null); setRows([]);
    }
  }

  async function choosePhoto() {
    setError('');
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsEditing: true });
    if (!picked.canceled && picked.assets[0]) {
      const pickedAsset = picked.assets[0];
      const mime = (pickedAsset.mimeType || '').toLowerCase();
      if (mime && mime !== 'image/jpeg' && mime !== 'image/png') {
        setError('این فایل JPEG/PNG نیست. برای بهترین نتیجه با دوربین نینیبو از صفحه عکس بگیرید.');
        return;
      }
      setAsset({ uri: pickedAsset.uri, fileName: pickedAsset.fileName, mimeType: mime || 'image/jpeg' });
      setResult(null); setRows([]);
    }
  }

  async function analyze() {
    if (!asset) { setError('ابتدا از صفحه نمودار عکس بگیرید.'); return; }
    setBusy(true); setError('');
    try {
      const form = new FormData();
      form.append('page_type', pageType);
      form.append('consent_acknowledged', 'true');
      form.append('file', { uri: asset.uri, name: asset.fileName || `ninibu-booklet-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' } as any);
      const data = await api<DocumentImport>(apiPaths.childDocumentGrowthImport(childId), { method: 'POST', body: form });
      setResult(data);
      setRows(data.items.map((item) => ({ itemId: item.id, accepted: item.confidence >= 0.55, measuredAt: item.suggested_measured_at, value: String(item.suggested_value), confidence: item.confidence, warning: item.warning, unit: item.unit, ageMonths: item.age_months })));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تحلیل تصویر انجام نشد.');
    } finally { setBusy(false); }
  }

  async function confirm() {
    if (!result) return;
    const accepted = rows.filter((row) => row.accepted);
    if (!accepted.length) { setError('حداقل یک مقدار را برای ثبت تأیید کنید.'); return; }
    if (accepted.some((row) => !row.measuredAt || !Number.isFinite(Number(row.value)) || Number(row.value) <= 0)) { setError('تاریخ و مقدار ردیف‌های انتخاب‌شده را بررسی کنید.'); return; }
    setBusy(true); setError('');
    try {
      await api<ConfirmDocumentImportResponse>(apiPaths.childDocumentImportConfirm(childId, result.id), {
        method: 'POST',
        body: JSON.stringify({ items: rows.map((row) => ({ item_id: row.itemId, accepted: row.accepted, measured_at: row.measuredAt, value: Number(row.value) })) }),
      });
      await onSaved();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ثبت داده‌های استخراج‌شده انجام نشد.');
    } finally { setBusy(false); }
  }

  return <FormModal visible={visible} title={`انتقال رشد ${childName} از دفترچه`} subtitle="عکس فقط برای تحلیل پردازش می‌شود و در نینیبو نگهداری نمی‌شود. ثبت نهایی پس از تأیید شماست." onClose={busy ? () => undefined : onClose}>
    {!result ? <>
      <View style={s.privacyBox}>
        <Ionicons name="shield-checkmark-outline" size={21} color={colors.primary} />
        <View style={{ flex: 1 }}><Text style={s.privacyTitle}>قالب دفترچه سلامت کودک</Text><Text style={s.help}>نسخه آزمایشی برای نمودارهای چاپی متداول و مسیر دست‌نویس آبی/سرمه‌ای طراحی شده است.</Text></View>
      </View>
      <Text style={s.label}>نوع نمودار</Text>
      <View style={s.pageList}>{pages.map((page) => <Pressable key={page.value} onPress={() => { setPageType(page.value); setResult(null); setError(''); }} style={[s.pageOption, pageType === page.value && s.pageOptionActive]}>
        <Ionicons name={pageType === page.value ? 'radio-button-on' : 'radio-button-off'} size={19} color={pageType === page.value ? colors.primary : colors.muted} />
        <View style={{ flex: 1 }}><Text style={s.pageTitle}>{page.title}</Text><Text style={s.pageHint}>{page.hint}</Text></View>
      </Pressable>)}</View>
      {asset ? <View style={s.previewWrap}><Image source={{ uri: asset.uri }} style={s.preview} resizeMode="contain" /><View style={s.previewBadge}><Ionicons name="checkmark-circle" size={17} color={colors.success} /><Text style={s.previewText}>عکس آماده تحلیل است</Text></View></View> : <View style={s.captureGuide}><Ionicons name="scan-outline" size={34} color={colors.primary} /><Text style={s.captureTitle}>کل نمودار را داخل کادر قرار دهید</Text><Text style={s.help}>صفحه صاف، نور یکنواخت و نوشته‌های آبی واضح باشند. در عکس‌های خیلی کج یا تار ممکن است نقطه‌ای پیدا نشود.</Text></View>}
      <View style={s.actionRow}><View style={{ flex: 1 }}><Button title="عکس با دوربین" icon="camera-outline" onPress={takePhoto} disabled={busy} /></View><View style={{ flex: 1 }}><Button title="انتخاب عکس" icon="images-outline" variant="secondary" onPress={choosePhoto} disabled={busy} /></View></View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Button title={busy ? 'در حال تحلیل تصویر…' : 'تحلیل و استخراج مقادیر'} icon="sparkles-outline" onPress={analyze} loading={busy} disabled={!asset} />
    </> : <>
      <View style={s.summary}>
        <View><Text style={s.summaryValue}>{new Intl.NumberFormat('fa-IR').format(rows.length)}</Text><Text style={s.summaryLabel}>نقطه پیشنهادی</Text></View>
        <View><Text style={s.summaryValue}>{new Intl.NumberFormat('fa-IR', { style: 'percent', maximumFractionDigits: 0 }).format(result.overall_confidence)}</Text><Text style={s.summaryLabel}>اطمینان کلی</Text></View>
      </View>
      <Text style={s.helpStrong}>هر مقدار را با دفترچه تطبیق دهید. تاریخ و عدد قابل اصلاح است؛ ردیفی که مطمئن نیستید را خاموش کنید.</Text>
      {rows.map((row, index) => <View key={row.itemId} style={[s.reviewCard, !row.accepted && s.reviewCardOff]}>
        <View style={s.reviewHead}>
          <Pressable style={s.acceptToggle} onPress={() => setRows((old) => old.map((r, i) => i === index ? { ...r, accepted: !r.accepted } : r))}><Ionicons name={row.accepted ? 'checkbox' : 'square-outline'} size={23} color={row.accepted ? colors.primary : colors.muted} /><Text style={s.acceptText}>{row.accepted ? 'ثبت شود' : 'رد شود'}</Text></Pressable>
          <Badge tone={row.confidence < .7 ? 'warning' : 'green'}>{`${new Intl.NumberFormat('fa-IR', { style: 'percent', maximumFractionDigits: 0 }).format(row.confidence)} اطمینان`}</Badge>
        </View>
        <Text style={s.ageText}>{`سن تقریبی روی نمودار: ${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(row.ageMonths)} ماه`}</Text>
        <JalaliDateModalInput label="تاریخ اندازه‌گیری" value={row.measuredAt} onChange={(value) => setRows((old) => old.map((r, i) => i === index ? { ...r, measuredAt: value } : r))} required />
        <Field label={`مقدار (${row.unit === 'kg' ? 'کیلوگرم' : 'سانتی‌متر'})`} value={row.value} onChangeText={(value) => setRows((old) => old.map((r, i) => i === index ? { ...r, value } : r))} keyboardType="decimal-pad" editable={row.accepted} />
        {row.warning ? <Text style={s.warning}>{row.warning}</Text> : null}
      </View>)}
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Button title={busy ? 'در حال ثبت…' : 'تأیید و افزودن به پرونده'} icon="checkmark-circle-outline" onPress={confirm} loading={busy} />
      <Button title="عکس دیگری بگیر" icon="camera-outline" variant="ghost" onPress={() => { setResult(null); setRows([]); setError(''); }} disabled={busy} />
    </>}
  </FormModal>;
}

const s = StyleSheet.create({
  privacyBox: { flexDirection: 'row-reverse', gap: 10, alignItems: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: 16, padding: 12 },
  privacyTitle: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  help: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  helpStrong: { fontFamily: typography.regular, fontSize: 11, color: colors.foreground, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl', backgroundColor: colors.mutedBackground, padding: 11, borderRadius: 13 },
  label: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  pageList: { gap: 8 },
  pageOption: { flexDirection: 'row-reverse', gap: 9, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 11, backgroundColor: '#fff' },
  pageOptionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pageTitle: { fontFamily: typography.bold, fontSize: 12, fontWeight: '900', color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  pageHint: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  captureGuide: { minHeight: 160, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 7, backgroundColor: colors.mutedBackground },
  captureTitle: { fontFamily: typography.bold, fontSize: 13, fontWeight: '900', color: colors.foreground, textAlign: 'center', writingDirection: 'rtl' },
  previewWrap: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.mutedBackground },
  preview: { width: '100%', height: 250 },
  previewBadge: { flexDirection: 'row-reverse', gap: 6, alignItems: 'center', padding: 9, justifyContent: 'center', backgroundColor: colors.successSoft },
  previewText: { fontFamily: typography.bold, fontSize: 10.5, fontWeight: '800', color: colors.success, writingDirection: 'rtl' },
  actionRow: { flexDirection: 'row-reverse', gap: 8 },
  error: { fontFamily: typography.regular, fontSize: 10.5, color: colors.danger, textAlign: 'right', writingDirection: 'rtl', backgroundColor: colors.dangerSoft, borderRadius: 13, padding: 10, lineHeight: 18 },
  summary: { flexDirection: 'row-reverse', gap: 10 },
  summaryValue: { fontFamily: typography.bold, fontSize: 20, fontWeight: '900', color: colors.foreground, textAlign: 'center' },
  summaryLabel: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'center', writingDirection: 'rtl' },
  reviewCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 12, gap: 10, backgroundColor: '#fff' },
  reviewCardOff: { opacity: 0.58 },
  reviewHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  acceptToggle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  acceptText: { fontFamily: typography.bold, fontSize: 11.5, fontWeight: '900', color: colors.foreground, writingDirection: 'rtl' },
  ageText: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'right', writingDirection: 'rtl' },
  warning: { fontFamily: typography.regular, fontSize: 10, color: colors.warning, backgroundColor: colors.warningSoft, borderRadius: 11, padding: 8, lineHeight: 17, textAlign: 'right', writingDirection: 'rtl' },
});
