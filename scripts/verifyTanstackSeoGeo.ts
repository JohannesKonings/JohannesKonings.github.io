#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDeploymentConfig } from "../websites/tanstack/src/lib/deployment";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BUILD_PUBLIC_DIR = path.join(ROOT, "websites/tanstack/.output/public");
const deployment = resolveDeploymentConfig({
  deploymentKind: process.env.DEPLOYMENT_KIND ?? "production",
  nodeEnv: process.env.NODE_ENV ?? "production",
  siteUrl: process.env.SITE_URL,
  branchName: process.env.BRANCH_NAME,
  previewSiteBaseDomain: process.env.PREVIEW_SITE_BASE_DOMAIN,
  productionSiteUrl: process.env.PRODUCTION_SITE_URL,
  localSiteUrl: process.env.LOCAL_SITE_URL,
});
const siteConfig = {
  name: "Johannes Konings",
  baseUrl: deployment.siteUrl,
  rssUrl: `${deployment.siteUrl}/rss.xml`,
  sitemapUrl: `${deployment.siteUrl}/sitemap-index.xml`,
  defaultSocialImage: `${deployment.siteUrl}/social-preview.png`,
  shouldIndex: deployment.shouldIndex,
  robotsMetaContent: deployment.robotsMetaContent,
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
  return path.join(blogDir, entry.name, "index.html");
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

function verifyRootMetaAndScripts(html: string, routeLabel: string) {
  assert(
    getMetaContent(html, { name: "robots" }) === siteConfig.robotsMetaContent,
    `${routeLabel} robots meta matches deployment kind`,
  );

  const includesUmami = html.includes("cloud.umami.is/script.js");
  const includesAds = html.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");

  if (siteConfig.shouldIndex) {
    assert(includesUmami, `${routeLabel} includes Umami in production`);
    assert(includesAds, `${routeLabel} includes Google Ads in production`);
  } else {
    assert(!includesUmami, `${routeLabel} omits Umami outside production`);
    assert(!includesAds, `${routeLabel} omits Google Ads outside production`);
  }
}

function verifyHomePage() {
  console.log("\n🏠 Homepage SEO");
  const html = readFile(resolveRouteHtml("/"));
  verifyRootMetaAndScripts(html, "Homepage");

  assert((getTitle(html) ?? "").includes(siteConfig.name), "Homepage title includes site name");
  assert(Boolean(getMetaContent(html, { name: "description" })), "Homepage has a meta description");
  assert(
    stripTrailingSlash(getLinkHref(html, { rel: "canonical" }) ?? "") === siteConfig.baseUrl,
    "Homepage canonical uses the active site URL",
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
    "Homepage RSS alternate link uses the active site URL",
  );
}

function verifyBlogListing() {
  console.log("\n📰 Blog listing SEO/GEO");
  const html = readFile(resolveRouteHtml("/blog"));
  verifyRootMetaAndScripts(html, "Blog listing");

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
  assert(jsonLd?.url === `${siteConfig.baseUrl}/blog`, "Blog JSON-LD uses the active site URL");
}

function verifyRepresentativePost() {
  console.log("\n📝 Representative blog post SEO/GEO");
  const filePath = findRepresentativePostHtml();
  const html = readFile(filePath);
  verifyRootMetaAndScripts(html, "Representative post");

  const canonical = getLinkHref(html, { rel: "canonical" }) ?? "";

  assert((getTitle(html) ?? "").includes(siteConfig.name), "Post title includes site name");
  assert(Boolean(getMetaContent(html, { name: "description" })), "Post has a meta description");
  assert(Boolean(getMetaContent(html, { name: "keywords" })), "Post has keywords metadata");
  assert(
    canonical.startsWith(`${siteConfig.baseUrl}/blog/`),
    "Post canonical points to the active site blog URL",
  );
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
  const expectedDirective = siteConfig.shouldIndex ? "Allow: /" : "Disallow: /";
  assert(robots.includes(expectedDirective), "robots.txt matches the deployment crawl policy");
  assert(
    robots.includes(`Sitemap: ${siteConfig.sitemapUrl}`),
    "robots.txt points to the active sitemap",
  );

  const rss = readFile(path.join(BUILD_PUBLIC_DIR, "rss.xml"));
  assert(rss.includes(siteConfig.baseUrl), "rss.xml uses the active site URL");

  const sitemap = readFile(path.join(BUILD_PUBLIC_DIR, "sitemap-index.xml"));
  assert(sitemap.includes(siteConfig.baseUrl), "sitemap-index.xml uses the active site URL");

  if (!siteConfig.shouldIndex) {
    assert(
      !rss.includes("https://johanneskonings.dev"),
      "Preview rss.xml does not leak the production URL",
    );
    assert(
      !sitemap.includes("https://johanneskonings.dev"),
      "Preview sitemap-index.xml does not leak the production URL",
    );
  }
}

function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║         TanStack SEO/GEO Build Verification                 ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  assert(fs.existsSync(BUILD_PUBLIC_DIR), "Found TanStack build output directory");

  verifyHomePage();
  verifyBlogListing();
  verifyRepresentativePost();
  verifyLegacyPostSocialPreview();
  verifyCrawlArtifacts();

  console.log("\nAll SEO/GEO checks passed.\n");
}

try {
  main();
} catch (error) {
  failure(error instanceof Error ? error.message : "Unknown verification failure");
  process.exit(1);
}
