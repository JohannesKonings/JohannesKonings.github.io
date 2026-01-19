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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
      {/* Animated background effects - more subtle */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl animate-gentle-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/4 rounded-full blur-3xl animate-gentle-pulse animation-delay-3000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-500/3 rounded-full blur-2xl animate-subtle-glow animation-delay-1000"></div>
      </div>

      {/* Page Header - now more compact since navigation is handled globally */}
      {(title !== "Blog" || description !== "Latest posts and insights") && (
        <header className="relative z-10 bg-gradient-to-r from-gray-800/80 via-gray-700/80 to-gray-800/80 backdrop-blur-sm border-b border-gray-600/50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-100 via-cyan-200 to-gray-100 bg-clip-text text-transparent mb-3 drop-shadow-lg">
                {title}
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          {/* Header glow effect - more subtle */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/2 via-transparent to-blue-500/2 pointer-events-none animate-subtle-glow"></div>
        </header>
      )}

      {/* Main content */}
      <main className="relative z-10 py-12">
        <div className="bg-gradient-to-br from-gray-800/30 via-gray-700/20 to-gray-800/30 backdrop-blur-sm rounded-2xl mx-4 lg:mx-8 p-8 border border-gray-600/30 shadow-2xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 backdrop-blur-sm border-t border-gray-600/50 mt-16 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
              © 2026 Johannes Konings. All rights reserved.
            </p>
          </div>
        </div>
        {/* Footer glow effect - more subtle */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-500/2 to-transparent animate-subtle-glow pointer-events-none"></div>
      </footer>
    </div>
  );
}
