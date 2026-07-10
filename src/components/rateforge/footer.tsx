import Link from "next/link";

/**
 * Shared footer — identical on homepage and report page.
 */
export function Footer() {
  return (
    <footer className="rf-footer">
      <div className="rf-wrap rf-foot">
        <p>© 2026 RateForge — part of the DocForge family</p>
        <div className="links">
          <a
            href="https://thedocforge.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            DocForge
          </a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
