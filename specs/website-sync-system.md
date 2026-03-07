# Website Sync System Specification

## Overview

This document specifies the centralized content management and synchronization system used by the TanStack website in this repository. The system keeps authored content in a single place while generating the website-specific content copy consumed during development and builds.

## Content Management & Synchronization System

**CRITICAL: All blog posts and notes are centrally managed and synchronized into the TanStack website using the `syncWebsites.ts` script.**

### Content Architecture

- **Primary Sources**:
  - All blog posts are maintained in the root `_posts/` directory
  - All notes are maintained in the root `_notes/` directory
- **Synchronization**: The `scripts/syncWebsites.ts` script copies content from the root directories into the TanStack website content folders
- **Website Content**: The website content folder contains only synchronized copies of the original content:
  - `websites/tanstack/src/content/blog/` - TanStack website blog content
  - `websites/tanstack/src/content/notes/` - TanStack website notes content
- **Single Source of Truth**: The root `_posts/` and `_notes/` directories are the authoritative sources for all content

### Critical Guidelines for All Development

#### ⚠️ NEVER Edit Website Content Folders Directly

- **Never directly edit files in website content folders** - these are synchronized copies that will be overwritten
- **All content edits must be made in the root `_posts/` or `_notes/` directories**
- **Image assets (cover images, etc.) are also managed through the sync process**

#### Development Workflow Requirements

- **The sync script runs automatically during the TanStack development and build workflow**
- **TanStack Content Collections process the synchronized content, not the original source files**
- **All content and asset updates must continue to flow through this sync process**

#### Root Package.json Command Structure

**All important website commands are callable from the repository root using prefixed commands:**

```bash
# Development Commands
pnpm dev:tanstack   # Start TanStack website development server

# Build Commands
pnpm build:tanstack # Build TanStack website for production

# Other Commands (future)
pnpm test:tanstack  # Run TanStack website tests
pnpm lint:tanstack  # Lint TanStack website code
```

**Implementation Pattern:**

- Root `package.json` defines website-specific commands with prefixes
- Commands use `pnpm --filter [website] [command]` to execute in website directories
- This allows centralized command execution while maintaining workspace isolation
- All developer documentation should reference root commands, not website-specific commands

### Sync Process Details

#### Sync Script Operation

1. **Source Content**: Original posts in `_posts/` and notes in `_notes/` contain the master content
2. **Synchronization**: `syncWebsites.ts` copies content to:
   - `websites/tanstack/src/content/blog/` (for blog posts)
   - `websites/tanstack/src/content/notes/` (for notes)
3. **Processing**: TanStack Content Collections process the synchronized copies
4. **Build**: The TanStack build process generates the final pages

#### Asset Management

- **Images**: Cover images and other assets are synchronized alongside content
- **Relative Paths**: Content uses relative paths (e.g. `./cover-image.png`) that are processed by the build system
- **Format Support**: Supports multiple image formats (PNG, AVIF, JPG, etc.)

### Website-Specific Considerations

#### Content Processing

- **TanStack Website**: Uses the Content Collections library to process synchronized content
- **Schema Validation**: The website defines its own content validation schema
- **Transformations**: The website can apply its own content transformations

#### Asset Handling

- **Public Directory**: The website manages its own public directory structure
- **Image Paths**: The website handles image path resolution according to its framework conventions
- **Optimization**: The website can implement its own image optimization strategies

### File Structure

```text
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
│   └── tanstack/
│       └── src/content/
│           ├── blog/                # 📋 Synced copies (DO NOT EDIT)
│           └── notes/               # 📋 Synced copies (DO NOT EDIT)
└── specs/
    ├── website-sync-system.md       # 📄 This document
    └── website-tanstack.md          # 📄 TanStack-specific implementation
```

### Sync Script Requirements

#### Functionality

- **Selective Sync**: Supports syncing the TanStack website content folders from the root content sources
- **Asset Copying**: Must copy all associated assets (images, etc.) alongside content
- **Path Normalization**: Should handle different path conventions across operating systems

#### Error Handling

- **Validation**: Should validate content before syncing
- **Logging**: Should provide detailed logging of sync operations
- **Conflict Resolution**: Should handle conflicts when content structure changes

### Performance Considerations

#### Sync Performance

- **File Watching**: Sync should integrate with file watching for development
- **Incremental Sync**: Should avoid unnecessary file operations where possible

#### Build Performance

- **Content Caching**: The website should implement appropriate content caching
- **Asset Optimization**: The website handles its own asset optimization
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

- **Consistency**: A single source of truth for all posts and notes
- **Flexibility**: The website can evolve without changing the editing workflow
- **Maintainability**: Content editing and website rendering remain cleanly separated
- **Scalability**: A predictable sync boundary between authored content and generated website content

The TanStack website implementation must adhere to this sync system to ensure content consistency and prevent conflicts.
