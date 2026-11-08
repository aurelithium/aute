import type { Metadata } from "next";
import { CalendarDays, Info, TriangleAlert } from "lucide-react";
import { type PriceGroup, PriceList } from "@/components/client";
import { CTASection, PageHero } from "@/components/shell";
import { formatDateRu, hasPrice } from "@/lib/format";
import {
  getCategories,
  getServices,
  getSettings,
  MEDICAL_DISCLAIMER,
  pageMetadata,
  PRICE_DISCLAIMER,
} from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Цены на стоматологические услуги в Москве",
  description:
    "Прайс-лист стоматологической клиники «Квалитет» в Москве: хирургия, имплантация, ортопедия, терапия, детская стоматология, ортодонтия, пародонтология. Стоимость услуг и запись на приём.",
  path: "/prices",
});

export default async function PricesPage() {
  const [categories, services, settings] = await Promise.all([getCategories(), getServices(), getSettings()]);
  const groups: PriceGroup[] = categories
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      items: services
        .filter((s) => s.categorySlug === c.slug)
        .map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          priceType: s.priceType,
          priceMin: s.priceMin,
          priceMax: s.priceMax,
          priceNote: s.priceNote,
        })),
    }))
    .filter((g) => g.items.length > 0);

  const priced = services.filter(hasPrice).length;
  const unpriced = services.length - priced;
  const { prices } = settings;

  return (
    <>
      <PageHero
        title="Цены на стоматологические услуги"
        description="Стоимость услуг клиники «Квалитет» по направлениям. Итоговую цену лечения врач называет после осмотра и составления плана."
        crumbs={[{ label: "Цены" }]}
      />

      <section className="section-tight">
        <div className="container-page">
          <div className="mb-8 grid gap-4 lg:grid-cols-3">
            <div className="card flex gap-4 p-5">
              <CalendarDays className="mt-0.5 shrink-0 text-brand-600" size={24} aria-hidden="true" />
              <div className="text-sm">
                <p className="font-bold">Дата обновления исходных цен</p>
                <p className="mt-1 text-muted">
                  <time dateTime={prices.sourceDate}>{formatDateRu(prices.sourceDate)}</time>
                  {prices.updatedAt && <> · изменения на сайте: {formatDateRu(prices.updatedAt)}</>}
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-card border border-amber-200 bg-amber-50 p-5">
              <TriangleAlert className="mt-0.5 shrink-0 text-amber-700" size={24} aria-hidden="true" />
              <div className="text-sm">
                <p className="font-bold text-amber-900">{PRICE_DISCLAIMER}</p>
                <p className="mt-1 text-amber-900/80">Стоимость может меняться — актуальную цену уточняйте у администратора перед записью.</p>
              </div>
            </div>
            <div className="card flex gap-4 p-5">
              <Info className="mt-0.5 shrink-0 text-brand-600" size={24} aria-hidden="true" />
              <div className="text-sm">
                <p className="font-bold">Как читать цены</p>
                <p className="mt-1 text-muted">
                  «от» — минимальная стоимость, «1 000–3 000 ₽» — диапазон. В прайсе {priced} {priced === 1 ? "позиция" : "позиции"} с ценой
                  {unpriced > 0 && ` и ${unpriced} без указанной цены (диагностика)`}.
                </p>
              </div>
            </div>
          </div>

          <PriceList groups={groups} />

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">
            Цены приведены по данным на {formatDateRu(prices.sourceDate)} и подлежат подтверждению клиникой. {PRICE_DISCLAIMER} {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </section>

      <CTASection title="Нужна консультация по стоимости лечения?" text="Запишитесь на приём — врач осмотрит и подготовит план лечения с понятной стоимостью." phone={settings.contacts.phones[0]} />
    </>
  );
}
