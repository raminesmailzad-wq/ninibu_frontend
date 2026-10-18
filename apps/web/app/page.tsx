import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowLeft, Baby, BookOpenText, ChartNoAxesCombined, HeartPulse, MessageCircleHeart, ShieldCheck, Sparkles, Stethoscope, UsersRound, Globe2 } from "lucide-react";
import { DownloadButtons, PublicShell } from "@/components/public/public-shell";
import { absoluteUrl, faDate, getPublicArticles, getPublicExperiences, PWA_URL } from "@/lib/public-site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { alternates: { canonical: absoluteUrl("/") } };

const features = [
  { icon: HeartPulse, title: "سلامت کودک", text: "سوابق سلامت، واکسیناسیون، داروها و ویزیت‌ها را یکجا و قابل پیگیری نگه دارید." },
  { icon: ChartNoAxesCombined, title: "پایش رشد", text: "وزن، قد و دور سر را ثبت کنید و روند رشد را در کنار استانداردهای معتبر دنبال کنید." },
  { icon: Baby, title: "سلامت مادر", text: "از بارداری و پس از زایمان تا شیردهی و مراقبت‌های روزمره، مسیر مادر را جداگانه دنبال کنید." },
  { icon: UsersRound, title: "جامعه والدین", text: "در گروه‌های هم‌فکری تجربه‌ها را به اشتراک بگذارید و از تجربه واقعی والدین دیگر استفاده کنید." },
  { icon: Stethoscope, title: "خدمات و مشاوره", text: "به خدمات خانواده و مشاوره‌های مرتبط دسترسی داشته باشید و مسیر دریافت خدمت را ساده‌تر کنید." },
  { icon: Sparkles, title: "راهنمایی هوشمند", text: "محتوا و پیشنهادهای مرتبط با مرحله رشد خانواده را در زمان مناسب پیدا کنید." },
];

