# Personal website and blog

This repository contains the TanStack-based website and the supporting content/distribution scripts used for the blog.

## website

- local development: `pnpm dev:tanstack`
- production build: `pnpm build:tanstack`
- content verification: `pnpm verify:tanstack`

## pre-publish SEO check

Before publishing a post, run the SEO check and fix what it reports (weak titles
and descriptions, body `<h1>`s, broken heading hierarchy, missing internal links,
images without alt text). The checklist and thresholds are in
[docs/pre-publish-seo.md](docs/pre-publish-seo.md).

`vp exec tsx scripts/checkSeo.ts <slug>` (or `--all` for every post)

## blog post distribution

- build process for dev.to, hashnode and medium incl. image optimization

`nlx tsx ./scripts/syncCrossPosts.ts`

Cross-post assets (PNG fallbacks for SVG, and the Builder Center cover) live in the post directory next to the markdown. The convention is in [crossPosts/README.md](crossPosts/README.md). Check one post with:

`vp exec tsx scripts/checkCrossPostAssets.ts <slug>`

## rss feed

...

## search

...
