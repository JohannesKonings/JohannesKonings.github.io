import { allLegalDocs, allNotes, allPosts } from "content-collections";

type Post = (typeof allPosts)[0];
type Note = (typeof allNotes)[0];
type ContentEntry = Post | Note;

function sortByDateDesc<T extends { date: Date }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
}

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
  return sortByDateDesc(
    allPosts.filter((post) => post.published && post.tags.includes(tag)),
  );
}

// Get all unique tags from published notes
export function getAllNoteTags(): string[] {
  const tags = new Set<string>();
  allNotes
    .filter((note) => note.published)
    .forEach((note) => note.tags.forEach((noteTag) => tags.add(noteTag)));
  return Array.from(tags).sort();
}

// Get notes by tag
export function getNotesByTag(tag: string) {
  return sortByDateDesc(
    allNotes.filter((note) => note.published && note.tags.includes(tag)),
  );
}

// Get posts by category
export function getPostsByCategory(category: string) {
  return sortByDateDesc(
    allPosts.filter(
      (post) => post.published && post.categories.includes(category),
    ),
  );
}

// Get all published notes
export function getPublishedNotes() {
  return sortByDateDesc(allNotes.filter((note) => note.published));
}

// Get all published posts
export function getPublishedPosts() {
  return sortByDateDesc(allPosts.filter((post) => post.published));
}

// Get note by slug
export function getNoteBySlug(slug: string) {
  return allNotes.find((note) => note.slug === slug && note.published);
}

// Get post by slug
export function getPostBySlug(slug: string) {
  return allPosts.find((post) => post.slug === slug && post.published);
}

// Get legal doc by slug
export function getLegalDocBySlug(slug: string) {
  return allLegalDocs.find((doc) => doc.slug === slug);
}

// Get adjacent notes by date ordering
export function getAdjacentNotes(currentNote: Note) {
  const notes = getPublishedNotes();
  const index = notes.findIndex((note) => note.slug === currentNote.slug);
  if (index === -1) {
    return { prev: undefined, next: undefined };
  }

  return {
    prev: notes[(index - 1 + notes.length) % notes.length],
    next: notes[(index + 1) % notes.length],
  };
}

// Get adjacent posts by date ordering
export function getAdjacentPosts(currentPost: Post) {
  const posts = getPublishedPosts();
  const index = posts.findIndex((post) => post.slug === currentPost.slug);
  if (index === -1) {
    return { prev: undefined, next: undefined };
  }

  return {
    prev: posts[(index - 1 + posts.length) % posts.length],
    next: posts[(index + 1) % posts.length],
  };
}

// Get combined search corpus from posts + notes
export function searchContent(query: string): ContentEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const matches = [...getPublishedPosts(), ...getPublishedNotes()].filter(
    (entry) =>
      entry.title.toLowerCase().includes(normalizedQuery) ||
      entry.summary.toLowerCase().includes(normalizedQuery) ||
      entry.excerpt.toLowerCase().includes(normalizedQuery) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
  );

  return sortByDateDesc(matches);
}

export function getLegalDocs() {
  return sortByDateDesc([...allLegalDocs]);
}

// Get related posts based on tags and categories
export function getRelatedPosts(currentPost: Post, limit = 3) {
  const relatedPosts = allPosts
    .filter((post) => post.published)
    .filter((post) => {
      if (!post.published || post.slug === currentPost.slug) {
        return false;
      }

      // Check for common tags or categories
      const hasCommonTag = post.tags.some((tag) =>
        currentPost.tags.includes(tag),
      );
      const hasCommonCategory = post.categories.some((cat) =>
        currentPost.categories.includes(cat),
      );

      return hasCommonTag || hasCommonCategory;
    })
    .sort((a: Post, b: Post) => {
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
  return getPublishedPosts().slice(0, limit);
}

// Get recent notes
export function getRecentNotes(limit = 5) {
  return getPublishedNotes().slice(0, limit);
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
  const publishedPosts = getPublishedPosts();
  const publishedNotes = getPublishedNotes();
  const totalWords = publishedPosts.reduce(
    (acc, post) => acc + post.readingTime.words,
    0,
  );
  const totalNoteWords = publishedNotes.reduce(
    (acc, note) => acc + note.readingTime.words,
    0,
  );
  const totalMinutes = publishedPosts.reduce(
    (acc, post) => acc + post.readingTime.minutes,
    0,
  );
  const totalNoteMinutes = publishedNotes.reduce(
    (acc, note) => acc + note.readingTime.minutes,
    0,
  );

  return {
    totalPosts: publishedPosts.length,
    totalNotes: publishedNotes.length,
    totalWords,
    totalNoteWords,
    totalReadingTime: totalMinutes,
    totalNoteReadingTime: totalNoteMinutes,
    averageWordsPerPost:
      publishedPosts.length > 0
        ? Math.round(totalWords / publishedPosts.length)
        : 0,
    averageReadingTime:
      publishedPosts.length > 0
        ? Math.round(totalMinutes / publishedPosts.length)
        : 0,
    tags: getAllTags().length,
    categories: getAllCategories().length,
  };
}
