# TanStack Blog Implementation Specification

## Purpose

This document describes the active blog architecture inside the single root-level TanStack Start application.

## Blog Constraints

- authored posts live in `_posts/`
- authored notes live in `_notes/`
- synced blog content lives in `src/content/blog/`
- synced notes live in `src/content/notes/`
- synced public assets live in `public/content/`

The synced trees are generated output and may be recreated at any time.

## Blog Features

The current implementation includes:

- blog index, post, category, tag, notes, and search routes
- Content Collections-backed content loading
- reading time, excerpt, and metadata utilities
- SEO helpers and structured data generation
- synced asset handling for cover images and inline content assets

## UI Requirements

- keep the top navigation centered and route-aware
- preserve the neon metallic gray design language
- keep blog, notes, and search prominent in the site structure
- prefer accessible, static-friendly implementations over client-only complexity

## Implementation Notes

- TanStack Router drives the route tree
- Content Collections transforms synced markdown into typed content objects
- `public/rss.xml` and `public/sitemap-index.xml` are generated from the synced content
- verification scripts should continue validating content correctness and build artifacts after structural changes

## File Structure

```text
repository-root/
├── src/
│   ├── components/blog/
│   ├── lib/
│   ├── routes/blog/
│   ├── routes/notes/
│   └── content/
├── public/
│   ├── rss.xml
│   ├── sitemap-index.xml
│   └── content/
├── content-collections.ts
└── scripts/
```

## Maintenance Direction

- preserve the authored-content versus synced-content boundary
- keep generated content disposable and out of manual editing workflows
- keep docs and instructions aligned with the root-level single-app structure
