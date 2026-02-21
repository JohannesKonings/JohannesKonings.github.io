import { createFileRoute, notFound } from "@tanstack/react-router";
import Markdown from "markdown-to-jsx";
import { format } from "date-fns";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { getLegalDocBySlug } from "../../lib/content-utils";

export const Route = createFileRoute("/legal/$slug")({
  component: LegalDocRouteComponent,
  beforeLoad: ({ params }) => {
    const legalDoc = getLegalDocBySlug(params.slug);
    if (!legalDoc) {
      throw notFound();
    }

    return {
      legalDoc,
    };
  },
});

function LegalDocRouteComponent() {
  const { legalDoc } = Route.useRouteContext();

  return (
    <BlogLayout
      title={legalDoc.title}
      description={`${legalDoc.title} for Johannes Konings`}
    >
      <article className="mx-auto max-w-4xl px-2 sm:px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-100">{legalDoc.title}</h1>
          <p className="mt-2 text-sm text-gray-400">
            Last updated: {format(legalDoc.date, "MMMM d, yyyy")}
          </p>
        </header>

        <div className="prose prose-invert max-w-none prose-a:text-cyan-300 prose-a:no-underline hover:prose-a:text-cyan-200">
          <Markdown>{legalDoc.renderedContent}</Markdown>
        </div>
      </article>
    </BlogLayout>
  );
}
