# Website Sync System Specification

## Overview

This document specifies the centralized content management and synchronization system used across all websites in the repository. This system ensures consistent content delivery while maintaining independent website implementations.

## Content Management & Synchronization System

**CRITICAL: All blog posts and notes are centrally managed and synchronized across multiple websites using the `syncWebsites.ts` script.**

### Multi-Website Architecture
- **Supported Websites**: Currently supports `astro` and `tanstack` websites
- **Shared Content Strategy**: Both websites can share the same content while maintaining independent implementations
- **Centralized Management**: All content is maintained in root directories and synchronized to each website
- **Technology Agnostic**: Supports different frameworks (Astro, TanStack Start) with the same content source

### Content Architecture
- **Primary Sources**: 
  - All blog posts are maintained in the root `_posts/` directory
  - All notes are maintained in the root `_notes/` directory
- **Synchronization**: The `scripts/syncWebsites.ts` script copies content from root directories to individual website content folders
- **Website Content**: Each website's content folder contains only synchronized copies of the original content:
  - `websites/astro/src/content/blog/` - Astro website blog content
  - `websites/tanstack/src/content/blog/` - TanStack website blog content
  - `websites/astro/src/content/notes/` - Astro website notes content
  - `websites/tanstack/src/content/notes/` - TanStack website notes content
- **Single Source of Truth**: The root `_posts/` and `_notes/` directories are the authoritative sources for all content

### Critical Guidelines for All Development

#### ⚠️ NEVER Edit Website Content Folders Directly
- **Never directly edit files in website content folders** - these are synchronized copies that will be overwritten
- **All content edits must be made in the root `_posts/` or `_notes/` directories**
- **Image assets (cover images, etc.) are also managed through the sync process**

#### Development Workflow Requirements
- **The sync script runs automatically during development workflow for each website**
- **Each website's Content Collections (or equivalent) processes the synchronized content, not the original source files**
- **Both astro and tanstack websites must consider this sync process in their implementation**
- **Any new website implementations must integrate with this sync system**

#### Root Package.json Command Structure
**All important website commands are callable from the repository root using prefixed commands:**

```bash
# Development Commands
pnpm dev:astro      # Start Astro website development server
pnpm dev:tanstack   # Start TanStack website development server

# Build Commands  
pnpm build:astro    # Build Astro website for production
pnpm build:tanstack # Build TanStack website for production

# Other Commands (future)
pnpm test:astro     # Run Astro website tests
pnpm test:tanstack  # Run TanStack website tests
pnpm lint:astro     # Lint Astro website code
pnpm lint:tanstack  # Lint TanStack website code
```

**Implementation Pattern:**
- Root `package.json` defines website-specific commands with prefixes
- Commands use `pnpm --filter [website] [command]` to execute in website directories
- This allows centralized command execution while maintaining workspace isolation
- All developer documentation should reference root commands, not website-specific commands

### Sync Process Details

#### Sync Script Operation
1. **Source Content**: Original posts in `_posts/` directory and notes in `_notes/` directory contain the master content
2. **Synchronization**: `syncWebsites.ts` script copies content to:
   - `websites/[site]/src/content/blog/` (for blog posts)
   - `websites/[site]/src/content/notes/` (for notes)
3. **Processing**: Each website's content processing system (Content Collections, Astro Collections, etc.) processes the synchronized copies
4. **Build**: Each website's build process generates the final pages independently

#### Asset Management
- **Images**: Cover images and other assets are synchronized alongside content
- **Relative Paths**: Content uses relative paths (e.g., `./cover-image.png`) that are processed by each website's build system
- **Format Support**: Supports multiple image formats (PNG, AVIF, JPG, etc.)

### Website-Specific Considerations

#### Content Processing
- **Astro Website**: Uses Astro Content Collections to process synchronized content
- **TanStack Website**: Uses Content Collections library to process synchronized content
- **Schema Validation**: Each website can define its own content validation schema
- **Transformations**: Each website can apply its own content transformations

#### Asset Handling
- **Public Directory**: Each website manages its own public directory structure
- **Image Paths**: Each website handles image path resolution according to its framework conventions
- **Optimization**: Each website can implement its own image optimization strategies

### File Structure

```
repository-root/
├── _posts/                          # 📁 Master blog posts (EDIT HERE)
│   └── [post-directories]/
│       ├── index.md
│       └── cover-image.png
├── _notes/                          # 📁 Master notes (EDIT HERE)
│   └── [note-files].md
├── scripts/
│   └── syncWebsites.ts              # 🔄 Sync script
├── websites/
│   ├── astro/
│   │   └── src/content/
│   │       ├── blog/                # 📋 Synced copies (DO NOT EDIT)
│   │       └── notes/               # 📋 Synced copies (DO NOT EDIT)
│   └── tanstack/
│       └── src/content/
│           ├── blog/                # 📋 Synced copies (DO NOT EDIT)
│           └── notes/               # 📋 Synced copies (DO NOT EDIT)
└── specs/
    ├── website-sync-system.md       # 📄 This document
    ├── website-astro.md             # 📄 Astro-specific implementation
    └── website-tanstack.md          # 📄 TanStack-specific implementation
```

### Sync Script Requirements

#### Functionality
- **Selective Sync**: Should support syncing specific content types or websites
- **Incremental Updates**: Should detect and sync only changed content when possible
- **Asset Copying**: Must copy all associated assets (images, etc.) alongside content
- **Path Normalization**: Should handle different path conventions across operating systems

#### Error Handling
- **Validation**: Should validate content before syncing
- **Rollback**: Should provide mechanisms to rollback failed syncs
- **Logging**: Should provide detailed logging of sync operations
- **Conflict Resolution**: Should handle conflicts when content structure changes

### Integration Requirements for New Websites

When adding a new website to the repository:

1. **Content Structure**: Must use the standardized content folder structure
2. **Sync Integration**: Must integrate with the `syncWebsites.ts` script
3. **Asset Handling**: Must handle synchronized assets appropriately
4. **Build Integration**: Must run sync process during development and build workflows
5. **Documentation**: Must document website-specific content processing in individual specs

### Performance Considerations

#### Sync Performance
- **File Watching**: Sync should integrate with file watching for development
- **Incremental Sync**: Should avoid unnecessary file operations
- **Parallel Processing**: Should support parallel syncing to multiple websites

#### Build Performance
- **Content Caching**: Each website should implement appropriate content caching
- **Asset Optimization**: Each website handles its own asset optimization
- **Hot Reloading**: Sync should integrate with hot module reloading systems

### Maintenance and Monitoring

#### Content Validation
- **Schema Enforcement**: Content should be validated against expected schemas
- **Link Checking**: Should validate internal and external links
- **Asset Verification**: Should verify that referenced assets exist

#### Sync Monitoring
- **Success Tracking**: Should track successful sync operations
- **Error Reporting**: Should report sync failures with detailed information
- **Performance Metrics**: Should monitor sync performance and file sizes

## Conclusion

This centralized content management system enables:
- **Consistency**: Same content across multiple website implementations
- **Flexibility**: Each website can use its preferred technology stack
- **Maintainability**: Single source of truth for all content
- **Scalability**: Easy addition of new website implementations

All website implementations must adhere to this sync system to ensure content consistency and prevent conflicts.
