import type { allPosts } from "content-collections";
import { siteConfig, toAbsoluteAssetUrl, toAbsoluteUrl } from "./site";

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

interface RouteHeadInput {
  seo: ReturnType<typeof generateSEOTags>;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function getFullTitle(title: string) {
  return title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
}

function getPostImage(post: (typeof allPosts)[0]) {
  return post.cover_image;
}

// Generate SEO meta tags for a page
export function generateSEOTags({
  title,
  description,
  url,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: SEOProps) {
  const fullUrl = url ? toAbsoluteUrl(url) : siteConfig.baseUrl;
  const fullTitle = getFullTitle(title);
  const imageUrl = toAbsoluteAssetUrl(image);
  const resolvedImageAlt = imageAlt ?? siteConfig.defaultSocialImageAlt;
  const keywords = tags ? Array.from(new Set(tags.filter(Boolean))).join(", ") : undefined;

  return {
    title: fullTitle,
    description,
    canonical: fullUrl,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      type,
      siteName: siteConfig.name,
      ...(imageUrl && { images: [{ url: imageUrl, alt: resolvedImageAlt }] }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      ...(imageUrl && { images: [{ url: imageUrl, alt: resolvedImageAlt }] }),
    },
    ...(keywords && { keywords }),
  };
}

export function createRouteHead({ seo, structuredData }: RouteHeadInput) {
  const structuredDataItems = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];

  return {
    meta: [
      { title: seo.title },
      { name: "title", content: seo.title },
      { name: "description", content: seo.description },
      ...(seo.keywords ? [{ name: "keywords", content: seo.keywords }] : []),
      { property: "og:title", content: seo.openGraph.title },
      { property: "og:description", content: seo.openGraph.description },
      { property: "og:url", content: seo.openGraph.url },
      { property: "og:type", content: seo.openGraph.type },
      { property: "og:site_name", content: seo.openGraph.siteName },
      ...(seo.openGraph.images?.[0]
        ? [{ property: "og:image", content: seo.openGraph.images[0].url }]
        : []),
      ...(seo.openGraph.images?.[0]?.alt
        ? [{ property: "og:image:alt", content: seo.openGraph.images[0].alt }]
        : []),
      ...(seo.openGraph.publishedTime
        ? [{ property: "article:published_time", content: seo.openGraph.publishedTime }]
        : []),
      ...(seo.openGraph.modifiedTime
        ? [{ property: "article:modified_time", content: seo.openGraph.modifiedTime }]
        : []),
      { name: "twitter:card", content: seo.twitter.card },
      { name: "twitter:title", content: seo.twitter.title },
      { name: "twitter:description", content: seo.twitter.description },
      ...(seo.twitter.images?.[0]
        ? [{ name: "twitter:image", content: seo.twitter.images[0].url }]
        : []),
      ...(seo.twitter.images?.[0]?.alt
        ? [{ name: "twitter:image:alt", content: seo.twitter.images[0].alt }]
        : []),
    ],
    links: [{ rel: "canonical", href: seo.canonical }],
    scripts: structuredDataItems.map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
  };
}

// Generate SEO tags for a blog post
export function generatePostSEO(post: (typeof allPosts)[0]) {
  return generateSEOTags({
    title: post.title,
    description: post.summary,
    url: post.url,
    image: getPostImage(post),
    imageAlt: post.title,
    type: "article",
    publishedTime: post.date.toISOString(),
    modifiedTime: post.date.toISOString(),
    tags: [...post.tags, ...post.categories],
  });
}

// Generate structured data for a blog post
export function generatePostStructuredData(post: (typeof allPosts)[0]) {
  const postUrl = toAbsoluteUrl(post.url);
  const imageUrl = toAbsoluteAssetUrl(getPostImage(post));

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    url: postUrl,
    datePublished: post.date.toISOString(),
    dateModified: post.date.toISOString(),
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    ...(imageUrl && {
      image: {
        "@type": "ImageObject",
        url: imageUrl,
      },
    }),
    keywords: [...post.tags, ...post.categories].join(", "),
    wordCount: post.readingTime.words,
    timeRequired: `PT${post.readingTime.minutes}M`,
  };
}

// Generate structured data for blog listing
export function generateBlogListingStructuredData() {
  const imageUrl = toAbsoluteAssetUrl(siteConfig.defaultSocialImage);

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.name} Blog`,
    description: "Posts on AWS and TanStack.",
    url: toAbsoluteUrl("/blog"),
    ...(imageUrl && { image: imageUrl }),
    author: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
  };
}
