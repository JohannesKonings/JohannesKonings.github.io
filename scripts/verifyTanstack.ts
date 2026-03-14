#!/usr/bin/env tsx
/**
 * Verification script for TanStack website content
 * Checks for:
 * - Required frontmatter in posts and notes
 * - Valid slug generation (no special chars, consistent format)
 * - No duplicate slugs between posts and notes
 * - Build output validation (sitemap exists, has entries)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const CONTENT_BLOG = path.join(ROOT, "_posts");
const CONTENT_NOTES = path.join(ROOT, "_notes");
const SITEMAP_FILE = path.join(ROOT, "public/sitemap-index.xml");

// ANSI color codes for output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

function success(msg: string) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function error(msg: string) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
}

function warn(msg: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

interface ContentItem {
  type: "post" | "note";
  slug: string;
  filePath: string;
  title?: string;
  published: boolean;
  coverImage?: string;
  hasErrors: boolean;
  errors: string[];
}

function parseFrontmatter(content: string): {
  title?: string;
  published?: boolean;
  date?: string;
  summary?: string;
  coverImage?: string;
} {
  const match = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) return {};
  const block = match[1];

  const title = block.match(/^title:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const publishedMatch = block.match(/^published:\s*(true|false)/m);
  const published = publishedMatch ? publishedMatch[1] === "true" : undefined;
  const date = block.match(/^date:\s*([^\n]+)/m)?.[1]?.trim();
  const summaryMatch = block.match(/^summary:\s*["']?([^"'\n]+)["']?/m);
  const summary = summaryMatch ? summaryMatch[1].trim() : undefined;
  const coverImage = block.match(/^cover_image:\s*([^\n]+)/m)?.[1]?.trim();

  return { title, published, date, summary, coverImage };
}

function isValidSlug(slug: string): boolean {
  // Slug should be URL-friendly: lowercase, alphanumeric, hyphens, underscores
  // No spaces, no special chars other than - and _
  return /^[a-z0-9_-]+$/.test(slug);
}

function collectPosts(): ContentItem[] {
  const items: ContentItem[] = [];
  if (!fs.existsSync(CONTENT_BLOG)) return items;

  const entries = fs.readdirSync(CONTENT_BLOG, { withFileTypes: true });

  for (const ent of entries) {
    if (ent.isDirectory()) {
      // Directory-based post
      const dirPath = path.join(CONTENT_BLOG, ent.name);
      const files = fs.readdirSync(dirPath);
      if (!files.includes("index.md")) {
        items.push({
          type: "post",
          slug: ent.name,
          filePath: dirPath,
          published: false,
          hasErrors: true,
          errors: ['Missing required "index.md" bundle entrypoint'],
        });
        continue;
      }

      const filePath = path.join(dirPath, "index.md");
      const content = fs.readFileSync(filePath, "utf-8");
      const { title, published, coverImage } = parseFrontmatter(content);

      const errors: string[] = [];
      if (!title) errors.push("Missing title in frontmatter");
      if (!coverImage) {
        errors.push("Missing cover_image in frontmatter");
      } else {
        if (!coverImage.startsWith("./")) {
          errors.push('cover_image must be a local relative asset path starting with "./"');
        }

        const resolvedCoverPath = path.join(dirPath, coverImage.replace(/^\.\//, ""));
        if (!fs.existsSync(resolvedCoverPath)) {
          errors.push(`cover_image file does not exist: ${coverImage}`);
        }
      }

      items.push({
        type: "post",
        slug: ent.name,
        filePath,
        title,
        published: published !== false,
        coverImage,
        hasErrors: errors.length > 0,
        errors,
      });
    } else if (ent.isFile() && ent.name.endsWith(".md")) {
      const slug = ent.name.replace(/\.md$/i, "");
      items.push({
        type: "post",
        slug,
        filePath: path.join(CONTENT_BLOG, ent.name),
        published: false,
        hasErrors: true,
        errors: ['Flat blog markdown files are not allowed; use "<slug>/index.md" bundles'],
      });
    }
  }

  return items;
}

function collectNotes(): ContentItem[] {
  const items: ContentItem[] = [];
  if (!fs.existsSync(CONTENT_NOTES)) return items;

  const files = fs.readdirSync(CONTENT_NOTES, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith(".md")) continue;

    const filePath = path.join(CONTENT_NOTES, file.name);
    const content = fs.readFileSync(filePath, "utf-8");
    const { title, published } = parseFrontmatter(content);

    const errors: string[] = [];
    if (!title) errors.push("Missing title in frontmatter");

    const slug = file.name.replace(/\.md$/i, "");
    items.push({
      type: "note",
      slug,
      filePath,
      title,
      published: published !== false,
      hasErrors: errors.length > 0,
      errors,
    });
  }

  return items;
}

function verifyContent(items: ContentItem[]): boolean {
  let hasIssues = false;

  console.log("\n📄 Content Verification\n");

  for (const item of items) {
    if (item.hasErrors) {
      hasIssues = true;
      error(`${item.type} "${item.slug}"`);
      for (const err of item.errors) {
        console.log(`      ${err}`);
      }
    }

    // Check slug validity
    if (!isValidSlug(item.slug)) {
      hasIssues = true;
      warn(`${item.type} "${item.slug}" has non-standard slug format`);
    }
  }

  return !hasIssues;
}

function checkForDuplicates(posts: ContentItem[], notes: ContentItem[]): boolean {
  console.log("\n🔍 Duplicate Slug Check\n");

  const allSlugs = new Map<string, string[]>();
  let hasDuplicates = false;

  for (const item of [...posts, ...notes]) {
    const existing = allSlugs.get(item.slug) || [];
    existing.push(`${item.type}:${item.filePath}`);
    allSlugs.set(item.slug, existing);
  }

  for (const [slug, sources] of allSlugs.entries()) {
    if (sources.length > 1) {
      hasDuplicates = true;
      error(`Duplicate slug: "${slug}"`);
      for (const src of sources) {
        console.log(`      ${src}`);
      }
    }
  }

  if (!hasDuplicates) {
    success("No duplicate slugs found between posts and notes");
  }

  return !hasDuplicates;
}

function verifyBuildOutput(): boolean {
  console.log("\n🔧 Build Output Verification\n");

  let hasIssues = false;

  // Check sitemap exists
  if (!fs.existsSync(SITEMAP_FILE)) {
    error("Sitemap file not found at expected location");
    console.log(`      Expected: ${SITEMAP_FILE}`);
    hasIssues = true;
  } else {
    success("Sitemap file exists");

    // Check sitemap has entries
    const content = fs.readFileSync(SITEMAP_FILE, "utf-8");
    const urlCount = (content.match(/<url>/g) || []).length;

    if (urlCount === 0) {
      error("Sitemap contains no URLs");
      hasIssues = true;
    } else {
      success(`Sitemap contains ${urlCount} URLs`);
    }

    // Check base URL in sitemap
    if (content.includes("johanneskonings.dev")) {
      success("Sitemap uses correct domain (johanneskonings.dev)");
    } else if (content.includes("johanneskonings.github.io")) {
      warn("Sitemap still uses github.io domain instead of johanneskonings.dev");
    }
  }

  return !hasIssues;
}

function printSummary(posts: ContentItem[], notes: ContentItem[]) {
  console.log("\n📊 Summary\n");
  console.log(`  Total posts: ${posts.length}`);
  console.log(`  Published posts: ${posts.filter((p) => p.published).length}`);
  console.log(`  Draft posts: ${posts.filter((p) => !p.published).length}`);
  console.log(`  Total notes: ${notes.length}`);
  console.log(`  Published notes: ${notes.filter((n) => n.published).length}`);
  console.log(`  Draft notes: ${notes.filter((n) => !n.published).length}`);
}

function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║       TanStack Website Content Verification                  ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  const posts = collectPosts();
  const notes = collectNotes();

  const contentOk = verifyContent([...posts, ...notes]);
  const duplicatesOk = checkForDuplicates(posts, notes);
  const buildOk = verifyBuildOutput();

  printSummary(posts, notes);

  console.log("\n══════════════════════════════════════════════════════════════\n");

  if (contentOk && duplicatesOk && buildOk) {
    success("All checks passed!");
    process.exit(0);
  } else {
    error("Some checks failed. Please review the issues above.");
    process.exit(1);
  }
}

main();
