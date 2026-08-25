import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { AdvertisingDeliveryItem, AdvertisingDeliveryResponse } from '@ninibu/types';
import { api, apiPaths } from '@/lib/api';
import { href } from '@/lib/navigation';
import { APP_VERSION } from '@/lib/config';
import { colors, typography } from '@/theme';

export type SafeAdPlacement = 'home_feed' | 'community_feed' | 'community_group_feed' | 'public_content_list' | 'public_content_detail' | 'search_results' | 'consultation_categories';

function destinationOf(item: AdvertisingDeliveryItem): { kind: 'internal' | 'external' | 'none'; value?: string } {
  const creative = item.creative;
  const type = creative.destination_type ?? '';
  const value = creative.destination_value ?? creative.destination_url ?? creative.internal_path;
  if (!value) return { kind: 'none' };
  if (type === 'external_url' || /^https?:\/\//i.test(value)) return { kind: 'external', value };
  if (type === 'community_group' && /^\d+$/.test(value)) return { kind: 'internal', value: `/community/groups/${value}` };
  if (type === 'consultation_category') return { kind: 'internal', value: '/services' };
  const normalized = value.startsWith('/') ? value : `/${value}`;
  const safe = ['/health', '/maternal-health', '/community', '/discover', '/services', '/shop', '/profile', '/notifications'];
  return safe.some((prefix) => normalized.startsWith(prefix)) ? { kind: 'internal', value: normalized } : { kind: 'none' };
}

export function SponsoredSlot({ placement }: { placement: SafeAdPlacement }) {
  const [delivery, setDelivery] = useState<AdvertisingDeliveryResponse>();
  const [dismissed, setDismissed] = useState<number[]>([]);
  const impressions = useRef(new Set<number>());

  useEffect(() => {
    let active = true;
    api<AdvertisingDeliveryResponse>(`${apiPaths.advertisingPlacementItems(placement)}?language=fa&platform=android&app_version=${encodeURIComponent(APP_VERSION)}&limit=1`)
      .then((value) => { if (active) setDelivery(value); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [placement]);

  const item = useMemo(() => delivery?.items.find((candidate) => candidate.sponsored && !dismissed.includes(candidate.creative.id)), [delivery, dismissed]);

  useEffect(() => {
    if (!item || !delivery?.request_id || impressions.current.has(item.creative.id)) return;
    impressions.current.add(item.creative.id);
    void record(delivery.request_id, item, 'impression', { screen: placement });
  }, [delivery?.request_id, item, placement]);

  if (!item || !delivery?.request_id) return null;
  const activeItem = item;
  const requestId = delivery.request_id;
  const destination = destinationOf(activeItem);

  async function openDestination() {
    if (destination.kind === 'none' || !destination.value) return;
    void record(requestId, activeItem, 'click', { destination: destination.kind });
    if (destination.kind === 'external') await Linking.openURL(destination.value);
    else router.push(href(destination.value));
  }

  function dismiss() {
    setDismissed((current) => [...current, activeItem.creative.id]);
    void record(requestId, activeItem, 'dismiss', { screen: placement });
  }

  return <View style={s.card} accessibilityLabel="تبلیغ حمایت‌شده">
    <View style={s.mark}><Ionicons name="megaphone-outline" size={15} color={colors.primaryStrong} /><Text style={s.markText}>حمایت‌شده</Text></View>
    <View style={s.copy}>
      <Text style={s.title}>{activeItem.creative.title || 'پیشنهاد تبلیغاتی'}</Text>
      {activeItem.creative.body ? <Text style={s.body}>{activeItem.creative.body}</Text> : null}
    </View>
    {destination.kind !== 'none' ? <Pressable onPress={() => void openDestination()} style={s.action}><Text style={s.actionText}>{activeItem.creative.call_to_action || 'مشاهده'}</Text><Ionicons name="chevron-back" size={15} color={colors.primaryStrong} /></Pressable> : null}
    <Pressable onPress={dismiss} style={s.dismiss} accessibilityLabel="بستن تبلیغ"><Ionicons name="close" size={16} color={colors.muted} /></Pressable>
  </View>;
}

async function record(requestId: string, item: AdvertisingDeliveryItem, eventType: 'impression' | 'click' | 'dismiss', metadata: Record<string, string>) {
  try {
    await api(apiPaths.advertisingEvents, {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId, creative_id: item.creative.id, event_type: eventType, metadata }),
    });
  } catch {}
}

const s = StyleSheet.create({
  card: { position: 'relative', borderRadius: 20, borderWidth: 1, borderColor: '#DDD5F2', backgroundColor: '#FBF9FF', padding: 14, paddingTop: 34, gap: 7 },
  mark: { position: 'absolute', right: 13, top: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  markText: { fontFamily: typography.medium, fontSize: 9.5, color: colors.primaryStrong },
  copy: { gap: 4, paddingLeft: 30 },
  title: { fontFamily: typography.bold, fontSize: 13.5, color: colors.foreground, textAlign: 'right', writingDirection: 'rtl' },
  body: { fontFamily: typography.regular, fontSize: 10.5, lineHeight: 18, color: colors.muted, textAlign: 'right', writingDirection: 'rtl' },
  action: { alignSelf: 'flex-start', flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingVertical: 6 },
  actionText: { fontFamily: typography.bold, fontSize: 10.5, color: colors.primaryStrong },
  dismiss: { position: 'absolute', left: 8, top: 8, width: 30, height: 30, borderRadius: 10, backgroundColor: '#F1EEF6', alignItems: 'center', justifyContent: 'center' },
});
