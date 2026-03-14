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

// Blog posts collection
const posts = defineCollection({
  name: "posts",
  directory: "src/content/blog",
  include: "**/*.{md,mdx}",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    categories: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => (Array.isArray(val) ? val : [val]))
      .default([]),
    thumbnail: z.string().nullable().optional(),
    cover_image: z.string(),
    series: z.string().optional(),
    content: z.string(),
  }),
  transform: (data) => {
    const readingStats = calculateReadingTime(data.content);
    const excerpt = generateExcerpt(data.content);

    const filePathParts = data._meta.filePath.split("/");
    const fileName = filePathParts[filePathParts.length - 1] ?? "";
    const slug = filePathParts[filePathParts.length - 2] ?? "";

    if (filePathParts.length < 2 || fileName !== "index.md" || slug.length === 0) {
      throw new Error(
        `Blog posts must use the bundled structure src/content/blog/<slug>/index.md. Invalid file: ${data._meta.filePath}`,
      );
    }

    if (!data.cover_image.startsWith("./")) {
      throw new Error(
        `Blog post cover_image must be a local relative asset like ./cover-image.png. Invalid value for ${data._meta.filePath}: ${data.cover_image}`,
      );
    }

    // Process cover_image path - convert relative paths to importable paths
    const coverFileName = data.cover_image.replace("./", "");
    const processedCoverImage = `/content/blog/${slug}/${coverFileName}`;

    return {
      ...data,
      slug,
      readingTime: readingStats,
      excerpt,
      url: `/blog/${slug}`,
      cover_image: processedCoverImage,
    };
  },
});

// Notes collection - simpler schema for quick reference notes
const notes = defineCollection({
  name: "notes",
  directory: "src/content/notes",
  include: "**/*.md",
  schema: z.object({
    title: z.string(),
    summary: z.string().default(""),
    date: z.coerce.date(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    categories: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => (Array.isArray(val) ? val : [val]))
      .default([]),
    content: z.string(),
  }),
  transform: (data) => {
    const readingStats = calculateReadingTime(data.content);
    const excerpt = generateExcerpt(data.content);

    // Slug is the filename without extension (flat structure only)
    const fileName = data._meta.filePath.split("/").pop() ?? "";
    const slug = fileName.replace(/\.md$/i, "");

    return {
      ...data,
      slug,
      readingTime: readingStats,
      excerpt,
      url: `/notes/${slug}`,
    };
  },
});

export default defineConfig({
  content: [posts, notes],
});
