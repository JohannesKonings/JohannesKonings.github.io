import { createFileRoute } from "@tanstack/react-router";
import { getPostsByTag } from "../../../lib/content-utils";
import { BlogLayout } from "../../../components/blog/BlogLayout";
import { BlogPostList } from "../../../components/blog/BlogPostList";
import { generateSEOHead } from "../../../lib/seo";

export const Route = createFileRoute("/blog/tag/$tag")({
  head: ({ params }) =>
    generateSEOHead({
      title: `Tag: ${params.tag}`,
      description: `Blog posts tagged with ${params.tag}.`,
      url: `/blog/tag/${params.tag}`,
    }),
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const { tag } = params;
    const posts = getPostsByTag(tag);
    return { posts, tag };
  },
});

function RouteComponent() {
  const { posts, tag } = Route.useRouteContext();

  return (
    <BlogLayout
      title={`Posts tagged with "${tag}"`}
      description={`All blog posts tagged with ${tag}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            Tag: {tag}
          </h2>
          <p className="text-blue-700 dark:text-blue-300">
            {posts.length} post{posts.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <BlogPostList posts={posts} showFilters={false} />
    </BlogLayout>
  );
}
