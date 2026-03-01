import { createFileRoute } from "@tanstack/react-router";
import { allPosts, allNotes } from "content-collections";
import { BlogLayout } from "../components/blog/BlogLayout";
import { Search as SearchComponent } from "../components/search/Search";
import { buildSEOHead } from "../lib/seo";

export const Route = createFileRoute("/search")({
  head: () =>
    buildSEOHead({
      title: "Search",
      description: "Search all blog posts and notes by keyword.",
      url: "/search",
    }),
  component: SearchPage,
  loader: () => {
    // Map blog posts to search items
    const postItems = allPosts
      .filter((p) => p.published)
      .map((post) => ({
        type: "blog" as const,
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        excerpt: post.excerpt,
        tags: post.tags.join(" "),
        url: post.url,
      }));

    // Map notes to search items
    const noteItems = allNotes
      .filter((n) => n.published)
      .map((note) => ({
        type: "note" as const,
        slug: note.slug,
        title: note.title,
        summary: note.summary,
        excerpt: note.excerpt,
        tags: note.tags.join(" "),
        url: note.url,
      }));

    // Combine both into a single searchable array
    const items = [...postItems, ...noteItems];
    return { items };
  },
});

function SearchPage() {
  const { items } = Route.useLoaderData();
  return (
    <BlogLayout title="Search" description="Search blog posts and notes">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SearchComponent items={items} />
      </div>
    </BlogLayout>
  );
}
