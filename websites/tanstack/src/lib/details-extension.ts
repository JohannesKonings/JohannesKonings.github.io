import type { MarkdownExtension } from "@tanstack/markdown";

/**
 * Parse `<details>` / `<summary>` wrappers that contain markdown (often fences).
 * Without this, allowHtml splits open/close tags around sibling code blocks and
 * breaks nesting for the four posts that use expand-to-show code.
 */
export const detailsExtension: MarkdownExtension = {
  name: "details",
  parseBlock(context) {
    const startLine = context.lines[context.index];
    if (!startLine || !/^\s*<details\b/i.test(startLine)) {
      return undefined;
    }

    let end = context.index;
    while (end < context.lines.length && !/<\/details>/i.test(context.lines[end] ?? "")) {
      end += 1;
    }
    if (end >= context.lines.length) {
      return undefined;
    }

    const blockLines = context.lines.slice(context.index, end + 1);
    context.consume(blockLines.length);

    const raw = blockLines.join("\n");
    const summaryMatch = raw.match(/<summary>([\s\S]*?)<\/summary>/i);
    const summary = (summaryMatch?.[1] ?? "Details").replace(/\s+/g, " ").trim();
    const inner = raw
      .replace(/^\s*<details[^>]*>\s*/i, "")
      .replace(/\s*<\/details>\s*$/i, "")
      .replace(/<summary>[\s\S]*?<\/summary>/i, "")
      .trim();

    return {
      type: "component",
      name: "details",
      tagName: "details",
      attributes: {},
      properties: { "data-summary": summary },
      children: inner ? context.parseBlocks(inner) : [],
    };
  },
};
