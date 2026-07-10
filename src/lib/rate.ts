import { createHash } from "crypto";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getDb, reports, marketCache, rateLimits } from "./turso";

const MAX_PER_DAY = 5;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const REPORT_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

/** Extract the caller IP from Next.js headers (behind the gateway). */
export function getClientIp(req: Request): string {
  const h = req.headers;
  // The sandbox gateway forwards the real IP here.
  const xf = h.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** UTC day key, YYYY-MM-DD. */
function dayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Enforce max 5 reports / IP / day.
 * Returns { ok, count, limit }. On ok, increments the counter atomically-ish
 * (upsert). We don't use a transaction — Turso free tier is fine with this.
 */
export async function checkAndIncrementRateLimit(
  ip: string,
): Promise<{ ok: boolean; count: number; limit: number }> {
  const day = dayKey();
  // Try to read existing.
  const existing = await getDb()
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.ip, ip), eq(rateLimits.day, day)))
    .limit(1);
  const current = existing[0]?.count ?? 0;
  if (current >= MAX_PER_DAY) {
    return { ok: false, count: current, limit: MAX_PER_DAY };
  }
  // Upsert the incremented counter.
  await getDb()
    .insert(rateLimits)
    .values({ ip, day, count: 1 })
    .onConflictDoUpdate({
      target: [rateLimits.ip, rateLimits.day],
      set: { count: current + 1 },
    })
    .run();
  return { ok: true, count: current + 1, limit: MAX_PER_DAY };
}

/** Normalized hash key for {skill,country,exp}. */
export function marketCacheKey(inputs: {
  skill: string;
  country: string;
  exp: string;
}): string {
  const raw = `${inputs.skill}|${inputs.country}|${inputs.exp}`.toLowerCase().trim();
  return createHash("sha1").update(raw).digest("hex");
}

/** Read a fresh (< 7 day) cached market context, if any. */
export async function getCachedMarket(
  key: string,
): Promise<string | undefined> {
  const since = Date.now() - CACHE_TTL_MS;
  const rows = await getDb()
    .select()
    .from(marketCache)
    .where(and(eq(marketCache.cacheKey, key), gte(marketCache.createdAt, since)))
    .limit(1);
  return rows[0]?.marketContext;
}

/** Upsert a market context into the cache. */
export async function setCachedMarket(key: string, context: string) {
  await getDb()
    .insert(marketCache)
    .values({ cacheKey: key, marketContext: context })
    .onConflictDoUpdate({
      target: marketCache.cacheKey,
      set: {
        marketContext: context,
        createdAt: sql`(unixepoch() * 1000)`,
      },
    })
    .run();
}

/** Delete reports older than 90 days. Runs on each insert. */
export async function cleanupOldReports() {
  const cutoff = Date.now() - REPORT_TTL_MS;
  try {
    await getDb().delete(reports).where(lte(reports.createdAt, cutoff)).run();
  } catch (e) {
    // Non-fatal — don't break report generation over cleanup.
    console.warn("[cleanup] failed to delete old reports:", e);
  }
}
