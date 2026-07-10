"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Select from "react-select";
import Creatable from "react-select/creatable";
import type { RateReport, RateResponse } from "@/lib/types";
import { EXPERIENCE_LEVELS } from "@/lib/types";
import { fmtMoney, fmtHour, fmtRange } from "@/lib/types";
import { SKILL_SUGGESTIONS } from "@/lib/skills";
import { COUNTRY_OPTIONS, countrySelectStyles, type CountryOption } from "@/lib/countries";

/** react-select option shape for the skill combobox. */
interface SkillOption {
  value: string;
  label: string;
}
const SKILL_OPTIONS: SkillOption[] = SKILL_SUGGESTIONS.map((s) => ({
  value: s,
  label: s,
}));

type Status = "idle" | "loading" | "done" | "error";

/**
 * Calculator form + live receipt panel.
 * Posts to /api/rate and renders the returned JSON exactly like the
 * HTML demo's render() logic. After success, shows a "View full report"
 * link → /r/{id}?key={ownerKey}.
 *
 * Upgraded form:
 *  - Skill / role: <datalist> of ~200 common freelance roles (non-forcing)
 *  - Country: searchable react-select over all world countries (drives currency/tax)
 *  - Experience: 5 levels (Entry / Junior / Mid / Senior / Lead-Expert)
 *  - Team size: number input (default 1, min 1) — coordinates overhead when >1
 */
const DRAFT_KEY = "rateforge:draft";
const DRAFT_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface DraftData {
  skill: string; // the skill value (free text or suggestion)
  countryCode: string | null; // cca2 for the country react-select
  exp: string;
  goal: string;
  project: string;
  costs: string;
  teamSize: string;
  savedAt: number; // epoch ms — used to expire after 3 days
}

