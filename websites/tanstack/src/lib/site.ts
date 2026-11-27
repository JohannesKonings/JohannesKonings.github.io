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

/**
 * Routes prerendered to a `<name>.html` file (see the `pages` list in `vite.config.ts`).
 * GitHub Pages serves these at a path WITHOUT a trailing slash, and the trailing-slash form
 * 404s. Every other prerendered route relies on `autoSubfolderIndex`, which emits
 * `<path>/index.html`; GitHub Pages serves those only at the trailing-slash URL and
 * 301-redirects the non-slash form to it.
 */
const FILE_OUTPUT_PATHS = new Set(["/", "/blog", "/notes", "/search"]);

/**
 * Normalize a route path to the exact form GitHub Pages serves with a 200 (no redirect):
 * file-style pages keep their bare path, every other page gets a trailing slash. Query
 * strings and hashes are preserved and never receive a trailing slash.
 */
export function toCanonicalPath(path = "/"): string {
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const suffix = rest.join("");

  if (FILE_OUTPUT_PATHS.has(pathname) || pathname.endsWith("/")) {
    return `${pathname}${suffix}`;
  }

  return `${pathname}/${suffix}`;
}

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

/**
 * Build an absolute, canonical URL for a route path, i.e. the URL that resolves with a 200
 * on GitHub Pages without a redirect. Use this for canonical links, og:url, JSON-LD, and the
 * sitemap. Absolute URLs are returned unchanged.
 */
export function toCanonicalUrl(path = "/"): string {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  return toAbsoluteUrl(toCanonicalPath(path));
}

export function toAbsoluteAssetUrl(path?: string | null): string | undefined {
  if (!path) {
    return undefined;
  }

  return toAbsoluteUrl(path);
}
