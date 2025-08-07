import { createFileRoute } from "@tanstack/react-router";

// import { Icon } from "@iconify/react";
// import {
// 	faTwitter,
// 	faGithub,
// 	faBluesky,
// } from "@fortawesome/free-brands-svg-icons";
import avatar from "../images/avatar.png";
import { Fa6BrandsBluesky, MdiGithub } from "../icons";
import { getRecentPosts } from "../lib/content-utils";
import { BlogPostCard } from "../components/blog/BlogPostCard";

// import "@fortawesome/fontawesome-svg-core/styles.css";

// import { config } from "@fortawesome/fontawesome-svg-core";
// config.autoAddCss = false; /* eslint-disable import/first */

export const Route = createFileRoute("/")({
  // component: React.lazy(() =>
  // 	import("./index").then((module) => ({ default: module.Home })),
  // ),
  component: Home,
  // loader: async () => await getCount(),
  notFoundComponent: () => <div>Page Not Found</div>,
});
// const rootRoute = createRootRoute({
// });
// export const Route = createRoute({
// 	path: "/tanstack",
// 	component: Home,
// 	getParentRoute: () => rootRoute,
// });

function Home() {
  const recentPosts = getRecentPosts(3);

  return (
    <>
      {/* Animated metallic background effects - more subtle */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 relative">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/5 rounded-full blur-xl animate-gentle-pulse animation-delay-1000"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/5 rounded-full blur-xl animate-gentle-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gray-400/8 rounded-full blur-lg animate-subtle-glow animation-delay-3000"></div>
        </div>

        {/* Avatar Section - now below navigation */}
        <div className="relative z-10 pt-16 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              {/* Avatar with subtle glow effect */}
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-subtle-glow"></div>
                <img
                  src={avatar}
                  alt="Avatar"
                  className="relative z-10 rounded-full border-2 border-gray-600/50 shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Social links with neon effects - smaller size */}
              <div className="flex items-center justify-center mb-6 space-x-6">
                <a
                  href="https://github.com/johanneskonings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md transform group-hover:scale-110"></div>
                  <MdiGithub className="relative z-10 text-4xl text-gray-300 group-hover:text-cyan-400 transition-all duration-300 transform group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                </a>
                <a
                  href="https://bsky.app/profile/johanneskonings.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 blur-md transform group-hover:scale-110"></div>
                  <Fa6BrandsBluesky className="relative z-10 text-4xl text-gray-300 group-hover:text-blue-400 transition-all duration-300 transform group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </a>
              </div>

              {/* Name with metallic effect */}
              <h1 className="mb-6 text-4xl font-bold bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                Johannes Konings
              </h1>
            </div>
          </div>
        </div>

        {/* Latest Blog Posts Section */}
        <div className="relative z-10 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
                Latest Blog Posts
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>

            {/* View All Posts Link */}
            <div className="text-center mt-12">
              <a
                href="/blog"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  View All Posts
                </span>
                <svg
                  className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
        </div>
      </div>
    </>
  );
}
