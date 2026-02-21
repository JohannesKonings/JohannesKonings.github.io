/**
 * Generates sitemap-index.xml for the TanStack (primary) site at build time.
 * Run after sync so src/content/blog is populated. Writes to websites/tanstack/public/sitemap-index.xml.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BASE_URL = "https://johanneskonings.github.io";
const CONTENT_BLOG = path.join(ROOT, "websites/tanstack/src/content/blog");
const OUT_FILE = path.join(ROOT, "websites/tanstack/public/sitemap-index.xml");

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFrontmatter(content: string): { title?: string; published?: boolean } {
  const match = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) return {};
  const block = match[1];
  const title = block.match(/^title:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const publishedMatch = block.match(/^published:\s*(true|false)/m);
  const published = publishedMatch ? publishedMatch[1] === "true" : true;
  return { title, published };
}

function getPostUrls(): string[] {
  const urls: string[] = [];
  if (!fs.existsSync(CONTENT_BLOG)) return urls;

  const entries = fs.readdirSync(CONTENT_BLOG, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const dirPath = path.join(CONTENT_BLOG, ent.name);
    const files = fs.readdirSync(dirPath);
    const mdFile = files.find((f) => f.endsWith(".md") && (f === "index.md" || f === ent.name + ".md")) ?? files.find((f) => f.endsWith(".md"));
    if (!mdFile) continue;
    const content = fs.readFileSync(path.join(dirPath, mdFile), "utf-8");
    const { title, published } = parseFrontmatter(content);
    if (published === false) continue;
    const slug = ent.name;
    urls.push(`${BASE_URL}/blog/${slug}`);
  }
  return urls;
}

function main() {
  const staticUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/blog`,
  ];
  const postUrls = getPostUrls();
  const allUrls = [...staticUrls, ...postUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n")}
</urlset>
`;

  const dir = path.dirname(OUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT_FILE, sitemap);
  console.log("Generated sitemap-index.xml with", allUrls.length, "URLs");
}

main();
