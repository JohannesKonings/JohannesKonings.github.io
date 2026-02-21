import { useState, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as styles from "react-syntax-highlighter/dist/cjs/styles/prism";

const oneDark = styles.oneDark || {};

const FEEDBACK_MS = 2500;

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "text" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), FEEDBACK_MS);
    } catch {
      // ignore
    }
  }, [code]);

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="absolute top-2 right-2 z-10">
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers={false}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem 1rem 1rem 0.75rem",
          fontSize: "0.875rem",
          background: "transparent",
          fontFamily: "CascadiaMonoNF, Cascadia Code, monospace",
        }}
        codeTagProps={{
          style: { fontFamily: "CascadiaMonoNF, Cascadia Code, monospace" },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
