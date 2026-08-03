import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { format } from "date-fns";
import { useMemo } from "react";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { BlogMarkdown } from "../../components/blog/BlogMarkdown";
import { Giscus } from "../../components/Giscus";
import { TableOfContents } from "../../components/blog/TableOfContents";
import { RelatedPosts } from "../../components/blog/RelatedPosts";
import { ReadingProgressBar } from "../../components/blog/ReadingProgressBar";
import { ShareButtons } from "../../components/blog/ShareButtons";
import {
  parseBlogMarkdown,
  stripSiteBaseurl,
  tocHeadingsFromDocument,
} from "../../lib/blog-markdown";
import { getSeriesContext, getRelatedPosts } from "../../lib/content-utils";
import { createRouteHead, generatePostSEO, generatePostStructuredData } from "../../lib/seo";

export const Route = createFileRoute("/blog/$postId")({
  head: ({ params }) => {
    const post = allPosts.find(
      (candidate) => candidate.slug === params.postId && candidate.published,
    );

    if (!post) {
      return {};
    }

    return createRouteHead({
      seo: generatePostSEO(post),
      structuredData: generatePostStructuredData(post),
    });
  },
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const { postId } = params;

    if (
      postId.endsWith(".png") ||
      postId.endsWith(".jpg") ||
      postId.endsWith(".jpeg") ||
      postId.endsWith(".gif")
    ) {
      throw notFound();
    }

    const post = allPosts.find((p) => p.slug === postId);
    if (!post || !post.published) {
      throw notFound();
    }

    return { post };
  },
});

function RouteComponent() {
  const { post } = Route.useRouteContext();

  const document = useMemo(() => parseBlogMarkdown(stripSiteBaseurl(post.content)), [post.content]);
  const headings = tocHeadingsFromDocument(document);

  const seriesContext = getSeriesContext(post);
  const relatedPosts = getRelatedPosts(post, 3);

  return (
    <>
      <ReadingProgressBar />
      <BlogLayout>
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <nav className="mb-6">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blog
            </Link>
          </nav>

          {/* Series banner */}
          {seriesContext && (
            <div className="mb-6 py-2 px-4 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                Part {seriesContext.index} of {seriesContext.total} ·{" "}
                <Link
                  to="/blog/series/$seriesSlug"
                  params={{ seriesSlug: seriesContext.seriesSlug }}
                  className="font-medium hover:underline"
                >
                  {seriesContext.seriesSlug
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </Link>
              </p>
            </div>
          )}

          {/* Article header */}
          <header className="mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>

              <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
                <time dateTime={post.date.toISOString()}>{format(post.date, "MMMM d, yyyy")}</time>
                <span>•</span>
                <span>{post.readingTime.text}</span>
              </div>

              {post.summary && (
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  {post.summary}
                </p>
              )}
            </div>

            {post.cover_image && (
              <figure className="mb-8">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-3 shadow-xl dark:border-gray-600/40 dark:bg-gray-800/70">
                  <img
                    src={post.cover_image}
                    alt={`Cover image for ${post.title}`}
                    className="mx-auto h-auto max-h-[32rem] w-full rounded-xl object-contain"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </figure>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to="/blog/tag/$tag"
                    params={{ tag }}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <TableOfContents headings={headings} />

          {/* Article content */}
          <div className="markdown-content max-w-none">
            <BlogMarkdown document={document} imageSlug={post.slug} />
          </div>

          {/* Article footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Published on {format(post.date, "MMMM d, yyyy")}
              </p>
              <ShareButtons title={post.title} url={post.url} />

              {seriesContext && (seriesContext.prev || seriesContext.next) && (
                <nav className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                  {seriesContext.prev ? (
                    <Link
                      to={seriesContext.prev.url}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      ← Previous: {seriesContext.prev.title}
                    </Link>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">← Previous</span>
                  )}
                  {seriesContext.next ? (
                    <Link
                      to={seriesContext.next.url}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Next: {seriesContext.next.title} →
                    </Link>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">Next →</span>
                  )}
                </nav>
              )}

              {post.categories.length > 0 && (
                <div className="mt-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Categories: </span>
                  {post.categories.map((category, index) => (
                    <span key={category}>
                      <Link
                        to="/blog/category/$category"
                        params={{ category }}
                        className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {category}
                      </Link>
                      {index < post.categories.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <RelatedPosts posts={relatedPosts} />
            <Giscus category="blog" />
          </footer>
        </article>
      </BlogLayout>
    </>
  );
}
