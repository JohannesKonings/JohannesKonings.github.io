import { resolveDeploymentConfig } from "./deployment";

const processEnv = typeof process !== "undefined" ? process.env : undefined;

const deployment = resolveDeploymentConfig({
  deploymentKind:
    import.meta.env?.VITE_DEPLOYMENT_KIND ??
    processEnv?.VITE_DEPLOYMENT_KIND ??
    processEnv?.DEPLOYMENT_KIND,
  nodeEnv: import.meta.env?.NODE_ENV ?? processEnv?.NODE_ENV,
  siteUrl: import.meta.env?.VITE_SITE_URL ?? processEnv?.VITE_SITE_URL ?? processEnv?.SITE_URL,
  branchName:
    import.meta.env?.VITE_BRANCH_NAME ?? processEnv?.VITE_BRANCH_NAME ?? processEnv?.BRANCH_NAME,
  previewSiteBaseDomain:
    import.meta.env?.VITE_PREVIEW_SITE_BASE_DOMAIN ??
    processEnv?.VITE_PREVIEW_SITE_BASE_DOMAIN ??
    processEnv?.PREVIEW_SITE_BASE_DOMAIN,
  productionSiteUrl:
    import.meta.env?.VITE_PRODUCTION_SITE_URL ??
    processEnv?.VITE_PRODUCTION_SITE_URL ??
    processEnv?.PRODUCTION_SITE_URL,
  localSiteUrl:
    import.meta.env?.VITE_LOCAL_SITE_URL ??
    processEnv?.VITE_LOCAL_SITE_URL ??
    processEnv?.LOCAL_SITE_URL,
});

export const siteConfig = {
  name: "Johannes Konings",
  title: "Johannes Konings",
  description: "Notes and posts on AWS and TanStack.",
  deploymentKind: deployment.deploymentKind,
  host: deployment.host,
  baseUrl: deployment.siteUrl,
  productionBaseUrl: deployment.productionSiteUrl,
  rssUrl: `${deployment.siteUrl}/rss.xml`,
  sitemapUrl: `${deployment.siteUrl}/sitemap-index.xml`,
  shouldIndex: deployment.shouldIndex,
  shouldLoadTrackingScripts: deployment.shouldLoadTrackingScripts,
  robotsMetaContent: deployment.robotsMetaContent,
  googleBotContent: deployment.googleBotContent,
  analyticsDomains: deployment.host,
  isProduction: deployment.isProduction,
  isPreview: deployment.isPreview,
  isLocal: deployment.isLocal,
  previewBranchLabel: deployment.branchLabel,
  defaultSocialImage: "/social-preview.png",
  defaultSocialImageAlt: "Johannes Konings — notes and posts on AWS and TanStack.",
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
