import type { MetadataRoute } from "next";
import { getArticles, getCategories, getDoctors, getServices, getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const [cats, services, doctors, articles] = await Promise.all([
    getCategories(),
    getServices(),
    getDoctors(),
    getArticles(),
  ]);
  const now = new Date();
  const staticPaths = [
    "/",
    "/services",
    "/prices",
    "/doctors",
    "/about",
    "/reviews",
    "/gallery",
    "/promotions",
    "/articles",
    "/contacts",
    "/booking",
    "/privacy-policy",
    "/personal-data-consent",
  ];
  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((p) => ({
      url: `${siteUrl}${p}`,
      lastModified: now,
      changeFrequency: (p === "/" || p === "/prices" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: p === "/" ? 1 : p === "/services" || p === "/prices" ? 0.9 : 0.6,
    })),
    ...cats.map((c) => ({ url: `${siteUrl}/services/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 })),
    ...services.map((s) => ({ url: `${siteUrl}/services/${s.categorySlug}/${s.slug}`, lastModified: s.updatedAt, priority: 0.7 })),
    ...doctors.map((d) => ({ url: `${siteUrl}/doctors/${d.slug}`, lastModified: d.updatedAt, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${siteUrl}/articles/${a.slug}`, lastModified: a.updatedAt, priority: 0.5 })),
  ];
  return entries;
}
