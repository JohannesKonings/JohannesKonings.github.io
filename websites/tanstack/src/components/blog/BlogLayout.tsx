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
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-gentle-pulse rounded-full bg-cyan-500/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-gentle-pulse rounded-full bg-blue-500/5 blur-3xl animation-delay-2000"></div>
      </div>

      <main className="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10 rounded-2xl border border-cyan-500/20 bg-gray-900/60 p-6 text-center shadow-2xl backdrop-blur sm:p-8">
            <h1 className="mb-3 bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto max-w-3xl text-gray-300">{description}</p>
          </header>

          <section className="rounded-2xl border border-cyan-500/15 bg-gray-900/40 p-4 shadow-2xl backdrop-blur sm:p-8">
            {children}
          </section>
          <footer className="mt-10 text-center text-sm text-gray-400">
            © 2026 Johannes Konings. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
}
