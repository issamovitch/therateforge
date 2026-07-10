"use client";

import { useEffect } from "react";
import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";

/**
 * Root error boundary — catches any uncaught error in a route segment and shows
 * a friendly error page with a retry button. Must be a client component.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RateForge] route error:", error);
  }, [error]);

  return (
    <>
      <Nav />
      <main className="rf-wrap">
        <div className="rf-missing" style={{ marginTop: 80 }}>
          <h1>Something went wrong</h1>
          <p>
            An unexpected error occurred while loading this page. You can try
            again, or head back to the homepage.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "var(--ledger)",
                color: "#fff",
                border: "none",
                padding: "13px 28px",
                borderRadius: 9,
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: "#fff",
                color: "var(--ledger)",
                border: "1.5px solid var(--ledger)",
                padding: "11px 26px",
                borderRadius: 9,
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: 24, fontSize: "0.75rem", color: "var(--muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
