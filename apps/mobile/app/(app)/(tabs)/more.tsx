import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { href } from '@/lib/navigation';
import type { User } from '@ninibu/types';
import { API_BASE_URL, APP_VERSION } from '@/lib/config';
import { api, apiPaths } from '@/lib/api';
import { Button, Card, Header, RowLink, Screen, SectionTitle } from '@/components/ui';
import { useSession } from '@/providers/SessionProvider';
import { colors, typography } from '@/theme';

export default function More() {
  const { profile, user } = useSession();
  const [testing, setTesting] = useState(false);
  const [connection, setConnection] = useState<'idle' | 'ok' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const name = [profile?.first_name || user?.first_name, profile?.last_name || user?.last_name].filter(Boolean).join(' ') || 'حساب نینیبو';

  async function testConnection() {
    setTesting(true);
    setConnection('idle');
    setConnectionMessage('');
    try {
      await api<User>(apiPaths.me);
      setConnection('ok');
      setConnectionMessage('اتصال اپ به سرور و نشست کاربری سالم است.');
    } catch (cause) {
      setConnection('error');
      setConnectionMessage(cause instanceof Error ? cause.message : 'اتصال به سرور برقرار نشد.');
    } finally {
      setTesting(false);
    }
  }

  return <Screen>
    <Header title="بیشتر" subtitle="خدمات، محتوا، فروشگاه و تنظیمات حساب" />
    <Card style={styles.identity}>
      <Image source={require('../../../assets/ninibu-logo.png')} style={styles.logo} />
      <View style={{ flex: 1 }}><Text style={styles.name}>{name}</Text><Text style={styles.mobile}>{user?.mobile}</Text></View>
    </Card>

    <SectionTitle title="امکانات" />
    <Card style={styles.linksCard}>
      <RowLink icon="compass-outline" title="کشف و محتوا" subtitle="مطالب، جست‌وجو و پیشنهادهای شخصی" onPress={() => router.push(href('/discover'))} />
      <RowLink icon="calendar-outline" title="خدمات و رزرو" subtitle="خدمات، رزروهای من و مشاوره‌ها" onPress={() => router.push(href('/services'))} />
      <RowLink icon="bag-handle-outline" title="فروشگاه" subtitle="محصولات، سبد خرید و سفارش‌ها" onPress={() => router.push(href('/shop'))} />
      <RowLink icon="notifications-outline" title="اعلان‌ها" subtitle="یادآوری‌ها و رویدادهای جدید" onPress={() => router.push(href('/notifications'))} />
      <RowLink icon="person-circle-outline" title="پروفایل و تنظیمات" subtitle="اطلاعات والد، فرزندان و حریم تبلیغات" onPress={() => router.push(href('/profile'))} />
    </Card>

    {__DEV__ ? <>
      <SectionTitle title="ابزار توسعه" />
      <Card style={styles.debugCard}>
        <View style={styles.statusRow}><Text style={styles.note}>نسخه موبایل</Text><Text style={styles.version}>{APP_VERSION}</Text></View>
        <Text style={styles.backend}>{API_BASE_URL}</Text>
        <Text style={styles.desc}>این بخش فقط در اجرای توسعه Expo نمایش داده می‌شود.</Text>
        {connectionMessage ? <Text style={[styles.connection, connection === 'ok' ? styles.connectionOk : styles.connectionError]}>{connectionMessage}</Text> : null}
        <Button title="تست اتصال به سرور" variant="secondary" loading={testing} onPress={testConnection} />
      </Card>
    </> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  logo: { width: 66, height: 50, resizeMode: 'contain' },
  name: { fontFamily: typography.bold, fontSize: 15, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  mobile: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', marginTop: 3 },
  linksCard: { paddingVertical: 3 },
  debugCard: { gap: 10 },
  statusRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  note: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  version: { fontFamily: typography.bold, fontSize: 11.5, fontWeight: '900', color: colors.primary },
  backend: { fontFamily: typography.regular, fontSize: 10, color: colors.primary, textAlign: 'left' },
  desc: { fontFamily: typography.regular, fontSize: 11, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 19 },
  connection: { fontFamily: typography.regular, fontSize: 10.5, textAlign: 'right', writingDirection: 'rtl', borderRadius: 12, padding: 9, lineHeight: 18 },
  connectionOk: { fontFamily: typography.regular, color: colors.success, backgroundColor: colors.successSoft },
  connectionError: { fontFamily: typography.regular, color: colors.danger, backgroundColor: colors.dangerSoft },
});
