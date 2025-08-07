import type { allPosts } from "content-collections";
import { format } from "date-fns";
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
    <article className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-600/30 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-cyan-500/20 group">
      {imageUrl && !imageError ? (
        <div className="aspect-video bg-gradient-to-r from-gray-700 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Loading placeholder - only show after delay */}
          {showSpinner && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Image with smart object-fit strategy */}
          <img
            src={imageUrl}
            alt={post.title}
            loading="lazy"
            className="w-full h-full transition-all duration-300 group-hover:scale-105"
            style={{
              objectFit: "cover",
              objectPosition: "center top",
              imageRendering: "auto",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
              minHeight: "100%",
              minWidth: "100%",
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Subtle gradient overlay for better text contrast if needed */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      ) : (
        /* Fallback design for posts without images or failed to load */
        <div className="aspect-video bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 relative overflow-hidden flex items-center justify-center">
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
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <time dateTime={post.date.toISOString()} className="text-cyan-400">
              {format(post.date, "MMM d, yyyy")}
            </time>
            <span className="text-gray-500">•</span>
            <span className="text-blue-400">{post.readingTime.text}</span>
          </div>

          <h2 className="text-xl font-bold text-gray-100 mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">
            <a
              href={post.url}
              className="hover:text-cyan-400 transition-colors duration-300"
            >
              {post.title}
            </a>
          </h2>

          <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.slice(0, 3).map((tag) => (
                <a
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105"
                >
                  {tag}
                </a>
              ))}
              {post.tags.length > 3 && (
                <span className="px-3 py-1.5 text-xs bg-gradient-to-r from-gray-600/50 to-gray-700/50 text-gray-300 rounded-full border border-gray-500/30">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <a
            href={post.url}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium group-hover:translate-x-1 transition-all duration-300"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
              Read more
            </span>
            <svg
              className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
