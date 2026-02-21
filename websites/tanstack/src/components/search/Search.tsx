import { useState, useEffect, useMemo, useCallback } from "react";
import { create, insert, search } from "@orama/orama";
import { Link } from "@tanstack/react-router";

const MIN_QUERY_LENGTH = 2;

export type SearchItem = {
  type: "blog" | "note";
  slug: string;
  title: string;
  summary: string;
  excerpt: string;
  tags: string;
  url: string;
};

interface SearchProps {
  items: SearchItem[];
}

export function Search({ items }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [db, setDb] = useState<Awaited<ReturnType<typeof create>> | null>(null);

  const schema = useMemo(
    () => ({
      type: "string" as const,
      slug: "string" as const,
      title: "string" as const,
      summary: "string" as const,
      excerpt: "string" as const,
      tags: "string" as const,
      url: "string" as const,
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const database = await create({
        schema,
      });
      if (cancelled) return;
      for (const item of items) {
        await insert(database, item);
      }
      if (!cancelled) setDb(database);
    })();
    return () => {
      cancelled = true;
    };
  }, [items, schema]);

  const runSearch = useCallback(
    async (q: string) => {
      if (!db || q.length < MIN_QUERY_LENGTH) {
        setResults([]);
        return;
      }
      const { hits } = await search(db, {
        term: q,
        limit: 50,
      });
      const out = hits
        .map((h: { document?: unknown }) => (h.document as SearchItem | undefined))
        .filter((d: SearchItem | undefined): d is SearchItem => Boolean(d));
      setResults(out);
    },
    [db],
  );

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          autoComplete="off"
          spellCheck={false}
          className="w-full px-4 py-3 pl-10 rounded-lg outline-none text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/20"
        />
        <svg
          className="absolute size-5 left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {query.length >= MIN_QUERY_LENGTH && (
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} for
            &quot;{query}&quot;
          </p>
          <ul className="flex flex-col gap-3">
            {results.map((item) => (
              <li key={item.url}>
                <Link
                  to={item.url}
                  className="block p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-colors"
                >
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                    {item.type}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.summary || item.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              No results found. Try different keywords.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
