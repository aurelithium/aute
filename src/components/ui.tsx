import Image, { type ImageProps } from "next/image";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { slugify } from "@/lib/format";

// ───────────────────────── JsonLd ─────────────────────────
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

// ───────────────────────── Logo ─────────────────────────
export function Logo({
  variant = "dark",
  logoUrl,
  name = "Квалитет",
}: {
  variant?: "dark" | "light";
  logoUrl?: string;
  name?: string;
}) {
  if (logoUrl) {
    return (
      <span className="inline-flex items-center">
        <Image
          src={logoUrl}
          alt={name}
          width={180}
          height={44}
          unoptimized={logoUrl.startsWith("/media/")}
          className="h-10 w-auto object-contain"
          priority
        />
      </span>
    );
  }
  const light = variant === "light";
  return (
    <span className="inline-flex items-center gap-3">
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" className="shrink-0">
        <rect width="40" height="40" rx="12" fill={light ? "#ffffff" : "var(--color-brand-600)"} />
        <path
          d="M20 10.2c-2-1.3-4.3-1.9-6.2-1.1-3 1.3-4 4.5-3.3 8.2.5 2.4 1.5 4.1 1.9 6.5.3 1.9.6 5.4 2.3 6.6 1.5 1 2.5-.8 3.1-3.2.4-1.6.8-3 2.2-3s1.8 1.4 2.2 3c.6 2.4 1.6 4.2 3.1 3.2 1.7-1.2 2-4.7 2.3-6.6.4-2.4 1.4-4.1 1.9-6.5.7-3.7-.3-6.9-3.3-8.2-1.9-.8-4.2-.2-6.2 1.1z"
          fill={light ? "var(--color-brand-700)" : "#ffffff"}
        />
        <circle cx="29.5" cy="9.5" r="2.6" fill="var(--color-accent)" />
      </svg>
      <span className="leading-none">
        <span className={`block text-[1.45rem] font-extrabold tracking-tight ${light ? "text-white" : "text-brand-800"}`}>
          {name}
        </span>
        <span
          className={`mt-1 block text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${
            light ? "text-brand-200" : "text-muted"
          }`}
        >
          стоматология
        </span>
      </span>
    </span>
  );
}

// ───────────────────────── SmartImage ─────────────────────────
/** Обёртка над next/image. Локальные фото лежат в public/images; файлы из /media/ отдаются без повторной оптимизации. */
export function SmartImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={src.startsWith("/media/")} {...rest} />;
}

// ───────────────────────── Stars ─────────────────────────
export function formatRating(v: number): string {
  return v.toFixed(1).replace(".", ",");
}

/** Звёзды рейтинга с дробным заполнением (4,9 → почти полная пятая звезда). */
export function Stars({ value, size = 18, className = "" }: { value: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) / 5;
  const row = (filled: boolean) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} width={size} height={size} className="shrink-0" fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.5} />
    ));
  return (
    <span
      role="img"
      aria-label={`Рейтинг ${formatRating(value)} из 5`}
      className={`relative inline-flex ${className}`}
    >
      <span className="inline-flex text-brand-200">{row(false)}</span>
      <span className="absolute inset-y-0 left-0 inline-flex overflow-hidden text-accent" style={{ width: `${pct * 100}%` }}>
        {row(true)}
      </span>
    </span>
  );
}

// ───────────────────────── RichText ─────────────────────────
/**
 * Безопасный рендер лёгкой разметки (без dangerouslySetInnerHTML):
 *  ## Заголовок, ### Подзаголовок, - список, 1. нумерованный список,
 *  **жирный**, [ссылка](https://…), пустая строка — новый абзац.
 */
type Block =
  | { type: "h2" | "h3"; text: string; id: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] };

export function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  const used = new Set<string>();
  const state: { para: string[]; list: { type: "ul" | "ol"; items: string[] } | null } = { para: [], list: null };

  const flush = () => {
    if (state.para.length) blocks.push({ type: "p", text: state.para.join("\n") });
    if (state.list) blocks.push({ type: state.list.type, items: state.list.items });
    state.para = [];
    state.list = null;
  };
  const uniqueId = (text: string) => {
    const base = slugify(text);
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    let m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (m) {
      flush();
      blocks.push({ type: m[1].length === 2 ? "h2" : "h3", text: m[2].trim(), id: uniqueId(m[2]) });
      continue;
    }
    m = /^[-*•]\s+(.+)$/.exec(line);
    if (m) {
      if (state.para.length || state.list?.type === "ol") flush();
      if (!state.list) state.list = { type: "ul", items: [] };
      state.list.items.push(m[1]);
      continue;
    }
    m = /^\d+[.)]\s+(.+)$/.exec(line);
    if (m) {
      if (state.para.length || state.list?.type === "ul") flush();
      if (!state.list) state.list = { type: "ol", items: [] };
      state.list.items.push(m[1]);
      continue;
    }
    if (state.list) flush();
    state.para.push(line);
  }
  flush();
  return blocks;
}

export function extractHeadings(src: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  for (const b of parseBlocks(src)) {
    if (b.type === "h2") out.push({ id: b.id, text: b.text });
  }
  return out;
}

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|tel:|mailto:|#)/;

function renderInline(text: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (m) {
        const href = m[2];
        if (!SAFE_HREF.test(href)) return m[1];
        const external = /^https?:/.test(href);
        return (
          <a key={i} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {m[1]}
          </a>
        );
      }
      return part;
    });
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className={`rich ${className}`}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={b.id}>
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} id={b.id}>
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i}>
                {b.text.split("\n").map((ln, j, arr) => (
                  <span key={j}>
                    {renderInline(ln)}
                    {j < arr.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}

// ───────────────────────── SectionHeading ─────────────────────────
export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
  light = false,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  hrefLabel?: string;
  light?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow mb-3 ${light ? "!text-brand-200" : ""}`}>{eyebrow}</p>}
        <Tag className={light ? "!text-white" : ""}>{title}</Tag>
        {description && <p className={`mt-3 text-lg ${light ? "text-brand-100" : "text-muted"}`}>{description}</p>}
      </div>
      {href && hrefLabel && (
        <Link href={href} className={`link-arrow shrink-0 ${light ? "!text-white" : ""}`}>
          {hrefLabel} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

// ───────────────────────── FAQ ─────────────────────────
export type FaqEntry = { q: string; a: string };

export function FAQ({ items, title = "Частые вопросы" }: { items: FaqEntry[]; title?: string }) {
  if (items.length === 0) return null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
  return (
    <section aria-labelledby="faq-title">
      <h2 id="faq-title" className="mb-6">
        {title}
      </h2>
      <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
        {items.map((item, i) => (
          <details key={i} className="group">
            <summary className="flex min-h-14 list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold marker:hidden [&::-webkit-details-marker]:hidden hover:bg-brand-50/60">
              <span>{item.q}</span>
              <ChevronDown
                size={20}
                aria-hidden="true"
                className="shrink-0 text-brand-600 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <div className="px-5 pb-5 text-muted">{item.a}</div>
          </details>
        ))}
      </div>
      <JsonLd data={ld} />
    </section>
  );
}
