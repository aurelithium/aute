import { headers } from "next/headers";
import type { Metadata } from "next";
import { PROCESS_TEXT, SEED_ARTICLES, SEED_CATEGORIES, SEED_GALLERY, SEED_SERVICES } from "@/data/content";

// ───────────────────────── constants ─────────────────────────
/** Подтверждённые исходные данные клиники и справочники сайта. */

export const TWO_GIS = {
  firm: "https://2gis.ru/moscow/firm/4504127917705609",
  info: "https://2gis.ru/moscow/firm/4504127917705609/tab/info",
  reviews: "https://2gis.ru/moscow/firm/4504127917705609/tab/reviews",
  prices: "https://2gis.ru/moscow/firm/4504127917705609/tab/prices",
  gallery: "https://2gis.ru/moscow/gallery/firm/4504127917705609",
  questions: "https://2gis.ru/moscow/firm/4504127917705609/tab/questions",
} as const;

export const DEFAULT_PHONES = [
  { label: "Основной", display: "+7 (499) 481-32-08", tel: "+74994813208" },
  { label: "Дополнительный", display: "+7 (499) 481-97-00", tel: "+74994819700" },
  { label: "Мобильный", display: "+7 (966) 019-41-19", tel: "+79660194119" },
];

export const GALLERY_CATEGORIES = [
  { value: "interior", label: "Интерьер" },
  { value: "cabinets", label: "Кабинеты" },
  { value: "equipment", label: "Оборудование" },
  { value: "clinic", label: "Клиника" },
  { value: "other", label: "Другое" },
] as const;

export const MEDICAL_DISCLAIMER =
  "Имеются противопоказания. Необходима консультация специалиста. Информация на сайте носит справочный характер и не заменяет приём врача.";

export const PRICE_DISCLAIMER = "Информация о ценах не является публичной офертой.";

// ───────────────────────── settings-types ─────────────────────────
export type SiteSettings = {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  heroImage: string;
  aboutImage: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
};

export type PhoneItem = { label: string; display: string; tel: string };
export type LinkItem = { label: string; url: string };

export type ContactSettings = {
  phones: PhoneItem[];
  email: string;
  address: string;
  workingHours: string;
  mapEmbedUrl: string;
  contactText: string;
  legalEntity: string;
  twoGisUrl: string;
  twoGisReviewsUrl: string;
  twoGisQuestionsUrl: string;
  twoGisPricesUrl: string;
  twoGisGalleryUrl: string;
  social: LinkItem[];
};

export type PaymentMethod = { key: string; title: string; description: string; enabled: boolean };
export type PaymentSettings = { methods: PaymentMethod[]; installmentsInfo: string };

export type PriceSettings = {
  /** Дата исходного прайса (YYYY-MM-DD) */
  sourceDate: string;
  /** Дата последнего изменения цен (ISO), если были изменения */
  updatedAt: string | null;
};

export type RatingSettings = { value: number; count: number; source: string };

export type AllSettings = {
  site: SiteSettings;
  contacts: ContactSettings;
  payments: PaymentSettings;
  prices: PriceSettings;
  rating: RatingSettings;
};

export const DEFAULT_SETTINGS: AllSettings = {
  site: {
    siteName: "Квалитет",
    tagline: "Стоматологическая клиника в Москве",
    logo: "",
    favicon: "",
    heroImage: "/images/hero.webp",
    aboutImage: "/images/about.webp",
    seoTitle: "Квалитет — стоматологическая клиника в Москве для взрослых и детей",
    seoDescription:
      "Квалитет — частная стоматологическая клиника в Москве: хирургия, имплантация, ортопедия, терапия, детская стоматология, ортодонтия, пародонтология и диагностика. Запись по телефону и онлайн.",
    ogImage: "/images/hero.webp",
  },
  contacts: {
    phones: DEFAULT_PHONES,
    email: "",
    address: "",
    workingHours: "",
    mapEmbedUrl: "",
    contactText:
      "Запишитесь на приём по телефону или оставьте заявку на сайте — администратор свяжется с вами, чтобы согласовать удобное время.",
    legalEntity: "",
    twoGisUrl: TWO_GIS.firm,
    twoGisReviewsUrl: TWO_GIS.reviews,
    twoGisQuestionsUrl: TWO_GIS.questions,
    twoGisPricesUrl: TWO_GIS.prices,
    twoGisGalleryUrl: TWO_GIS.gallery,
    social: [],
  },
  payments: {
    methods: [
      { key: "card", title: "Банковская карта", description: "Оплата картой при посещении клиники.", enabled: true },
      { key: "cash", title: "Наличный расчёт", description: "Оплата наличными в кассе клиники.", enabled: true },
      { key: "qr", title: "Оплата по QR-коду", description: "Оплата через мобильное приложение банка по QR-коду.", enabled: true },
      { key: "installments", title: "Плати частями", description: "Возможность оплатить лечение частями.", enabled: true },
    ],
    installmentsInfo: "",
  },
  prices: { sourceDate: "2025-12-25", updatedAt: null },
  rating: { value: 4.9, count: 42, source: "2ГИС" },
};

