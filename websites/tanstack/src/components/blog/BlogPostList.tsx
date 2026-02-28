import type { allPosts } from "content-collections";
import { BlogPostCard } from "./BlogPostCard";
import { useState, useMemo } from "react";
import type { JSX } from "react";

interface BlogPostListProps {
  posts: typeof allPosts;
  showFilters?: boolean;
}

export function BlogPostList({
  posts,
  showFilters = true,
}: BlogPostListProps): JSX.Element {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const VISIBLE_TAGS = 12;

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) =>
      post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    );
    return counts;
  }, [posts]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort((a, b) => {
      const countDiff = (tagCounts.get(b) ?? 0) - (tagCounts.get(a) ?? 0);
      if (countDiff !== 0) {
        return countDiff;
      }
      return a.localeCompare(b);
    });
  }, [posts, tagCounts]);

  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, VISIBLE_TAGS);

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tag filter
      if (selectedTags.size > 0) {
        const hasMatchingTag = post.tags.some((tag) => selectedTags.has(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [posts, selectedTags]);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {showFilters && (
        <div className="mb-8 space-y-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-600/30 shadow-sm">
          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {visibleTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full cursor-pointer transition-all duration-300 ${
                      selectedTags.has(tag)
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/30 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-300"
                    }`}
                  >
                    {tag} ({tagCounts.get(tag)})
                  </button>
                ))}
                {allTags.length > VISIBLE_TAGS && (
                  <button
                    onClick={() => setTagsExpanded((v) => !v)}
                    className="px-3 py-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    {tagsExpanded
                      ? "Show less"
                      : `+${allTags.length - VISIBLE_TAGS} more`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {selectedTags.size > 0 && (
            <button
              onClick={() => {
                setSelectedTags(new Set());
              }}
              className="px-4 py-2 text-sm bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-300 dark:border-red-500/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-all duration-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredPosts.length} of {posts.length} posts
        </p>
      </div>

      {/* Posts grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-600/30">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No posts found in the digital archive.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your selected tags.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
