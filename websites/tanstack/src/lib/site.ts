const SITE_URL = "https://johanneskonings.dev";
const BLOG_PREFIX = "/blog/";

export const siteConfig = {
  name: "Johannes Konings",
  title: "Johannes Konings",
  description: "Notes and posts on AWS and TanStack.",
  baseUrl: SITE_URL,
  rssUrl: `${SITE_URL}/rss.xml`,
  sitemapUrl: `${SITE_URL}/sitemap-index.xml`,
  defaultSocialImage: "/social-preview.png",
  defaultSocialImageAlt: "Johannes Konings — notes and posts on AWS and TanStack.",
} as const;

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

function normalizeSitePath(path = "/"): string {
  if (path === "/") {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath.replace(/\/{2,}/g, "/");
}

export function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

export function toBlogPostPath(slug: string): string {
  return withTrailingSlash(`/blog/${slug}`);
}

export function toBlogArchivePath(
  archiveType: "category" | "series" | "tag",
  slug: string,
): string {
  return withTrailingSlash(`/blog/${archiveType}/${encodeURIComponent(slug)}`);
}

export function normalizeCanonicalPath(path = "/"): string {
  const normalizedPath = normalizeSitePath(path);

  if (normalizedPath !== "/blog" && normalizedPath.startsWith(BLOG_PREFIX)) {
    return withTrailingSlash(normalizedPath);
  }

  return normalizedPath;
}

export function toAbsoluteUrl(path = "/"): string {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = normalizeCanonicalPath(path);

  if (normalizedPath === "/") {
    return siteConfig.baseUrl;
  }

  return `${siteConfig.baseUrl}${normalizedPath}`;
}

export function toAbsoluteAssetUrl(path?: string | null): string | undefined {
  if (!path) {
    return undefined;
  }

  return toAbsoluteUrl(path);
}
