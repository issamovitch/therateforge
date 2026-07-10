import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, reports } from "@/lib/turso";
import { rateReportSchema, reconcileProject, validateReportMath } from "@/lib/types";
import type { RateInputs } from "@/lib/types";
import { currencyForCountryName } from "@/lib/countries";
import { refineRateReport } from "@/lib/openai";
import { getCachedMarket, marketCacheKey } from "@/lib/rate";

function bad(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  let body: { id?: string; ownerKey?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body.", 400);
  }

  const id = (body.id ?? "").toString().trim();
  const ownerKey = (body.ownerKey ?? "").toString().trim();
  const message = (body.message ?? "").toString().trim();

  if (!id || !ownerKey || !message)
    return bad("id, ownerKey and message are required.", 400);
  if (message.length > 300)
    return bad("Correction message must be 300 characters or fewer.", 400);

  // ── 1. Fetch the report row ─────────────────────────────────
  const rows = await getDb()
    .select()
    .from(reports)
    .where(eq(reports.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return bad("Report not found.", 404);
  if (row.ownerKey !== ownerKey) return bad("Invalid owner key.", 403);
  if (row.refined)
    return bad("This report has already been refined.", 409);

  // ── 2. Parse stored data ────────────────────────────────────
  let inputs: RateInputs;
  let previous: ReturnType<typeof rateReportSchema.parse>;
  try {
    inputs = JSON.parse(row.inputsJson) as RateInputs;
    previous = rateReportSchema.parse(JSON.parse(row.reportJson));
  } catch (e) {
    console.error("[/api/refine] corrupt stored data:", e);
    return bad("Stored report is corrupt.", 500);
  }

  // ── 3. Re-run OpenAI with the correction ───────────────────
  const cacheKey = marketCacheKey({
    skill: inputs.skill,
    country: inputs.country,
    exp: inputs.exp,
  });
  const cachedMarket = await getCachedMarket(cacheKey);

  let next;
  try {
    next = await refineRateReport(inputs, previous, message, cachedMarket);
  } catch (e) {
    console.error("[/api/refine] openai failure:", e);
    return bad(
      "We couldn't apply the correction right now. Please try again.",
      502,
    );
  }

  let recheck = rateReportSchema.safeParse(next);
  if (!recheck.success) return bad("Refined report validation failed.", 502);

  // Math validation with one retry (same pattern as /api/rate).
  let mathCheck = validateReportMath(recheck.data);
  if (!mathCheck.ok) {
    console.warn("[/api/refine] math errors, retrying:", mathCheck.errors.join(" "));
    try {
      const retry = await refineRateReport(
        inputs,
        previous,
        message,
        cachedMarket,
        mathCheck.errors.join(" "),
      );
      const retryRecheck = rateReportSchema.safeParse(retry);
      if (retryRecheck.success) {
        recheck = retryRecheck;
        mathCheck = validateReportMath(recheck.data);
      }
    } catch (e) {
      console.warn("[/api/refine] math retry failed, using deterministic fix:", e);
    }
  }

  // Deterministic fix: reconcile so all arithmetic is consistent by construction.
  next = reconcileProject(recheck.data);

  // Currency override: keep the country's local currency (same as /api/rate).
  const localCurrency = currencyForCountryName(inputs.country);
  if (localCurrency && next.currency !== localCurrency) {
    next = { ...next, currency: localCurrency };
  }

  const finalCheck = validateReportMath(next);
  if (!finalCheck.ok) {
    console.warn("[/api/refine] post-reconcile math errors (shipping anyway):", finalCheck.errors.join(" "));
  }

  // ── 4. Overwrite + mark refined ─────────────────────────────
  try {
    await getDb()
      .update(reports)
      .set({ reportJson: JSON.stringify(next), refined: true })
      .where(and(eq(reports.id, id), eq(reports.ownerKey, ownerKey)))
      .run();
  } catch (e) {
    console.error("[/api/refine] persist failure:", e);
    return bad("Failed to save the refined report.", 500);
  }

  return NextResponse.json({ report: next });
}
