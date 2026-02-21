import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { BlogPostList } from "../../components/blog/BlogPostList";
import { getPublishedPosts } from "../../lib/content-utils";

export const Route = createFileRoute("/blog/")({
  component: RouteComponent,
});

function RouteComponent() {
  const publishedPosts = React.useMemo(() => getPublishedPosts(), []);

  return (
    <BlogLayout
      title="Blog"
      description="Writing on AWS, TypeScript, TanStack, and developer workflows."
    >
      <BlogPostList posts={publishedPosts} />
    </BlogLayout>
  );
}
