import fs from "node:fs";
import path from "node:path";

export interface TanstackContentAudit {
  publishedPostCount: number;
  tagCount: number;
  categoryCount: number;
  seriesCount: number;
}

interface ParsedFrontmatter {
  published: boolean;
  tags: string[];
  categories: string[];
  series?: string;
}

function getFrontmatterBlock(content: string) {
  return content.match(/^---\s*([\s\S]*?)\s*---/)?.[1] ?? "";
}

function parseScalarField(block: string, field: string) {
  for (const line of block.split("\n")) {
    const trimmedLine = line.trim();
    if (!trimmedLine.startsWith(`${field}:`)) {
      continue;
    }

    const value = trimmedLine.slice(field.length + 1).trim();
    if (!value.length) {
      return undefined;
    }

    return value.replace(/^['"]|['"]$/g, "");
  }

  return undefined;
}

function parseListField(block: string, field: string): string[] {
  const inlineMatch = block.match(new RegExp(`^${field}:\\s*\\[(.*)\\]\\s*$`, "m"))?.[1];
  if (inlineMatch !== undefined) {
    return inlineMatch
      .split(",")
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }

  const scalarValue = parseScalarField(block, field);
  if (scalarValue && !scalarValue.startsWith("[")) {
    return [scalarValue];
  }

  const listMatch = block.match(new RegExp(`^${field}:\\s*$\\n((?:\\s+-\\s*.+\\n?)*)`, "m"))?.[1];
  if (!listMatch) {
    return [];
  }

  return listMatch
    .split("\n")
    .map((line) => line.match(/^\s*-\s*(.+)$/)?.[1]?.trim())
    .filter((value): value is string => Boolean(value))
    .map((value) => value.replace(/^['"]|['"]$/g, ""));
}

function parseFrontmatter(content: string): ParsedFrontmatter {
  const block = getFrontmatterBlock(content);
  return {
    published: block.match(/^published:\s*(true|false)\s*$/m)?.[1] === "true",
    tags: parseListField(block, "tags"),
    categories: parseListField(block, "categories"),
    series: parseScalarField(block, "series"),
  };
}

function collectMarkdownFiles(directory: string) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      const indexPath = path.join(directory, entry.name, "index.md");
      return fs.existsSync(indexPath) ? [indexPath] : [];
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      return [path.join(directory, entry.name)];
    }

    return [];
  });
}

export function auditTanstackBlogContent(contentBlogDir: string): TanstackContentAudit {
  const tags = new Set<string>();
  const categories = new Set<string>();
  const series = new Set<string>();
  let publishedPostCount = 0;

  for (const filePath of collectMarkdownFiles(contentBlogDir)) {
    const content = fs.readFileSync(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter.published) {
      continue;
    }

    publishedPostCount += 1;
    frontmatter.tags.forEach((tag) => tags.add(tag));
    frontmatter.categories.forEach((category) => categories.add(category));
    if (frontmatter.series) {
      series.add(frontmatter.series);
    }
  }

  return {
    publishedPostCount,
    tagCount: tags.size,
    categoryCount: categories.size,
    seriesCount: series.size,
  };
}
