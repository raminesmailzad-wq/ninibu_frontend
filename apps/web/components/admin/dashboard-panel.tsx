"use client";
import { useQuery } from "@tanstack/react-query";
import { Activity,Baby,BookOpenText,CircleDollarSign,HeartHandshake,HeartPulse,Megaphone,MessageSquareText,ShieldCheck,Store,UsersRound } from "lucide-react";
import type { AdminDashboard,AdminFinanceSummary,AdminProductAnalytics } from "@ninibu/types";
import { clientApi } from "@/lib/client-api";
import { AdminCard,AdminError,AdminPageHeader,formatMoney } from "@/components/admin/common";
type NavKey="analytics"|"content"|"advertising"|"providers"|"community"|"users"|"finance"|"system";
const fa=new Intl.NumberFormat("fa-IR");
const quick:Array<{key:NavKey;title:string;desc:string;icon:typeof Store}>=[
 {key:"analytics",title:"رفتار کاربران",desc:"قیف، مسیرها و قابلیت‌های پرکاربرد",icon:Activity},
 {key:"providers",title:"ارائه‌دهندگان",desc:"پزشک، مشاور، مدرس و فروشنده",icon:HeartHandshake},
 {key:"content",title:"محتوا",desc:"تدوین، بازبینی و انتشار",icon:BookOpenText},
 {key:"advertising",title:"تبلیغات",desc:"کمپین، خلاقه و گزارش",icon:Megaphone},
 {key:"community",title:"جامعه",desc:"گزارش‌ها و Moderation",icon:MessageSquareText},
 {key:"users",title:"کاربران و نقش‌ها",desc:"وضعیت حساب و دسترسی",icon:UsersRound},
];
export function AdminDashboardPanel({onNavigate}:{onNavigate:(key:NavKey)=>void}){
 const dashboard=useQuery({queryKey:["admin","dashboard"],queryFn:()=>clientApi<AdminDashboard>("/api/ninibu/admin/backoffice/dashboard")});
 const analytics=useQuery({queryKey:["admin","product-analytics",30],queryFn:()=>clientApi<AdminProductAnalytics>("/api/ninibu/admin/backoffice/analytics/product?days=30")});
 const finance=useQuery({queryKey:["admin","finance","summary"],queryFn:()=>clientApi<AdminFinanceSummary>("/api/ninibu/admin/backoffice/finance")});
 const a=analytics.data?.summary, cur=finance.data?.currencies[0];
 return <div className="admin-page admin-dashboard-v2">
  <AdminPageHeader eyebrow="Control Center" title="مرکز مدیریت نینیبو" description="تصویر سریع از سلامت محصول و عملیات؛ برای جزئیات وارد رفتار کاربران شوید." actions={<button className="admin-primary-link" onClick={()=>onNavigate("analytics")}><Activity size={16}/> رفتار کاربران</button>}/>
  {(dashboard.isError||analytics.isError)&&<AdminError message="بخشی از اطلاعات مدیریتی دریافت نشد."/>}
  <section className="admin-product-summary admin-dashboard-summary">
   <Summary icon={UsersRound} label="کاربران" value={a?.total_users??dashboard.data?.counts.users} sub={`${fa.format(a?.active_7d??0)} فعال در ۷ روز`}/>
   <Summary icon={Activity} label="فعال امروز" value={a?.active_1d} sub={`${fa.format(a?.new_users??0)} ثبت‌نام جدید`}/>
   <Summary icon={Baby} label="کاربر دارای کودک" value={a?.users_with_child} sub={`${fa.format(dashboard.data?.counts.children??0)} پروفایل کودک`}/>
   <Summary icon={HeartPulse} label="وارد جریان سلامت" value={a?.users_with_health_data} sub="حداقل یک داده سلامت"/>
   <Summary icon={MessageSquareText} label="پست جامعه" value={dashboard.data?.counts.community_posts} sub="تعامل اجتماعی"/>
   <Summary icon={BookOpenText} label="محتوای منتشرشده" value={dashboard.data?.counts.published_content} sub="کتابخانه عمومی"/>
  </section>
  <section className="admin-dashboard-insights">
   <AdminCard className="admin-dashboard-funnel"><div className="admin-card-title"><Activity size={19}/><div><h2>فعال‌سازی کاربران</h2><p>کجای مسیر کاربر ریزش داریم؟</p></div></div><div className="admin-dashboard-funnel-steps">{analytics.data?.funnel.map(x=><div key={x.key}><strong>{fa.format(x.count)}</strong><span>{x.label}</span><i style={{width:`${Math.min(100,x.percent)}%`}}/></div>)}</div><button onClick={()=>onNavigate("analytics")}>تحلیل کامل رفتار</button></AdminCard>
   <AdminCard className="admin-dashboard-top-features"><div className="admin-card-title"><HeartPulse size={19}/><div><h2>چیزهایی که واقعاً استفاده شده</h2><p>بر اساس رکوردهای موجود سیستم</p></div></div><div>{analytics.data?.feature_adoption.slice().sort((x,y)=>y.users-x.users).slice(0,5).map(x=><span key={x.key}><b>{x.label}</b><strong>{fa.format(x.users)} کاربر</strong></span>)}</div></AdminCard>
  </section>
  {cur&&<AdminCard className="admin-finance-highlight"><div><CircleDollarSign size={24}/><div><small>کمیسیون ثبت‌شده نینیبو</small><strong>{formatMoney(cur.commission_amount,cur.currency)}</strong></div></div><div><small>فروش پرداخت‌شده</small><b>{formatMoney(cur.paid_gross_amount,cur.currency)}</b></div><button onClick={()=>onNavigate("finance")}>جزئیات مالی</button></AdminCard>}
  <div className="admin-section-heading"><div><ShieldCheck size={20}/><div><h2>عملیات اصلی</h2><p>دسترسی سریع به بخش‌های مدیریتی</p></div></div></div>
  <section className="admin-quick-grid">{quick.map(({key,title,desc,icon:Icon})=><button className="admin-quick-card" key={key} onClick={()=>onNavigate(key)}><span><Icon size={22}/></span><div><strong>{title}</strong><p>{desc}</p></div></button>)}</section>
  {(analytics.data?.privacy_note||dashboard.data?.privacy_note)&&<div className="admin-privacy-note"><ShieldCheck size={18}/><span>{analytics.data?.privacy_note||dashboard.data?.privacy_note}</span></div>}
 </div>
}
function Summary({icon:Icon,label,value,sub}:{icon:typeof Activity;label:string;value?:number;sub:string}){return <AdminCard className="admin-product-metric admin-dashboard-metric"><span><Icon size={19}/></span><div><small>{label}</small><strong>{value==null?"—":fa.format(value)}</strong><p>{sub}</p></div></AdminCard>}
