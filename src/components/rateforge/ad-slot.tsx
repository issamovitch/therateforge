/**
 * Google AdSense placeholder slot.
 *
 * Renders a clearly-labeled, responsive ad container in the middle of the
 * homepage. When you're ready to monetize, replace the placeholder body with
 * your real AdSense `<ins class="adsbygoogle">` snippet and the AdSense
 * loader script in src/app/layout.tsx.
 *
 * Until then it shows a subtle "Ad" placeholder so the layout is intact and
 * the slot is reserved. Hidden on print and for screen readers (ads aren't
 * content). Only renders in production by default to keep dev clean — flip
 * `showInDev` to preview locally.
 */
export function AdSlot({
  slot = "homepage-middle",
  showInDev = true,
}: {
  slot?: string;
  showInDev?: boolean;
}) {
  // Keep dev/preview clean unless explicitly enabled.
  if (process.env.NODE_ENV === "development" && !showInDev) return null;

  return (
    <section
      className="rf-adslot"
      aria-hidden="true"
      data-ad-slot={slot}
    >
      <div className="rf-adslot-inner">
        <span className="rf-adslot-label">Advertisement</span>
        <span className="rf-adslot-hint">
          A discreet ad keeps these tools free. The tool above is fully usable without clicking anything.
        </span>
      </div>
    </section>
  );
}
