import type { Metadata } from "next";
import { CalendarClock, Phone } from "lucide-react";
import { BookButton } from "@/components/client";
import { CTASection, PageHero } from "@/components/shell";
import { RichText, SmartImage } from "@/components/ui";
import { promoPeriod } from "@/lib/format";
import { getPromotions, getSettings, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Акции и специальные предложения",
  description: "Акции и специальные предложения стоматологической клиники «Квалитет» в Москве.",
  path: "/promotions",
});

export default async function PromotionsPage() {
  const [promos, settings] = await Promise.all([getPromotions(), getSettings()]);
  const phone = settings.contacts.phones[0];
  return (
    <>
      <PageHero
        title="Акции и специальные предложения"
        description="Здесь публикуются действующие акции клиники с условиями и сроками."
        crumbs={[{ label: "Акции" }]}
      />
      <section className="section-tight">
        <div className="container-page">
          {promos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {promos.map((p) => {
                const period = promoPeriod(p.startsAt, p.endsAt);
                return (
                  <article key={p.id} className="card flex flex-col overflow-hidden">
                    {p.image && (
                      <div className="relative aspect-[16/10] bg-brand-50">
                        <SmartImage src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {period && (
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
                          <CalendarClock size={15} aria-hidden="true" /> {period}
                        </p>
                      )}
                      <h2 className="mt-2 text-xl">{p.title}</h2>
                      <p className="mt-2 text-sm text-muted">{p.summary}</p>
                      {p.conditions && (
                        <details className="mt-4 rounded-xl border border-line p-3">
                          <summary className="font-semibold">Подробные условия</summary>
                          <RichText text={p.conditions} className="mt-3 !text-sm" />
                        </details>
                      )}
                      <BookButton className="btn btn-primary btn-sm mt-auto">Записаться</BookButton>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-accent-soft text-accent">
                <CalendarClock size={30} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl">Сейчас на сайте нет активных акций</h2>
              <p className="mt-3 text-muted">
                Информацию о специальных предложениях можно уточнить по телефону — администратор расскажет о действующих условиях.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                {phone && (
                  <a href={`tel:${phone.tel}`} className="btn btn-primary">
                    <Phone size={18} aria-hidden="true" /> {phone.display}
                  </a>
                )}
                <BookButton className="btn btn-secondary">Записаться на приём</BookButton>
              </div>
            </div>
          )}
        </div>
      </section>
      <CTASection phone={phone} />
    </>
  );
}
