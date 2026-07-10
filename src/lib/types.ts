import { z } from "zod";

/**
 * Canonical RateReport schema — shared by the API, the homepage receipt
 * and the report page. Mirrors the OpenAI Structured Output JSON schema.
 */

export const lineItemSchema = z.object({
  task: z.string(),
  hours: z.number(),
  // `price` is computed server-side (= round(hours × hourly_recommended))
  // so the itemized total always reconciles exactly. The model may also
  // return it; we overwrite it to guarantee correctness.
  price: z.number().optional(),
});

export const breakdownSchema = z.object({
  taxes_pct: z.number(),
  overhead_pct: z.number(),
  unbillable_pct: z.number(),
});

export const tiersSchema = z.object({
  floor: z.number(),
  quoted: z.number(),
  premium: z.number(),
});

export const projectSchema = z.object({
  estimated_hours: z.number(),
  line_items: z.array(lineItemSchema).min(2).max(8),
  price_min: z.number(),
  price_max: z.number(),
});

export const rateReportSchema = z
  .object({
    hourly_min: z.number(),
    hourly_max: z.number(),
    hourly_recommended: z.number(),
    daily: z.number(),
    currency: z.string(),
    breakdown: breakdownSchema,
    tiers: tiersSchema,
    market_context: z.string(),
    client_note: z.string(),
    negotiation_tip: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
    project: projectSchema.nullable(),
  })
  .refine(
    (r) => {
      // Tiers must be HOURLY rates (same magnitude as hourly_recommended),
      // never monthly or project totals. They must also be ordered and fall
      // within (or very near) the hourly_min–hourly_max band.
      const { floor, quoted, premium } = r.tiers;
      const lo = r.hourly_min;
      const hi = r.hourly_max;
      // Reject obvious magnitude errors: any tier more than 2× the max hourly
      // rate or less than half the min hourly rate is clearly not an hourly
      // rate (e.g. a monthly total leaked in).
      const withinMagnitude =
        floor <= hi * 2 && floor >= lo * 0.5 &&
        quoted <= hi * 2 && quoted >= lo * 0.5 &&
        premium <= hi * 2 && premium >= lo * 0.5;
      const ordered = floor <= quoted && quoted <= premium;
      return withinMagnitude && ordered;
    },
    {
      message:
        "tiers.floor/quoted/premium must be HOURLY rates (same unit as hourly_recommended), ordered floor ≤ quoted ≤ premium, and within/near the hourly_min–hourly_max band. They must never be monthly or project totals.",
      path: ["tiers"],
    },
  );

export type RateReport = z.infer<typeof rateReportSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type Project = z.infer<typeof projectSchema>;

/**
 * Reconcile a report so ALL arithmetic is internally consistent by
 * construction. This is the authoritative server-side fix that runs after the
 * model returns — the model's own derived values are overwritten.
 *
 * Invariants enforced:
 *  - daily = round(hourly_recommended × 8)
 *  - tiers.quoted = hourly_recommended
 *  - hourly_min = tiers.floor, hourly_max = tiers.premium
 *    (the headline range and the tier range are the SAME numbers)
 *  - if project present:
 *    - estimated_hours = sum(line_items.hours)
 *    - each line_items.price = round(hours × hourly_recommended)
 *    - price_min = round(estimated_hours × tiers.floor)
 *    - price_max = round(estimated_hours × tiers.premium)
 *
 * Returns a new object; does not mutate the input.
 */
