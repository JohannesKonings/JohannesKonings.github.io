const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;
const INTERNAL_PROTOCOLS = new Set(["mailto:", "tel:", "data:", "blob:"]);

function extractSlugCandidate(pathPart: string): string | null {
  const cleanPath = pathPart
    .replace(/^(\.\/)+/, "")
    .replace(/^(\.\.\/)+/, "")
    .replace(/\/index\.md$/i, "")
    .replace(/\/+$/, "")
    .replace(/\.(md|html?)$/i, "");
  const slug = cleanPath.split("/").filter(Boolean).at(-1);
  return slug ?? null;
}

export function normalizeMarkdownHref(
  href: string | undefined,
  fallbackSection: "blog" | "notes",
  options?: { assetBasePath?: string },
): string | undefined {
  if (!href) return href;

  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#")) return trimmed;
  if (
    ABSOLUTE_URL_PATTERN.test(trimmed) ||
    Array.from(INTERNAL_PROTOCOLS).some((prefix) => trimmed.startsWith(prefix))
  ) {
    return trimmed;
  }

  const suffixMatch = trimmed.match(/([?#].*)$/);
  const suffix = suffixMatch?.[1] ?? "";
  const rawPath = suffix ? trimmed.slice(0, -suffix.length) : trimmed;
  const relativePath = rawPath
    .replace(/^(\.\/)+/, "")
    .replace(/^(\.\.\/)+/, "")
    .replace(/^\/+/, "");
  const extension = relativePath.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();

  if (
    options?.assetBasePath &&
    extension &&
    extension !== "md" &&
    extension !== "html" &&
    extension !== "htm"
  ) {
    return `${options.assetBasePath}/${relativePath}${suffix}`;
  }

  const slugCandidate = extractSlugCandidate(rawPath);

  if (!slugCandidate) {
    return trimmed;
  }

  if (rawPath.startsWith("/")) {
    if (rawPath.startsWith("/aws/")) {
      return `/blog/${slugCandidate}${suffix}`;
    }
    return `${rawPath}${suffix}`;
  }

  return `/${fallbackSection}/${slugCandidate}${suffix}`;
}

export function isExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  return ABSOLUTE_URL_PATTERN.test(href);
}

