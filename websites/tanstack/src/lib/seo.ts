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

interface SEOHeadConfig extends SEOProps {
  structuredData?: Record<string, unknown>;
}

function getFullTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

// Generate TanStack Router head descriptor arrays for a page.
export function generateSEOHead({
  title,
  description,
  url,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  structuredData,
}: SEOHeadConfig) {
  const fullUrl = url ? toAbsoluteUrl(url) : SITE_URL;
  const fullTitle = getFullTitle(title);
  const fullImage = image ? toAbsoluteUrl(image) : undefined;

  const meta = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: fullUrl },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: fullImage ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
  ];

  if (fullImage) {
    meta.push(
      { property: "og:image", content: fullImage },
      { name: "twitter:image", content: fullImage },
    );
  }

  if (publishedTime) {
    meta.push({ property: "article:published_time", content: publishedTime });
  }

  if (modifiedTime) {
    meta.push({ property: "article:modified_time", content: modifiedTime });
  }

  if (tags && tags.length > 0) {
    meta.push({ name: "keywords", content: tags.join(", ") });
    for (const tag of tags) {
      meta.push({ property: "article:tag", content: tag });
    }
  }

  if (structuredData) {
    return {
      meta,
      links: [{ rel: "canonical", href: fullUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structuredData),
        },
      ],
    };
  }
  return {
    meta,
    links: [{ rel: "canonical", href: fullUrl }],
  };
}

function getPostImage(post: (typeof allPosts)[0]) {
  if (post.cover_image) {
    return post.cover_image;
  }

  if (post.thumbnail) {
    return `/img/${post.thumbnail}.png`;
  }

  return undefined;
}

// Generate SEO head descriptors for a blog post.
export function generatePostSEOHead(post: (typeof allPosts)[0]) {
  return generateSEOHead({
    title: post.title,
    description: post.summary,
    url: post.url,
    image: getPostImage(post),
    type: "article",
    publishedTime: post.date.toISOString(),
    modifiedTime: post.date.toISOString(),
    tags: [...post.tags, ...post.categories],
    structuredData: generatePostStructuredData(post),
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
    ...(getPostImage(post) && {
      image: {
        "@type": "ImageObject",
        url: toAbsoluteUrl(getPostImage(post)!),
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

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Notes and posts on AWS and TanStack.",
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
  };
}
