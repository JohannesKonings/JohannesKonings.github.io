export type DeploymentKind = "production" | "preview" | "local";

export interface DeploymentConfigInput {
  deploymentKind?: string | null;
  nodeEnv?: string | null;
  siteUrl?: string | null;
  branchName?: string | null;
  previewSiteBaseDomain?: string | null;
  productionSiteUrl?: string | null;
  localSiteUrl?: string | null;
}

export interface DeploymentConfig {
  deploymentKind: DeploymentKind;
  siteUrl: string;
  host: string;
  branchName?: string;
  branchLabel?: string;
  previewSiteBaseDomain?: string;
  productionSiteUrl: string;
  localSiteUrl: string;
  isProduction: boolean;
  isPreview: boolean;
  isLocal: boolean;
  shouldIndex: boolean;
  shouldLoadTrackingScripts: boolean;
  robotsMetaContent: string;
  googleBotContent: string;
}

export const DEFAULT_PRODUCTION_SITE_URL = "https://johanneskonings.dev";
export const DEFAULT_LOCAL_SITE_URL = "http://localhost:3000";

const DEPLOYMENT_KINDS = new Set<DeploymentKind>(["production", "preview", "local"]);

function normalizeSiteUrl(url: string): string {
  const normalizedUrl = url.trim().replace(/\/+$/, "");
  return normalizedUrl.length > 0 ? normalizedUrl : url;
}

function normalizeOptionalSiteUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }

  const normalized = normalizeSiteUrl(url);
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalBranchName(branchName?: string | null): string | undefined {
  const normalized = branchName?.trim();
  return normalized ? normalized : undefined;
}

function normalizeOptionalBaseDomain(baseDomain?: string | null): string | undefined {
  const normalized = baseDomain
    ?.trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  return normalized ? normalized : undefined;
}

function getStableHash(value: string): string {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
  }

  return hash.toString(36).slice(0, 8);
}

export function sanitizeBranchLabel(branchName: string, maxLength = 63): string {
  const normalized = branchName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  const fallbackLabel = `branch-${getStableHash(branchName || "branch")}`;
  const safeLabel = normalized || fallbackLabel;

  if (safeLabel.length <= maxLength) {
    return safeLabel;
  }

  const suffix = `-${getStableHash(branchName)}`;
  const truncatedPrefix = safeLabel
    .slice(0, Math.max(1, maxLength - suffix.length))
    .replace(/-+$/g, "");
  const candidate = `${truncatedPrefix}${suffix}`;

  return candidate.length <= maxLength ? candidate : candidate.slice(0, maxLength);
}

export function buildPreviewSiteUrl(branchName: string, previewSiteBaseDomain: string): string {
  const branchLabel = sanitizeBranchLabel(branchName);
  const normalizedBaseDomain = normalizeOptionalBaseDomain(previewSiteBaseDomain);

  if (!normalizedBaseDomain) {
    throw new Error("A preview site base domain is required to build a preview deployment URL.");
  }

  return `https://${branchLabel}.${normalizedBaseDomain}`;
}

function normalizeDeploymentKind(deploymentKind?: string | null): DeploymentKind | undefined {
  if (!deploymentKind) {
    return undefined;
  }

  return DEPLOYMENT_KINDS.has(deploymentKind as DeploymentKind)
    ? (deploymentKind as DeploymentKind)
    : undefined;
}

function inferDeploymentKind(input: {
  explicitDeploymentKind?: DeploymentKind;
  nodeEnv?: string | null;
  siteUrl?: string;
  productionSiteUrl: string;
  localSiteUrl: string;
}): DeploymentKind {
  if (input.explicitDeploymentKind) {
    return input.explicitDeploymentKind;
  }

  if (input.siteUrl) {
    if (input.siteUrl === input.localSiteUrl) {
      return "local";
    }

    if (input.siteUrl === input.productionSiteUrl) {
      return "production";
    }

    return "preview";
  }

  return input.nodeEnv === "production" ? "production" : "local";
}

function getSiteUrlForKind(input: {
  deploymentKind: DeploymentKind;
  explicitSiteUrl?: string;
  productionSiteUrl: string;
  localSiteUrl: string;
  branchName?: string;
  previewSiteBaseDomain?: string;
}): string {
  if (input.explicitSiteUrl) {
    return input.explicitSiteUrl;
  }

  if (input.deploymentKind === "production") {
    return input.productionSiteUrl;
  }

  if (input.deploymentKind === "local") {
    return input.localSiteUrl;
  }

  if (input.branchName && input.previewSiteBaseDomain) {
    return buildPreviewSiteUrl(input.branchName, input.previewSiteBaseDomain);
  }

  throw new Error(
    "Preview deployments require SITE_URL or both BRANCH_NAME and PREVIEW_SITE_BASE_DOMAIN.",
  );
}

export function resolveDeploymentConfig(input: DeploymentConfigInput = {}): DeploymentConfig {
  const productionSiteUrl = normalizeSiteUrl(
    input.productionSiteUrl ?? DEFAULT_PRODUCTION_SITE_URL,
  );
  const localSiteUrl = normalizeSiteUrl(input.localSiteUrl ?? DEFAULT_LOCAL_SITE_URL);
  const branchName = normalizeOptionalBranchName(input.branchName);
  const previewSiteBaseDomain = normalizeOptionalBaseDomain(input.previewSiteBaseDomain);
  const explicitSiteUrl = normalizeOptionalSiteUrl(input.siteUrl);
  const explicitDeploymentKind = normalizeDeploymentKind(input.deploymentKind);
  const deploymentKind = inferDeploymentKind({
    explicitDeploymentKind,
    nodeEnv: input.nodeEnv,
    siteUrl: explicitSiteUrl,
    productionSiteUrl,
    localSiteUrl,
  });
  const siteUrl = getSiteUrlForKind({
    deploymentKind,
    explicitSiteUrl,
    productionSiteUrl,
    localSiteUrl,
    branchName,
    previewSiteBaseDomain,
  });
  const branchLabel = branchName ? sanitizeBranchLabel(branchName) : undefined;
  const host = new URL(siteUrl).host;
  const isProduction = deploymentKind === "production";

  return {
    deploymentKind,
    siteUrl,
    host,
    branchName,
    branchLabel,
    previewSiteBaseDomain,
    productionSiteUrl,
    localSiteUrl,
    isProduction,
    isPreview: deploymentKind === "preview",
    isLocal: deploymentKind === "local",
    shouldIndex: isProduction,
    shouldLoadTrackingScripts: isProduction,
    robotsMetaContent: isProduction ? "index,follow,max-image-preview:large" : "noindex,nofollow",
    googleBotContent: isProduction
      ? "index,follow,max-image-preview:large"
      : "noindex,nofollow,noarchive",
  };
}
