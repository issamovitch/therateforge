import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes RateForge installable (PWA) and gives it a proper
 * icon / theme color on mobile home screens.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RateForge — Freelance Rate Calculator",
    short_name: "RateForge",
    description:
      "Calculate your freelance rate from real market data, taxes and overhead. Get a client-ready, itemized rate report.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eef1ef",
    theme_color: "#0c6b52",
    categories: ["business", "productivity", "finance"],
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      {
        name: "Calculate my rate",
        short_name: "Calculate",
        url: "/#calculator",
      },
    ],
  };
}
