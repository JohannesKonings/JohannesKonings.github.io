import { useMemo, useState } from "react";
import type { allNotes } from "content-collections";
import type { JSX } from "react";
import { NoteCard } from "./NoteCard";

interface NotesListProps {
  notes: typeof allNotes;
}

export function NotesList({ notes }: NotesListProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const query = searchQuery.trim().toLowerCase();
      const queryMatch =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.summary.toLowerCase().includes(query) ||
        note.excerpt.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query));

      if (!queryMatch) {
        return false;
      }

      if (selectedTags.size === 0) {
        return true;
      }

      return note.tags.some((tag) => selectedTags.has(tag));
    });
  }, [notes, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    const nextTags = new Set(selectedTags);
    if (nextTags.has(tag)) {
      nextTags.delete(tag);
    } else {
      nextTags.add(tag);
    }
    setSelectedTags(nextTags);
  };

  return (
    <div>
      <div className="mb-8 rounded-xl border border-blue-500/20 bg-gray-900/50 p-5">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search notes..."
          className="w-full rounded-lg border border-blue-500/30 bg-gray-950/80 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-blue-400/60 focus:outline-none"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs transition-all duration-300 ${
                selectedTags.has(tag)
                  ? "border-blue-400/70 bg-blue-500/25 text-blue-100"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-200 hover:border-blue-400/50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-400">
        Showing {filteredNotes.length} of {notes.length} notes
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredNotes.map((note) => (
          <NoteCard key={note.slug} note={note} />
        ))}
      </div>
    </div>
  );
}
