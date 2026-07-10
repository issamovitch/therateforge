import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";

/**
 * Root loading UI — shown on every route transition while the server component
 * is fetching data. Matches the site design with a centered ledger-green spinner.
 */
export default function Loading() {
  return (
    <>
      <Nav />
      <main className="rf-wrap" style={{ minHeight: "calc(100vh - 60px - 90px)" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 20px",
          gap: 20,
        }}>
          <div className="rf-spinner" aria-label="Loading" />
          <p style={{ color: "var(--muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: "0.85rem" }}>
            Loading…
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
