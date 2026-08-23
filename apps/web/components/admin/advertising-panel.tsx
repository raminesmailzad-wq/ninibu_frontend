"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, CirclePause, Megaphone, Plus, ShieldCheck, XCircle } from "lucide-react";
import type { AdminAdCampaign, AdminAdReport, AdminAdvertiser, AdminList } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JalaliDateInput } from "@/components/ui/jalali-date-input";
import { AdminCard, AdminEmpty, AdminError, AdminModal, AdminPageHeader, AdminStatus, formatAdminDate } from "@/components/admin/common";

export function AdminAdvertisingPanel() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"campaigns"|"advertisers"|"reports">("campaigns");
  const [advertiserOpen, setAdvertiserOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [creativeFor, setCreativeFor] = useState<AdminAdCampaign>();
  const [rejectFor, setRejectFor] = useState<AdminAdCampaign>();
  const [reason, setReason] = useState("");
  const advertisers = useQuery({ queryKey: ["admin","ads","advertisers"], queryFn: () => clientApi<AdminList<AdminAdvertiser>>("/api/ninibu/admin/advertising/advertisers?limit=100") });
  const campaigns = useQuery({ queryKey: ["admin","ads","campaigns"], queryFn: () => clientApi<AdminList<AdminAdCampaign>>("/api/ninibu/admin/advertising/campaigns?limit=100") });
  const reports = useQuery({ queryKey: ["admin","ads","reports"], queryFn: () => clientApi<AdminAdReport[]>("/api/ninibu/admin/advertising/reports") });
  const invalidate = () => { void qc.invalidateQueries({ queryKey: ["admin","ads"] }); };
  const campaignAction = useMutation({ mutationFn: ({id, kind}: {id:number;kind:"approve"|"pause"}) => clientApi(`/api/ninibu/admin/advertising/campaigns/${id}/${kind}`, { method:"POST", body:"{}" }), onSuccess: invalidate });
  const reject = useMutation({ mutationFn: () => clientApi(`/api/ninibu/admin/advertising/campaigns/${rejectFor!.id}/reject`, { method:"POST", body: JSON.stringify({reason}) }), onSuccess: () => { setRejectFor(undefined); setReason(""); invalidate(); } });
  const advertiserStatus = useMutation({ mutationFn: ({id,status}:{id:number;status:string}) => clientApi(`/api/ninibu/admin/advertising/advertisers/${id}`, { method:"PATCH", body: JSON.stringify({status}) }), onSuccess: invalidate });
  const error = (advertisers.error || campaigns.error || reports.error || campaignAction.error || reject.error || advertiserStatus.error) as Error | null;
  return <div className="admin-page">
    <AdminPageHeader eyebrow="Advertising Operations" title="مدیریت تبلیغات" description="تبلیغ‌دهنده، کمپین، خلاقه و عملکرد تبلیغات. داده‌های حساس سلامت برای هدف‌گیری تبلیغاتی در این پنل در دسترس نیست." actions={<div className="admin-page-button-group"><Button variant="outline" onClick={() => setAdvertiserOpen(true)}><Plus size={17}/> تبلیغ‌دهنده</Button><Button onClick={() => setCampaignOpen(true)}><Plus size={17}/> کمپین</Button></div>} />
    <div className="admin-tabs"><button className={tab==="campaigns"?"active":""} onClick={() => setTab("campaigns")}>کمپین‌ها</button><button className={tab==="advertisers"?"active":""} onClick={() => setTab("advertisers")}>تبلیغ‌دهندگان</button><button className={tab==="reports"?"active":""} onClick={() => setTab("reports")}>گزارش عملکرد</button></div>
    {error ? <AdminError message={error.message}/> : null}
    {tab === "campaigns" ? <CampaignTable items={campaigns.data?.items ?? []} onCreative={setCreativeFor} onApprove={(id) => campaignAction.mutate({id,kind:"approve"})} onPause={(id) => campaignAction.mutate({id,kind:"pause"})} onReject={setRejectFor}/> : null}
    {tab === "advertisers" ? <AdminCard className="admin-table-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>تبلیغ‌دهنده</th><th>تماس</th><th>وب‌سایت</th><th>وضعیت</th><th>ایجاد</th></tr></thead><tbody>{advertisers.data?.items.map(x => <tr key={x.id}><td><strong>{x.name}</strong><small>{x.legal_name || "—"}</small></td><td>{x.contact_name}<small dir="ltr">{x.contact_mobile}</small></td><td dir="ltr">{x.website_url || "—"}</td><td><AdminStatus value={x.status}/><div className="admin-row-actions"><Button variant="ghost" onClick={() => advertiserStatus.mutate({id:x.id,status:"verified"})}>تأیید</Button><Button variant="ghost" onClick={() => advertiserStatus.mutate({id:x.id,status:"suspended"})}>تعلیق</Button></div></td><td>{formatAdminDate(x.created_at)}</td></tr>)}</tbody></table></div>{!advertisers.isLoading && !advertisers.data?.items.length ? <AdminEmpty title="تبلیغ‌دهنده‌ای ثبت نشده" description="برای ساخت کمپین ابتدا تبلیغ‌دهنده را ثبت کنید."/> : null}</AdminCard> : null}
    {tab === "reports" ? <Reports items={reports.data ?? []}/> : null}
    {advertiserOpen ? <AdvertiserModal onClose={() => setAdvertiserOpen(false)} onSaved={() => { setAdvertiserOpen(false); invalidate(); }}/> : null}
    {campaignOpen ? <CampaignModal advertisers={advertisers.data?.items ?? []} onClose={() => setCampaignOpen(false)} onSaved={() => { setCampaignOpen(false); invalidate(); }}/> : null}
    {creativeFor ? <CreativeModal campaign={creativeFor} onClose={() => setCreativeFor(undefined)} onSaved={() => { setCreativeFor(undefined); invalidate(); }}/> : null}
    {rejectFor ? <AdminModal title="رد کمپین" description={rejectFor.name} onClose={() => setRejectFor(undefined)} footer={<><Button variant="outline" onClick={() => setRejectFor(undefined)}>انصراف</Button><Button disabled={reason.trim().length < 5 || reject.isPending} onClick={() => reject.mutate()}>ثبت رد کمپین</Button></>}><Field label="دلیل رد"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="حداقل ۵ کاراکتر"/></Field></AdminModal> : null}
  </div>;
}

function CampaignTable({ items, onCreative, onApprove, onPause, onReject }: { items: AdminAdCampaign[]; onCreative:(x:AdminAdCampaign)=>void; onApprove:(id:number)=>void; onPause:(id:number)=>void; onReject:(x:AdminAdCampaign)=>void }) { return <AdminCard className="admin-table-card"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>کمپین</th><th>تبلیغ‌دهنده</th><th>هدف</th><th>زمان</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{items.map(x => <tr key={x.id}><td><strong>{x.name}</strong><small>Priority {x.priority} · cap {x.frequency_cap_per_user}</small></td><td>{x.advertiser_name}</td><td>{objectiveLabel(x.objective)}</td><td>{formatAdminDate(x.starts_at)}<small>تا {formatAdminDate(x.ends_at)}</small></td><td><AdminStatus value={x.status}/>{x.rejection_reason ? <small>{x.rejection_reason}</small> : null}</td><td><div className="admin-row-actions"><Button variant="outline" onClick={() => onCreative(x)}><Megaphone size={15}/> خلاقه</Button><Button onClick={() => onApprove(x.id)}><ShieldCheck size={15}/> تأیید</Button><Button variant="ghost" onClick={() => onPause(x.id)}><CirclePause size={15}/> توقف</Button><Button variant="ghost" onClick={() => onReject(x)}><XCircle size={15}/></Button></div></td></tr>)}</tbody></table></div>{!items.length ? <AdminEmpty title="کمپینی وجود ندارد" description="یک کمپین جدید برای تبلیغ‌دهنده ثبت کنید."/> : null}</AdminCard>; }
function Reports({items}:{items:AdminAdReport[]}) { return <section className="admin-report-grid">{items.map(x => <AdminCard key={x.campaign_id} className="admin-report-card"><div><BarChart3 size={20}/><strong>{x.campaign_name}</strong></div><dl><div><dt>Impression</dt><dd>{n(x.impressions)}</dd></div><div><dt>Click</dt><dd>{n(x.clicks)}</dd></div><div><dt>CTR</dt><dd>{new Intl.NumberFormat("fa-IR",{maximumFractionDigits:2}).format(x.ctr)}٪</dd></div><div><dt>Conversion</dt><dd>{n(x.conversions)}</dd></div></dl></AdminCard>)}{!items.length ? <AdminCard><AdminEmpty title="داده عملکردی نداریم" description="پس از شروع نمایش کمپین، گزارش اینجا ظاهر می‌شود."/></AdminCard> : null}</section>; }
function AdvertiserModal({onClose,onSaved}:{onClose:()=>void;onSaved:()=>void}) { const [f,setF]=useState({name:"",legal_name:"",contact_name:"",contact_mobile:"",contact_email:"",website_url:"",notes:""}); const m=useMutation({mutationFn:()=>clientApi("/api/ninibu/admin/advertising/advertisers",{method:"POST",body:JSON.stringify(f)}),onSuccess:onSaved}); return <AdminModal title="تبلیغ‌دهنده جدید" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={m.isPending||!f.name||!f.contact_name||!f.contact_mobile} onClick={()=>m.mutate()}>ثبت</Button></>}><div className="admin-form-grid"><Field label="نام برند"><Input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></Field><Field label="نام حقوقی"><Input value={f.legal_name} onChange={e=>setF({...f,legal_name:e.target.value})}/></Field><Field label="نام رابط"><Input value={f.contact_name} onChange={e=>setF({...f,contact_name:e.target.value})}/></Field><Field label="موبایل"><Input dir="ltr" value={f.contact_mobile} onChange={e=>setF({...f,contact_mobile:e.target.value})}/></Field><Field label="ایمیل"><Input dir="ltr" value={f.contact_email} onChange={e=>setF({...f,contact_email:e.target.value})}/></Field><Field label="وب‌سایت"><Input dir="ltr" value={f.website_url} onChange={e=>setF({...f,website_url:e.target.value})}/></Field><Field label="یادداشت"><Textarea value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/></Field>{m.error?<AdminError message={(m.error as Error).message}/>:null}</div></AdminModal>; }
function CampaignModal({ advertisers, onClose, onSaved }: { advertisers: AdminAdvertiser[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    advertiser_id: String(advertisers[0]?.id ?? ""),
    name: "",
    objective: "awareness",
    starts_date: "",
    starts_time: "09:00",
    ends_date: "",
    ends_time: "21:00",
    priority: "50",
    frequency_cap_per_user: "3",
    targeting: "{}",
  });
  const body = useMemo(() => {
    try {
      const startsAt = combineDateTime(f.starts_date, f.starts_time);
      const endsAt = combineDateTime(f.ends_date, f.ends_time);
      if (!startsAt || !endsAt) return null;
      return {
        advertiser_id: Number(f.advertiser_id),
        name: f.name,
        objective: f.objective,
        starts_at: startsAt,
        ends_at: endsAt,
        priority: Number(f.priority),
        frequency_cap_per_user: Number(f.frequency_cap_per_user),
        targeting_rules: JSON.parse(f.targeting),
      };
    } catch {
      return null;
    }
  }, [f]);
  const m = useMutation({ mutationFn: () => clientApi("/api/ninibu/admin/advertising/campaigns", { method: "POST", body: JSON.stringify(body) }), onSuccess: onSaved });
  return <AdminModal title="کمپین جدید" description="هدف‌گیری فقط با داده‌های غیرحساس و قواعد مجاز انجام شود." onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={m.isPending || !body || !f.name || !f.starts_date || !f.ends_date} onClick={() => m.mutate()}>ساخت کمپین</Button></>}>
    <div className="admin-form-grid">
      <Field label="تبلیغ‌دهنده"><Select value={f.advertiser_id} onChange={e => setF({ ...f, advertiser_id: e.target.value })}>{advertisers.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
      <Field label="نام کمپین"><Input value={f.name} onChange={e => setF({ ...f, name: e.target.value })}/></Field>
      <Field label="هدف"><Select value={f.objective} onChange={e => setF({ ...f, objective: e.target.value })}><option value="awareness">Awareness</option><option value="website_visit">Website Visit</option><option value="app_page_visit">App Page Visit</option><option value="content_engagement">Content Engagement</option><option value="lead_generation">Lead Generation</option></Select></Field>
      <Field label="اولویت ۱ تا ۱۰۰"><Input type="number" min="1" max="100" value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}/></Field>
      <Field label="تاریخ شروع (جلالی)"><JalaliDateInput required value={f.starts_date} onChange={starts_date => setF({ ...f, starts_date })}/></Field>
      <Field label="ساعت شروع"><Input type="time" value={f.starts_time} onChange={e => setF({ ...f, starts_time: e.target.value })}/></Field>
      <Field label="تاریخ پایان (جلالی)"><JalaliDateInput required value={f.ends_date} min={f.starts_date || undefined} onChange={ends_date => setF({ ...f, ends_date })}/></Field>
      <Field label="ساعت پایان"><Input type="time" value={f.ends_time} onChange={e => setF({ ...f, ends_time: e.target.value })}/></Field>
      <Field label="Frequency cap"><Input type="number" min="1" max="100" value={f.frequency_cap_per_user} onChange={e => setF({ ...f, frequency_cap_per_user: e.target.value })}/></Field>
      <Field label="Targeting rules (JSON)" hint="داده پزشکی/رشد/تشخیص وارد نشود"><Textarea dir="ltr" value={f.targeting} onChange={e => setF({ ...f, targeting: e.target.value })}/></Field>
      {m.error ? <AdminError message={(m.error as Error).message}/> : null}
    </div>
  </AdminModal>;
}

