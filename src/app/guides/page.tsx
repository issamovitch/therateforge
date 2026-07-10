import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";
import { BackToTop } from "@/components/rateforge/back-to-top";
import { getGuidesByCategory, GUIDE_CATEGORIES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Freelance Pricing Guides",
  description:
    "Practical, no-fluff guides on freelance pricing — how to set your rate, price by skill and country, negotiate, and stop undercharging. Written for freelancers.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Freelance Pricing Guides — RateForge",
    description:
      "How to set your rate, price by skill and country, negotiate, and stop undercharging. Practical guides for freelancers.",
    type: "website",
    url: `${SITE_URL}/guides`,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RateForge freelance pricing guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Pricing Guides — RateForge",
    description: "How to set your rate, price by skill and country, and negotiate. Practical guides for freelancers.",
    images: ["/og-image.png"],
  },
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Freelance Pricing Guides",
  description: "Practical guides on freelance pricing, rates, and negotiation.",
  url: `${SITE_URL}/guides`,
  isPartOf: { "@type": "WebApplication", name: "RateForge", url: SITE_URL },
};

export default function GuidesIndexPage() {
  const grouped = getGuidesByCategory();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Nav />
      <main>
        <section className="rf-guides-hero rf-wrap" aria-label="Guides intro">
          <p className="rf-kicker">Guides</p>
          <h1>Freelance Pricing Guides</h1>
          <p>
            Practical, no-fluff guides on setting your rate, pricing by skill
            and country, justifying your price to clients, and knowing when
            you&apos;re undercharging. Written for freelancers, not search engines.
          </p>
        </section>

        <section className="rf-wrap" style={{ paddingBottom: 72 }}>
          {/* TODO: add Fuse.js client-side search at 15+ guides */}
          {GUIDE_CATEGORIES.map((cat) => {
            const guides = grouped[cat];
            if (!guides || guides.length === 0) return null;
            return (
              <div className="rf-guide-cat" key={cat}>
                <h2>{cat}</h2>
                <div className="rf-guide-grid">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="rf-guide-card"
                    >
                      <span className="rf-guide-card-tag">{g.category}</span>
                      <h3>{g.title}</h3>
                      <p>{g.description}</p>
                      <span className="rf-guide-card-meta">{g.readTime}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
