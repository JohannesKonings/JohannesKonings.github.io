import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { findUnpublishedAssets, inspectPost } from "./checkCrossPostAssets";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const POST_SLUG = "2026-10-12-drizzle-aurora-migrations";

function pngBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let index = 0; index < signature.length; index += 1) {
    buffer[index] = signature[index] ?? 0;
  }
  buffer.write("IHDR", 12);
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

function jpegBuffer(width: number, height: number): Buffer {
  const payload = Buffer.alloc(6);
  payload[0] = 8;
  payload.writeUInt16BE(height, 1);
  payload.writeUInt16BE(width, 3);
  payload[5] = 1;
  return Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x08]),
    payload,
    Buffer.from([0xff, 0xd9]),
  ]);
}

function webpBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(30);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(22, 4);
  buffer.write("WEBP", 8);
  buffer.write("VP8X", 12);
  buffer.writeUInt32LE(10, 16);
  const storedWidth = width - 1;
  const storedHeight = height - 1;
  buffer[24] = storedWidth & 0xff;
  buffer[25] = (storedWidth >> 8) & 0xff;
  buffer[26] = (storedWidth >> 16) & 0xff;
  buffer[27] = storedHeight & 0xff;
  buffer[28] = (storedHeight >> 8) & 0xff;
  buffer[29] = (storedHeight >> 16) & 0xff;
  return buffer;
}

function writePost(directory: string, files: Record<string, string | Buffer>): void {
  fs.mkdirSync(directory, { recursive: true });
  for (const [fileName, contents] of Object.entries(files)) {
    fs.writeFileSync(path.join(directory, fileName), contents);
  }
}

const indexMd = `---
title: Example
cover_image: ./cover-image.png
tags:
  - one
  - two
  - three
  - four
---

![diagram](./diagram.svg)
`;

function errorsOf(directory: string): string[] {
  return inspectPost(directory)
    .issues.filter((item) => item.severity === "error")
    .map((item) => item.message);
}

void test("a post with a dev.to cover, Builder Center cover, and SVG fallback passes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-"));
  writePost(directory, {
    "index.md": indexMd,
    "cover-image.png": pngBuffer(1000, 420),
    "cover-builder-1200x675.png": pngBuffer(1200, 675),
    "diagram.svg": "<svg xmlns='http://www.w3.org/2000/svg'/>",
    "diagram.png": pngBuffer(1600, 900),
  });

  assert.deepEqual(inspectPost(directory).issues, []);
});

void test("jpg and webp Builder Center covers are accepted at 1200x675", () => {
  for (const [fileName, contents] of [
    ["cover-builder-1200x675.jpg", jpegBuffer(1200, 675)],
    ["cover-builder-1200x675.webp", webpBuffer(1200, 675)],
  ] as const) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-"));
    writePost(directory, {
      "index.md": indexMd,
      "cover-image.png": pngBuffer(1000, 420),
      [fileName]: contents,
    });
    assert.deepEqual(errorsOf(directory), []);
  }
});

void test("missing SVG fallback, Builder Center cover, and an SVG cover are errors", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-"));
  writePost(directory, {
    "index.md": indexMd.replace("./cover-image.png", "./cover-image.svg"),
    "cover-image.svg": "<svg xmlns='http://www.w3.org/2000/svg'/>",
    "diagram.svg": "<svg xmlns='http://www.w3.org/2000/svg'/>",
  });

  const errors = errorsOf(directory);
  assert.ok(errors.some((message) => message.includes("SVG")));
  assert.ok(errors.some((message) => message.includes("cover-builder-1200x675.png")));
  assert.ok(errors.some((message) => message.includes("diagram.png")));
});

void test("a Builder Center cover with the wrong size or over 2 MB fails", () => {
  const wrongSize = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-"));
  writePost(wrongSize, {
    "index.md": indexMd,
    "cover-image.png": pngBuffer(1000, 420),
    "cover-builder-1200x675.png": pngBuffer(1000, 420),
  });
  assert.ok(errorsOf(wrongSize).some((message) => message.includes("1200x675")));

  const tooLarge = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-"));
  writePost(tooLarge, {
    "index.md": indexMd,
    "cover-image.png": pngBuffer(1000, 420),
    "cover-builder-1200x675.png": Buffer.concat([
      pngBuffer(1200, 675),
      Buffer.alloc(2 * 1024 * 1024),
    ]),
  });
  assert.ok(errorsOf(tooLarge).some((message) => message.includes("2 MB")));
});

void test("more than four tags warns and does not fail the asset check", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-"));
  writePost(directory, {
    "index.md": indexMd.replace("  - four\n", "  - four\n  - five\n"),
    "cover-image.png": pngBuffer(1000, 420),
    "cover-builder-1200x675.png": pngBuffer(1200, 675),
  });

  const report = inspectPost(directory);
  assert.deepEqual(
    report.issues.filter((item) => item.severity === "error"),
    [],
  );
  assert.equal(report.issues.length, 1);
  assert.match(report.issues[0]?.message ?? "", /at most 4/);
});

void test("a non-1000x420 dev.to cover warns", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-"));
  writePost(directory, {
    "index.md": indexMd,
    "cover-image.png": pngBuffer(800, 400),
    "cover-builder-1200x675.png": pngBuffer(1200, 675),
  });
  const warnings = inspectPost(directory).issues.filter((item) => item.severity === "warning");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0]?.message ?? "", /1000x420/);
});

void test("unpublished assets are the source files missing from the public copy", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-src-"));
  const published = fs.mkdtempSync(path.join(os.tmpdir(), "cross-post-pub-"));
  writePost(source, {
    "index.md": indexMd,
    "cover-image.png": pngBuffer(1000, 420),
    "diagram.png": pngBuffer(1600, 900),
  });
  writePost(published, {
    "index.md": "rewritten markdown",
    "cover-image.png": pngBuffer(1000, 420),
  });

  assert.deepEqual(findUnpublishedAssets(source, published), ["diagram.png"]);
});

void test("the Aurora migrations post has its cross-post assets", () => {
  const report = inspectPost(path.join(ROOT, "_posts", POST_SLUG));
  assert.deepEqual(
    report.issues.filter((item) => item.severity === "error"),
    [],
  );
  assert.ok(report.issues.some((item) => item.message.includes("at most 4")));
});
