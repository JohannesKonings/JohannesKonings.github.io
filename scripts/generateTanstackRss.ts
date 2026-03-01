/**
 * Generates rss.xml for the TanStack (primary) site at build time.
 * Run after sync so src/content/blog is populated.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_RSS_PATH,
  SITE_URL,
  toAbsoluteUrl,
} from "../websites/tanstack/lib/site";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT_BLOG = path.join(ROOT, "websites/tanstack/src/content/blog");
const OUT_FILE = path.join(ROOT, "websites/tanstack/public/rss.xml");

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseFrontmatter(content: string): {
  title?: string;
  summary?: string;
  date?: Date;
  published?: boolean;
} {
  const match = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) return {};
  const block = match[1];
  const title = block.match(/^title:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const summary = block.match(/^summary:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const dateMatch = block.match(/^date:\s*(\S+)/m);
  const date = dateMatch ? new Date(dateMatch[1]) : undefined;
  const publishedMatch = block.match(/^published:\s*(true|false)/m);
  const published = publishedMatch ? publishedMatch[1] === "true" : true;
  return { title, summary, date, published };
}

interface RssItem {
  title: string;
  summary: string;
  date: Date;
  slug: string;
}

function getPostItems(): RssItem[] {
  const items: RssItem[] = [];
  if (!fs.existsSync(CONTENT_BLOG)) return items;

  const entries = fs.readdirSync(CONTENT_BLOG, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const dirPath = path.join(CONTENT_BLOG, ent.name);
    const files = fs.readdirSync(dirPath);
    const mdFile =
      files.find(
        (f) =>
          f.endsWith(".md") && (f === "index.md" || f === ent.name + ".md"),
      ) ?? files.find((f) => f.endsWith(".md"));
    if (!mdFile) continue;
    const content = fs.readFileSync(path.join(dirPath, mdFile), "utf-8");
    const { title, summary, date, published } = parseFrontmatter(content);
    if (published === false || !title) continue;
    const slug = ent.name;
    items.push({
      title,
      summary: summary || "",
      date: date || new Date(),
      slug,
    });
  }
  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items;
}

function main() {
  const items = getPostItems();
  const lastBuildDate = new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${toAbsoluteUrl(SITE_RSS_PATH)}" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${toAbsoluteUrl(`/blog/${item.slug}`)}</link>
      <description>${escapeXml(item.summary)}</description>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <guid isPermaLink="true">${toAbsoluteUrl(`/blog/${item.slug}`)}</guid>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;

  const dir = path.dirname(OUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT_FILE, rss);
  console.log("Generated rss.xml with", items.length, "items");
}

main();
