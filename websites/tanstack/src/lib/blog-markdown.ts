import { headingCollectionExtension } from "@tanstack/markdown/extensions/headings";
import { parseMarkdown } from "@tanstack/markdown/parser";
import type { MarkdownDocument, MarkdownHeading, ParseOptions } from "@tanstack/markdown";
import { detailsExtension } from "./details-extension";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

export const blogMarkdownParseOptions: ParseOptions = {
  allowHtml: true,
  // Headings for TOC IDs only — skip docsMarkdownExtensions (callouts/tabs) to keep
  // GitHub-style `> [!NOTE]` as ordinary blockquotes, matching prior markdown-to-jsx.
  extensions: [detailsExtension, headingCollectionExtension()],
};

/** Strip legacy Jekyll `{{ site.baseurl }}` tokens still present in older posts. */
export function stripSiteBaseurl(content: string): string {
  return content.replace(/\{\{\s*site\.baseurl\s*\}\}/g, "");
}

export function parseBlogMarkdown(source: string): MarkdownDocument {
  return parseMarkdown(source, blogMarkdownParseOptions);
}

/** TOC entries: h2–h3 only, matching the previous TableOfContents filter. */
export function tocHeadingsFromDocument(document: MarkdownDocument): MarkdownHeading[] {
  return (document.headings ?? []).filter((heading) => heading.level === 2 || heading.level === 3);
}

export function resolveBlogImageSrc(src: string | undefined, postSlug: string): string | undefined {
  if (!src) return src;

  if (
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    ABSOLUTE_URL_PATTERN.test(src)
  ) {
    return src;
  }

  const normalizedSrc = src.replace(/^\.\//, "");
  return `/content/blog/${postSlug}/${normalizedSrc}`;
}

/**
 * TanStack Markdown defaults unlabeled fences to `plaintext`; this blog historically
 * defaulted them to `typescript`. Explicit `plain` keeps plaintext highlighting.
 */
export function resolveFenceLanguage(dataLang?: string, className?: string): string {
  const fromClass = className?.match(/language-([\w-]+)/)?.[1];
  const lang = dataLang || fromClass;
  if (!lang || lang === "plaintext") return "typescript";
  return lang;
}
