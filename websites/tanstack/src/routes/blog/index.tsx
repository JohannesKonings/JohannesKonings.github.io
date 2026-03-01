import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { BlogPostList } from "../../components/blog/BlogPostList";
import { generateBlogListingStructuredData, generateSEOHead } from "../../lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    generateSEOHead({
      title: "Blog",
      description: "Posts on AWS, CDK, and TanStack.",
      url: "/blog",
      structuredData: generateBlogListingStructuredData(),
    }),
  component: RouteComponent,
});

function RouteComponent() {
  // Filter for published posts and sort by date (newest first)
  const publishedPosts = React.useMemo(() => {
    return allPosts
      .filter((post) => post.published)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return (
    <BlogLayout title="Blog" description="Posts on aws and TanStack">
      <BlogPostList posts={publishedPosts} />
    </BlogLayout>
  );
}
