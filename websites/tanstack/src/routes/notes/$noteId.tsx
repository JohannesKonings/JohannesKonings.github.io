import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { allNotes } from "content-collections";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { CodeBlock } from "../../components/blog/CodeBlock";
import { generateSEOHead } from "../../lib/seo";

export const Route = createFileRoute("/notes/$noteId")({
  head: ({ params }) => {
    const note = allNotes.find((n) => n.slug === params.noteId && n.published);

    if (!note) {
      return generateSEOHead({
        title: "Note",
        description: "Technical note.",
        url: `/notes/${params.noteId}`,
      });
    }

    return generateSEOHead({
      title: note.title,
      description: note.summary || note.excerpt || "Technical note.",
      url: note.url,
      tags: note.tags,
      type: "article",
      publishedTime: note.date.toISOString(),
      modifiedTime: note.date.toISOString(),
    });
  },
  component: NoteDetailPage,
  beforeLoad: ({ params }) => {
    const { noteId } = params;

    // Ignore image requests
    if (
      noteId.endsWith(".png") ||
      noteId.endsWith(".jpg") ||
      noteId.endsWith(".jpeg") ||
      noteId.endsWith(".gif")
    ) {
      throw notFound();
    }

    // Find the note by slug
    const note = allNotes.find((n) => n.slug === noteId);
    if (!note || !note.published) {
      throw notFound();
    }

    return { note };
  },
});

function NoteDetailPage() {
  const { note } = Route.useRouteContext();
  const getLanguage = (className?: string) => {
    const langMatch = (className ?? "").match(/language-([\w-]+)/);
    return langMatch ? langMatch[1] : "typescript";
  };

  const getCodeText = (children: unknown) => {
    if (typeof children === "string") return children;
    return String(children ?? "");
  };

  return (
    <BlogLayout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Note header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link
              to="/notes"
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Notes
            </Link>
            <span>/</span>
            <span>{note.title}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {note.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <time dateTime={note.date.toISOString()}>
              {format(note.date, "MMMM d, yyyy")}
            </time>
            <span>•</span>
            <span>{note.readingTime.text}</span>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Note content */}
        <div className="markdown-content max-w-none">
          <Markdown
            options={{
              overrides: {
                pre: {
                  component: ({ children, ...props }) => {
                    const child = Array.isArray(children)
                      ? children[0]
                      : children;
                    if (
                      child &&
                      typeof child === "object" &&
                      "props" in child
                    ) {
                      const codeProps = (
                        child as {
                          props?: { className?: string; children?: unknown };
                        }
                      ).props;
                      const language = getLanguage(codeProps?.className);
                      const code = getCodeText(codeProps?.children);
                      return <CodeBlock code={code} language={language} />;
                    }
                    const preProps = props as { className?: string };
                    const language = getLanguage(preProps.className);
                    const code = getCodeText(children);
                    return <CodeBlock code={code} language={language} />;
                  },
                },
                // Custom styling for inline code
                code: {
                  component: ({ children, className, ...props }) => {
                    if (className?.includes("language-")) {
                      const language = getLanguage(className);
                      const code = getCodeText(children);
                      return <CodeBlock code={code} language={language} />;
                    }

                    return (
                      <code
                        {...props}
                        className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm"
                      >
                        {children}
                      </code>
                    );
                  },
                },
                // Custom styling for images
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
            {note.content}
          </Markdown>
        </div>

        {/* Note footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated on {format(note.date, "MMMM d, yyyy")}
            </p>

            <Link
              to="/notes"
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              ← Back to Notes
            </Link>
          </div>

          {note.categories.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Categories:{" "}
              </span>
              {note.categories.map((category, index) => (
                <span key={category}>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                  {index < note.categories.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
        </footer>
      </article>
    </BlogLayout>
  );
}
