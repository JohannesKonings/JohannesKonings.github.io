import { format } from "date-fns";
import type { allNotes } from "content-collections";
import type { JSX } from "react";

interface NoteCardProps {
  note: (typeof allNotes)[0];
}

export function NoteCard({ note }: NoteCardProps): JSX.Element {
  return (
    <article className="group rounded-xl border border-blue-500/20 bg-gray-900/60 p-5 shadow-xl transition-all duration-300 hover:border-blue-400/50 hover:bg-gray-900/80">
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
        <time dateTime={note.date.toISOString()} className="text-blue-300">
          {format(note.date, "MMM d, yyyy")}
        </time>
        <span>•</span>
        <span className="text-cyan-300">{note.readingTime.text}</span>
      </div>

      <h2 className="mb-3 text-xl font-semibold text-gray-100 transition-colors duration-300 group-hover:text-blue-200">
        <a href={note.url}>{note.title}</a>
      </h2>

      <p className="mb-4 line-clamp-3 text-gray-300">{note.excerpt}</p>

      {note.tags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {note.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <a
        href={note.url}
        className="inline-flex items-center text-sm font-medium text-blue-300 transition-colors duration-300 hover:text-blue-200"
      >
        Read note
      </a>
    </article>
  );
}
