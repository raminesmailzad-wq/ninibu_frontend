import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { href } from '@/lib/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {
  CommunityGroup,
  CommunityGroupListResponse,
  CommunityPost,
  CommunityPostListResponse,
  CommunityPostType,
  CommunityPrivacyMode,
  CommunityProfile,
  CommunityReactionType,
} from '@ninibu/types';
import { formatRelativeFa, toPersianDigits } from '@ninibu/datetime';
import { api, apiPaths, ApiError } from '@/lib/api';
import { Badge, Button, Card, ChoiceModal, EmptyState, ErrorState, Field, FormModal, Header, Loading, Screen, SectionTitle, SegmentedControl, SelectField } from '@/components/ui';
import { colors, typography } from '@/theme';
import { SponsoredSlot } from '@/components/SponsoredSlot';
import { useSession } from '@/providers/SessionProvider';

type Tab = 'feed' | 'groups' | 'mine';
const reactionOptions: Array<{ type: CommunityReactionType; label: string; emoji: string }> = [
  { type: 'like', label: 'پسند', emoji: '♡' },
  { type: 'helpful', label: 'مفید', emoji: '✓' },
  { type: 'support', label: 'همراهی', emoji: '🤝' },
  { type: 'thanks', label: 'سپاس', emoji: '🙏' },
];
const postTypes: Array<{ id: number; value: CommunityPostType; label: string }> = [
  { id: 1, value: 'question', label: 'پرسش' }, { id: 2, value: 'experience', label: 'تجربه' }, { id: 3, value: 'discussion', label: 'گفت‌وگو' }, { id: 4, value: 'tip', label: 'نکته' },
];