export default async function Page() {
  const [articles, experiences] = await Promise.all([getPublicArticles(3), getPublicExperiences(3)]);
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "نینیبو", url: absoluteUrl("/"), logo: absoluteUrl("/brand/ninibu-logo.png") };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: "نینیبو", url: absoluteUrl("/"), inLanguage: "fa-IR" };
  return <PublicShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organization, website]) }}/>
    <section className="public-hero">
      <div className="public-container public-hero-grid">
        <div className="public-hero-copy">
          <span className="public-eyebrow"><Sparkles size={16}/> همراه خانواده، از بارداری تا سال‌های آغازین کودکی</span>
          <h1>والدگری، وقتی اطلاعات و تجربه‌ها <em>کنار هم</em> هستند.</h1>
          <p>نینیبو برای والدینی ساخته شده که می‌خواهند سلامت و رشد کودک، سلامت مادر، محتوای معتبر، تجربه والدین و خدمات موردنیاز خانواده را در یک مسیر ساده و منسجم داشته باشند.</p>
          <DownloadButtons/>
          <div className="public-hero-trust"><span><ShieldCheck size={16}/> حریم خصوصی در طراحی محصول</span><span><Activity size={16}/> پیگیری سلامت و رشد</span><span><MessageCircleHeart size={16}/> تجربه واقعی والدین</span></div>
        </div>
        <div className="public-hero-visual" aria-hidden="true">
          <div className="public-orbit public-orbit-one"/><div className="public-orbit public-orbit-two"/>
          <div className="public-phone-card">
            <div className="public-phone-top"><span>نینیبو</span><b>امروز</b></div>
            <div className="public-phone-welcome"><small>برای خانواده شما</small><strong>هر روز، یک قدم مطمئن‌تر</strong><p>سلامت، رشد و تجربه‌ها در یک نگاه</p></div>
            <div className="public-phone-stats"><span><i/><b>رشد</b><small>روند قابل پیگیری</small></span><span><i/><b>سلامت</b><small>سوابق یکپارچه</small></span></div>
            <div className="public-phone-note"><MessageCircleHeart size={18}/><span><b>جامعه والدین</b><small>تجربه‌ها و گفت‌وگوهای روزمره</small></span></div>
          </div>
          <div className="public-float-card public-float-a"><HeartPulse size={18}/><span><strong>پرونده سلامت</strong><small>همیشه همراه شما</small></span></div>
          <div className="public-float-card public-float-b"><BookOpenText size={18}/><span><strong>محتوای کاربردی</strong><small>متناسب با خانواده</small></span></div>
        </div>
      </div>
    </section>

    <section className="public-section" id="features"><div className="public-container">
      <div className="public-section-head"><div><span>یک همراه، چند نیاز واقعی</span><h2>نینیبو فقط یک پرونده سلامت نیست</h2></div><p>بخش‌های مختلف محصول مستقل‌اند، اما کنار هم تصویری کامل‌تر از مسیر خانواده می‌سازند.</p></div>
      <div className="public-feature-grid">{features.map(({icon:Icon,title,text})=><article key={title} className="public-feature-card"><span><Icon size={22}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </div></section>

    <section className="public-section public-soft-section"><div className="public-container">
      <div className="public-section-head"><div><span>دانش قابل استفاده</span><h2>تازه‌ترین مطالب نینیبو</h2></div><Link href="/articles" className="public-section-link">همه مطالب <ArrowLeft size={16}/></Link></div>
      {articles.items.length ? <div className="public-content-grid">{articles.items.map((item)=><Link href={`/articles/${item.slug}`} className="public-content-card" key={item.id}><span className="public-card-type">{item.content_type === "article" ? "مقاله" : "راهنما"}</span><h3>{item.title}</h3><p>{item.summary || "راهنمایی کاربردی برای مسیر روزمره خانواده."}</p><footer><small>{faDate(item.published_at)}</small><b>مطالعه <ArrowLeft size={14}/></b></footer></Link>)}</div> : <div className="public-empty"><BookOpenText size={26}/><strong>مطالب در حال آماده‌سازی‌اند</strong><p>محتوای منتشرشده از پنل مدیریت به‌صورت خودکار اینجا نمایش داده می‌شود.</p></div>}
    </div></section>

    <section className="public-section"><div className="public-container">
      <div className="public-section-head"><div><span>از زبان والدین</span><h2>تجربه‌هایی که ارزش به‌اشتراک‌گذاری دارند</h2></div><Link href="/experiences" className="public-section-link">همه تجربه‌ها <ArrowLeft size={16}/></Link></div>
      <div className="public-experience-intro"><ShieldCheck size={21}/><p>این بخش فقط تجربه‌هایی را نشان می‌دهد که مدیریت نینیبو به‌صورت جداگانه برای انتشار عمومی تأیید کرده است. انتشار عمومی به معنی تأیید پزشکی محتوای تجربه نیست.</p></div>
      {experiences.items.length ? <div className="public-content-grid">{experiences.items.map((item)=><Link href={`/experiences/${item.slug}`} className="public-content-card experience" key={item.post_id}><span className="public-card-type">تجربه والدین</span><h3>{item.title}</h3><p>{item.excerpt}</p><footer><small>{item.author_name} · {faDate(item.published_at)}</small><b>بخوانید <ArrowLeft size={14}/></b></footer></Link>)}</div> : <div className="public-empty"><MessageCircleHeart size={26}/><strong>اولین تجربه‌های منتخب به‌زودی</strong><p>ادمین می‌تواند از پنل جامعه، پست‌های مناسب را برای نمایش عمومی انتخاب کند.</p></div>}
    </div></section>

    <section className="public-section" id="download"><div className="public-container public-download-panel"><div><span>همین حالا شروع کنید</span><h2>نینیبو را همیشه همراه داشته باشید</h2><p>نسخه وب روی موبایل قابل نصب است و بدون نیاز به فروشگاه، تجربه‌ای نزدیک به اپلیکیشن ارائه می‌دهد.</p><DownloadButtons compact/></div><a href={PWA_URL} className="public-qr-placeholder"><Globe2 size={34}/><strong>app.ninibu.com</strong><small>روی موبایل باز کنید و Add to Home Screen را بزنید</small></a></div></section>
  </PublicShell>;
}
