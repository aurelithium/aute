

// ───────────────────────── format ─────────────────────────
const NBSP = "\u00A0";

export type PriceInfo = {
  priceType: string;
  priceMin: number | null;
  priceMax: number | null;
};

export function formatNumber(n: number): string {
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function hasPrice(p: PriceInfo): boolean {
  if (p.priceType === "fixed" || p.priceType === "from") return p.priceMin != null;
  if (p.priceType === "range") return p.priceMin != null && p.priceMax != null;
  return false;
}

/** Цена в том виде, в каком она хранится: «10 000 ₽», «от 80 000 ₽», «1 000–3 000 ₽». */
export function formatPrice(p: PriceInfo): string {
  if (!hasPrice(p)) return "Уточняйте по телефону";
  const min = formatNumber(p.priceMin as number);
  switch (p.priceType) {
    case "from":
      return `от${NBSP}${min}${NBSP}₽`;
    case "range":
      return `${min}–${formatNumber(p.priceMax as number)}${NBSP}₽`;
    default:
      return `${min}${NBSP}₽`;
  }
}

export function formatDateRu(input: string | Date | null | undefined): string {
  if (!input) return "";
  const d =
    typeof input === "string"
      ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(input) ? `${input}T00:00:00Z` : input)
      : input;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input) ? "UTC" : "Europe/Moscow",
  }).format(d);
}

/** Приводит телефон к виду +7XXXXXXXXXX или возвращает null, если номер некорректен. */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.length === 10) digits = `7${digits}`;
  if (digits.length !== 11 || !digits.startsWith("7")) return null;
  return `+${digits}`;
}

/** Маска ввода телефона: +7 (999) 123-45-67 */
export function maskPhoneInput(value: string): string {
  let d = value.replace(/\D/g, "");
  if (!d) return "";
  if (d[0] === "8") d = `7${d.slice(1)}`;
  else if (d[0] !== "7") d = `7${d}`;
  d = d.slice(0, 11);
  const p = d.slice(1);
  let out = "+7";
  if (p.length > 0) out += ` (${p.slice(0, 3)}`;
  if (p.length >= 3) out += ")";
  if (p.length > 3) out += ` ${p.slice(3, 6)}`;
  if (p.length > 6) out += `-${p.slice(6, 8)}`;
  if (p.length > 8) out += `-${p.slice(8, 10)}`;
  return out;
}

export function pluralize(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function promoPeriod(startsAt: string | null, endsAt: string | null): string | null {
  if (startsAt && endsAt) return `${formatDateRu(startsAt)} — ${formatDateRu(endsAt)}`;
  if (endsAt) return `до ${formatDateRu(endsAt)}`;
  if (startsAt) return `с ${formatDateRu(startsAt)}`;
  return null;
}

// ───────────────────────── slug ─────────────────────────
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  const out = input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in MAP ? MAP[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return out || `item-${Date.now().toString(36)}`;
}

