# Personal website and blog

This repository contains the single TanStack Start website at the repository root, plus the supporting content and distribution scripts used for the blog.

The canonical authored content stays outside the app in `_posts/` and `_notes/`. The website consumes synced copies in `src/content/` during `dev`, `build`, and `start`.

## Website

- local development: `vp run dev`
- production build: `vp run build`
- UI tests: `vp run test:ui`
- smoke tests: `vp run test:smoke`
- content verification: `vp run verify`
- SEO/GEO verification: `vp run verify:seo-geo`
- Lighthouse verification: `vp run verify:lighthouse`

## Blog post distribution

- build process for dev.to, hashnode and medium incl. image optimization

`vp exec tsx scripts/syncCrossPosts.ts`

## RSS feed

...

## Search

...
