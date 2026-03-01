import type { allNotes, allPosts } from "content-collections";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

export const SITE_NAME = "Johannes Konings";
export const SITE_URL = "https://johanneskonings.dev";
export const SITE_DESCRIPTION = "Notes and posts on AWS and TanStack.";
export const DEFAULT_SOCIAL_IMAGE = "/open-graph.jpg";
export const DEFAULT_SOCIAL_IMAGE_ALT = "Johannes Konings social preview";

type SEOType = "website" | "article";

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  type?: SEOType;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

type MetaTag = Record<string, string>;

interface SEOHead {
  meta: MetaTag[];
  links: Array<{ rel: string; href: string }>;
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (ABSOLUTE_URL_PATTERN.test(pathOrUrl)) {
    return pathOrUrl;
  }
  return new URL(pathOrUrl, SITE_URL).toString();
}

function toCanonicalUrl(pathOrUrl?: string): string {
  if (!pathOrUrl) {
    return SITE_URL;
  }
  return toAbsoluteUrl(pathOrUrl);
}

function inferImageMimeType(imageUrl: string): string | undefined {
  const normalizedPath = imageUrl.split("?")[0]?.toLowerCase();

  if (normalizedPath?.endsWith(".png")) return "image/png";
  if (normalizedPath?.endsWith(".jpg") || normalizedPath?.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (normalizedPath?.endsWith(".webp")) return "image/webp";
  if (normalizedPath?.endsWith(".gif")) return "image/gif";
  if (normalizedPath?.endsWith(".avif")) return "image/avif";

  return undefined;
}

export function resolvePostSocialImage(post: (typeof allPosts)[0]): string {
  const coverImage = post.cover_image?.trim();
  if (coverImage) {
    if (coverImage.startsWith("/") || ABSOLUTE_URL_PATTERN.test(coverImage)) {
      return coverImage;
    }

    const normalizedCoverImage = coverImage.replace(/^\.\//, "");
    const normalizedPostUrl = post.url.endsWith("/")
      ? post.url.slice(0, -1)
      : post.url;
    return `${normalizedPostUrl}/${normalizedCoverImage}`;
  }

  if (post.thumbnail) {
    return `/img/${post.thumbnail}.png`;
  }

  return DEFAULT_SOCIAL_IMAGE;
}

export function resolveNoteSocialImage(_note: (typeof allNotes)[0]): string {
  return DEFAULT_SOCIAL_IMAGE;
}

export function buildSEOHead({
  title,
  description,
  url,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: SEOProps): SEOHead {
  const canonical = toCanonicalUrl(url);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const socialImage = toAbsoluteUrl(image ?? DEFAULT_SOCIAL_IMAGE);
  const socialImageAlt = imageAlt ?? DEFAULT_SOCIAL_IMAGE_ALT;
  const imageMimeType = inferImageMimeType(socialImage);

  const meta: MetaTag[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "en_US" },
    { property: "og:url", content: canonical },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: socialImage },
    { property: "og:image:alt", content: socialImageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:url", content: canonical },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: socialImage },
    { name: "twitter:image:alt", content: socialImageAlt },
  ];

  if (imageMimeType) {
    meta.push({ property: "og:image:type", content: imageMimeType });
  }

  if (tags && tags.length > 0) {
    meta.push({ name: "keywords", content: tags.join(", ") });
  }

  if (type === "article") {
    if (publishedTime) {
      meta.push({ property: "article:published_time", content: publishedTime });
    }
    if (modifiedTime) {
      meta.push({ property: "article:modified_time", content: modifiedTime });
    }

    for (const tag of tags ?? []) {
      meta.push({ property: "article:tag", content: tag });
    }
  }

  return {
    meta,
    links: [{ rel: "canonical", href: canonical }],
  };
}

// Generate SEO meta tags for code paths that still consume this structure.
export function generateSEOTags(input: SEOProps) {
  const canonical = toCanonicalUrl(input.url);
  const fullTitle = input.title.includes(SITE_NAME)
    ? input.title
    : `${input.title} | ${SITE_NAME}`;
  const image = input.image ? toAbsoluteUrl(input.image) : undefined;

  return {
    title: fullTitle,
    description: input.description,
    canonical,
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonical,
      type: input.type ?? "website",
      siteName: SITE_NAME,
      ...(image && {
        images: [
          {
            url: image,
            alt: input.imageAlt ?? DEFAULT_SOCIAL_IMAGE_ALT,
          },
        ],
      }),
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      ...(image && {
        images: [
          {
            url: image,
            alt: input.imageAlt ?? DEFAULT_SOCIAL_IMAGE_ALT,
          },
        ],
      }),
    },
    ...(input.tags && input.tags.length > 0 && {
      keywords: input.tags.join(", "),
    }),
  };
}

// Generate SEO tags for a blog post
export function generatePostSEO(post: (typeof allPosts)[0]) {
  return generateSEOTags({
    title: post.title,
    description: post.summary,
    url: post.url,
    image: resolvePostSocialImage(post),
    imageAlt: post.title,
    type: "article",
    publishedTime: post.date.toISOString(),
    modifiedTime: post.date.toISOString(),
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
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": toAbsoluteUrl(post.url),
    },
    image: {
      "@type": "ImageObject",
      url: toAbsoluteUrl(resolvePostSocialImage(post)),
    },
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
    url: `${SITE_URL}/blog`,
    author: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
