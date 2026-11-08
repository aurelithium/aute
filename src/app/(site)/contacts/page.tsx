import type { Metadata } from "next";
import { BookingForm } from "@/components/client";
import { ContactBlock, PaymentBlock } from "@/components/sections";
import { PageHero } from "@/components/shell";
import { getSettings, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Контакты стоматологической клиники в Москве",
  description:
    "Контакты клиники «Квалитет» в Москве: телефоны +7 (499) 481-32-08, +7 (499) 481-97-00, +7 (966) 019-41-19, карточка в 2ГИС, способы оплаты, форма обратной связи.",
  path: "/contacts",
});

export default async function ContactsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHero
        title="Контакты"
        description="Позвоните нам или оставьте сообщение — администратор свяжется с вами."
        crumbs={[{ label: "Контакты" }]}
      />
      <section className="section-tight">
        <div className="container-page">
          <ContactBlock settings={settings} />
        </div>
      </section>

      <PaymentBlock payments={settings.payments} id="payment" />

      <section className="section-tight" aria-labelledby="feedback-title">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow mb-3">Обратная связь</p>
            <h2 id="feedback-title">Напишите нам</h2>
            <p className="mt-4 text-lg text-muted">
              Демонстрационная форма: сообщение никуда не отправляется. В рабочей версии здесь можно будет задать вопрос о лечении, записи или оплате. Чтобы записаться на конкретную услугу, воспользуйтесь{" "}
              <a href="/booking" className="font-semibold text-brand-600 underline">
                формой записи на приём
              </a>
              .
            </p>
          </div>
          <div className="card p-5 sm:p-8">
            <BookingForm kind="feedback" headingId="feedback-form-title" title="Сообщение клинике" />
          </div>
        </div>
      </section>
    </>
  );
}
