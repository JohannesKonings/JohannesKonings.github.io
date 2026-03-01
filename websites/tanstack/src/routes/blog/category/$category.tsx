import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  getPostsByCategory,
  getAllCategories,
} from "../../../lib/content-utils";
import { BlogLayout } from "../../../components/blog/BlogLayout";
import { BlogPostList } from "../../../components/blog/BlogPostList";
import { buildSEOHead } from "../../../lib/seo";

export const Route = createFileRoute("/blog/category/$category")({
  head: ({ params }) => {
    const category = params.category;
    const posts = getPostsByCategory(category);

    return buildSEOHead({
      title: `Posts in "${category}" category`,
      description: `${posts.length} blog post${posts.length === 1 ? "" : "s"} in the ${category} category.`,
      url: `/blog/category/${encodeURIComponent(category)}`,
      tags: [category],
    });
  },
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const { category } = params;
    const allCategories = getAllCategories();

    if (!allCategories.includes(category)) {
      throw notFound();
    }

    const posts = getPostsByCategory(category);
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
