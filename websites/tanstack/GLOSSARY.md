# TanStack blog

The primary website in this monorepo. A TanStack Start app that renders synced posts and notes, with search, RSS, and prerendered pages.

## Language

**TanStack blog**:
The `websites/tanstack` application served at `/` in development on port 3000.
_Avoid_: Website, app, site (when this specific package is meant)

**Synced content**:
The copy of posts and notes under `src/content/` produced by the root content sync step.
_Avoid_: Source content, authored content, master copy

**Content collection**:
A typed markdown collection defined in `content-collections.ts` and processed at build time.
_Avoid_: Content folder, markdown source, CMS

**Prerender**:
Static HTML generation for routes configured in `vite.config.ts` during production builds.
_Avoid_: SSG, static export, prebuild
