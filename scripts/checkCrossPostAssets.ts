#!/usr/bin/env tsx
/**
 * Check one post for assets dev.to and AWS Builder Center can publish.
 *
 * The blog markdown keeps using SVG. Cross-post platforms need raster files
 * beside those SVGs, plus a 1200×675 Builder Center cover. Content sync copies
 * the whole post directory, including files the markdown does not reference.
 *
 * Usage:
 *   vp exec tsx scripts/checkCrossPostAssets.ts <slug>
 *   vp exec tsx scripts/checkCrossPostAssets.ts <slug> --output websites/tanstack/.output/public
 *
 * See crossPosts/README.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const DEVTO_COVER_WIDTH = 1000;
const DEVTO_COVER_HEIGHT = 420;
const BUILDER_COVER_WIDTH = 1200;
const BUILDER_COVER_HEIGHT = 675;
const BUILDER_COVER_MAX_BYTES = 2 * 1024 * 1024;
const DEVTO_MAX_TAGS = 4;
const BUILDER_COVER_BASENAME = "cover-builder-1200x675";

const RASTER_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"] as const;
const BUILDER_COVER_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

type RasterExtension = (typeof RASTER_EXTENSIONS)[number];
type BuilderCoverExtension = (typeof BUILDER_COVER_EXTENSIONS)[number];

export type CrossPostAssetIssue = {
  severity: "error" | "warning";
  message: string;
};

export type CrossPostAssetReport = {
  issues: CrossPostAssetIssue[];
};

type ImageSize = {
  width: number;
  height: number;
};

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

function isRasterExtension(extension: string): extension is RasterExtension {
  return (RASTER_EXTENSIONS as readonly string[]).includes(extension);
}

function isBuilderCoverExtension(extension: string): extension is BuilderCoverExtension {
  return (BUILDER_COVER_EXTENSIONS as readonly string[]).includes(extension);
}

function readPngSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 24) return null;
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let index = 0; index < signature.length; index += 1) {
    if (buffer[index] !== signature[index]) return null;
  }
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 1 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= buffer.length) return null;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) return null;
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      if (length < 7) return null;
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }
  return null;
}

function readWebpSize(buffer: Buffer): ImageSize | null {
  if (buffer.length < 30) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    const widthMinusOne = buffer.readUIntLE(24, 3);
    const heightMinusOne = buffer.readUIntLE(27, 3);
    return { width: 1 + widthMinusOne, height: 1 + heightMinusOne };
  }
  if (chunk === "VP8 ") {
    const frameTag = buffer[20] ?? 0;
    if ((frameTag & 1) !== 0) return null;
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) return null;
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    if (buffer[20] !== 0x2f) return null;
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  return null;
}

function readRasterSize(filePath: string): ImageSize | null {
  const extension = path.extname(filePath).toLowerCase();
  if (!isRasterExtension(extension)) return null;
  const buffer = fs.readFileSync(filePath);
  switch (extension) {
    case ".png":
      return readPngSize(buffer);
    case ".jpg":
    case ".jpeg":
      return readJpegSize(buffer);
    case ".webp":
      return readWebpSize(buffer);
    case ".gif":
    case ".avif":
      return null;
    default: {
      const unexpected: never = extension;
      return unexpected;
    }
  }
}

function parseFrontmatter(content: string): string | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] ?? null;
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

function parseCoverImage(frontmatter: string): string | undefined {
  const match = frontmatter.match(/^cover_image:\s*(.+)$/m);
  if (!match?.[1]) return undefined;
  return unquote(match[1]);
}

function parseTags(frontmatter: string): string[] {
  const block = frontmatter.match(/^tags:\s*\n((?:[ \t]*-[ \t].*\n?)*)/m);
  if (block?.[1]) {
    return [...block[1].matchAll(/^[ \t]*-[ \t]+(.*)$/gm)].map((match) => unquote(match[1] ?? ""));
  }
  const inline = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (!inline?.[1]) return [];
  return inline[1]
    .split(",")
    .map((tag) => unquote(tag))
    .filter((tag) => tag.length > 0);
}

function listFiles(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

function issue(severity: CrossPostAssetIssue["severity"], message: string): CrossPostAssetIssue {
  return { severity, message };
}

function checkDevtoCover(postDirectory: string, frontmatter: string): CrossPostAssetIssue[] {
  const coverImage = parseCoverImage(frontmatter);
  if (!coverImage) {
    return [issue("error", "frontmatter cover_image is missing")];
  }
  if (!coverImage.startsWith("./") || coverImage.includes("..")) {
    return [
      issue(
        "error",
        `cover_image must be a file in the post directory (./cover-image.png). Found ${coverImage}`,
      ),
    ];
  }

  const fileName = coverImage.slice(2);
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".svg") {
    return [
      issue(
        "error",
        "cover_image is an SVG. dev.to does not render SVG, and Builder Center rejects it",
      ),
    ];
  }
  if (!isRasterExtension(extension)) {
    return [issue("error", `cover_image must be a raster image. Found ${fileName}`)];
  }

  const filePath = path.join(postDirectory, fileName);
  if (!fs.existsSync(filePath)) {
    return [issue("error", `cover_image file is missing: ${fileName}`)];
  }

  const size = readRasterSize(filePath);
  if (!size) {
    return [
      issue(
        "warning",
        `could not read dimensions of ${fileName}. dev.to cover images in this repo are ${DEVTO_COVER_WIDTH}x${DEVTO_COVER_HEIGHT}`,
      ),
    ];
  }
  if (size.width !== DEVTO_COVER_WIDTH || size.height !== DEVTO_COVER_HEIGHT) {
    return [
      issue(
        "warning",
        `${fileName} is ${size.width}x${size.height}. The dev.to cover used by this blog is ${DEVTO_COVER_WIDTH}x${DEVTO_COVER_HEIGHT}`,
      ),
    ];
  }
  return [];
}

function checkBuilderCover(postDirectory: string, fileNames: string[]): CrossPostAssetIssue[] {
  const matches = fileNames.filter((fileName) => {
    const extension = path.extname(fileName).toLowerCase();
    return (
      path.basename(fileName, extension) === BUILDER_COVER_BASENAME &&
      isBuilderCoverExtension(extension)
    );
  });

  if (matches.length === 0) {
    return [
      issue(
        "error",
        `missing Builder Center cover ${BUILDER_COVER_BASENAME}.png (jpg or webp with the same basename is also accepted), ${BUILDER_COVER_WIDTH}x${BUILDER_COVER_HEIGHT}, max 2 MB`,
      ),
    ];
  }
  if (matches.length > 1) {
    return [
      issue("error", `expected one Builder Center cover, found ${matches.sort().join(", ")}`),
    ];
  }

  const fileName = matches[0] ?? "";
  const filePath = path.join(postDirectory, fileName);
  const bytes = fs.statSync(filePath).size;
  const found: CrossPostAssetIssue[] = [];
  if (bytes > BUILDER_COVER_MAX_BYTES) {
    found.push(
      issue(
        "error",
        `${fileName} is ${bytes} bytes. Builder Center covers must be at most ${BUILDER_COVER_MAX_BYTES} bytes (2 MB)`,
      ),
    );
  }

  const size = readRasterSize(filePath);
  if (!size) {
    found.push(issue("error", `could not read dimensions of Builder Center cover ${fileName}`));
    return found;
  }
  if (size.width !== BUILDER_COVER_WIDTH || size.height !== BUILDER_COVER_HEIGHT) {
    found.push(
      issue(
        "error",
        `${fileName} is ${size.width}x${size.height}. Builder Center covers must be ${BUILDER_COVER_WIDTH}x${BUILDER_COVER_HEIGHT}`,
      ),
    );
  }
  return found;
}

function checkSvgFallbacks(postDirectory: string, fileNames: string[]): CrossPostAssetIssue[] {
  const found: CrossPostAssetIssue[] = [];
  const svgNames = fileNames.filter((fileName) => path.extname(fileName).toLowerCase() === ".svg");
  for (const svgName of svgNames) {
    const pngName = `${path.basename(svgName, path.extname(svgName))}.png`;
    const pngPath = path.join(postDirectory, pngName);
    if (!fs.existsSync(pngPath)) {
      found.push(
        issue(
          "error",
          `${svgName} has no PNG fallback. Add ${pngName} (dev.to does not render SVG; Builder Center rejects SVG)`,
        ),
      );
      continue;
    }
    const header = fs.readFileSync(pngPath).subarray(0, 24);
    if (!readPngSize(header)) {
      found.push(issue("error", `${pngName} is not a PNG. SVG fallbacks are PNG files`));
    }
  }
  return found;
}

function checkTags(frontmatter: string): CrossPostAssetIssue[] {
  const tags = parseTags(frontmatter);
  if (tags.length <= DEVTO_MAX_TAGS) return [];
  return [
    issue(
      "warning",
      `this post has ${tags.length} tags. dev.to accepts at most ${DEVTO_MAX_TAGS}; pick ${DEVTO_MAX_TAGS} when cross-posting. The blog keeps the full list`,
    ),
  ];
}

export function inspectPost(postDirectory: string): CrossPostAssetReport {
  if (!fs.existsSync(postDirectory)) {
    return { issues: [issue("error", `post directory does not exist: ${postDirectory}`)] };
  }
  const indexPath = path.join(postDirectory, "index.md");
  if (!fs.existsSync(indexPath)) {
    return { issues: [issue("error", "index.md is missing")] };
  }

  const frontmatter = parseFrontmatter(fs.readFileSync(indexPath, "utf8"));
  if (frontmatter === null) {
    return { issues: [issue("error", "index.md has no frontmatter")] };
  }

  const fileNames = listFiles(postDirectory);
  return {
    issues: [
      ...checkDevtoCover(postDirectory, frontmatter),
      ...checkBuilderCover(postDirectory, fileNames),
      ...checkSvgFallbacks(postDirectory, fileNames),
      ...checkTags(frontmatter),
    ],
  };
}

/**
 * Files from the post directory that are missing, or a different size, in the
 * published content directory. Markdown is skipped: content sync strips Jekyll
 * layout lines, so the published copy can differ from source.
 */
