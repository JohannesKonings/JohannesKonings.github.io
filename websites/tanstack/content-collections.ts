import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import readingTime from "reading-time";

// Utility functions for content transformation
function calculateReadingTime(content: string) {
  const stats = readingTime(content);
  return {
    text: stats.text,
    minutes: Math.ceil(stats.minutes),
    time: stats.time,
    words: stats.words,
  };
}

function generateExcerpt(content: string, maxLength = 200): string {
  // Remove frontmatter and markdown syntax for excerpt
  const cleanContent = content
    .replace(/---[\s\S]*?---/, "") // Remove frontmatter
    .replace(/#+\s/g, "") // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
    .replace(/\*([^*]+)\*/g, "$1") // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  return cleanContent.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

function getFileSlug(filePath: string): string {
  return filePath.replace(/\/index\.mdx?$/, "").replace(/\.mdx?$/, "");
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Array<{
    depth: number;
    text: string;
    slug: string;
  }> = [];

  for (const match of content.matchAll(headingRegex)) {
    const headingPrefix = match[1] ?? "";
    const rawHeadingText = match[2] ?? "";
    const headingText = rawHeadingText.trim();
    if (!headingText) {
      continue;
    }

    headings.push({
      depth: headingPrefix.length,
      text: headingText,
      slug: slugifyHeading(headingText),
    });
  }

  return headings;
}

function processRelativeMarkdownAssets(
  content: string,
  slug: string,
  contentGroup: "blog" | "notes",
) {
  return content.replace(
    /!\[([^\]]*)\]\((\.\/[^)]+\.(?:png|jpe?g|gif|svg|webp|avif))\)/gi,
    (_match, altText, relativePath) => {
      const fileName = relativePath.replace("./", "");
      return `![${altText}](/content/${contentGroup}/${slug}/${fileName})`;
    },
  );
}

const postsSchema = z.object({
  title: z.string(),
  summary: z.string().default(""),
  date: z.coerce.date(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  categories: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .default([]),
  thumbnail: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  content: z.string(),
});

const posts = defineCollection({
  name: "posts",
  directory: "src/content/blog",
  include: "**/*.{md,mdx}",
  schema: postsSchema,
  transform: (data) => {
    const readingStats = calculateReadingTime(data.content);
    const excerpt = generateExcerpt(data.content);
    const slug = getFileSlug(data._meta.filePath);
    const processedContent = processRelativeMarkdownAssets(
      data.content,
      slug,
      "blog",
    );
    const headings = extractHeadings(data.content);

    let processedCoverImage = data.cover_image;
    if (data.cover_image && data.cover_image.startsWith("./")) {
      processedCoverImage = `/content/blog/${slug}/${data.cover_image.replace("./", "")}`;
    }

    return {
      ...data,
      slug,
      readingTime: readingStats,
      excerpt,
      url: `/blog/${slug}`,
      renderedContent: processedContent,
      headings,
      cover_image: processedCoverImage,
    };
  },
});

const notesSchema = z.object({
  title: z.string(),
  summary: z.string().default(""),
  date: z.coerce.date(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().optional(),
  demoUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  content: z.string(),
});

const notes = defineCollection({
  name: "notes",
  directory: "src/content/notes",
  include: "**/*.{md,mdx}",
  schema: notesSchema,
  transform: (data) => {
    const slug = getFileSlug(data._meta.filePath);
    const readingStats = calculateReadingTime(data.content);
    const excerpt = generateExcerpt(data.content);
    const processedContent = processRelativeMarkdownAssets(
      data.content,
      slug,
      "notes",
    );
    const headings = extractHeadings(data.content);

    return {
      ...data,
      slug,
      readingTime: readingStats,
      excerpt,
      url: `/notes/${slug}`,
      renderedContent: processedContent,
      headings,
    };
  },
});

const legalDocsSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  content: z.string(),
});

const legalDocs = defineCollection({
  name: "legalDocs",
  directory: "src/content/legal",
  include: "**/*.{md,mdx}",
  schema: legalDocsSchema,
  transform: (data) => {
    const slug = getFileSlug(data._meta.filePath);
    return {
      ...data,
      slug,
      url: `/legal/${slug}`,
      renderedContent: data.content,
    };
  },
});

export default defineConfig({
  collections: [posts, notes, legalDocs],
});
