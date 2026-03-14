import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { auditTanstackBlogContent } from "./tanstackContentAudit.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const WEBSITE_DIR = path.join(ROOT, "websites", "tanstack");
const CONTENT_BLOG_DIR = path.join(WEBSITE_DIR, "src", "content", "blog");
const SITEMAP_PATH = path.join(WEBSITE_DIR, "public", "sitemap-index.xml");
const RSS_PATH = path.join(WEBSITE_DIR, "public", "rss.xml");

function runInWebsite(...args) {
  return execFileSync("pnpm", args, {
    cwd: WEBSITE_DIR,
    encoding: "utf8",
    stdio: "pipe",
  });
}

function countMatches(value, pattern) {
  return (value.match(pattern) || []).length;
}

void test("sitemap generator keeps blog archive coverage aligned with app content", () => {
  runInWebsite("tsx", "../../scripts/generateTanstackSitemap.ts");

  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const archiveCounts = auditTanstackBlogContent(CONTENT_BLOG_DIR);

  assert.equal(
    countMatches(sitemap, /<loc>https:\/\/johanneskonings\.dev\/blog\/tag\/[^<]+<\/loc>/g),
    archiveCounts.tagCount,
    "sitemap should include one URL per published blog tag",
  );
  assert.equal(
    countMatches(sitemap, /<loc>https:\/\/johanneskonings\.dev\/blog\/category\/[^<]+<\/loc>/g),
    archiveCounts.categoryCount,
    "sitemap should include one URL per published blog category",
  );
  assert.equal(
    countMatches(sitemap, /<loc>https:\/\/johanneskonings\.dev\/blog\/series\/[^<]+<\/loc>/g),
    archiveCounts.seriesCount,
    "sitemap should include one URL per published blog series",
  );
  assert.doesNotMatch(
    sitemap,
    /\/blog\/tag\/-%20/,
    "sitemap should not emit malformed tag URLs derived from YAML list markers",
  );
});

void test("rss generator includes every published blog post including flat markdown posts", () => {
  runInWebsite("tsx", "../../scripts/generateTanstackRss.ts");

  const rss = fs.readFileSync(RSS_PATH, "utf8");
  const publishedPosts = auditTanstackBlogContent(CONTENT_BLOG_DIR).publishedPostCount;

  assert.equal(
    countMatches(rss, /<item>/g),
    publishedPosts,
    "rss should include every published post",
  );
  assert.match(
    rss,
    /https:\/\/johanneskonings\.dev\/blog\/2021-10-26-aws_example_ddb_analytics_cdk\/?/,
    "rss should include published flat-file legacy blog posts",
  );
});
