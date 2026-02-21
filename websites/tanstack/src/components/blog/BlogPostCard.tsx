import type { allPosts } from "content-collections";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";
import type { JSX } from "react";
import { useState, useEffect } from "react";

interface BlogPostCardProps {
  post: (typeof allPosts)[0];
}

export function BlogPostCard({ post }: BlogPostCardProps): JSX.Element {
  // Prioritize cover_image over thumbnail
  const imageUrl =
    post.cover_image || (post.thumbnail ? `/img/${post.thumbnail}.png` : null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  // Only show spinner after a short delay to avoid flashing for fast-loading images
  useEffect(() => {
    if (imageUrl && !imageLoaded && !imageError) {
      const timer = setTimeout(() => setShowSpinner(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowSpinner(false);
    }
  }, [imageUrl, imageLoaded, imageError]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setShowSpinner(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setShowSpinner(false);
  };

  return (
    <article className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600/30 hover:border-cyan-400/60 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/15 group">
      {imageUrl && !imageError ? (
        <div className="aspect-video bg-gray-200 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Loading placeholder - only show after delay */}
          {showSpinner && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Image contained within aspect box to avoid overflow/crop */}
          <img
            src={imageUrl}
            alt={post.title}
            loading="lazy"
            className="w-full max-h-full object-contain object-center transition-all duration-300 group-hover:scale-105"
            style={{ imageRendering: "auto" }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Subtle gradient overlay for better text contrast if needed */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      ) : (
        /* Fallback design for posts without images or failed to load */
        <div className="aspect-video bg-gray-200 dark:bg-gradient-to-br dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="text-center text-gray-400 group-hover:text-gray-300 transition-colors duration-500">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium">Blog Post</p>
          </div>
        </div>
      )}

      <div className="p-6 relative">
        {/* Animated background glow - more subtle */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/2 via-transparent to-blue-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-b-xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <time dateTime={post.date.toISOString()} className="text-cyan-600 dark:text-cyan-400">
              {format(post.date, "MMM d, yyyy")}
            </time>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-blue-600 dark:text-blue-400">{post.readingTime.text}</span>
          </div>

          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors duration-300">
            <Link
              to={post.url}
              className="hover:text-cyan-400 transition-colors duration-300"
            >
              {post.title}
            </Link>
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to="/blog/tag/$tag"
                  params={{ tag }}
                  className="px-3 py-1.5 text-xs bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-all duration-300"
                >
                  {tag}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300 rounded-full border border-gray-300 dark:border-gray-500/30">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <Link
            to={post.url}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium group-hover:translate-x-1 transition-all duration-300"
            aria-label={`Read more about ${post.title}`}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold" aria-hidden="true">
              Read more
            </span>
            <svg
              className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
