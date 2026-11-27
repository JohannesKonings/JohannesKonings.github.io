import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { inspectPost } from "./checkSeo";

function writePost(slug: string, indexMd: string): string {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "seo-"));
  const directory = path.join(parent, slug);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.md"), indexMd);
  return directory;
}

function messagesOf(directory: string, severity: "error" | "warning"): string[] {
  return inspectPost(directory)
    .issues.filter((item) => item.severity === severity)
    .map((item) => item.message);
}

const goodTitle = "Release Drafter for automatic release notes on GitHub";
const goodSummary =
  "Release Drafter builds the next release notes from merged pull requests, so a tagged release ships with a changelog that is already written.";

function goodPost(body: string): string {
  return `---
title: ${goodTitle}
summary: "${goodSummary}"
---

${body}
`;
}

const goodBody = `## Introduction

Release Drafter builds release notes from merged pull requests. This builds on the
[earlier notes post](/notes/release-drafter) and the
[feature stacks post](/blog/2023-12-16-cdk-notifier-feature-stacks).

![A diagram of the release flow](./flow.svg)

### A subsection

More text.
`;

void test("a well-formed post has no errors and no warnings", () => {
  const directory = writePost("2026-01-01-release-drafter-release-notes", goodPost(goodBody));
  assert.deepEqual(inspectPost(directory).issues, []);
});

void test("a body h1 is an error because the title already renders as the page h1", () => {
  const directory = writePost(
    "2026-01-01-release-drafter-release-notes",
    goodPost("# Section one\n\n## Section two\n\n[note](/notes/x)\n"),
  );
  const errors = messagesOf(directory, "error");
  assert.ok(errors.some((message) => message.includes("<h1>")));
});

void test("missing title and summary are errors", () => {
  const directory = writePost(
    "2026-01-01-release-drafter-release-notes",
    `---\nlayout: post\n---\n\n## A\n\n[note](/notes/x)\n`,
  );
  const errors = messagesOf(directory, "error");
  assert.ok(errors.some((message) => message.includes("title")));
  assert.ok(errors.some((message) => message.includes("summary")));
});

void test("a short title and short summary warn", () => {
  const directory = writePost(
    "2026-01-01-short",
    `---\ntitle: Short title\nsummary: Too short.\n---\n\n## A\n\n[note](/notes/x)\n`,
  );
  const warnings = messagesOf(directory, "warning");
  assert.ok(warnings.some((message) => message.includes("title is")));
  assert.ok(warnings.some((message) => message.includes("meta description")));
});

void test("skipped heading levels and a missing h2 warn", () => {
  const directory = writePost(
    "2026-01-01-release-drafter-release-notes",
    goodPost("### Straight to h3\n\n[note](/notes/x)\n"),
  );
  const warnings = messagesOf(directory, "warning");
  assert.ok(warnings.some((message) => message.includes("jumps from h1 to h3")));
  assert.ok(warnings.some((message) => message.includes("no ## (h2)")));
});

void test("a missing internal link warns", () => {
  const directory = writePost(
    "2026-01-01-release-drafter-release-notes",
    goodPost("## Only external\n\n[TanStack](https://tanstack.com) and some text.\n"),
  );
  const warnings = messagesOf(directory, "warning");
  assert.ok(warnings.some((message) => message.includes("internal link")));
});

void test("a johanneskonings.dev absolute link counts as internal", () => {
  const directory = writePost(
    "2026-01-01-release-drafter-release-notes",
    goodPost(
      "## Section\n\nSee [the post](https://johanneskonings.dev/blog/2025-11-30-tanstack-start-aws-serverless/).\n",
    ),
  );
  assert.ok(!messagesOf(directory, "warning").some((message) => message.includes("internal link")));
});

void test("an image without alt text warns but a code fence hash is not a heading", () => {
  const directory = writePost(
    "2026-01-01-release-drafter-release-notes",
    goodPost(
      "## Section\n\n![](./no-alt.png)\n\n[note](/notes/x)\n\n```bash\n# this is a comment, not a heading\n```\n",
    ),
  );
  const warnings = messagesOf(directory, "warning");
  assert.ok(warnings.some((message) => message.includes("empty alt text")));
  assert.deepEqual(messagesOf(directory, "error"), []);
});

void test("the optional primary keyword must appear in title, summary and first paragraph", () => {
  const missing = writePost(
    "2026-01-01-release-drafter-release-notes",
    `---
title: A title about automated notes
summary: "A description about automated release notes that is comfortably within the length window for a snippet."
keywords:
  - Release Drafter
  - changelog
---

## Section

A first paragraph that never says the magic words. [note](/notes/x)
`,
  );
  const warnings = messagesOf(missing, "warning");
  assert.ok(warnings.some((message) => message.includes("not in the title")));
  assert.ok(warnings.some((message) => message.includes("not in the first paragraph")));

  const present = writePost(
    "2026-01-01-release-drafter-release-notes",
    goodPost(goodBody).replace("---\n\n", "keywords: [Release Drafter]\n---\n\n"),
  );
  assert.ok(!messagesOf(present, "warning").some((message) => message.includes("keyword")));
});

void test("an odd slug warns", () => {
  const directory = writePost("not-a-dated-slug", goodPost(goodBody));
  assert.ok(messagesOf(directory, "warning").some((message) => message.includes("slug")));
});
