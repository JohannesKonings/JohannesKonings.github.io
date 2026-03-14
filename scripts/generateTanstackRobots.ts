/**
 * Generates robots.txt for the TanStack site at build time.
 * Production stays indexable. Preview and local deployments are noindex/no-crawl.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveDeploymentConfig } from "../websites/tanstack/src/lib/deployment";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_FILE = path.join(ROOT, "websites/tanstack/public/robots.txt");

function main() {
  const deployment = resolveDeploymentConfig({
    deploymentKind: process.env.DEPLOYMENT_KIND ?? "production",
    nodeEnv: process.env.NODE_ENV ?? "production",
    siteUrl: process.env.SITE_URL,
    branchName: process.env.BRANCH_NAME,
    previewSiteBaseDomain: process.env.PREVIEW_SITE_BASE_DOMAIN,
    productionSiteUrl: process.env.PRODUCTION_SITE_URL,
    localSiteUrl: process.env.LOCAL_SITE_URL,
  });

  const lines = ["User-agent: *"];

  if (deployment.shouldIndex) {
    lines.push("Allow: /");
  } else {
    lines.push("Disallow: /");
  }

  lines.push("", `Sitemap: ${deployment.siteUrl}/sitemap-index.xml`, "");

  const dir = path.dirname(OUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, `${lines.join("\n")}`);
  console.log(
    `Generated robots.txt for ${deployment.deploymentKind} deployment (${deployment.siteUrl})`,
  );
}

main();
