import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogLayout } from "../../components/blog/BlogLayout";

export const Route = createFileRoute("/notes/$noteId")({
  component: NoteNotFoundPage,
});

function NoteNotFoundPage() {
  return (
    <BlogLayout title="Note not found" description="This note could not be found.">
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The note you’re looking for doesn’t exist or isn’t available.
        </p>
        <Link
          to="/notes"
          className="text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          ← Back to Notes
        </Link>
      </div>
    </BlogLayout>
  );
}