export function findUnpublishedAssets(
  sourceDirectory: string,
  publishedDirectory: string,
): string[] {
  if (!fs.existsSync(sourceDirectory)) return ["<post directory missing>"];
  if (!fs.existsSync(publishedDirectory)) return ["<published directory missing>"];
  return listFiles(sourceDirectory).filter((fileName) => {
    if (path.extname(fileName).toLowerCase() === ".md") return false;
    const sourcePath = path.join(sourceDirectory, fileName);
    const publishedPath = path.join(publishedDirectory, fileName);
    if (!fs.existsSync(publishedPath)) return true;
    return fs.statSync(sourcePath).size !== fs.statSync(publishedPath).size;
  });
}

function printUsage(): void {
  console.error(
    "Usage: vp exec tsx scripts/checkCrossPostAssets.ts <slug> [--output <public-dir>]",
  );
}

function takeOutputArg(
  args: string[],
  index: number,
): { outputDir: string; nextIndex: number } | null {
  const outputDir = args[index + 1];
  if (!outputDir || outputDir.startsWith("--")) return null;
  return { outputDir, nextIndex: index + 1 };
}

function main(): number {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let outputDir: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? "";
    if (arg === "--output") {
      const parsed = takeOutputArg(args, index);
      if (!parsed) {
        console.error("--output requires a directory");
        printUsage();
        return 1;
      }
      outputDir = parsed.outputDir;
      index = parsed.nextIndex;
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`Unknown argument ${arg}`);
      printUsage();
      return 1;
    }
    if (slug) {
      console.error(`Unexpected argument ${arg}`);
      printUsage();
      return 1;
    }
    slug = arg;
  }

  if (!slug || slug.includes("/") || slug.includes("\\") || slug.includes("..")) {
    printUsage();
    return 1;
  }

  const postDirectory = path.join(ROOT, "_posts", slug);
  console.log(`Checking ${postDirectory}`);
  const report = inspectPost(postDirectory);
  for (const item of report.issues) {
    const color = item.severity === "error" ? colors.red : colors.yellow;
    const mark = item.severity === "error" ? "✗" : "⚠";
    console.log(`${color}${mark}${colors.reset} ${item.message}`);
  }

  if (outputDir) {
    const publishedDirectory = path.join(outputDir, "content", "blog", slug);
    console.log(`Checking published copy ${publishedDirectory}`);
    const missing = findUnpublishedAssets(postDirectory, publishedDirectory);
    for (const fileName of missing) {
      const message = `${fileName} is missing from the published post directory, or its size does not match the source file`;
      report.issues.push(issue("error", message));
      console.log(`${colors.red}✗${colors.reset} ${message}`);
    }
  }

  const errors = report.issues.filter((item) => item.severity === "error");
  if (errors.length > 0) {
    console.log(`${colors.red}${errors.length} error(s)${colors.reset}`);
    return 1;
  }
  console.log(`${colors.green}✓ cross-post assets ok${colors.reset}`);
  return 0;
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  process.exit(main());
}
