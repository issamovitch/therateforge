import { notFound } from "next/navigation";
import { getDb, reports } from "@/lib/turso";
import { rateReportSchema, projectFirmPrice } from "@/lib/types";
import type { RateInputs } from "@/lib/types";
import { fmtHour, fmtMoney, fmtRange } from "@/lib/types";
import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";
import { BackToTop } from "@/components/rateforge/back-to-top";
import { FreelancerActions } from "@/components/rateforge/freelancer-actions";
import type { Metadata } from "next";

// Always render dynamically and never cache — guarantees the client view
// (no key) and freelancer view (?key=) read the EXACT same stored record,
// even immediately after a /api/refine overwrite.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/** robots: noindex on report pages — they're meant to be shared by link. */
export const robots = { index: false, follow: false };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ key?: string }>;
}

/** OG meta: "Rate Report — {skill}". Report pages are noindex (shared by link). */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const rows = await getDb().select().from(reports).where(eq(reports.id, id)).limit(1);
  const row = rows[0];
  let skill = "Freelancer";
  let country = "";
  if (row) {
    try {
      const inputs = JSON.parse(row.inputsJson) as RateInputs;
      skill = inputs.skill || skill;
      country = inputs.country || "";
    } catch {
      /* ignore */
    }
  }
  const title = country
    ? `Rate Report — ${skill} in ${country}`
    : `Rate Report — ${skill}`;
  const desc = country
    ? `An itemized, market-backed freelance rate report for a ${skill} in ${country}. Hourly, daily, cost breakdown, and project quote.`
    : `An itemized, market-backed freelance rate report for ${skill}.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/r/${id}` },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description: desc,
      type: "website",
      url: `/r/${id}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `RateForge rate report — ${skill}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ["/og-image.png"],
    },
  };
}

import { eq } from "drizzle-orm";

