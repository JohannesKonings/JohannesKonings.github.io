# Content authoring

Authoring workspace for blog posts, notes, and cross-platform distribution. Root `_posts/` and `_notes/` are the single source of truth for published content.

## Language

**Post**:
A long-form blog article authored in `_posts/` and published on the TanStack website.
_Avoid_: Article, entry, story

**Note**:
A shorter piece in `_notes/`, published on the website's notes section.
_Avoid_: Snippet, memo, quick post

**Source content**:
Markdown and assets in root `_posts/` or `_notes/` before website sync.
_Avoid_: Website content, synced copy, build input

**Content sync**:
Copying source content from `_posts/` and `_notes/` into `websites/tanstack/src/content/`.
_Avoid_: Import, mirror, publish

**Cross-post**:
A derivative markdown export in `crossPosts/` for external platforms such as dev.to.
_Avoid_: Syndication, republish, mirror
