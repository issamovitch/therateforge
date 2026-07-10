"use client";

import { useState } from "react";
import { Nav } from "./nav";
import { Footer } from "./footer";

interface ServerResult {
  ok: boolean;
  latencyMs?: number;
  keySource?: string;
  keyPrefix?: string;
  error?: string;
  code?: string | null;
  type?: string | null;
  status?: number | null;
  regionBlocked?: boolean;
  note?: string;
  totalModels?: number;
  sampleModels?: string[];
}

interface BrowserResult {
  ok: boolean;
  status: number | string;
  latencyMs: number;
  error?: string;
  sampleModels?: string[];
  note?: string;
}

/**
 * Secret diagnostics panel (mounted at /rf-diag-9f2k).
 *
 * Lets you test the OpenAI connection two ways:
 *   1. Browser-direct — your browser → api.openai.com (bypasses the sandbox
 *      server; works if YOUR region is allowed by OpenAI).
 *   2. Server-side   — sandbox server → api.openai.com (shows the regional
 *      block in this sandbox; works on Vercel).
 *
 * The key you type is used only in-memory for these test calls and is never
 * stored, logged, or sent anywhere except OpenAI.
 */
export function DiagPanel() {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [browserResult, setBrowserResult] = useState<BrowserResult | null>(null);
  const [serverResult, setServerResult] = useState<ServerResult | null>(null);
  const [browserLoading, setBrowserLoading] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);

  async function testBrowser() {
    if (!key.trim()) return;
    setBrowserLoading(true);
    setBrowserResult(null);
    const started = Date.now();
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key.trim()}` },
      });
      const body = await res.json().catch(() => ({}));
      const errCode = body?.error?.code;
      setBrowserResult({
        ok: res.ok,
        status: res.status,
        latencyMs: Date.now() - started,
        error: errCode || body?.error?.message,
        sampleModels: body?.data?.slice(0, 5).map((m: { id: string }) => m.id),
        note: res.ok
          ? "Your browser reached OpenAI directly — key valid & region allowed."
          : errCode === "unsupported_country_region_territory"
            ? "Your browser's IP is in a region OpenAI blocks."
            : res.status === 401
              ? "Key rejected (401) — check it's a valid OpenAI API key."
              : undefined,
      });
    } catch (e) {
      setBrowserResult({
        ok: false,
        status: "network error",
        latencyMs: Date.now() - started,
        error: (e as Error).message,
        note: "Likely a CORS block or your network can't reach api.openai.com directly from the browser.",
      });
    } finally {
      setBrowserLoading(false);
    }
  }

  async function testServer() {
    setServerLoading(true);
    setServerResult(null);
    try {
      const res = await fetch("/api/diagnostics/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() || undefined }),
      });
      const body = (await res.json()) as ServerResult;
      setServerResult(body);
    } catch (e) {
      setServerResult({ ok: false, error: (e as Error).message });
    } finally {
      setServerLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="rf-wrap" style={{ minHeight: "calc(100vh - 60px - 90px)", padding: "40px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p className="rf-kicker">Backdoor · diagnostics</p>
          <h2 className="rf-h2">OpenAI connection test</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 28 }}>
            Test the OpenAI API key from two egress points. The key you enter
            below is used only in-memory for these test calls — never stored,
            never logged.
          </p>

          {/* Key input */}
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, marginBottom: 24 }}>
            <label htmlFor="oai-key" style={{ display: "block", fontSize: ".78rem", fontWeight: 600, marginBottom: 8 }}>
              OpenAI API key
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                id="oai-key"
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-..."
                spellCheck={false}
                autoComplete="off"
                style={{ flex: 1, padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 9, font: "inherit", fontSize: ".93rem", background: "#fff", color: "var(--ink)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                style={{ padding: "0 16px", border: "1px solid var(--line)", borderRadius: 9, background: "#fff", cursor: "pointer", font: "inherit", fontSize: ".85rem", color: "var(--muted)" }}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 8 }}>
              Leave empty to test with the server&apos;s <code>OPENAI_API_KEY</code> env var.
            </p>
          </div>

          {/* Test buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <button
              type="button"
              onClick={testBrowser}
              disabled={browserLoading || !key.trim()}
              className="rf-btn"
              style={{ margin: 0, opacity: browserLoading || !key.trim() ? 0.55 : 1 }}
            >
              {browserLoading ? "Testing…" : "Test from my browser"}
            </button>
            <button
              type="button"
              onClick={testServer}
              disabled={serverLoading}
              className="rf-btn"
              style={{ margin: 0, opacity: serverLoading ? 0.55 : 1 }}
            >
              {serverLoading ? "Testing…" : "Test from this server"}
            </button>
          </div>

          {/* Results */}
          <div style={{ display: "grid", gap: 16 }}>
            <ResultCard title="Browser-direct result" result={browserResult} loading={browserLoading} />
            <ResultCard title="Server-side result" result={serverResult} loading={serverLoading} />
          </div>

          {/* Explanation */}
          <div className="rf-rnote" style={{ marginTop: 28, fontSize: ".85rem" }}>
            <strong style={{ display: "block", marginBottom: 8 }}>How to read this</strong>
            <p style={{ marginBottom: 10 }}>
              <strong>Browser-direct:</strong> your browser calls{" "}
              <code>api.openai.com</code> directly, bypassing the sandbox server
              entirely. If this succeeds, your key is valid and{" "}
              <em>your</em> region is allowed. If it fails with{" "}
              <code>unsupported_country_region_territory</code>, your browser IP
              is in a blocked region.
            </p>
            <p style={{ marginBottom: 10 }}>
              <strong>Server-side:</strong> the sandbox server calls OpenAI. In
              this sandbox the server&apos;s egress IP is in a region OpenAI
              blocks, so this returns{" "}
              <code>unsupported_country_region_territory</code> —{" "}
              <em>regardless of the key</em>. On Vercel (allowed region) this
              same code succeeds. This is why the main app falls back to the
              in-house z-ai provider (which also does real web search) while
              previewing here.
            </p>
            <p style={{ marginBottom: 0 }}>
              The full OpenAI code path (<code>gpt-5.4-mini</code>,{" "}
              <code>reasoning: low</code>, <code>web_search_preview</code>,
              strict JSON schema) is wired and correct — it activates
              automatically wherever the server can reach OpenAI.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function ResultCard({
  title,
  result,
  loading,
}: {
  title: string;
  result: { ok: boolean; error?: string; note?: string; latencyMs?: number; keySource?: string; keyPrefix?: string; code?: string | null; status?: number | string | null; sampleModels?: string[]; totalModels?: number } | null;
  loading: boolean;
}) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontFamily: "var(--font-space-grotesk, sans-serif)", fontSize: "1rem", fontWeight: 700 }}>{title}</h3>
        {result && (
          <span style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: ".75rem", fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: result.ok ? "var(--ledger-soft)" : "#fdecea", color: result.ok ? "var(--ledger)" : "#b03a2e" }}>
            {result.ok ? "✓ OK" : "✗ FAIL"}
          </span>
        )}
      </div>
      {loading && <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>Running…</p>}
      {!loading && !result && (
        <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>No test run yet.</p>
      )}
      {!loading && result && (
        <div style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: ".8rem", lineHeight: 1.7 }}>
          {result.latencyMs !== undefined && <div>latency: {result.latencyMs}ms</div>}
          {result.status !== undefined && <div>status: {String(result.status)}</div>}
          {result.keySource && <div>key source: {result.keySource}</div>}
          {result.keyPrefix && <div>key: {result.keyPrefix}</div>}
          {result.code && <div>code: {result.code}</div>}
          {result.error && <div style={{ color: "#b03a2e", marginTop: 6 }}>error: {result.error}</div>}
          {result.totalModels !== undefined && <div>models visible: {result.totalModels}</div>}
          {result.sampleModels && result.sampleModels.length > 0 && (
            <div style={{ marginTop: 6 }}>sample: {result.sampleModels.join(", ")}</div>
          )}
          {result.note && (
            <div style={{ marginTop: 10, padding: 10, background: "var(--paper)", borderRadius: 8, fontFamily: "Inter, sans-serif", fontSize: ".82rem", color: "#3c4a46" }}>
              {result.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
