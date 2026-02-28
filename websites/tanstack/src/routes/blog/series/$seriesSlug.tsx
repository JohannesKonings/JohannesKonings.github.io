import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { getPostsBySeries, getAllSeries } from "../../../lib/content-utils";
import { BlogLayout } from "../../../components/blog/BlogLayout";
import { BlogPostList } from "../../../components/blog/BlogPostList";

export const Route = createFileRoute("/blog/series/$seriesSlug")({
  component: SeriesPage,
  beforeLoad: ({ params }) => {
    const { seriesSlug } = params;
    const allSeries = getAllSeries();
    if (!allSeries.includes(seriesSlug)) {
      throw notFound();
    }
    const posts = getPostsBySeries(seriesSlug);
    const seriesTitle = formatSeriesTitle(seriesSlug);
    return { posts, seriesSlug, seriesTitle };
  },
});

function formatSeriesTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function SeriesPage() {
  const { posts, seriesSlug, seriesTitle } = Route.useRouteContext();

  return (
    <BlogLayout
      title={`Series: ${seriesTitle}`}
      description={`Blog posts in the ${seriesTitle} series`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100 mb-2">
            Series: {seriesTitle}
          </h2>
          <p className="text-cyan-700 dark:text-cyan-300 mb-4">
            {posts.length} post{posts.length !== 1 ? "s" : ""} in this series
          </p>
          <Link
            to="/blog"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            ← All blog posts
          </Link>
        </div>
      </div>

      <BlogPostList posts={posts} showFilters={false} />
    </BlogLayout>
  );
}
