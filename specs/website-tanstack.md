# TanStack Website Implementation Specification

## Deployment Role

The TanStack Start website is the only application in this repository and is served from the deployment root.

All canonicals, sitemaps, RSS, `ads.txt`, and `robots.txt` are rooted at:

- `https://johanneskonings.dev/`

## Content Model

This app uses the centralized sync system defined in [website-sync-system.md](./website-sync-system.md).

Important rules:

- edit authored content in `_posts/` and `_notes/`
- never edit `src/content/` directly
- never edit `public/content/` directly

## Commands

Use the root-level single-app commands:

```bash
vp run sync
vp run dev
vp run build
vp run start
vp run test:ui
vp run test:smoke
vp run verify
vp run verify:seo-geo
vp run verify:lighthouse
```

## Architecture

### Framework

- TanStack Start
- TanStack Router file-based routing
- React 19
- Tailwind CSS 4

### Content

- Content Collections reads synced markdown from `src/content/blog/` and `src/content/notes/`
- Relative content assets are served from `public/content/`
- SEO and structured data are generated from route and content metadata

### Verification

- content verification: `scripts/verifyTanstack.ts`
- SEO/GEO verification: `scripts/verifyTanstackSeoGeo.ts`
- Lighthouse verification: `scripts/runTanstackLighthouse.ts`

## File Structure

```text
repository-root/
├── content-collections.ts
├── vite.config.ts
├── playwright.config.ts
├── src/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── routes/
│   ├── styles/
│   └── content/              # Generated/synced copies
├── public/
│   ├── ads.txt
│   ├── robots.txt
│   ├── rss.xml
│   ├── sitemap-index.xml
│   └── content/              # Generated asset mirror
├── e2e/
└── scripts/
```

## UX Expectations

- top navigation stays centered and consistent across routes
- design language remains neon metallic gray with restrained motion
- blog, notes, and search remain first-class routes
- SEO metadata and structured data must remain correct for static output

## Maintenance Notes

- keep the app root-focused; do not reintroduce workspace-only structure without a concrete multi-app need
- keep direct dependency versions explicit
- keep path-sensitive scripts aligned with the root app layout
