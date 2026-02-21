import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { allPosts } from "content-collections";

interface RelatedPostsProps {
  posts: (typeof allPosts)[number][];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={post.url}
            className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-colors"
          >
            <time className="text-xs text-gray-500 dark:text-gray-400">
              {format(post.date, "MMM d, yyyy")}
            </time>
            <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
