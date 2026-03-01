const DEFAULT_SITE_URL = "https://johanneskonings.dev";

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function resolveSiteUrl(): string {
  if (typeof process !== "undefined" && process.env?.SITE_URL) {
    return normalizeSiteUrl(process.env.SITE_URL);
  }
  return DEFAULT_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Johannes Konings";
export const SITE_DESCRIPTION = "Notes and posts on AWS and TanStack.";
export const SITE_RSS_PATH = "/rss.xml";
export const SITE_SITEMAP_PATH = "/sitemap-index.xml";
export const SITE_AUTHOR = "Johannes Konings";

export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