export default function Community() {
  const { profile: accountProfile } = useSession();
  const [tab, setTab] = useState<Tab>('feed');
  const [feed, setFeed] = useState<CommunityPostListResponse>();
  const [groups, setGroups] = useState<CommunityGroupListResponse>();
  const [communityProfile, setCommunityProfile] = useState<CommunityProfile>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number>();
  const [composer, setComposer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const [f, g, cp] = await Promise.all([
        api<CommunityPostListResponse>(`${apiPaths.communityFeed}?limit=50`),
        api<CommunityGroupListResponse>(`${apiPaths.communityGroups}?limit=100`),
        api<CommunityProfile>(apiPaths.communityProfile).catch((cause) => cause instanceof ApiError && cause.status === 404 ? undefined : Promise.reject(cause)),
      ]);
      setFeed(f); setGroups(g); setCommunityProfile(cp);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'اطلاعات جامعه دریافت نشد.');
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const activeGroups = useMemo(() => (groups?.items ?? []).filter((group) => group.membership_status === 'active'), [groups]);
  const visibleGroups = tab === 'mine' ? activeGroups : groups?.items ?? [];

  async function toggle(group: CommunityGroup) {
    setBusy(group.id); setError('');
    try {
      if (group.membership_status === 'active') await api(apiPaths.communityGroupLeave(group.id), { method: 'POST' });
      else await api(apiPaths.communityGroupJoin(group.id), { method: 'POST' });
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'عملیات عضویت انجام نشد.'); }
    finally { setBusy(undefined); }
  }

  async function react(post: CommunityPost, type: CommunityReactionType) {
    const current = post.reactions?.find((item) => item.reaction_type === type);
    setBusy(post.id);
    try {
      if (current?.reacted_by_me) await api(apiPaths.communityPostReaction(post.id, type), { method: 'DELETE' });
      else await api(apiPaths.communityPostReactions(post.id), { method: 'POST', body: JSON.stringify({ reaction_type: type }) });
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'ثبت واکنش انجام نشد.'); }
    finally { setBusy(undefined); }
  }

  return <Screen refreshing={loading} onRefresh={load}>
    <Header title="جامعه نینیبو" subtitle="تجربه، هم‌فکری و حمایت بین والدین" />
    <SponsoredSlot placement="community_feed" />
    <View style={styles.actions}>
      <View style={{ flex: 1 }}><Button title={communityProfile ? 'پروفایل جامعه' : 'ساخت پروفایل جامعه'} variant="secondary" icon="person-circle-outline" onPress={() => setProfileOpen(true)} /></View>
      <View style={{ flex: 1 }}><Button title="پست جدید" icon="add-circle-outline" disabled={!activeGroups.length} onPress={() => setComposer(true)} /></View>
    </View>
    {!communityProfile ? <Card><Text style={styles.notice}>برای انتشار پست و مدیریت هویت نمایشی، ابتدا پروفایل جامعه را بسازید.</Text></Card> : null}

    <SegmentedControl<Tab> value={tab} onChange={setTab} items={[{ value: 'feed', label: 'گفت‌وگوها' }, { value: 'groups', label: 'گروه‌ها' }, { value: 'mine', label: 'گروه‌های من' }]} />

    {error ? <ErrorState message={error} onRetry={load} /> : loading ? <Loading /> : tab === 'feed' ? <>
      <SectionTitle title="گفت‌وگوهای والدین" />
      {feed?.items.length ? feed.items.map((post) => <Card key={post.id}>
        <Pressable onPress={() => router.push(href(`/community/posts/${post.id}`))}>
          <View style={styles.postTop}>
            <View style={styles.authorIcon}><Ionicons name={post.author.author_type === 'verified_clinician' ? 'medkit' : 'person'} size={17} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.author}>{post.author.display_name}</Text><Text style={styles.meta}>{post.group_name || 'جامعه'} · {formatRelativeFa(post.published_at)}</Text></View>
            {post.is_pinned ? <Badge>سنجاق‌شده</Badge> : null}
          </View>
          {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
          <Text style={styles.body}>{post.body}</Text>
          {post.medical_disclaimer ? <Text style={styles.disclaimer}>{post.medical_disclaimer}</Text> : null}
        </Pressable>
        <View style={styles.reactionBar}>{reactionOptions.map((item) => { const r = post.reactions?.find((x) => x.reaction_type === item.type); return <Pressable key={item.type} disabled={busy === post.id} onPress={() => void react(post, item.type)} style={[styles.reactionBtn, r?.reacted_by_me && styles.reactionActive]}><Text style={[styles.reactionText, r?.reacted_by_me && styles.reactionTextActive]}>{item.emoji} {item.label}{r?.count ? ` ${toPersianDigits(r.count)}` : ''}</Text></Pressable>; })}</View>
        <View style={styles.postFooter}><Text style={styles.meta}>💬 {toPersianDigits(post.comment_count)} دیدگاه</Text><Badge tone={post.privacy_mode === 'anonymous' ? 'gray' : 'purple'}>{post.privacy_mode === 'anonymous' ? 'ناشناس' : 'با نام'}</Badge></View>
      </Card>) : <EmptyState title="هنوز پستی در فید نیست" />}
    </> : <>
      <SectionTitle title={tab === 'mine' ? 'گروه‌های من' : 'گروه‌ها'} />
      {visibleGroups.length ? visibleGroups.map((group) => <Card key={group.id} style={styles.group}>
        <Pressable style={styles.groupMain} onPress={() => router.push(href(`/community/groups/${group.id}`))}>
          <View style={styles.groupIcon}><Ionicons name="people" size={21} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <View style={styles.groupTitleRow}><Text style={styles.groupTitle}>{group.name}</Text>{group.is_official ? <Badge tone="pink">رسمی</Badge> : null}</View>
            {group.description ? <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text> : null}
            <Text style={styles.groupMeta}>{toPersianDigits(group.member_count)} عضو · {group.category.name}</Text>
          </View>
        </Pressable>
        <Button compact title={group.membership_status === 'active' ? 'خروج' : group.membership_status === 'pending' ? 'در انتظار' : group.membership_policy === 'approval_required' ? 'درخواست عضویت' : 'عضویت'} variant={group.membership_status === 'active' ? 'ghost' : 'secondary'} loading={busy === group.id} disabled={group.membership_status === 'pending' || group.membership_policy === 'invitation_only'} onPress={() => toggle(group)} />
      </Card>) : <EmptyState title={tab === 'mine' ? 'هنوز عضو گروهی نیستید' : 'گروهی پیدا نشد'} />}
    </>}

    <CommunityProfileModal visible={profileOpen} initial={communityProfile} fallbackName={[accountProfile?.first_name, accountProfile?.last_name].filter(Boolean).join(' ')} onClose={() => setProfileOpen(false)} onSaved={async () => { setProfileOpen(false); await load(); }} />
    <PostComposer visible={composer} groups={activeGroups} anonymousDefault={communityProfile?.is_anonymous_by_default ?? false} onClose={() => setComposer(false)} onCreated={async () => { setComposer(false); await load(); setTab('feed'); }} />
  </Screen>;
}

function CommunityProfileModal({ visible, initial, fallbackName, onClose, onSaved }: { visible: boolean; initial?: CommunityProfile; fallbackName: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(initial?.display_name || fallbackName || '');
  const [bio, setBio] = useState(initial?.bio || '');
  const [anonymous, setAnonymous] = useState(initial?.is_anonymous_by_default ?? false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (visible) { setName(initial?.display_name || fallbackName || ''); setBio(initial?.bio || ''); setAnonymous(initial?.is_anonymous_by_default ?? false); setError(''); } }, [visible, initial?.id]);
  async function save() { if (name.trim().length < 2) return setError('نام نمایشی را وارد کنید.'); setBusy(true); setError(''); try { await api<CommunityProfile>(apiPaths.communityProfile, { method: 'PUT', body: JSON.stringify({ display_name: name.trim(), bio: bio.trim(), is_anonymous_by_default: anonymous }) }); await onSaved(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'ذخیره پروفایل انجام نشد.'); } finally { setBusy(false); } }
  return <FormModal visible={visible} title="پروفایل جامعه" onClose={onClose}><Field label="نام نمایشی" value={name} onChangeText={setName} maxLength={100} placeholder="مثلاً مامان نیلا" /><Field label="درباره من" value={bio} onChangeText={setBio} maxLength={500} multiline placeholder="اختیاری" /><View style={styles.switchRow}><Switch value={anonymous} onValueChange={setAnonymous} /><Text style={styles.switchText}>به‌صورت پیش‌فرض ناشناس منتشر کن</Text></View>{error ? <Text style={styles.error}>{error}</Text> : null}<Button title="ذخیره پروفایل" loading={busy} onPress={save} /></FormModal>;
}

