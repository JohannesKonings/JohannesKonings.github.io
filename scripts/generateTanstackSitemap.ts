/**
 * Generates sitemap-index.xml for the TanStack (primary) site at build time.
 * Run after sync so the synced markdown content exists under websites/tanstack/src/content.
 * Writes to websites/tanstack/public/sitemap-index.xml.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toAbsoluteUrl, toBlogArchivePath } from "../websites/tanstack/src/lib/site";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT_BLOG = path.join(ROOT, "websites/tanstack/src/content/blog");
const CONTENT_NOTES = path.join(ROOT, "websites/tanstack/src/content/notes");
const OUT_FILE = path.join(ROOT, "websites/tanstack/public/sitemap-index.xml");

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

interface ParsedFrontmatter {
  categories: string[];
  date?: Date;
  published: boolean;
  series?: string;
  tags: string[];
}

interface ParsedContentEntry {
  categories: string[];
  date: Date;
  path: string;
  series?: string;
  tags: string[];
}

function toLastmod(date: Date) {
  return date.toISOString().split("T")[0];
}

function getFrontmatterBlock(content: string) {
  return content.match(/^---\s*([\s\S]*?)\s*---/)?.[1] ?? "";
}

function parseScalarField(block: string, field: string) {
  for (const line of block.split("\n")) {
    const trimmedLine = line.trim();
    if (!trimmedLine.startsWith(`${field}:`)) {
      continue;
    }

    const value = trimmedLine.slice(field.length + 1).trim();
    if (!value.length) {
      return undefined;
    }

    return value.replace(/^['"]|['"]$/g, "");
  }

  return undefined;
}

function parseListField(block: string, field: string): string[] {
  const inlineMatch = block.match(new RegExp(`^${field}:\\s*\\[(.*)\\]\\s*$`, "m"))?.[1];
  if (inlineMatch !== undefined) {
    return inlineMatch
      .split(",")
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }

  const scalarValue = parseScalarField(block, field);
  if (scalarValue && !scalarValue.startsWith("[")) {
    return [scalarValue];
  }

  const listMatch = block.match(new RegExp(`^${field}:\\s*$\\n((?:\\s+-\\s*.+\\n?)*)`, "m"))?.[1];
  if (!listMatch) {
    return [];
  }

  return listMatch
    .split("\n")
    .map((line) => line.match(/^\s*-\s*(.+)$/)?.[1]?.trim())
    .filter((value): value is string => Boolean(value))
    .map((value) => value.replace(/^['"]|['"]$/g, ""));
}

function parseFrontmatter(content: string): ParsedFrontmatter {
  const block = getFrontmatterBlock(content);
  const published = block.match(/^published:\s*(true|false)\s*$/m)?.[1] === "true";
  const rawDate = parseScalarField(block, "date");
  const date = rawDate ? new Date(rawDate) : undefined;

  return {
    categories: parseListField(block, "categories"),
    date: date && !Number.isNaN(date.getTime()) ? date : undefined,
    published,
    series: parseScalarField(block, "series"),
    tags: parseListField(block, "tags"),
  };
}

function collectPublishedContent(
  directory: string,
  createPath: (slug: string) => string,
  options?: { directoriesOnly?: boolean },
) {
  const entries: ParsedContentEntry[] = [];
  if (!fs.existsSync(directory)) {
    return entries;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (options?.directoriesOnly && !entry.isDirectory()) {
      continue;
    }

    if (entry.isFile() && !entry.name.endsWith(".md")) {
      continue;
    }

    if (!entry.isDirectory() && !entry.isFile()) {
      continue;
    }

    const slug = entry.isDirectory() ? entry.name : entry.name.replace(/\.md$/i, "");
    const sourcePath = entry.isDirectory()
      ? path.join(directory, entry.name, "index.md")
      : path.join(directory, entry.name);

    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    const content = fs.readFileSync(sourcePath, "utf-8");
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter.published) {
      continue;
    }

    entries.push({
      categories: frontmatter.categories,
      date: frontmatter.date ?? fs.statSync(sourcePath).mtime,
      path: createPath(slug),
      series: frontmatter.series,
      tags: frontmatter.tags,
    });
  }

  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function toSitemapEntry(loc: string, lastmod: string): SitemapEntry {
  return { loc, lastmod };
}

async function main() {
  const publishedPosts = collectPublishedContent(CONTENT_BLOG, (slug) => `/blog/${slug}/`);
  const publishedNotes = collectPublishedContent(CONTENT_NOTES, (slug) => `/notes/${slug}`);
  const tags = new Set<string>();
  const categories = new Set<string>();
  const series = new Set<string>();

  for (const post of publishedPosts) {
    post.tags.forEach((tag) => tags.add(tag));
    post.categories.forEach((category) => categories.add(category));
    if (post.series) {
      series.add(post.series);
    }
  }

  const staticEntries = [
    toSitemapEntry(toAbsoluteUrl("/"), toLastmod(new Date())),
    toSitemapEntry(toAbsoluteUrl("/blog"), toLastmod(new Date())),
    toSitemapEntry(toAbsoluteUrl("/notes"), toLastmod(new Date())),
    toSitemapEntry(toAbsoluteUrl("/search"), toLastmod(new Date())),
  ];

  const postEntries = publishedPosts.map((post) =>
    toSitemapEntry(toAbsoluteUrl(post.path), toLastmod(post.date)),
  );
  const noteEntries = publishedNotes.map((note) =>
    toSitemapEntry(toAbsoluteUrl(note.path), toLastmod(note.date)),
  );
  const archiveEntries = [
    ...Array.from(tags)
      .sort()
      .map((tag) =>
        toSitemapEntry(toAbsoluteUrl(toBlogArchivePath("tag", tag)), toLastmod(new Date())),
      ),
    ...Array.from(categories)
      .sort()
      .map((category) =>
        toSitemapEntry(
          toAbsoluteUrl(toBlogArchivePath("category", category)),
          toLastmod(new Date()),
        ),
      ),
    ...Array.from(series)
      .sort()
      .map((seriesSlug) =>
        toSitemapEntry(
          toAbsoluteUrl(toBlogArchivePath("series", seriesSlug)),
          toLastmod(new Date()),
        ),
      ),
  ];

  const allEntries = Array.from(
    new Map(
      [...staticEntries, ...postEntries, ...archiveEntries, ...noteEntries].map((entry) => [
        entry.loc,
        entry,
      ]),
    ).values(),
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  const dir = path.dirname(OUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OUT_FILE, sitemap);
  console.log("Generated sitemap-index.xml with", allEntries.length, "URLs");
  console.log("  - Static pages:", staticEntries.length);
  console.log("  - Blog posts:", postEntries.length);
  console.log("  - Blog archives:", archiveEntries.length);
  console.log("  - Notes:", noteEntries.length);
}

await main();
