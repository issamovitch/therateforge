import { NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Diagnostic endpoint — tests the OpenAI connection from the SERVER side.
 *
 * Accepts an optional `{ key }` in the body. If omitted, falls back to
 * process.env.OPENAI_API_KEY. Returns a structured result so the backdoor
 * page can show exactly what happened (auth, region block, latency, etc.).
 *
 * NOTE: in the preview sandbox this server's egress IP is in a region OpenAI
 * blocks, so this will return `unsupported_country_region_territory` here.
 * On Vercel the same code succeeds.
 */
export async function POST(req: Request) {
  let body: { key?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body is fine */
  }

  const providedKey = body.key?.trim();
  const key = providedKey || process.env.OPENAI_API_KEY;

  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        error: "No API key provided (neither in the request body nor in OPENAI_API_KEY env var).",
      },
      { status: 200 },
    );
  }

  const keySource = providedKey ? "request body (your input)" : "process.env.OPENAI_API_KEY";
  const keyPrefix = `${key.slice(0, 7)}…${key.slice(-4)}`;
  const client = new OpenAI({ apiKey: key });
  const started = Date.now();

  try {
    // Lightest possible authenticated call — lists models.
    const res = await client.models.list();
    const data = (res as unknown as { data?: { id: string }[] }).data ?? [];
    return NextResponse.json({
      ok: true,
      latencyMs: Date.now() - started,
      keySource,
      keyPrefix,
      totalModels: data.length,
      sampleModels: data.slice(0, 5).map((m) => m.id),
      note: "Server reached OpenAI successfully.",
    });
  } catch (e) {
    const err = e as {
      message?: string;
      code?: string;
      type?: string;
      status?: number;
    };
    return NextResponse.json(
      {
        ok: false,
        latencyMs: Date.now() - started,
        keySource,
        keyPrefix,
        error: err.message ?? "Unknown error",
        code: err.code ?? null,
        type: err.type ?? null,
        status: err.status ?? null,
        regionBlocked: err.code === "unsupported_country_region_territory",
        note:
          err.code === "unsupported_country_region_territory"
            ? "The SERVER's egress IP is in a region OpenAI blocks. This is NOT a key problem — the key was never validated. On Vercel (allowed region) this same call works."
            : err.status === 401
              ? "The key was rejected (401). Check that it's a valid OpenAI API key."
              : "OpenAI call failed. See the error/code fields above.",
      },
      { status: 200 },
    );
  }
}
