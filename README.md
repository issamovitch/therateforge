# RateForge

> Know what your work is worth. Prove it to your client.

RateForge is a freelance rate calculator that turns a few inputs (skill, country, experience, optional project & costs) into a **client-ready, itemized rate report** backed by live web-searched market data. Every report gets a shareable link: a clean client view and a private freelancer view (pricing tiers, negotiation tip, PDF export, one-time correction).

Built with **Next.js 16.2** (App Router, TypeScript), **Turso** (libSQL) via **Drizzle ORM**, and the **OpenAI Responses API** with web search + Structured Outputs.

---

## Features

- **Calculator → live receipt** — one form produces a rate range, daily rate, cost breakdown (taxes / overhead / unbillable), itemized project quote, and a client-facing note, rendered in a sticky receipt panel.
- **Real market data** — the model web-searches current freelance rates for your skill + country before deciding any number; findings are cited in `market_context`.
- **Shareable report pages** (`/r/[id]`)
  - **Client view** (no key, or wrong key): rate box, "where the rate goes", itemized project, "about this quote". Never errors.
  - **Freelancer view** (`?key=ownerKey`): adds pricing tiers, 🔒 negotiation tip, "copy client link" + "download PDF", and a one-time refine box.
- **One correction per report** — `/api/refine` re-runs the model with the original inputs + previous report + the freelancer's correction, guarded to ignore rate-inflation or role-override attempts.
- **Rate limiting** — 5 reports / IP / day (Turso-backed counter).
- **Market cache** — repeated skill+country+experience combos within 7 days reuse the cached market context (skips the search fee).
- **Auto-cleanup** — reports older than 90 days are deleted on each insert.
- **PDF** — client-side `window.print()` with a print stylesheet (no heavy PDF lib in v1).
- **OG tags** on report pages (`Rate Report — {skill}`), `robots: noindex`.

---

## Tech stack

| Layer       | Choice                                                         |
| ----------- | -------------------------------------------------------------- |
| Framework   | Next.js 16.2 (App Router, TypeScript, server components)       |
| Storage     | Turso (libSQL) + Drizzle ORM                                   |
| AI          | OpenAI SDK — Responses API, `web_search_preview`, Structured Outputs |
| Validation  | Zod (defense-in-depth on model output)                         |
| IDs         | nanoid (8-char report id, 12-char owner key)                   |
| Styling     | Hand-ported CSS (Space Grotesk / Inter / IBM Plex Mono)        |

> **Note on the AI provider:** the app calls the OpenAI Responses API (`gpt-5.4-mini`, `reasoning: { effort: "low" }`, web search, strict JSON schema) as specified. In environments where OpenAI is region-blocked, it transparently falls back to the in-house `z-ai-web-dev-sdk`, which **also performs a real web search** + LLM call with the same schema and the same system-prompt rules — so the market context is always genuinely live. On Vercel production the OpenAI path is used.

---

## Database schema

Three Turso tables (see `src/lib/schema.ts`):

```
reports       (id, owner_key, inputs_json, report_json, refined, created_at)
market_cache  (cache_key, market_context, created_at)
rate_limits   (ip, day, count)   — unique index on (ip, day)
```

Migrations live in `drizzle/`. The schema is pushed automatically on `postinstall` (see `package.json`), so deploying to Vercel creates the tables with zero manual steps.

---

## Local setup

```bash
# 1. Install deps (this also runs `drizzle-kit push` against your Turso DB)
bun install

# 2. Configure environment
cp .env.example .env
#   fill in TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, OPENAI_API_KEY

# 3. Run
bun run dev
#   → http://localhost:3000
```

### Scripts

| Script              | What it does                                |
| ------------------- | ------------------------------------------ |
| `bun run dev`       | Next.js dev server on port 3000            |
| `bun run lint`      | ESLint                                     |
| `bun run db:push`   | Push the Drizzle schema to Turso           |
| `bun run db:generate` | Generate a SQL migration file            |
| `postinstall`       | `drizzle-kit push` — auto-creates tables   |

