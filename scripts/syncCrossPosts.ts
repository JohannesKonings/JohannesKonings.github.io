import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SITE_BASE_URL = "https://johanneskonings.dev";
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"]);

type PostSource = {
  slug: string;
  sourceFilePath: string;
  outputFileName: string;
};

function normalizePathSeparators(value: string): string {
  return value.replaceAll("\\", "/");
}

function isImagePath(value: string): boolean {
  const cleanValue = value.split("?")[0]?.split("#")[0] ?? value;
  return IMAGE_EXTENSIONS.has(path.extname(cleanValue).toLowerCase());
}

function toContentAssetUrl(slug: string, fileName: string): string {
  return `${SITE_BASE_URL}/content/blog/${slug}/${fileName}`;
}

function getPostSources(postsDirectory: string): PostSource[] {
  const sources: PostSource[] = [];
  const entries = fs.readdirSync(postsDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const slug = entry.name;
      const indexPath = path.join(postsDirectory, slug, "index.md");
      if (!fs.existsSync(indexPath)) continue;
      sources.push({
        slug,
        sourceFilePath: indexPath,
        outputFileName: `${slug}-index.md`,
      });
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      const slug = entry.name.replace(/\.md$/i, "");
      sources.push({
        slug,
        sourceFilePath: path.join(postsDirectory, entry.name),
        outputFileName: entry.name,
      });
    }
  }

  return sources.sort((a, b) => a.slug.localeCompare(b.slug));
}

function createSlugAliases(postSources: PostSource[]): Map<string, string> {
  const aliases = new Map<string, string>();

  for (const postSource of postSources) {
    const slug = postSource.slug;
    const withoutDatePrefix = slug.replace(/^\d{4}-\d{2}-(?:\d{2}|xx)-/, "");
    const values = new Set([slug, withoutDatePrefix, `${withoutDatePrefix}.html`]);

    for (const value of values) {
      if (value.length > 0 && !aliases.has(value)) {
        aliases.set(value, slug);
      }
    }
  }

  return aliases;
}

function tryResolvePostSlug(reference: string, aliases: Map<string, string>): string | null {
  const normalizedReference = reference.replace(/\{\{\s*site\.baseurl\s*\}\}/g, "").trim();
  const cleanReference = normalizedReference.split("?")[0]?.split("#")[0] ?? normalizedReference;
  const trimmedReference = cleanReference.replace(/\/+$/, "");
  const fileName = path.basename(trimmedReference);
  const withoutExtension = fileName.replace(/\.html?$/i, "");

  const candidates = [
    trimmedReference,
    fileName,
    withoutExtension,
    trimmedReference.split("/").filter(Boolean).pop() ?? "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = aliases.get(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

function rewriteMarkdownContent(args: {
  content: string;
  currentSlug: string;
  aliases: Map<string, string>;
}): string {
  let content = args.content;

  content = content.replace(
    /^cover_image:\s*\.(\/[^\s]+)\s*$/gm,
    (_match, relativePath: string) => {
      const fileName = relativePath.replace(/^\//, "");
      return `cover_image: ${toContentAssetUrl(args.currentSlug, fileName)}`;
    },
  );

  content = content.replace(/(!?\[[^\]]*\]\()([^)]+)(\))/g, (fullMatch, prefix, target, suffix) => {
    const normalizedTarget = target.trim();

    if (
      normalizedTarget.startsWith("http://") ||
      normalizedTarget.startsWith("https://") ||
      normalizedTarget.startsWith("mailto:") ||
      normalizedTarget.startsWith("#") ||
      normalizedTarget.startsWith("data:")
    ) {
      return fullMatch;
    }

    if (normalizedTarget.startsWith("./") && isImagePath(normalizedTarget)) {
      return `${prefix}${toContentAssetUrl(args.currentSlug, normalizedTarget.slice(2))}${suffix}`;
    }

    const legacyImgMatch = normalizedTarget.match(
      /\{\{\s*site\.baseurl\s*\}\}\/img\/([^/]+)\/([^)\s?#]+)([?#][^)]+)?/,
    );
    if (legacyImgMatch) {
      const [, imageSlug, fileName] = legacyImgMatch;
      return `${prefix}${toContentAssetUrl(imageSlug, fileName)}${suffix}`;
    }

    if (normalizedTarget.startsWith("/img/")) {
      const imgMatch = normalizedTarget.match(/\/img\/([^/]+)\/([^)\s?#]+)([?#][^)]+)?/);
      if (imgMatch) {
        const [, imageSlug, fileName] = imgMatch;
        return `${prefix}${toContentAssetUrl(imageSlug, fileName)}${suffix}`;
      }
    }

    if (normalizedTarget.startsWith("./")) {
      const resolvedSlug = tryResolvePostSlug(normalizedTarget, args.aliases);
      if (resolvedSlug) {
        return `${prefix}${SITE_BASE_URL}/blog/${resolvedSlug}${suffix}`;
      }
    }

    if (normalizedTarget.includes("{{ site.baseurl }}") || normalizedTarget.startsWith("/")) {
      const resolvedSlug = tryResolvePostSlug(normalizedTarget, args.aliases);
      if (resolvedSlug) {
        return `${prefix}${SITE_BASE_URL}/blog/${resolvedSlug}${suffix}`;
      }
    }

    return fullMatch;
  });

  return content;
}

function syncCrossPosts() {
  const postsDirectory = path.join(ROOT, "_posts");
  const outputDirectory = path.join(ROOT, "crossPosts/devTo/posts");

  console.log("Syncing", postsDirectory, "to", outputDirectory);
  fs.rmSync(outputDirectory, { recursive: true, force: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  const postSources = getPostSources(postsDirectory);
  const aliases = createSlugAliases(postSources);

  console.log(`${postSources.length} markdown files found`);

  for (const postSource of postSources) {
    const markdownContent = fs.readFileSync(postSource.sourceFilePath, "utf-8");
    const rewrittenContent = rewriteMarkdownContent({
      content: markdownContent,
      currentSlug: postSource.slug,
      aliases,
    });
    const outputFilePath = path.join(
      outputDirectory,
      normalizePathSeparators(postSource.outputFileName),
    );

    console.log("filename", postSource.outputFileName);
    fs.writeFileSync(outputFilePath, rewrittenContent);
  }
}

syncCrossPosts();
