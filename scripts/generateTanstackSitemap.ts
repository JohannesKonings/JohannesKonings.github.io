/**
 * Generates sitemap-index.xml for the TanStack (primary) site at build time.
 * Run after sync so src/content/blog is populated. Writes to websites/tanstack/public/sitemap-index.xml.
 * Handles both directory-based posts and flat .md files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// Use environment variable or default to production domain
const BASE_URL = process.env.SITE_URL || "https://johanneskonings.dev";

const CONTENT_BLOG = path.join(ROOT, "websites/tanstack/src/content/blog");
const CONTENT_NOTES = path.join(ROOT, "websites/tanstack/src/content/notes");
const OUT_FILE = path.join(ROOT, "websites/tanstack/public/sitemap-index.xml");

function parseFrontmatter(content: string): { title?: string; published?: boolean } {
  const match = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) return {};
  const block = match[1];
  const title = block.match(/^title:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const publishedMatch = block.match(/^published:\s*(true|false)/m);
  const published = publishedMatch ? publishedMatch[1] === "true" : true;
  return { title, published };
}

/**
 * Get URLs for blog posts from both directory-based and flat .md structures
 */
function getPostUrls(): string[] {
  const urls: string[] = [];
  if (!fs.existsSync(CONTENT_BLOG)) return urls;

  const entries = fs.readdirSync(CONTENT_BLOG, { withFileTypes: true });

  for (const ent of entries) {
    if (ent.isDirectory()) {
      // Directory-based post (e.g., 2026-02-02-tanstack-ai-bedrock-simple/index.md)
      const dirPath = path.join(CONTENT_BLOG, ent.name);
      const files = fs.readdirSync(dirPath);
      const mdFile = files.find((f) => f.endsWith(".md") && (f === "index.md" || f === ent.name + ".md")) ?? files.find((f) => f.endsWith(".md"));
      if (!mdFile) continue;

      const content = fs.readFileSync(path.join(dirPath, mdFile), "utf-8");
      const { published } = parseFrontmatter(content);
      if (published === false) continue;

      const slug = ent.name;
      urls.push(`${BASE_URL}/blog/${slug}`);
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      // Flat .md file (e.g., 2022-09-17-aws_example_ddb_analytics_quicksight_cdk.md)
      // Skip if it's in a directory (handled above)
      const content = fs.readFileSync(path.join(CONTENT_BLOG, ent.name), "utf-8");
      const { published } = parseFrontmatter(content);
      if (published === false) continue;

      // Slug is the filename without .md extension
      const slug = ent.name.replace(/\.md$/i, "");
      urls.push(`${BASE_URL}/blog/${slug}`);
    }
  }

  return urls;
}

/**
 * Get URLs for notes (flat .md files only)
 */
function getNoteUrls(): string[] {
  const urls: string[] = [];
  if (!fs.existsSync(CONTENT_NOTES)) return urls;

  const files = fs.readdirSync(CONTENT_NOTES, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith(".md")) continue;

    const content = fs.readFileSync(path.join(CONTENT_NOTES, file.name), "utf-8");
    const { published } = parseFrontmatter(content);
    if (published === false) continue;

    // Slug is the filename without .md extension
    const slug = file.name.replace(/\.md$/i, "");
    urls.push(`${BASE_URL}/notes/${slug}`);
  }

  return urls;
}

function main() {
  // Static URLs
  const staticUrls = [
    `${BASE_URL}/`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/notes`,
    `${BASE_URL}/search`,
  ];

  // Content URLs
  const postUrls = getPostUrls();
  const noteUrls = getNoteUrls();

  const allUrls = [...staticUrls, ...postUrls, ...noteUrls];

  // Generate sitemap XML with lastmod support
  const today = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join("\n")}
</urlset>
`;

  const dir = path.dirname(OUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT_FILE, sitemap);
  console.log("Generated sitemap-index.xml with", allUrls.length, "URLs");
  console.log("  - Static pages:", staticUrls.length);
  console.log("  - Blog posts:", postUrls.length);
  console.log("  - Notes:", noteUrls.length);
}

main();