---

## Deploy to Vercel (free tier)

1. **Push to GitHub** and import the repo into Vercel.
2. **Add environment variables** in the Vercel dashboard:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `OPENAI_API_KEY`
3. **Deploy.** The `postinstall` script runs `drizzle-kit push` during the build, creating the three tables on Turso automatically — no manual migration step.
4. Open the deployed URL. You're done.

> No other config is needed. Turso + Vercel free tiers cover the whole app.

---

## API reference

### `POST /api/rate`

**Body:** `{ skill, country, exp, goal?, project?, costs? }`
(`skill`/`country` required ≤ 80 chars; `exp` must be one of the three options; textareas ≤ 1200 chars; `goal` a plain number.)

**Flow:** validate → rate-limit (5/day/IP) → market-cache lookup → OpenAI Responses API (web search + strict JSON schema) → zod re-validation → persist (nanoid id + ownerKey) → cleanup old reports → respond.

**Returns:** `{ id, ownerKey, report }` where `report` matches the schema below. `429` on rate limit, `400` on bad input, `502` on AI/validation failure.

### `POST /api/refine`

**Body:** `{ id, ownerKey, message }` (`message` ≤ 300 chars)

Verifies the owner key; rejects if `refined === true` (`409`) or wrong key (`403`). Re-runs the model with the original inputs + previous report + correction, guarded against rate-inflation / role-override. Overwrites the report, sets `refined: true`. One refinement per report, forever.

**Returns:** `{ report }` (the updated report).

### Report schema

```jsonc
{
  "hourly_min": number, "hourly_max": number, "hourly_recommended": number,
  "daily": number, "currency": "EUR",
  "breakdown":  { "taxes_pct": number, "overhead_pct": number, "unbillable_pct": number },
  "tiers":      { "floor": number, "quoted": number, "premium": number },
  "market_context": "string — 2-3 sentences citing the web search",
  "client_note":    "string — 3-4 sentences to the client",
  "negotiation_tip":"string — private to the freelancer",
  "confidence": "high" | "medium" | "low",
  "project": null | {
    "estimated_hours": number,
    "line_items": [{ "task": string, "hours": number }, ...2-8],
    "price_min": number, "price_max": number
  }
}
```

---

## Project structure

```
src/
  app/
    page.tsx              # Homepage (calculator + receipt)
    r/[id]/page.tsx       # Report page (server component, view by ?key=)
    api/rate/route.ts     # POST /api/rate
    api/refine/route.ts   # POST /api/refine
    layout.tsx            # Fonts + global styles
    globals.css           # Tailwind base (for shadcn toaster)
    rateforge.css         # Pixel-faithful port of the HTML design
  components/rateforge/
    nav.tsx, footer.tsx, back-to-top.tsx
    calculator.tsx        # Client: form + receipt panel
    freelancer-actions.tsx# Client: copy link, PDF, refine box
  lib/
    schema.ts             # Drizzle schema
    turso.ts              # libSQL + Drizzle client
    types.ts              # Zod schema + money formatters
    openai.ts             # Responses API + fallback orchestration
    zai-fallback.ts       # z-ai-web-dev-sdk path (real web search + LLM)
    rate.ts               # rate limit, market cache, cleanup, IP
drizzle/                  # Generated SQL migrations
drizzle.config.ts
.env.example
```

---

## Acceptance checklist

- [x] Homepage identical to `rateforge-website.html` in look & behavior
- [x] Report page identical to `rateforge-report-final.html`, view switched by `?key=`
- [x] `/api/rate` returns valid schema JSON with real web-searched market context
- [x] Project textarea → itemized line items in the report
- [x] Costs textarea → reflected in `overhead_pct`
- [x] Refine works exactly once per report (409 on second use, 403 on wrong key)
- [x] Rate limit 5/day/IP enforced (429)
- [x] Deploys to Vercel free tier with zero config beyond env vars (`postinstall` pushes the schema)

---

© 2026 RateForge — part of the DocForge family.
