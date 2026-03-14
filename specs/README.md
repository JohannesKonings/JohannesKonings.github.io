# Specifications Directory

This directory contains the active specifications for the single TanStack website and its content-sync architecture.

## Files

### `website-sync-system.md`

The foundational specification for the content pipeline:

- `_posts/` and `_notes/` remain the canonical authored sources
- `scripts/syncWebsites.ts` copies authored content into `src/content/`
- `public/content/` mirrors synced assets for static serving

Read this first before changing content flow, build behavior, or path conventions.

### `website-tanstack.md`

The main implementation spec for the production website:

- root-level app structure
- build and verification commands
- TanStack Start, Content Collections, and deployment expectations

### `tanstack-blog-implementation.md`

A focused architecture snapshot for the blog experience:

- route and content model
- content-management constraints
- high-level implementation expectations

## Important Guidelines

- **Never edit `src/content/` or `public/content/` directly.**
- **Always edit authored content in `_posts/` or `_notes/`.**
- Keep specs aligned with the actual root-level app structure and `vp` workflows.
- Update the relevant spec whenever architecture, commands, or content paths change.
