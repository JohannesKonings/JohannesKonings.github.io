import type { ReactNode } from "react";
import type { JSX } from "react";

interface BlogLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function BlogLayout({
  children,
  title = "Blog",
  description = "Latest posts and insights",
}: BlogLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative transition-colors duration-300">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-60 dark:opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/8 dark:bg-cyan-500/4 rounded-full blur-3xl animate-gentle-pulse animation-delay-2000" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/8 dark:bg-blue-500/4 rounded-full blur-3xl animate-gentle-pulse animation-delay-3000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-300/5 dark:bg-gray-500/3 rounded-full blur-2xl animate-subtle-glow animation-delay-1000" />
      </div>

      {/* Page Header */}
      {(title !== "Blog" || description !== "Latest posts and insights") && (
        <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
                {title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 dark:from-cyan-500/2 via-transparent to-blue-500/5 dark:to-blue-500/2 pointer-events-none animate-subtle-glow" />
        </header>
      )}

      {/* Main content */}
      <main className="relative z-10 py-12">
        <div className="bg-white/70 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl mx-4 lg:mx-8 p-8 border border-gray-200 dark:border-gray-600/30 shadow-xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600/50 mt-16 shadow-lg">
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 dark:via-gray-500/2 to-transparent animate-subtle-glow pointer-events-none" />
      </footer>
    </div>
  );
}
