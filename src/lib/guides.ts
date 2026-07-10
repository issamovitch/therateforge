import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  category: "Pricing basics" | "By skill" | "By country" | "Negotiation" | "Business";
  readTime: string; // e.g. "7 min read"
  updated: string; // ISO date
  format: string; // the assigned format
  intent: string; // target search intent
}

export interface Guide extends GuideMeta {
  content: string; // raw MDX body (without frontmatter)
}

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

/** List all guide slugs (filenames without .mdx). */
export function getGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs
    .readdirSync(GUIDES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/** Read a single guide by slug (frontmatter + body). */
export function getGuide(slug: string): Guide | null {
  const fullPath = path.join(GUIDES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    category: data.category ?? "Business",
    readTime: data.readTime ?? "5 min read",
    updated: data.updated ?? "2026-07-01",
    format: data.format ?? "",
    intent: data.intent ?? "",
    content,
  };
}

/** Read all guides' metadata (no body) — for the index page + sitemap. */
export function getAllGuides(): GuideMeta[] {
  return getGuideSlugs()
    .map((slug) => {
      const g = getGuide(slug);
      if (!g) return null;
      const { content: _content, ...meta } = g;
      void _content;
      return meta;
    })
    .filter((g): g is GuideMeta => g !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Group guides by category for the index page. */
export function getGuidesByCategory(): Record<string, GuideMeta[]> {
  const all = getAllGuides();
  const grouped: Record<string, GuideMeta[]> = {};
  for (const g of all) {
    if (!grouped[g.category]) grouped[g.category] = [];
    grouped[g.category].push(g);
  }
  return grouped;
}

export const GUIDE_CATEGORIES = [
  "Pricing basics",
  "By skill",
  "By country",
  "Negotiation",
  "Business",
] as const;
