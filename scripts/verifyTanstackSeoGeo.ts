#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditTanstackBlogContent } from "./tanstackContentAudit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BUILD_PUBLIC_DIR = path.join(ROOT, "websites/tanstack/.output/public");
const siteConfig = {
  name: "Johannes Konings",
  baseUrl: "https://johanneskonings.dev",
  rssUrl: "https://johanneskonings.dev/rss.xml",
  sitemapUrl: "https://johanneskonings.dev/sitemap-index.xml",
  defaultSocialImage: "https://johanneskonings.dev/social-preview.png",
} as const;

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

function success(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function failure(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function stripTrailingSlash(value: string) {
  if (value === siteConfig.baseUrl || value === `${siteConfig.baseUrl}/`) {
    return siteConfig.baseUrl;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }

  success(message);
}

function readFile(filePath: string) {
  assert(fs.existsSync(filePath), `Found ${path.relative(ROOT, filePath)}`);
  return fs.readFileSync(filePath, "utf-8");
}

function resolveRouteHtml(route: string) {
  const normalizedRoute = route === "/" ? "" : route.replace(/^\/+|\/+$/g, "");
  const candidates =
    normalizedRoute.length === 0
      ? [path.join(BUILD_PUBLIC_DIR, "index.html")]
      : [
          path.join(BUILD_PUBLIC_DIR, `${normalizedRoute}.html`),
          path.join(BUILD_PUBLIC_DIR, normalizedRoute, "index.html"),
        ];

  const matched = candidates.find((candidate) => fs.existsSync(candidate));
  assert(Boolean(matched), `Resolved built HTML for route ${route}`);
  return matched!;
}

function findRepresentativePostHtml() {
  const blogDir = path.join(BUILD_PUBLIC_DIR, "blog");
  assert(fs.existsSync(blogDir), "Found built /blog directory");

  const entries = fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter(
      (candidate) =>
        candidate.isDirectory() &&
        !["category", "series", "tag"].includes(candidate.name) &&
        fs.existsSync(path.join(blogDir, candidate.name, "index.html")),
    )
    .sort((a, b) => b.name.localeCompare(a.name));

  assert(entries.length > 0, "Found representative built blog post");

  const preferred = entries.find((entry) => {
    const html = fs.readFileSync(path.join(blogDir, entry.name, "index.html"), "utf-8");
    return Boolean(getMetaContent(html, { property: "og:image" }));
  });

  const entry = preferred ?? entries[0];
  return {
    filePath: path.join(blogDir, entry.name, "index.html"),
    slug: entry.name,
  };
}

function findRepresentativeArchiveHtml(kind: "category" | "series" | "tag") {
  const archiveDir = path.join(BUILD_PUBLIC_DIR, "blog", kind);
  assert(fs.existsSync(archiveDir), `Found built /blog/${kind} directory`);

  const entries = fs
    .readdirSync(archiveDir, { withFileTypes: true })
    .filter(
      (candidate) =>
        candidate.isDirectory() &&
        fs.existsSync(path.join(archiveDir, candidate.name, "index.html")),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  assert(entries.length > 0, `Found representative built blog ${kind} archive`);

  const entry = entries[0];
  return {
    filePath: path.join(archiveDir, entry.name, "index.html"),
    slug: entry.name,
  };
}

function getArchiveCountsFromApp() {
  const audit = auditTanstackBlogContent(path.join(ROOT, "websites/tanstack/src/content/blog"));
  return {
    categories: audit.categoryCount,
    series: audit.seriesCount,
    tags: audit.tagCount,
  };
}

function getTags(html: string, tagName: string) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  return [...html.matchAll(pattern)].map((match) => match[0]);
}

function getAttribute(tag: string, attribute: string) {
  const pattern = new RegExp(`${attribute}=(?:"([^"]*)"|'([^']*)')`, "i");
  const match = tag.match(pattern);
  return match?.[1] ?? match?.[2];
}

function getTitle(html: string) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match?.[1]?.trim();
}

function getMetaContent(html: string, selector: { name?: string; property?: string }) {
  for (const tag of getTags(html, "meta")) {
    const matchesName = selector.name ? getAttribute(tag, "name") === selector.name : true;
    const matchesProperty = selector.property
      ? getAttribute(tag, "property") === selector.property
      : true;

    if (matchesName && matchesProperty) {
      return getAttribute(tag, "content");
    }
  }

  return undefined;
}

function getLinkHref(html: string, selector: { rel: string; type?: string }) {
  for (const tag of getTags(html, "link")) {
    const rel = getAttribute(tag, "rel");
    const type = getAttribute(tag, "type");

    if (rel === selector.rel && (!selector.type || type === selector.type)) {
      return getAttribute(tag, "href");
    }
  }

  return undefined;
}

function getJsonLdObjects(html: string) {
  const pattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const objects: Array<Record<string, unknown>> = [];

  for (const match of html.matchAll(pattern)) {
    const content = match[1]?.trim();
    if (!content) continue;

    const parsed = JSON.parse(content) as Record<string, unknown> | Array<Record<string, unknown>>;
    if (Array.isArray(parsed)) {
      objects.push(...parsed);
    } else {
      objects.push(parsed);
    }
  }

  return objects;
}

function getBuiltAssetPathFromAbsoluteUrl(assetUrl: string) {
  if (!assetUrl.startsWith(siteConfig.baseUrl)) {
    return undefined;
  }

  const pathname = new URL(assetUrl).pathname.replace(/^\/+/, "");
  return path.join(BUILD_PUBLIC_DIR, pathname);
}

function assertBuiltAssetExists(assetUrl: string, label: string) {
  const localAssetPath = getBuiltAssetPathFromAbsoluteUrl(assetUrl);

  if (!localAssetPath) {
    success(`${label} uses an external asset URL`);
    return;
  }

  assert(fs.existsSync(localAssetPath), `${label} asset exists in build output`);
}

function verifyHomePage() {
  console.log("\n🏠 Homepage SEO");
  const html = readFile(resolveRouteHtml("/"));

  assert((getTitle(html) ?? "").includes(siteConfig.name), "Homepage title includes site name");
  assert(Boolean(getMetaContent(html, { name: "description" })), "Homepage has a meta description");
  assert(
    stripTrailingSlash(getLinkHref(html, { rel: "canonical" }) ?? "") === siteConfig.baseUrl,
    "Homepage canonical uses johanneskonings.dev",
  );
  assert(
    getMetaContent(html, { property: "og:image" }) === siteConfig.defaultSocialImage,
    "Homepage uses default Open Graph image",
  );
  assert(
    getMetaContent(html, { name: "twitter:image" }) === siteConfig.defaultSocialImage,
    "Homepage uses default Twitter image",
  );
  assert(
    getMetaContent(html, { name: "twitter:card" }) === "summary_large_image",
    "Homepage uses summary_large_image Twitter card",
  );
  assertBuiltAssetExists(siteConfig.defaultSocialImage, "Homepage social preview");
  assert(
    getLinkHref(html, { rel: "alternate", type: "application/rss+xml" }) === siteConfig.rssUrl,
    "Homepage RSS alternate link uses johanneskonings.dev",
  );
}

function verifyBlogListing() {
  console.log("\n📰 Blog listing SEO/GEO");
  const html = readFile(resolveRouteHtml("/blog"));

  assert((getTitle(html) ?? "").includes("Blog"), "Blog listing has a blog-specific title");
  assert(
    Boolean(getMetaContent(html, { name: "description" })),
    "Blog listing has a meta description",
  );
  assert(
    stripTrailingSlash(getLinkHref(html, { rel: "canonical" }) ?? "") ===
      `${siteConfig.baseUrl}/blog`,
    "Blog listing canonical points to /blog",
  );
  assert(
    getMetaContent(html, { property: "og:image" }) === siteConfig.defaultSocialImage,
    "Blog listing uses default Open Graph image",
  );
  assert(
    getMetaContent(html, { name: "twitter:image" }) === siteConfig.defaultSocialImage,
    "Blog listing uses default Twitter image",
  );
  assert(
    getMetaContent(html, { name: "twitter:card" }) === "summary_large_image",
    "Blog listing uses summary_large_image Twitter card",
  );

  const jsonLd = getJsonLdObjects(html).find((item) => item["@type"] === "Blog");
  assert(Boolean(jsonLd), "Blog listing includes Blog JSON-LD");
  assert(jsonLd?.url === `${siteConfig.baseUrl}/blog`, "Blog JSON-LD uses johanneskonings.dev");
}

function verifyRepresentativePost() {
  console.log("\n📝 Representative blog post SEO/GEO");
  const { filePath, slug } = findRepresentativePostHtml();
  const html = readFile(filePath);

  const canonical = getLinkHref(html, { rel: "canonical" }) ?? "";
  const expectedCanonical = `${siteConfig.baseUrl}/blog/${slug}/`;

  assert((getTitle(html) ?? "").includes(siteConfig.name), "Post title includes site name");
  assert(Boolean(getMetaContent(html, { name: "description" })), "Post has a meta description");
  assert(Boolean(getMetaContent(html, { name: "keywords" })), "Post has keywords metadata");
  assert(canonical === expectedCanonical, "Post canonical uses the final trailing-slash blog URL");
  assert(
    getMetaContent(html, { property: "og:url" }) === canonical,
    "Post Open Graph URL matches canonical URL",
  );
  assert(
    getMetaContent(html, { property: "og:type" }) === "article",
    "Post Open Graph type is article",
  );
  const ogImage = getMetaContent(html, { property: "og:image" });
  const twitterImage = getMetaContent(html, { name: "twitter:image" });
  assert(Boolean(ogImage), "Post has an Open Graph image");
  assert(Boolean(twitterImage), "Post has a Twitter image");
  assert(
    getMetaContent(html, { name: "twitter:card" }) === "summary_large_image",
    "Post uses summary_large_image Twitter card",
  );
  assertBuiltAssetExists(ogImage!, "Representative post social preview");

  const jsonLd = getJsonLdObjects(html).find((item) => item["@type"] === "BlogPosting");
  assert(Boolean(jsonLd), "Post includes BlogPosting JSON-LD");
  assert(jsonLd?.url === canonical, "BlogPosting JSON-LD URL matches canonical URL");
  assert(
    String(jsonLd?.mainEntityOfPage && (jsonLd.mainEntityOfPage as { "@id"?: string })["@id"]) ===
      canonical,
    "BlogPosting mainEntityOfPage matches canonical URL",
  );
}

function verifyRepresentativeArchive(kind: "category" | "series" | "tag") {
  console.log(`\n🗂️ Representative blog ${kind} archive SEO/GEO`);
  const { filePath, slug } = findRepresentativeArchiveHtml(kind);
  const html = readFile(filePath);
  const canonical = getLinkHref(html, { rel: "canonical" }) ?? "";

  assert(
    (getTitle(html) ?? "").includes(siteConfig.name),
    `${kind} archive title includes site name`,
  );
  assert(
    Boolean(getMetaContent(html, { name: "description" })),
    `${kind} archive has a meta description`,
  );
  assert(
    canonical === `${siteConfig.baseUrl}/blog/${kind}/${slug}/`,
    `${kind} archive canonical uses the final trailing-slash blog URL`,
  );
}

function verifyLegacyPostSocialPreview() {
  console.log("\n🧾 Legacy blog post social preview");
  const legacyRoute = "/blog/2020-10-19-example_react_average_of_items_in_different_arrays";
  const html = readFile(resolveRouteHtml(legacyRoute));
  const legacyOgImage = getMetaContent(html, { property: "og:image" });
  const legacyTwitterImage = getMetaContent(html, { name: "twitter:image" });

  assert(Boolean(legacyOgImage), "Legacy post has an Open Graph image");
  assert(Boolean(legacyTwitterImage), "Legacy post has a Twitter image");
  assert(
    legacyOgImage !== `${siteConfig.baseUrl}/img/react.png`,
    "Legacy post no longer points to missing generic thumbnail image",
  );
  assertBuiltAssetExists(legacyOgImage!, "Legacy post social preview");
}

function verifyCrawlArtifacts() {
  console.log("\n🕷️ Crawl artifacts");

  const robots = readFile(path.join(BUILD_PUBLIC_DIR, "robots.txt"));
  assert(
    robots.includes(`Sitemap: ${siteConfig.sitemapUrl}`),
    "robots.txt points to johanneskonings.dev sitemap",
  );

  const rss = readFile(path.join(BUILD_PUBLIC_DIR, "rss.xml"));
  assert(!rss.includes("johanneskonings.github.io"), "rss.xml no longer references github.io");

  const sitemap = readFile(path.join(BUILD_PUBLIC_DIR, "sitemap-index.xml"));
  const archiveCounts = getArchiveCountsFromApp();
  const sitemapTagUrls = [
    ...sitemap.matchAll(/<loc>https:\/\/johanneskonings\.dev\/blog\/tag\/([^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  const sitemapCategoryUrls = [
    ...sitemap.matchAll(/<loc>https:\/\/johanneskonings\.dev\/blog\/category\/([^<]+)<\/loc>/g),
  ].map((match) => match[1]);
  const sitemapSeriesUrls = [
    ...sitemap.matchAll(/<loc>https:\/\/johanneskonings\.dev\/blog\/series\/([^<]+)<\/loc>/g),
  ].map((match) => match[1]);

  assert(
    !sitemap.includes("johanneskonings.github.io"),
    "sitemap-index.xml no longer references github.io",
  );
  assert(
    sitemap.includes(`${siteConfig.baseUrl}/blog/tag/`),
    "sitemap-index.xml includes blog tag archives",
  );
  assert(
    sitemap.includes(`${siteConfig.baseUrl}/blog/category/`),
    "sitemap-index.xml includes blog category archives",
  );
  assert(
    sitemap.includes(`${siteConfig.baseUrl}/blog/series/`),
    "sitemap-index.xml includes blog series archives",
  );
  assert(
    sitemapTagUrls.length === archiveCounts.tags,
    "sitemap-index.xml includes every published blog tag archive",
  );
  assert(
    sitemapCategoryUrls.length === archiveCounts.categories,
    "sitemap-index.xml includes every published blog category archive",
  );
  assert(
    sitemapSeriesUrls.length === archiveCounts.series,
    "sitemap-index.xml includes every published blog series archive",
  );
  assert(
    !sitemapTagUrls.some((slug) => slug.startsWith("-%20")),
    "sitemap-index.xml does not include malformed tag URLs",
  );
  assert(
    !new RegExp(`<loc>${siteConfig.baseUrl}/blog/(?!tag/|category/|series/)[^<]+(?<!/)</loc>`).test(
      sitemap,
    ),
    "sitemap-index.xml uses trailing-slash blog post URLs",
  );
}

function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║         TanStack SEO/GEO Build Verification                 ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  assert(fs.existsSync(BUILD_PUBLIC_DIR), "Found TanStack build output directory");

  verifyHomePage();
  verifyBlogListing();
  verifyRepresentativePost();
  verifyRepresentativeArchive("tag");
  verifyRepresentativeArchive("category");
  verifyRepresentativeArchive("series");
  verifyLegacyPostSocialPreview();
  verifyRepresentativeArchive("tag");
  verifyRepresentativeArchive("category");
  verifyRepresentativeArchive("series");
  verifyCrawlArtifacts();

  console.log("\nAll SEO/GEO checks passed.\n");
}

try {
  main();
} catch (error) {
  failure(error instanceof Error ? error.message : "Unknown verification failure");
  process.exit(1);
}
