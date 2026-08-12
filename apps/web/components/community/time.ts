export function formatRelativeFa(value: string) {
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  if (!Number.isFinite(diff)) return "";
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${new Intl.NumberFormat("fa-IR").format(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${new Intl.NumberFormat("fa-IR").format(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${new Intl.NumberFormat("fa-IR").format(days)} روز پیش`;
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}
