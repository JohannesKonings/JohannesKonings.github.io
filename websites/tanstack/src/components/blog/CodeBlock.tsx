import { useState, useCallback } from "react";
import { createHighlightedCodeBlockProps } from "@tanstack/highlight/react";
import { highlighter, normalizeHighlightLang } from "../../lib/highlight";

const FEEDBACK_MS = 2500;

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { copyText, htmlMarkup } = createHighlightedCodeBlockProps({
    highlighter,
    code,
    lang: normalizeHighlightLang(language),
  });

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), FEEDBACK_MS);
    } catch {
      // ignore
    }
  }, [copyText]);

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="absolute top-2 right-2 z-10">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code block"
          className="px-2 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div
        className="text-sm [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:p-4 [&_pre]:pr-16 [&_pre]:font-[CascadiaMonoNF,Cascadia_Code,monospace]"
        // htmlMarkup is escaped token HTML from TanStack Highlight only.
        dangerouslySetInnerHTML={{ __html: htmlMarkup }}
      />
    </div>
  );
}
