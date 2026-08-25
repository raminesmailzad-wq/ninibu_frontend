import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { href } from '@/lib/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { CommunityGroup, CommunityPostListResponse } from '@ninibu/types';
import { formatRelativeFa, toPersianDigits } from '@ninibu/datetime';
import { api, apiPaths } from '@/lib/api';
import { Badge, Button, Card, EmptyState, ErrorState, Header, IconButton, Loading, Screen, SectionTitle } from '@/components/ui';
import { colors, typography } from '@/theme';

export default function GroupDetail() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const id = Number(groupId);
  const [group, setGroup] = useState<CommunityGroup>();
  const [posts, setPosts] = useState<CommunityPostListResponse>();
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [postsError, setPostsError] = useState('');
  const [actionError, setActionError] = useState('');

  async function loadGroup() {
    if (!id) return;
    setLoadingGroup(true);
    setGroupError('');
    try {
      const next = await api<CommunityGroup>(apiPaths.communityGroup(id));
      setGroup(next);
      return next;
    } catch (cause) {
      setGroupError(cause instanceof Error ? cause.message : 'گروه دریافت نشد.');
      return undefined;
    } finally {
      setLoadingGroup(false);
    }
  }

  async function loadPosts(target?: CommunityGroup) {
    const current = target ?? group;
    if (!id || !current) return;
    if (current.visibility !== 'public' && current.membership_status !== 'active') {
      setPosts(undefined);
      setPostsError('');
      return;
    }
    setLoadingPosts(true);
    setPostsError('');
    try {
      setPosts(await api<CommunityPostListResponse>(`${apiPaths.communityGroupPosts(id)}?limit=50`));
    } catch (cause) {
      setPostsError(cause instanceof Error ? cause.message : 'پست‌های گروه دریافت نشدند.');
    } finally {
      setLoadingPosts(false);
    }
  }

  async function refreshAll() {
    const next = await loadGroup();
    if (next) await loadPosts(next);
  }

  useEffect(() => { void refreshAll(); }, [id]);

  async function toggleMembership() {
    if (!group) return;
    setBusy(true);
    setActionError('');
    try {
      if (group.membership_status === 'active') await api(apiPaths.communityGroupLeave(group.id), { method: 'POST' });
      else await api(apiPaths.communityGroupJoin(group.id), { method: 'POST' });
      await refreshAll();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'عملیات عضویت انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  return <Screen refreshing={loadingGroup || loadingPosts} onRefresh={refreshAll}>
    <Header title={group?.name || 'گروه'} subtitle="جامعه نینیبو" right={<IconButton icon="arrow-forward" label="بازگشت" onPress={() => router.back()} />} />
    {groupError ? <ErrorState message={groupError} onRetry={loadGroup} /> : loadingGroup ? <Loading label="در حال دریافت گروه…" /> : group ? <>
      <Card>
        <View style={styles.top}>
          <View style={styles.icon}><Ionicons name="people" size={23} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}><Text style={styles.title}>{group.name}</Text>{group.is_official ? <Badge tone="pink">رسمی</Badge> : null}</View>
            <Text style={styles.meta}>{toPersianDigits(group.member_count)} عضو · {group.category.name}</Text>
          </View>
        </View>
        {group.description ? <Text style={styles.desc}>{group.description}</Text> : null}
        <View style={styles.badges}>
          <Badge tone={group.visibility === 'private' ? 'gray' : 'green'}>{group.visibility === 'private' ? 'خصوصی' : group.visibility === 'hidden' ? 'مخفی' : 'عمومی'}</Badge>
          {group.membership_status === 'pending' ? <Badge tone="warning">در انتظار تأیید</Badge> : group.membership_status === 'active' ? <Badge tone="green">عضو هستید</Badge> : null}
        </View>
        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
        {group.membership_policy !== 'invitation_only' ? <Button
          title={group.membership_status === 'active' ? 'خروج از گروه' : group.membership_status === 'pending' ? 'درخواست عضویت ثبت شده' : group.membership_policy === 'approval_required' ? 'درخواست عضویت' : 'عضویت در گروه'}
          variant={group.membership_status === 'active' ? 'ghost' : 'secondary'}
          loading={busy}
          disabled={group.membership_status === 'pending'}
          onPress={toggleMembership}
        /> : <Text style={styles.notice}>عضویت این گروه فقط با دعوت امکان‌پذیر است.</Text>}
      </Card>

      <SectionTitle title="پست‌های گروه" />
      {group.visibility !== 'public' && group.membership_status !== 'active' ? <EmptyState icon="lock-closed-outline" title="محتوای این گروه خصوصی است" text="بعد از تأیید عضویت می‌توانید پست‌های گروه را ببینید." /> : postsError ? <ErrorState message={postsError} onRetry={() => loadPosts(group)} /> : loadingPosts ? <Loading label="در حال دریافت پست‌های گروه…" /> : posts?.items.length ? posts.items.map((post) => <Pressable key={post.id} onPress={() => router.push(href(`/community/posts/${post.id}`))}>
        <Card>
          <Text style={styles.postMeta}>{post.author.display_name} · {formatRelativeFa(post.published_at)}</Text>
          {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
          <Text style={styles.postBody} numberOfLines={5}>{post.body}</Text>
          <Text style={styles.postMeta}>💬 {toPersianDigits(post.comment_count)} دیدگاه</Text>
        </Card>
      </Pressable>) : <EmptyState title="هنوز پستی در این گروه نیست" />}
    </> : <EmptyState title="گروه پیدا نشد" />}
  </Screen>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row-reverse', gap: 12, alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  title: { fontFamily: typography.bold, fontSize: 17, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  meta: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  desc: { fontFamily: typography.regular, fontSize: 12, color: colors.foreground, textAlign: 'right', writingDirection: 'rtl', lineHeight: 21, marginTop: 13 },
  badges: { flexDirection: 'row-reverse', gap: 7, marginVertical: 12, flexWrap: 'wrap' },
  notice: { fontFamily: typography.regular, fontSize: 10.5, color: colors.muted, textAlign: 'right', writingDirection: 'rtl' },
  actionError: { fontFamily: typography.regular, fontSize: 10.5, color: colors.danger, backgroundColor: colors.dangerSoft, borderRadius: 12, padding: 9, textAlign: 'right', writingDirection: 'rtl', marginBottom: 9 },
  postMeta: { fontFamily: typography.regular, fontSize: 10, color: colors.muted, textAlign: 'right', writingDirection: 'rtl' },
  postTitle: { fontFamily: typography.bold, fontSize: 14.5, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginTop: 8 },
  postBody: { fontFamily: typography.regular, fontSize: 12, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl', marginTop: 6 },
});
