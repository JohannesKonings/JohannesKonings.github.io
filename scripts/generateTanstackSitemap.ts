/**
 * Generates sitemap-index.xml for the TanStack (primary) site at build time.
 * Run after sync so content-collections has the published blog/note documents available.
 * Writes to websites/tanstack/public/sitemap-index.xml.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { toAbsoluteUrl, toBlogArchivePath } from "../websites/tanstack/src/lib/site";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const WEBSITE_ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, "websites/tanstack/public/sitemap-index.xml");

interface SitemapEntry {
  loc: string;
  lastmod: string;
}

function toLastmod(date: Date) {
  return date.toISOString().split("T")[0];
}

async function loadPublishedContent() {
  const [{ allNotes, allPosts }, contentUtils] = await Promise.all([
    import("content-collections"),
    import(pathToFileURL(path.join(WEBSITE_ROOT, "src/lib/content-utils.ts")).href),
  ]);

  const publishedPosts = allPosts
    .filter((post) => post.published)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const publishedNotes = allNotes
    .filter((note) => note.published)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    publishedPosts,
    publishedNotes,
    getAllCategories: contentUtils.getAllCategories as () => string[],
    getAllSeries: contentUtils.getAllSeries as () => string[],
    getAllTags: contentUtils.getAllTags as () => string[],
  };
}

function toSitemapEntry(loc: string, lastmod: string): SitemapEntry {
  return { loc, lastmod };
}

async function main() {
  const { publishedPosts, publishedNotes, getAllCategories, getAllSeries, getAllTags } =
    await loadPublishedContent();

  const staticEntries = [
    toSitemapEntry(toAbsoluteUrl("/"), toLastmod(new Date())),
    toSitemapEntry(toAbsoluteUrl("/blog"), toLastmod(new Date())),
    toSitemapEntry(toAbsoluteUrl("/notes"), toLastmod(new Date())),
    toSitemapEntry(toAbsoluteUrl("/search"), toLastmod(new Date())),
  ];

  const postEntries = publishedPosts.map((post) =>
    toSitemapEntry(toAbsoluteUrl(post.url), toLastmod(post.date)),
  );
  const noteEntries = publishedNotes.map((note) =>
    toSitemapEntry(toAbsoluteUrl(note.url), toLastmod(note.date)),
  );
  const archiveEntries = [
    ...getAllTags().map((tag) =>
      toSitemapEntry(toAbsoluteUrl(toBlogArchivePath("tag", tag)), toLastmod(new Date())),
    ),
    ...getAllCategories().map((category) =>
      toSitemapEntry(toAbsoluteUrl(toBlogArchivePath("category", category)), toLastmod(new Date())),
    ),
    ...getAllSeries().map((seriesSlug) =>
      toSitemapEntry(toAbsoluteUrl(toBlogArchivePath("series", seriesSlug)), toLastmod(new Date())),
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
