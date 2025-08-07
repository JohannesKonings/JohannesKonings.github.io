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
    cover_image: z.string().nullable().optional(),
  }),
  transform: (data) => {
    const readingStats = calculateReadingTime(data.content);
    const excerpt = generateExcerpt(data.content);

    // For now, we'll generate slug from title, we'll fix this later when we understand the context structure
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Process cover_image path - convert relative paths to importable paths
    let processedCoverImage = data.cover_image;
    if (data.cover_image && data.cover_image.startsWith("./")) {
      // Extract directory name from the file path (assuming posts are in directories like "2025-06-18-title/")
      const filePathParts = data._meta.filePath.split("/");
      const directoryName = filePathParts[filePathParts.length - 2]; // Get the parent directory name
      const fileName = data.cover_image.replace("./", "");
      // Create a path that can be imported by Vite - this will be processed as a static asset
      processedCoverImage = `/content/blog/${directoryName}/${fileName}`;
    }

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

export default defineConfig({
  collections: [posts],
});
