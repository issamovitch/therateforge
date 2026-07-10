"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RateReport } from "@/lib/types";
import { fmtHour, fmtMoney } from "@/lib/types";

/**
 * Freelancer-only interactive bits of the report page:
 *  - copy client link
 *  - download PDF (window.print)
 *  - one-time refine box
 *
 * Renders nothing visible in the client view (parent only mounts it in
 * the freelancer view).
 */
export function FreelancerActions({
  id,
  report,
  refined,
  inputs,
}: {
  id: string;
  report: RateReport;
  refined: boolean;
  inputs: { skill: string; country: string; exp: string };
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineErr, setRefineErr] = useState("");
  const [used, setUsed] = useState(refined);
  const [msg, setMsg] = useState("");

  // Always use the current host (window.location.origin) so the copied link
  // works on every environment — production, Vercel previews, and the sandbox.
  // Never hardcode a domain here; the link must point to wherever the user
  // actually generated the report.
  const clientLink =
    typeof window !== "undefined" ? `${window.location.origin}/r/${id}` : `/r/${id}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(clientLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers / non-secure contexts.
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  async function doRefine() {
    if (!msg.trim() || used) return;
    setRefining(true);
    setRefineErr("");
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ownerKey: getOwnerKey(), message: msg.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRefineErr(body?.error ?? "Refine failed. Try again.");
        return;
      }
      setUsed(true);
      setMsg("");
      // Refresh server component to show updated report.
      router.refresh();
    } catch {
      setRefineErr("Network error. Try again.");
    } finally {
      setRefining(false);
    }
  }

  return (
    <>
      <div className="rf-sec rf-fo">
        <div className="rf-private">
          <div className="pl">🔒 Negotiation tip — private</div>
          {report.negotiation_tip}
        </div>
      </div>

      <div className="rf-sec rf-fo">
        <h2 className="rf-sec-h2">Share with your client</h2>
        <div className="rf-sharebar">
          <button type="button" className="copy" onClick={copyLink}>
            {copied ? "Copied!" : "Copy client link"}
          </button>
          <button
            type="button"
            className="pdf"
            onClick={() => window.print()}
          >
            Download PDF
          </button>
        </div>
        <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 8, fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
          Client link: {clientLink}
        </p>
      </div>

      <div className="rf-sec rf-fo">
        <div className="rf-refine">
          <div className="rl">1 correction included</div>
          {used ? (
            <p className="used">✓ Correction used — report updated.</p>
          ) : (
            <>
              <textarea
                value={msg}
                maxLength={300}
                placeholder="e.g. The project also includes a brand guidelines PDF. / I'm actually based in Porto, not Lisbon."
                onChange={(e) => setMsg(e.target.value)}
              />
              <button
                type="button"
                className="rb"
                onClick={doRefine}
                disabled={refining || !msg.trim()}
              >
                {refining ? "Applying…" : "Apply correction"}
              </button>
              {refineErr && (
                <p className="used" style={{ color: "#b03a2e", marginTop: 8 }}>
                  {refineErr}
                </p>
              )}
              <p className="used" style={{ marginTop: 8 }}>
                One correction per report — use it for factual or scope
                clarifications.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/** Read the owner key from the current URL's ?key=. */
function getOwnerKey(): string {
  if (typeof window === "undefined") return "";
  return new URL(window.location.href).searchParams.get("key") ?? "";
}
