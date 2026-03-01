import type { allPosts } from "content-collections";
import { SITE_AUTHOR, SITE_NAME, SITE_URL, toAbsoluteUrl } from "../../lib/site";

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
  const fullUrl = url ? toAbsoluteUrl(url) : SITE_URL;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    canonical: fullUrl,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      type,
      siteName: SITE_NAME,
      ...(image && { images: [{ url: toAbsoluteUrl(image) }] }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image && { images: [{ url: toAbsoluteUrl(image) }] }),
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
    image: post.thumbnail ? `/img/${post.thumbnail}.png` : undefined,
    type: "article",
    publishedTime: post.date.toISOString(),
    tags: [...post.tags, ...post.categories],
  });
}

// Generate structured data for a blog post
export function generatePostStructuredData(post: (typeof allPosts)[0]) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    url: toAbsoluteUrl(post.url),
    datePublished: post.date.toISOString(),
    dateModified: post.date.toISOString(), // We could add lastModified field to content collections
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(post.url),
    },
    ...((post.cover_image || post.thumbnail) && {
      image: {
        "@type": "ImageObject",
        url: post.cover_image
          ? toAbsoluteUrl(post.cover_image)
          : toAbsoluteUrl(`/img/${post.thumbnail}.png`),
      },
    }),
    keywords: [...post.tags, ...post.categories].join(", "),
    wordCount: post.readingTime.words,
    timeRequired: `PT${post.readingTime.minutes}M`,
  };
}

// Generate structured data for blog listing
export function generateBlogListingStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description: "Posts on aws and TanStack",
    url: toAbsoluteUrl("/blog"),
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}
