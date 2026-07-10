import type { Metadata } from "next";
import { LegalPage } from "@/components/rateforge/legal-page";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the RateForge team — questions, feedback, bug reports, and report deletion requests. We reply within 2 business days.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · RateForge",
    description:
      "Get in touch with the RateForge team — questions, feedback, bug reports, and report deletion requests.",
    type: "website",
    url: `${SITE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      path="/contact"
      intro="Have a question, found a bug, or want to request deletion of a report? Email us — we read everything."
    >
      <div className="rf-legal-contact">
        <p style={{ color: "var(--muted)", marginBottom: 4 }}>Email us at</p>
        <a className="email" href="mailto:contact@therateforge.com">
          contact@therateforge.com
        </a>
        <p style={{ color: "var(--muted)", marginTop: 16, fontSize: ".88rem" }}>
          For report deletion requests, please include the report ID from your
          shareable link (the part after <code>/r/</code>).
        </p>
      </div>

      <h2>What to email us about</h2>
      <ul>
        <li>
          <strong>Report deletion.</strong> Include the report ID (from{" "}
          <code>/r/{"{id}"}</code>) and we&apos;ll remove it within 5 business
          days.
        </li>
        <li>
          <strong>Bugs &amp; feedback.</strong> Something wrong with a report, a
          broken link, or an idea to improve RateForge? Tell us.
        </li>
        <li>
          <strong>Privacy &amp; data.</strong> Any question about how data is
          handled — see the <a href="/privacy">Privacy Policy</a> first.
        </li>
        <li>
          <strong>Press &amp; partnerships.</strong> We&apos;re part of the{" "}
          <a
            href="https://thedocforge.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            DocForge
          </a>{" "}
          family.
        </li>
      </ul>

      <h2>Response time</h2>
      <p>
        We aim to reply within <strong>2 business days</strong>. Deletion
        requests are processed within 5 business days.
      </p>

      <p className="rf-legal-meta">RateForge · part of the DocForge family</p>
    </LegalPage>
  );
}