export function reconcileProject(report: RateReport): RateReport {
  const rate = report.hourly_recommended;
  const fixedDaily = Math.round(rate * 8);
  // Force tiers.quoted = recommended, and headline range = tier range.
  const floor = report.tiers.floor;
  const premium = report.tiers.premium;
  const fixedTiers = { floor, quoted: rate, premium };
  const fixedHourlyMin = floor;
  const fixedHourlyMax = premium;

  if (!report.project) {
    return {
      ...report,
      daily: fixedDaily,
      hourly_min: fixedHourlyMin,
      hourly_max: fixedHourlyMax,
      tiers: fixedTiers,
    };
  }

  const items = report.project.line_items.map((li) => ({
    ...li,
    price: Math.round(li.hours * rate),
  }));
  const totalHours = items.reduce((s, li) => s + li.hours, 0);
  return {
    ...report,
    daily: fixedDaily,
    hourly_min: fixedHourlyMin,
    hourly_max: fixedHourlyMax,
    tiers: fixedTiers,
    project: {
      ...report.project,
      line_items: items,
      estimated_hours: totalHours,
      price_min: Math.round(totalHours * floor),
      price_max: Math.round(totalHours * premium),
    },
  };
}

/**
 * Validate that all arithmetic in a report is internally consistent. Used
 * after the model returns (but before reconcileProject force-fixes) to decide
 * whether to retry with an explicit error hint. Returns { ok, errors }.
 *
 * Checks (all EXACT unless noted):
 *  - daily ≈ hourly_recommended × 8 (±5%)
 *  - tiers.quoted === hourly_recommended
 *  - hourly_min === tiers.floor
 *  - hourly_max === tiers.premium
 *  - tiers ordered: floor < quoted < premium (strict)
 *  - if project present:
 *    - sum(line_items.hours) === estimated_hours
 *    - each line_items.price === round(hours × hourly_recommended) (if present)
 *    - sum(line_items.price) === round(estimated_hours × hourly_recommended)
 *    - price_min === round(estimated_hours × tiers.floor)
 *    - price_max === round(estimated_hours × tiers.premium)
 */
export function validateReportMath(report: RateReport): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const rate = report.hourly_recommended;

  // daily ≈ hourly_recommended × 8
  const expectedDaily = rate * 8;
  if (Math.abs(report.daily - expectedDaily) > expectedDaily * 0.05) {
    errors.push(
      `daily (${report.daily}) should be ≈ hourly_recommended × 8 (${Math.round(expectedDaily)}).`,
    );
  }

  // tiers.quoted === hourly_recommended
  if (report.tiers.quoted !== rate) {
    errors.push(
      `tiers.quoted (${report.tiers.quoted}) must equal hourly_recommended (${rate}).`,
    );
  }

  // hourly_min === tiers.floor
  if (report.hourly_min !== report.tiers.floor) {
    errors.push(
      `hourly_min (${report.hourly_min}) must equal tiers.floor (${report.tiers.floor}).`,
    );
  }

  // hourly_max === tiers.premium
  if (report.hourly_max !== report.tiers.premium) {
    errors.push(
      `hourly_max (${report.hourly_max}) must equal tiers.premium (${report.tiers.premium}).`,
    );
  }

  // tiers ordered (strict)
  const { floor, quoted, premium } = report.tiers;
  if (!(floor < quoted && quoted < premium)) {
    errors.push(
      `tiers not strictly ordered: floor (${floor}) < quoted (${quoted}) < premium (${premium}).`,
    );
  }

  // project arithmetic
  if (report.project) {
    const p = report.project;
    const lineHoursSum = p.line_items.reduce((s, li) => s + li.hours, 0);
    if (lineHoursSum !== p.estimated_hours) {
      errors.push(
        `line_items hours sum to ${lineHoursSum} but estimated_hours is ${p.estimated_hours}; they must be equal.`,
      );
    }

    // per-line price
    for (const li of p.line_items) {
      if (li.price !== undefined) {
        const expected = Math.round(li.hours * rate);
        if (li.price !== expected) {
          errors.push(
            `line item "${li.task}" price is ${li.price} but should be ${expected} (${li.hours}h × ${rate}).`,
          );
        }
      }
    }

    // sum of line prices = firm total
    const linePriceSum = p.line_items.reduce(
      (s, li) => s + (li.price ?? Math.round(li.hours * rate)),
      0,
    );
    const firmTotal = Math.round(p.estimated_hours * rate);
    if (linePriceSum !== firmTotal) {
      errors.push(
        `sum of line item prices (${linePriceSum}) does not equal estimated_hours × hourly_recommended (${firmTotal}).`,
      );
    }

    // price_min = estimated_hours × tiers.floor
    const expectedMin = Math.round(p.estimated_hours * floor);
    if (p.price_min !== expectedMin) {
      errors.push(
        `project.price_min (${p.price_min}) must equal estimated_hours × tiers.floor (${expectedMin}).`,
      );
    }

    // price_max = estimated_hours × tiers.premium
    const expectedMax = Math.round(p.estimated_hours * premium);
    if (p.price_max !== expectedMax) {
      errors.push(
        `project.price_max (${p.price_max}) must equal estimated_hours × tiers.premium (${expectedMax}).`,
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Strip URLs, markdown links, and citation tags from a prose string so the
 * report never shows raw links to a client. Source names are kept in plain
 * language (e.g. "according to Glassdoor"); only the URL/link syntax is removed.
 *
 * Handles: [text](url), bare http(s)://…, ([source](url)), and trailing
 * citation tags like (source.com.br) or (utm_source=…).
 */
export function sanitizeProse(text: string): string {
  if (!text) return text;
  let out = text;
  // 1. Markdown links [text](url) → keep "text", drop the URL and parens.
  //    Handles [text](url "title") and [text](url 'title') too.
  out = out.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  // 2. Parenthesised bare URL: (https://…) or (www.…) → drop entirely.
  out = out.replace(/\s*\(\s*(?:https?:\/\/|www\.)[^\s)]+\s*\)/g, "");
  // 3. Bare URLs anywhere — replace with nothing (no gap).
  out = out.replace(/(?:https?:\/\/|www\.)[^\s)]+/g, "");
  // 4. Citation tags like (source.com) or (source.com.br) — drop if they look
  //    like a domain-only reference. Keep parens that contain real words.
  out = out.replace(/\s*\([a-z0-9.-]+\.[a-z]{2,}(?:[/?][^\s)]*)?\)/gi, "");
  // 5. Stray utm/ tracking params that leaked as standalone text.
  out = out.replace(/\s*utm_[a-z_]+=[^\s)]+/gi, "");
  // 6. Clean up: empty parens, double spaces, space-before-punctuation.
  out = out.replace(/\(\s*\)/g, "");
  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/\s+([.,;:!?])/g, "$1");
  out = out.trim();
  return out;
}

