import { isValidElement, type ReactNode } from "react";
import {
  Markdown,
  type MarkdownComponentProps,
  type MarkdownComponents,
} from "@tanstack/markdown/react";
import type { MarkdownDocument } from "@tanstack/markdown";
import { CodeBlock } from "./CodeBlock";
import {
  blogMarkdownParseOptions,
  resolveBlogImageSrc,
  resolveFenceLanguage,
} from "../../lib/blog-markdown";

function getTextContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map((item) => getTextContent(item)).join("");
  if (isValidElement<{ children?: unknown }>(value)) {
    return getTextContent(value.props.children);
  }
  return "";
}

function readDataAttr(props: object, name: string): string | undefined {
  const value = (props as Record<string, unknown>)[name];
  return typeof value === "string" ? value : undefined;
}

function PreCodeBlock({ children, ...props }: MarkdownComponentProps<"pre">) {
  const dataLang = readDataAttr(props, "data-lang");
  const child = Array.isArray(children) ? children[0] : children;

  if (
    child &&
    typeof child === "object" &&
    isValidElement<{ className?: string; children?: unknown }>(child)
  ) {
    const language = resolveFenceLanguage(dataLang, child.props.className);
    const code = getTextContent(child.props.children);
    return <CodeBlock code={code} language={language} />;
  }

  const language = resolveFenceLanguage(dataLang, props.className);
  return <CodeBlock code={getTextContent(children)} language={language} />;
}

function InlineCode({ children, className, ...props }: MarkdownComponentProps<"code">) {
  if (className?.includes("language-")) {
    const language = resolveFenceLanguage(undefined, className);
    return <CodeBlock code={getTextContent(children)} language={language} />;
  }

  return (
    <code {...props} className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
      {children}
    </code>
  );
}

function Details({ children, ...props }: MarkdownComponentProps<"details">) {
  const summary = readDataAttr(props, "data-summary") || "Details";

  return (
    <details className="my-4 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-200">
        {summary}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

export function createBlogMarkdownComponents(options?: { imageSlug?: string }): MarkdownComponents {
  return {
    pre: PreCodeBlock,
    code: InlineCode,
    details: Details,
    img: ({ src, alt, ...props }) => (
      <img
        {...props}
        src={options?.imageSlug ? resolveBlogImageSrc(src, options.imageSlug) : src}
        alt={alt}
        className="max-w-full h-auto rounded-lg shadow-md mx-auto"
        loading="lazy"
      />
    ),
  };
}

interface BlogMarkdownProps {
  document: MarkdownDocument;
  imageSlug?: string;
}

/** Renders a pre-parsed blog/notes document with must-keep overrides. */
export function BlogMarkdown({ document, imageSlug }: BlogMarkdownProps): ReactNode {
  return (
    <Markdown
      allowHtml={blogMarkdownParseOptions.allowHtml}
      extensions={blogMarkdownParseOptions.extensions}
      components={createBlogMarkdownComponents({ imageSlug })}
    >
      {document}
    </Markdown>
  );
}
