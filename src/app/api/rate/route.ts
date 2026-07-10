import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { getDb, reports } from "@/lib/turso";
import { rateReportSchema, EXPERIENCE_VALUES, reconcileProject, validateReportMath } from "@/lib/types";
import type { RateInputs } from "@/lib/types";
import { currencyForCountryName } from "@/lib/countries";
import { generateRateReport } from "@/lib/openai";
import {
  checkAndIncrementRateLimit,
  cleanupOldReports,
  getClientIp,
  getCachedMarket,
  marketCacheKey,
  setCachedMarket,
} from "@/lib/rate";

// 8-char report id (url-safe), 12-char owner key.
const idGen = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);
const keyGen = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

function bad(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  // ── 1. Parse + validate input ───────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("Invalid JSON body.", 400);
  }

  const skill = String(body.skill ?? "").trim();
  const country = String(body.country ?? "").trim();
  const exp = String(body.exp ?? "").trim();
  const goal = String(body.goal ?? "").trim() || undefined;
  const project = String(body.project ?? "").trim() || undefined;
  const costs = String(body.costs ?? "").trim() || undefined;

  // Team size: optional, default 1, clamped to [1, 50].
  const rawTeam = Number(body.team_size ?? 1);
  const teamSize = Number.isFinite(rawTeam) && rawTeam >= 1 ? Math.min(50, Math.floor(rawTeam)) : 1;

  if (!skill || !country || !exp)
    return bad("Skill, country and experience are required.", 400);
  if (skill.length > 80 || country.length > 80)
    return bad("Skill and country must be 80 characters or fewer.", 400);
  if (!EXPERIENCE_VALUES.has(exp))
    return bad("Experience must be one of the provided options.", 400);
  if (project && project.length > 1200)
    return bad("Project description must be 1200 characters or fewer.", 400);
  if (costs && costs.length > 1200)
    return bad("Costs description must be 1200 characters or fewer.", 400);
  if (goal && (goal.length > 20 || !/^\d+$/.test(goal)))
    return bad("Income goal must be a plain number.", 400);

  const inputs: RateInputs = { skill, country, exp, goal, project, costs, teamSize };

  // ── 2. Rate limit ───────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = await checkAndIncrementRateLimit(ip);
  if (!rl.ok) {
    return bad(
      `You've reached the daily limit of ${rl.limit} reports. Please come back tomorrow.`,
      429,
    );
  }

  // ── 3. Market cache lookup ──────────────────────────────────
  const cacheKey = marketCacheKey({ skill, country, exp });
  const cachedMarket = await getCachedMarket(cacheKey);

  // ── 4. Generate the report via OpenAI ───────────────────────
  let report;
  try {
    report = await generateRateReport(inputs, cachedMarket);
  } catch (e) {
    console.error("[/api/rate] openai failure:", e);
    return bad(
      "We couldn't generate the report right now. Please try again in a moment.",
      502,
    );
  }

  // Defense-in-depth re-validation (already done in openai.ts).
  let recheck = rateReportSchema.safeParse(report);
  if (!recheck.success) {
    return bad("Report validation failed. Please try again.", 502);
  }

  // Math validation: if the model's arithmetic doesn't add up, retry once
  // with an explicit error hint so the model can self-correct.
  let mathCheck = validateReportMath(recheck.data);
  if (!mathCheck.ok) {
    console.warn("[/api/rate] math errors, retrying:", mathCheck.errors.join(" "));
    try {
      const retry = await generateRateReport(
        inputs,
        cachedMarket,
        mathCheck.errors.join(" "),
      );
      const retryRecheck = rateReportSchema.safeParse(retry);
      if (retryRecheck.success) {
        recheck = retryRecheck;
        mathCheck = validateReportMath(recheck.data);
      }
    } catch (e) {
      console.warn("[/api/rate] math retry failed, using deterministic fix:", e);
    }
  }

  // Deterministic fix: always reconcile so line-item prices, estimated_hours,
  // price_min/max, and daily rate are internally consistent by construction.
  report = reconcileProject(recheck.data);

  // Currency override: if the model returned USD for a non-USA country, swap
  // to the country's local currency. The model sometimes defaults to USD for
  // India/Brazil/Philippines — we want the local currency (INR/BRL/PHP) so
  // the report reads authentically to the freelancer.
  const localCurrency = currencyForCountryName(country);
  if (localCurrency && report.currency !== localCurrency) {
    console.log(
      `[/api/rate] currency override: ${report.currency} → ${localCurrency} for ${country}`,
    );
    report = { ...report, currency: localCurrency };
  }

  // Final safety check (should always pass after reconcileProject).
  const finalCheck = validateReportMath(report);
  if (!finalCheck.ok) {
    console.warn("[/api/rate] post-reconcile math errors (shipping anyway):", finalCheck.errors.join(" "));
  }

  // ── 5. Cache the fresh market context ───────────────────────
  if (!cachedMarket && report.market_context) {
    await setCachedMarket(cacheKey, report.market_context).catch((e) =>
      console.warn("[/api/rate] cache write failed:", e),
    );
  }

  // ── 6. Persist ──────────────────────────────────────────────
  const id = idGen();
  const ownerKey = keyGen();
  try {
    await getDb()
      .insert(reports)
      .values({
        id,
        ownerKey,
        inputsJson: JSON.stringify(inputs),
        reportJson: JSON.stringify(report),
        refined: false,
      })
      .run();
    // Best-effort cleanup of reports older than 90 days.
    cleanupOldReports().catch(() => {});
  } catch (e) {
    console.error("[/api/rate] persist failure:", e);
    return bad("Failed to save the report. Please try again.", 500);
  }

  // ── 7. Respond ──────────────────────────────────────────────
  return NextResponse.json({ id, ownerKey, report });
}
