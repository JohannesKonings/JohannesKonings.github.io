import { createHighlighter } from "@tanstack/highlight/core";
import { css } from "@tanstack/highlight/languages/css";
import { dockerfile } from "@tanstack/highlight/languages/dockerfile";
import { html } from "@tanstack/highlight/languages/html";
import { js } from "@tanstack/highlight/languages/js";
import { json } from "@tanstack/highlight/languages/json";
import { mermaid } from "@tanstack/highlight/languages/mermaid";
import { plaintext } from "@tanstack/highlight/languages/plaintext";
import { shell } from "@tanstack/highlight/languages/shell";
import { sql } from "@tanstack/highlight/languages/sql";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";
import { yaml } from "@tanstack/highlight/languages/yaml";

/**
 * Shared isomorphic highlighter for blog/notes code fences.
 * Register languages seen in `_posts` / `_notes` (terraform falls back to plaintext).
 */
export const highlighter = createHighlighter({
  languages: [css, dockerfile, html, js, json, mermaid, plaintext, shell, sql, ts, tsx, yaml],
});

/** Map fence tags that aren't shipped aliases onto registered languages. */
export function normalizeHighlightLang(language?: string): string {
  if (!language) return "typescript";
  switch (language) {
    case "plain":
      return "plaintext";
    default:
      return language;
  }
}
