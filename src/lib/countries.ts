import minCountries from "./countries.min.json";

export interface CountryOption {
  /** ISO 3166-1 alpha-2 code, e.g. "PT". Used as the react-select value. */
  value: string;
  /** Common English name, e.g. "Portugal". Shown + sent to the model. */
  label: string;
  /** ISO 4217 currency code, e.g. "EUR" (first currency if multiple). */
  currency: string;
  /** Native flag emoji. */
  flag: string;
}

/** Convert a 2-letter country code to a flag emoji. */
function flagEmoji(cca2: string): string {
  if (!cca2 || cca2.length !== 2) return "";
  const cp = [...cca2.toUpperCase()].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...cp);
}

/**
 * Country options for react-select — built from a minimal pre-generated JSON
 * (~13KB) instead of the full 22MB `world-countries` package, so only the
 * fields we use (cca2, name, currency) ship to the client. Flag emoji are
 * derived at runtime from the cca2 code (no data shipped for them).
 */
export const COUNTRY_OPTIONS: CountryOption[] = (minCountries as { value: string; label: string; currency: string }[]).map(
  (c) => ({
    value: c.value,
    label: c.label,
    currency: c.currency,
    flag: flagEmoji(c.value),
  }),
);

/** Look up a country option by cca2 code. */
export function countryByCode(code: string): CountryOption | undefined {
  return COUNTRY_OPTIONS.find((c) => c.value === code);
}

/**
 * Look up a country's local currency ISO code by country name (case-insensitive,
 * trimmed). Returns undefined if the country isn't found.
 *
 * Handles common alternative names (Turkey → Türkiye, USA → United States,
 * Czech Republic → Czechia, etc.) so the lookup is robust even if the model
 * or user uses an older/different name.
 *
 * Used to override the model's currency choice — the model sometimes returns
 * USD for countries like India/Brazil/Philippines, but we want the local
 * currency (INR/BRL/PHP) at the correct magnitude.
 */
const COUNTRY_ALIASES: Record<string, string> = {
  turkey: "Türkiye",
  usa: "United States",
  "united states of america": "United States",
  uk: "United Kingdom",
  britain: "United Kingdom",
  "great britain": "United Kingdom",
  "czech republic": "Czechia",
  "czech": "Czechia",
  "south korea": "South Korea",
  korea: "South Korea",
  russia: "Russia",
  vietnam: "Vietnam",
  "burma": "Myanmar",
  "ivory coast": "Côte d'Ivoire",
  "cape verde": "Cabo Verde",
  "swaziland": "Eswatini",
  "macedonia": "North Macedonia",
  "bosnia": "Bosnia and Herzegovina",
  "uae": "United Arab Emirates",
  "holland": "Netherlands",
  "the netherlands": "Netherlands",
};

export function currencyForCountryName(name: string): string | undefined {
  const trimmed = name.trim().toLowerCase();
  // Try exact match first.
  let match = COUNTRY_OPTIONS.find((c) => c.label.toLowerCase() === trimmed);
  // Try alias resolution.
  if (!match && COUNTRY_ALIASES[trimmed]) {
    const alias = COUNTRY_ALIASES[trimmed].toLowerCase();
    match = COUNTRY_OPTIONS.find((c) => c.label.toLowerCase() === alias);
  }
  // Try "contains" as a last resort (e.g. "Democratic Republic of Congo").
  if (!match) {
    match = COUNTRY_OPTIONS.find(
      (c) => c.label.toLowerCase().includes(trimmed) || trimmed.includes(c.label.toLowerCase()),
    );
  }
  return match?.currency;
}

/** react-select styles tuned to the RateForge ledger theme. */
export const countrySelectStyles = {
  control: (base: object, state: { isFocused?: boolean }) => ({
    ...base,
    minHeight: 42,
    borderColor: state.isFocused ? "var(--ledger)" : "var(--line)",
    boxShadow: state.isFocused ? "0 0 0 2px var(--ledger)" : "none",
    borderRadius: 9,
    fontSize: "0.93rem",
    backgroundColor: "#fff",
    "&:hover": { borderColor: "var(--ledger)" },
  }),
  option: (base: object, state: { isSelected?: boolean; isFocused?: boolean }) => ({
    ...base,
    fontSize: "0.9rem",
    backgroundColor: state.isSelected
      ? "var(--ledger-soft)"
      : state.isFocused
        ? "var(--paper)"
        : "#fff",
    color: "var(--ink)",
    cursor: "pointer",
  }),
  singleValue: (base: object) => ({
    ...base,
    color: "var(--ink)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  }),
  input: (base: object) => ({ ...base, color: "var(--ink)" }),
  menu: (base: object) => ({
    ...base,
    borderRadius: 9,
    border: "1px solid var(--line)",
    boxShadow: "0 4px 16px rgba(22,33,31,.08)",
    zIndex: 30,
  }),
  menuList: (base: object) => ({ ...base, maxHeight: 260 }),
  placeholder: (base: object) => ({ ...base, color: "#9aa8a3" }),
  indicatorSeparator: (base: object) => ({ ...base, backgroundColor: "var(--line)" }),
  dropdownIndicator: (base: object) => ({ ...base, color: "var(--muted)" }),
};
