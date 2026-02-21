import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const tanstackRoot = path.join(repoRoot, "websites", "tanstack");
const tanstackServerEntry = path.join(
  tanstackRoot,
  ".output",
  "server",
  "index.mjs",
);
const tanstackPublicDir = path.join(tanstackRoot, ".output", "public");
const exportDir = path.join(tanstackRoot, ".output", "static-export");
const tanstackContentDir = path.join(tanstackRoot, "src", "content");

const port = Number(process.env.TANSTACK_EXPORT_PORT ?? "4317");
const baseUrl = `http://127.0.0.1:${port}`;

function copyDirectory(sourceDir: string, targetDir: string) {
  fs.mkdirSync(targetDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function getMarkdownFiles(targetPath: string): string[] {
  return fs
    .readdirSync(targetPath, { recursive: true })
    .map((file) => path.join(targetPath, file.toString()))
    .filter((absolutePath) => absolutePath.endsWith(".md"));
}

function toContentSlug(filePath: string, basePath: string): string {
  const relativePath = path.relative(basePath, filePath).replaceAll("\\", "/");
  return relativePath.replace(/\/index\.md$/, "").replace(/\.md$/, "");
}

function parseFrontmatter(markdownContent: string): string {
  const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---/);
  return frontmatterMatch?.[1] ?? "";
}

function parseYamlArrayField(frontmatter: string, fieldName: string): string[] {
  const lines = frontmatter.split("\n");
  const values: string[] = [];
  const startIndex = lines.findIndex((line) => line.trim() === `${fieldName}:`);

  if (startIndex === -1) {
    const inlineFieldMatch = frontmatter.match(
      new RegExp(`^${fieldName}:\\s*(.+)$`, "m"),
    );
    if (!inlineFieldMatch || !inlineFieldMatch[1]) {
      return values;
    }

    const inlineValue = inlineFieldMatch[1].trim();
    if (inlineValue.startsWith("[") && inlineValue.endsWith("]")) {
      return inlineValue
        .slice(1, -1)
        .split(",")
        .map((value) => value.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }

    if (
      inlineValue.length > 0 &&
      inlineValue !== "[]" &&
      inlineValue !== "null" &&
      inlineValue !== "false"
    ) {
      return [inlineValue.replace(/^["']|["']$/g, "")];
    }

    return values;
  }

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const currentLine = lines[index];
    if (!currentLine.startsWith("  - ")) {
      break;
    }

    const value = currentLine
      .replace("  - ", "")
      .trim()
      .replace(/^["']|["']$/g, "");
    if (value) {
      values.push(value);
    }
  }

  return values;
}

function getBlogRouteData() {
  const blogBaseDir = path.join(tanstackContentDir, "blog");
  const blogFiles = getMarkdownFiles(blogBaseDir);
  const tags = new Set<string>();
  const categories = new Set<string>();
  const postSlugs: string[] = [];

  for (const blogFile of blogFiles) {
    const markdownContent = fs.readFileSync(blogFile, "utf-8");
    const frontmatter = parseFrontmatter(markdownContent);
    const publishedMatch = frontmatter.match(/^published:\s*(.+)$/m);
    const isPublished = (publishedMatch?.[1] ?? "true").trim() !== "false";

    if (!isPublished) {
      continue;
    }

    const slug = toContentSlug(blogFile, blogBaseDir);
    postSlugs.push(slug);

    for (const tag of parseYamlArrayField(frontmatter, "tags")) {
      tags.add(tag);
    }

    for (const category of parseYamlArrayField(frontmatter, "categories")) {
      categories.add(category);
    }
  }

  return {
    postSlugs,
    tags: Array.from(tags),
    categories: Array.from(categories),
  };
}

function getNoteRouteData() {
  const notesBaseDir = path.join(tanstackContentDir, "notes");
  const noteFiles = getMarkdownFiles(notesBaseDir);
  const noteSlugs: string[] = [];

  for (const noteFile of noteFiles) {
    const markdownContent = fs.readFileSync(noteFile, "utf-8");
    const frontmatter = parseFrontmatter(markdownContent);
    const publishedMatch = frontmatter.match(/^published:\s*(.+)$/m);
    const isPublished = (publishedMatch?.[1] ?? "true").trim() !== "false";
    if (!isPublished) {
      continue;
    }

    noteSlugs.push(toContentSlug(noteFile, notesBaseDir));
  }

  return noteSlugs;
}

function getLegalRouteData() {
  const legalBaseDir = path.join(tanstackContentDir, "legal");
  const legalFiles = getMarkdownFiles(legalBaseDir);
  return legalFiles.map((legalFile) => toContentSlug(legalFile, legalBaseDir));
}

function getRoutesToExport() {
  const { postSlugs, tags, categories } = getBlogRouteData();
  const noteSlugs = getNoteRouteData();
  const legalSlugs = getLegalRouteData();

  const routes = new Set<string>([
    "/",
    "/blog",
    "/notes",
    "/search",
    "/rss.xml",
    "/robots.txt",
  ]);

  for (const postSlug of postSlugs) {
    routes.add(`/blog/${encodeURIComponent(postSlug)}`);
  }

  for (const noteSlug of noteSlugs) {
    routes.add(`/notes/${encodeURIComponent(noteSlug)}`);
  }

  for (const tag of tags) {
    if (/^[a-z0-9-]+$/i.test(tag)) {
      routes.add(`/blog/tag/${encodeURIComponent(tag)}`);
    }
  }

  for (const category of categories) {
    if (/^[a-z0-9-]+$/i.test(category)) {
      routes.add(`/blog/category/${encodeURIComponent(category)}`);
    }
  }

  for (const legalSlug of legalSlugs) {
    routes.add(`/legal/${encodeURIComponent(legalSlug)}`);
  }

  return Array.from(routes);
}

async function waitForServerReady(maxAttempts = 60) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        return;
      }
    } catch {
      // Ignore and retry
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }

  throw new Error("Timed out waiting for TanStack server to become ready");
}

function routeToOutputPath(routePath: string) {
  const normalizedPath = routePath.replace(/^\//, "");
  if (routePath === "/") {
    return path.join(exportDir, "index.html");
  }

  if (routePath.endsWith(".xml") || routePath.endsWith(".txt")) {
    return path.join(exportDir, normalizedPath);
  }

  return path.join(exportDir, normalizedPath, "index.html");
}

async function resolveRouteResponse(routePath: string) {
  let currentRoute = routePath;
  const visitedRoutes = new Set<string>();

  for (let redirectCount = 0; redirectCount < 10; redirectCount += 1) {
    if (visitedRoutes.has(currentRoute)) {
      throw new Error(`Redirect loop detected while exporting ${routePath}`);
    }
    visitedRoutes.add(currentRoute);

    const response = await fetch(`${baseUrl}${currentRoute}`, {
      redirect: "manual",
    });
    if (response.status < 300 || response.status >= 400) {
      return response;
    }

    const location = response.headers.get("location");
    if (!location) {
      throw new Error(
        `Received redirect status ${response.status} without location for ${routePath}`,
      );
    }

    const nextUrl = new URL(location, baseUrl);
    currentRoute = `${nextUrl.pathname}${nextUrl.search}`;
  }

  throw new Error(`Exceeded redirect limit while exporting ${routePath}`);
}

async function exportRoute(routePath: string) {
  const response = await resolveRouteResponse(routePath);
  if (!response.ok) {
    throw new Error(
      `Failed to export ${routePath}. Status: ${response.status}`,
    );
  }

  const outputPath = routeToOutputPath(routePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const body = await response.text();
  fs.writeFileSync(outputPath, body);
}

async function main() {
  if (!fs.existsSync(tanstackServerEntry)) {
    throw new Error(
      `TanStack server bundle not found at ${tanstackServerEntry}. Run build:tanstack first.`,
    );
  }

  fs.rmSync(exportDir, { recursive: true, force: true });
  copyDirectory(tanstackPublicDir, exportDir);

  const serverProcess = spawn("node", [tanstackServerEntry], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: "inherit",
  });

  try {
    await waitForServerReady();
    const routes = getRoutesToExport();
    for (const routePath of routes) {
      // eslint-disable-next-line no-await-in-loop
      await exportRoute(routePath);
    }

    const notFoundResponse = await fetch(`${baseUrl}/does-not-exist`);
    const notFoundBody = await notFoundResponse.text();
    fs.writeFileSync(path.join(exportDir, "404.html"), notFoundBody);

    console.log(`Exported ${routes.length} routes to ${exportDir}`);
  } finally {
    serverProcess.kill("SIGTERM");
  }
}

await main();
