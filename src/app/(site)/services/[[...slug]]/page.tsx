import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { BookButton, ServiceCard, ServiceCatalog } from "@/components/client";
import { ContactBlock } from "@/components/sections";
import { Breadcrumbs, CTASection, PageHero } from "@/components/shell";
import { FAQ, JsonLd, RichText, SmartImage } from "@/components/ui";
import { formatDateRu, formatPrice, hasPrice } from "@/lib/format";
import {
  absoluteUrl,
  getCategories,
  getCategoryBySlug,
  getServiceBySlug,
  getServices,
  getSettings,
  getSiteUrl,
  MEDICAL_DISCLAIMER,
  pageMetadata,
  PRICE_DISCLAIMER,
} from "@/lib/site";

/**
 * Один файл обслуживает три адреса:
 *   /services                         — каталог услуг
 *   /services/{направление}           — страница направления
 *   /services/{направление}/{услуга}  — страница услуги
 */
type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [category, service] = (await params).slug ?? [];

  if (!category) {
    return pageMetadata({
      title: "Услуги стоматологической клиники в Москве",
      description:
        "Каталог стоматологических услуг клиники «Квалитет» в Москве: хирургия, имплантация, ортопедия, терапия, детская стоматология, ортодонтия, пародонтология, диагностика. Цены и запись на приём.",
      path: "/services",
    });
  }

  if (!service) {
    const data = await getCategoryBySlug(category);
    if (!data) return {};
    const c = data.category;
    return pageMetadata({
      title: c.seoTitle || `${c.title} в Москве — услуги и цены`,
      description: c.seoDescription || `${c.shortDescription} Клиника «Квалитет», Москва. Цены и запись на приём.`,
      path: `/services/${c.slug}`,
      image: c.image,
    });
  }

  const data = await getServiceBySlug(category, service);
  if (!data) return {};
  const s = data.service;
  const price = hasPrice(s) ? ` Стоимость: ${formatPrice(s)}.` : "";
  return pageMetadata({
    title: s.seoTitle || `${s.title} в Москве — цена и запись`,
    description: s.seoDescription || `${s.shortDescription}${price} Клиника «Квалитет», Москва. Запишитесь на консультацию.`,
    path: `/services/${s.categorySlug}/${s.slug}`,
    image: s.image || s.categoryImage,
  });
}

export default async function ServicesPage({ params, searchParams }: Props) {
  const segments = (await params).slug ?? [];
  if (segments.length > 2) notFound();
  if (segments.length === 0) return <ServicesIndex sp={await searchParams} />;
  if (segments.length === 1) return <CategoryView slug={segments[0]} />;
  return <ServiceView category={segments[0]} slug={segments[1]} />;
}

/* ───────────── /services ───────────── */

