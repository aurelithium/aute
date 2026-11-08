import type { Metadata } from "next";
import Link from "next/link";
import { Gallery } from "@/components/client";
import {
  AboutBlock,
  Advantages,
  BookingSection,
  CategoryGrid,
  ContactBlock,
  DoctorsBlock,
  FeaturedServices,
  HeroSection,
  PaymentBlock,
  PricePreview,
  ReviewBlock,
  TrustBlock,
} from "@/components/sections";
import { SectionHeading } from "@/components/ui";
import {
  GALLERY_CATEGORIES,
  getCategories,
  getDoctors,
  getGallery,
  getReviews,
  getServices,
  getSettings,
} from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, categories, services, doctors, gallery, reviews] = await Promise.all([
    getSettings(),
    getCategories(),
    getServices(),
    getDoctors(),
    getGallery(),
    getReviews(),
  ]);
  const featured = services.filter((s) => s.featured).slice(0, 6);
  const c = settings.contacts;

  return (
    <>
      <HeroSection settings={settings} categoriesCount={categories.length} />
      <TrustBlock settings={settings} />
      <CategoryGrid categories={categories} />
      <FeaturedServices services={featured} />
      <Advantages />
      <AboutBlock image={settings.site.aboutImage || "/images/about.webp"} />
      <DoctorsBlock doctors={doctors} phone={c.phones[0]} />
      <PricePreview services={services} sourceDate={settings.prices.sourceDate} />
      <ReviewBlock settings={settings} reviews={reviews} />

      {gallery.length > 0 && (
        <section className="section" aria-labelledby="gallery-title">
          <div className="container-page">
            <div id="gallery-title">
              <SectionHeading
                eyebrow="Фотогалерея"
                title="Фотографии"
                description="Иллюстративные изображения. Фотографии клиники будут добавлены после согласования."
                href="/gallery"
                hrefLabel="Вся галерея"
              />
            </div>
            <Gallery items={gallery} categories={[...GALLERY_CATEGORIES]} limit={6} columns="3" />
            <p className="mt-5 text-sm text-muted">
              Больше фотографий — в{" "}
              <Link href="/gallery" className="font-semibold text-brand-600 underline">
                галерее
              </Link>{" "}
              и{" "}
              <a href={c.twoGisGalleryUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">
                карточке клиники в 2ГИС
              </a>
              .
            </p>
          </div>
        </section>
      )}

      <PaymentBlock payments={settings.payments} id="payment" />
      <BookingSection phones={c.phones} />

      <section className="section-tight" aria-labelledby="contacts-title">
        <div className="container-page">
          <div id="contacts-title">
            <SectionHeading eyebrow="Контакты" title="Как с нами связаться" href="/contacts" hrefLabel="Все контакты" />
          </div>
          <ContactBlock settings={settings} />
        </div>
      </section>
    </>
  );
}