// ───────────────────────── settings ─────────────────────────
/** Настройки демо-сайта хранятся в коде (src/lib/settings-types.ts → DEFAULT_SETTINGS). */
export async function getSettings(): Promise<AllSettings> {
  return DEFAULT_SETTINGS;
}

// ───────────────────────── site-url ─────────────────────────
/**
 * Базовый адрес сайта для canonical, sitemap и Open Graph.
 * Рекомендуется задать SITE_URL в окружении (например, https://kvalitet.example).
 * Если переменная не задана, адрес определяется по заголовкам запроса.
 */
export async function getSiteUrl(): Promise<string> {
  const env = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && /^[a-z0-9.\-:]+$/i.test(host)) {
      const local = host.startsWith("localhost") || host.startsWith("127.");
      const proto = h.get("x-forwarded-proto")?.split(",")[0] ?? (local ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    /* вне контекста запроса */
  }
  return "http://localhost:3000";
}

// ───────────────────────── seo ─────────────────────────
const DEFAULT_OG = "/images/hero.webp";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const image = opts.image || DEFAULT_OG;
  const fullTitle = `${opts.title} — Квалитет`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description: opts.description,
      url: opts.path,
      type: opts.type ?? "website",
      locale: "ru_RU",
      siteName: "Квалитет",
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: opts.description, images: [image] },
  };
}

export function absoluteUrl(siteUrl: string, path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Schema.org Dentist — только по подтверждённым данным. Адрес добавляется, только если он заполнен в настройках. */
export function organizationLd(siteUrl: string, s: AllSettings): Record<string, unknown> {
  const c = s.contacts;
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": `${siteUrl}/#clinic`,
    name: s.site.siteName,
    url: siteUrl,
    telephone: c.phones.map((p) => p.tel),
    areaServed: { "@type": "City", name: "Москва" },
    image: absoluteUrl(siteUrl, s.site.ogImage || DEFAULT_OG),
    sameAs: [c.twoGisUrl, ...c.social.map((x) => x.url)].filter(Boolean),
  };
  if (c.email) ld.email = c.email;
  if (c.address) {
    ld.address = {
      "@type": "PostalAddress",
      streetAddress: c.address,
      addressLocality: "Москва",
      addressCountry: "RU",
    };
  }
  return ld;
}

// ───────────────────────── data ─────────────────────────
/**
 * Источник данных демо-сайта: всё хранится в коде (src/data/seed.ts и src/lib/settings-types.ts),
 * база данных и серверная часть не используются.
 * Функции остаются асинхронными, чтобы страницы не зависели от способа хранения данных.
 */

export type FaqItem = { q: string; a: string };

