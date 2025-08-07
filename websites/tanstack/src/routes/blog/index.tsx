import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { BlogPostList } from "../../components/blog/BlogPostList";

export const Route = createFileRoute("/blog/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Filter for published posts and sort by date (newest first)
  const publishedPosts = React.useMemo(() => {
    return allPosts
      .filter(post => post.published)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return (
    <BlogLayout
      title="Blog"
      description="Insights on AWS, React, TypeScript, and modern web development"
    >
      <BlogPostList posts={publishedPosts} />
    </BlogLayout>
  );
}
