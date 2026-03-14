import avatar from "../images/avatar.png";

const SITE_URL = "https://johanneskonings.dev";

export const siteConfig = {
  name: "Johannes Konings",
  title: "Johannes Konings",
  description: "Notes and posts on AWS and TanStack.",
  baseUrl: SITE_URL,
  rssUrl: `${SITE_URL}/rss.xml`,
  sitemapUrl: `${SITE_URL}/sitemap-index.xml`,
  defaultSocialImage: avatar,
  defaultSocialImageAlt: "Avatar of Johannes Konings.",
} as const;

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

export function toAbsoluteUrl(path = "/"): string {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  if (path === "/") {
    return siteConfig.baseUrl;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.baseUrl}${normalizedPath}`;
}

export function toAbsoluteAssetUrl(path?: string | null): string | undefined {
  if (!path) {
    return undefined;
  }

  return toAbsoluteUrl(path);
}
