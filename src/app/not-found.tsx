import Link from "next/link";
import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";
import { BackToTop } from "@/components/rateforge/back-to-top";

/**
 * Root 404 page — shown when no route matches. Uses the site's "missing" card
 * style and offers links to the homepage, guides, and calculator.
 */
export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="rf-wrap">
        <div className="rf-missing" style={{ marginTop: 80 }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "var(--ledger)", marginBottom: 8 }}>
            404
          </h1>
          <p style={{ fontSize: "1.1rem", marginBottom: 28 }}>
            This page doesn&apos;t exist — or it was a report link that has expired.
            Reports are kept for 90 days; after that they&apos;re automatically deleted.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/#calculator"
              className="rf-hero-cta"
              style={{ display: "inline-block" }}
            >
              Forge a new rate report →
            </Link>
            <Link
              href="/guides"
              style={{
                background: "#fff",
                color: "var(--ledger)",
                border: "1.5px solid var(--ledger)",
                padding: "13px 28px",
                borderRadius: 10,
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              Read the guides
            </Link>
          </div>
          <p style={{ marginTop: 24 }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "underline" }}>
              ← Back to homepage
            </Link>
          </p>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
