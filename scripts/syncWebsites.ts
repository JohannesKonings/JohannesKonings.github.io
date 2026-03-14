import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC_CONTENT_ROOT = path.join(ROOT, "websites/tanstack/public/content");
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

function isMarkdownFile(filePath: string) {
  return MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function copyAssetFiles(source: string, destination: string) {
  if (!fs.existsSync(source)) {
    return;
  }

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

function syncContentAssets(sourceDirectory: string, destinationName: "blog" | "notes") {
  const sourcePath = path.join(ROOT, sourceDirectory);
  const destinationPath = path.join(PUBLIC_CONTENT_ROOT, destinationName);

  console.log(
    `Syncing ${sourceDirectory} assets to websites/tanstack/public/content/${destinationName}`,
  );
  fs.rmSync(destinationPath, { recursive: true, force: true });
  copyAssetFiles(sourcePath, destinationPath);
}

const website = process.argv[2];

if (website && website !== "tanstack") {
  console.error("Unknown website", website);
  process.exit(1);
}

console.log("Refreshing websites/tanstack/public/content asset mirror");
fs.rmSync(PUBLIC_CONTENT_ROOT, { recursive: true, force: true });
syncContentAssets("_posts", "blog");
syncContentAssets("_notes", "notes");
