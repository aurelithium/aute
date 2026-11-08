"use client";

import {
  createContext,
  type FormEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  Info,
  Loader2,
  Menu,
  Phone,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, SmartImage } from "@/components/ui";
import { formatPrice, hasPrice, maskPhoneInput, normalizePhone, pluralize } from "@/lib/format";
import type { BookingOptions, PhoneItem, ServiceWithCategory } from "@/lib/site";

// ───────────────────────── Modal ─────────────────────────
/**
 * Доступное модальное окно на нативном <dialog>:
 * фокус удерживается внутри, Escape закрывает, клик по фону закрывает.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  className = "",
  panelClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onMouseDown={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={`modal-panel ${panelClassName}`}>{open ? children : null}</div>
    </dialog>
  );
}

// ───────────────────────── BookingProvider ─────────────────────────
export type BookingPreset = { categorySlug?: string; serviceId?: number; doctorId?: number };

type Ctx = {
  open: (preset?: BookingPreset) => void;
  options: BookingOptions;
  phones: PhoneItem[];
};

const BookingContext = createContext<Ctx | null>(null);

export function useBooking(): Ctx {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}

export function BookingProvider({
  options,
  phones,
  children,
}: {
  options: BookingOptions;
  phones: PhoneItem[];
  children: ReactNode;
}) {
  const [isOpen, setOpen] = useState(false);
  const [preset, setPreset] = useState<BookingPreset>({});
  const [session, setSession] = useState(0);

  const open = useCallback((p?: BookingPreset) => {
    setPreset(p ?? {});
    setSession((s) => s + 1);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, options, phones }), [open, options, phones]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <Modal open={isOpen} onClose={close} labelledBy="booking-modal-title" panelClassName="w-full max-w-xl px-3 sm:px-0">
        <div className="relative max-h-[94dvh] overflow-y-auto rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-lift)] sm:p-8">
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть окно записи"
            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted hover:bg-brand-50 hover:text-ink"
          >
            <X size={22} aria-hidden="true" />
          </button>
          <BookingForm key={session} preset={preset} headingId="booking-modal-title" onClose={close} />
        </div>
      </Modal>
    </BookingContext.Provider>
  );
}

// ───────────────────────── BookButton ─────────────────────────
/** Кнопка, открывающая окно записи на приём (опционально с предзаполненными данными). */
export function BookButton({
  preset,
  className = "btn btn-primary",
  children = "Записаться на приём",
  onClick,
}: {
  preset?: BookingPreset;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  const { open } = useBooking();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onClick?.();
        open(preset);
      }}
    >
      {children}
    </button>
  );
}