export function Calculator() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [data, setData] = useState<{
    report: RateReport;
    id: string;
    ownerKey: string;
  } | null>(null);

  // Controlled fields that aren't native inputs.
  const [skill, setSkill] = useState<SkillOption | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [country, setCountry] = useState<CountryOption | null>(null);
  const [teamSize, setTeamSize] = useState<string>("1");

  // Refs to the native <input>/<select>/<textarea> so we can restore saved
  // values on mount without making each one a controlled component.
  const expRef = useRef<HTMLSelectElement>(null);
  const goalRef = useRef<HTMLInputElement>(null);
  const projectRef = useRef<HTMLTextAreaElement>(null);
  const costsRef = useRef<HTMLTextAreaElement>(null);
  const restoredRef = useRef(false);

  // Restore the last submitted draft on mount (3-day TTL).
  useEffect(() => {
    if (restoredRef.current) return; // run once
    restoredRef.current = true;
    // Defer to a microtask so we don't call setState synchronously inside the effect.
    void Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const draft = JSON.parse(raw) as DraftData;
        if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
          localStorage.removeItem(DRAFT_KEY); // expired
          return;
        }
        // Restore controlled fields.
        if (draft.skill) {
          setSkill({ value: draft.skill, label: draft.skill });
        }
        if (draft.countryCode) {
          const opt = COUNTRY_OPTIONS.find((c) => c.value === draft.countryCode);
          if (opt) setCountry(opt);
        }
        if (draft.teamSize) setTeamSize(draft.teamSize);
        // Restore native inputs after they mount.
        requestAnimationFrame(() => {
          if (expRef.current && draft.exp) expRef.current.value = draft.exp;
          if (goalRef.current) goalRef.current.value = draft.goal ?? "";
          if (projectRef.current) projectRef.current.value = draft.project ?? "";
          if (costsRef.current) costsRef.current.value = draft.costs ?? "";
        });
      } catch {
        /* corrupt or unavailable — ignore */
      }
    });
  }, []);

  /** Persist the current form values to localStorage with a 3-day TTL. */
  function saveDraft(form: HTMLFormElement) {
    try {
      const fd = new FormData(form);
      const draft: DraftData = {
        skill: (skill?.value ?? "").trim(),
        countryCode: country?.value ?? null,
        exp: String(fd.get("exp") || ""),
        goal: String(fd.get("goal") || ""),
        project: String(fd.get("project") || ""),
        costs: String(fd.get("costs") || ""),
        teamSize,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage full / disabled — non-fatal */
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Persist the entered values so the user doesn't re-enter them next visit.
    saveDraft(form);
    const payload = {
      skill: (skill?.value ?? skill?.label ?? "").trim(),
      country: country?.label ?? "",
      country_code: country?.value, // extra hint for the model (optional, not validated)
      currency: country?.currency, // extra hint for the model (optional, not validated)
      exp: String(fd.get("exp") || "").trim(),
      goal: String(fd.get("goal") || "").trim(),
      project: String(fd.get("project") || "").trim(),
      costs: String(fd.get("costs") || "").trim(),
      team_size: Math.max(1, parseInt(teamSize, 10) || 1),
    };

    setStatus("loading");
    setErrorMsg("");
    setData(null);

    // On mobile (narrow screens), gently scroll the receipt panel into view so
    // the user sees the "Forging…" loading state. On desktop the receipt is
    // already visible beside the form, so we skip the scroll.
    if (typeof window !== "undefined" && window.innerWidth < 880) {
      requestAnimationFrame(() => {
        const receipt = document.querySelector(".rf-receipt");
        if (receipt) {
          receipt.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          res.status === 429
            ? body?.error ?? "You've reached the daily limit. Try again tomorrow."
            : body?.error ?? "Something went wrong. Try again.";
        setStatus("error");
        setErrorMsg(msg);
        return;
      }
      const typed = body as RateResponse;
      setData({ report: typed.report, id: typed.id, ownerKey: typed.ownerKey });
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <div className="rf-grid">
      <form className="rf-form" onSubmit={onSubmit}>
        {/* Skill / role — creatable combobox; suggestions only appear after typing */}
        <div className="rf-row">
          <div>
            <label htmlFor="skill">Skill / role</label>
            <Creatable<SkillOption>
              inputId="skill"
              className="rs-skill"
              classNamePrefix="rs"
              options={SKILL_OPTIONS}
              value={skill}
              onChange={(o) => {
                setSkill(o);
                setSkillInput("");
              }}
              inputValue={skillInput}
              onInputChange={(val, action) => {
                // Keep the typed text; ignore programmatic clears/blurs.
                if (action.action === "input-change") setSkillInput(val);
              }}
              // Menu only opens once the user types — no suggestions on focus.
              menuIsOpen={skillInput.trim().length > 0}
              placeholder="e.g. Brand designer"
              isClearable
              styles={countrySelectStyles}
              components={{ IndicatorSeparator: () => null, DropdownIndicator: () => null }}
              noOptionsMessage={() => "Type to search roles…"}
              formatCreateLabel={(input) => `Use "${input}"`}
              onCreateOption={(input) => {
                const trimmed = input.trim();
                if (!trimmed) return;
                const created: SkillOption = { value: trimmed, label: trimmed };
                setSkill(created);
                setSkillInput("");
              }}
            />
          </div>
          <div>
            <label htmlFor="country">Country</label>
            <Select<CountryOption>
              inputId="country"
              className="rs-country"
              classNamePrefix="rs"
              options={COUNTRY_OPTIONS}
              value={country}
              onChange={(o) => setCountry(o)}
              placeholder="Search countries…"
              isClearable
              styles={countrySelectStyles}
              components={{ IndicatorSeparator: () => null }}
              formatOptionLabel={(o) => (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden>{o.flag}</span>
                  <span>{o.label}</span>
                  <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: ".78rem", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>
                    {o.currency}
                  </span>
                </span>
              )}
            />
          </div>
        </div>

        {/* Experience — 5 levels; Team size — number */}
        <div className="rf-row">
          <div>
            <label htmlFor="exp">Experience</label>
            <select id="exp" name="exp" defaultValue="Mid (3–5 yrs)" ref={expRef}>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team-size">
              Team size <small>— incl. you</small>
            </label>
            <input
              id="team-size"
              name="team_size"
              type="number"
              min={1}
              max={50}
              step={1}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        {/* Income goal */}
        <div className="rf-row">
          <div>
            <label htmlFor="goal">
              Income goal or current rate <small>— per month, optional</small>
            </label>
            <input
              id="goal"
              name="goal"
              type="number"
              min={0}
              ref={goalRef}
              placeholder={country ? `e.g. 3500 ${country.currency}` : "e.g. 3500"}
            />
          </div>
          <div aria-hidden />
        </div>

        <label htmlFor="project">
          Describe the project <small>— optional, makes the quote specific</small>
        </label>
        <textarea
          id="project"
          name="project"
          maxLength={1200}
          ref={projectRef}
          placeholder={"e.g. 4 company logos, 6 sizes each, 2 resolutions, 2 file formats\nor: React app, 13 pages, frontend + small backend"}
        />
        <label htmlFor="costs">
          Your costs <small>— optional</small>
        </label>
        <textarea
          id="costs"
          name="costs"
          style={{ minHeight: 60 }}
          maxLength={1200}
          ref={costsRef}
          placeholder="e.g. Adobe CC €60/mo, coworking €150/mo, new laptop this year"
        />
        <button className="rf-btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Forging…" : "Forge my rate report"}
        </button>
        <p className="rf-hint">Free · no signup · your inputs are saved on this device for 3 days</p>
      </form>

      <div className="rf-receipt">
        <div className="rf-receipt-head">
          <span>RATE REPORT</span>
          <span className="dot">{status === "loading" ? "● FORGING" : "● LIVE"}</span>
        </div>
        <div className="rf-receipt-body">
          {status === "idle" && (
            <p className="rf-empty">
              Your report will appear here — rate, cost breakdown, project quote,
              and a note you can send straight to your client.
            </p>
          )}
          {status === "loading" && (
            <p className="rf-empty">Forging your report… this takes up to a minute ⏳</p>
          )}
          {status === "error" && (
            <>
              <p className="rf-empty" style={{ color: "#b03a2e" }}>
                {errorMsg}
              </p>
              <p className="rf-empty" style={{ marginTop: 8 }}>
                Adjust your inputs and try again.
              </p>
            </>
          )}
          {status === "done" && data && <Receipt report={data.report} id={data.id} ownerKey={data.ownerKey} />}
        </div>
      </div>
    </div>
  );
}

/** Inline receipt — mirrors render() from the HTML demo. */
function Receipt({
  report,
  id,
  ownerKey,
}: {
  report: RateReport;
  id: string;
  ownerKey: string;
}) {
  const cur = report.currency;
  return (
    <>
      <div className="rf-bigrate">
        {fmtRange(report.hourly_min, report.hourly_max, cur)}
        <small>/hour</small>
      </div>
      <div className="rf-daily">≈ {fmtMoney(report.daily, cur)}/day</div>

      <div className="rf-section-label">Where it goes</div>
      <div className="rf-ledger-line">
        <span>Taxes &amp; social</span>
        <span className="v">{report.breakdown.taxes_pct}%</span>
      </div>
      <div className="rf-ledger-line">
        <span>Overhead</span>
        <span className="v">{report.breakdown.overhead_pct}%</span>
      </div>
      <div className="rf-ledger-line">
        <span>Unbillable time</span>
        <span className="v">{report.breakdown.unbillable_pct}%</span>
      </div>

      {report.project && (
        <>
          <div className="rf-section-label">This project</div>
          {report.project.line_items.map((li, i) => (
            <div className="rf-ledger-line" key={i}>
              <span>{li.task}</span>
              <span className="v">{li.hours}h</span>
            </div>
          ))}
          <div
            className="rf-ledger-line"
            style={{ borderBottom: "2px solid var(--ink)", fontWeight: 600 }}
          >
            <span>Project quote</span>
            <span className="v">
              {fmtRange(report.project.price_min, report.project.price_max, cur)}
            </span>
          </div>
        </>
      )}

      <div className="rf-note">
        <strong>Client note:</strong> {report.client_note}
      </div>

      <Link
        className="rf-share"
        href={`/r/${id}?key=${ownerKey}`}
        style={{ display: "block", textAlign: "center", lineHeight: "2.4" }}
      >
        View full report →
      </Link>
    </>
  );
}
