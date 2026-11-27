#!/usr/bin/env tsx
/**
 * Pre-publish SEO check for one blog post, or every post with --all.
 *
 * Google Search Console shows posts that rank for a query but get almost no
 * clicks, because the title and description miss the words people search for.
 * This script reports, per post, the SEO problems that are cheap to fix before
 * publishing: weak titles and descriptions, broken heading structure, missing
 * internal links, and images without alt text.
 *
 * It reads the authoring source in `_posts/<slug>/index.md`. That directory is
 * synced to `websites/tanstack/src/content/blog/<slug>/index.md` for the build,
 * so the markdown the site renders is the markdown checked here.
 *
 * How the post renders (see websites/tanstack/src/routes/blog/$postId.tsx):
 *   - The layout renders the frontmatter `title` as the page's single <h1>.
 *   - The frontmatter `summary` is the meta description and the OpenGraph /
 *     Twitter description.
 * So the body markdown must start its headings at `##`; a body `#` becomes a
 * second <h1> in the rendered page.
 *
 * Usage:
 *   vp exec tsx scripts/checkSeo.ts <slug>
 *   vp exec tsx scripts/checkSeo.ts --all
 *
 * See docs/pre-publish-seo.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "_posts");

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const SUMMARY_MIN = 70;
const SUMMARY_MAX = 160;
const SLUG_PATTERN = /^(\d{4})-(\d{2})-(\d{2}|xx)-[a-z0-9][a-z0-9_-]*$/;

export type SeoSeverity = "error" | "warning";

export type SeoIssue = {
  severity: SeoSeverity;
  message: string;
};

export type SeoReport = {
  issues: SeoIssue[];
};

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

function issue(severity: SeoSeverity, message: string): SeoIssue {
  return { severity, message };
}

function splitFrontmatter(content: string): { frontmatter: string; body: string } | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { frontmatter: match[1] ?? "", body: match[2] ?? "" };
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseScalar(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match?.[1]) return undefined;
  const value = unquote(match[1]);
  return value.length > 0 ? value : undefined;
}

/**
 * Read a frontmatter list, written either as a block list or inline `[a, b]`.
 * Only the optional `keywords` field uses this; it is not part of the content
 * collections schema, so it is a pre-publish hint rather than rendered data.
 */
function parseList(frontmatter: string, key: string): string[] {
  const block = frontmatter.match(new RegExp(`^${key}:\\s*\\n((?:[ \\t]*-[ \\t].*\\n?)*)`, "m"));
  if (block?.[1]) {
    return [...block[1].matchAll(/^[ \t]*-[ \t]+(.*)$/gm)]
      .map((entry) => unquote(entry[1] ?? ""))
      .filter((entry) => entry.length > 0);
  }
  const inline = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, "m"));
  if (inline?.[1]) {
    return inline[1]
      .split(",")
      .map((entry) => unquote(entry))
      .filter((entry) => entry.length > 0);
  }
  const scalar = parseScalar(frontmatter, key);
  if (scalar) {
    return scalar
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  return [];
}

type Heading = {
  level: number;
  text: string;
};

/**
 * Lines of the body with fenced code blocks removed, so a `#` inside a code
 * fence is never mistaken for a heading and a `![...]()` inside one is never
 * mistaken for an image.
 */
function bodyLinesOutsideCode(body: string): string[] {
  const lines = body.split(/\r?\n/);
  const result: string[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1]?.startsWith("~") ? "~~~" : "```";
      if (fence === null) {
        fence = marker;
      } else if (fence === marker) {
        fence = null;
      }
      continue;
    }
    if (fence === null) result.push(line);
  }
  return result;
}

