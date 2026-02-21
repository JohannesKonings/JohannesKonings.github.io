import { createFileRoute } from "@tanstack/react-router";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { NotesList } from "../../components/notes/NotesList";
import { getPublishedNotes } from "../../lib/content-utils";

export const Route = createFileRoute("/notes/")({
  component: NotesRouteComponent,
});

function NotesRouteComponent() {
  const notes = getPublishedNotes();

  return (
    <BlogLayout
      title="Notes"
      description="Short, practical notes on tools, workflows, and engineering topics."
    >
      <NotesList notes={notes} />
    </BlogLayout>
  );
}

