import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { searchContent } from "../../lib/content-utils";

export const Route = createFileRoute("/search/")({
  component: SearchRouteComponent,
});

function SearchRouteComponent() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchContent(query), [query]);

  return (
    <BlogLayout
      title="Search"
      description="Search across posts and notes by keyword."
    >
      <div className="mx-auto max-w-4xl">
        <label htmlFor="site-search" className="mb-2 block text-sm text-gray-300">
          Search query
        </label>
        <input
          id="site-search"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="What are you looking for?"
          className="w-full rounded-lg border border-cyan-500/30 bg-gray-950/80 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-cyan-400/60 focus:outline-none"
        />

        {query.trim().length >= 2 && (
          <div className="mt-6">
            <p className="mb-3 text-sm text-gray-400">
              Found {results.length} result{results.length === 1 ? "" : "s"} for{" "}
              <span className="text-cyan-200">"{query.trim()}"</span>
            </p>

            <ul className="space-y-3">
              {results.map((result) => (
                <li key={`${result.url}-${result.slug}`}>
                  <a
                    href={result.url}
                    className="block rounded-xl border border-cyan-500/20 bg-gray-900/60 p-4 transition-all duration-300 hover:border-cyan-400/50 hover:bg-gray-900/80"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                      <span className="rounded-full border border-cyan-500/30 px-2 py-0.5 text-cyan-300">
                        {"categories" in result ? "Blog post" : "Note"}
                      </span>
                      <time dateTime={result.date.toISOString()}>
                        {format(result.date, "MMM d, yyyy")}
                      </time>
                    </div>
                    <h2 className="mb-2 text-lg font-semibold text-gray-100">
                      {result.title}
                    </h2>
                    <p className="line-clamp-2 text-sm text-gray-300">
                      {result.summary || result.excerpt}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </BlogLayout>
  );
}

