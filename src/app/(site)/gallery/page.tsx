import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import { Gallery } from "@/components/client";
import { CTASection, PageHero } from "@/components/shell";
import { GALLERY_CATEGORIES, getGallery, getSettings, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Фотогалерея стоматологической клиники",
  description: "Фотографии стоматологической клиники «Квалитет»: кабинеты, интерьер, оборудование.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const [items, settings] = await Promise.all([getGallery(), getSettings()]);
  return (
    <>
      <PageHero
        title="Фотогалерея"
        description="Фотографии кабинетов, интерьера и оборудования. Нажмите на фото, чтобы увеличить."
        crumbs={[{ label: "Фотогалерея" }]}
      />
      <section className="section-tight">
        <div className="container-page">
          <p className="mb-8 flex gap-3 rounded-xl bg-brand-50 p-4 text-sm text-muted">
            <ImageIcon size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
            <span>
              Часть изображений — иллюстративные стоковые фотографии: на них не показаны реальные кабинеты или специалисты клиники. Фотографии
              «Квалитет» появятся здесь после согласования. Больше фото — в{" "}
              <a href={settings.contacts.twoGisGalleryUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">
                карточке клиники в 2ГИС
              </a>
              .
            </span>
          </p>
          {items.length > 0 ? (
            <Gallery items={items} categories={[...GALLERY_CATEGORIES]} showFilter />
          ) : (
            <div className="card p-10 text-center text-muted">Фотографии скоро появятся в галерее.</div>
          )}
        </div>
      </section>
      <CTASection phone={settings.contacts.phones[0]} />
    </>
  );
}
