import type { Metadata } from "next";
import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";
import { BackToTop } from "@/components/rateforge/back-to-top";
import { Calculator } from "@/components/rateforge/calculator";
import { AdSlot } from "@/components/rateforge/ad-slot";

export const metadata: Metadata = {
  title: "Freelance Rate Calculator with Client Reports",
  description:
    "Free AI-powered freelance rate calculator. Get a rate backed by live market data, an itemized project quote, and a shareable client-ready report in seconds.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Freelance Rate Calculator with Client Reports — RateForge",
    description:
      "Know what your work is worth. Get a market-backed rate, itemized project quote, and a shareable report in ~15 seconds. Free, no signup.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RateForge — freelance rate calculator with client-ready reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Rate Calculator with Client Reports — RateForge",
    description:
      "Know what your work is worth. Get a market-backed rate and a shareable client-ready report in seconds.",
    images: ["/og-image.png"],
  },
};

/** JSON-LD: FAQPage + BreadcrumbList for the homepage. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is RateForge really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You get a few reports per day for free. No account, no credit card, no catch.",
      },
    },
    {
      "@type": "Question",
      name: "Where does the market data come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The AI searches current rate data for your skill and country at the moment you generate the report — it's not a static table from two years ago.",
      },
    },
    {
      "@type": "Question",
      name: "Can my client see the report?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "That's the point. Every report gets a clean, shareable link designed to be sent to clients — itemized quote, market context, and the reasoning behind your rate.",
      },
    },
    {
      "@type": "Question",
      name: "What if I work with day rates or project prices?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The report includes hourly, daily, and — if you describe the project — a full itemized project quote with an hour estimate per deliverable.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your inputs are used to generate the report and nothing else. Shared reports only contain what you choose to share.",
      },
    },
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "/",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Nav />

      <main>
        <section className="rf-hero rf-wrap" aria-label="Introduction">
          <p className="rf-kicker">Free · AI-powered · No signup</p>
          <h1 className="leading-[1.6] md:leading-normal">
            Know what your work is worth.{" "}
            <span>Prove it to your client.</span>
        </h1>
        <p className="rf-lede">
          RateForge calculates your freelance rate from real market data, your
          taxes, and your overhead — then builds an itemized, client-ready
          report you can send before the negotiation even starts.
        </p>
        <a className="rf-hero-cta" href="#calculator">
          Forge my rate report →
        </a>
        <p className="rf-hero-sub">Takes ~15 seconds. Live market data included.</p>
        <p style={{ marginTop: 18, fontSize: ".88rem" }}>
          New to freelance pricing?{" "}
          <a href="/guides" style={{ color: "var(--ledger)", textDecoration: "underline" }}>
            Read the pricing guides →
          </a>
        </p>
        <div className="rf-trust">
          <div>
            <strong>60+</strong>countries covered
          </div>
          <div>
            <strong>Live</strong>market rate data
          </div>
          <div>
            <strong>1 link</strong>to convince your client
          </div>
        </div>
      </section>

      <section id="calculator" className="rf-section rf-wrap" aria-label="Rate calculator">
        <p className="rf-kicker">The calculator</p>
        <h2 className="rf-h2">One form. A complete pricing case.</h2>
        <p style={{ color: "var(--muted)", marginBottom: 30, lineHeight: 1.6 }}>
          The more you tell it, the more specific your report gets. Only the
          first three fields are required.
        </p>
        <Calculator />
      </section>

      <section id="how" className="rf-section rf-wrap" aria-label="How it works">
        <p className="rf-kicker">How it works</p>
        <h2 className="rf-h2">From &quot;what should I charge?&quot; to a signed quote.</h2>
        <div className="rf-steps">
          <div className="rf-step">
            <div className="n">STEP 01</div>
            <h3>Describe your work</h3>
            <p>
              Your skill, country and experience — plus the actual project in
              plain words. &quot;4 logos, 6 sizes, 2 formats&quot; is enough.
            </p>
          </div>
          <div className="rf-step">
            <div className="n">STEP 02</div>
            <h3>AI checks the market</h3>
            <p>
              Live market rates for your skill and region, combined with local
              taxes, your overhead, and the unbillable hours everyone forgets.
            </p>
          </div>
          <div className="rf-step">
            <div className="n">STEP 03</div>
            <h3>Share the report</h3>
            <p>
              You get an itemized, professional report with a unique link. Send
              it to your client before the negotiation — let the numbers argue
              for you.
            </p>
          </div>
        </div>
      </section>

      <AdSlot slot="homepage-middle" />

      <section id="why" className="rf-section" aria-label="Why freelancers undercharge">
        <div className="rf-why">
          <div className="rf-why-in">
            <div>
              <h2>Most freelancers undercharge by 30–40%.</h2>
              <p>
                Not because their work is worth less — because their rate only
                covers the hours a client sees. Taxes, software, hardware,
                admin, sick days, and the hours between projects are invisible
                in &quot;€35/hour&quot;.
              </p>
              <p>
                RateForge makes the invisible visible. When a client sees{" "}
                <em style={{ color: "#5fd3ae" }}>why</em> a rate is what it is,
                the conversation changes from &quot;can you go lower?&quot; to
                &quot;when can you start?&quot;
              </p>
            </div>
            <div className="quote">
              &ldquo;A number is easy to argue with. An itemized breakdown
              backed by market data is not.&rdquo;
              <b>— THE RATEFORGE PRINCIPLE</b>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="rf-section rf-wrap" aria-label="Frequently asked questions">
        <p className="rf-kicker">FAQ</p>
        <h2 className="rf-h2">Questions freelancers actually ask.</h2>
        <div className="rf-faq" style={{ marginTop: 24 }}>
          <details>
            <summary>Is it really free?</summary>
            <p>
              Yes. You get a few reports per day for free. No account, no
              credit card, no catch.
            </p>
          </details>
          <details>
            <summary>Where does the market data come from?</summary>
            <p>
              The AI searches current rate data for your skill and country at
              the moment you generate the report — it&apos;s not a static table
              from two years ago.
            </p>
          </details>
          <details>
            <summary>Can my client see the report?</summary>
            <p>
              That&apos;s the point. Every report gets a clean, shareable link
              designed to be sent to clients — itemized quote, market context,
              and the reasoning behind your rate.
            </p>
          </details>
          <details>
            <summary>What if I work with day rates or project prices?</summary>
            <p>
              The report includes hourly, daily, and — if you describe the
              project — a full itemized project quote with an hour estimate per
              deliverable.
            </p>
          </details>
          <details>
            <summary>Is my data stored?</summary>
            <p>
              Your inputs are used to generate the report and nothing else.
              Shared reports only contain what you choose to share.
            </p>
          </details>
        </div>
      </section>
      </main>

      <Footer />
      <BackToTop />
    </>
  );
}
