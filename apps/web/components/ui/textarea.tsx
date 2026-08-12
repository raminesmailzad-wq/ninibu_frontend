import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full resize-y rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]", className)} {...props} />;
}
