import { createFileRoute, Link } from "@tanstack/react-router";

import avatar from "../images/avatar.png";
import { Fa6BrandsBluesky, MdiGithub, SimpleIconsDevdotto } from "../icons";
import { Mail, Linkedin } from "lucide-react";
import { getRecentPosts } from "../lib/content-utils";
import { BlogPostCard } from "../components/blog/BlogPostCard";

const SOCIALS = [
  { href: "mailto:mail@johanneskonings.dev", label: "Email", Icon: Mail },
  { href: "https://github.com/JohannesKonings", label: "GitHub", Icon: MdiGithub },
  { href: "https://www.linkedin.com/in/JohannesKonings/", label: "LinkedIn", Icon: Linkedin },
  { href: "https://bsky.app/profile/johanneskonings.dev", label: "Bluesky", Icon: Fa6BrandsBluesky },
  { href: "https://dev.to/johanneskonings", label: "dev.to", Icon: SimpleIconsDevdotto },
] as const;

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const recentPosts = getRecentPosts(3);

  return (
    <>
      <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-zinc-900/95 dark:to-slate-950 relative">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 dark:bg-slate-100/10 rounded-full blur-xl animate-gentle-pulse animation-delay-1000" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/10 dark:bg-zinc-100/8 rounded-full blur-xl animate-gentle-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-300/10 dark:bg-slate-200/12 rounded-full blur-lg animate-subtle-glow animation-delay-3000" />
        </div>

        {/* Avatar Section */}
        <div className="relative z-10 pt-16 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-subtle-glow"></div>
                <img
                  src={avatar}
                  alt="Avatar"
                  className="relative z-10 rounded-full border-2 border-gray-600/50 shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all duration-300 hover:-translate-y-0.5"
                    aria-label={label}
                  >
                    {Icon ? (
                      <Icon className="w-6 h-6 text-current" />
                    ) : (
                      <span className="text-sm font-medium">{label}</span>
                    )}
                  </a>
                ))}
              </div>

              <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                Johannes Konings
              </h1>
              <p className="mb-6 text-sm text-gray-700 dark:text-gray-200 max-w-md text-center">
                Notes and posts on AWS and TanStack.
              </p>
            </div>
          </div>
        </div>

        {/* Latest Blog Posts Section */}
        <div className="relative z-10 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-3">
                Recent posts
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/blog"
                className="group inline-flex items-center px-8 py-4 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-400/60 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                <span className="text-cyan-700 dark:text-transparent dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-400 dark:bg-clip-text">
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
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center flex flex-wrap justify-center items-center gap-4">
            <a
              href="/rss.xml"
              className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              aria-label="RSS feed"
            >
              RSS
            </a>
            <span className="text-gray-400 dark:text-gray-500">|</span>
            <p className="text-gray-600 dark:text-gray-400">
              © 2026 Johannes Konings. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
