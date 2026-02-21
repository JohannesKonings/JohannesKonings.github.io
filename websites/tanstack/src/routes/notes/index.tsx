import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { allNotes } from "content-collections";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { format } from "date-fns";

export const Route = createFileRoute("/notes/")({
  component: NotesPage,
});

function NotesPage() {
  // Filter for published notes and sort by date (newest first)
  const publishedNotes = React.useMemo(() => {
    return allNotes
      .filter((note) => note.published)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return (
    <BlogLayout
      title="Notes"
      description="Quick reference notes on topics I care about."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            {publishedNotes.length} note{publishedNotes.length !== 1 ? "s" : ""} available
          </p>
          <Link
            to="/search"
            className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Search all posts and notes →
          </Link>
        </div>

        {/* Notes list */}
        <div className="space-y-4">
          {publishedNotes.map((note) => (
            <article
              key={note.slug}
              className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <Link
                    to={note.url}
                    className="block group"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {note.title}
                    </h2>
                    {(note.summary || note.excerpt) && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {note.summary || note.excerpt}
                      </p>
                    )}
                  </Link>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  <time dateTime={note.date.toISOString()}>
                    {format(note.date, "MMM d, yyyy")}
                  </time>
                  <span>•</span>
                  <span>{note.readingTime.text}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {publishedNotes.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            No notes available yet.
          </p>
        )}
      </div>
    </BlogLayout>
  );
}
