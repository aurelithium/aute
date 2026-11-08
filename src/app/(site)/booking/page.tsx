import type { Metadata } from "next";
import { CalendarCheck, Phone, ShieldCheck } from "lucide-react";
import { BookingForm } from "@/components/client";
import { PageHero } from "@/components/shell";
import { getServices, getSettings, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Запись на приём к стоматологу в Москве",
  description: "Запишитесь на приём в стоматологическую клинику «Квалитет» в Москве: онлайн-заявка или звонок по телефону.",
  path: "/booking",
});

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const svc = typeof sp.service === "string" ? services.find((s) => s.slug === sp.service) : undefined;
  const cat = typeof sp.category === "string" ? sp.category : undefined;

  return (
    <>
      <PageHero
        title="Запись на приём"
        description="Заполните форму — администратор свяжется с вами, ответит на вопросы и согласует удобное время."
        crumbs={[{ label: "Запись на приём" }]}
      />
      <section className="section-tight">
        <div className="container-page grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <div className="card p-5 sm:p-8">
            <BookingForm
              headingId="booking-page-title"
              preset={{ serviceId: svc?.id, categorySlug: svc?.categorySlug ?? cat }}
            />
          </div>
          <aside className="space-y-5" aria-label="Другие способы записи">
            <div className="card p-6">
              <h2 className="text-xl">Записаться по телефону</h2>
              <ul className="mt-4 space-y-2">
                {settings.contacts.phones.map((p) => (
                  <li key={p.tel}>
                    <a href={`tel:${p.tel}`} className="flex min-h-12 items-center gap-3 rounded-xl border border-line px-4 font-bold hover:border-brand-300 hover:bg-brand-50">
                      <Phone size={18} className="text-brand-600" aria-hidden="true" />
                      {p.display}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card space-y-4 bg-brand-50 p-6 text-sm">
              <p className="flex gap-3">
                <CalendarCheck size={20} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>Это демо-форма: данные не отправляются. Чтобы записаться, позвоните по одному из телефонов.</span>
              </p>
              <p className="flex gap-3">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>Мы не просим подробных медицинских сведений — их обсудит врач на приёме.</span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
