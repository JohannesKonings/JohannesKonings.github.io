import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { allPosts } from "../../lib/content-collections";
import { BlogLayout } from "../../components/blog/BlogLayout";
import { BlogPostList } from "../../components/blog/BlogPostList";
import { createRouteHead, generateBlogListingStructuredData, generateSEOTags } from "../../lib/seo";
import { siteConfig } from "../../lib/site";

export const Route = createFileRoute("/blog/")({
  head: () =>
    createRouteHead({
      seo: generateSEOTags({
        title: "Blog",
        description: "Posts on AWS and TanStack.",
        url: "/blog",
        image: siteConfig.defaultSocialImage,
      }),
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
