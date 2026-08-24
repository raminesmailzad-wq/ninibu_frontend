"use client";

import { HeartHandshake, ShieldAlert, Sparkles } from "lucide-react";
import { MaternalHealthPanel } from "@/components/health/maternal-health-panel";

export function MaternalHealthHub() {
  return <div className="health-page maternal-health-page">
    <section className="page-intro">
      <div>
        <span className="section-kicker">پرونده خصوصی والد</span>
        <h1>سلامت مادر</h1>
        <p>پیگیری چرخه، بارداری، شیردهی و وضعیت عمومی مادر در یک مسیر مستقل از سلامت فرزند.</p>
      </div>
    </section>

    <section className="maternal-page-grid">
      <MaternalHealthPanel />
      <article className="surface-card maternal-insight-card">
        <div className="card-heading">
          <div>
            <span className="card-icon subtle"><Sparkles size={20} /></span>
            <div>
              <small>یادآوری مهم</small>
              <h3>این مسیر جدا از سلامت فرزند است</h3>
            </div>
          </div>
        </div>
        <div className="maternal-insight-list">
          <div>
            <strong><HeartHandshake size={16} /> مدیریت متمرکز</strong>
            <p>تمام اطلاعات چرخه، بارداری، ریکاوری پس از زایمان و شیردهی در یک صفحه مجزا نگه‌داری می‌شود.</p>
          </div>
          <div>
            <strong><ShieldAlert size={16} /> استفاده مسئولانه</strong>
            <p>این بخش برای پیگیری و آموزش است و جایگزین تشخیص یا تجویز پزشک نیست.</p>
          </div>
        </div>
      </article>
    </section>
  </div>;
}
