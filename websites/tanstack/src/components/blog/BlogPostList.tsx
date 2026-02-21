import type { allPosts } from "content-collections";
import { BlogPostCard } from "./BlogPostCard";
import { useState, useMemo } from "react";
import type { JSX } from "react";
import { useInView } from "../../hooks/useInView";

interface BlogPostListProps {
  posts: typeof allPosts;
  showFilters?: boolean;
}

function RevealCard({ post, index }: { post: (typeof allPosts)[0]; index: number }) {
  const { ref, inView } = useInView({ rootMargin: "0px 0px -20px 0px" });
  const stagger = (index % 3) + 1;
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : ""} stagger-${stagger}`}
    >
      <BlogPostCard post={post} />
    </div>
  );
}

export function BlogPostList({
  posts,
  showFilters = true,
}: BlogPostListProps): JSX.Element {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const VISIBLE_TAGS = 12;

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [posts]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    posts.forEach((post) =>
      post.categories.forEach((cat) => categories.add(cat)),
    );
    return Array.from(categories).sort();
  }, [posts]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) =>
      post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
    );
    return counts;
  }, [posts]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) =>
      post.categories.forEach((cat) => counts.set(cat, (counts.get(cat) ?? 0) + 1)),
    );
    return counts;
  }, [posts]);

  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, VISIBLE_TAGS);

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesSummary = post.summary.toLowerCase().includes(query);
        const matchesContent = post.excerpt.toLowerCase().includes(query);
        const matchesTags = post.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );

        if (
          !matchesTitle &&
          !matchesSummary &&
          !matchesContent &&
          !matchesTags
        ) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.size > 0) {
        const hasMatchingTag = post.tags.some((tag) => selectedTags.has(tag));
        if (!hasMatchingTag) return false;
      }

      // Category filter
      if (selectedCategories.size > 0) {
        const hasMatchingCategory = post.categories.some((cat) =>
          selectedCategories.has(cat),
        );
        if (!hasMatchingCategory) return false;
      }

      return true;
    });
  }, [posts, searchQuery, selectedTags, selectedCategories]);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const toggleCategory = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {showFilters && (
        <div className="mb-8 space-y-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-600/30 shadow-sm">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search the digital archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 ${
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
                      className="px-3 py-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {tagsExpanded ? "Show less" : `+${allTags.length - VISIBLE_TAGS} more`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Categories */}
            {allCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 transform hover:scale-105 ${
                        selectedCategories.has(category)
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/30 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-300"
                      }`}
                    >
                      {category} ({categoryCounts.get(category)})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear filters */}
          {(selectedTags.size > 0 ||
            selectedCategories.size > 0 ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedTags(new Set());
                setSelectedCategories(new Set());
                setSearchQuery("");
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
              Try adjusting your search criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <RevealCard key={post.slug} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
