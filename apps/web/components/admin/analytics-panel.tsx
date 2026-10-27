"use client";
import { useMemo,useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity,Baby,ChartNoAxesColumnIncreasing,HeartPulse,MonitorSmartphone,RefreshCw,Route,ShieldCheck,UsersRound } from "lucide-react";
import type { AdminProductAnalytics } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { AdminCard,AdminError,AdminPageHeader,formatAdminDate } from "@/components/admin/common";
const fa=new Intl.NumberFormat("fa-IR");
const pc=(n:number)=>`${new Intl.NumberFormat("fa-IR",{maximumFractionDigits:1}).format(n)}٪`;
const surfaces:Record<string,string>={web:"وب",pwa:"PWA",android:"اندروید",unknown:"نامشخص"};
const ratio=(v=0,t=0)=>t?`${pc(v/t*100)} از کاربران`:"هنوز داده کافی نیست";
export function AdminAnalyticsPanel(){
 const [days,setDays]=useState(30);
 const q=useQuery({queryKey:["admin","product-analytics",days],queryFn:()=>clientApi<AdminProductAnalytics>(`/api/ninibu/admin/backoffice/analytics/product?days=${days}`)}); const d=q.data;
 const topSections=d?.top_sections ?? [];
 const surfaceItems=d?.surfaces ?? [];
 const dailyActivity=d?.daily_activity ?? [];
 const users=d?.users ?? [];
 const funnel=d?.funnel ?? [];
 const featureAdoption=d?.feature_adoption ?? [];
 const maxDaily=useMemo(()=>Math.max(1,...dailyActivity.map(x=>x.requests)),[dailyActivity]);
 return <div className="admin-page admin-product-page">
  <AdminPageHeader eyebrow="Product Intelligence" title="رفتار کاربران" description="فعال‌شدن کاربران، قابلیت‌های مورد استفاده و مسیر تبدیل؛ بدون نمایش محتوای خصوصی یا جزئیات پزشکی." actions={<div className="admin-period-control"><select value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>۷ روز اخیر</option><option value={30}>۳۰ روز اخیر</option><option value={90}>۹۰ روز اخیر</option></select><button onClick={()=>q.refetch()}><RefreshCw size={16}/></button></div>}/>
  {q.isError&&<AdminError message="دریافت گزارش رفتار کاربران ناموفق بود."/>}
  <section className="admin-product-summary">
   <Metric icon={UsersRound} label="کل کاربران واقعی" value={d?.summary.total_users} hint={`${fa.format(d?.summary.new_users??0)} ثبت‌نام جدید`}/>
   <Metric icon={Activity} label="فعال در ۷ روز" value={d?.summary.active_7d} hint={`${fa.format(d?.summary.active_1d??0)} نفر امروز`}/>
   <Metric icon={Baby} label="کودک اضافه کرده‌اند" value={d?.summary.users_with_child} hint={ratio(d?.summary.users_with_child,d?.summary.total_users)}/>
   <Metric icon={HeartPulse} label="داده سلامت دارند" value={d?.summary.users_with_health_data} hint={ratio(d?.summary.users_with_health_data,d?.summary.total_users)}/>
   <Metric icon={RefreshCw} label="برگشته‌اند" value={d?.summary.returning_users} hint="فعالیت در روزی دیگر"/>
   <Metric icon={MonitorSmartphone} label="فعال در ۳۰ روز" value={d?.summary.active_30d} hint={d?.tracking_since?`ردیابی از ${formatAdminDate(d.tracking_since)}`:"ردیابی مسیر از این نسخه"}/>
  </section>
  <section className="admin-product-grid admin-product-grid-main">
   <AdminCard><Title icon={Route} title="قیف فعال‌سازی" desc="ثبت‌نام تا بازگشت دوباره"/><div className="admin-funnel">{funnel.map(x=><div key={x.key}><div><strong>{x.label}</strong><span>{fa.format(x.count)} نفر</span></div><div className="admin-progress"><i style={{width:`${Math.min(100,x.percent)}%`}}/></div><small>{pc(x.percent)}</small></div>)}</div></AdminCard>
   <AdminCard><Title icon={ChartNoAxesColumnIncreasing} title="استفاده واقعی از قابلیت‌ها" desc="از داده‌های موجود سیستم، حتی قبل از این نسخه"/><div className="admin-adoption-list">{featureAdoption.map(x=><div key={x.key}><span><b>{x.label}</b><small>{fa.format(x.records)} رکورد</small></span><strong>{fa.format(x.users)} کاربر</strong><div className="admin-progress"><i style={{width:`${Math.min(100,x.percent)}%`}}/></div></div>)}</div></AdminCard>
  </section>
  <section className="admin-product-grid admin-product-grid-secondary">
   <AdminCard><Title icon={Route} title="بخش‌های پرکاربرد" desc="درخواست‌های واقعی اپ، PWA و وب"/>{topSections.length?<div className="admin-ranked-list">{topSections.map((x,i)=><div key={x.section}><em>{fa.format(i+1)}</em><span><b>{x.label||x.section}</b><small>{fa.format(x.users)} کاربر</small></span><strong>{pc(x.share)}</strong></div>)}</div>:<Empty/>}</AdminCard>
   <AdminCard><Title icon={MonitorSmartphone} title="محل استفاده" desc="Web / PWA / Android"/>{surfaceItems.length?<div className="admin-surface-list">{surfaceItems.map(x=><div key={x.surface}><span><i className={`surface-dot ${x.surface}`}/><b>{x.label||surfaces[x.surface]||x.surface}</b></span><strong>{fa.format(x.users)} کاربر</strong><small>{pc(x.share)} از درخواست‌ها</small></div>)}</div>:<Empty/>}</AdminCard>
   <AdminCard><Title icon={Activity} title="روند فعالیت" desc="تعداد درخواست‌های محصول در روز"/>{dailyActivity.length?<div className="admin-mini-chart">{dailyActivity.map(x=><div key={x.date}><i style={{height:`${Math.max(8,x.requests/maxDaily*100)}%`}}/><span>{new Intl.DateTimeFormat("fa-IR-u-ca-persian",{month:"numeric",day:"numeric"}).format(new Date(`${x.date}T12:00:00Z`))}</span></div>)}</div>:<Empty/>}</AdminCard>
  </section>
  <AdminCard className="admin-user-activity-card"><Title icon={UsersRound} title="وضعیت کاربران" desc="سیگنال محصول و تعداد رکوردها؛ بدون محتوای پرونده"/><div className="admin-user-activity-table-wrap"><table className="admin-user-activity-table"><thead><tr><th>کاربر</th><th>عضویت</th><th>آخرین فعالیت</th><th>کودک</th><th>داده سلامت</th><th>بخش غالب</th><th>Surface</th><th>وضعیت</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><strong>{[u.first_name,u.last_name].filter(Boolean).join(" ")||`کاربر ${u.id}`}</strong><small>{u.mobile}</small></td><td>{formatAdminDate(u.created_at)}</td><td>{formatAdminDate(u.last_activity_at||u.last_login_at||u.created_at)}</td><td>{fa.format(u.child_count)}</td><td>{fa.format(u.health_data_count)}</td><td>{u.top_section_label||(u.request_count?"سایر":"هنوز داده‌ای نیست")}</td><td><div className="admin-surface-chips">{u.surfaces.length?u.surfaces.map(s=><span key={s}>{surfaces[s]||s}</span>):<span>—</span>}</div></td><td><span className={`admin-activity-status ${u.activity_status}`}>{u.activity_status==="active"?"فعال":u.activity_status==="new"?"جدید":"کم‌فعال"}</span></td></tr>)}</tbody></table></div></AdminCard>
  {d?.privacy_note&&<div className="admin-privacy-note"><ShieldCheck size={18}/><span>{d.privacy_note}</span></div>}
 </div>
}
function Metric({icon:Icon,label,value,hint}:{icon:typeof Activity;label:string;value?:number;hint:string}){return <AdminCard className="admin-product-metric"><span><Icon size={19}/></span><div><small>{label}</small><strong>{value==null?"—":fa.format(value)}</strong><p>{hint}</p></div></AdminCard>}
function Title({icon:Icon,title,desc}:{icon:typeof Activity;title:string;desc:string}){return <div className="admin-card-title admin-product-card-title"><span><Icon size={18}/></span><div><h2>{title}</h2><p>{desc}</p></div></div>}
function Empty(){return <div className="admin-tracking-empty"><Activity size={20}/><span>از انتشار این نسخه، داده این بخش شروع به جمع‌شدن می‌کند.</span></div>}
