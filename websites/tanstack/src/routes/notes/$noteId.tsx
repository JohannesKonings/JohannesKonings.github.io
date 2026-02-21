import { createFileRoute, notFound } from "@tanstack/react-router";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { ContentTOC } from "../../components/ContentTOC";
import { PrevNextNav } from "../../components/PrevNextNav";
import { Comments } from "../../components/Comments";
import { getAdjacentNotes, getNoteBySlug } from "../../lib/content-utils";

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
    return getNodeText(
      (children as { props?: { children?: ReactNode } }).props?.children,
    );
  }

  return "";
}

export const Route = createFileRoute("/notes/$noteId")({
  component: NoteRouteComponent,
  beforeLoad: ({ params }) => {
    const note = getNoteBySlug(params.noteId);
    if (!note) {
      throw notFound();
    }

    return { note };
  },
});

function NoteRouteComponent() {
  const { note } = Route.useRouteContext();
  const { prev, next } = getAdjacentNotes(note);

  return (
    <BlogLayout title={note.title} description={note.summary || "Note details"}>
      <article className="mx-auto max-w-4xl px-2 sm:px-4">
        <header className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-100 md:text-5xl">
            {note.title}
          </h1>
          <p className="text-gray-400">{format(note.date, "MMMM d, yyyy")}</p>
        </header>

        <ContentTOC headings={note.headings} />

        <div className="prose prose-invert max-w-none prose-pre:bg-gray-950 prose-pre:border prose-pre:border-blue-500/20 prose-a:text-blue-300 prose-a:no-underline hover:prose-a:text-blue-200">
          <Markdown
            options={{
              overrides: {
                pre: {
                  component: ({ children, ...props }) => (
                    <pre
                      {...props}
                      className="overflow-x-auto rounded-lg border border-blue-500/20 bg-gray-950 p-4"
                    >
                      {children}
                    </pre>
                  ),
                },
                code: {
                  component: ({ children, ...props }) => (
                    <code
                      {...props}
                      className="rounded bg-gray-950 px-1 py-0.5 text-sm text-blue-100"
                    >
                      {children}
                    </code>
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
            {note.renderedContent}
          </Markdown>
        </div>

        <PrevNextNav
          prev={prev ? { title: prev.title, url: prev.url } : undefined}
          next={next ? { title: next.title, url: next.url } : undefined}
        />

        <Comments />
      </article>
    </BlogLayout>
  );
}