function PostComposer({ visible, groups, anonymousDefault, onClose, onCreated }: { visible: boolean; groups: CommunityGroup[]; anonymousDefault: boolean; onClose: () => void; onCreated: () => Promise<void> }) {
  const [group, setGroup] = useState<CommunityGroup>(); const [groupPick, setGroupPick] = useState(false); const [postType, setPostType] = useState(postTypes[1]); const [typePick, setTypePick] = useState(false); const [privacy, setPrivacy] = useState<CommunityPrivacyMode>(anonymousDefault ? 'anonymous' : 'identified'); const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (visible) { setGroup(groups[0]); setPrivacy(anonymousDefault ? 'anonymous' : 'identified'); setTitle(''); setBody(''); setError(''); } }, [visible, groups[0]?.id]);
  async function submit() { if (!group) return setError('گروه را انتخاب کنید.'); if (body.trim().length < 2) return setError('متن پست را وارد کنید.'); setBusy(true); setError(''); try { await api<CommunityPost>(apiPaths.communityGroupPosts(group.id), { method: 'POST', body: JSON.stringify({ post_type: postType.value, title: title.trim(), body: body.trim(), privacy_mode: privacy }) }); await onCreated(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'انتشار پست انجام نشد.'); } finally { setBusy(false); } }
  const groupOptions = groups.map((item) => ({ ...item, id: item.id }));
  return <><FormModal visible={visible} title="پست جدید" onClose={onClose}><SelectField label="گروه" value={group?.name} placeholder="انتخاب گروه" onPress={() => setGroupPick(true)} /><SelectField label="نوع پست" value={postType.label} placeholder="انتخاب نوع" onPress={() => setTypePick(true)} /><Field label="عنوان (اختیاری)" value={title} onChangeText={setTitle} maxLength={250} /><Field label="متن پست" value={body} onChangeText={setBody} multiline maxLength={10000} /><SegmentedControl<CommunityPrivacyMode> value={privacy} onChange={setPrivacy} items={[{ value: 'identified', label: 'با نام' }, { value: 'anonymous', label: 'ناشناس' }]} />{error ? <Text style={styles.error}>{error}</Text> : null}<Button title="انتشار پست" loading={busy} onPress={submit} /></FormModal><ChoiceModal visible={groupPick} title="انتخاب گروه" items={groupOptions} label={(item) => item.name} onChoose={setGroup} onClose={() => setGroupPick(false)} /><ChoiceModal visible={typePick} title="نوع پست" items={postTypes} label={(item) => item.label} onChoose={setPostType} onClose={() => setTypePick(false)} /></>;
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row-reverse', gap: 8 }, notice: { fontFamily: typography.regular, fontSize: 11.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', lineHeight: 20 }, postTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 9 }, authorIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, author: { fontFamily: typography.bold, fontSize: 12.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' }, meta: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 }, postTitle: { fontFamily: typography.bold, fontSize: 15, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginTop: 12 }, body: { fontFamily: typography.regular, fontSize: 12, lineHeight: 22, color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', marginTop: 7 }, disclaimer: { fontFamily: typography.regular, fontSize: 9.5, color: colors.warning, textAlign: 'right', writingDirection: 'rtl', marginTop: 9, lineHeight: 18 }, reactionBar: { flexDirection: 'row-reverse', gap: 5, flexWrap: 'wrap', marginTop: 12 }, reactionBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 7, backgroundColor: '#fff' }, reactionActive: { backgroundColor: colors.primarySoft, borderColor: '#D5CBF5' }, reactionText: { fontFamily: typography.regular, fontSize: 9.5, color: colors.muted, writingDirection: 'rtl' }, reactionTextActive: { fontFamily: typography.bold, color: colors.primaryStrong, fontWeight: '900' }, postFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }, group: { padding: 13, gap: 11 }, groupMain: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }, groupIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, groupTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 }, groupTitle: { fontFamily: typography.bold, flexShrink: 1, fontSize: 13.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' }, groupDesc: { fontFamily: typography.regular, fontSize: 10, lineHeight: 18, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 }, groupMeta: { fontFamily: typography.regular, fontSize: 9.5, color: colors.primary, textAlign: 'right', writingDirection: 'rtl', marginTop: 5 }, switchRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 12, borderRadius: 15, backgroundColor: colors.mutedBackground }, switchText: { fontFamily: typography.bold, flex: 1, fontSize: 12, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' }, error: { fontFamily: typography.regular, color: colors.danger, backgroundColor: colors.dangerSoft, borderRadius: 12, padding: 10, fontSize: 10.5, textAlign: 'right', writingDirection: 'rtl' },
});
