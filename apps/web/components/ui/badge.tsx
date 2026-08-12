import { cn } from "@/lib/utils";
export function Badge({ children, tone = "default", className }: { children: React.ReactNode; tone?: "default" | "accent" | "success" | "warning"; className?: string }) {
  return <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>;
}
