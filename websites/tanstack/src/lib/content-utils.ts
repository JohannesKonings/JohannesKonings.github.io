import { allPosts } from "content-collections";

// Get all unique tags from published posts
export function getAllTags(): string[] {
  const tags = new Set<string>();
  allPosts
    .filter((post) => post.published)
    .forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

// Get all unique categories from published posts
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  allPosts
    .filter((post) => post.published)
    .forEach((post) => post.categories.forEach((cat) => categories.add(cat)));
  return Array.from(categories).sort();
}

// Get posts by tag
export function getPostsByTag(tag: string) {
  return allPosts
    .filter((post) => post.published && post.tags.includes(tag))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Get posts by category
export function getPostsByCategory(category: string) {
  return allPosts
    .filter((post) => post.published && post.categories.includes(category))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Get related posts based on tags and categories
export function getRelatedPosts(currentPost: (typeof allPosts)[0], limit = 3) {
  const relatedPosts = allPosts
    .filter((post) => {
      if (!post.published || post.slug === currentPost.slug) return false;

      // Check for common tags or categories
      const hasCommonTag = post.tags.some((tag) =>
        currentPost.tags.includes(tag),
      );
      const hasCommonCategory = post.categories.some((cat) =>
        currentPost.categories.includes(cat),
      );

      return hasCommonTag || hasCommonCategory;
    })
    .sort((a, b) => {
      // Score based on common tags and categories
      const aScore =
        a.tags.filter((tag) => currentPost.tags.includes(tag)).length +
        a.categories.filter((cat) => currentPost.categories.includes(cat))
          .length;
      const bScore =
        b.tags.filter((tag) => currentPost.tags.includes(tag)).length +
        b.categories.filter((cat) => currentPost.categories.includes(cat))
          .length;

      if (aScore !== bScore) return bScore - aScore;

      // If scores are equal, sort by date
      return b.date.getTime() - a.date.getTime();
    })
    .slice(0, limit);

  return relatedPosts;
}

// Get recent posts
export function getRecentPosts(limit = 5) {
  return allPosts
    .filter((post) => post.published)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

// Search posts
export function searchPosts(query: string) {
  const lowerQuery = query.toLowerCase();
  return allPosts
    .filter((post) => {
      if (!post.published) return false;

      return (
        post.title.toLowerCase().includes(lowerQuery) ||
        post.summary.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        post.categories.some((cat) => cat.toLowerCase().includes(lowerQuery))
      );
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Get post statistics
export function getPostStats() {
  const publishedPosts = allPosts.filter((post) => post.published);
  const totalWords = publishedPosts.reduce(
    (acc, post) => acc + post.readingTime.words,
    0,
  );
  const totalMinutes = publishedPosts.reduce(
    (acc, post) => acc + post.readingTime.minutes,
    0,
  );

  return {
    totalPosts: publishedPosts.length,
    totalWords,
    totalReadingTime: totalMinutes,
    averageWordsPerPost: Math.round(totalWords / publishedPosts.length),
    averageReadingTime: Math.round(totalMinutes / publishedPosts.length),
    tags: getAllTags().length,
    categories: getAllCategories().length,
  };
}