async function ServicesIndex({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const [categories, services, settings] = await Promise.all([getCategories(), getServices(), getSettings()]);
  const phone = settings.contacts.phones[0];
  return (
    <>
      <PageHero
        title="Услуги клиники"
        description="Выберите направление или воспользуйтесь поиском. На странице каждой услуги — описание, стоимость и запись на приём."
        crumbs={[{ label: "Услуги" }]}
      />
      <section className="section-tight">
        <div className="container-page">
          <ServiceCatalog
            categories={categories.map((c) => ({ slug: c.slug, title: c.title }))}
            services={services.map((s) => ({
              id: s.id,
              slug: s.slug,
              title: s.title,
              shortDescription: s.shortDescription,
              categorySlug: s.categorySlug,
              categoryTitle: s.categoryTitle,
              priceType: s.priceType,
              priceMin: s.priceMin,
              priceMax: s.priceMax,
            }))}
            initialCategory={typeof sp.category === "string" ? sp.category : "all"}
            initialQuery={typeof sp.q === "string" ? sp.q.slice(0, 80) : ""}
            phone={phone}
          />
        </div>
      </section>
      <CTASection phone={phone} />
    </>
  );
}

/* ───────────── /services/{направление} ───────────── */

async function CategoryView({ slug }: { slug: string }) {
  const [data, allCategories, settings] = await Promise.all([getCategoryBySlug(slug), getCategories(), getSettings()]);
  if (!data) notFound();
  const { category: c, services } = data;
  const others = allCategories.filter((x) => x.id !== c.id);

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-8 md:py-12">
          <Breadcrumbs items={[{ label: "Услуги", href: "/services" }, { label: c.title }]} />
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
            <div>
              <p className="eyebrow mb-3">Направление</p>
              <h1>{c.title}</h1>
              {c.intro && <p className="lead mt-5">{c.intro}</p>}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <BookButton preset={{ categorySlug: c.slug }} className="btn btn-primary btn-lg">
                  Записаться на приём
                </BookButton>
                <Link href="/prices" className="btn btn-secondary btn-lg">
                  Смотреть цены
                </Link>
              </div>
            </div>
            {c.image && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-lift)]">
                <SmartImage src={c.image} alt={`Направление «${c.title}» — иллюстрация`} fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="cat-services">
        <div className="container-page">
          <h2 id="cat-services" className="mb-8">
            Услуги направления
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.id} className="reveal">
                <ServiceCard s={s} />
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-muted">{MEDICAL_DISCLAIMER}</p>
        </div>
      </section>

      <section className="section-tight bg-surface-alt" aria-labelledby="other-cats">
        <div className="container-page">
          <h2 id="other-cats" className="mb-6 text-2xl">
            Другие направления
          </h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/services/${o.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-5 font-semibold hover:border-brand-300 hover:bg-brand-50">
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection phone={settings.contacts.phones[0]} preset={{ categorySlug: c.slug }} />
      <section className="section-tight pt-0">
        <div className="container-page">
          <h2 className="mb-6 text-2xl">Контакты</h2>
          <ContactBlock settings={settings} withMap={false} />
        </div>
      </section>
    </>
  );
}

/* ───────────── /services/{направление}/{услуга} ───────────── */

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28">
      <h2 id={`${id}-h`} className="mb-5 text-[clamp(1.4rem,1.2rem+0.8vw,1.85rem)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

