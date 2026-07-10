import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";

/**
 * Loading state for the /r/[id] report page — shown while the report is
 * fetched from Turso. Mirrors the report card layout with a skeleton.
 */
export default function ReportLoading() {
  return (
    <>
      <Nav />
      <main className="rf-wrap">
        <div className="rf-report" style={{ maxWidth: 640, margin: "20px auto 64px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ height: 14, background: "var(--paper)", borderRadius: 7, width: 180, margin: "0 auto 12px" }} />
            <div style={{ height: 28, background: "var(--paper)", borderRadius: 7, width: 320, margin: "0 auto 10px" }} />
            <div style={{ height: 14, background: "var(--paper)", borderRadius: 7, width: 240, margin: "0 auto" }} />
          </div>
          <div className="rf-rate-box" style={{ marginBottom: 36 }}>
            <div className="rf-spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: "0.82rem" }}>
              Loading report…
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
