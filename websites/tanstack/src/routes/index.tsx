import { createFileRoute } from "@tanstack/react-router";
import avatar from "../images/avatar.png";
import { Fa6BrandsBluesky, MdiGithub } from "../icons";
import { getRecentNotes, getRecentPosts } from "../lib/content-utils";
import { BlogPostCard } from "../components/blog/BlogPostCard";
import { NoteCard } from "../components/notes/NoteCard";

export const Route = createFileRoute("/")({
  component: Home,
  notFoundComponent: () => <div>Page Not Found</div>,
});

function Home() {
  const recentPosts = getRecentPosts(3);
  const recentNotes = getRecentNotes(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="relative z-10 pb-16 pt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-cyan-500/20 bg-gray-900/60 p-6 text-center shadow-2xl backdrop-blur sm:p-10">
            <div className="mx-auto mb-5 h-32 w-32 overflow-hidden rounded-full border-2 border-cyan-500/40 shadow-[0_0_36px_rgba(34,211,238,0.25)]">
              <img src={avatar} alt="Johannes Konings avatar" />
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Johannes Konings
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-gray-300">
              Blog posts and notes about AWS, TanStack, TypeScript, and
              practical engineering patterns.
            </p>

            <div className="mb-6 flex items-center justify-center gap-6">
              <a
                href="https://github.com/johanneskonings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 transition-all duration-300 hover:scale-110 hover:text-cyan-300"
              >
                <MdiGithub className="text-4xl" />
              </a>
              <a
                href="https://bsky.app/profile/johanneskonings.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 transition-all duration-300 hover:scale-110 hover:text-blue-300"
              >
                <Fa6BrandsBluesky className="text-4xl" />
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/blog"
                className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-5 py-2 text-sm text-cyan-200 transition-all duration-300 hover:border-cyan-300/70 hover:bg-cyan-500/25"
              >
                Explore Blog
              </a>
              <a
                href="/notes"
                className="rounded-full border border-blue-500/40 bg-blue-500/15 px-5 py-2 text-sm text-blue-200 transition-all duration-300 hover:border-blue-300/70 hover:bg-blue-500/25"
              >
                Browse Notes
              </a>
              <a
                href="/search"
                className="rounded-full border border-gray-500/40 bg-gray-800/50 px-5 py-2 text-sm text-gray-200 transition-all duration-300 hover:border-gray-300/70 hover:bg-gray-700/60"
              >
                Search
              </a>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-cyan-200">
                Latest Posts
              </h2>
              <a
                href="/blog"
                className="text-sm text-cyan-300 hover:text-cyan-200"
              >
                View all posts →
              </a>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-200">
                Latest Notes
              </h2>
              <a
                href="/notes"
                className="text-sm text-blue-300 hover:text-blue-200"
              >
                View all notes →
              </a>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {recentNotes.map((note) => (
                <NoteCard key={note.slug} note={note} />
              ))}
            </div>
          </section>

          <footer className="mt-14 border-t border-cyan-500/15 pt-6 text-center text-sm text-gray-400">
            <a href="/legal/terms" className="hover:text-cyan-200">
              Terms
            </a>{" "}
            |{" "}
            <a href="/legal/privacy" className="hover:text-cyan-200">
              Privacy
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
