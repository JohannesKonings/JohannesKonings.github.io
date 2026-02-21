import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import type { JSX } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/blog", label: "Blog", exact: false },
  { to: "/notes", label: "Notes", exact: false },
  { to: "/search", label: "Search", exact: true },
] as const;

export function Navigation(): JSX.Element {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string, exact: boolean) =>
    exact ? currentPath === to : currentPath.startsWith(to);

  const linkClasses = (to: string, exact: boolean) =>
    `relative px-6 py-2 text-sm font-medium transition-all duration-300 group ${
      isActive(to, exact)
        ? "text-cyan-600 dark:text-cyan-400"
        : "text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400"
    }`;

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm transition-colors duration-300 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:justify-center md:gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <Link key={to} to={to} className={linkClasses(to, exact)}>
                <span className="relative z-10">{label}</span>
                <div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 ${
                    isActive(to, exact) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to, exact)
                    ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