// ───────────────────────── BookingForm ─────────────────────────
type Values = {
  name: string;
  phone: string;
  categorySlug: string;
  serviceId: string;
  doctorId: string;
  preferredDate: string;
  preferredTime: string;
  comment: string;
  consent: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;
type Status = "idle" | "submitting" | "success";

/**
 * ДЕМО-ФОРМА. Валидация и состояния работают полностью, но данные никуда не отправляются
 * и не сохраняются — серверной части у демо-сайта нет. Это явно сообщается пользователю.
 */
export function BookingForm({
  preset,
  kind = "appointment",
  headingId,
  onClose,
  title,
  subtitle,
}: {
  preset?: BookingPreset;
  kind?: "appointment" | "feedback";
  headingId?: string;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}) {
  const { options, phones } = useBooking();
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const isFeedback = kind === "feedback";

  const initialService = preset?.serviceId ? options.services.find((s) => s.id === preset.serviceId) : undefined;
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    categorySlug: initialService?.categorySlug ?? preset?.categorySlug ?? "",
    serviceId: initialService ? String(initialService.id) : "",
    doctorId: preset?.doctorId ? String(preset.doctorId) : "",
    preferredDate: "",
    preferredTime: "",
    comment: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const servicesForCategory = useMemo(
    () => options.services.filter((s) => !values.categorySlug || s.categorySlug === values.categorySlug),
    [options.services, values.categorySlug],
  );

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function validate(v: Values): Errors {
    const e: Errors = {};
    const name = v.name.trim();
    if (name.length < 2) e.name = "Укажите имя (не короче 2 символов)";
    else if (name.length > 80) e.name = "Слишком длинное имя";
    if (!v.phone.trim()) e.phone = "Укажите номер телефона";
    else if (!normalizePhone(v.phone)) e.phone = "Введите номер полностью: +7 (999) 123-45-67";
    if (v.preferredDate && v.preferredDate < today) e.preferredDate = "Дата не может быть в прошлом";
    if (isFeedback && v.comment.trim().length < 3) e.comment = "Напишите ваше сообщение";
    if (v.comment.length > 1000) e.comment = "Не более 1000 символов";
    if (!v.consent) e.consent = "Необходимо согласие на обработку персональных данных";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (status === "submitting") return; // защита от повторной отправки
    const found = validate(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    // Демо: имитируем только индикатор загрузки. Данные не отправляются.
    await new Promise((r) => setTimeout(r, 600));
    setStatus("success");
  }

  const heading = title ?? (isFeedback ? "Написать клинике" : "Запись на приём");
  const hid = headingId ?? id("title");

  if (status === "success") {
    const category = options.categories.find((c) => c.slug === values.categorySlug)?.title;
    const service = options.services.find((s) => String(s.id) === values.serviceId)?.title;
    return (
      <div className="py-4 text-center" role="status" aria-live="polite">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-50 text-brand-600">
          <CheckCircle2 size={36} aria-hidden="true" />
        </span>
        <h3 id={hid} className="mt-5">
          Форма заполнена верно
        </h3>
        <p className="mx-auto mt-3 flex max-w-md items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-900">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Демо-режим.</strong> Это демонстрационный сайт: заявка никуда не отправлена и не сохранена. Чтобы записаться, позвоните в клинику.
          </span>
        </p>
        <dl className="mx-auto mt-5 max-w-sm space-y-1 rounded-xl bg-surface-alt p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Имя</dt>
            <dd className="font-semibold">{values.name.trim()}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Телефон</dt>
            <dd className="font-semibold">{values.phone}</dd>
          </div>
          {category && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Направление</dt>
              <dd className="text-right font-semibold">{category}</dd>
            </div>
          )}
          {service && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Услуга</dt>
              <dd className="text-right font-semibold">{service}</dd>
            </div>
          )}
        </dl>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {phones[0] && (
            <a className="btn btn-primary" href={`tel:${phones[0].tel}`}>
              <Phone size={18} aria-hidden="true" /> {phones[0].display}
            </a>
          )}
          {onClose ? (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Закрыть
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setValues((v) => ({ ...v, comment: "", preferredDate: "", preferredTime: "", consent: false }));
                setStatus("idle");
              }}
            >
              Заполнить ещё раз
            </button>
          )}
        </div>
      </div>
    );
  }

  const describe = (n: keyof Values) => (errors[n] ? id(`${n}-err`) : undefined);
  const Err = ({ n }: { n: keyof Values }) =>
    errors[n] ? (
      <p id={id(`${n}-err`)} className="field-error" role="alert">
        {errors[n]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={status === "submitting"}>
      <h3 id={hid} className="pr-10">
        {heading}
      </h3>
      <p className="mt-2 text-sm text-muted">
        {subtitle ??
          (isFeedback
            ? "Задайте вопрос — в рабочей версии мы свяжемся с вами по указанному телефону."
            : "Оставьте контакты — в рабочей версии администратор свяжется с вами и согласует время.")}
      </p>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">
        <Info size={14} aria-hidden="true" /> Демо: данные не отправляются
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className="label">
            Имя <span aria-hidden="true" className="text-danger">*</span>
          </label>
          <input
            id={id("name")}
            name="name"
            className="input"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
            aria-required="true"
            maxLength={80}
            placeholder="Как к вам обращаться"
          />
          <Err n="name" />
        </div>
        <div>
          <label htmlFor={id("phone")} className="label">
            Телефон <span aria-hidden="true" className="text-danger">*</span>
          </label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            className="input"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set("phone", maskPhoneInput(e.target.value))}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describe("phone")}
            aria-required="true"
            placeholder="+7 (___) ___-__-__"
          />
          <Err n="phone" />
        </div>

        {!isFeedback && (
          <>
            <div>
              <label htmlFor={id("cat")} className="label">
                Направление
              </label>
              <select
                id={id("cat")}
                name="categorySlug"
                className="input"
                value={values.categorySlug}
                onChange={(e) => {
                  const slug = e.target.value;
                  setValues((v) => {
                    const svc = options.services.find((s) => String(s.id) === v.serviceId);
                    return { ...v, categorySlug: slug, serviceId: svc && slug && svc.categorySlug !== slug ? "" : v.serviceId };
                  });
                }}
              >
                <option value="">Не выбрано</option>
                {options.categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={id("svc")} className="label">
                Интересующая услуга
              </label>
              <select
                id={id("svc")}
                name="serviceId"
                className="input"
                value={values.serviceId}
                onChange={(e) => {
                  const sid = e.target.value;
                  const svc = options.services.find((s) => String(s.id) === sid);
                  setValues((v) => ({ ...v, serviceId: sid, categorySlug: svc ? svc.categorySlug : v.categorySlug }));
                }}
              >
                <option value="">Не выбрана</option>
                {servicesForCategory.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {options.doctors.length > 0 && (
              <div className="sm:col-span-2">
                <label htmlFor={id("doc")} className="label">
                  Предпочитаемый врач
                </label>
                <select id={id("doc")} name="doctorId" className="input" value={values.doctorId} onChange={(e) => set("doctorId", e.target.value)}>
                  <option value="">Любой специалист</option>
                  {options.doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor={id("date")} className="label">
                Желаемая дата
              </label>
              <input
                id={id("date")}
                name="preferredDate"
                type="date"
                className="input"
                min={today}
                value={values.preferredDate}
                onChange={(e) => set("preferredDate", e.target.value)}
                aria-invalid={Boolean(errors.preferredDate)}
                aria-describedby={describe("preferredDate")}
                suppressHydrationWarning
              />
              <Err n="preferredDate" />
            </div>
            <div>
              <label htmlFor={id("time")} className="label">
                Желаемое время
              </label>
              <input
                id={id("time")}
                name="preferredTime"
                type="time"
                className="input"
                value={values.preferredTime}
                onChange={(e) => set("preferredTime", e.target.value)}
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label htmlFor={id("comment")} className="label">
            {isFeedback ? "Сообщение" : "Комментарий"}
            {isFeedback && (
              <span aria-hidden="true" className="text-danger">
                {" "}
                *
              </span>
            )}
          </label>
          <textarea
            id={id("comment")}
            name="comment"
            className="input"
            value={values.comment}
            onChange={(e) => set("comment", e.target.value)}
            maxLength={1000}
            aria-invalid={Boolean(errors.comment)}
            aria-describedby={describe("comment")}
            placeholder={isFeedback ? "Ваш вопрос или сообщение" : "Удобные дни, вопросы к администратору"}
          />
          <p className="mt-1 text-xs text-muted">Пожалуйста, не указывайте подробные медицинские сведения — их обсудит врач на приёме.</p>
          <Err n="comment" />
        </div>
      </div>

      <div className="mt-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describe("consent")}
            className="mt-0.5 size-5 shrink-0 accent-brand-600"
          />
          <span>
            Я даю{" "}
            <Link href="/personal-data-consent" target="_blank" className="font-semibold text-brand-600 underline">
              согласие на обработку персональных данных
            </Link>{" "}
            и ознакомлен(а) с{" "}
            <Link href="/privacy-policy" target="_blank" className="font-semibold text-brand-600 underline">
              политикой конфиденциальности
            </Link>
            .
          </span>
        </label>
        <Err n="consent" />
      </div>

      <button type="submit" className="btn btn-primary btn-lg mt-6 w-full" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2 size={20} className="animate-spin" aria-hidden="true" /> Проверяем…
          </>
        ) : isFeedback ? (
          "Отправить сообщение"
        ) : (
          "Записаться на приём"
        )}
      </button>
    </form>
  );
}

// ───────────────────────── HeaderClient ─────────────────────────
type Cat = { slug: string; title: string; shortDescription: string };

const NAV = [
  { href: "/services", label: "Услуги", mega: true },
  { href: "/prices", label: "Цены" },
  { href: "/doctors", label: "Врачи" },
  { href: "/about", label: "О клинике" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/contacts", label: "Контакты" },
];

const EXTRA = [
  { href: "/promotions", label: "Акции" },
  { href: "/articles", label: "Статьи" },
  { href: "/gallery", label: "Галерея" },
  { href: "/contacts#payment", label: "Оплата" },
];

export function HeaderClient({
  siteName,
  logoUrl,
  phones,
  categories,
}: {
  siteName: string;
  logoUrl?: string;
  phones: PhoneItem[];
  categories: Cat[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const main = phones[0];

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? "shadow-[0_1px_0_var(--color-line),0_8px_24px_-16px_rgb(16_39_44/0.25)]" : "border-b border-line"}`}>
      <div className={`container-page relative z-10 flex items-center justify-between gap-3 bg-white transition-[height] duration-200 ${scrolled ? "h-16" : "h-[68px] lg:h-[76px]"}`}>
        <Link href="/" aria-label={`${siteName} — на главную`} className="shrink-0 rounded-lg">
          <Logo logoUrl={logoUrl} name={siteName} />
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center lg:flex">
          {NAV.map((item) =>
            item.mega ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 rounded-full px-3 py-2 text-[0.9375rem] font-semibold transition-colors hover:bg-brand-50 hover:text-brand-700 xl:px-4 ${isActive(item.href) ? "text-brand-700" : "text-ink"}`}
                >
                  {item.label}
                  <ChevronDown size={16} aria-hidden="true" className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 w-[min(680px,calc(100vw-2rem))] pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="rounded-2xl border border-line bg-white p-3 shadow-[var(--shadow-lift)]">
                    <ul className="grid grid-cols-2 gap-1">
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/services/${c.slug}`} className="block rounded-xl p-3 transition-colors hover:bg-brand-50">
                            <span className="block font-bold text-ink">{c.title}</span>
                            <span className="mt-0.5 line-clamp-1 block text-sm text-muted">{c.shortDescription}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 text-sm">
                      <Link href="/services" className="link-arrow">
                        Все услуги <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                      <Link href="/prices" className="link-arrow">
                        Цены <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-[0.9375rem] font-semibold transition-colors hover:bg-brand-50 hover:text-brand-700 xl:px-4 ${isActive(item.href) ? "text-brand-700" : "text-ink"}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2 xl:gap-3">
          {main && (
            <div className="group relative hidden xl:block">
              <a href={`tel:${main.tel}`} className="flex items-center gap-2 rounded-full px-2 py-2 font-bold text-ink hover:text-brand-700">
                <span className="grid size-9 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Phone size={17} aria-hidden="true" />
                </span>
                <span className="whitespace-nowrap">{main.display}</span>
                {phones.length > 1 && <ChevronDown size={15} aria-hidden="true" className="text-muted" />}
              </a>
              {phones.length > 1 && (
                <div className="invisible absolute right-0 top-full z-50 w-72 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="rounded-2xl border border-line bg-white p-2 shadow-[var(--shadow-lift)]">
                    {phones.map((p) => (
                      <li key={p.tel}>
                        <a href={`tel:${p.tel}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-brand-50">
                          <span className="font-bold">{p.display}</span>
                          <span className="text-xs text-muted">{p.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {main && (
            <a href={`tel:${main.tel}`} aria-label={`Позвонить: ${main.display}`} className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 xl:hidden">
              <Phone size={20} aria-hidden="true" />
            </a>
          )}
          <BookButton className="btn btn-primary btn-sm hidden whitespace-nowrap sm:inline-flex">
            <span className="xl:hidden">Записаться</span>
            <span className="hidden xl:inline">Записаться на приём</span>
          </BookButton>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line text-ink hover:bg-brand-50 lg:hidden"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-0 overflow-y-auto bg-white pt-[68px] transition-all duration-300 lg:hidden ${menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"}`}
      >
        <nav aria-label="Мобильная навигация" className="container-page pb-28 pt-4">
          <ul className="divide-y divide-line">
            {NAV.map((item) => (
              <li key={item.href}>
                {item.mega ? (
                  <>
                    <div className="flex items-center">
                      <Link href={item.href} className="flex min-h-14 flex-1 items-center text-lg font-bold">
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={servicesOpen}
                        aria-controls="mobile-services"
                        aria-label="Показать направления"
                        onClick={() => setServicesOpen((v) => !v)}
                        className="grid size-12 place-items-center rounded-full text-brand-600 hover:bg-brand-50"
                      >
                        <ChevronDown size={22} aria-hidden="true" className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                    <ul id="mobile-services" hidden={!servicesOpen} className="mb-3 grid gap-1 rounded-2xl bg-brand-50 p-2">
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/services/${c.slug}`} className="flex min-h-12 items-center rounded-xl px-3 font-semibold text-brand-800 hover:bg-white">
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className="flex min-h-14 items-center text-lg font-bold">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <ul className="mt-4 flex flex-wrap gap-2">
            {EXTRA.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-muted hover:border-brand-300 hover:text-brand-700">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-2">
            {phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-line px-4 font-bold hover:bg-brand-50">
                <Phone size={20} className="text-brand-600" aria-hidden="true" />
                {p.display}
              </a>
            ))}
          </div>
          <BookButton className="btn btn-primary btn-lg mt-4 w-full" onClick={() => setMenuOpen(false)}>
            Записаться на приём
          </BookButton>
        </nav>
      </div>
    </header>
  );
}

// ───────────────────────── ServiceCard ─────────────────────────
export type CardService = Pick<
  ServiceWithCategory,
  "id" | "slug" | "title" | "shortDescription" | "categorySlug" | "categoryTitle" | "priceType" | "priceMin" | "priceMax"
>;

export function ServiceCard({ s }: { s: CardService }) {
  const priced = hasPrice(s);
  return (
    <article className="card card-hover flex h-full flex-col p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">{s.categoryTitle}</p>
      <h3 className="mt-2 text-lg leading-snug">
        <Link href={`/services/${s.categorySlug}/${s.slug}`} className="hover:text-brand-700">
          {s.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{s.shortDescription}</p>
      <div className="mt-auto pt-5">
        {priced ? (
          <p className="text-2xl font-extrabold tracking-tight text-ink">{formatPrice(s)}</p>
        ) : (
          <p className="text-sm font-semibold text-muted">Стоимость уточняйте по телефону</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/services/${s.categorySlug}/${s.slug}`} className="btn btn-secondary btn-sm">
            Подробнее
          </Link>
          <BookButton preset={{ serviceId: s.id }} className="btn btn-primary btn-sm">
            Записаться
          </BookButton>
        </div>
      </div>
    </article>
  );
}

// ───────────────────────── ServiceCatalog ─────────────────────────
const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").trim();

export function ServiceCatalog({
  categories,
  services,
  initialCategory = "all",
  initialQuery = "",
  phone,
}: {
  categories: { slug: string; title: string }[];
  services: CardService[];
  initialCategory?: string;
  initialQuery?: string;
  phone?: { tel: string; display: string };
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(categories.some((c) => c.slug === initialCategory) ? initialCategory : "all");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    services.forEach((s) => m.set(s.categorySlug, (m.get(s.categorySlug) ?? 0) + 1));
    return m;
  }, [services]);

  const results = useMemo(() => {
    const q = norm(query);
    return services.filter((s) => {
      if (category !== "all" && s.categorySlug !== category) return false;
      if (!q) return true;
      return norm(`${s.title} ${s.shortDescription} ${s.categoryTitle}`).includes(q);
    });
  }, [services, query, category]);

  const reset = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <label htmlFor="service-search" className="label">
          Поиск по названию услуги
        </label>
        <div className="relative">
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="service-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: имплантация, гигиена, брекеты"
            className="input !pl-12 pr-12"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-brand-50"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        <div role="group" aria-label="Фильтр по направлению" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          {[{ slug: "all", title: "Все направления" }, ...categories].map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.slug)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${
                  active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                {c.title}
                <span className={`text-xs ${active ? "text-brand-100" : "text-muted"}`}>{c.slug === "all" ? services.length : counts.get(c.slug) ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-5 mt-6 text-sm text-muted" role="status" aria-live="polite">
        Найдено: {results.length} {pluralize(results.length, "услуга", "услуги", "услуг")}
      </p>

      {results.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center sm:p-12">
          <h2 className="text-2xl">Ничего не найдено</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Попробуйте изменить запрос или сбросить фильтры. Если нужной услуги нет в каталоге, уточните у администратора — возможно, мы сможем помочь.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="btn btn-primary">
              Сбросить фильтры
            </button>
            {phone && (
              <a href={`tel:${phone.tel}`} className="btn btn-secondary">
                <Phone size={18} aria-hidden="true" /> {phone.display}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── PriceList ─────────────────────────
export type PriceItem = {
  id: number;
  slug: string;
  title: string;
  priceType: string;
  priceMin: number | null;
  priceMax: number | null;
  priceNote: string | null;
};
export type PriceGroup = { slug: string; title: string; items: PriceItem[] };


export function PriceList({ groups }: { groups: PriceGroup[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const q = norm(query);
  const filtered = useMemo(
    () =>
      groups
        .filter((g) => active === "all" || g.slug === active)
        .map((g) => ({ ...g, items: g.items.filter((i) => !q || norm(i.title).includes(q)) }))
        .filter((g) => g.items.length > 0),
    [groups, active, q],
  );
  const total = filtered.reduce((n, g) => n + g.items.length, 0);

  const toggle = (slug: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <label htmlFor="price-search" className="label">
          Поиск по прайс-листу
        </label>
        <div className="relative">
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="price-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название услуги, например «коронка»"
            className="input !pl-12 pr-12"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Очистить поиск"
              className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-brand-50"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <div role="group" aria-label="Категории прайс-листа" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
          {[{ slug: "all", title: "Все категории" }, ...groups].map((g) => {
            const on = active === g.slug;
            return (
              <button
                key={g.slug}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(g.slug)}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
                  on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                {g.title}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-5 mt-6 text-sm text-muted" role="status" aria-live="polite">
        Показано: {total} {pluralize(total, "позиция", "позиции", "позиций")}
      </p>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center sm:p-12">
          <h2 className="text-2xl">Ничего не найдено</h2>
          <p className="mt-3 text-muted">Измените запрос или выберите другую категорию.</p>
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => {
              setQuery("");
              setActive("all");
            }}
          >
            Показать весь прайс
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((g) => {
            const isOpen = q ? true : !collapsed.has(g.slug);
            return (
              <section key={g.slug} id={g.slug} aria-labelledby={`pg-${g.slug}`} className="card scroll-mt-28 overflow-hidden">
                <h2 id={`pg-${g.slug}`} className="text-xl sm:text-2xl">
                  <button
                    type="button"
                    onClick={() => toggle(g.slug)}
                    aria-expanded={isOpen}
                    aria-controls={`pl-${g.slug}`}
                    className="flex min-h-16 w-full items-center justify-between gap-4 bg-brand-50/70 px-5 py-4 text-left hover:bg-brand-50"
                  >
                    <span>
                      {g.title} <span className="ml-1 text-base font-semibold text-muted">· {g.items.length}</span>
                    </span>
                    <ChevronDown size={22} aria-hidden="true" className={`shrink-0 text-brand-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </h2>
                <ul id={`pl-${g.slug}`} hidden={!isOpen} className="divide-y divide-line">
                  {g.items.map((i) => (
                    <li key={i.id} className="grid grid-cols-2 items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[1fr_12rem_auto] sm:p-5">
                      <div className="col-span-2 min-w-0 sm:col-span-1">
                        <Link href={`/services/${g.slug}/${i.slug}`} className="font-semibold leading-snug hover:text-brand-700">
                          {i.title}
                        </Link>
                        {i.priceNote && !hasPrice(i) && <p className="mt-1 text-xs text-muted">{i.priceNote}</p>}
                      </div>
                      <p className={`text-left font-extrabold sm:text-right sm:text-lg ${hasPrice(i) ? "whitespace-nowrap" : "text-sm font-semibold text-muted"}`}>
                        {formatPrice(i)}
                      </p>
                      <BookButton preset={{ serviceId: i.id }} className="btn btn-secondary btn-sm justify-self-end">
                        Записаться
                      </BookButton>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Gallery ─────────────────────────
export type GalleryEntry = { id: number; image: string; caption: string | null; category: string };

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: GalleryEntry[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const total = items.length;
  const item = items[index];
  const touchX = useRef<number | null>(null);

  const go = useCallback((d: number) => onIndex((index + d + total) % total), [index, total, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!item) return null;
  return (
    <div
      className="relative flex h-full w-full flex-col bg-brand-950/95 text-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <p id="lightbox-title" className="text-sm font-semibold text-brand-100" aria-live="polite">
          Фото {index + 1} из {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Закрыть просмотр"
          className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {total > 1 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Предыдущее фото"
            className="absolute left-2 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 hover:bg-white/25 sm:left-4"
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.id}
          src={item.image}
          alt={item.caption || "Фотография галереи"}
          className="max-h-full max-w-full animate-fade-up rounded-lg object-contain"
          draggable={false}
        />
        {total > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Следующее фото"
            className="absolute right-2 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 hover:bg-white/25 sm:right-4"
          >
            <ChevronRight size={26} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="min-h-14 px-6 py-4 text-center text-sm text-brand-100">{item.caption}</p>
    </div>
  );
}

export function Gallery({
  items,
  categories,
  limit,
  showFilter = false,
  columns = "4",
}: {
  items: GalleryEntry[];
  categories?: { value: string; label: string }[];
  limit?: number;
  showFilter?: boolean;
  columns?: "3" | "4";
}) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<number | null>(null);

  const presentCategories = useMemo(
    () => (categories ?? []).filter((c) => items.some((i) => i.category === c.value)),
    [categories, items],
  );
  const visible = useMemo(() => {
    const list = items.filter((i) => filter === "all" || i.category === filter);
    return limit ? list.slice(0, limit) : list;
  }, [items, filter, limit]);

  const grid =
    columns === "3" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";

  return (
    <div>
      {showFilter && presentCategories.length > 1 && (
        <div role="group" aria-label="Фильтр галереи по категориям" className="mb-6 flex flex-wrap gap-2">
          {[{ value: "all", label: "Все" }, ...presentCategories].map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter(c.value)}
              aria-pressed={filter === c.value}
              className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors ${
                filter === c.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <ul className={`grid gap-3 sm:gap-4 ${grid}`}>
        {visible.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Открыть фото${item.caption ? `: ${item.caption}` : ""}`}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-brand-50 shadow-[var(--shadow-card)]"
            >
              <SmartImage
                src={item.image}
                alt={item.caption || "Фотография галереи"}
                fill
                loading="lazy"
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-brand-950/0 transition-colors group-hover:bg-brand-950/25" />
              <span
                aria-hidden="true"
                className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-brand-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Expand size={18} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Modal open={active !== null} onClose={() => setActive(null)} labelledBy="lightbox-title" panelClassName="h-full w-full">
        {active !== null && <Lightbox items={visible} index={active} onIndex={setActive} onClose={() => setActive(null)} />}
      </Modal>
    </div>
  );
}