export type Category = {
  id: number;
  slug: string;
  title: string;
  shortDescription: string;
  intro: string | null;
  image: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Service = {
  id: number;
  slug: string;
  categoryId: number;
  title: string;
  shortDescription: string;
  description: string | null;
  audience: string | null;
  process: string | null;
  preparation: string | null;
  contraindications: string | null;
  image: string | null;
  priceType: string;
  priceMin: number | null;
  priceMax: number | null;
  priceNote: string | null;
  faq: FaqItem[];
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  published: boolean;
  featured: boolean;
  reviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceWithCategory = Service & { categorySlug: string; categoryTitle: string; categoryImage: string | null };

export type Doctor = {
  id: number;
  slug: string;
  fullName: string;
  specialization: string;
  photo: string | null;
  education: string | null;
  qualification: string | null;
  experience: string | null;
  bio: string | null;
  serviceIds: number[];
  sortOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GalleryItem = {
  id: number;
  image: string;
  caption: string | null;
  category: string;
  sortOrder: number;
  published: boolean;
};

export type Promotion = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  conditions: string | null;
  image: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string | null;
  category: string;
  relatedCategoryId: number | null;
  status: string;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Review = {
  id: number;
  authorName: string;
  rating: number;
  text: string;
  source: string;
  sourceUrl: string | null;
  reviewDate: string | null;
  sortOrder: number;
  published: boolean;
};

const STAMP = new Date("2026-01-15T00:00:00Z");

const CATEGORIES: Category[] = SEED_CATEGORIES.map((c, i) => ({
  id: i + 1,
  slug: c.slug,
  title: c.title,
  shortDescription: c.shortDescription,
  intro: c.intro,
  image: c.image,
  seoTitle: null,
  seoDescription: c.seoDescription,
  sortOrder: (i + 1) * 10,
  published: true,
  createdAt: STAMP,
  updatedAt: STAMP,
}));
const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

const SERVICES: ServiceWithCategory[] = SEED_SERVICES.map((s, i) => {
  const category = CATEGORY_BY_SLUG.get(s.category) as Category;
  return {
    id: i + 1,
    slug: s.slug,
    categoryId: category.id,
    title: s.title,
    shortDescription: s.short,
    description: s.description,
    audience: s.audience.map((a) => `- ${a}`).join("\n"),
    process: PROCESS_TEXT[s.kind].map((p, idx) => `${idx + 1}. ${p}`).join("\n"),
    preparation: null,
    contraindications: null,
    image: null,
    priceType: s.priceType,
    priceMin: s.priceMin ?? null,
    priceMax: s.priceMax ?? null,
    priceNote: s.priceNote ?? null,
    faq: s.faq.map(([q, a]) => ({ q, a })),
    seoTitle: null,
    seoDescription: null,
    sortOrder: (i + 1) * 10,
    published: true,
    featured: Boolean(s.featured),
    reviewed: false,
    createdAt: STAMP,
    updatedAt: STAMP,
    categorySlug: category.slug,
    categoryTitle: category.title,
    categoryImage: category.image,
  };
});

// Врачи, акции и отзывы намеренно пусты: подтверждённых данных нет, вымышленные не публикуем.
const DOCTORS: Doctor[] = [];
const PROMOTIONS: Promotion[] = [];
const REVIEWS: Review[] = [];

const GALLERY: GalleryItem[] = SEED_GALLERY.map((g, i) => ({
  id: i + 1,
  image: g.image,
  caption: g.caption,
  category: g.category,
  sortOrder: (i + 1) * 10,
  published: true,
}));

const ARTICLES: Article[] = SEED_ARTICLES.map((a, i) => ({
  id: i + 1,
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  content: a.content,
  cover: a.cover,
  category: a.category,
  relatedCategoryId: CATEGORY_BY_SLUG.get(a.relatedCategory)?.id ?? null,
  status: "published",
  publishedAt: a.publishedAt,
  seoTitle: null,
  seoDescription: a.seoDescription,
  sortOrder: (i + 1) * 10,
  createdAt: STAMP,
  updatedAt: STAMP,
})).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getServices(): Promise<ServiceWithCategory[]> {
  return SERVICES;
}

export async function getCategoryBySlug(slug: string) {
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) return null;
  return { category, services: SERVICES.filter((s) => s.categorySlug === slug) };
}

export async function getServiceBySlug(categorySlug: string, slug: string) {
  const service = SERVICES.find((s) => s.slug === slug && s.categorySlug === categorySlug);
  if (!service) return null;
  const related = SERVICES.filter((s) => s.categorySlug === categorySlug && s.id !== service.id).slice(0, 4);
  return { service, related };
}

export async function getDoctors(): Promise<Doctor[]> {
  return DOCTORS;
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  return DOCTORS.find((d) => d.slug === slug) ?? null;
}

export async function getGallery(): Promise<GalleryItem[]> {
  return GALLERY;
}

export async function getPromotions(): Promise<Promotion[]> {
  return PROMOTIONS;
}

export async function getArticles(): Promise<Article[]> {
  return ARTICLES;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export async function getReviews(): Promise<Review[]> {
  return REVIEWS;
}

export type BookingOptions = {
  categories: { slug: string; title: string }[];
  services: { id: number; title: string; categorySlug: string }[];
  doctors: { id: number; name: string }[];
};

export async function getBookingOptions(): Promise<BookingOptions> {
  return {
    categories: CATEGORIES.map((c) => ({ slug: c.slug, title: c.title })),
    services: SERVICES.map((s) => ({ id: s.id, title: s.title, categorySlug: s.categorySlug })),
    doctors: DOCTORS.map((d) => ({ id: d.id, name: d.fullName })),
  };
}
