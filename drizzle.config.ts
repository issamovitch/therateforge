import { defineConfig } from "drizzle-kit";

// Drizzle Kit config — pushes the schema to Turso (libSQL).
// `bun run db:push` runs `drizzle-kit push` against TURSO_DATABASE_URL.
export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
