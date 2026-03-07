# TanStack Blog Implementation Specification

## Copilot Usage Policy

**All Copilot requests and code changes MUST strictly adhere to the requirements and decisions documented in this specification.**

## UI/UX Requirements

- **Navigation Bar**: The main site navigation must be positioned at the top of the page and centered horizontally. This applies to all blog and site layouts.
- **Navigation Content**: The main navigation should reflect the current TanStack site structure and remain consistent with the implemented routes.
- **Navigation Styling**: Use consistent hover states and active indicators for navigation links. Active navigation items should maintain hover effects with enhanced scaling (110% vs 105% for inactive items).
- **Design Theme**: Use a neon metallic gray design theme with animated background effects and glowing elements.
- **Color Palette**: Primary colors are cyan (#22d3ee) and blue (#3b82f6) for accents, with dark gray gradients (#1f2937, #374151, #4b5563) for backgrounds.
- **Animations**: Include subtle animations like gentle pulsing effects (6-10s duration), slow hover transitions (700ms), and soft background glow animations for enhanced user experience without distraction.

## Content Management & Synchronization System

**CRITICAL: All blog posts and notes are centrally managed and synchronized into the TanStack website using the `syncWebsites.ts` script.**

### Content Architecture

- **Primary Sources**:
  - All blog posts are maintained in the root `_posts/` directory
  - All notes are maintained in the root `_notes/` directory
- **Synchronization**: The `scripts/syncWebsites.ts` script copies content from the root directories into `websites/tanstack/src/content/`
- **Website Content**: `websites/tanstack/src/content/` contains synchronized copies only
- **Single Source of Truth**: The root `_posts/` and `_notes/` directories are authoritative

### Important Considerations for Copilot Requests

- **Never directly edit files in website content folders** - these are synchronized copies that will be overwritten
- **All content edits must be made in the root `_posts/` or `_notes/` directories**
- **Image assets (cover images, etc.) are also managed through the sync process**
- **The sync script runs automatically during development and build workflows**
- **TanStack Content Collections process the synchronized content, not the original source files**

## Overview

This document provides a focused specification for the TanStack blog implementation, including the current architecture, completed foundations, and remaining priorities.

## Current Implementation Status ✅

### ✅ Content Collections Setup

- Content Collections are configured for synced content
- Frontmatter is validated with Zod
- Posts and notes are processed from `src/content/`
- Content transformations include slug generation, excerpts, and reading-time metadata

### ✅ Core Blog Experience

- Blog listing and post routes are implemented
- Notes and search routes are implemented
- Navigation, layout, and theming are implemented
- SEO helpers and structured-data utilities exist
- Static assets are synced to `public/content/` for predictable serving paths

### ✅ Deployment Role

- TanStack is the production website served at the deployment root
- Root deployment assets include `ads.txt`, `robots.txt`, `rss.xml`, and `sitemap-index.xml`
- The Pages deployment workflow builds and publishes the TanStack site only

## Architecture Decisions

### Content Collections vs. Manual File Operations

**Decision**: Use Content Collections for content management.

**Rationale**:

- Eliminates most manual content-loading boilerplate
- Provides validation and type safety
- Improves maintainability and editor support

### TanStack Router Integration

**Decision**: Use TanStack file-based routing.

**Rationale**:

- Type-safe route parameters
- Predictable route generation
- Strong fit for prerendered/static output

### Content Synchronization Strategy

**Decision**: Keep authored content outside the app and sync it into the TanStack site.

**Rationale**:

- Preserves a clean authoring workflow in `_posts/` and `_notes/`
- Keeps generated website content disposable
- Makes build behavior deterministic

### Image Asset Management

**Decision**: Serve synced content assets from the TanStack public directory.

**Rationale**:

- Predictable static paths in development and production
- Works with the current content-sync workflow
- Keeps content and assets aligned

## File Structure

```text
websites/tanstack/
├── content-collections.ts
├── src/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   ├── content/                    # Synced content copies (DO NOT EDIT)
│   └── styles/
├── public/
│   ├── ads.txt
│   ├── robots.txt
│   ├── rss.xml
│   └── sitemap-index.xml
└── package.json
```

## Pending Implementation / Follow-up Areas

- Continue polishing search, filtering, and content UX as needed
- Continue improving SEO, accessibility, and performance incrementally
- Keep the specification aligned with the real implementation as the site evolves

## Technical Debt & Issues

### Intentional Architecture

- **Central content sync**: The `syncWebsites.ts` workflow is intentional architecture, not technical debt
- **Generated website content**: `websites/tanstack/src/content/` is disposable output from the sync process

### Optimization Opportunities

- Bundle-size tuning where helpful
- Additional accessibility improvements
- Incremental UX polish on blog and notes flows

## Conclusion

The TanStack blog implementation is the active website in this repository. Its architecture centers on:

- root-managed content in `_posts/` and `_notes/`
- synchronized website content copies
- type-safe TanStack routes and content processing
- static deployment at the site root

All future implementation work should preserve those constraints unless the architecture is intentionally redesigned.
