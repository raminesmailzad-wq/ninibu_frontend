import type { ReactNode } from "react";
export function Field({label,hint,children}:{label:string;hint?:string;children:ReactNode}){return <label className="grid gap-2 text-sm font-medium"><span>{label}</span>{children}{hint&&<span className="text-xs font-normal text-[var(--muted)]">{hint}</span>}</label>}
