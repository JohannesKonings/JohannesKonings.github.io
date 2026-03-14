import { describe, expect, it } from "vite-plus/test";
import {
  normalizeCanonicalPath,
  toAbsoluteUrl,
  toBlogArchivePath,
  toBlogPostPath,
  withTrailingSlash,
} from "./site";

describe("site blog URL helpers", () => {
  it("normalizes nested blog detail and archive paths to trailing-slash canonicals", () => {
    expect(toBlogPostPath("my-post")).toBe("/blog/my-post/");
    expect(toBlogArchivePath("tag", "aws")).toBe("/blog/tag/aws/");
    expect(toBlogArchivePath("category", "aws cdk")).toBe("/blog/category/aws%20cdk/");
    expect(toBlogArchivePath("series", "tanstack-start")).toBe("/blog/series/tanstack-start/");
  });

  it("keeps flat top-level routes stable while normalizing nested blog paths", () => {
    expect(normalizeCanonicalPath("/")).toBe("/");
    expect(normalizeCanonicalPath("/blog")).toBe("/blog");
    expect(normalizeCanonicalPath("/search")).toBe("/search");
    expect(normalizeCanonicalPath("/blog/my-post")).toBe("/blog/my-post/");
    expect(normalizeCanonicalPath("/blog/tag/aws")).toBe("/blog/tag/aws/");
  });

  it("builds absolute URLs from the normalized canonical path", () => {
    expect(toAbsoluteUrl("/")).toBe("https://johanneskonings.dev");
    expect(toAbsoluteUrl("/blog")).toBe("https://johanneskonings.dev/blog");
    expect(toAbsoluteUrl("/blog/my-post")).toBe("https://johanneskonings.dev/blog/my-post/");
  });

  it("adds a trailing slash only when missing", () => {
    expect(withTrailingSlash("/blog/my-post")).toBe("/blog/my-post/");
    expect(withTrailingSlash("/blog/my-post/")).toBe("/blog/my-post/");
  });
});
