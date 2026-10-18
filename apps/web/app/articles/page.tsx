import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpenText } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { absoluteUrl, faDate, getPublicArticles } from "@/lib/public-site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مطالب و راهنماهای والدین", description: "مقالات و راهنماهای نینیبو درباره سلامت، رشد و تجربه بهتر خانواده.", alternates: { canonical: absoluteUrl("/articles") } };

export default async function ArticlesPage() {
  const data = await getPublicArticles(60);
  return <PublicShell><section className="public-list-hero"><div className="public-container"><span>دانش نینیبو</span><h1>مطالب و راهنماهای والدین</h1><p>محتوای منتشرشده نینیبو برای تصمیم‌های روزمره خانواده؛ از سلامت و رشد تا تغذیه، مراقبت و تجربه والدگری.</p></div></section><section className="public-section"><div className="public-container">{data.items.length ? <div className="public-content-grid public-content-grid-wide">{data.items.map(item=><Link key={item.id} href={`/articles/${item.slug}`} className="public-content-card"><span className="public-card-type">{item.content_type}</span><h2>{item.title}</h2><p>{item.summary || "راهنمای نینیبو برای والدین"}</p><footer><small>{faDate(item.published_at)}</small><b>مطالعه <ArrowLeft size={14}/></b></footer></Link>)}</div>:<div className="public-empty"><BookOpenText size={30}/><strong>هنوز مطلبی منتشر نشده است</strong></div>}</div></section></PublicShell>;
}
