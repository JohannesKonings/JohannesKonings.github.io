import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const WEBSITE_DIR = path.join(ROOT, "websites", "tanstack");
const SITEMAP_PATH = path.join(WEBSITE_DIR, "public", "sitemap-index.xml");
const RSS_PATH = path.join(WEBSITE_DIR, "public", "rss.xml");

function runInWebsite(...args) {
  return execFileSync("pnpm", args, {
    cwd: WEBSITE_DIR,
    encoding: "utf8",
    stdio: "pipe",
  });
}

function getArchiveCountsFromApp() {
  const output = runInWebsite(
    "tsx",
    "-e",
    [
      "import('./src/lib/content-utils.ts').then((m)=>{",
      "console.log(JSON.stringify({",
      "tags:m.getAllTags().length,",
      "categories:m.getAllCategories().length,",
      "series:m.getAllSeries().length",
      "}));",
      "}).catch((error)=>{console.error(error);process.exit(1);})",
    ].join(""),
  ).trim();

  return JSON.parse(output);
}

function getPublishedPostCountFromApp() {
  const output = runInWebsite(
    "tsx",
    "-e",
    [
      "import('content-collections').then((m)=>{",
      "console.log(JSON.stringify({publishedPosts:m.allPosts.filter((post)=>post.published).length}));",
      "}).catch((error)=>{console.error(error);process.exit(1);})",
    ].join(""),
  ).trim();

  return JSON.parse(output).publishedPosts;
}

function countMatches(value, pattern) {
  return (value.match(pattern) || []).length;
}

void test("sitemap generator keeps blog archive coverage aligned with app content", () => {
  runInWebsite("tsx", "../../scripts/generateTanstackSitemap.ts");

  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const archiveCounts = getArchiveCountsFromApp();

  assert.equal(
    countMatches(sitemap, /<loc>https:\/\/johanneskonings\.dev\/blog\/tag\/[^<]+<\/loc>/g),
    archiveCounts.tags,
    "sitemap should include one URL per published blog tag",
  );
  assert.equal(
    countMatches(sitemap, /<loc>https:\/\/johanneskonings\.dev\/blog\/category\/[^<]+<\/loc>/g),
    archiveCounts.categories,
    "sitemap should include one URL per published blog category",
  );
  assert.equal(
    countMatches(sitemap, /<loc>https:\/\/johanneskonings\.dev\/blog\/series\/[^<]+<\/loc>/g),
    archiveCounts.series,
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
  const publishedPosts = getPublishedPostCountFromApp();

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
