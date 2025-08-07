import type { allPosts } from "content-collections";
import { format } from "date-fns";
import type { JSX } from "react";

interface BlogPostCardProps {
  post: (typeof allPosts)[0];
}

export function BlogPostCard({ post }: BlogPostCardProps): JSX.Element {
  // Prioritize cover_image over thumbnail
  const imageUrl = post.cover_image || (post.thumbnail ? `/img/${post.thumbnail}.png` : null);
  
  return (
    <article className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-600/30 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-cyan-500/20 group">
      {imageUrl && (
        <div className="aspect-video bg-gradient-to-r from-gray-700 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
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
