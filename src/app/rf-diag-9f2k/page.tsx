import type { Metadata } from "next";
import { DiagPanel } from "@/components/rateforge/diag-panel";

// Secret backdoor — not linked anywhere. robots: noindex so it stays unlisted.
export const metadata: Metadata = {
  title: "RateForge · diagnostics",
  robots: { index: false, follow: false },
};

export default function DiagPage() {
  return <DiagPanel />;
}
