import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogLayout } from "../../components/blog/BlogLayout";

export const Route = createFileRoute("/notes/")({
  component: NotesPage,
});

function NotesPage() {
  return (
    <BlogLayout
      title="Notes"
      description="Some notes on topics I care about."
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Notes are available. Use Search to find posts and notes.
        </p>
        <Link
          to="/search"
          className="inline-flex items-center text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          Search all posts and notes →
        </Link>
      </div>
    </BlogLayout>
  );
}
