# Astro Website Implementation Specification

## Copilot Usage Policy

**All Copilot requests and code changes MUST strictly adhere to the requirements and decisions documented in this specification.**

**CRITICAL: This website uses the centralized content management system. See [website-sync-system.md](./website-sync-system.md) for complete sync requirements.**

## Development Commands

**Use these root commands for all development activities:**

```bash
# Development
pnpm dev:astro      # Start development server (includes content sync)

# Building
pnpm build:astro    # Build for production (includes content sync)

# Content Management
pnpm --filter astro sync    # Manual content sync if needed
```

**Important**: Always use root commands (`pnpm dev:astro`) rather than navigating to website directories. This ensures proper workspace management and dependency resolution.

## Overview

This document provides the specification for the Astro website implementation, including architecture decisions, content processing, and website-specific requirements.

**Important**: This website processes synchronized content from the root `_posts/` and `_notes/` directories. Never edit content files directly in the `websites/astro/src/content/` folder.

## Content Integration

### Sync System Integration
- **Content Source**: Processes synchronized copies from `websites/astro/src/content/blog/` and `websites/astro/src/content/notes/`
- **Master Source**: All content originates from root `_posts/` and `_notes/` directories
- **Sync Process**: Content is synchronized via `scripts/syncWebsites.ts`
- **Build Integration**: Sync runs automatically during development and build processes

### Astro Content Collections
- **Framework**: Uses Astro's built-in Content Collections API
- **Content Processing**: Astro handles markdown processing, frontmatter validation, and type generation
- **Schema Definition**: Content schemas defined in `src/content/config.ts`
- **Type Safety**: Full TypeScript integration with auto-generated types

## Implementation Status

### 🚧 Current Status: PENDING IMPLEMENTATION

This specification serves as a blueprint for the Astro website implementation. Key components to implement:

#### Content Collections Setup
- [ ] Configure Astro Content Collections for blog posts
- [ ] Configure Astro Content Collections for notes
- [ ] Define content schemas and validation
- [ ] Set up TypeScript integration

#### Component Architecture
- [ ] Blog post listing component
- [ ] Blog post detail component
- [ ] Navigation component
- [ ] Layout components
- [ ] SEO components

#### Routing
- [ ] Blog listing page
- [ ] Individual blog post pages
- [ ] Category/tag filtering pages
- [ ] RSS feed generation

#### Asset Management
- [ ] Image processing and optimization
- [ ] Cover image handling
- [ ] Static asset organization

## Architecture Decisions

### Framework Choice
**Decision**: Use Astro for static site generation
**Rationale**:
- Excellent performance with static generation
- Built-in Content Collections API
- Component framework agnostic
- Optimized for content-heavy sites
- Excellent SEO capabilities

### Content Processing Strategy
**Decision**: Use Astro Content Collections with synchronized content
**Rationale**:
- Native Astro integration
- Automatic type generation
- Built-in frontmatter validation
- Markdown processing included
- Integrates seamlessly with sync system

### Styling Approach
**Decision**: To be determined based on design requirements
**Options**:
- Tailwind CSS (recommended for consistency with TanStack implementation)
- Styled Components
- CSS Modules
- Astro's scoped CSS

## File Structure

```
websites/astro/
├── astro.config.mjs                 # Astro configuration
├── src/
│   ├── components/                  # Reusable components
│   │   ├── Navigation.astro
│   │   ├── BlogCard.astro
│   │   └── Layout.astro
│   ├── content/                     # Synchronized content (DO NOT EDIT)
│   │   ├── blog/                    # Synced from _posts/
│   │   ├── notes/                   # Synced from _notes/
│   │   └── config.ts                # Content Collections config
│   ├── layouts/                     # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/                       # Route pages
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── rss.xml.ts
│   └── styles/                      # Global styles
├── public/                          # Static assets
└── package.json
```

## Content Schema Requirements

### Blog Posts Schema
```typescript
// Expected schema for blog posts
const blogSchema = z.object({
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  categories: z.union([z.string(), z.array(z.string())]).default([]),
  cover_image: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
});
```

### Notes Schema
```typescript
// Expected schema for notes
const notesSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
});
```

## Performance Requirements

### Build Performance
- **Static Generation**: Pre-generate all pages at build time
- **Image Optimization**: Use Astro's image optimization features
- **Bundle Optimization**: Minimize JavaScript bundle size
- **CSS Optimization**: Optimize and inline critical CSS

### Runtime Performance
- **Loading Speed**: Target sub-second page loads
- **SEO Optimization**: Implement comprehensive SEO meta tags
- **Accessibility**: Meet WCAG 2.1 AA standards
- **Progressive Enhancement**: Ensure functionality without JavaScript

## SEO Requirements

### Meta Tags
- Dynamic title and description generation
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs
- Structured data (JSON-LD)

### Content Optimization
- Automatic sitemap generation
- RSS feed for blog posts
- Optimized heading structure
- Image alt text requirements
- Internal linking strategies

## Integration Points

### Sync System Integration
- **Development**: Sync runs automatically during `astro dev`
- **Build**: Sync runs before `astro build`
- **Content Validation**: Validate synchronized content during build
- **Error Handling**: Handle sync failures gracefully

### External Services
- **Analytics**: Google Analytics or similar
- **Search**: Optional search functionality
- **Comments**: Optional commenting system
- **Newsletter**: Optional newsletter integration

## Development Workflow

### Setup Process
1. Install Astro and dependencies
2. Configure Content Collections
3. Set up sync integration
4. Implement base layouts and components
5. Create routing structure
6. Add styling and theming

### Content Development
1. **Never edit content in `websites/astro/src/content/`**
2. Edit content in root `_posts/` or `_notes/` directories
3. Run sync script or start development server
4. Content automatically appears in Astro website

### Asset Management
1. Cover images sync automatically with content
2. Additional assets should be placed in `public/` directory
3. Use Astro's image optimization for performance

## Testing Requirements

### Content Testing
- Validate content schema compliance
- Test content rendering across different post types
- Verify image loading and optimization
- Test search and filtering functionality

### Performance Testing
- Lighthouse scores (90+ recommended)
- Core Web Vitals compliance
- Page load speed testing
- Bundle size monitoring

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- Focus management

## Deployment Configuration

### Build Settings
- **Output**: Static site generation
- **Image Optimization**: Enabled
- **Minification**: CSS and HTML minification
- **Compression**: Gzip/Brotli compression

### Hosting Requirements
- **Static Hosting**: Supports static site hosting (Netlify, Vercel, etc.)
- **CDN**: Content delivery network for performance
- **SSL**: HTTPS enforcement
- **Redirects**: Support for URL redirects

## Future Enhancements

### Planned Features
- [ ] Search functionality
- [ ] Comment system integration
- [ ] Newsletter subscription
- [ ] Related posts recommendations
- [ ] Tag/category pages
- [ ] Archive pages by date

### Performance Optimizations
- [ ] Service worker for caching
- [ ] Preloading strategies
- [ ] Image lazy loading
- [ ] Code splitting

## Maintenance Considerations

### Regular Tasks
- Update dependencies
- Monitor performance metrics
- Review and update content schemas
- Optimize build times
- Review accessibility compliance

### Monitoring
- Build success/failure tracking
- Performance monitoring
- Error tracking and reporting
- Content validation monitoring

## Notes

- This specification will be updated as the Astro implementation progresses
- All changes must maintain compatibility with the sync system
- Performance and accessibility are primary concerns
- Content consistency with TanStack website should be maintained