function combineDateTime(date: string, time: string) {
  if (!date || !time) return "";
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function CreativeModal({campaign,onClose,onSaved}:{campaign:AdminAdCampaign;onClose:()=>void;onSaved:()=>void}) { const [f,setF]=useState({creative_type:"native_card",title:"",body:"",call_to_action:"مشاهده",destination_type:"none",destination_url:"",internal_path:""}); const m=useMutation({mutationFn:()=>clientApi(`/api/ninibu/admin/advertising/campaigns/${campaign.id}/creatives`,{method:"POST",body:JSON.stringify(f)}),onSuccess:onSaved}); return <AdminModal title="خلاقه تبلیغاتی" description={campaign.name} onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={m.isPending||f.title.length<2||f.body.length<2} onClick={()=>m.mutate()}>ثبت خلاقه</Button></>}><div className="admin-form-grid"><Field label="نوع"><Select value={f.creative_type} onChange={e=>setF({...f,creative_type:e.target.value})}><option value="native_card">Native card</option><option value="text">Text</option><option value="announcement">Announcement</option></Select></Field><Field label="عنوان"><Input value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></Field><Field label="متن"><Textarea value={f.body} onChange={e=>setF({...f,body:e.target.value})}/></Field><Field label="CTA"><Input value={f.call_to_action} onChange={e=>setF({...f,call_to_action:e.target.value})}/></Field><Field label="مقصد"><Select value={f.destination_type} onChange={e=>setF({...f,destination_type:e.target.value})}><option value="none">بدون مقصد</option><option value="external_url">URL خارجی</option><option value="internal_content">محتوای داخلی</option><option value="community_group">گروه</option><option value="consultation_category">مشاوره</option></Select></Field>{f.destination_type==="external_url"?<Field label="URL"><Input dir="ltr" value={f.destination_url} onChange={e=>setF({...f,destination_url:e.target.value})}/></Field>:f.destination_type!=="none"?<Field label="مسیر داخلی"><Input dir="ltr" placeholder="/content/..." value={f.internal_path} onChange={e=>setF({...f,internal_path:e.target.value})}/></Field>:null}{m.error?<AdminError message={(m.error as Error).message}/>:null}</div></AdminModal>; }
function objectiveLabel(v:string){return ({awareness:"آگاهی",website_visit:"بازدید وب",app_page_visit:"بازدید صفحه",content_engagement:"تعامل محتوا",lead_generation:"Lead"} as Record<string,string>)[v]??v} function n(v:number){return new Intl.NumberFormat("fa-IR").format(v)}
