import { CalendarDays, MapPinned, MessageCircleMore, Sparkles } from "lucide-react";

export function PlaceholderSection({ section }: { section: "community" | "services" }) {
  const community = section === "community";
  const Icon = community ? MessageCircleMore : CalendarDays;
  return <section className="placeholder-page">
    <div className="placeholder-icon"><Icon size={30} /></div>
    <span className="eyebrow">فاز بعدی فرانت</span>
    <h2>{community ? "جامعه والدین" : "خدمات و رزرو"}</h2>
    <p>{community ? "گروه‌ها، پست‌ها و تجربه والدین در فاز بعدی به این پوسته متصل می‌شوند." : "پزشکان، دوره‌ها، رزرو و مراکز نزدیک در فاز بعدی روی همین ساختار اضافه می‌شوند."}</p>
    <div className="placeholder-pills">
      <span><Sparkles size={15} /> آماده اتصال به Backend</span>
      {!community && <span><MapPinned size={15} /> پشتیبانی شهر و نقشه آماده است</span>}
    </div>
  </section>;
}