export default async function ReportPage(props: PageProps) {
  const { id } = await props.params;
  const { key } = await props.searchParams;

  // ── Fetch the report row from Turso ──────────────────────────
  const rows = await getDb().select().from(reports).where(eq(reports.id, id)).limit(1);
  const row = rows[0];
  if (!row) {
    return (
      <>
        <Nav />
        <main className="rf-wrap">
          <div className="rf-missing">
            <h1>Report not found</h1>
            <p>
              This report doesn&apos;t exist or has expired. Reports are kept
              for 90 days.
            </p>
            <a className="rf-hero-cta" href="/" style={{ display: "inline-block" }}>
              Forge a new rate report →
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Parse stored data ────────────────────────────────────────
  let report: ReturnType<typeof rateReportSchema.parse>;
  let inputs: RateInputs;
  try {
    report = rateReportSchema.parse(JSON.parse(row.reportJson));
    inputs = JSON.parse(row.inputsJson) as RateInputs;
  } catch {
    return (
      <>
        <Nav />
        <main className="rf-wrap">
          <div className="rf-missing">
            <h1>Report unavailable</h1>
            <p>This report&apos;s data is corrupt. Please generate a new one.</p>
            <a className="rf-hero-cta" href="/" style={{ display: "inline-block" }}>
              Forge a new rate report →
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Decide the view: freelancer if key matches, else client ──
  // Wrong/missing key never errors — just shows the client view.
  const isFreelancer = !!key && key === row.ownerKey;
  const cur = report.currency;
  const monthLabel = new Date(row.createdAt).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Nav />
      <main className={`${isFreelancer ? " rf-freelancer" : ""}`}>
        <div className="rf-wrap">
        <article className="rf-report">
          <div className="rf-who">
            <div className="ref">RATE REPORT · {monthLabel.toUpperCase()}</div>
            <h1>{inputs.skill}</h1>
            <p>
              {inputs.exp} · {inputs.country}
              {inputs.teamSize && inputs.teamSize > 1
                ? ` · Team of ${inputs.teamSize}`
                : ""}
              {report.project ? " · Itemized project quote" : ""}
            </p>
          </div>

          {/* Rate box — visible to everyone */}
          <div className="rf-rate-box">
            <div className="l">Rate</div>
            <div className="r">
              {fmtHour(report.hourly_recommended, cur)}
              <small>/hour</small>
            </div>
            <div className="d">
              ≈ {fmtMoney(report.daily, cur)}/day · {report.market_context}
            </div>
          </div>

          {/* Pricing tiers — freelancer only */}
          {isFreelancer && (
            <div className="rf-sec rf-fo">
              <h2 className="rf-sec-h2">Your pricing options — client doesn&apos;t see this</h2>
              <div className="rf-tiers">
                <div className="tier">
                  <div className="t">Floor</div>
                  <div className="p">{fmtHour(report.tiers.floor, cur)}/h</div>
                </div>
                <div className="tier on">
                  <div className="t">Quoted</div>
                  <div className="p">{fmtHour(report.tiers.quoted, cur)}/h</div>
                </div>
                <div className="tier">
                  <div className="t">Premium</div>
                  <div className="p">{fmtHour(report.tiers.premium, cur)}/h</div>
                </div>
              </div>
            </div>
          )}

          {/* What's included in this rate — visible to everyone.
              The percentages are COMPONENTS already built into the quoted
              rate, never added on top. */}
          <div className="rf-sec">
            <h2 className="rf-sec-h2">What&apos;s included in this rate</h2>
            <p className="rf-sec-sub" title="These percentages are already built into the rate above — they show what the rate covers, not extra fees added on top.">
              Already built into the rate above — not added on top.
            </p>
            <div className="rf-line">
              <span>Taxes &amp; social security</span>
              <span className="v">{report.breakdown.taxes_pct}%</span>
            </div>
            <div className="rf-line">
              <span>Software, workspace &amp; equipment</span>
              <span className="v">{report.breakdown.overhead_pct}%</span>
            </div>
            <div className="rf-line">
              <span>Unbillable work — admin, communication, revisions</span>
              <span className="v">{report.breakdown.unbillable_pct}%</span>
            </div>
          </div>

          {/* Itemized project — visible to everyone when present.
              Each line shows task + hours + price (price = hours × hourly_recommended,
              computed server-side). Line prices sum exactly to the firm total. */}
          {report.project && (() => {
            const firmPrice = projectFirmPrice(report);
            return (
            <div className="rf-sec">
              <h2 className="rf-sec-h2">This project — itemized</h2>
              {report.project.line_items.map((li, i) => (
                <div className="rf-line rf-line-item" key={i}>
                  <span className="rf-li-task">{li.task}</span>
                  <span className="rf-li-hours">{li.hours}h</span>
                  <span className="rf-li-price v">
                    {fmtMoney(li.price ?? Math.round(li.hours * report.hourly_recommended), cur)}
                  </span>
                </div>
              ))}

              {/* Client view: one firm number = sum of line prices */}
              {!isFreelancer && (
                <div className="rf-line total">
                  <span>{report.project.estimated_hours} hours</span>
                  <span className="v">{fmtMoney(firmPrice, cur)}</span>
                </div>
              )}

              {/* Freelancer view: what the client sees + the room either side */}
              {isFreelancer && (
                <div className="rf-proj-prices">
                  <div className="rf-line total">
                    <span>Client sees</span>
                    <span className="v">{fmtMoney(firmPrice, cur)}</span>
                  </div>
                  <div className="rf-line rf-proj-room">
                    <span>Your room</span>
                    <span className="v">
                      {fmtRange(report.project.price_min, report.project.price_max, cur)}{" "}
                      <small style={{ fontWeight: 400, color: "var(--muted)" }}>(floor–ceiling)</small>
                    </span>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* About this quote — visible to everyone */}
          <div className="rf-sec">
            <h2 className="rf-sec-h2">About this quote</h2>
            <div className="rf-rnote">{report.client_note}</div>
          </div>

          {/* Freelancer-only: negotiation tip, share bar, refine box */}
          {isFreelancer && (
            <FreelancerActions
              id={id}
              report={report}
              refined={row.refined}
              inputs={{ skill: inputs.skill, country: inputs.country, exp: inputs.exp }}
            />
          )}

          <div className="rf-verified">
            ✓ Verified by RateForge
            {isFreelancer && <> · confidence: {report.confidence}</>} · {monthLabel}
          </div>
        </article>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
