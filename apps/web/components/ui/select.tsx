import * as React from "react";import { cn } from "@/lib/utils";
export function Select({className,...props}:React.SelectHTMLAttributes<HTMLSelectElement>){return <select className={cn("h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-soft)]",className)} {...props}/>}
