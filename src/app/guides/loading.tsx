import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";

/**
 * Loading state for the /guides section — shown while guide content loads.
 */
export default function GuidesLoading() {
  return (
    <>
      <Nav />
      <main className="rf-wrap" style={{ paddingBottom: 80 }}>
        <div style={{ textAlign: "center", padding: "64px 0 32px" }}>
          <div className="rf-spinner" style={{ margin: "0 auto 20px" }} />
          <p style={{ color: "var(--muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: "0.85rem" }}>
            Loading guides…
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
