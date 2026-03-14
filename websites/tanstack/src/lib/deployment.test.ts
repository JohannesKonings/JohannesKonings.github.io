import { describe, expect, it } from "vite-plus/test";
import {
  DEFAULT_LOCAL_SITE_URL,
  DEFAULT_PRODUCTION_SITE_URL,
  buildPreviewSiteUrl,
  resolveDeploymentConfig,
  sanitizeBranchLabel,
} from "./deployment";

describe("deployment helpers", () => {
  it("sanitizes branch names into DNS-safe labels", () => {
    expect(sanitizeBranchLabel("cursor/Branch Deployments_and demos 9f94")).toBe(
      "cursor-branch-deployments-and-demos-9f94",
    );
  });

  it("adds a hash suffix when a branch label exceeds the DNS length limit", () => {
    const branchName = `feature/${"very-long-segment-".repeat(6)}preview`;
    const label = sanitizeBranchLabel(branchName);

    expect(label.length).toBeLessThanOrEqual(63);
    expect(label).toMatch(/-[a-z0-9]+$/);
  });

  it("builds a preview URL from the branch name and preview base domain", () => {
    expect(buildPreviewSiteUrl("fix/api", "blog-preview.pages.dev")).toBe(
      "https://fix-api.blog-preview.pages.dev",
    );
  });

  it("defaults to a local deployment when no production build context is provided", () => {
    const deployment = resolveDeploymentConfig();

    expect(deployment.deploymentKind).toBe("local");
    expect(deployment.siteUrl).toBe(DEFAULT_LOCAL_SITE_URL);
    expect(deployment.shouldIndex).toBe(false);
  });

  it("defaults to the production site URL in production builds", () => {
    const deployment = resolveDeploymentConfig({
      nodeEnv: "production",
    });

    expect(deployment.deploymentKind).toBe("production");
    expect(deployment.siteUrl).toBe(DEFAULT_PRODUCTION_SITE_URL);
    expect(deployment.shouldLoadTrackingScripts).toBe(true);
  });

  it("resolves explicit preview site URLs without re-deriving them", () => {
    const deployment = resolveDeploymentConfig({
      deploymentKind: "preview",
      siteUrl: "https://cursor-branch.example-previews.dev/",
      branchName: "cursor/branch",
    });

    expect(deployment.deploymentKind).toBe("preview");
    expect(deployment.siteUrl).toBe("https://cursor-branch.example-previews.dev");
    expect(deployment.branchLabel).toBe("cursor-branch");
  });

  it("derives preview site URLs from the branch label and preview base domain", () => {
    const deployment = resolveDeploymentConfig({
      deploymentKind: "preview",
      branchName: "cursor/branch-deployments-and-demos-9f94",
      previewSiteBaseDomain: "tanstack-preview.pages.dev",
    });

    expect(deployment.siteUrl).toBe(
      "https://cursor-branch-deployments-and-demos-9f94.tanstack-preview.pages.dev",
    );
    expect(deployment.shouldIndex).toBe(false);
  });

  it("throws when preview deployments are missing both SITE_URL and a preview base domain", () => {
    expect(() =>
      resolveDeploymentConfig({
        deploymentKind: "preview",
        branchName: "cursor/branch-deployments-and-demos-9f94",
      }),
    ).toThrow(
      /Preview deployments require SITE_URL or both BRANCH_NAME and PREVIEW_SITE_BASE_DOMAIN/,
    );
  });
});
