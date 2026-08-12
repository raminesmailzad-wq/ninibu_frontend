import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "نینیبو | همراه هوشمند والدین",
  description: "نینیبو؛ همراه هوشمند والدین برای سلامت، رشد و خدمات کودک"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fa" dir="rtl"><body><QueryProvider>{children}</QueryProvider></body></html>;
}
