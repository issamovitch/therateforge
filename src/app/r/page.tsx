import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";
import { BackToTop } from "@/components/rateforge/back-to-top";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Freelance Rate Reports",
  description:
    "Market-backed freelance rate reports for designers, developers, writers and more. Hourly & daily rates, cost breakdown, and client-ready project quotes.",
  alternates: { canonical: "/r" },
  openGraph: {
    title: "Freelance Rate Reports — RateForge",
    description:
      "Market-backed freelance rate reports with hourly/daily rates, cost breakdown, and client-ready project quotes.",
    type: "website",
    url: `${SITE_URL}/r`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RateForge freelance rate reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Rate Reports — RateForge",
    description:
      "Market-backed freelance rate reports with client-ready project quotes.",
    images: ["/og-image.png"],
  },
};

/**
 * JSON-LD: this is a CollectionPage listing rate reports by category.
 * Helps Google understand the /r page is an index/hub for rate reports.
 */
const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Freelance Rate Reports",
  description:
    "Market-backed freelance rate reports — hourly and daily rates, cost breakdowns, and itemized project quotes for freelancers worldwide.",
  url: `${SITE_URL}/r`,
  isPartOf: { "@type": "WebApplication", name: "RateForge", url: SITE_URL },
  publisher: {
    "@type": "Organization",
    name: "RateForge",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 500, height: 500 },
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Rate Reports", item: `${SITE_URL}/r` },
  ],
};

const CATEGORIES = [
  {
    title: "Design & creative",
    desc: "Brand designers, UI/UX designers, illustrators, motion designers, photographers.",
    skills: ["Brand designer", "UI designer", "UX designer", "Illustrator", "Motion designer", "Photographer"],
    icon: "✦",
  },
  {
    title: "Development & engineering",
    desc: "Frontend, backend, full-stack, mobile, DevOps, and data engineers.",
    skills: ["Frontend developer", "React developer", "Backend developer", "Full-stack developer", "iOS developer", "DevOps engineer"],
    icon: "⌘",
  },
  {
    title: "Writing & content",
    desc: "Copywriters, technical writers, content strategists, translators, editors.",
    skills: ["Copywriter", "Technical writer", "Content writer", "Translator", "SEO writer", "Editor"],
    icon: "✎",
  },
  {
    title: "Marketing & growth",
    desc: "Digital marketers, SEO specialists, social media managers, PPC experts.",
    skills: ["Digital marketer", "SEO specialist", "Social media manager", "PPC specialist", "Email marketer", "Growth marketer"],
    icon: "↗",
  },
  {
    title: "Data, AI & ML",
    desc: "Data scientists, ML engineers, prompt engineers, BI analysts.",
    skills: ["Data scientist", "Data analyst", "Machine learning engineer", "Prompt engineer", "AI engineer", "BI analyst"],
    icon: "◈",
  },
  {
    title: "Business & consulting",
    desc: "Product managers, project managers, consultants, virtual assistants.",
    skills: ["Product manager", "Project manager", "Business analyst", "Virtual assistant", "Accountant", "Career coach"],
    icon: "◆",
  },
];

export default function ReportsIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Nav />

      <main>
        {/* Hero */}
        <section className="rf-wrap rf-r-hero" aria-label="Rate reports intro">
          <p className="rf-kicker">Rate Reports</p>
          <h1>
            Freelance rate reports, backed by <span>live market data</span>.
          </h1>
          <p className="rf-lede">
            Every RateForge report turns your skill, country and experience into
            a defensible rate: hourly and daily figures, a transparent cost
            breakdown (taxes, overhead, unbillable time), and — if you describe
            the project — an itemized quote you can send straight to your client.
          </p>
          <Link className="rf-hero-cta" href="/#calculator">
            Forge my rate report →
          </Link>
          <p className="rf-hero-sub">Takes ~15 seconds. Free · no signup.</p>
        </section>

        {/* What's in a report */}
        <section className="rf-wrap rf-section" aria-label="What's in a report">
          <p className="rf-kicker">What you get</p>
          <h2 className="rf-h2">Every report includes</h2>
          <div className="rf-steps">
            <div className="rf-step">
              <div className="n">01</div>
              <h3>Hourly & daily rate</h3>
              <p>
                A market-anchored rate range and a recommended hourly figure,
                with the equivalent daily rate. Grounded in current web-searched
                rates for your skill and country.
              </p>
            </div>
            <div className="rf-step">
              <div className="n">02</div>
              <h3>Cost breakdown</h3>
              <p>
                Taxes &amp; social security, overhead, and unbillable time —
                shown as percentages so your client sees exactly what the rate
                covers, with nothing hidden.
              </p>
            </div>
            <div className="rf-step">
              <div className="n">03</div>
              <h3>Itemized project quote</h3>
              <p>
                Describe the project and get a line-by-line breakdown of
                deliverables, hours and per-item prices — a quote that
                reconciles to the penny.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="rf-wrap rf-section" aria-label="Report categories">
          <p className="rf-kicker">By discipline</p>
          <h2 className="rf-h2">Rate reports for every freelance discipline</h2>
          <p style={{ color: "var(--muted)", marginBottom: 30, lineHeight: 1.6 }}>
            Pick your role, country and experience level to generate a report
            tailored to your market. A few of the most common disciplines:
          </p>
          <div className="rf-r-grid">
            {CATEGORIES.map((cat) => (
              <article className="rf-r-card" key={cat.title}>
                <div className="rf-r-card-icon" aria-hidden>{cat.icon}</div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
                <ul>
                  {cat.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="rf-wrap rf-section" aria-label="How it works">
          <p className="rf-kicker">How it works</p>
          <h2 className="rf-h2">From inputs to a client-ready quote</h2>
          <div className="rf-steps">
            <div className="rf-step">
              <div className="n">STEP 01</div>
              <h3>Describe your work</h3>
              <p>
                Your skill, country, experience level, and the project in plain
                words. The first three are required; the rest makes the quote
                specific.
              </p>
            </div>
            <div className="rf-step">
              <div className="n">STEP 02</div>
              <h3>AI checks the market</h3>
              <p>
                Live web-searched rates for your skill and region, combined with
                local taxes, your overhead, and the unbillable hours everyone
                forgets.
              </p>
            </div>
            <div className="rf-step">
              <div className="n">STEP 03</div>
              <h3>Share the report</h3>
              <p>
                You get an itemized report with a unique, shareable link. Send it
                to your client before the negotiation — let the numbers argue for
                you.
              </p>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link className="rf-hero-cta" href="/#calculator">
              Calculate my rate →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </>
  );
}
