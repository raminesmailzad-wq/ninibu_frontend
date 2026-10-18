import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircleHeart, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { absoluteUrl, faDate, getPublicExperiences } from "@/lib/public-site";

export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"تجربه والدین",description:"تجربه‌های منتخب والدین نینیبو که پس از بررسی تحریریه برای نمایش عمومی منتشر شده‌اند.",alternates:{canonical:absoluteUrl("/experiences")}};
export default async function ExperiencesPage(){const data=await getPublicExperiences(60);return <PublicShell><section className="public-list-hero experience"><div className="public-container"><span>جامعه نینیبو</span><h1>تجربه والدین</h1><p>روایت‌های واقعی از مسیر والدگری؛ تجربه‌هایی که برای انتشار عمومی توسط مدیریت نینیبو انتخاب شده‌اند.</p><div className="public-experience-note"><ShieldCheck size={18}/> این تجربه‌ها توصیه پزشکی محسوب نمی‌شوند و انتشارشان به معنی تأیید علمی تمام جزئیات نیست.</div></div></section><section className="public-section"><div className="public-container">{data.items.length?<div className="public-content-grid public-content-grid-wide">{data.items.map(x=><Link key={x.post_id} href={`/experiences/${x.slug}`} className="public-content-card experience"><span className="public-card-type">{x.group_name||"تجربه والدین"}</span><h2>{x.title}</h2><p>{x.excerpt}</p><footer><small>{x.author_name} · {faDate(x.published_at)}</small><b>بخوانید <ArrowLeft size={14}/></b></footer></Link>)}</div>:<div className="public-empty"><MessageCircleHeart size={30}/><strong>هنوز تجربه‌ای برای وب عمومی تأیید نشده است</strong></div>}</div></section></PublicShell>}
