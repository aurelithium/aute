import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Advantages, ContactBlock } from "@/components/sections";
import { CTASection, PageHero } from "@/components/shell";
import { SmartImage } from "@/components/ui";
import { getCategories, getSettings, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "О клинике «Квалитет»",
  description:
    "«Квалитет» — частная стоматологическая клиника в Москве для взрослых и детей. Направления лечения, порядок первого приёма, контакты.",
  path: "/about",
});

const STEPS = [
  { t: "Запись", d: "Вы звоните в клинику или оставляете заявку на сайте — администратор согласовывает удобное время." },
  { t: "Консультация", d: "Врач выслушивает ваши жалобы, осматривает полость рта и при необходимости назначает диагностику." },
  { t: "План лечения", d: "Врач рассказывает о возможных вариантах лечения, этапах и ориентировочной стоимости." },
  { t: "Лечение и наблюдение", d: "После согласования плана проводится лечение. Врач даёт рекомендации по уходу и дальнейшим визитам." },
];

export default async function AboutPage() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  return (
    <>
      <PageHero
        title="О клинике «Квалитет»"
        description="Частная стоматологическая клиника в Москве. Мы принимаем взрослых и детей и предлагаем лечение по нескольким направлениям в одном месте."
        crumbs={[{ label: "О клинике" }]}
      />

      <section className="section-tight">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-lift)]">
            <SmartImage
              src={settings.site.aboutImage || "/images/about.webp"}
              alt="Стоматологический кабинет с креслом и оборудованием (иллюстративное фото)"
              fill
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2>Спокойный подход к лечению</h2>
            <div className="mt-5 space-y-4 text-lg text-muted">
              <p>
                В «Квалитет» можно получить консультацию по разным стоматологическим направлениям: от терапии и гигиены до хирургии, имплантации,
                ортопедии, ортодонтии и пародонтологии. Отдельное направление — детская стоматология.
              </p>
              <p>
                Мы стремимся, чтобы пациент понимал, что и зачем делается: врач объясняет план лечения и согласует его до начала работы.
              </p>
            </div>
            <p className="mt-5 text-xs text-muted">Иллюстративное фото. Фотографии клиники будут добавлены после согласования.</p>
          </div>
        </div>
      </section>

      <section className="section-tight bg-surface-alt" aria-labelledby="about-dir">
        <div className="container-page">
          <h2 id="about-dir" className="mb-8">
            Направления клиники
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/services/${c.slug}`} className="group card card-hover flex h-full flex-col p-5">
                  <span className="text-lg font-bold">{c.title}</span>
                  <span className="mt-1.5 line-clamp-2 text-sm text-muted">{c.shortDescription}</span>
                  <span className="link-arrow mt-4 pt-1 text-sm">
                    Подробнее <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="about-steps">
        <div className="container-page">
          <h2 id="about-steps" className="mb-8">
            Как проходит первое обращение
          </h2>
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="card relative p-6">
                <span className="grid size-10 place-items-center rounded-full bg-brand-600 text-lg font-extrabold text-white">{i + 1}</span>
                <h3 className="mt-4 text-lg">{s.t}</h3>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-muted">Порядок приёма может отличаться в зависимости от направления и ситуации — детали уточняйте у администратора.</p>
        </div>
      </section>

      <Advantages />
      <CTASection phone={settings.contacts.phones[0]} />
      <section className="section-tight pt-0">
        <div className="container-page">
          <h2 className="mb-6 text-2xl">Контакты</h2>
          <ContactBlock settings={settings} withMap={false} />
        </div>
      </section>
    </>
  );
}
