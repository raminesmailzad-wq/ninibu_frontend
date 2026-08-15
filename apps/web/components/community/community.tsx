"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CirclePlus, Filter, MessageCircleMore, Search, Settings2, Sparkles, UsersRound, X } from "lucide-react";
import type {
  CommunityCategory,
  CommunityGroup,
  CommunityGroupListResponse,
  CommunityPost,
  CommunityPostListResponse,
  CommunityPostType,
  CommunityPrivacyMode,
  CommunityProfile,
  CommunityReactionType,
  CommunityReportReason,
  Profile
} from "@ninibu/types";
import { clientApi, NinibuApiError } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ModalPortal } from "@/components/ui/modal-portal";
import { GroupCard } from "./group-card";
import { PostCard } from "./post-card";
import { PostDetail } from "./post-detail";
import { postTypeLabels, reportReasons } from "./community-data";
import { trackEvent } from "@/lib/analytics";

type CommunityTab = "feed" | "groups" | "mine";

export function Community({ accountProfile }: { accountProfile?: Profile }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<CommunityTab>("feed");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [postType, setPostType] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ entityType: "community_post" | "community_comment"; entityId: number } | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["community", "categories"],
    queryFn: () => clientApi<CommunityCategory[]>("/api/ninibu/community/categories"),
    staleTime: 10 * 60_000
  });
  const profileQuery = useQuery({
    queryKey: ["community", "profile"],
    queryFn: () => clientApi<CommunityProfile>("/api/ninibu/community/profile"),
    retry: false
  });
  const groupsQuery = useQuery({
    queryKey: ["community", "groups"],
    queryFn: () => clientApi<CommunityGroupListResponse>("/api/ninibu/community/groups?limit=100")
  });

  const feedQuery = useInfiniteQuery({
    queryKey: ["community", "feed", search, postType, sort],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: "12", sort });
      if (search.trim()) params.set("search", search.trim());
      if (postType) params.set("type", postType);
      return clientApi<CommunityPostListResponse>(`/api/ninibu/community/feed?${params}`);
    },
    getNextPageParam: (last) => last.pagination.page < last.pagination.total_pages ? last.pagination.page + 1 : undefined
  });

  const groupItems = groupsQuery.data?.items;
  const allGroups = useMemo(() => groupItems ?? [], [groupItems]);
  const visibleGroups = useMemo(() => allGroups.filter((group) => {
    if (tab === "mine" && !["active", "pending", "muted"].includes(group.membership_status || "")) return false;
    if (category && group.category.code !== category) return false;
    const term = search.trim().toLowerCase();
    if (term && !`${group.name} ${group.description || ""} ${group.category.name}`.toLowerCase().includes(term)) return false;
    return true;
  }), [allGroups, tab, category, search]);
  const activeGroups = allGroups.filter((group) => group.membership_status === "active");
  const feedPosts = feedQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const membershipMutation = useMutation({
    mutationFn: async ({ group, action }: { group: CommunityGroup; action: "join" | "leave" }) => {
      if (action === "join") return clientApi<CommunityGroup>(`/api/ninibu/community/groups/${group.id}/join`, { method: "POST" });
      await clientApi<void>(`/api/ninibu/community/groups/${group.id}/leave`, { method: "POST" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["community", "groups"] });
      await queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
    }
  });

  const reactionMutation = useMutation({
    mutationFn: ({ post, type, active }: { post: CommunityPost; type: CommunityReactionType; active: boolean }) => active
      ? clientApi<void>(`/api/ninibu/community/posts/${post.id}/reactions/${type}`, { method: "DELETE" })
      : clientApi(`/api/ninibu/community/posts/${post.id}/reactions`, { method: "POST", body: JSON.stringify({ reaction_type: type }) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
      await queryClient.invalidateQueries({ queryKey: ["community", "group-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["community", "post"] });
    }
  });

  const profileMissing = profileQuery.error instanceof NinibuApiError && profileQuery.error.status === 404;

  function changeTab(next: CommunityTab) {
    if (next === tab) return;
    trackEvent("community_tab_selected", { tab: next });
    setTab(next);
  }

  function openPost(post: CommunityPost) {
    trackEvent("community_post_opened", { content_type: post.post_type || "post" });
    setSelectedPost(post);
  }

  if (selectedGroup) {
    return <GroupDetail group={selectedGroup} onBack={() => setSelectedGroup(null)} onJoin={() => { trackEvent("community_membership_action", { action: "join", category: selectedGroup.category.code }); membershipMutation.mutate({ group: selectedGroup, action: "join" }); }} />;
  }

  return <section className="community-page">
    <div className="community-hero">
      <div>
        <span className="eyebrow">جامعه نینیبو</span>
        <h1>تجربه والدین، کنار هم</h1>
        <p>سؤال بپرسید، تجربه‌ها را بخوانید و در گروه‌های مورد علاقه‌تان مشارکت کنید. محتوای جامعه جایگزین نظر پزشک نیست.</p>
      </div>
      <div className="community-hero-actions">
        <Button variant="outline" onClick={() => { trackEvent("community_profile_opened", { source: "hero" }); setProfileOpen(true); }}><Settings2 size={17}/> پروفایل جامعه</Button>
        <Button onClick={() => { trackEvent("community_composer_opened", { source: "hero" }); setComposerOpen(true); }} disabled={!activeGroups.length}><CirclePlus size={18}/> پست جدید</Button>
      </div>
    </div>

    {profileMissing && <div className="community-profile-nudge">
      <span><Sparkles size={18}/></span><div><strong>پروفایل جامعه‌تان را بسازید</strong><p>یک نام نمایشی انتخاب کنید؛ هویت واقعی‌تان فقط وقتی خودتان بخواهید نمایش داده می‌شود.</p></div><Button variant="secondary" onClick={() => { trackEvent("community_profile_opened", { source: "nudge" }); setProfileOpen(true); }}>ساخت پروفایل</Button>
    </div>}

    <div className="community-toolbar surface-card">
      <div className="community-tabs">
        <button className={tab === "feed" ? "is-active" : ""} onClick={() => changeTab("feed")}><MessageCircleMore size={16}/> خوراک</button>
        <button className={tab === "groups" ? "is-active" : ""} onClick={() => changeTab("groups")}><UsersRound size={16}/> گروه‌ها</button>
        <button className={tab === "mine" ? "is-active" : ""} onClick={() => changeTab("mine")}><Sparkles size={16}/> گروه‌های من</button>
      </div>
      <div className="community-search"><Search size={17}/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "feed" ? "جست‌وجو در پست‌ها..." : "جست‌وجو در گروه‌ها..."}/></div>
      <div className="community-filters">
        <Filter size={15}/>
        {tab === "feed" ? <>
          <Select value={postType} onChange={(event) => setPostType(event.target.value)}><option value="">همه نوع‌ها</option>{Object.entries(postTypeLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value)}><option value="latest">جدیدترین</option><option value="most_helpful">مفیدترین</option></Select>
        </> : <Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">همه موضوع‌ها</option>{categoriesQuery.data?.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</Select>}
      </div>
    </div>

    {tab === "feed" ? <div className="community-feed">
      {feedQuery.isLoading && <CommunityListSkeleton/>}
      {feedQuery.isError && <CommunityError onRetry={() => feedQuery.refetch()} />}
      {!feedQuery.isLoading && !feedQuery.isError && !feedPosts.length && <CommunityEmpty title="هنوز پستی برای نمایش نیست" description="با عضویت در گروه‌ها، خوراک شما پربارتر می‌شود."/>}
      {feedPosts.map((post) => <PostCard key={post.id} post={post} reactionBusy={reactionMutation.isPending} onOpen={() => openPost(post)} onReact={(type, active) => { trackEvent("community_reaction", { action: active ? "remove" : "add", result_type: type, content_type: post.post_type || "post" }); reactionMutation.mutate({ post, type, active }); }} onReport={() => { trackEvent("community_report_opened", { content_type: "community_post" }); setReportTarget({ entityType: "community_post", entityId: post.id }); }}/>) }
      {feedQuery.hasNextPage && <Button variant="outline" className="community-load-more" disabled={feedQuery.isFetchingNextPage} onClick={() => { trackEvent("community_feed_load_more", { page: feedQuery.data?.pages.length ?? 1 }); feedQuery.fetchNextPage(); }}>{feedQuery.isFetchingNextPage ? "در حال دریافت..." : "نمایش پست‌های بیشتر"}</Button>}
    </div> : <div className="community-groups-grid">
      {groupsQuery.isLoading && <CommunityListSkeleton/>}
      {groupsQuery.isError && <CommunityError onRetry={() => groupsQuery.refetch()} />}
      {!groupsQuery.isLoading && !visibleGroups.length && <CommunityEmpty title={tab === "mine" ? "هنوز عضو گروهی نیستید" : "گروهی پیدا نشد"} description="فیلترها را تغییر دهید یا از گروه‌های رسمی نینیبو شروع کنید."/>}
      {visibleGroups.map((group) => <GroupCard key={group.id} group={group} busy={membershipMutation.isPending} onOpen={() => { trackEvent("community_group_opened", { category: group.category.code }); setSelectedGroup(group); }} onJoin={() => { trackEvent("community_membership_action", { action: "join", category: group.category.code }); membershipMutation.mutate({ group, action: "join" }); }} onLeave={() => { trackEvent("community_membership_action", { action: "leave", category: group.category.code }); membershipMutation.mutate({ group, action: "leave" }); }}/>) }
    </div>}

    {composerOpen && <ComposerModal groups={activeGroups} onClose={() => setComposerOpen(false)} onCreated={async (post) => { trackEvent("community_post_created", { content_type: post.post_type || "post" }); setComposerOpen(false); await queryClient.invalidateQueries({queryKey:["community","feed"]}); await queryClient.invalidateQueries({queryKey:["community","group-posts"]}); setSelectedPost(post); }}/>} 
    {profileOpen && <CommunityProfileModal initial={profileQuery.data} accountProfile={accountProfile} onClose={() => setProfileOpen(false)} onSaved={async () => { setProfileOpen(false); await profileQuery.refetch(); }}/>} 
    {selectedPost && <PostDetail postId={selectedPost.id} onClose={() => setSelectedPost(null)} onReport={(entityType,entityId) => setReportTarget({entityType,entityId})}/>} 
    {reportTarget && <ReportModal target={reportTarget} onClose={() => setReportTarget(null)}/>} 
  </section>;
}

function GroupDetail({ group, onBack, onJoin }: { group: CommunityGroup; onBack: () => void; onJoin: () => void }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{entityType:"community_post"|"community_comment";entityId:number}|null>(null);
  const postsQuery = useQuery({ queryKey: ["community", "group-posts", group.id, page], queryFn: () => clientApi<CommunityPostListResponse>(`/api/ninibu/community/groups/${group.id}/posts?page=${page}&limit=12`) });
  return <section className="community-page">
    <button className="community-back" onClick={onBack}><ArrowRight size={18}/> بازگشت به جامعه</button>
    <div className="community-group-hero surface-card">
      <span className="community-group-avatar large">{group.name.slice(0,1)}</span>
      <div><div className="community-group-title-row"><h1>{group.name}</h1>{group.is_official && <span className="official-badge">رسمی نینیبو</span>}</div><p>{group.description}</p><div className="community-group-meta"><span>{new Intl.NumberFormat("fa-IR").format(group.member_count)} عضو</span><span>{group.category.name}</span><span>{group.visibility === "public" ? "عمومی" : "خصوصی"}</span></div></div>
      <div>{group.membership_status === "active" ? <Button onClick={()=>setComposerOpen(true)}><CirclePlus size={17}/> نوشتن پست</Button> : group.membership_status === "pending" ? <Button variant="secondary" disabled>در انتظار تأیید</Button> : <Button onClick={onJoin}>عضویت در گروه</Button>}</div>
    </div>
    {postsQuery.isLoading && <CommunityListSkeleton/>}
    {postsQuery.isError && <CommunityError onRetry={() => postsQuery.refetch()}/>} 
    {postsQuery.data?.items.map((post) => <PostCard key={post.id} post={post} onOpen={() => setSelectedPost(post)} onReact={() => setSelectedPost(post)} onReport={() => setReportTarget({entityType:"community_post",entityId:post.id})}/>) }
    {postsQuery.data && postsQuery.data.pagination.total_pages > 1 && <div className="community-pagination"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p-1)}>قبلی</Button><span>صفحه {new Intl.NumberFormat("fa-IR").format(page)} از {new Intl.NumberFormat("fa-IR").format(postsQuery.data.pagination.total_pages)}</span><Button variant="outline" disabled={page >= postsQuery.data.pagination.total_pages} onClick={() => setPage((p) => p+1)}>بعدی</Button></div>}
    {composerOpen && <ComposerModal groups={[group]} defaultGroupId={group.id} onClose={()=>setComposerOpen(false)} onCreated={async(post)=>{setComposerOpen(false);await queryClient.invalidateQueries({queryKey:["community","group-posts",group.id]});setSelectedPost(post)}}/>}
    {selectedPost && <PostDetail postId={selectedPost.id} onClose={()=>setSelectedPost(null)} onReport={(entityType,entityId)=>setReportTarget({entityType,entityId})}/>}
    {reportTarget && <ReportModal target={reportTarget} onClose={()=>setReportTarget(null)}/>}
  </section>;
}

function ComposerModal({ groups, defaultGroupId, onClose, onCreated }: { groups: CommunityGroup[]; defaultGroupId?: number; onClose: () => void; onCreated: (post: CommunityPost) => void }) {
  const [groupId, setGroupId] = useState(String(defaultGroupId || groups[0]?.id || ""));
  const [postType, setPostType] = useState<CommunityPostType>("experience");
  const [privacy, setPrivacy] = useState<CommunityPrivacyMode>("identified");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const mutation = useMutation({ mutationFn: () => clientApi<CommunityPost>(`/api/ninibu/community/groups/${groupId}/posts`, { method:"POST", body: JSON.stringify({ post_type: postType, title: title.trim(), body: body.trim(), privacy_mode: privacy }) }), onSuccess: onCreated });
  return <Modal title="پست جدید" onClose={onClose}><div className="community-form">
    <label>گروه<Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</Select></label>
    <div className="grid-two"><label>نوع پست<Select value={postType} onChange={(e) => setPostType(e.target.value as CommunityPostType)}>{Object.entries(postTypeLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</Select></label><label>نحوه نمایش<Select value={privacy} onChange={(e) => setPrivacy(e.target.value as CommunityPrivacyMode)}><option value="identified">با نام نمایشی</option><option value="anonymous">ناشناس</option></Select></label></div>
    <label>عنوان اختیاری<Input maxLength={250} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="یک عنوان کوتاه..."/></label>
    <label>متن<Textarea maxLength={10000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="تجربه یا سؤال‌تان را بنویسید..."/></label>
    <p className="community-safety-note">در جامعه نینیبو تشخیص و تجویز پزشکی انجام نمی‌شود. برای موضوعات پزشکی حساس از بخش مشاوره تخصصی استفاده کنید.</p>
    {mutation.isError && <p className="dialog-error">{mutation.error.message}</p>}
    <Button disabled={!groupId || body.trim().length < 2 || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "در حال انتشار..." : "انتشار پست"}</Button>
  </div></Modal>;
}

function CommunityProfileModal({ initial, accountProfile, onClose, onSaved }: { initial?: CommunityProfile; accountProfile?: Profile; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(initial?.display_name || `${accountProfile?.first_name || ""} ${accountProfile?.last_name || ""}`.trim());
  const [bio, setBio] = useState(initial?.bio || "");
  const [anonymous, setAnonymous] = useState(initial?.is_anonymous_by_default || false);
  const mutation = useMutation({ mutationFn: () => clientApi<CommunityProfile>("/api/ninibu/community/profile", { method:"PUT", body:JSON.stringify({display_name:name.trim(),bio:bio.trim(),is_anonymous_by_default:anonymous}) }), onSuccess:onSaved });
  return <Modal title="پروفایل جامعه" onClose={onClose}><div className="community-form"><label>نام نمایشی<Input value={name} maxLength={100} onChange={(e)=>setName(e.target.value)} placeholder="مثلاً مامان نیلا"/></label><label>درباره من<Textarea value={bio} maxLength={500} onChange={(e)=>setBio(e.target.value)} placeholder="اختیاری"/></label><label className="community-check"><input type="checkbox" checked={anonymous} onChange={(e)=>setAnonymous(e.target.checked)}/><span><strong>به‌صورت پیش‌فرض ناشناس منتشر کن</strong><small>برای هر پست همچنان می‌توانید جداگانه انتخاب کنید.</small></span></label>{mutation.isError && <p className="dialog-error">{mutation.error.message}</p>}<Button disabled={name.trim().length < 2 || mutation.isPending} onClick={()=>mutation.mutate()}>{mutation.isPending ? "در حال ذخیره..." : "ذخیره پروفایل"}</Button></div></Modal>;
}

function ReportModal({ target, onClose }: { target:{entityType:"community_post"|"community_comment";entityId:number}; onClose:()=>void }) {
  const [reason,setReason]=useState<CommunityReportReason>("inappropriate_content"); const [description,setDescription]=useState("");
  const mutation=useMutation({mutationFn:()=>clientApi("/api/ninibu/community/reports",{method:"POST",body:JSON.stringify({entity_type:target.entityType,entity_id:target.entityId,reason,description:description.trim()})}),onSuccess:onClose});
  return <Modal title="گزارش محتوا" onClose={onClose}><div className="community-form"><label>دلیل گزارش<Select value={reason} onChange={(e)=>setReason(e.target.value as CommunityReportReason)}>{reportReasons.map((item)=><option key={item.value} value={item.value}>{item.label}</option>)}</Select></label><label>توضیح اختیاری<Textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="اگر لازم است جزئیات بیشتری بنویسید..."/></label>{mutation.isError&&<p className="dialog-error">{mutation.error.message}</p>}<Button disabled={mutation.isPending} onClick={()=>mutation.mutate()}>{mutation.isPending?"در حال ارسال...":"ارسال گزارش"}</Button></div></Modal>;
}

export function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:ReactNode }) { return <ModalPortal ariaLabel={title} onClose={onClose} backdropClassName="community-modal-backdrop" contentClassName="community-modal"><header><h2>{title}</h2><button onClick={onClose} aria-label="بستن"><X size={19}/></button></header>{children}</ModalPortal>; }
function CommunityListSkeleton(){return <div className="community-list-skeleton"><Skeleton/><Skeleton/><Skeleton/></div>}
function CommunityError({onRetry}:{onRetry:()=>void}){return <div className="community-empty"><strong>دریافت اطلاعات جامعه ناموفق بود</strong><p>اتصال Backend را بررسی کنید و دوباره تلاش کنید.</p><Button variant="outline" onClick={onRetry}>تلاش دوباره</Button></div>}
function CommunityEmpty({title,description}:{title:string;description:string}){return <div className="community-empty"><MessageCircleMore size={30}/><strong>{title}</strong><p>{description}</p></div>}
