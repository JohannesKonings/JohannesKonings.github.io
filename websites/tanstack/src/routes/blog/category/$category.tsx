import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPostsByCategory } from "../../../lib/content-utils";
import { BlogLayout } from "../../../components/blog/BlogLayout";
import { BlogPostList } from "../../../components/blog/BlogPostList";
import { generateSEOHead } from "../../../lib/seo";

export const Route = createFileRoute("/blog/category/$category")({
  head: ({ params }) =>
    generateSEOHead({
      title: `Category: ${params.category}`,
      description: `Blog posts in the ${params.category} category.`,
      url: `/blog/category/${params.category}`,
    }),
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const { category } = params;
    const posts = getPostsByCategory(category);
    if (posts.length === 0) {
      throw notFound();
    }
    return { posts, category };
  },
});

function RouteComponent() {
  const { posts, category } = Route.useRouteContext();

  return (
    <BlogLayout
      title={`Posts in "${category}" category`}
      description={`All blog posts in the ${category} category`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
            Category: {category}
          </h2>
          <p className="text-green-700 dark:text-green-300">
            {posts.length} post{posts.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <BlogPostList posts={posts} showFilters={false} />
    </BlogLayout>
  );
}
