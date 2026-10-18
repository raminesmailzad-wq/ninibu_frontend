"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Flag, Globe2, Search, ShieldAlert } from "lucide-react";
import type { AdminCommunityReport, AdminCommunityReportList, AdminCommunityWebCandidate, AdminCommunityWebCandidateList } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { AdminCard, AdminEmpty, AdminError, AdminModal, AdminPageHeader, AdminStatus, formatAdminDate } from "@/components/admin/common";

type Mode = "reports" | "web";

export function AdminCommunityPanel() {
  const [mode, setMode] = useState<Mode>("reports");
  return <div className="admin-page">
    <AdminPageHeader eyebrow="Trust & Safety" title="جامعه، گزارش‌ها و انتشار عمومی" description="رسیدگی به گزارش‌ها مستقل از انتخاب تجربه‌های مناسب برای وب عمومی و SEO انجام می‌شود." />
    <AdminCard className="admin-toolbar admin-community-tabs">
      <Button variant={mode === "reports" ? "default" : "ghost"} onClick={() => setMode("reports")}><Flag size={16}/> گزارش‌ها</Button>
      <Button variant={mode === "web" ? "default" : "ghost"} onClick={() => setMode("web")}><Globe2 size={16}/> انتشار در سایت</Button>
      <div className="admin-toolbar-note"><ShieldAlert size={17}/> انتشار در Community به معنی انتشار عمومی در Google نیست.</div>
    </AdminCard>
    {mode === "reports" ? <ReportsPanel/> : <WebPublicationPanel/>}
  </div>;
}

function ReportsPanel() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("pending");
  const [item, setItem] = useState<AdminCommunityReport>();
  const q = useQuery({ queryKey:["admin","community","reports",status], queryFn:()=>clientApi<AdminCommunityReportList>(`/api/ninibu/admin/community/reports?limit=100${status?`&status=${status}`:""}`) });
  return <>
    <AdminCard className="admin-toolbar"><Select value={status} onChange={e=>setStatus(e.target.value)}><option value="pending">در انتظار بررسی</option><option value="resolved">رسیدگی‌شده</option><option value="dismissed">مختومه</option><option value="">همه</option></Select><div className="admin-toolbar-note"><ShieldAlert size={17}/>اقدام‌های مخرب باید با دلیل ثبت شوند.</div></AdminCard>
    {q.isError?<AdminError message="گزارش‌های جامعه دریافت نشد."/>:null}
    <AdminCard className="admin-table-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>شناسه</th><th>هدف</th><th>علت</th><th>شرح</th><th>وضعیت</th><th>زمان</th><th></th></tr></thead><tbody>{q.data?.items.map(x=><tr key={x.id}><td>#{x.id}{x.is_system_generated?<small>سیستمی</small>:null}</td><td><strong>{x.entity_type}</strong><small>#{x.entity_id}</small></td><td>{x.reason}</td><td>{x.description||"—"}</td><td><AdminStatus value={x.status}/>{x.resolution?<small>{x.resolution}</small>:null}</td><td>{formatAdminDate(x.created_at)}</td><td>{x.status==="pending"?<Button variant="outline" onClick={()=>setItem(x)}><Flag size={15}/> رسیدگی</Button>:null}</td></tr>)}</tbody></table></div>{!q.isLoading&&!q.data?.items.length?<AdminEmpty title="گزارشی در این وضعیت نیست" description="صف Moderation خالی است."/>:null}</AdminCard>
    {item?<Review item={item} onClose={()=>setItem(undefined)} onSaved={()=>{setItem(undefined);void qc.invalidateQueries({queryKey:["admin","community"]})}}/>:null}
  </>;
}

function WebPublicationPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [edit, setEdit] = useState<AdminCommunityWebCandidate>();
  const q = useQuery({ queryKey:["admin","community","web",search], queryFn:()=>clientApi<AdminCommunityWebCandidateList>(`/api/ninibu/admin/community/web-publications/candidates?limit=100${search.trim()?`&search=${encodeURIComponent(search.trim())}`:""}`) });
  const unpublish = useMutation({ mutationFn:(postId:number)=>clientApi(`/api/ninibu/admin/community/posts/${postId}/web-publication`,{method:"DELETE"}), onSuccess:()=>void qc.invalidateQueries({queryKey:["admin","community","web"]}) });
  return <>
    <AdminCard className="admin-toolbar"><div className="admin-publication-search"><Search size={16}/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جست‌وجوی عنوان یا متن پست…"/></div><div className="admin-toolbar-note"><Globe2 size={17}/> فقط پست‌های منتشرشده از گروه عمومی قابل انتخاب‌اند.</div></AdminCard>
    {q.isError?<AdminError message="پست‌های قابل انتشار دریافت نشدند."/>:null}
    <AdminCard className="admin-table-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>پست</th><th>گروه / نویسنده</th><th>ایمنی</th><th>وب عمومی</th><th>زمان</th><th></th></tr></thead><tbody>{q.data?.items.map(x=><tr key={x.post.id}><td><strong>{x.post.title||"بدون عنوان"}</strong><small className="admin-post-preview">{x.post.body}</small></td><td><strong>{x.post.group_name||"—"}</strong><small>{x.post.author.display_name}</small></td><td>{x.post.requires_review?<AdminStatus value="pending"/>:<AdminStatus value="approved"/>}{x.post.review_reason?<small>{x.post.review_reason}</small>:null}</td><td>{x.publication?.is_published?<><AdminStatus value="published"/><small dir="ltr">/{x.publication.slug}</small></>:<AdminStatus value="draft"/>}</td><td>{formatAdminDate(x.post.published_at)}</td><td><div className="admin-row-actions"><Button variant="outline" disabled={x.post.requires_review} onClick={()=>setEdit(x)}>{x.publication?.is_published?"ویرایش SEO":"انتشار در سایت"}</Button>{x.publication?.is_published?<><a className="ui-button ui-button--ghost" href={`/experiences/${x.publication.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={14}/></a><Button variant="ghost" disabled={unpublish.isPending} onClick={()=>unpublish.mutate(x.post.id)}>حذف از وب</Button></>:null}</div></td></tr>)}</tbody></table></div>{!q.isLoading&&!q.data?.items.length?<AdminEmpty title="پستی برای بررسی نیست" description="پست منتشرشده در گروه‌های عمومی هنوز وجود ندارد."/>:null}</AdminCard>
    {edit?<PublishModal item={edit} onClose={()=>setEdit(undefined)} onSaved={()=>{setEdit(undefined);void qc.invalidateQueries({queryKey:["admin","community","web"]})}}/>:null}
  </>;
}

