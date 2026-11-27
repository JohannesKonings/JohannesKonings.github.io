# Cross posts

Linked via `canonical_url`.

dev.to API: https://developers.forem.com/api/v0#tag/articles/operation/updateArticle

`vp exec tsx scripts/syncCrossPosts.ts` rewrites a post's markdown into `crossPosts/devTo/posts/` and points image links at `https://johanneskonings.dev/content/blog/<slug>/<file>`.

## Cross-post assets

dev.to does not render SVG. AWS Builder Center rejects SVG and external images, and it requires a 1200×675 cover (jpg, png, or webp, max 2 MB).

Put the files in `_posts/<slug>/`. Content sync copies that whole directory into the site, including files the markdown does not reference, and the build serves them at:

`https://johanneskonings.dev/content/blog/<slug>/<file>`

The blog markdown stays on SVG. Cross-posts use the raster files below.

| File                                    | Role                                                                                                                                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cover-image.png`                       | Blog cover and dev.to cover. Frontmatter stays `cover_image: ./cover-image.png`. Recent posts are 1000×420. Older posts may point `cover_image` at another raster file in the folder; that file is the dev.to cover. |
| `cover-builder-1200x675.png`            | AWS Builder Center cover. Exactly 1200×675, jpg/png/webp, max 2 MB. Same basename with `.jpg` or `.webp` is accepted. The markdown does not reference this file.                                                     |
| `<diagram>.png` next to `<diagram>.svg` | PNG fallback for that diagram. Export at 1600px wide on a white background. Cross-post bodies should use the PNG URL.                                                                                                |

There is no separate cover frontmatter. `cover_image` is already the dev.to cover. The Builder Center cover is found by filename, which is what gets it published without an image link. dev.to allows at most 4 tags. The post `tags` list can be longer; pick four when cross-posting. Do not add a second tag list to the frontmatter.

The site does not rasterize SVG. Commit the PNG files. Check a post before cross-posting:

```sh
vp exec tsx scripts/checkCrossPostAssets.ts <slug>
vp exec tsx scripts/checkCrossPostAssets.ts <slug> --output websites/tanstack/.output/public
```

The second form checks that every non-markdown file in the post directory is present, at the same size, under `.output/public/content/blog/<slug>/`. Warnings (dev.to cover size, more than 4 tags) do not fail the command. Missing fallbacks and a bad Builder Center cover do.

This convention is for posts you cross-post. Existing posts are not backfilled.