/**
 * Sanitize all prose fields in a report (market_context, client_note,
 * negotiation_tip, and line_items[].task) so no URLs or markdown links
 * reach the client-facing report. Returns a new object.
 */
export function sanitizeReportProse(report: RateReport): RateReport {
  return {
    ...report,
    market_context: sanitizeProse(report.market_context),
    client_note: sanitizeProse(report.client_note),
    negotiation_tip: sanitizeProse(report.negotiation_tip),
    project: report.project
      ? {
          ...report.project,
          line_items: report.project.line_items.map((li) => ({
            ...li,
            task: sanitizeProse(li.task),
          })),
        }
      : report.project,
  };
}

/**
 * The client-facing firm price for a project = sum of line-item prices
 * (= hours × hourly_recommended, rounded per line then summed). Falls back to
 * `hourly_recommended × estimated_hours` for reports generated before the
 * per-line-price field existed.
 */
export function projectFirmPrice(report: RateReport): number {
  if (!report.project) return 0;
  const fromLines = report.project.line_items.reduce(
    (s, li) => s + (li.price ?? 0),
    0,
  );
  if (fromLines > 0) return fromLines;
  return Math.round(report.hourly_recommended * report.project.estimated_hours);
}

/** The inputs the user fills in on the calculator. */
export interface RateInputs {
  skill: string;
  country: string;
  exp: string;
  goal?: string;
  project?: string;
  costs?: string;
  teamSize?: number;
}

/** Shape returned by POST /api/rate. */
export interface RateResponse {
  id: string;
  ownerKey: string;
  report: RateReport;
}

