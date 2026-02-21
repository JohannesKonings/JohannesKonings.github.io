import { createFileRoute } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { BlogLayout } from "../components/blog/BlogLayout";
import { Search as SearchComponent } from "../components/search/Search";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  loader: () => {
    const items = allPosts
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
    return { items };
  },
});

function SearchPage() {
  const { items } = Route.useLoaderData();
  return (
    <BlogLayout
      title="Search"
      description="Search blog posts and notes"
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SearchComponent items={items} />
      </div>
    </BlogLayout>
  );
}
