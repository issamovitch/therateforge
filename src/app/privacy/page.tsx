import type { Metadata } from "next";
import { LegalPage } from "@/components/rateforge/legal-page";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RateForge collects, uses, and protects your data — calculator inputs, IP for rate limiting, report storage, AdSense cookies, and your deletion rights.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy · RateForge",
    description:
      "How RateForge collects, uses, and protects your data — form inputs, IP for rate limiting, report storage, and Google AdSense.",
    type: "website",
    url: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy"
      intro="Your privacy matters. This policy explains what data RateForge collects, why, how long it's kept, and the choices you have."
    >
      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Calculator inputs.</strong> When you generate a rate report,
          we receive the skill, country, experience level, optional income goal,
          project description, costs, and team size you enter.
        </li>
        <li>
          <strong>IP address.</strong> We log your IP address solely to enforce
          the daily limit of 5 reports per IP per day. The IP is stored as part
          of a counter keyed by IP + day, not linked to your name or the report
          content.
        </li>
        <li>
          <strong>Generated reports.</strong> The report we produce for you —
          including the itemized breakdown, market context, and client note — is
          stored in our database so it can be retrieved via its shareable link.
        </li>
        <li>
          <strong>Owner key.</strong> Each report is assigned a secret owner
          key. The key is shown only to you, once, at generation time, and is
          never emailed or re-transmitted.
        </li>
      </ul>

      <h2>2. How your inputs are processed</h2>
      <p>
        To generate your report, your calculator inputs are sent to{" "}
        <strong>OpenAI</strong> (the AI provider), which performs a live web
        search for current market rates and produces the structured report.
        OpenAI processes this data under its own terms to return the result; we
        do not control OpenAI&apos;s retention of API request data — see{" "}
        <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer">
          OpenAI&apos;s privacy policy
        </a>
        .
      </p>

      <h2>3. Where data is stored and for how long</h2>
      <ul>
        <li>
          Reports are stored in a hosted SQLite database (Turso / libSQL). Each
          report is kept for <strong>90 days</strong>, after which it is
          automatically deleted.
        </li>
        <li>
          Market-rate search results are cached for up to <strong>7 days</strong>{" "}
          (keyed by skill + country + experience) to avoid repeat search costs.
          The cache contains no personal data.
        </li>
        <li>
          Rate-limit counters (IP + day) are overwritten daily and contain no
          report content.
        </li>
      </ul>

      <h2>4. Shareable report links</h2>
      <p>
        Every report gets a public link of the form{" "}
        <code>therateforge.com/r/{"{id}"}</code>. <strong>Anyone with this link
        can view the client version of your report</strong> — it is not
        password-protected. The freelancer-only view (pricing tiers, negotiation
        tip, refine box) is accessible only with the secret owner key. Do not
        share the owner key. If a report link is leaked, you can request
        deletion (see below).
      </p>

      <h2>5. Advertising — Google AdSense</h2>
      <p>
        RateForge displays ads via <strong>Google AdSense</strong>. Google and
        its third-party vendors may use cookies and similar technologies to serve
        ads based on your prior visits to this and other websites. Google&apos;s
        use of advertising cookies enables it and its partners to serve ads based
        on your visit to this site and/or other sites on the internet.
      </p>
      <ul>
        <li>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          .
        </li>
        <li>
          Third-party vendors and ad networks serving ads on RateForge are
          subject to their own privacy policies. We do not control their
          cookie practices.
        </li>
        <li>
          The tool is fully usable without clicking any ad. Ads keep RateForge
          free.
        </li>
      </ul>

      <h2>6. Cookies</h2>
      <p>
        RateForge itself does not set first-party tracking cookies. AdSense and
        its vendors may set cookies as described above. Your browser&apos;s
        settings allow you to block or delete cookies at any time; note that
        doing so does not affect the calculator&apos;s functionality.
      </p>

      <h2>7. Your choices — deletion requests</h2>
      <p>
        You can request deletion of any report at any time. Email{" "}
        <a href="mailto:contact@therateforge.com">contact@therateforge.com</a>{" "}
        with the report ID (from the shareable link) and we will remove it from
        the database within 5 business days, regardless of the 90-day retention
        window.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>
        RateForge is not directed to children under 16, and we do not knowingly
        collect data from them. If you believe a minor has submitted data,
        contact us and we will delete it.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        reflected by updating the &quot;last updated&quot; date below and, where
        appropriate, highlighting the change on the homepage.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions or deletion requests? Email{" "}
        <a href="mailto:contact@therateforge.com">contact@therateforge.com</a>.
      </p>

      <p className="rf-legal-meta">Last updated: July 2026</p>
    </LegalPage>
  );
}
