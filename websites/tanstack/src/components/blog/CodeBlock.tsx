import { useState, useCallback } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";

SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("docker", docker);
SyntaxHighlighter.registerLanguage("markup", markup);

const FEEDBACK_MS = 2500;

interface CodeBlockProps {
  code: string;
  language?: string;
}

function normalizeLanguage(language?: string): string | undefined {
  if (!language) return "typescript";

  const normalized = language.trim().toLowerCase();

  if (normalized === "ts") return "typescript";
  if (normalized === "js") return "javascript";
  if (normalized === "shell" || normalized === "sh" || normalized === "zsh") {
    return "bash";
  }
  if (normalized === "yml") return "yaml";
  if (normalized === "dockerfile") return "docker";
  if (normalized === "html") return "markup";
  if (
    normalized === "plain" ||
    normalized === "text" ||
    normalized === "txt" ||
    normalized === "mermaid" ||
    normalized === "terraform" ||
    normalized === "hcl"
  ) {
    return undefined;
  }

  return normalized;
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const normalizedLanguage = normalizeLanguage(language);

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
          aria-label="Copy code block"
          className="px-2 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={normalizedLanguage}
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
