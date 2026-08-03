import { describe, expect, it } from "vite-plus/test";
import { createHighlightedCodeBlockProps } from "@tanstack/highlight/react";
import { highlighter, normalizeHighlightLang } from "../lib/highlight";

describe("normalizeHighlightLang", () => {
  it("defaults unlabeled fences to typescript", () => {
    expect(normalizeHighlightLang()).toBe("typescript");
    expect(normalizeHighlightLang(undefined)).toBe("typescript");
  });

  it("maps plain to plaintext", () => {
    expect(normalizeHighlightLang("plain")).toBe("plaintext");
  });

  it("passes through known fence tags", () => {
    expect(normalizeHighlightLang("bash")).toBe("bash");
    expect(normalizeHighlightLang("typescript")).toBe("typescript");
  });
});

describe("blog highlighter", () => {
  it("highlights typescript and exposes copyText", () => {
    const { copyText, htmlMarkup } = createHighlightedCodeBlockProps({
      highlighter,
      code: "const answer = 42\n",
      lang: normalizeHighlightLang("typescript"),
    });

    expect(copyText).toBe("const answer = 42");
    expect(htmlMarkup).toContain("th-");
    expect(htmlMarkup).toContain("answer");
  });

  it("falls back for terraform without throwing", () => {
    const { htmlMarkup } = createHighlightedCodeBlockProps({
      highlighter,
      code: 'resource "aws_s3_bucket" "b" {}',
      lang: normalizeHighlightLang("terraform"),
    });

    expect(htmlMarkup).toContain("aws_s3_bucket");
  });
});
