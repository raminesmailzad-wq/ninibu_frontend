import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export function Button({ className, variant = "default", type, ...props }: ButtonProps) {
  return <button type={type ?? "button"} className={cn("ui-button", `ui-button--${variant}`, className)} {...props} />;
}
