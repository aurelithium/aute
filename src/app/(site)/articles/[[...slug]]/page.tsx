import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { ServiceCard } from "@/components/client";
import { Breadcrumbs, CTASection, PageHero } from "@/components/shell";
import { extractHeadings, JsonLd, RichText, SmartImage } from "@/components/ui";
import { formatDateRu } from "@/lib/format";
import {
  absoluteUrl,
  getArticleBySlug,
  getArticles,
  getCategories,
  getServices,
  getSettings,
  getSiteUrl,
  MEDICAL_DISCLAIMER,
  pageMetadata,
} from "@/lib/site";

/** /articles — список статей, /articles/{slug} — отдельная статья. */
type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [slug] = (await params).slug ?? [];
  if (!slug) {
    return pageMetadata({
      title: "Полезные статьи о здоровье зубов",
      description: "Статьи о гигиене полости рта, профилактике кариеса, уходе за зубами и детской стоматологии от клиники «Квалитет».",
      path: "/articles",
    });
  }
  const a = await getArticleBySlug(slug);
  if (!a) return {};
  return pageMetadata({
    title: a.seoTitle || a.title,
    description: a.seoDescription || a.excerpt,
    path: `/articles/${a.slug}`,
    image: a.cover,
    type: "article",
  });
}

export default async function ArticlesPage({ params, searchParams }: Props) {
  const segments = (await params).slug ?? [];
  if (segments.length > 1) notFound();
  if (segments.length === 1) return <ArticleView slug={segments[0]} />;
  return <ArticlesList sp={await searchParams} />;
}

async function ArticlesList({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const [articles, settings] = await Promise.all([getArticles(), getSettings()]);
  const cats = Array.from(new Set(articles.map((a) => a.category)));
  const cat = typeof sp.category === "string" && cats.includes(sp.category) ? sp.category : "";
  const list = cat ? articles.filter((a) => a.category === cat) : articles;

  return (
    <>
      <PageHero
        title="Полезные статьи"
        description="Общие информационные материалы о здоровье зубов. Они не заменяют консультацию врача."
        crumbs={[{ label: "Статьи" }]}
      />
      <section className="section-tight">
        <div className="container-page">
          {cats.length > 1 && (
            <nav aria-label="Категории статей" className="mb-8 flex flex-wrap gap-2">
              {[{ label: "Все статьи", value: "" }, ...cats.map((c) => ({ label: c, value: c }))].map((f) => {
                const on = cat === f.value;
                return (
                  <Link
                    key={f.value || "all"}
                    href={f.value ? `/articles?category=${encodeURIComponent(f.value)}` : "/articles"}
                    aria-current={on ? "true" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-colors ${
                      on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-300 hover:bg-brand-50"
                    }`}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <article key={a.id} className="card card-hover flex flex-col overflow-hidden">
                <Link href={`/articles/${a.slug}`} className="relative block aspect-[16/10] bg-brand-50" aria-hidden="true" tabIndex={-1}>
                  {a.cover && <SmartImage src={a.cover} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />}
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    {a.category}
                    {a.publishedAt && <span className="font-medium normal-case tracking-normal text-muted"> · {formatDateRu(a.publishedAt)}</span>}
                  </p>
                  <h2 className="mt-2 text-xl leading-snug">
                    <Link href={`/articles/${a.slug}`} className="hover:text-brand-700">
                      {a.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{a.excerpt}</p>
                  <Link href={`/articles/${a.slug}`} className="link-arrow mt-auto pt-4 text-sm">
                    Читать
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTASection phone={settings.contacts.phones[0]} />
    </>
  );
}

async function ArticleView({ slug }: { slug: string }) {
  const [a, all, services, cats, settings, siteUrl] = await Promise.all([
    getArticleBySlug(slug),
    getArticles(),
    getServices(),
    getCategories(),
    getSettings(),
    getSiteUrl(),
  ]);
  if (!a) notFound();

  const headings = extractHeadings(a.content);
  const others = all.filter((x) => x.id !== a.id);
  const relatedArticles = [...others.filter((x) => x.category === a.category), ...others.filter((x) => x.category !== a.category)].slice(0, 3);
  const relatedCategory = cats.find((c) => c.id === a.relatedCategoryId);
  const relatedServices = relatedCategory ? services.filter((s) => s.categorySlug === relatedCategory.slug).slice(0, 3) : [];

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    image: absoluteUrl(siteUrl, a.cover),
    datePublished: a.publishedAt ?? undefined,
    mainEntityOfPage: `${siteUrl}/articles/${a.slug}`,
    author: { "@type": "Organization", name: settings.site.siteName },
    publisher: { "@type": "Organization", name: settings.site.siteName },
  };

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-8 md:py-12">
          <Breadcrumbs items={[{ label: "Статьи", href: "/articles" }, { label: a.title }]} />
          <div className="mt-6 max-w-3xl">
            <p className="eyebrow mb-3">{a.category}</p>
            <h1 className="text-[clamp(1.8rem,1.3rem+2vw,3rem)]">{a.title}</h1>
            <p className="lead mt-4">{a.excerpt}</p>
            {a.publishedAt && (
              <p className="mt-5 flex items-center gap-2 text-sm text-muted">
                <CalendarDays size={16} aria-hidden="true" />
                <time dateTime={a.publishedAt}>{formatDateRu(a.publishedAt)}</time>
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          {a.cover && (
            <div className="relative mb-10 aspect-[16/9] max-w-3xl overflow-hidden rounded-3xl bg-brand-50">
              <SmartImage src={a.cover} alt={a.title} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
            </div>
          )}
          <RichText text={a.content} />
          <p className="mt-10 max-w-3xl rounded-xl bg-accent-soft p-4 text-sm">{MEDICAL_DISCLAIMER}</p>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {headings.length >= 3 && (
            <nav aria-label="Содержание статьи" className="card p-5">
              <p className="font-bold">Содержание</p>
              <ol className="mt-3 space-y-2 text-sm">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-muted hover:text-brand-700">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="card bg-brand-800 p-6 text-white">
            <p className="text-lg font-bold">Остались вопросы?</p>
            <p className="mt-2 text-sm text-brand-100">Запишитесь на консультацию — врач ответит на вопросы и осмотрит вас.</p>
            <Link href="/booking" className="btn btn-light mt-5 w-full">
              Записаться на приём
            </Link>
          </div>
        </aside>
      </div>

      {relatedServices.length > 0 && (
        <section className="section-tight bg-surface-alt" aria-labelledby="art-services">
          <div className="container-page">
            <h2 id="art-services" className="mb-8 text-2xl">
              Связанные услуги
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedServices.map((s) => (
                <ServiceCard key={s.id} s={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className="section-tight" aria-labelledby="art-related">
          <div className="container-page">
            <h2 id="art-related" className="mb-8 text-2xl">
              Читайте также
            </h2>
            <ul className="grid gap-4 md:grid-cols-3">
              {relatedArticles.map((r) => (
                <li key={r.id}>
                  <Link href={`/articles/${r.slug}`} className="card card-hover block h-full p-5">
                    <span className="text-xs font-bold uppercase tracking-wide text-brand-600">{r.category}</span>
                    <span className="mt-2 block text-lg font-bold leading-snug">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CTASection phone={settings.contacts.phones[0]} />
      <JsonLd data={ld} />
    </>
  );
}
