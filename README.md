# Personal website and blog

This repository contains the TanStack-based website and the supporting content/distribution scripts used for the blog.

The canonical authored content lives in `_posts/` and `_notes/`. The website now reads markdown directly from those authored roots, while sync/build flows mirror only non-markdown assets into `websites/tanstack/public/content/`.

## website

- local development: `pnpm dev:tanstack`
- production build: `pnpm build:tanstack`
- content verification: `pnpm verify:tanstack`

## blog post distribution

- build process for dev.to, hashnode and medium incl. image optimization

`nlx tsx ./scripts/syncCrossPosts.ts`

## rss feed

...

## search

...