async function ServiceView({ category, slug }: { category: string; slug: string }) {
  const [data, settings, siteUrl] = await Promise.all([getServiceBySlug(category, slug), getSettings(), getSiteUrl()]);
  if (!data) notFound();
  const { service: s, related } = data;
  const phone = settings.contacts.phones[0];
  const priced = hasPrice(s);
  const image = s.image || s.categoryImage;

  const faq = [
    ...s.faq,
    {
      q: `Сколько стоит услуга «${s.title}»?`,
      a: priced
        ? `По прайс-листу клиники стоимость составляет ${formatPrice(s).replace(/\u00A0/g, " ")}. Итоговую стоимость врач называет после осмотра. ${PRICE_DISCLAIMER}`
        : "Стоимость этой услуги в опубликованном прайс-листе не указана. Уточните её у администратора по телефону.",
    },
    {
      q: "Как записаться на приём?",
      a: `Позвоните по телефону ${settings.contacts.phones.map((p) => p.display).join(", ")} или оставьте заявку на сайте.`,
    },
  ];

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.shortDescription,
    serviceType: s.categoryTitle,
    areaServed: { "@type": "City", name: "Москва" },
    provider: { "@id": `${siteUrl}/#clinic` },
    url: `${siteUrl}/services/${s.categorySlug}/${s.slug}`,
    image: absoluteUrl(siteUrl, image),
  };
  if (priced) {
    ld.offers = {
      "@type": "Offer",
      priceCurrency: "RUB",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "RUB",
        minPrice: s.priceMin,
        ...(s.priceType === "range" ? { maxPrice: s.priceMax } : {}),
      },
    };
  }

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-8 md:py-12">
          <Breadcrumbs
            items={[
              { label: "Услуги", href: "/services" },
              { label: s.categoryTitle, href: `/services/${s.categorySlug}` },
              { label: s.title },
            ]}
          />
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
            <div>
              <p className="eyebrow mb-3">{s.categoryTitle} · Москва</p>
              <h1 className="text-[clamp(1.9rem,1.3rem+2.4vw,3.2rem)]">{s.title}</h1>
              <p className="lead mt-4">{s.shortDescription}</p>
              <p className="mt-6 text-3xl font-extrabold tracking-tight">
                {priced ? formatPrice(s) : <span className="text-lg text-muted">Стоимость уточняйте по телефону</span>}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <BookButton preset={{ serviceId: s.id }} className="btn btn-primary btn-lg">
                  Записаться на приём
                </BookButton>
                {phone && (
                  <a href={`tel:${phone.tel}`} className="btn btn-secondary btn-lg">
                    <Phone size={18} aria-hidden="true" /> {phone.display}
                  </a>
                )}
              </div>
            </div>
            {image && (
              <div className="relative aspect-[16/11] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-lift)]">
                <SmartImage src={image} alt={`${s.title} — иллюстрация`} fill priority sizes="(min-width: 1024px) 500px, 100vw" className="object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0 space-y-12">
          {s.description && (
            <Block id="about" title="Описание процедуры">
              <RichText text={s.description} />
            </Block>
          )}
          {s.audience && (
            <Block id="audience" title="Кому может быть полезна услуга">
              <RichText text={s.audience} />
            </Block>
          )}
          {s.process && (
            <Block id="process" title="Как проходит консультация или процедура">
              <RichText text={s.process} />
              <p className="mt-4 max-w-2xl text-sm text-muted">Порядок и состав процедуры врач определяет индивидуально.</p>
            </Block>
          )}
          {s.preparation && (
            <Block id="preparation" title="Подготовка">
              <RichText text={s.preparation} />
            </Block>
          )}
          {s.contraindications && (
            <Block id="contraindications" title="Противопоказания">
              <RichText text={s.contraindications} />
            </Block>
          )}

          <Block id="price" title="Стоимость">
            <div className="card max-w-2xl p-6">
              <p className="text-sm text-muted">{s.title}</p>
              <p className="mt-1 text-3xl font-extrabold">{priced ? formatPrice(s) : "Цена не указана"}</p>
              {s.priceNote && <p className="mt-3 text-sm">{s.priceNote}</p>}
              <p className="mt-3 text-xs text-muted">
                Цены по данным на {formatDateRu(settings.prices.sourceDate)}. {PRICE_DISCLAIMER} Актуальную стоимость уточняйте у администратора.
              </p>
              <Link href="/prices" className="link-arrow mt-4 text-sm">
                Весь прайс-лист
              </Link>
            </div>
          </Block>

          <FAQ items={faq} />

          <p className="max-w-2xl rounded-xl bg-accent-soft p-4 text-sm text-ink">{MEDICAL_DISCLAIMER}</p>
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Запись на услугу">
          <div className="card p-6">
            <p className="text-sm font-semibold text-muted">Стоимость</p>
            <p className="mt-1 text-3xl font-extrabold">{priced ? formatPrice(s) : "Уточняйте"}</p>
            <BookButton preset={{ serviceId: s.id }} className="btn btn-primary mt-5 w-full">
              <CalendarCheck size={18} aria-hidden="true" /> Записаться
            </BookButton>
            <ul className="mt-4 space-y-1">
              {settings.contacts.phones.map((p) => (
                <li key={p.tel}>
                  <a href={`tel:${p.tel}`} className="flex min-h-11 items-center gap-2 rounded-lg px-2 font-bold hover:bg-brand-50">
                    <Phone size={16} className="text-brand-600" aria-hidden="true" />
                    {p.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section-tight bg-surface-alt" aria-labelledby="related-title">
          <div className="container-page">
            <h2 id="related-title" className="mb-8">
              Связанные услуги
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <ServiceCard key={r.id} s={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection phone={phone} preset={{ serviceId: s.id }} />
      <section className="section-tight pt-0">
        <div className="container-page">
          <h2 className="mb-6 text-2xl">Контакты</h2>
          <ContactBlock settings={settings} withMap={false} />
        </div>
      </section>
      <JsonLd data={ld} />
    </>
  );
}
