import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { SiteShell } from "@/components/shell";
import { getSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const settings = await getSettings();
  const phone = settings.contacts.phones[0];
  return (
    <SiteShell>
      <section className="section">
        <div className="container-page mx-auto max-w-2xl text-center">
          <p className="text-[clamp(5rem,4rem+8vw,9rem)] font-extrabold leading-none tracking-tight text-brand-200">404</p>
          <h1 className="mt-4 text-[clamp(1.8rem,1.4rem+1.6vw,2.6rem)]">Такой страницы нет</h1>
          <p className="lead mt-4">Возможно, адрес введён с ошибкой или страница была перемещена. Перейдите на главную или выберите нужный раздел.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary btn-lg">
              На главную
            </Link>
            <Link href="/services" className="btn btn-secondary btn-lg">
              Услуги
            </Link>
            <Link href="/prices" className="btn btn-secondary btn-lg">
              Цены
            </Link>
          </div>
          {phone && (
            <a href={`tel:${phone.tel}`} className="mt-8 inline-flex items-center gap-2 font-bold text-brand-700">
              <Phone size={18} aria-hidden="true" /> {phone.display}
            </a>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
