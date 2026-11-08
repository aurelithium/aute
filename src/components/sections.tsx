import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarCheck,
  CalendarClock,
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  HeartHandshake,
  HelpCircle,
  Layers,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  QrCode,
  Receipt,
  ShieldCheck,
  Star,
  Stethoscope,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { BookButton, BookingForm, ServiceCard } from "@/components/client";
import { formatRating, SectionHeading, SmartImage, Stars } from "@/components/ui";
import { formatDateRu, formatPrice, hasPrice, pluralize } from "@/lib/format";
import {
  type AllSettings,
  type Category,
  type Doctor,
  type PaymentSettings,
  type PhoneItem,
  PRICE_DISCLAIMER,
  type Review,
  type ServiceWithCategory,
} from "@/lib/site";

// ───────────────────────── HeroSection ─────────────────────────
export function HeroSection({ settings, categoriesCount }: { settings: AllSettings; categoriesCount: number }) {
  const perks = [
    "Взрослая и детская стоматология",
    `${categoriesCount} направлений лечения`,
    "Запись по телефону и онлайн",
  ];
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-48 -z-10 size-[620px] rounded-full bg-brand-100/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 -z-10 size-[420px] rounded-full bg-accent-soft blur-3xl" />
      <div className="container-page grid items-center gap-12 py-10 md:py-14 lg:grid-cols-[1.02fr_1fr] lg:gap-16 lg:py-20">
        <div className="animate-fade-up">
          <p className="eyebrow">Стоматологическая клиника · Москва</p>
          <h1 className="mt-5 text-[clamp(1.9rem,1.2rem+3.6vw,4rem)]">
            Здоровье вашей улыбки начинается с <span className="text-brand-600">профессиональной заботы</span>
          </h1>
          <p className="lead mt-6 max-w-xl">
            «Квалитет» — частная стоматологическая клиника в Москве для взрослых и детей: лечение, протезирование, имплантация,
            ортодонтия и профилактика в одном месте.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <BookButton className="btn btn-primary btn-lg">Записаться на приём</BookButton>
            <Link href="/services" className="btn btn-secondary btn-lg">
              Посмотреть услуги
            </Link>
          </div>
          <ul className="mt-9 grid gap-3 text-[0.9375rem] font-semibold text-ink sm:grid-cols-1 md:grid-cols-3 md:gap-4">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-brand-100 shadow-[var(--shadow-lift)] ring-1 ring-brand-900/5">
            <SmartImage
              src={settings.site.heroImage || "/images/hero.webp"}
              alt="Стоматолог и пациентка на консультации в кабинете (иллюстративное фото)"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <a
            href={settings.contacts.twoGisReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -bottom-6 left-3 flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5 sm:-left-6"
          >
            <span className="text-4xl font-extrabold leading-none text-brand-700">{formatRating(settings.rating.value)}</span>
            <span className="text-sm leading-tight">
              <Stars value={settings.rating.value} size={16} />
              <span className="mt-1 block font-semibold">{settings.rating.count} оценки в 2ГИС</span>
            </span>
          </a>
          <div className="absolute -top-4 right-3 hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-card)] sm:flex lg:-right-4">
            <Users size={18} className="text-brand-600" aria-hidden="true" />
            Взрослые и дети
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── TrustBlock ─────────────────────────
/** Только подтверждённые показатели: рейтинг и количество оценок в 2ГИС. */
export function TrustBlock({ settings }: { settings: AllSettings }) {
  const { rating, contacts } = settings;
  return (
    <section aria-labelledby="trust-title" className="pt-14 md:pt-16">
      <div className="container-page">
        <h2 id="trust-title" className="sr-only">
          Рейтинг клиники
        </h2>
        <div className="reveal grid gap-px overflow-hidden rounded-card border border-line bg-line shadow-[var(--shadow-card)] md:grid-cols-3">
          <div className="flex items-center gap-5 bg-white p-6">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
              <Star size={26} fill="currentColor" aria-hidden="true" />
            </span>
            <div>
              <p className="text-4xl font-extrabold leading-none text-ink">
                {formatRating(rating.value)}
                <span className="text-lg font-semibold text-muted"> / 5</span>
              </p>
              <div className="mt-2">
                <Stars value={rating.value} size={16} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 bg-white p-6">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <MessageSquareText size={26} aria-hidden="true" />
            </span>
            <div>
              <p className="text-4xl font-extrabold leading-none text-ink">{rating.count}</p>
              <p className="mt-2 text-sm text-muted">
                {pluralize(rating.count, "оценка", "оценки", "оценок")} пользователей в {rating.source}
              </p>
            </div>
          </div>
          <a
            href={contacts.twoGisReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 bg-brand-700 p-6 text-white transition-colors hover:bg-brand-800"
          >
            <span>
              <span className="block text-lg font-bold">Читать отзывы в 2ГИС</span>
              <span className="mt-1 block text-sm text-brand-100">Откроется карточка клиники на 2gis.ru</span>
            </span>
            <ArrowUpRight size={28} aria-hidden="true" className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">
          Рейтинг и количество оценок — по данным карточки клиники в {rating.source}. Оценки пользователей — это не то же самое, что текстовые отзывы.
        </p>
      </div>
    </section>
  );
}

// ───────────────────────── CategoryGrid ─────────────────────────
export function CategoryCard({ c, priority = false }: { c: Category; priority?: boolean }) {
  return (
    <Link href={`/services/${c.slug}`} className="group card card-hover flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        {c.image && (
          <SmartImage
            src={c.image}
            alt={`Направление «${c.title}» — иллюстрация`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-950/35 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl">{c.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{c.shortDescription}</p>
        <span className="link-arrow mt-auto pt-4">
          Подробнее <ArrowRight size={17} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="section" aria-labelledby="directions-title">
      <div className="container-page">
        <div id="directions-title">
          <SectionHeading
            eyebrow="Направления"
            title="Стоматология для взрослых и детей"
            description="Выберите направление, чтобы узнать об услугах и стоимости."
            href="/services"
            hrefLabel="Все услуги"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c.id} className="reveal">
              <CategoryCard c={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── FeaturedServices ─────────────────────────
export function FeaturedServices({ services }: { services: ServiceWithCategory[] }) {
  if (services.length === 0) return null;
  return (
    <section className="section bg-surface-alt" aria-labelledby="featured-title">
      <div className="container-page">
        <div id="featured-title">
          <SectionHeading
            eyebrow="Услуги и стоимость"
            title="Основные услуги клиники"
            description="Стоимость указана по прайс-листу. Итоговую сумму врач называет после осмотра."
            href="/services"
            hrefLabel="Каталог услуг"
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="reveal">
              <ServiceCard s={s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Advantages ─────────────────────────
const ITEMS = [
  {
    icon: Layers,
    title: "Комплексный подход",
    text: "Хирургия, имплантация, ортопедия, терапия, ортодонтия и пародонтология — в одной клинике.",
  },
  {
    icon: Users,
    title: "Взрослые и дети",
    text: "Приём ведётся по взрослой и детской стоматологии, включая лечение молочных зубов.",
  },
  {
    icon: Stethoscope,
    title: "Консультации специалистов",
    text: "Можно начать с консультации хирурга-имплантолога, ортопеда, ортодонта или пародонтолога.",
  },
  {
    icon: HeartHandshake,
    title: "Внимание к пациенту",
    text: "Врач объясняет план лечения и согласует его с вами до начала работы.",
  },
  {
    icon: Receipt,
    title: "Понятная стоимость",
    text: "Прайс-лист опубликован на сайте, а итоговую стоимость врач называет после осмотра.",
  },
  {
    icon: CalendarCheck,
    title: "Удобная запись",
    text: "Записаться можно по одному из трёх телефонов или через форму на сайте.",
  },
];

export function Advantages() {
  return (
    <section className="section" aria-labelledby="adv-title">
      <div className="container-page">
        <div id="adv-title">
          <SectionHeading eyebrow="Почему «Квалитет»" title="Что важно для пациентов" description="Спокойный и последовательный подход к лечению на каждом этапе." />
        </div>
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="reveal flex gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon size={26} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg">{title}</h3>
                <p className="mt-1.5 text-[0.9375rem] text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────── AboutBlock ─────────────────────────
export function AboutBlock({ image }: { image: string }) {
  return (
    <section className="section bg-surface-alt" aria-labelledby="about-title">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="reveal relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[var(--shadow-lift)]">
            <SmartImage
              src={image}
              alt="Стоматологический кабинет с креслом и оборудованием (иллюстративное фото)"
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
          <div aria-hidden="true" className="absolute -bottom-4 -right-4 -z-10 size-full rounded-[1.75rem] border-2 border-brand-200" />
          <p className="mt-3 text-xs text-muted">Иллюстративное фото. Фотографии клиники будут добавлены после согласования.</p>
        </div>
        <div className="reveal">
          <p className="eyebrow mb-3">О клинике</p>
          <h2 id="about-title">Частная стоматологическая клиника в Москве</h2>
          <p className="mt-5 text-lg text-muted">
            «Квалитет» принимает взрослых и детей и предлагает лечение по восьми направлениям — от диагностики и терапии до хирургии,
            имплантации и ортодонтии. На консультации врач осматривает полость рта, объясняет варианты лечения и ориентировочную стоимость.
          </p>
          <ul className="mt-6 space-y-3">
            {["Первичная консультация специалиста", "План лечения согласуется до начала работы", "Диагностика: ОПТГ и прицельные снимки"].map((t) => (
              <li key={t} className="flex items-start gap-3 font-semibold">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link href="/about" className="btn btn-primary mt-8">
            Подробнее о клинике
          </Link>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── DoctorCard ─────────────────────────
export function DoctorCard({ d }: { d: Doctor }) {
  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <Link href={`/doctors/${d.slug}`} className="relative block aspect-[4/5] bg-brand-50" aria-label={d.fullName}>
        {d.photo ? (
          <SmartImage src={d.photo} alt={`${d.fullName}, ${d.specialization}`} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-brand-300">
            <UserRound size={84} strokeWidth={1.2} aria-hidden="true" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug">
          <Link href={`/doctors/${d.slug}`} className="hover:text-brand-700">
            {d.fullName}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-semibold text-brand-600">{d.specialization}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={`/doctors/${d.slug}`} className="btn btn-secondary btn-sm">
            Подробнее
          </Link>
          <BookButton preset={{ doctorId: d.id }} className="btn btn-primary btn-sm">
            Записаться
          </BookButton>
        </div>
      </div>
    </article>
  );
}

// ───────────────────────── DoctorsBlock ─────────────────────────
const CONSULTATIONS = ["Хирург-имплантолог", "Врач-ортопед", "Ортодонт", "Врач-пародонтолог"];

/** Если профили врачей ещё не добавлены в данные сайта — аккуратная информационная заглушка без вымышленных данных. */
export function DoctorsEmpty({ phone }: { phone?: PhoneItem }) {
  return (
    <div className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Stethoscope size={28} aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-2xl">Профили врачей скоро появятся на сайте</h3>
        <p className="mt-3 text-muted">
          Мы публикуем только проверенную информацию о специалистах: образование, повышение квалификации и опыт работы. Сейчас каталог
          наполняется. Узнать, кто из врачей ведёт приём по нужному направлению, можно у администратора.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <BookButton className="btn btn-primary">Записаться на приём</BookButton>
          {phone && (
            <a href={`tel:${phone.tel}`} className="btn btn-secondary">
              <Phone size={18} aria-hidden="true" /> {phone.display}
            </a>
          )}
        </div>
      </div>
      <div className="rounded-2xl bg-brand-50 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-700">Консультации по прайс-листу</p>
        <ul className="mt-4 space-y-2.5">
          {CONSULTATIONS.map((c) => (
            <li key={c} className="flex items-center gap-3 font-semibold">
              <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
        <Link href="/prices" className="link-arrow mt-5 text-sm">
          Стоимость консультаций
        </Link>
      </div>
    </div>
  );
}

export function DoctorsBlock({ doctors, phone }: { doctors: Doctor[]; phone?: PhoneItem }) {
  return (
    <section className="section" aria-labelledby="doctors-title">
      <div className="container-page">
        <div id="doctors-title">
          <SectionHeading
            eyebrow="Специалисты"
            title="Врачи клиники"
            description="Информация о специалистах публикуется после проверки данных."
            href={doctors.length ? "/doctors" : undefined}
            hrefLabel="Все врачи"
          />
        </div>
        {doctors.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.slice(0, 4).map((d) => (
              <div key={d.id} className="reveal">
                <DoctorCard d={d} />
              </div>
            ))}
          </div>
        ) : (
          <DoctorsEmpty phone={phone} />
        )}
      </div>
    </section>
  );
}

// ───────────────────────── PricePreview ─────────────────────────
export function PricePreview({ services, sourceDate }: { services: ServiceWithCategory[]; sourceDate: string }) {
  // По одной позиции из каждого направления — наглядный срез прайса
  const seen = new Set<string>();
  const rows = services.filter((s) => {
    if (!hasPrice(s) || seen.has(s.categorySlug)) return false;
    seen.add(s.categorySlug);
    return true;
  });
  return (
    <section className="section bg-surface-alt" aria-labelledby="prices-title">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <div id="prices-title">
            <SectionHeading eyebrow="Цены" title="Стоимость услуг" description="Полный прайс-лист по всем направлениям опубликован на отдельной странице." />
          </div>
          <p className="-mt-4 text-sm text-muted">
            Цены по данным на {formatDateRu(sourceDate)}. {PRICE_DISCLAIMER}
          </p>
          <Link href="/prices" className="btn btn-primary mt-7">
            Смотреть все цены <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <ul className="reveal card divide-y divide-line overflow-hidden">
          {rows.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-600">{s.categoryTitle}</p>
                <Link href={`/services/${s.categorySlug}/${s.slug}`} className="font-semibold hover:text-brand-700">
                  {s.title}
                </Link>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="whitespace-nowrap text-lg font-extrabold">{formatPrice(s)}</span>
                <BookButton preset={{ serviceId: s.id }} className="btn btn-secondary btn-sm">
                  Записаться
                </BookButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────── ReviewBlock ─────────────────────────
export function RatingCard({ settings }: { settings: AllSettings }) {
  const { rating, contacts } = settings;
  return (
    <div className="rounded-card bg-brand-800 p-7 text-white sm:p-9">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-200">Рейтинг в {rating.source}</p>
      <p className="mt-4 flex items-end gap-3">
        <span className="text-7xl font-extrabold leading-none">{formatRating(rating.value)}</span>
        <span className="pb-2 text-xl font-semibold text-brand-200">из 5</span>
      </p>
      <div className="mt-4">
        <Stars value={rating.value} size={24} />
      </div>
      <p className="mt-3 text-brand-100">
        {rating.count} {pluralize(rating.count, "оценка", "оценки", "оценок")} пользователей
      </p>
      <a href={contacts.twoGisReviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-light mt-7 w-full sm:w-auto">
        Отзывы в 2ГИС <ExternalLink size={17} aria-hidden="true" />
      </a>
    </div>
  );
}

export function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <Stars value={r.rating} size={17} />
      <blockquote className="mt-4 flex-1 whitespace-pre-line text-[0.9375rem] leading-relaxed">{r.text}</blockquote>
      <figcaption className="mt-5 border-t border-line pt-4 text-sm">
        <span className="font-bold">{r.authorName}</span>
        <span className="block text-muted">
          {r.source}
          {r.reviewDate ? ` · ${formatDateRu(r.reviewDate)}` : ""}
          {r.sourceUrl && (
            <>
              {" · "}
              <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">
                источник
              </a>
            </>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewBlock({ settings, reviews }: { settings: AllSettings; reviews: Review[] }) {
  return (
    <section className="section" aria-labelledby="reviews-title">
      <div className="container-page">
        <div id="reviews-title">
          <SectionHeading
            eyebrow="Отзывы"
            title="Что говорят пациенты"
            description="Мы не публикуем выдуманных отзывов: оценки и тексты берём из первоисточника — карточки клиники в 2ГИС."
            href="/reviews"
            hrefLabel="Все об отзывах"
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="reveal">
            <RatingCard settings={settings} />
          </div>
          {reviews.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {reviews.slice(0, 2).map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col justify-center p-7 sm:p-9">
              <h3 className="text-2xl">Читайте отзывы в первоисточнике</h3>
              <p className="mt-3 max-w-lg text-muted">
                Все отзывы пациентов опубликованы в карточке клиники в 2ГИС. Там же можно задать вопрос и посмотреть фотографии. Подтверждённые
                отзывы будут добавляться на сайт после проверки.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a href={settings.contacts.twoGisReviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Перейти к отзывам
                </a>
                <a href={settings.contacts.twoGisQuestionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Вопросы и ответы
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── PaymentBlock ─────────────────────────
const ICONS: Record<string, typeof Wallet> = {
  card: CreditCard,
  cash: Banknote,
  qr: QrCode,
  installments: CalendarClock,
};

export function PaymentBlock({ payments, id = "payment" }: { payments: PaymentSettings; id?: string }) {
  const methods = payments.methods.filter((m) => m.enabled);
  if (methods.length === 0) return null;
  return (
    <section id={id} className="section-tight scroll-mt-24" aria-labelledby={`${id}-title`}>
      <div className="container-page">
        <div id={`${id}-title`}>
          <SectionHeading eyebrow="Оплата" title="Способы оплаты" description="Выберите удобный способ оплаты лечения." />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m) => {
            const Icon = ICONS[m.key] ?? Wallet;
            const isInstallments = m.key === "installments";
            return (
              <li key={m.key} className="reveal card flex flex-col p-6">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg">{m.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{m.description}</p>
                {isInstallments && (
                  <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm text-ink">
                    {payments.installmentsInfo || "Условия рассрочки (банк, срок, лимит) уточняйте у администратора клиники."}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────── BookingSection ─────────────────────────
/** Заметный блок записи на приём с формой. */
export function BookingSection({ phones, id = "booking" }: { phones: PhoneItem[]; id?: string }) {
  return (
    <section id={id} className="section scroll-mt-24" aria-labelledby="booking-section-title">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-800 p-6 sm:p-10 lg:p-14">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-600/40 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="text-white">
              <p className="eyebrow !text-brand-200">Запись на приём</p>
              <h2 id="booking-section-title" className="mt-4 !text-white">
                Запишитесь на консультацию
              </h2>
              <p className="mt-4 max-w-md text-lg text-brand-100">
                Заполните форму или позвоните сами. На демо-сайте форма данные не отправляет — так вы можете оценить, как будет выглядеть запись.
              </p>
              <ul className="mt-8 space-y-3">
                {phones.map((p) => (
                  <li key={p.tel}>
                    <a href={`tel:${p.tel}`} className="inline-flex min-h-12 items-center gap-3 text-xl font-bold hover:underline sm:text-2xl">
                      <span className="grid size-10 place-items-center rounded-full bg-white/10">
                        <Phone size={18} aria-hidden="true" />
                      </span>
                      {p.display}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="mt-8 space-y-3 text-sm text-brand-100">
                <li className="flex items-center gap-3">
                  <CalendarCheck size={18} aria-hidden="true" className="text-brand-300" /> Время приёма согласует администратор
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck size={18} aria-hidden="true" className="text-brand-300" /> На демо-сайте данные не отправляются и не сохраняются
                </li>
              </ul>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-lift)] sm:p-8">
              <BookingForm headingId="booking-section-form-title" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── ContactBlock ─────────────────────────
const MAP_HOSTS = ["yandex.ru", "yandex.com", "2gis.ru", "www.google.com", "google.com", "www.openstreetmap.org", "openstreetmap.org"];

function safeMapUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    return MAP_HOSTS.includes(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

export function MapBlock({ settings }: { settings: AllSettings }) {
  const c = settings.contacts;
  const src = c.mapEmbedUrl ? safeMapUrl(c.mapEmbedUrl) : null;
  if (src) {
    return (
      <div className="card overflow-hidden">
        <iframe
          src={src}
          title="Карта проезда к клинике"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[360px] w-full border-0 lg:h-full lg:min-h-[420px]"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="card flex h-full min-h-[320px] flex-col items-center justify-center bg-brand-50 p-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-white text-brand-600 shadow-[var(--shadow-card)]">
        <MapPin size={30} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl">Карта будет подключена после подтверждения адреса</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Точный адрес клиники пока не опубликован на сайте. Уточните его по телефону или в карточке клиники в 2ГИС.
      </p>
      <a href={c.twoGisUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-6">
        Открыть в 2ГИС <ExternalLink size={16} aria-hidden="true" />
      </a>
    </div>
  );
}

export function ContactBlock({ settings, withMap = true }: { settings: AllSettings; withMap?: boolean }) {
  const c = settings.contacts;
  return (
    <div className={`grid gap-6 ${withMap ? "lg:grid-cols-[1fr_1fr]" : ""}`}>
      <div className="card p-6 sm:p-8">
        <h3 className="text-2xl">Квалитет — стоматологическая клиника</h3>
        <p className="mt-2 text-muted">{c.contactText}</p>

        <ul className="mt-6 space-y-3">
          {c.phones.map((p) => (
            <li key={p.tel}>
              <a
                href={`tel:${p.tel}`}
                className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line px-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="flex items-center gap-3 text-lg font-bold">
                  <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand-600 group-hover:bg-white">
                    <Phone size={18} aria-hidden="true" />
                  </span>
                  {p.display}
                </span>
                <span className="hidden text-xs font-semibold uppercase tracking-wide text-muted sm:inline">Позвонить</span>
              </a>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-4 text-[0.9375rem]">
          <div className="flex gap-3">
            <dt className="mt-0.5 text-brand-600">
              <MapPin size={20} aria-hidden="true" />
              <span className="sr-only">Адрес</span>
            </dt>
            <dd>{c.address || <span className="text-muted">Адрес уточняйте по телефону или в карточке 2ГИС.</span>}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="mt-0.5 text-brand-600">
              <Clock size={20} aria-hidden="true" />
              <span className="sr-only">График работы</span>
            </dt>
            <dd className="whitespace-pre-line">{c.workingHours || <span className="text-muted">График работы уточняйте по телефону.</span>}</dd>
          </div>
          {c.email && (
            <div className="flex gap-3">
              <dt className="mt-0.5 text-brand-600">
                <Mail size={20} aria-hidden="true" />
                <span className="sr-only">Электронная почта</span>
              </dt>
              <dd>
                <a href={`mailto:${c.email}`} className="font-semibold text-brand-600 underline">
                  {c.email}
                </a>
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
          <a href={c.twoGisUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            Карточка в 2ГИС <ExternalLink size={15} aria-hidden="true" />
          </a>
          <a href={c.twoGisReviewsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            <Star size={15} aria-hidden="true" /> Отзывы
          </a>
          <a href={c.twoGisQuestionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            <HelpCircle size={15} aria-hidden="true" /> Вопросы
          </a>
        </div>
      </div>
      {withMap && <MapBlock settings={settings} />}
    </div>
  );
}
