import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, Globe2, HeartHandshake, Smartphone } from "lucide-react";
import { CAFEBAZAAR_URL, PWA_URL } from "@/lib/public-site";

export function PublicHeader() {
  return <header className="public-header">
    <div className="public-container public-header-inner">
      <Link href="/" className="public-brand" aria-label="صفحه اصلی نینیبو">
        <Image src="/brand/ninibu-header.jpg" alt="نینیبو" width={880} height={910} priority />
      </Link>
      <nav className="public-nav" aria-label="ناوبری سایت">
        <Link href="/#features">امکانات</Link>
        <Link href="/articles">مطالب</Link>
        <Link href="/experiences">تجربه والدین</Link>
        <Link href="/#download">دانلود</Link>
      </nav>
      <a className="public-header-cta" href={PWA_URL}>ورود به نینیبو <ArrowLeft size={16}/></a>
    </div>
  </header>;
}

export function DownloadButtons({ compact = false }: { compact?: boolean }) {
  return <div className={`public-download-buttons${compact ? " is-compact" : ""}`}>
    <a href={PWA_URL} className="public-download primary">
      <Globe2 size={20}/><span><small>بدون نصب از مرورگر</small><strong>نسخه وب نینیبو</strong></span>
    </a>
    {CAFEBAZAAR_URL ? <a href={CAFEBAZAAR_URL} className="public-download secondary" rel="noopener noreferrer">
      <Download size={20}/><span><small>نسخه اندروید</small><strong>دانلود از کافه‌بازار</strong></span>
    </a> : <span className="public-download secondary is-disabled" aria-label="لینک کافه‌بازار به زودی">
      <Smartphone size={20}/><span><small>نسخه اندروید</small><strong>لینک بازار به‌زودی</strong></span>
    </span>}
  </div>;
}

export function PublicFooter() {
  return <footer className="public-footer">
    <div className="public-container public-footer-grid">
      <div className="public-footer-brand">
        <Image src="/brand/ninibu-logo.png" alt="نینیبو" width={512} height={512}/>
        <p>همراه هوشمند والدین؛ از بارداری تا سال‌های آغازین رشد کودک، برای سلامت، رشد، تجربه و تصمیم‌های روزمره خانواده.</p>
      </div>
      <div><strong>نینیبو</strong><Link href="/#features">امکانات</Link><Link href="/articles">مطالب</Link><Link href="/experiences">تجربه والدین</Link></div>
      <div><strong>دسترسی</strong><a href={PWA_URL}>نسخه وب</a><Link href="/dashboard">پنل وب</Link><Link href="/admin">مدیریت</Link></div>
      <div className="public-footer-trust"><HeartHandshake size={24}/><strong>تجربه والدین با بررسی تحریریه</strong><p>محتوای عمومی کاربران فقط پس از تأیید جداگانه مدیریت در سایت نمایش داده می‌شود.</p></div>
    </div>
    <div className="public-container public-footer-bottom"><span>© {new Date().getFullYear()} نینیبو</span><span>مطالب سلامت جایگزین تشخیص یا درمان پزشکی نیست.</span></div>
  </footer>;
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return <div className="public-site"><PublicHeader/><main>{children}</main><PublicFooter/></div>;
}
