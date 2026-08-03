import { describe, expect, it } from "vite-plus/test";
import {
  parseBlogMarkdown,
  resolveBlogImageSrc,
  resolveFenceLanguage,
  stripSiteBaseurl,
  tocHeadingsFromDocument,
} from "./blog-markdown";

describe("blog-markdown", () => {
  it("strips legacy site.baseurl tokens", () => {
    expect(stripSiteBaseurl("see {{ site.baseurl }}/x and {{site.baseurl}}/y")).toBe(
      "see /x and /y",
    );
  });

  it("rewrites relative blog image paths and leaves absolute ones alone", () => {
    expect(resolveBlogImageSrc("./diagram.png", "my-post")).toBe(
      "/content/blog/my-post/diagram.png",
    );
    expect(resolveBlogImageSrc("/content/blog/my-post/diagram.png", "my-post")).toBe(
      "/content/blog/my-post/diagram.png",
    );
    expect(resolveBlogImageSrc("https://example.com/a.png", "my-post")).toBe(
      "https://example.com/a.png",
    );
  });

  it("defaults unlabeled/plaintext fences to typescript, keeps explicit plain", () => {
    expect(resolveFenceLanguage(undefined)).toBe("typescript");
    expect(resolveFenceLanguage("plaintext")).toBe("typescript");
    expect(resolveFenceLanguage("plain")).toBe("plain");
    expect(resolveFenceLanguage("bash")).toBe("bash");
    expect(resolveFenceLanguage(undefined, "language-yaml")).toBe("yaml");
  });

  it("collects h2/h3 headings with stable ids for TOC", () => {
    const document = parseBlogMarkdown(`## First Section

### Nested

## Second Section
`);
    expect(tocHeadingsFromDocument(document)).toEqual([
      { id: "first-section", text: "First Section", level: 2 },
      { id: "nested", text: "Nested", level: 3 },
      { id: "second-section", text: "Second Section", level: 2 },
    ]);
  });

  it("parses details wrappers so nested fences stay children", () => {
    const document = parseBlogMarkdown(`<details>
<summary>Show me</summary>

\`\`\`typescript
const x = 1
\`\`\`

</details>
`);
    expect(document.children).toHaveLength(1);
    const details = document.children[0];
    expect(details).toMatchObject({
      type: "component",
      name: "details",
      tagName: "details",
      properties: { "data-summary": "Show me" },
    });
    if (details?.type !== "component") {
      throw new Error("expected details component");
    }
    expect(details.children).toEqual([
      expect.objectContaining({ type: "code", lang: "typescript", value: "const x = 1" }),
    ]);
  });

  it("parses markdown images as image nodes for src rewriting", () => {
    const document = parseBlogMarkdown("![alt text](./shot.png)");
    expect(document.children).toEqual([
      {
        type: "paragraph",
        children: [{ type: "image", src: "./shot.png", alt: "alt text" }],
      },
    ]);
  });
});
