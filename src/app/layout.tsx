import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "./rateforge.css";
import { Toaster } from "@/components/ui/toaster";
import { SITE_URL } from "@/lib/site";
import NextTopLoader from "nextjs-toploader";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

/**
 * Site-wide metadata. Per-page metadata (via `export const metadata` in each
 * page) overrides the title/description using the `%s` template below.
 *
 * metadataBase makes all relative OG/Twitter image URLs absolute (required for
 * social previews to render). The domain comes from SITE_URL
 * (NEXT_PUBLIC_SITE_URL), defaulting to the production domain.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RateForge — Freelance Rate Calculator with Client-Ready Reports",
    template: "%s · RateForge",
  },
  description:
    "Calculate your freelance rate from real market data, taxes and overhead. Get an itemized, client-ready project quote and a shareable report that justifies your price to clients. Free, AI-powered, no signup.",
  applicationName: "RateForge",
  keywords: [
    "freelance rate calculator",
    "freelance pricing",
    "freelance rate",
    "hourly rate calculator",
    "freelance quote",
    "rate report",
    "client quote",
    "freelance invoice",
    "freelancer taxes",
    "freelance overhead",
    "pricing strategy",
    "RateForge",
  ],
  authors: [{ name: "RateForge", url: SITE_URL }],
  creator: "RateForge",
  publisher: "RateForge",
  category: "Business",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "RateForge",
    title: "RateForge — Freelance Rate Calculator with Client-Ready Reports",
    description:
      "Know what your work is worth. Prove it to your client. RateForge calculates your freelance rate from real market data, your taxes and overhead — then builds an itemized, client-ready report.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RateForge — freelance rate calculator with client-ready reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@RateForge",
    title: "RateForge — Freelance Rate Calculator",
    description:
      "Know what your work is worth. Prove it to your client with an itemized, market-backed report. Free · AI-powered · No signup.",
    images: ["/og-image.png"],
  },
  other: {
    "theme-color": "#0c6b52",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c6b52",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/** JSON-LD structured data for the app (helps Google rich results). */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "RateForge",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Freelance Pricing Calculator",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Freelance rate calculator with client-ready, market-backed rate reports.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free, AI-powered, no signup.",
  },
  publisher: {
    "@type": "Organization",
    name: "RateForge",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 500,
      height: 500,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <NextTopLoader
          color="#0c6b52"
          showSpinner={false}
          height={3}
          crawl={true}
          crawlSpeed={200}
          initialPosition={0.08}
          easing="ease"
          speed={300}
          shadow="0 0 10px #0c6b52,0 0 5px #0c6b52"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
