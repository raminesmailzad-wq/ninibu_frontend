import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="ui-field"><span className="ui-field__label">{label}</span>{children}{hint && <span className="ui-field__hint">{hint}</span>}</label>;
}
