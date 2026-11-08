import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getSettings, getSiteUrl } from "@/lib/site";

import "@fontsource-variable/manrope";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#12666d",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const [settings, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  const s = settings.site;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: s.seoTitle, template: `%s — ${s.siteName}` },
    description: s.seoDescription,
    applicationName: s.siteName,
    icons: s.favicon ? { icon: s.favicon } : { icon: "/icon.svg" },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: s.siteName,
      title: s.seoTitle,
      description: s.seoDescription,
      images: [{ url: s.ogImage || "/images/hero.webp" }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
