import type { ReactNode } from "react";
import { Nav } from "./nav";
import { Footer } from "./footer";
import { BackToTop } from "./back-to-top";

/**
 * Shared layout shell for the legal/info pages (/privacy, /terms, /contact).
 * Matches the site design: sticky nav, centered prose column, footer.
 * Injects a BreadcrumbList JSON-LD so search engines see the site hierarchy.
 */
export function LegalPage({
  title,
  intro,
  path,
  children,
}: {
  title: string;
  intro?: string;
  /** The page path, e.g. "/privacy" — used for the breadcrumb canonical URL. */
  path: string;
  children: ReactNode;
}) {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: title, item: path },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Nav />
      <main className="rf-wrap rf-legal">
        <article>
          <p className="rf-kicker">
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>
              RateForge
            </a>{" "}
            › {title}
          </p>
          <h1 className="rf-legal-h1">{title}</h1>
          {intro && <p className="rf-legal-intro">{intro}</p>}
          <div className="rf-legal-body">{children}</div>
        </article>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
