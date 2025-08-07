import { createFileRoute, notFound } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";
import { BlogLayout } from "../../components/blog/BlogLayout";

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
    
    // Find the post by slug
    const post = allPosts.find(p => p.slug === postId);
    if (!post || !post.published) {
      throw notFound();
    }
    
    return { post };
  },
});

function RouteComponent() {
  const { post } = Route.useRouteContext();

  // Process markdown content to fix image paths
  const processedContent = post.content.replace(
    /!\[([^\]]*)\]\(([^)]+\.png)\)/g,
    (match, altText, imagePath) => {
      // Update image path to point to the correct location
      return `![${altText}](/content/blog/${post.slug}/${imagePath})`;
    }
  );

  return (
    <BlogLayout title={post.title} description={post.summary}>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <a
                  key={tag}
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  {tag}
                </a>
              ))}
            </div>
          )}
        </header>

        {/* Article content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <Markdown
            options={{
              overrides: {
                // Custom styling for code blocks
                pre: {
                  component: ({ children, ...props }) => (
                    <pre
                      {...props}
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto"
                    >
                      {children}
                    </pre>
                  ),
                },
                // Custom styling for inline code
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
                // Custom styling for images
                img: {
                  component: ({ src, alt, ...props }) => (
                    <img
                      {...props}
                      src={src}
                      alt={alt}
                      className="rounded-lg shadow-md mx-auto"
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
            
            {post.categories.length > 0 && (
              <div className="mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Categories: </span>
                {post.categories.map((category, index) => (
                  <span key={category}>
                    <a
                      href={`/blog/category/${encodeURIComponent(category)}`}
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
      </article>
    </BlogLayout>
  );
}
