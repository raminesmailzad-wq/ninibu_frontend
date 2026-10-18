import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const siteUrl = process.env.NEXT_PUBLIC_NINIBU_SITE_URL || "https://ninibu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "نینیبو",
  title: { default: "نینیبو | همراه هوشمند والدین", template: "%s | نینیبو" },
  description: "نینیبو همراه والدین برای سلامت مادر و کودک، پایش رشد، محتوای کاربردی، تجربه والدین و دسترسی به خدمات خانواده است.",
  keywords: ["نینیبو", "سلامت کودک", "رشد کودک", "والدین", "مادر و کودک", "بارداری", "تغذیه کودک", "تجربه والدین"],
  authors: [{ name: "نینیبو" }],
  creator: "نینیبو",
  publisher: "نینیبو",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "نینیبو",
    title: "نینیبو | همراه هوشمند والدین",
    description: "همراه والدین از بارداری تا سال‌های آغازین رشد کودک؛ سلامت، رشد، تجربه و خدمات در یک مسیر یکپارچه.",
    url: siteUrl,
  },
  twitter: { card: "summary", title: "نینیبو | همراه هوشمند والدین", description: "سلامت، رشد، تجربه و خدمات خانواده در نینیبو." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fa" dir="rtl"><body><QueryProvider>{children}</QueryProvider></body></html>;
}
