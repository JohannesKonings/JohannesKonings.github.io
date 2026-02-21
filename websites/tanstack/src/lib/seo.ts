import type { allPosts } from "content-collections";

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

// Generate SEO meta tags for a page
export function generateSEOTags({
  title,
  description,
  url,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: SEOProps) {
  const siteName = "Johannes Konings";
  const baseUrl = "https://johanneskonings.dev";
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    canonical: fullUrl,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      type,
      siteName,
      ...(image && { images: [{ url: `${baseUrl}${image}` }] }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image && { images: [{ url: `${baseUrl}${image}` }] }),
    },
    ...(tags && { keywords: tags.join(", ") }),
  };
}

// Generate SEO tags for a blog post
export function generatePostSEO(post: (typeof allPosts)[0]) {
  return generateSEOTags({
    title: post.title,
    description: post.summary,
    url: post.url,
    image: post.cover_image ?? (post.thumbnail ? `/img/${post.thumbnail}.png` : undefined),
    type: "article",
    publishedTime: post.date.toISOString(),
    tags: [...post.tags, ...post.categories],
  });
}

// Generate structured data for a blog post
export function generatePostStructuredData(post: (typeof allPosts)[0]) {
  const baseUrl = "https://johanneskonings.dev";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    url: `${baseUrl}${post.url}`,
    datePublished: post.date.toISOString(),
    dateModified: post.date.toISOString(), // We could add lastModified field to content collections
    author: {
      "@type": "Person",
      name: "Johannes Konings",
      url: "https://johanneskonings.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Johannes Konings",
      url: "https://johanneskonings.dev",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}${post.url}`,
    },
    ...((post.cover_image || post.thumbnail) && {
      image: {
        "@type": "ImageObject",
        url: post.cover_image
          ? `${baseUrl}${post.cover_image}`
          : `${baseUrl}/img/${post.thumbnail}.png`,
      },
    }),
    keywords: [...post.tags, ...post.categories].join(", "),
    wordCount: post.readingTime.words,
    timeRequired: `PT${post.readingTime.minutes}M`,
  };
}

// Generate structured data for blog listing
export function generateBlogListingStructuredData() {
  const baseUrl = "https://johanneskonings.dev";

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Johannes Konings Blog",
    description:
      "Insights on AWS, React, TypeScript, and modern web development",
    url: `${baseUrl}/blog`,
    author: {
      "@type": "Person",
      name: "Johannes Konings",
      url: "https://johanneskonings.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Johannes Konings",
      url: "https://johanneskonings.dev",
    },
  };
}
