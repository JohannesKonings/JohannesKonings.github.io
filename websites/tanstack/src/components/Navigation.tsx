import { Link, useRouter } from "@tanstack/react-router";
import type { JSX } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation(): JSX.Element {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 gap-4">
          <div className="flex items-center space-x-12">
            {/* Home Link */}
            <Link
              to="/"
              className={`relative px-6 py-2 text-sm font-medium transition-all duration-700 ease-out transform group ${
                currentPath === "/"
                  ? "text-cyan-500 dark:text-cyan-400 scale-105 hover:scale-110 hover:text-cyan-600 dark:hover:text-cyan-300"
                  : "text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-700 ${
                  currentPath === "/" ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></div>
            </Link>

            {/* Blog Link */}
            <Link
              to="/blog"
              className={`relative px-6 py-2 text-sm font-medium transition-all duration-700 ease-out transform group ${
                currentPath.startsWith("/blog")
                  ? "text-cyan-500 dark:text-cyan-400 scale-105 hover:scale-110 hover:text-cyan-600 dark:hover:text-cyan-300"
                  : "text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Blog</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-700 ${
                  currentPath.startsWith("/blog")
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></div>
            </Link>

            {/* Notes Link */}
            <Link
              to="/notes"
              className={`relative px-6 py-2 text-sm font-medium transition-all duration-700 ease-out transform group ${
                currentPath.startsWith("/notes")
                  ? "text-cyan-500 dark:text-cyan-400 scale-105 hover:scale-110 hover:text-cyan-600 dark:hover:text-cyan-300"
                  : "text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Notes</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-700 ${
                  currentPath.startsWith("/notes")
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></div>
            </Link>

            {/* Search Link */}
            <Link
              to="/search"
              className={`relative px-6 py-2 text-sm font-medium transition-all duration-700 ease-out transform group ${
                currentPath === "/search"
                  ? "text-cyan-500 dark:text-cyan-400 scale-105 hover:scale-110 hover:text-cyan-600 dark:hover:text-cyan-300"
                  : "text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-105"
              }`}
            >
              <span className="relative z-10">Search</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-700 ${
                  currentPath === "/search"
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
      {/* Animated background glow - subtle */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 dark:via-cyan-500/2 to-transparent animate-subtle-glow pointer-events-none" />
    </nav>
  );
}
