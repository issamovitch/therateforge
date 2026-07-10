/**
 * Canonical site URL — single source of truth.
 *
 * Reads NEXT_PUBLIC_SITE_URL (set in .env / Vercel). Falls back to the
 * production domain. Always returned without a trailing slash.
 *
 * Use this for metadataBase, canonical URLs, OG/Twitter image URLs, and
 * any absolute link built for sharing (e.g. report client links).
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://therateforge.com"
).replace(/\/$/, "");
