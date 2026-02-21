import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import type { JSX } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation(): JSX.Element {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: "/" as const, label: "Home", active: currentPath === "/" },
    {
      to: "/blog" as const,
      label: "Blog",
      active: currentPath.startsWith("/blog"),
    },
    {
      to: "/notes" as const,
      label: "Notes",
      active: currentPath.startsWith("/notes"),
    },
    {
      to: "/search" as const,
      label: "Search",
      active: currentPath.startsWith("/search"),
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-500/20 bg-gray-950/85 shadow-xl backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-lg border border-cyan-500/25 bg-gray-900/80 px-2 py-1 text-sm text-cyan-200 transition-colors hover:border-cyan-400/50 lg:hidden"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
          <span className="hidden text-sm uppercase tracking-[0.2em] text-cyan-300 sm:block">
            johanneskonings.dev
          </span>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                item.active
                  ? "scale-105 bg-cyan-500/20 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
                  : "text-gray-300 hover:scale-105 hover:bg-cyan-500/10 hover:text-cyan-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/rss.xml"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-blue-500/30 bg-gray-900/70 px-3 py-1.5 text-xs text-blue-200 transition-all duration-300 hover:border-blue-400/60 hover:text-blue-100"
          >
            RSS
          </a>
          <ThemeToggle />
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-cyan-500/20 bg-gray-950/95 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  item.active
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
