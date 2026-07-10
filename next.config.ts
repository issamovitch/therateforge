import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // Allow .mdx / .mdx.ts pages to be routed by the App Router.
  pageExtensions: ["ts", "tsx", "mdx"],
  // Don't swallow type errors at build time — fail the build instead so
  // broken code never reaches production.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Serve modern image formats where the browser supports them.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Security + performance headers applied to every response.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Report pages: allow framing so they can be embedded if needed, but
      // keep the noindex. Everything else stays SAMEORIGIN.
      {
        source: "/r/:id*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

// Wrap the Next config with MDX support. createMDX takes an options object
// (here empty — we use the default MDX handling) and returns a function that
// receives the NextConfig. This is the @next/mdx wrapper pattern.
export default createMDX({})(nextConfig);