/**
 * Currency symbol for display.
 *
 * Uses the NATIVE symbol for currencies whose glyphs render reliably across
 * every modern browser/OS/font (€, $, £, ¥, ₩, ₹, ฿, ₽, ₺, ₴, ₪, ₱, ₦, ₫,
 * zł, Kč, Ft, kr, Fr, R, RM, Rp, and the disambiguated dollar variants).
 *
 * Uses the 3-letter ISO code for everything else — in particular ALL Arabic /
 * right-to-left currencies (AED, SAR, QAR, KWD, BHD, OOM, JOD, EGP, DZD, TND,
 * MAD, LBP, IQD, LYD, etc.) whose native glyphs (د.إ, ﷼, etc.) mojibake or
 * break layout. Never emit an Arabic-script / RTL currency glyph.
 *
 * The returned string is always followed directly by the number (e.g. "€50",
 * "AED 100"), so ISO-code fallbacks include a trailing space.
 */
export function currencySymbol(code: string): string {
  // Native symbols that render safely everywhere.
  const SAFE_SYMBOLS: Record<string, string> = {
    EUR: "€",
    // Dollars — disambiguated prefixes for non-USD dollar currencies.
    USD: "$",
    CAD: "CA$",
    AUD: "A$",
    NZD: "NZ$",
    HKD: "HK$",
    SGD: "S$",
    BRL: "R$",
    MXN: "MX$",
    // Pounds / yen / won / rupee / baht / ruble / lira / hryvnia / shekel /
    // peso / naira / dong.
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    KRW: "₩",
    INR: "₹",
    THB: "฿",
    RUB: "₽",
    TRY: "₺",
    UAH: "₴",
    ILS: "₪",
    PHP: "₱",
    NGN: "₦",
    VND: "₫",
    // Eastern European.
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
    // Nordic / Scandinavian krona.
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    ISK: "kr",
    // Swiss franc.
    CHF: "Fr",
    // Rand / ringgit / rupiah.
    ZAR: "R",
    MYR: "RM",
    IDR: "Rp",
  };
  const upper = (code || "").toUpperCase();
  if (SAFE_SYMBOLS[upper]) return SAFE_SYMBOLS[upper];
  // Everything else (incl. all Arabic/RTL currencies): ISO code + space.
  return upper ? `${upper} ` : "";
}

/** Format a number as a localized currency amount, e.g. 2180 -> "€2,180". */
export function fmtMoney(amount: number, currency: string): string {
  const sym = currencySymbol(currency);
  const rounded = Math.round(amount);
  return `${sym}${rounded.toLocaleString("en-US")}`;
}

/** Format an hourly rate like the report card: €52, or ₱1,200 for thousands. */
export function fmtHour(amount: number, currency: string): string {
  const sym = currencySymbol(currency);
  const rounded = Math.round(amount);
  return `${sym}${rounded.toLocaleString("en-US")}`;
}

/**
 * Format a currency RANGE, showing the symbol once: "₱700–1,200" or
 * "AED 700–1,200". Both endpoints get thousands separators; the symbol
 * (or ISO code) appears only at the front.
 */
export function fmtRange(
  min: number,
  max: number,
  currency: string,
): string {
  const sym = currencySymbol(currency);
  const lo = Math.round(min).toLocaleString("en-US");
  const hi = Math.round(max).toLocaleString("en-US");
  return `${sym}${lo}–${hi}`;
}

/**
 * The five experience levels offered in the calculator (expanded from 3).
 * These exact strings are the `exp` values stored and sent to the model.
 */
export const EXPERIENCE_LEVELS = [
  "Entry (<1 yr)",
  "Junior (1–2 yrs)",
  "Mid (3–5 yrs)",
  "Senior (6–9 yrs)",
  "Lead/Expert (10+ yrs)",
] as const;

/** Set of valid `exp` values for API validation. */
export const EXPERIENCE_VALUES: ReadonlySet<string> = new Set(EXPERIENCE_LEVELS);
