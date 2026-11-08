import type { Metadata } from "next";
import { Info } from "lucide-react";
import { RatingCard, ReviewCard } from "@/components/sections";
import { CTASection, PageHero } from "@/components/shell";
import { getReviews, getSettings, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Отзывы о клинике «Квалитет»",
  description: "Рейтинг клиники «Квалитет» в 2ГИС — 4,9 из 5 на основании 42 оценок. Отзывы пациентов в первоисточнике.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const [settings, reviews] = await Promise.all([getSettings(), getReviews()]);
  const c = settings.contacts;
  return (
    <>
      <PageHero
        title="Отзывы о клинике"
        description="Мы показываем только подтверждённые данные — рейтинг и оценки из карточки клиники в 2ГИС."
        crumbs={[{ label: "Отзывы" }]}
      />
      <section className="section-tight">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
            <RatingCard settings={settings} />
            <div className="card p-7 sm:p-9">
              <h2 className="text-2xl">Где читать отзывы пациентов</h2>
              <p className="mt-3 text-muted">
                Все отзывы пациентов размещены в карточке клиники в 2ГИС. Там же можно оставить собственный отзыв, задать вопрос клинике и посмотреть
                фотографии.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={c.twoGisReviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Читать отзывы в 2ГИС
                </a>
                <a href={c.twoGisQuestionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Вопросы клинике
                </a>
              </div>
              <p className="mt-6 flex gap-3 rounded-xl bg-brand-50 p-4 text-sm text-muted">
                <Info size={18} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>
                  Число {settings.rating.count} — это количество оценок пользователей, а не количество текстовых отзывов.
                </span>
              </p>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="mt-14">
              <h2 className="mb-6">Опубликованные отзывы</h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} r={r} />
                ))}
              </div>
              <p className="mt-5 text-xs text-muted">Отзывы публикуются с указанием источника и проверяются администратором сайта.</p>
            </div>
          )}
        </div>
      </section>
      <CTASection phone={c.phones[0]} />
    </>
  );
}
