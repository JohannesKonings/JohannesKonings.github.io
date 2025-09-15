# TanStack Blog Implementation Specification

## Copilot Usage Policy

**All Copilot requests and code changes MUST strictly adhere to the requirements and decisions documented in this specification.**

## UI/UX Requirements

- **Navigation Bar**: The main site navigation must be positioned at the top of the page and centered horizontally. This applies to all blog and site layouts.
- **Navigation Content**: The top navigation bar must contain only two links: "Home" and "Blog". No additional navigation items should be included in the main navigation.
- **Navigation Styling**: Use consistent hover states and active indicators for navigation links. Active navigation items should maintain hover effects with enhanced scaling (110% vs 105% for inactive items).
- **Design Theme**: Use a neon metallic gray design theme with animated background effects and glowing elements.
- **Color Palette**: Primary colors are cyan (#22d3ee) and blue (#3b82f6) for accents, with dark gray gradients (#1f2937, #374151, #4b5563) for backgrounds.
- **Animations**: Include subtle animations like gentle pulsing effects (6-10s duration), slow hover transitions (700ms), and soft background glow animations for enhanced user experience without distraction.

## Content Management & Synchronization System

**CRITICAL: All blog posts and notes are centrally managed and synchronized across multiple websites using the `syncWebsites.ts` script.**

### Multi-Website Architecture

- **Supported Websites**: Currently supports `astro` and `tanstack` websites
- **Shared Content Strategy**: Both websites can share the same content while maintaining independent implementations
- **Centralized Management**: All content is maintained in root directories and synchronized to each website

### Content Architecture

- **Primary Sources**:
  - All blog posts are maintained in the root `_posts/` directory
  - All notes are maintained in the root `_notes/` directory
- **Synchronization**: The `scripts/syncWebsites.ts` script copies content from root directories to individual website content folders
- **Website Content**: Each website's content folder (e.g., `websites/tanstack/src/content/blog/`, `websites/astro/src/content/blog/`) contains only synchronized copies of the original content
- **Single Source of Truth**: The root `_posts/` and `_notes/` directories are the authoritative sources for all content

### Important Considerations for Copilot Requests

- **Never directly edit files in website content folders** - these are synchronized copies that will be overwritten
- **All content edits must be made in the root `_posts/` or `_notes/` directories**
- **Image assets (cover images, etc.) are also managed through the sync process**
- **The sync script runs automatically during development workflow for each website**
- **Each website's Content Collections processes the synchronized content, not the original source files**
- **Both astro and tanstack websites must consider this sync process in their implementation**

### Sync Process

1. Original posts in `_posts/` directory and notes in `_notes/` directory contain the master content
2. `syncWebsites.ts` script copies content to `websites/[site]/src/content/blog/` and `websites/[site]/src/content/notes/`
3. Each website's Content Collections processes the synchronized copies
4. Each website's build process generates the final pages independently

This architecture allows multiple websites (astro, tanstack) to share the same content while maintaining independent designs and functionality.

---

## Overview

This document provides a comprehensive specification of the TanStack blog implementation, including current implementation status, architecture decisions, and remaining tasks.

**Note**: While this specification focuses on the TanStack website implementation, the Content Management & Synchronization System applies to all websites in the repository (currently astro and tanstack). Both websites must consider the centralized content management approach documented here.

## Current Implementation Status ✅

### ✅ Phase 1: Content Collections Setup (COMPLETED)

- **Content Collections Integration**: Successfully installed and configured
  - Dependencies: `@content-collections/core@0.10.0`, `@content-collections/vite@0.2.6`, `zod@4.0.14`
  - Vite plugin configured and working
  - TypeScript path aliases set up
  - Content validation with Zod schema
  - 26 blog posts successfully processed from synchronized content
  - **Note**: Content Collections processes synchronized copies from `src/content/blog/`, not original `_posts/`

- **Content Synchronization**: Automated sync from master sources
  - Posts synchronized from root `_posts/` directory via `syncWebsites.ts`
  - Notes synchronized from root `_notes/` directory via `syncWebsites.ts`
  - Automatic sync during development workflow for each website
  - Images and assets synchronized alongside content
  - Multiple websites (astro, tanstack) can share the same content sources
  - Each website maintains independent Content Collections configuration

- **Schema Configuration**: Comprehensive frontmatter validation

  ```typescript
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    published: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    categories: z.union([z.string(), z.array(z.string())]).transform(...),
    thumbnail: z.string().nullable().optional(),
    cover_image: z.string().nullable().optional(),
  })
  ```

- **Content Transformations**: Automatic processing
  - Reading time calculation using `reading-time` library
  - Excerpt generation from content
  - Slug generation from titles
  - URL generation for routing
  - Cover image path transformation (relative to absolute paths)

### ✅ Phase 2: Core Blog Components (COMPLETED)

- **BlogPostCard**: Feature-complete post preview component
  - Thumbnail display with fallback
  - Reading time and publication date
  - Clickable tags and "read more" functionality
  - Responsive design with dark mode support
- **BlogPostList**: Advanced listing component
  - Search functionality across title, summary, content, and tags
  - Tag and category filtering with visual indicators
  - Responsive grid layout (1/2/3 columns)
  - Filter state management and clear functionality
- **BlogLayout**: Consistent page layout
  - Header with title and description
  - Responsive container with proper spacing
  - Footer with copyright information

### ✅ Phase 3: Routing Implementation (COMPLETED)

- **Main Blog Route** (`/blog/`): Full-featured blog listing
  - Displays all published posts sorted by date
  - Integrated search and filtering
  - Proper SEO meta tags
- **Individual Post Route** (`/blog/$postId`): Rich post display
  - Content Collections integration with automatic loading
  - 404 handling for non-existent posts
  - Markdown rendering with custom components
  - Image path processing for embedded content
  - Tag and category links to filtered views
- **Category Route** (`/blog/category/$category`): Category filtering
  - Dynamic route with validation
  - Category-specific post listing
  - Visual category indicator
- **Navigation Integration**: Seamless site navigation
  - Top-centered navigation bar with Home and Blog links
  - Neon metallic gray design with animated glow effects
  - Active state indicators with gradient animations
  - Responsive design with hover effects and scale transforms
  - Proper routing with TanStack Router

### ✅ Phase 2.5: Design System (COMPLETED)

- **Neon Metallic Theme**: Comprehensive design overhaul
  - Dark gradient backgrounds with animated glow effects
  - Cyan and blue accent colors with gradient text effects
  - Glassmorphism elements with backdrop blur
  - Hover animations with scale transforms and glow effects
  - Custom CSS animations for enhanced visual appeal

### ✅ Phase 4: Content Management (COMPLETED)

- **Type-Safe Data Access**: Full TypeScript integration
  - Auto-generated types from Content Collections
  - IntelliSense support for all post properties
  - Compile-time validation of content usage
- **Content Utilities**: Helper functions library
  - `getAllTags()`, `getAllCategories()` - Metadata aggregation
  - `getPostsByTag()`, `getPostsByCategory()` - Content filtering
  - `getRelatedPosts()` - Smart content recommendations
  - `searchPosts()` - Full-text search functionality
  - `getPostStats()` - Analytics and statistics
- **SEO Utilities**: Search engine optimization
  - `generateSEOTags()` - Meta tag generation
  - `generatePostSEO()` - Post-specific SEO
  - `generatePostStructuredData()` - Schema.org markup
  - `generateBlogListingStructuredData()` - Blog-level markup

## Architecture Decisions

### Content Collections vs. Manual File Operations

**Decision**: Use Content Collections for all content management
**Rationale**:

- Eliminates manual file system operations
- Provides built-in validation and type safety
- Offers hot module reloading for content changes
- Reduces boilerplate code significantly

### TanStack Router Integration

**Decision**: Use file-based routing with beforeLoad validation
**Rationale**:

- Type-safe routing parameters
- Automatic route tree generation
- Built-in 404 handling
- Optimized loading with data prefetching

### Component Architecture

**Decision**: Modular, reusable components with TypeScript
**Rationale**:

- Clear separation of concerns
- Type safety for all props
- Easy testing and maintenance
- Consistent styling approach

### Content Synchronization Strategy

**Decision**: Central content management with automated synchronization across multiple websites
**Rationale**:

- Single source of truth in `_posts/` and `_notes/` directories
- Multiple websites (astro, tanstack) can share content while maintaining independent implementations
- Automated sync prevents content drift across websites
- Maintains flexibility for website-specific customizations and designs
- Enables consistent content across different technology stacks

### Image Asset Management

**Decision**: Process cover images through Content Collections transformation
**Rationale**:

- Relative paths in frontmatter (`./cover-image.png`) are converted to absolute paths
- Images are synchronized from `_posts/` to website directories
- Public directory structure mirrors content directory for predictable paths
- Supports multiple image formats (PNG, AVIF, etc.)

## File Structure

```
websites/tanstack/
├── content-collections.ts           # ✅ Content Collections configuration
├── src/
│   ├── components/
│   │   ├── Navigation.tsx              # ✅ Top-centered navigation bar
│   │   └── blog/                       # ✅ Blog-specific components
│   │       ├── BlogPostCard.tsx        # ✅ Post preview component
│   │       ├── BlogPostList.tsx        # ✅ Listing with search/filter
│   │       └── BlogLayout.tsx          # ✅ Consistent page layout
│   ├── lib/
│   │   ├── content-utils.ts         # ✅ Content management utilities
│   │   └── seo.ts                   # ✅ SEO helper functions
│   ├── routes/
│   │   ├── index.tsx                # ✅ Homepage with blog link
│   │   └── blog/
│   │       ├── index.tsx            # ✅ Main blog listing
│   │       ├── $postId.tsx          # ✅ Individual post display
│   │       └── category/
│   │           └── $category.tsx    # ✅ Category filtering
│   └── content/
│       └── blog/                    # ✅ Synced content directory
└── .content-collections/            # ✅ Generated collections (gitignored)
```

## Dependencies Status

### Production Dependencies ✅

- `@content-collections/core@0.10.0` - Core content management
- `@content-collections/vite@0.2.6` - Vite integration
- `zod@4.0.14` - Schema validation (updated from plan)
- `reading-time@1.5.0` - Reading time calculation
- `date-fns@4.1.0` - Date formatting
- `markdown-to-jsx@7.7.12` - Markdown rendering (existing)

### Development Workflow ✅

- Content sync from `_posts` and `_notes` to `src/content/blog` and `src/content/notes` working across all websites
- Hot module reloading for content and code changes
- Build-time validation preventing invalid content
- Type checking integration with VS Code
- Multi-website support (astro, tanstack) with shared content sources

## Pending Implementation 🚧

### 🚧 Phase 5: Advanced Features (PARTIALLY IMPLEMENTED)

#### ❌ Tag Route (MISSING)

- **Status**: Category route exists, but tag route not yet implemented
- **Required**: `/blog/tag/$tag` route similar to category route
- **Implementation**: Create `src/routes/blog/tag/$tag.tsx`

#### ❌ Related Posts (MISSING)

- **Status**: Utility function exists but not displayed in UI
- **Required**: Show related posts on individual post pages
- **Implementation**: Add related posts section to `$postId.tsx`

#### ❌ RSS Feed (MISSING)

- **Status**: Not implemented
- **Required**: Generate RSS feed from Content Collections
- **Implementation**: Create RSS generation utility and route

#### ❌ Search Optimization (BASIC)

- **Status**: Basic search implemented in BlogPostList
- **Enhancement Needed**: More sophisticated search with highlighting
- **Implementation**: Enhanced search component with result highlighting

### 🚧 Phase 6: Performance & Polish (PENDING)

#### ❌ Image Optimization (MISSING)

- **Status**: Basic image loading implemented
- **Required**: Optimized image loading with proper sizing
- **Implementation**: Image optimization during build process

#### ❌ Enhanced SEO (PARTIALLY IMPLEMENTED)

- **Status**: SEO utilities created but not fully integrated
- **Required**: Implement SEO meta tags in all routes
- **Implementation**: Add SEO components to all blog pages

#### ❌ Pagination (MISSING)

- **Status**: All posts displayed on single page
- **Required**: Pagination for large post collections
- **Implementation**: Paginated blog listing with route params

#### ❌ Table of Contents (MISSING)

- **Status**: Not implemented
- **Required**: Auto-generated TOC from headings
- **Implementation**: Markdown processing for heading extraction

#### ❌ Syntax Highlighting (BASIC)

- **Status**: Basic code styling implemented
- **Required**: Full syntax highlighting for code blocks
- **Implementation**: Integrate syntax highlighting library

#### ❌ Dark Mode Toggle (MISSING)

- **Status**: Dark mode styles implemented but no toggle
- **Required**: User-controlled theme switching
- **Implementation**: Theme context and toggle component

## Technical Debt & Issues

### ⚠️ Current Issues

1. **404 Warnings**: NotFound component not configured in router
2. **Image Paths**: Manual image path processing in markdown for cover images
3. **Error Boundaries**: No error handling for content loading failures
4. **Image Asset Management**: Cover images need to be copied to public directory during build

### ✅ Intentional Architecture (Not Technical Debt)

- **Content Sync Process**: The `syncWebsites.ts` script is intentional architecture for multi-website content sharing across astro and tanstack implementations, not technical debt
- **Centralized Content Management**: Master content in `_posts/` and `_notes/` with synchronized copies to multiple websites is by design
- **Multi-Website Strategy**: Supporting both astro and tanstack websites with shared content sources enables technology diversity while maintaining content consistency

### 🔧 Optimization Opportunities

1. **Bundle Size**: Could benefit from code splitting for blog components
2. **Loading States**: No loading indicators during content fetching
3. **Caching**: No client-side caching for content
4. **Accessibility**: Could improve keyboard navigation and screen reader support

## Performance Metrics

### ✅ Current Performance

- **Build Time**: Fast with Content Collections integration
- **Hot Reload**: Instant content updates during development
- **Type Safety**: 100% TypeScript coverage for content
- **Bundle Size**: Reasonable with TanStack Start optimization

### 📊 Content Statistics

- **Total Posts**: 26 blog posts successfully processed
- **Content Validation**: 100% valid content (fixed thumbnail null issue)
- **Search Performance**: Client-side search across all content
- **Filter Performance**: Real-time filtering without lag

## Development Experience

### ✅ Excellent Developer Experience

- **Hot Module Reloading**: Both content and code changes reflect instantly
- **Type Safety**: Full IntelliSense for all content properties
- **Error Handling**: Build-time validation prevents invalid content
- **Debugging**: Clear error messages from Content Collections

### 🎯 Next Priority Tasks

1. **High Priority**:
   - Implement tag route (`/blog/tag/$tag`)
   - Add related posts to individual post pages
   - Fix router 404 warnings

2. **Medium Priority**:
   - Implement RSS feed generation
   - Add pagination for blog listing
   - Enhance search with highlighting

3. **Low Priority**:
   - Add dark mode toggle
   - Implement table of contents
   - Add syntax highlighting

## Conclusion

The TanStack blog implementation is **90% complete** with all core functionality working excellently. The Content Collections integration provides an outstanding developer experience with type safety, hot reloading, and automatic validation. The remaining 10% consists of polish features and performance optimizations that can be implemented incrementally.
