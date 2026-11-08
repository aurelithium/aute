import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { BookButton } from "@/components/client";
import { DoctorCard, DoctorsEmpty } from "@/components/sections";
import { Breadcrumbs, CTASection, PageHero } from "@/components/shell";
import { JsonLd, RichText, SmartImage } from "@/components/ui";
import {
  absoluteUrl,
  getDoctorBySlug,
  getDoctors,
  getServices,
  getSettings,
  getSiteUrl,
  pageMetadata,
} from "@/lib/site";

/** /doctors — каталог специалистов, /doctors/{slug} — профиль врача. */
type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [slug] = (await params).slug ?? [];
  if (!slug) {
    return pageMetadata({
      title: "Врачи стоматологической клиники в Москве",
      description: "Специалисты стоматологической клиники «Квалитет» в Москве. Выберите врача по специализации и запишитесь на приём.",
      path: "/doctors",
    });
  }
  const d = await getDoctorBySlug(slug);
  if (!d) return {};
  return pageMetadata({
    title: `${d.fullName} — ${d.specialization}`,
    description: `${d.fullName}, ${d.specialization} клиники «Квалитет» в Москве. Запись на приём.`,
    path: `/doctors/${d.slug}`,
    image: d.photo,
  });
}

export default async function DoctorsPage({ params, searchParams }: Props) {
  const segments = (await params).slug ?? [];
  if (segments.length > 1) notFound();
  if (segments.length === 1) return <DoctorProfile slug={segments[0]} />;
  return <DoctorsList sp={await searchParams} />;
}

async function DoctorsList({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const [doctors, settings] = await Promise.all([getDoctors(), getSettings()]);
  const specs = Array.from(new Set(doctors.map((d) => d.specialization)));
  const spec = typeof sp.spec === "string" && specs.includes(sp.spec) ? sp.spec : "";
  const list = spec ? doctors.filter((d) => d.specialization === spec) : doctors;
  const phone = settings.contacts.phones[0];

  return (
    <>
      <PageHero
        title="Врачи клиники"
        description="Каталог специалистов. Мы публикуем только проверенную информацию о враче: образование, повышение квалификации и опыт работы."
        crumbs={[{ label: "Врачи" }]}
      />
      <section className="section-tight">
        <div className="container-page">
          {doctors.length === 0 ? (
            <DoctorsEmpty phone={phone} />
          ) : (
            <>
              {specs.length > 1 && (
                <nav aria-label="Фильтр по специализации" className="mb-8 flex flex-wrap gap-2">
                  {[{ label: "Все специалисты", value: "" }, ...specs.map((s) => ({ label: s, value: s }))].map((f) => {
                    const on = spec === f.value;
                    return (
                      <Link
                        key={f.value || "all"}
                        href={f.value ? `/doctors?spec=${encodeURIComponent(f.value)}` : "/doctors"}
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((d) => (
                  <DoctorCard key={d.id} d={d} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <CTASection phone={phone} />
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

async function DoctorProfile({ slug }: { slug: string }) {
  const [d, allServices, settings, siteUrl] = await Promise.all([getDoctorBySlug(slug), getServices(), getSettings(), getSiteUrl()]);
  if (!d) notFound();
  const services = allServices.filter((s) => d.serviceIds.includes(s.id));

  const ld = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: d.fullName,
    jobTitle: d.specialization,
    image: absoluteUrl(siteUrl, d.photo),
    url: `${siteUrl}/doctors/${d.slug}`,
    worksFor: { "@id": `${siteUrl}/#clinic` },
  };

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-8 md:py-12">
          <Breadcrumbs items={[{ label: "Врачи", href: "/doctors" }, { label: d.fullName }]} />
          <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr] md:items-center lg:grid-cols-[340px_1fr] lg:gap-14">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[1.75rem] bg-brand-50 shadow-[var(--shadow-lift)] md:max-w-none">
              {d.photo ? (
                <SmartImage src={d.photo} alt={`${d.fullName}, ${d.specialization}`} fill priority sizes="340px" className="object-cover" />
              ) : (
                <span className="grid h-full place-items-center text-brand-300">
                  <UserRound size={110} strokeWidth={1.1} aria-hidden="true" />
                </span>
              )}
            </div>
            <div>
              <p className="eyebrow mb-3">{d.specialization}</p>
              <h1>{d.fullName}</h1>
              {d.experience && <p className="lead mt-4">{d.experience}</p>}
              <div className="mt-7">
                <BookButton preset={{ doctorId: d.id }} className="btn btn-primary btn-lg">
                  Записаться к врачу
                </BookButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page max-w-4xl space-y-10 py-12 md:py-16">
        {d.bio && (
          <Section title="О враче">
            <RichText text={d.bio} />
          </Section>
        )}
        {d.education && (
          <Section title="Образование">
            <RichText text={d.education} />
          </Section>
        )}
        {d.qualification && (
          <Section title="Повышение квалификации">
            <RichText text={d.qualification} />
          </Section>
        )}
        {services.length > 0 && (
          <Section title="Услуги врача">
            <ul className="grid gap-2 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.categorySlug}/${s.slug}`} className="flex min-h-12 items-center rounded-xl border border-line px-4 font-semibold hover:border-brand-300 hover:bg-brand-50">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
      <CTASection phone={settings.contacts.phones[0]} preset={{ doctorId: d.id }} />
      <JsonLd data={ld} />
    </>
  );
}
