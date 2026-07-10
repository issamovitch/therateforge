import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/rateforge/nav";
import { Footer } from "@/components/rateforge/footer";
import { BackToTop } from "@/components/rateforge/back-to-top";
import { getAllGuides, getGuide, getGuideSlugs } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";

export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-render every guide at build time. */
export async function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

/** Per-guide SEO metadata. */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };
  const url = `${SITE_URL}/guides/${slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: `${guide.title} — RateForge`,
      description: guide.description,
      type: "article",
      url,
      publishedTime: guide.updated,
      authors: ["RateForge"],
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} — RateForge`,
      description: guide.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function GuideArticlePage(props: PageProps) {
  const { slug } = await props.params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  // Pick 3 related guides (same category first, then fill from others).
  const all = getAllGuides().filter((g) => g.slug !== slug);
  const sameCat = all.filter((g) => g.category === guide.category);
  const others = all.filter((g) => g.category !== guide.category);
  const related = [...sameCat, ...others].slice(0, 3);

  // Article JSON-LD.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    author: { "@type": "Organization", name: "RateForge", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "RateForge",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 500, height: 500 },
    },
    mainEntityOfPage: `${SITE_URL}/guides/${slug}`,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE_URL}/guides/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Nav />
      <main>
        <article className="rf-guide-article">
          <div className="rf-guide-breadcrumb">
            <Link href="/">Home</Link> › <Link href="/guides">Guides</Link> › {guide.title}
          </div>
          <p className="rf-kicker" style={{ marginBottom: 6 }}>{guide.category}</p>
          <h1>{guide.title}</h1>
          <div className="rf-guide-meta">
            By RateForge · {guide.readTime} · Updated {guide.updated}
          </div>
          <div className="rf-guide-prose">
            <MDXRemote source={guide.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>

          {/* CTA */}
          <div className="rf-guide-cta">
            <h2>Stop guessing — calculate your exact rate</h2>
            <p>Free, AI-powered, no signup. Get a market-backed rate and a client-ready report in ~15 seconds.</p>
            <Link href="/#calculator">Calculate my rate →</Link>
          </div>

          {/* Related guides */}
          {related.length > 0 && (
            <div className="rf-guide-related">
              <h2>Related guides</h2>
              <ul>
                {related.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