function PublishModal({item,onClose,onSaved}:{item:AdminCommunityWebCandidate;onClose:()=>void;onSaved:()=>void}) {
  const defaultSlug = item.publication?.slug || `parent-experience-${item.post.id}`;
  const defaultExcerpt = item.publication?.excerpt || item.post.body.slice(0,260);
  const [slug,setSlug]=useState(defaultSlug);
  const [excerpt,setExcerpt]=useState(defaultExcerpt);
  const [seoTitle,setSeoTitle]=useState(item.publication?.seo_title || `${item.post.title||"تجربه والدین"} | نینیبو`);
  const [seoDescription,setSeoDescription]=useState(item.publication?.seo_description || defaultExcerpt.slice(0,300));
  const valid = useMemo(()=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())&&excerpt.trim().length>0,[slug,excerpt]);
  const m=useMutation({mutationFn:()=>clientApi(`/api/ninibu/admin/community/posts/${item.post.id}/web-publication`,{method:"PUT",body:JSON.stringify({slug:slug.trim(),excerpt:excerpt.trim(),seo_title:seoTitle.trim(),seo_description:seoDescription.trim()})}),onSuccess:onSaved});
  return <AdminModal title="انتشار تجربه در وب عمومی" description="این تصمیم باعث قابل مشاهده و قابل ایندکس شدن متن در ninibu.com می‌شود." onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={m.isPending||!valid} onClick={()=>m.mutate()}>{m.isPending?"در حال ثبت…":"تأیید و انتشار"}</Button></>}>
    <div className="admin-form-grid"><div className="admin-publication-source"><strong>{item.post.title||"بدون عنوان"}</strong><p>{item.post.body}</p><small>نویسنده: {item.post.author.display_name} · گروه: {item.post.group_name}</small></div><Field label="Slug انگلیسی"><Input dir="ltr" value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/\s+/g,"-"))}/></Field><Field label="خلاصه کارت"><Textarea value={excerpt} maxLength={600} onChange={e=>setExcerpt(e.target.value)}/></Field><Field label="SEO Title"><Input value={seoTitle} maxLength={250} onChange={e=>setSeoTitle(e.target.value)}/></Field><Field label="Meta Description"><Textarea value={seoDescription} maxLength={320} onChange={e=>setSeoDescription(e.target.value)}/></Field>{m.error?<AdminError message={(m.error as Error).message}/>:null}<p className="admin-publication-warning">قبل از انتشار، اطلاعات هویتی، شماره تماس، آدرس یا جزئیات حساس کودک را در متن بررسی کنید. تجربه کاربر نباید به‌عنوان توصیه پزشکی معرفی شود.</p></div>
  </AdminModal>;
}

function Review({item,onClose,onSaved}:{item:AdminCommunityReport;onClose:()=>void;onSaved:()=>void}){const [action,setAction]=useState("dismiss_report");const [resolution,setResolution]=useState("");const m=useMutation({mutationFn:()=>clientApi(`/api/ninibu/admin/community/reports/${item.id}/review`,{method:"POST",body:JSON.stringify({action,resolution})}),onSuccess:onSaved});return <AdminModal title={`رسیدگی به گزارش #${item.id}`} description={`${item.entity_type} #${item.entity_id}`} onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={m.isPending||!resolution.trim()} onClick={()=>m.mutate()}>ثبت اقدام</Button></>}><div className="admin-form-grid"><Field label="اقدام"><Select value={action} onChange={e=>setAction(e.target.value)}><option value="dismiss_report">رد گزارش</option><option value="hide_content">مخفی‌کردن محتوا</option><option value="restore_content">بازگردانی محتوا</option><option value="lock_post">قفل پست</option><option value="warn_user">اخطار به کاربر</option><option value="mute_user">Mute کاربر</option><option value="ban_user">مسدودکردن کاربر</option></Select></Field><Field label="نتیجه و دلیل"><Textarea value={resolution} onChange={e=>setResolution(e.target.value)}/></Field>{m.error?<AdminError message={(m.error as Error).message}/>:null}</div></AdminModal>}
