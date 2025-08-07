import type { allPosts } from "content-collections";
import { BlogPostCard } from "./BlogPostCard";
import { useState, useMemo } from "react";
import type { JSX } from "react";

interface BlogPostListProps {
  posts: (typeof allPosts);
  showFilters?: boolean;
}

export function BlogPostList({ posts, showFilters = true }: BlogPostListProps): JSX.Element {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Get all unique tags and categories
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [posts]);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    posts.forEach(post => post.categories.forEach(cat => categories.add(cat)));
    return Array.from(categories).sort();
  }, [posts]);

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(query);
        const matchesSummary = post.summary.toLowerCase().includes(query);
        const matchesContent = post.excerpt.toLowerCase().includes(query);
        const matchesTags = post.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesTitle && !matchesSummary && !matchesContent && !matchesTags) {
          return false;
        }
      }

      // Tag filter
      if (selectedTags.size > 0) {
        const hasMatchingTag = post.tags.some(tag => selectedTags.has(tag));
        if (!hasMatchingTag) return false;
      }

      // Category filter
      if (selectedCategories.size > 0) {
        const hasMatchingCategory = post.categories.some(cat => selectedCategories.has(cat));
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
        <div className="mb-8 space-y-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-gray-600/30">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search the digital archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-lg pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 transform hover:scale-105 ${
                        selectedTags.has(tag)
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                          : "bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-300 border border-gray-600/30 hover:border-cyan-500/50 hover:text-cyan-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {allCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all duration-300 transform hover:scale-105 ${
                        selectedCategories.has(category)
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-300 border border-gray-600/30 hover:border-blue-500/50 hover:text-blue-300"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear filters */}
          {(selectedTags.size > 0 || selectedCategories.size > 0 || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTags(new Set());
                setSelectedCategories(new Set());
                setSearchQuery("");
              }}
              className="px-4 py-2 text-sm bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30 rounded-lg hover:border-red-400/60 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-orange-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
          Showing {filteredPosts.length} of {posts.length} posts
        </p>
      </div>

      {/* Posts grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm p-8 rounded-xl border border-gray-600/30">
            <p className="text-gray-400 text-lg">No posts found in the digital archive.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria.</p>
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
