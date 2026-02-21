import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { CodeBlock } from "../../components/blog/CodeBlock";
import { Giscus } from "../../components/Giscus";
import { TableOfContents } from "../../components/blog/TableOfContents";
import { RelatedPosts } from "../../components/blog/RelatedPosts";
import { ReadingProgressBar } from "../../components/blog/ReadingProgressBar";
import { ShareButtons } from "../../components/blog/ShareButtons";
import { getSeriesContext, getRelatedPosts } from "../../lib/content-utils";

export const Route = createFileRoute("/blog/$postId")({
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

  const processedContent = post.content.replace(
    /\{\{\s*site\.baseurl\s*\}\}/g,
    "",
  );

  const seriesContext = getSeriesContext(post);
  const relatedPosts = getRelatedPosts(post, 3);

  return (
    <>
    <ReadingProgressBar />
    <BlogLayout title={post.title} description={post.summary}>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <nav className="mb-6">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                {seriesContext.seriesSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
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
              <time dateTime={post.date.toISOString()}>
                {format(post.date, "MMMM d, yyyy")}
              </time>
              <span>•</span>
              <span>{post.readingTime.text}</span>
            </div>

            {post.summary && (
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {post.summary}
              </p>
            )}
          </div>

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

        <TableOfContents content={processedContent} />

        {/* Article content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <Markdown
            options={{
              overrides: {
                h2: {
                  component: ({ children, ...props }) => {
                    const text = typeof children === "string" ? children : String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    return <h2 {...props} id={id}>{children}</h2>;
                  },
                },
                h3: {
                  component: ({ children, ...props }) => {
                    const text = typeof children === "string" ? children : String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    return <h3 {...props} id={id}>{children}</h3>;
                  },
                },
                pre: {
                  component: ({ children, ...props }) => {
                    const child = Array.isArray(children) ? children[0] : children;
                    if (child && typeof child === "object" && "type" in child && (child as { type: string }).type === "code") {
                      const codeProps = (child as { props?: { className?: string; children?: string } }).props;
                      const className = codeProps?.className ?? "";
                      const langMatch = className.match(/language-(\w+)/);
                      const language = langMatch ? langMatch[1] : "text";
                      const code = typeof codeProps?.children === "string" ? codeProps.children : String(codeProps?.children ?? "");
                      return <CodeBlock code={code} language={language} />;
                    }
                    return (
                      <pre
                        {...props}
                        className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto"
                      >
                        {children}
                      </pre>
                    );
                  },
                },
                code: {
                  component: ({ children, ...props }) => (
                    <code
                      {...props}
                      className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                    >
                      {children}
                    </code>
                  ),
                },
                img: {
                  component: ({ src, alt, ...props }) => (
                    <img
                      {...props}
                      src={src}
                      alt={alt}
                      className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                      loading="lazy"
                    />
                  ),
                },
              },
            }}
          >
            {processedContent}
          </Markdown>
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Categories:{" "}
                </span>
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
