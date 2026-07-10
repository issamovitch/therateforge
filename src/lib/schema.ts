import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * RateForge database schema (Turso / libSQL).
 *
 * Three tables:
 *  - reports      : generated rate reports, owned by an owner_key
 *  - market_cache : cached web-search market context keyed by skill+country+exp
 *  - rate_limits  : per-IP-per-day counter (max 5 reports/day)
 *
 * `created_at` is stored as an epoch-millis INTEGER for cheap comparisons.
 *
 * Every table has a PRIMARY KEY so the Turso admin UI (and any SQL client)
 * can edit/delete individual rows.
 */

export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(), // nanoid(8)
    ownerKey: text("owner_key").notNull(), // nanoid(12) — grants freelancer view
    inputsJson: text("inputs_json").notNull(), // {skill,country,exp,goal,project,costs}
    reportJson: text("report_json").notNull(), // validated RateReport
    refined: integer("refined", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at")
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("reports_created_at_idx").on(t.createdAt)],
);

export const marketCache = sqliteTable("market_cache", {
  cacheKey: text("cache_key").primaryKey(), // sha1(skill|country|exp) lowercase
  marketContext: text("market_context").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    ip: text("ip").notNull(),
    day: text("day").notNull(), // YYYY-MM-DD (UTC)
    count: integer("count").notNull().default(0),
  },
  (t) => [
    // Composite primary key on (ip, day) — each IP has at most one counter per
    // day, and this gives the Turso UI a row identity for edit/delete.
    primaryKey({ columns: [t.ip, t.day] }),
  ],
);

export type ReportRow = typeof reports.$inferSelect;
export type NewReportRow = typeof reports.$inferInsert;
