#!/usr/bin/env tsx
import fs from "node:fs";
import { resolveDeploymentConfig } from "../websites/tanstack/src/lib/deployment";

function appendGithubFile(filePath: string | undefined, key: string, value: string) {
  if (!filePath) {
    return;
  }

  fs.appendFileSync(filePath, `${key}=${value}\n`);
}

function main() {
  const deployment = resolveDeploymentConfig({
    deploymentKind: process.env.DEPLOYMENT_KIND,
    nodeEnv: process.env.NODE_ENV,
    siteUrl: process.env.SITE_URL,
    branchName: process.env.BRANCH_NAME ?? process.env.GITHUB_REF_NAME,
    previewSiteBaseDomain: process.env.PREVIEW_SITE_BASE_DOMAIN,
    productionSiteUrl: process.env.PRODUCTION_SITE_URL,
    localSiteUrl: process.env.LOCAL_SITE_URL,
  });

  const outputs = {
    "deployment-kind": deployment.deploymentKind,
    "site-url": deployment.siteUrl,
    host: deployment.host,
    "branch-label": deployment.branchLabel ?? "",
    "should-index": String(deployment.shouldIndex),
  };

  for (const [key, value] of Object.entries(outputs)) {
    console.log(`${key}=${value}`);
  }

  appendGithubFile(process.env.GITHUB_OUTPUT, "deployment-kind", outputs["deployment-kind"]);
  appendGithubFile(process.env.GITHUB_OUTPUT, "site-url", outputs["site-url"]);
  appendGithubFile(process.env.GITHUB_OUTPUT, "host", outputs.host);
  appendGithubFile(process.env.GITHUB_OUTPUT, "branch-label", outputs["branch-label"]);
  appendGithubFile(process.env.GITHUB_OUTPUT, "should-index", outputs["should-index"]);

  appendGithubFile(process.env.GITHUB_ENV, "DEPLOYMENT_KIND", outputs["deployment-kind"]);
  appendGithubFile(process.env.GITHUB_ENV, "SITE_URL", outputs["site-url"]);
  appendGithubFile(process.env.GITHUB_ENV, "VITE_DEPLOYMENT_KIND", outputs["deployment-kind"]);
  appendGithubFile(process.env.GITHUB_ENV, "VITE_SITE_URL", outputs["site-url"]);

  if (deployment.branchName) {
    appendGithubFile(process.env.GITHUB_ENV, "BRANCH_NAME", deployment.branchName);
    appendGithubFile(process.env.GITHUB_ENV, "VITE_BRANCH_NAME", deployment.branchName);
  }

  if (deployment.previewSiteBaseDomain) {
    appendGithubFile(
      process.env.GITHUB_ENV,
      "PREVIEW_SITE_BASE_DOMAIN",
      deployment.previewSiteBaseDomain,
    );
    appendGithubFile(
      process.env.GITHUB_ENV,
      "VITE_PREVIEW_SITE_BASE_DOMAIN",
      deployment.previewSiteBaseDomain,
    );
  }
}

main();
