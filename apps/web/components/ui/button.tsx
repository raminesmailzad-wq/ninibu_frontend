import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const variants=cva("inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-strong)] shadow-sm",secondary:"bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]",outline:"border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--muted-bg)]",ghost:"text-[var(--foreground)] hover:bg-[var(--muted-bg)]"}},defaultVariants:{variant:"default"}});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof variants>{}
export function Button({className,variant,...props}:ButtonProps){return <button className={cn(variants({variant}),className)} {...props}/>}
