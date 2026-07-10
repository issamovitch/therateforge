import type { Metadata } from "next";
import { LegalPage } from "@/components/rateforge/legal-page";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "RateForge terms of service — estimates not advice, no accuracy guarantee, acceptable use, liability limits, and how shared report links work.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service · RateForge",
    description:
      "The terms governing your use of RateForge — estimates not advice, no accuracy guarantee, acceptable use, liability, and public report links.",
    type: "website",
    url: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      path="/terms"
      intro="By using RateForge, you agree to these terms. Please read them before generating a report."
    >
      <h2>1. Estimates, not advice</h2>
      <p>
        RateForge produces <strong>pricing estimates</strong> based on live
        market data, country-typical tax rates, and the inputs you provide. The
        reports are intended as a starting point for your own pricing decisions
        and client conversations. They are <strong>not financial, legal, or tax
        advice</strong>, and should not be relied upon as the sole basis for a
        contract, invoice, or tax filing. Consult a qualified accountant or
        lawyer for advice specific to your situation and jurisdiction.
      </p>

      <h2>2. No guarantee of accuracy</h2>
      <p>
        Market rates fluctuate, tax rules change, and AI-generated analysis can
        be imperfect. We make <strong>no warranty</strong> that any report is
        accurate, complete, or current. You are responsible for verifying all
        numbers before quoting them to a client. Use of RateForge is at your own
        risk.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Attempt to reverse-engineer, scrape, or overload the service;</li>
        <li>Circumvent the daily rate limit (5 reports / IP / day);</li>
        <li>
          Use the service to generate fraudulent quotes, misrepresent
          qualifications, or deceive clients;
        </li>
        <li>
          Submit content that is unlawful, infringing, or contains personal data
          of third parties without their consent.
        </li>
      </ul>
      <p>
        We may revoke access and delete reports for accounts that violate these
        terms.
      </p>

      <h2>4. Shared report links are public</h2>
      <p>
        Each report is assigned a link of the form{" "}
        <code>therateforge.com/r/{"{id}"}</code>. <strong>Anyone with this link
        can view the client version of your report</strong> — there is no
        password. The freelancer-only view is gated by the secret owner key,
        which is shown to you once at generation time and never re-transmitted.
        Treat your owner key as a password: do not share it. We are not liable
        for disclosure of report contents resulting from a leaked link or owner
        key.
      </p>

      <h2>5. Report retention</h2>
      <p>
        Reports are stored for <strong>90 days</strong> and then automatically
        deleted. You may request earlier deletion at any time (see the{" "}
        <a href="/privacy">Privacy Policy</a>).
      </p>

      <h2>6. Intellectual property</h2>
      <p>
        The RateForge name, logo, software, and design are owned by RateForge.
        The <em>content</em> of each report (the numbers, breakdown, and notes)
        belongs to the freelancer who generated it. By generating a report, you
        grant RateForge a limited licence to store and display it via its
        shareable link for the retention period.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, RateForge and its operators
        shall not be liable for any indirect, incidental, or consequential
        damages arising from your use of the service, including but not limited
        to lost revenue, lost clients, or pricing decisions made in reliance on
        a report. Our total liability for any claim is limited to the amount
        you paid us to use the service in the preceding 12 months — which, since
        the service is free, is zero.
      </p>

      <h2>8. Third-party services</h2>
      <p>
        RateForge relies on third parties (OpenAI for report generation, Turso
        for database storage, Google AdSense for advertising). We are not
        responsible for the practices or availability of these third parties;
        their terms and policies apply to your interactions with them.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use after a
        change constitutes acceptance of the updated terms. Material changes
        will be highlighted on the homepage.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws applicable at RateForge&apos;s
        place of operation, without regard to conflict-of-law principles.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:contact@therateforge.com">contact@therateforge.com</a>.
      </p>

      <p className="rf-legal-meta">Last updated: July 2026</p>
    </LegalPage>
  );
}
