const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;
const SITE_BASEURL_PATTERN = /\{\{\s*site\.baseurl\s*\}\}/gi;
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\((?<target>[^)]+)\)/g;

function trimWrappingCharacters(value: string) {
  return value.replace(/^<|>$/g, "").replace(/^['"]|['"]$/g, "");
}

function extractMarkdownImageTarget(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.startsWith("<")) {
    const closingIndex = trimmedValue.indexOf(">");
    if (closingIndex >= 0) {
      return trimmedValue.slice(1, closingIndex);
    }
  }

  const titleMatch = trimmedValue.match(/^(.*?)(?=\s+(?:"[^"]*"|'[^']*'|\([^)]+\))$)/);
  return titleMatch?.[1] ?? trimmedValue;
}

export function normalizeContentImagePath(
  path: string | null | undefined,
  slug?: string,
): string | undefined {
  if (!path) {
    return undefined;
  }

  const trimmedPath = trimWrappingCharacters(path.trim());

  if (!trimmedPath || trimmedPath.startsWith("#")) {
    return undefined;
  }

  const withoutSiteBaseUrl = trimmedPath.replace(SITE_BASEURL_PATTERN, "");

  if (
    ABSOLUTE_URL_PATTERN.test(withoutSiteBaseUrl) ||
    withoutSiteBaseUrl.startsWith("data:") ||
    withoutSiteBaseUrl.startsWith("blob:")
  ) {
    return withoutSiteBaseUrl;
  }

  if (withoutSiteBaseUrl.startsWith("/")) {
    return withoutSiteBaseUrl;
  }

  const normalizedRelativePath = withoutSiteBaseUrl.replace(/^\.\//, "");

  if (!normalizedRelativePath) {
    return undefined;
  }

  if (!slug) {
    return `/${normalizedRelativePath}`;
  }

  return `/content/blog/${slug}/${normalizedRelativePath}`;
}

export function extractFirstMarkdownImage(content: string, slug: string): string | undefined {
  for (const match of content.matchAll(MARKDOWN_IMAGE_PATTERN)) {
    const normalizedPath = normalizeContentImagePath(
      match.groups?.target ? extractMarkdownImageTarget(match.groups.target) : undefined,
      slug,
    );
    if (normalizedPath) {
      return normalizedPath;
    }
  }

  return undefined;
}

interface ResolvePostSocialImageInput {
  coverImage?: string | null;
  content: string;
  slug: string;
  fallbackImage?: string;
}

export function resolvePostSocialImage({
  coverImage,
  content,
  slug,
  fallbackImage,
}: ResolvePostSocialImageInput): string | undefined {
  return (
    normalizeContentImagePath(coverImage, slug) ??
    extractFirstMarkdownImage(content, slug) ??
    normalizeContentImagePath(fallbackImage)
  );
}
