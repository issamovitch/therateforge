import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { reports, marketCache, rateLimits } from "./schema";

/**
 * Shared Turso (libSQL) client + Drizzle instance.
 *
 * Env vars (see .env.example):
 *   TURSO_DATABASE_URL — libsql://...turso.io
 *   TURSO_AUTH_TOKEN   — Turso auth token
 *
 * Both are created LAZILY on first call to getDb() — not at module load —
 * so this module can be imported at build time without the env vars set.
 * The vars are read at request time. In dev we reuse the globals to avoid
 * exhausting connections under HMR.
 */
type Schema = typeof import("./schema");
type DB = LibSQLDatabase<Schema>;

const globalForTurso = globalThis as unknown as {
  tursoClient?: Client;
  tursoDb?: DB;
};

/** Get the shared Drizzle instance (creates it on first call). */
export function getDb(): DB {
  if (!globalForTurso.tursoDb) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error(
        "TURSO_DATABASE_URL is not set. Add it to your environment variables.",
      );
    }
    globalForTurso.tursoClient = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    globalForTurso.tursoDb = drizzle(globalForTurso.tursoClient, {
      schema: { reports, marketCache, rateLimits },
    });
  }
  return globalForTurso.tursoDb;
}

export { reports, marketCache, rateLimits };
