import { Link, useRouter } from "@tanstack/react-router";
import type { JSX } from "react";

export function Navigation(): JSX.Element {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 shadow-xl border-b border-gray-600 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <div className="flex items-center space-x-12">
            {/* Home Link */}
            <Link
              to="/"
              className={`relative px-6 py-2 text-sm font-medium transition-all duration-700 ease-out transform group ${
                currentPath === "/"
                  ? "text-cyan-400 scale-105 hover:scale-110 hover:text-cyan-300"
                  : "text-gray-300 hover:text-cyan-400 hover:scale-105"
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
                  ? "text-cyan-400 scale-105 hover:scale-110 hover:text-cyan-300"
                  : "text-gray-300 hover:text-cyan-400 hover:scale-105"
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
          </div>
        </div>
      </div>

      {/* Animated background glow effect - more subtle */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/2 to-transparent animate-subtle-glow pointer-events-none"></div>
    </nav>
  );
}
