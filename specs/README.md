# Specifications Directory

This directory contains the technical specifications for the website implementations and content management system.

## File Structure

### 📄 [website-sync-system.md](./website-sync-system.md)

**Central Content Management & Synchronization System**

This is the **foundational specification** that all website implementations must follow. It documents:

- Centralized content management from `_posts/` and `_notes/`
- The `syncWebsites.ts` script operation
- Critical guidelines for content editing
- Multi-website architecture requirements

**⚠️ All developers must read this specification first.**

### 📄 [website-tanstack.md](./website-tanstack.md)

**TanStack Website Implementation**

Specification for the TanStack Start-based website implementation:

- UI/UX requirements (neon metallic theme)
- Content Collections integration
- Current implementation status (95% complete)
- Architecture decisions and file structure

### 📄 [website-astro.md](./website-astro.md)

**Astro Website Implementation**

Specification for the Astro-based website implementation:

- Astro Content Collections integration
- Performance and SEO requirements
- Implementation blueprint (pending implementation)
- Framework-specific considerations

## Important Guidelines

### Content Management

- **NEVER edit content in `websites/*/src/content/` folders**
- **ALWAYS edit content in root `_posts/` or `_notes/` directories**
- Both websites share the same content sources
- The sync system handles content distribution automatically

### Specification Updates

- Update individual website specs for implementation-specific changes
- Update `website-sync-system.md` for changes affecting multiple websites
- Keep specifications in sync with actual implementations
- Document all architecture decisions and their rationale

### Development Workflow

1. Read `website-sync-system.md` for sync requirements
2. Refer to website-specific specs for implementation details
3. Follow the sync guidelines for all content changes
4. Update relevant specifications when making architectural changes

## Specification Maintenance

Each specification should be kept up-to-date with:

- Current implementation status
- Architecture decisions and rationale
- Dependencies and their versions
- Known issues and technical debt
- Future enhancement plans

Regular reviews should ensure specifications accurately reflect the current state and guide future development decisions.
