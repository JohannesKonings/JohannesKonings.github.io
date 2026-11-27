# Pre-publish SEO checklist

Google Search Console shows posts that rank for a query but get almost no clicks,
because the title and description miss the words people search for. Run the SEO
check before publishing a post and fix what it reports.

## Run the check

```sh
# one post
vp exec tsx scripts/checkSeo.ts <slug>
# or
vp run check:seo <slug>

# every post
vp exec tsx scripts/checkSeo.ts --all
```

`<slug>` is the post directory name, e.g. `2026-10-12-drizzle-aurora-migrations`.
The script reads `_posts/<slug>/index.md`, the authoring source that is synced to
`websites/tanstack/src/content/blog/<slug>/index.md` for the build. It exits
non-zero when it finds errors and zero when it finds only warnings, so it is safe
to run as a non-blocking step.

## What it checks

Errors (fix before publishing):

- **One `<h1>` per page.** The layout renders the frontmatter `title` as the
  page's single `<h1>` (see `websites/tanstack/src/routes/blog/$postId.tsx`), so
  the body must start its headings at `##`. A body `#` becomes a second `<h1>`.
- Frontmatter `title` and `summary` are present.

Warnings (worth fixing):

- **Title length** ~30–60 characters, before the ` | Johannes Konings` suffix the
  site adds. Short titles waste the search result; long ones get truncated.
- **Summary length** ~70–160 characters. `summary` is the meta description and the
  OpenGraph / Twitter description.
- **Heading hierarchy**: at least one `##`, and no skipped levels (no `##` → `####`).
- **At least one internal link** to another `johanneskonings.dev` post or note
  (`/blog/<slug>` or `/notes/<slug>`, absolute or relative).
- **Images have alt text.**
- **Slug** is `<date>-<slug>` with a `YYYY-MM-DD` prefix.

## Optional: primary keyword

The check does not require it, and the content collections schema ignores it, but
if a post's frontmatter declares a `keywords` field, the first keyword is treated
as the primary one and must appear in the title, the summary, and the first
paragraph so the page matches the query it targets:

```yaml
keywords:
  - Release Drafter
  - changelog
```

This is a pre-publish hint only; it is not rendered and does not change the build.

## Checklist

- [ ] `title` carries the words people search for, ~30–60 chars.
- [ ] `summary` is a useful ~70–160 char meta description.
- [ ] Body headings start at `##`, no skipped levels.
- [ ] At least one internal link to another post or note.
- [ ] Every image has alt text.
- [ ] `vp exec tsx scripts/checkSeo.ts <slug>` is clean (or only expected warnings).
- [ ] Cross-post assets pass: `vp exec tsx scripts/checkCrossPostAssets.ts <slug>`
      (see [crossPosts/README.md](../crossPosts/README.md)).