function parseHeadings(bodyLines: string[]): Heading[] {
  const headings: Heading[] = [];
  for (const line of bodyLines) {
    const match = line.match(/^(#{1,6})\s+(.*\S)\s*#*\s*$/);
    if (match?.[1] && match[2]) {
      headings.push({ level: match[1].length, text: match[2].trim() });
    }
  }
  return headings;
}

function firstParagraph(bodyLines: string[]): string {
  const paragraph: string[] = [];
  for (const raw of bodyLines) {
    const line = raw.trim();
    if (line.length === 0) {
      if (paragraph.length > 0) break;
      continue;
    }
    if (/^#{1,6}\s/.test(line)) continue;
    if (line.startsWith("![")) continue;
    if (/^<[a-z]/i.test(line)) continue;
    if (line.startsWith(">")) continue;
    paragraph.push(line);
  }
  return paragraph.join(" ");
}

function hasInternalLink(bodyLines: string[]): boolean {
  const body = bodyLines.join("\n");
  const markdownLinks = [...body.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1] ?? "");
  const htmlLinks = [...body.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map(
    (match) => match[1] ?? "",
  );
  return [...markdownLinks, ...htmlLinks].some((target) => isInternalPostLink(target));
}

function isInternalPostLink(target: string): boolean {
  const trimmed = target.trim();
  if (/^\/(blog|notes)\//.test(trimmed)) return true;
  return /^https?:\/\/(www\.)?johanneskonings\.dev\/(blog|notes)\//.test(trimmed);
}

type MarkdownImage = {
  alt: string;
  src: string;
};

function parseImages(bodyLines: string[]): MarkdownImage[] {
  const body = bodyLines.join("\n");
  return [...body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((match) => ({
    alt: (match[1] ?? "").trim(),
    src: match[2] ?? "",
  }));
}

function checkSlug(slug: string): SeoIssue[] {
  if (SLUG_PATTERN.test(slug)) return [];
  return [
    issue(
      "warning",
      `slug "${slug}" is not <date>-<kebab-slug> with lowercase letters, digits, and hyphens (date prefix YYYY-MM-DD)`,
    ),
  ];
}

function checkTitle(title: string | undefined): SeoIssue[] {
  if (!title) return [issue("error", "frontmatter title is missing")];
  const length = title.length;
  if (length < TITLE_MIN) {
    return [
      issue(
        "warning",
        `title is ${length} chars; aim for ${TITLE_MIN}-${TITLE_MAX} so it fills the search result and carries the keywords readers search for`,
      ),
    ];
  }
  if (length > TITLE_MAX) {
    return [
      issue(
        "warning",
        `title is ${length} chars; Google truncates past ~${TITLE_MAX} (the " | Johannes Konings" suffix is added on top)`,
      ),
    ];
  }
  return [];
}

function checkSummary(summary: string | undefined): SeoIssue[] {
  if (!summary)
    return [issue("error", "frontmatter summary is missing; it is the meta description")];
  const length = summary.length;
  if (length < SUMMARY_MIN) {
    return [
      issue(
        "warning",
        `summary (meta description) is ${length} chars; aim for ${SUMMARY_MIN}-${SUMMARY_MAX} so the snippet is useful`,
      ),
    ];
  }
  if (length > SUMMARY_MAX) {
    return [
      issue(
        "warning",
        `summary (meta description) is ${length} chars; Google truncates past ~${SUMMARY_MAX}`,
      ),
    ];
  }
  return [];
}

function checkHeadings(headings: Heading[]): SeoIssue[] {
  const found: SeoIssue[] = [];
  const h1s = headings.filter((heading) => heading.level === 1);
  for (const heading of h1s) {
    found.push(
      issue(
        "error",
        `body heading "# ${heading.text}" is an <h1>; the title already renders as the page <h1>. Use ## and below`,
      ),
    );
  }

  if (headings.length > 0 && headings.every((heading) => heading.level !== 2)) {
    found.push(
      issue("warning", "no ## (h2) headings; the post has no top-level sections under the title"),
    );
  }

  // The title is the page <h1> (level 1), so the body's heading tree hangs off it.
  let previousLevel = 1;
  for (const heading of headings) {
    if (heading.level > previousLevel + 1) {
      found.push(
        issue(
          "warning",
          `heading "${"#".repeat(heading.level)} ${heading.text}" jumps from h${previousLevel} to h${heading.level}; do not skip heading levels`,
        ),
      );
    }
    previousLevel = heading.level;
  }
  return found;
}

function checkInternalLinks(bodyLines: string[]): SeoIssue[] {
  if (hasInternalLink(bodyLines)) return [];
  return [
    issue(
      "warning",
      "no internal link to another johanneskonings.dev post or note (e.g. /blog/<slug>); internal links help readers and crawlers",
    ),
  ];
}

function checkImages(images: MarkdownImage[]): SeoIssue[] {
  const found: SeoIssue[] = [];
  for (const image of images) {
    if (image.alt.length === 0) {
      found.push(
        issue(
          "warning",
          `image ${image.src} has empty alt text; describe it for SEO and accessibility`,
        ),
      );
    }
  }
  return found;
}

/**
 * Optional primary-keyword check. Runs only when the post declares a
 * `keywords` frontmatter field (block list, inline list, or comma string). The
 * first keyword is the primary one and should appear in the title, the summary,
 * and the first paragraph so the page matches the query it targets.
 */
function checkKeywords(
  frontmatter: string,
  title: string | undefined,
  summary: string | undefined,
  paragraph: string,
): SeoIssue[] {
  const keywords = parseList(frontmatter, "keywords");
  const primary = keywords[0];
  if (!primary) return [];

  const needle = primary.toLowerCase();
  const found: SeoIssue[] = [];
  const contains = (haystack: string | undefined) =>
    (haystack ?? "").toLowerCase().includes(needle);

  if (!contains(title)) {
    found.push(issue("warning", `primary keyword "${primary}" is not in the title`));
  }
  if (!contains(summary)) {
    found.push(
      issue("warning", `primary keyword "${primary}" is not in the summary (meta description)`),
    );
  }
  if (!contains(paragraph)) {
    found.push(issue("warning", `primary keyword "${primary}" is not in the first paragraph`));
  }
  return found;
}

export function inspectPost(postDirectory: string): SeoReport {
  if (!fs.existsSync(postDirectory)) {
    return { issues: [issue("error", `post directory does not exist: ${postDirectory}`)] };
  }
  const indexPath = path.join(postDirectory, "index.md");
  if (!fs.existsSync(indexPath)) {
    return { issues: [issue("error", "index.md is missing")] };
  }

  const parsed = splitFrontmatter(fs.readFileSync(indexPath, "utf8"));
  if (parsed === null) {
    return { issues: [issue("error", "index.md has no frontmatter")] };
  }

  const { frontmatter, body } = parsed;
  const title = parseScalar(frontmatter, "title");
  const summary = parseScalar(frontmatter, "summary");
  const bodyLines = bodyLinesOutsideCode(body);
  const headings = parseHeadings(bodyLines);
  const images = parseImages(bodyLines);
  const paragraph = firstParagraph(bodyLines);

  return {
    issues: [
      ...checkSlug(path.basename(postDirectory)),
      ...checkTitle(title),
      ...checkSummary(summary),
      ...checkHeadings(headings),
      ...checkInternalLinks(bodyLines),
      ...checkImages(images),
      ...checkKeywords(frontmatter, title, summary, paragraph),
    ],
  };
}

function listPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function printReport(slug: string, report: SeoReport): void {
  console.log(`\n${slug}`);
  if (report.issues.length === 0) {
    console.log(`${colors.green}✓ no SEO issues${colors.reset}`);
    return;
  }
  for (const item of report.issues) {
    const color = item.severity === "error" ? colors.red : colors.yellow;
    const mark = item.severity === "error" ? "✗" : "⚠";
    console.log(`${color}${mark}${colors.reset} ${item.message}`);
  }
}

function printUsage(): void {
  console.error("Usage: vp exec tsx scripts/checkSeo.ts <slug> | --all");
}

function main(): number {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const slugs = args.filter((arg) => !arg.startsWith("-"));

  if (all && slugs.length > 0) {
    console.error("Pass either a slug or --all, not both");
    printUsage();
    return 1;
  }

  let targets: string[];
  if (all) {
    targets = listPostSlugs();
    if (targets.length === 0) {
      console.error(`No posts found in ${POSTS_DIR}`);
      return 1;
    }
  } else {
    const slug = slugs[0];
    if (
      !slug ||
      slugs.length > 1 ||
      slug.includes("/") ||
      slug.includes("\\") ||
      slug.includes("..")
    ) {
      printUsage();
      return 1;
    }
    targets = [slug];
  }

  let errorCount = 0;
  let warningCount = 0;
  for (const slug of targets) {
    const report = inspectPost(path.join(POSTS_DIR, slug));
    printReport(slug, report);
    errorCount += report.issues.filter((item) => item.severity === "error").length;
    warningCount += report.issues.filter((item) => item.severity === "warning").length;
  }

  console.log(
    `\n${colors.yellow}${warningCount} warning(s)${colors.reset}, ${
      errorCount > 0 ? colors.red : colors.green
    }${errorCount} error(s)${colors.reset} across ${targets.length} post(s)`,
  );
  return errorCount > 0 ? 1 : 0;
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  process.exit(main());
}
