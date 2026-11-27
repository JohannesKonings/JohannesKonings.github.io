import { describe, expect, it } from "vite-plus/test";
import { siteConfig, toAbsoluteUrl, toCanonicalPath, toCanonicalUrl } from "./site";

describe("toCanonicalPath", () => {
  it("keeps file-output index routes without a trailing slash", () => {
    expect(toCanonicalPath("/")).toBe("/");
    expect(toCanonicalPath("/blog")).toBe("/blog");
    expect(toCanonicalPath("/notes")).toBe("/notes");
    expect(toCanonicalPath("/search")).toBe("/search");
  });

  it("adds a trailing slash to subfolder-index content routes", () => {
    expect(toCanonicalPath("/blog/2025-11-30-tanstack-start-aws-serverless")).toBe(
      "/blog/2025-11-30-tanstack-start-aws-serverless/",
    );
    expect(toCanonicalPath("/notes/2024-07-30-git")).toBe("/notes/2024-07-30-git/");
    expect(toCanonicalPath("/blog/tag/aws")).toBe("/blog/tag/aws/");
  });

  it("is idempotent when a trailing slash is already present", () => {
    expect(toCanonicalPath("/blog/some-post/")).toBe("/blog/some-post/");
  });

  it("does not append a slash before a query string or hash", () => {
    expect(toCanonicalPath("/blog/some-post?ref=x")).toBe("/blog/some-post/?ref=x");
    expect(toCanonicalPath("/blog#top")).toBe("/blog#top");
  });
});

describe("toCanonicalUrl", () => {
  it("returns the bare origin for the homepage", () => {
    expect(toCanonicalUrl("/")).toBe(siteConfig.baseUrl);
  });

  it("builds absolute, non-redirecting URLs for content pages", () => {
    expect(toCanonicalUrl("/blog/2025-11-30-tanstack-start-aws-serverless")).toBe(
      `${siteConfig.baseUrl}/blog/2025-11-30-tanstack-start-aws-serverless/`,
    );
    expect(toCanonicalUrl("/blog")).toBe(`${siteConfig.baseUrl}/blog`);
  });

  it("passes absolute URLs through unchanged", () => {
    expect(toCanonicalUrl("https://example.com/foo")).toBe("https://example.com/foo");
  });

  it("differs from toAbsoluteUrl only by the canonical trailing slash", () => {
    const path = "/notes/2024-07-30-git";
    expect(toAbsoluteUrl(path)).toBe(`${siteConfig.baseUrl}${path}`);
    expect(toCanonicalUrl(path)).toBe(`${siteConfig.baseUrl}${path}/`);
  });
});
