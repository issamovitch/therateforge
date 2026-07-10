import Link from "next/link";
import Image from "next/image";

/**
 * Shared sticky nav — identical on homepage and report page.
 * Styled after thedocforge.com: white background, logo icon image + wordmark,
 * minimal modern look, teal CTA button.
 */
export function Nav() {
  return (
    <header>
      <nav className="rf-nav" aria-label="Primary">
        <div className="rf-wrap rf-nav-in">
          <Link
            className="rf-logo"
            href="/"
            aria-label="RateForge home"
          >
            <Image
              src="/logo.png"
              alt="RateForge"
              width={32}
              height={32}
              className="rf-logo-icon"
              priority
            />
            <span className="rf-logo-text">
              Rate<em>Forge</em>
            </span>
          </Link>
          <div className="rf-nav-links">
            <Link href="/guides">Guides</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/#why">Why rates fail</Link>
            <Link href="/#faq">FAQ</Link>
            <Link className="rf-nav-cta" href="/#calculator">
              Calculate my rate
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
