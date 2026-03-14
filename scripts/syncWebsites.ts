import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "src/content");
const PUBLIC_CONTENT_ROOT = path.join(ROOT, "public/content");
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

function copyDirectory(source: string, destination: string) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

function isMarkdownFile(filePath: string) {
  return MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function copyAssetFiles(source: string, destination: string) {
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyAssetFiles(sourcePath, destinationPath);
      continue;
    }

    if (isMarkdownFile(sourcePath)) {
      continue;
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function collectMarkdownFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const markdownFiles: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      markdownFiles.push(...collectMarkdownFiles(entryPath));
      continue;
    }

    if (path.extname(entry.name) === ".md") {
      markdownFiles.push(entryPath);
    }
  }

  return markdownFiles;
}

function stripLayoutFrontmatter(directory: string) {
  for (const filePath of collectMarkdownFiles(directory)) {
    const markdownContent = fs.readFileSync(filePath, "utf-8");
    const markdownContentWithoutLayout = markdownContent.replace(/^.*layout:.*$\n?/gm, "");
    fs.writeFileSync(filePath, markdownContentWithoutLayout);
  }
}

function syncContentSource(sourceDirectory: string, destinationName: "blog" | "notes") {
  const sourcePath = path.join(ROOT, sourceDirectory);
  const destinationPath = path.join(CONTENT_ROOT, destinationName);

  console.log(`Syncing ${sourceDirectory} to src/content/${destinationName}`);
  copyDirectory(sourcePath, destinationPath);
  stripLayoutFrontmatter(destinationPath);
}

const website = process.argv[2];

if (website && website !== "tanstack") {
  console.error("Unknown website", website);
  process.exit(1);
}

syncContentSource("_posts", "blog");
syncContentSource("_notes", "notes");

console.log("Copying synced assets to public/content");
fs.rmSync(PUBLIC_CONTENT_ROOT, { recursive: true, force: true });
copyAssetFiles(CONTENT_ROOT, PUBLIC_CONTENT_ROOT);
