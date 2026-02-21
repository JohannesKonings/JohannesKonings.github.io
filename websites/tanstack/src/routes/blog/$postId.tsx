import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { BlogLayout } from "../../components/blog/BlogLayout";
import {
  getAdjacentPosts,
  getPostBySlug,
  getRelatedPosts,
} from "../../lib/content-utils";
import { ContentTOC } from "../../components/ContentTOC";
import { PrevNextNav } from "../../components/PrevNextNav";
import { BlogPostCard } from "../../components/blog/BlogPostCard";
import { Comments } from "../../components/Comments";

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getNodeText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getNodeText).join("");
  }

  if (children && typeof children === "object" && "props" in children) {
    return getNodeText((children as { props?: { children?: ReactNode } }).props?.children);
  }

  return "";
}

export const Route = createFileRoute("/blog/$postId")({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const { postId } = params;

    // Ignore image requests
    if (
      postId.endsWith(".png") ||
      postId.endsWith(".jpg") ||
      postId.endsWith(".jpeg") ||
      postId.endsWith(".gif")
    ) {
      throw notFound();
    }

    if (postId === "2025-01-02-aws-application-config-lambda-cdk") {
      throw redirect({
        to: "/blog/$postId",
        params: {
          postId: "2025-01-02-aws-application-signals-config-lambda-cdk",
        },
      });
    }

    const post = getPostBySlug(postId);
    if (!post) {
      throw notFound();
    }

    return { post };
  },
});

function RouteComponent() {
  const { post } = Route.useRouteContext();
  const relatedPosts = getRelatedPosts(post, 3);
  const { prev, next } = getAdjacentPosts(post);

  return (
    <BlogLayout title={post.title} description={post.summary}>
      <article className="mx-auto max-w-5xl px-2 sm:px-4 lg:px-6">
        {/* Article header */}
        <header className="mb-8">
          <div className="text-center mb-8">
            <h1 className="mb-4 text-3xl font-bold text-gray-100 md:text-5xl">
              {post.title}
            </h1>

            <div className="mb-6 flex items-center justify-center gap-4 text-gray-400">
              <time dateTime={post.date.toISOString()}>
                {format(post.date, "MMMM d, yyyy")}
              </time>
              <span>•</span>
              <span className="text-cyan-300">{post.readingTime.text}</span>
            </div>

            {post.summary && (
              <p className="mx-auto max-w-3xl text-xl text-gray-300">
                {post.summary}
              </p>
            )}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200 transition-colors hover:border-cyan-400/60 hover:text-cyan-100"
                >
                  {tag}
                </a>
              ))}
            </div>
          )}
        </header>

        <ContentTOC headings={post.headings} />

        <div className="prose prose-invert max-w-none prose-pre:bg-gray-950 prose-pre:border prose-pre:border-cyan-500/20 prose-headings:text-gray-100 prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:text-cyan-200">
          <Markdown
            options={{
              overrides: {
                pre: {
                  component: ({ children, ...props }) => (
                    <pre
                      {...props}
                      className="overflow-x-auto rounded-lg border border-cyan-500/20 bg-gray-950 p-4"
                    >
                      {children}
                    </pre>
                  ),
                },
                code: {
                  component: ({ children, ...props }) => (
                    <code
                      {...props}
                      className="rounded bg-gray-950 px-1 py-0.5 text-sm text-cyan-100"
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
                      className="mx-auto rounded-lg border border-cyan-500/20 shadow-md"
                      loading="lazy"
                    />
                  ),
                },
                h2: {
                  component: ({ children, ...props }) => {
                    const headingText = getNodeText(children);
                    const headingId = slugifyHeading(headingText);
                    return (
                      <h2
                        {...props}
                        id={headingId}
                        className="scroll-mt-24 text-2xl font-bold text-gray-100"
                      >
                        {children}
                      </h2>
                    );
                  },
                },
                h3: {
                  component: ({ children, ...props }) => {
                    const headingText = getNodeText(children);
                    const headingId = slugifyHeading(headingText);
                    return (
                      <h3
                        {...props}
                        id={headingId}
                        className="scroll-mt-24 text-xl font-semibold text-gray-100"
                      >
                        {children}
                      </h3>
                    );
                  },
                },
              },
            }}
          >
            {post.renderedContent}
          </Markdown>
        </div>

        {/* Article footer */}
        <footer className="mt-12 border-t border-cyan-500/20 pt-8">
          <div className="text-center">
            <p className="text-gray-400">
              Published on {format(post.date, "MMMM d, yyyy")}
            </p>

            {post.categories.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-gray-400">
                  Categories:{" "}
                </span>
                {post.categories.map((category, index) => (
                  <span key={category}>
                    <a
                      href={`/blog/category/${encodeURIComponent(category)}`}
                      className="text-sm text-gray-200 transition-colors hover:text-cyan-200"
                    >
                      {category}
                    </a>
                    {index < post.categories.length - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
          </div>
        </footer>

        <PrevNextNav
          prev={prev ? { title: prev.title, url: prev.url } : undefined}
          next={next ? { title: next.title, url: next.url } : undefined}
        />

        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-semibold text-cyan-200">
              Related posts
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </section>
        )}

        <Comments />
      </article>
    </BlogLayout>
  );
}
