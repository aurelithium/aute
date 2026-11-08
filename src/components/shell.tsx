import Link from "next/link";
import { ChevronRight, Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { BookButton, BookingProvider, HeaderClient, type BookingPreset } from "@/components/client";
import { formatRating, JsonLd, Logo, Stars } from "@/components/ui";
import {
  type AllSettings,
  type Category,
  getBookingOptions,
  getCategories,
  getSettings,
  getSiteUrl,
  MEDICAL_DISCLAIMER,
  organizationLd,
  type PhoneItem,
  PRICE_DISCLAIMER,
} from "@/lib/site";

// ───────────────────────── Breadcrumbs ─────────────────────────
export type Crumb = { label: string; href?: string };

export async function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const siteUrl = await getSiteUrl();
  const all: Crumb[] = [{ label: "Главная", href: "/" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteUrl}${c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Хлебные крошки" className="text-sm">
      <ol className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 ${light ? "text-brand-100" : "text-muted"}`}>
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="inline-flex items-center gap-1.5">
              {c.href && !last ? (
                <Link href={c.href} className="rounded underline-offset-4 hover:text-brand-600 hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? (light ? "text-white" : "text-ink") : ""}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight size={14} aria-hidden="true" className="opacity-60" />}
            </li>
          );
        })}
      </ol>
      <JsonLd data={ld} />
    </nav>
  );
}

// ───────────────────────── PageHero ─────────────────────────
/** Шапка внутренней страницы: хлебные крошки, H1, вводный текст. */
export function PageHero({
  title,
  description,
  crumbs,
  children,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  crumbs: Crumb[];
  children?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page py-8 md:py-12">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 max-w-3xl">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <div className="lead mt-4">{description}</div>}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

// ───────────────────────── CTASection ─────────────────────────
/** Универсальный призыв к записи — для конца внутренних страниц. */
export function CTASection({
  title = "Запишитесь на приём",
  text = "Оставьте заявку, и администратор свяжется с вами, чтобы подобрать удобное время.",
  phone,
  preset,
}: {
  title?: string;
  text?: string;
  phone?: PhoneItem;
  preset?: BookingPreset;
}) {
  return (
    <section className="section-tight" aria-label="Запись на приём">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white sm:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="!text-white">{title}</h2>
              <p className="mt-3 text-brand-100">{text}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <BookButton preset={preset} className="btn btn-light btn-lg">
                Записаться на приём
              </BookButton>
              {phone && (
                <a href={`tel:${phone.tel}`} className="btn btn-outline-light btn-lg">
                  <Phone size={18} aria-hidden="true" /> {phone.display}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Footer ─────────────────────────
const CLINIC_LINKS = [
  { href: "/about", label: "О клинике" },
  { href: "/doctors", label: "Врачи" },
  { href: "/prices", label: "Цены" },
  { href: "/promotions", label: "Акции" },
  { href: "/articles", label: "Полезные статьи" },
  { href: "/gallery", label: "Фотогалерея" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/contacts", label: "Контакты" },
];

export function Footer({ settings, categories }: { settings: AllSettings; categories: Category[] }) {
  const c = settings.contacts;
  const payments = settings.payments.methods.filter((m) => m.enabled);
  return (
    <footer className="mt-0 bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-16">
        <div>
          <Link href="/" aria-label="Квалитет — на главную" className="inline-block rounded-lg">
            <Logo variant="light" logoUrl={settings.site.logo || undefined} name={settings.site.siteName} />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-200">
            Частная стоматологическая клиника в Москве. Лечение и профилактика для взрослых и детей: от консультации до комплексного плана лечения.
          </p>
          <a
            href={c.twoGisReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/15 px-4 py-3 text-sm hover:bg-white/5"
          >
            <span className="text-2xl font-extrabold text-white">{formatRating(settings.rating.value)}</span>
            <span>
              <Stars value={settings.rating.value} size={15} />
              <span className="mt-0.5 block text-xs text-brand-200">{settings.rating.count} оценки в 2ГИС</span>
            </span>
          </a>
        </div>

        <nav aria-label="Услуги в подвале">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] !text-white">Услуги</h2>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/services/${cat.slug}`} className="inline-block py-1 text-sm hover:text-white hover:underline">
                  {cat.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Разделы сайта">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] !text-white">Клиника</h2>
          <ul className="space-y-1">
            {CLINIC_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1 text-sm hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.14em] !text-white">Контакты</h2>
          <ul className="space-y-2">
            {c.phones.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className="inline-flex items-center gap-2 py-1 text-lg font-bold text-white hover:underline">
                  <Phone size={16} aria-hidden="true" className="text-brand-300" />
                  {p.display}
                </a>
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-3 text-sm">
            {c.address && (
              <li className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-300" aria-hidden="true" />
                {c.address}
              </li>
            )}
            {c.workingHours && (
              <li className="flex gap-2">
                <Clock size={16} className="mt-0.5 shrink-0 text-brand-300" aria-hidden="true" />
                <span className="whitespace-pre-line">{c.workingHours}</span>
              </li>
            )}
            <li>
              <a href={c.twoGisUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white hover:underline">
                Клиника в 2ГИС <ExternalLink size={14} aria-hidden="true" />
              </a>
            </li>
          </ul>
          <BookButton className="btn btn-light btn-sm mt-5">Записаться на приём</BookButton>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-brand-200 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold text-white">Способы оплаты:</span>
            {payments.map((m) => (
              <span key={m.key}>{m.title}</span>
            ))}
            <Link href="/contacts#payment" className="underline hover:text-white">
              Подробнее
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-white hover:underline">
              Политика конфиденциальности
            </Link>
            <Link href="/personal-data-consent" className="hover:text-white hover:underline">
              Согласие на обработку персональных данных
            </Link>
          </div>
        </div>
        <div className="container-page border-t border-white/10 py-5 text-xs leading-relaxed text-brand-300">
          <p>{MEDICAL_DISCLAIMER}</p>
          <p className="mt-1">{PRICE_DISCLAIMER}</p>
          <p className="mt-3">Демонстрационная версия сайта. © {new Date().getFullYear()} {settings.site.siteName}. Стоматологическая клиника, Москва.</p>
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────── MobileCtaBar ─────────────────────────
/** Липкая панель «Позвонить / Записаться» для телефонов. */
export function MobileCtaBar({ tel, display }: { tel?: string; display?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(16_39_44/0.25)] sm:hidden">
      <div className="grid grid-cols-2 gap-2">
        {tel ? (
          <a href={`tel:${tel}`} className="btn btn-secondary btn-sm" aria-label={`Позвонить: ${display ?? tel}`}>
            <Phone size={18} aria-hidden="true" /> Позвонить
          </a>
        ) : (
          <span />
        )}
        <BookButton className="btn btn-primary btn-sm">Записаться</BookButton>
      </div>
    </div>
  );
}

// ───────────────────────── SiteShell ─────────────────────────
/** Общая оболочка публичного сайта: шапка, подвал, окно записи. */
export async function SiteShell({ children }: { children: ReactNode }) {
  const [settings, categories, options, siteUrl] = await Promise.all([
    getSettings(),
    getCategories(),
    getBookingOptions(),
    getSiteUrl(),
  ]);
  const c = settings.contacts;
  return (
    <BookingProvider options={options} phones={c.phones}>
      <a href="#main" className="skip-link">
        Перейти к основному содержимому
      </a>

      <div role="note" className="bg-accent-soft px-4 py-2 text-center text-xs font-semibold text-ink">
        Демонстрационная версия сайта: форма записи данные не отправляет, фотографии иллюстративные.
      </div>

      <div className="hidden bg-brand-900 text-[0.8125rem] text-brand-100 lg:block">
        <div className="container-page flex h-10 items-center justify-between">
          <p>{settings.site.tagline}</p>
          <div className="flex items-center gap-6">
            <a href={c.twoGisReviewsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
              <Stars value={settings.rating.value} size={13} />
              <span>
                <strong className="text-white">{formatRating(settings.rating.value)}</strong> в 2ГИС · {settings.rating.count} оценки
              </span>
            </a>
            <nav aria-label="Дополнительная навигация" className="flex items-center gap-5">
              <Link href="/promotions" className="hover:text-white">Акции</Link>
              <Link href="/articles" className="hover:text-white">Статьи</Link>
              <Link href="/gallery" className="hover:text-white">Галерея</Link>
              <Link href="/contacts#payment" className="hover:text-white">Оплата</Link>
            </nav>
          </div>
        </div>
      </div>

      <HeaderClient
        siteName={settings.site.siteName}
        logoUrl={settings.site.logo || undefined}
        phones={c.phones}
        categories={categories.map((x) => ({ slug: x.slug, title: x.title, shortDescription: x.shortDescription }))}
      />
      <main id="main" className="min-h-[60vh] pb-16 sm:pb-0">
        {children}
      </main>
      <Footer settings={settings} categories={categories} />
      <MobileCtaBar tel={c.phones[0]?.tel} display={c.phones[0]?.display} />
      <JsonLd data={organizationLd(siteUrl, settings)} />
    </BookingProvider>
  );
}
