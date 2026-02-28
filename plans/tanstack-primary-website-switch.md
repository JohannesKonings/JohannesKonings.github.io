# TanStack as primary website switch

Make TanStack the primary site at the deployment root and Astro the secondary at `/astro`. Preserve `_posts`/`_notes` sync, keep SEO/GEO intact (sitemap, robots, ads.txt, canonicals), align with the Josef Bender video stack, and keep TanStack animations subtle. Implementation to follow later.

---

## Video alignment (Josef Bender – TanStack Start + Markdown)

The [video](https://www.youtube.com/watch?v=Cw8scPKibe8) uses **TanStack Start**, **Content Collections**, and **Markdown** (Zod schema, React Markdown, Tailwind Typography). Your repo already uses the same stack:

- [websites/tanstack/content-collections.ts](websites/tanstack/content-collections.ts) – Content Collections + Zod
- [websites/tanstack/vite.config.ts](websites/tanstack/vite.config.ts) – TanStack Start + Content Collections Vite plugin
- Blog content from markdown with frontmatter

No new tools are required; the only difference is content source: the video uses `content/posts`; you keep **`_posts`** and **`_notes`** as the single source and sync into each site (see below).

---

## 1. Content sync: keep \_posts and \_notes as source

**Current behavior:** [scripts/syncWebsites.ts](scripts/syncWebsites.ts) syncs `_posts` → blog and `_notes` → notes for **Astro** only. For **TanStack**, it only syncs `_posts` → blog; **`_notes` is not synced**.

**Required:**

- In `syncTanstack()`, add sync of `_notes` → notes (same as Astro), so both sites receive notes from the single source.
- Keep the existing flow: sync runs on `pnpm dev:tanstack` and `pnpm build:tanstack` (and for Astro on dev/build). All edits stay in root `_posts/` and `_notes/`; website folders remain sync targets only.
- After adding notes sync, the TanStack `syncContentPlugin` (and the existing `cp -r src/content public/`) will also copy notes to `public/content/notes` if you later add notes routes. No change to Content Collections config is strictly required for "sync like before"; adding a notes collection and routes can be a follow-up.

**Files:** [scripts/syncWebsites.ts](scripts/syncWebsites.ts) – add `await sync("_notes", "notes", pathPrefix);` in `syncTanstack()` (reuse same `pathPrefix` as blog).

---

## 2. Deploy layout: TanStack at root, Astro at /astro

**Current:** Astro dist is copied to `dist/` (root); TanStack to `dist/tanstack/`.  
**Target:** TanStack at root; Astro under `dist/astro/`.

**Workflow** [.github/workflows/websites.yml](.github/workflows/websites.yml):

- **Build order:** Build TanStack first, then Astro (so you can combine with TanStack as root).
- **Astro build:** Pass base path for subfolder: e.g. `--base "/astro"` (and keep `--site` from Pages or set to deployment origin + `/astro` so sitemap/canonicals use the correct base). This makes Astro's assets and routes live under `/astro`.
- **Combine step:**
  - Create `dist/` and copy **TanStack** `.output/public` into `dist/` (root).
  - Create `dist/astro` and copy **Astro** `dist` contents into `dist/astro/`.
  - Copy **ads.txt** to **deployment root** (`dist/`) for GEO (reuse [websites/astro/ads.txt](websites/astro/ads.txt) or add one under TanStack and copy from there).
  - Keep `.nojekyll` in `dist/`.
  - For TanStack SPA at root: copy `dist/index.html` to `dist/404.html` so client-side routing works on direct/refresh.

**TanStack app config:**

- [websites/tanstack/vite.config.ts](websites/tanstack/vite.config.ts): set `base: mode === "production" ? "/" : "/"` (i.e. always `/` when TanStack is root).
- [websites/tanstack/src/router.tsx](websites/tanstack/src/router.tsx): set `basepath: undefined` in production (or remove the `/tanstack` basepath) so routes are at root.

**SEO base URLs:**

- [websites/tanstack/src/lib/seo.ts](websites/tanstack/src/lib/seo.ts): change `baseUrl` from `https://johanneskonings.github.io/tanstack` to the deployment root (e.g. `https://johanneskonings.github.io` or your custom domain). Update all usages (canonical, openGraph, twitter, structured data) so they point to root URLs.

---

## 3. SEO and GEO after the switch

**Do not break SEO/GEO:** Root must still expose the right metadata, crawler hints, and ads.

- **Canonicals / meta:** TanStack already has [websites/tanstack/src/lib/seo.ts](websites/tanstack/src/lib/seo.ts) and meta in [websites/tanstack/src/routes/\_\_root.tsx](websites/tanstack/src/routes/__root.tsx). After the baseUrl change above, canonicals and OG/Twitter URLs will point to the new root (correct).

- **robots.txt at root:** TanStack currently has no robots.txt. Add one at the **deployment root** (e.g. in TanStack `public/robots.txt` so it ends up in `dist/`):
  - `User-agent: *` / `Allow: /`
  - `Sitemap: <deployment-origin>/sitemap-index.xml` (or the sitemap URL you use for the primary site).

- **Sitemap at root:** Astro uses `@astrojs/sitemap`; TanStack has no sitemap yet. Add a **sitemap for the primary (TanStack) site** at root:
  - Option A: Generate a static `sitemap-index.xml` (and optionally per-section sitemaps) at build time from TanStack routes/blog posts and place it in TanStack `public/` or build output.
  - Option B: Use a TanStack route or build script that writes sitemap XML. Ensure the sitemap URL in `robots.txt` matches.

- **Astro (secondary at /astro):** Ensure Astro's `site` and `base` are set so its sitemap and canonicals use `/astro` (e.g. `site: "https://johanneskonings.github.io"` with base `"/astro"` so pages are `https://.../astro/...`). If you want a single robots.txt at root, you can add a second `Sitemap:` line for `.../astro/sitemap-index.xml`.

- **GEO:** Keep **ads.txt** at the **deployment root** (copy from Astro or add to TanStack and copy to `dist/` in the combine step). No change to ad verification if the same file is served at the same root URL.

---

## 4. TanStack behavior and animations

- **Functionality:** Ensure the TanStack site works at root: home, blog list, blog post (`/blog`, `/blog/$postId`), and any existing tag/category routes. After the base/basepath and SEO URL changes, run a quick smoke test (build, open root and key routes, check links and meta tags).

- **Animations:** Specs already ask for "subtle" animations on TanStack (e.g. [specs/website-tanstack.md](specs/website-tanstack.md): "subtle animations like gentle pulsing… slow hover transitions"). Keep this level; do **not** port heavy Astro-only effects (e.g. TwinklingStars, MeteorShower, or heavy `animate.js`/`bg.js` usage) to the primary TanStack site. Slight animation is fine; "not so much like in the astro version" means keeping TanStack lighter than Astro.

---

## 5. Font and code snippets (code blog)

**Font recommendation:** Use a single, readable monospace (or mono-heavy) font for both body and code so the site feels consistent and code is easy to read.

- **Preferred:** **Cascadia Code** or **Cascadia Mono** – you already use it on Astro (CascadiaMonoNF) and TanStack references "Cascadia Code" in [websites/tanstack/src/styles/global.css](websites/tanstack/src/styles/global.css). It's well suited for code blogs: clear, good ligatures in Cascadia Code, and widely used in editors. Ship it via `@font-face` with woff2 and `font-display: swap`, and preload in the document head (as in [websites/astro/src/components/BaseHead.astro](websites/astro/src/components/BaseHead.astro)) so code and UI don't flash in a fallback font.
- **Alternatives:** **JetBrains Mono** (excellent for code, free), **Fira Code** (ligatures, good for snippets), **IBM Plex Mono** (neutral, readable). Pick one and use it consistently for `pre`, `code`, and optionally body.

**Code snippets – display and copy:** The primary (TanStack) site must show code blocks clearly and support one-click copy.

- **Current gap:** TanStack uses [markdown-to-jsx](websites/tanstack/src/routes/blog/$postId.tsx) with custom `pre`/`code` overrides: gray background, rounded corners, no syntax highlighting and **no copy button**. Astro uses `rehype-pretty-code` + `transformerCopyButton` (visibility always, 2.5s feedback) and thus has both highlighting and copy.
- **Required for TanStack:**
  - **Syntax highlighting** for fenced code blocks (language-aware colors). Options: use **react-syntax-highlighter** (or similar) inside a custom `pre` override and derive language from the markdown; or switch the markdown pipeline to **React Markdown** + **rehype-highlight** / **rehype-prism** (or a React-based highlighter) so blocks are highlighted before render.
  - **Copy button** on every code block: a button that copies the raw text to the clipboard and shows brief feedback (e.g. "Copied!" for 2–2.5s), matching Astro's behavior. Implement as a wrapper around the rendered `<pre>` (e.g. a `CodeBlock` component that renders the highlighted content and a copy button in the top-right).
- **Styling:** Keep block background, padding, border-radius, and horizontal scroll so long lines don't break layout; use the chosen monospace font for `pre` and `code` (and optionally a slightly smaller size for blocks). Ensure sufficient contrast for both light and dark themes.

**Concrete steps:**

- In TanStack: add a **CodeBlock** (or equivalent) component that (1) accepts raw code + optional language, (2) highlights via the chosen library, (3) renders a copy button, (4) uses the site monospace font.
- In the blog post route, use this component for fenced code (e.g. via Markdown `overrides.pre` rendering a wrapper that parses language and delegates to CodeBlock, or by replacing markdown-to-jsx with React Markdown and custom `components.pre`).
- Ensure **Cascadia Code/Mono** (or the chosen font) is loaded and applied to `pre, code` in [websites/tanstack/src/styles/global.css](websites/tanstack/src/styles/global.css) (and in the CodeBlock component if needed). If the font is self-hosted, add `@font-face` and preload in the TanStack root layout/head.

---

## 6. Tag filtering, global search, Giscus, and series

### Tag and category filtering

- **Current:** TanStack already has tag/category filtering on the blog list ([BlogPostList](websites/tanstack/src/components/blog/BlogPostList.tsx)) and dedicated routes `/blog/tag/$tag` and `/blog/category/$category`. Keep and polish: ensure filter chips and URL state stay in sync where useful (e.g. deep-link to `/blog?tag=aws` or rely on `/blog/tag/aws`), and that the blog list page makes tag/category filters obvious and easy to clear.
- **Optional:** Add a global filter or "filter by tag" entry point from the header/nav (e.g. dropdown or link to /blog with prominent filters).

### Global search

- **Current:** Astro has a **global search** page ([search/index.astro](websites/astro/src/pages/search/index.astro)) that searches both **blog posts and notes** via [Fuse.js](websites/astro/src/components/Search.tsx) (keys: slug, title, summary, tags). TanStack has in-page search only on the blog list (posts only, no notes).
- **Required for TanStack:** Add a **global search** experience that searches **all blog posts and notes** using **Orama** (https://oramasearch.com):
  - Add a **/search** route. In the loader, pass `allPosts` and `allNotes` (once notes collection exists) so the page has all searchable items.
  - Use **Orama** for search: build an index at build time (serialize to JSON) or on the client from the loaded list; index fields: title, summary, excerpt, tags, optionally content/slug. Implement a **Search** component (React) that uses Orama's `search()` over the index. Mirror Astro's UX: input with "What are you looking for?", min length (e.g. 2 chars), show results as cards (post vs note) with link to the post/note URL.
  - Expose search from the main nav (e.g. "Search" link or icon to /search, or a header search box that navigates to /search?q=...).
- **Dependency:** Add `@orama/orama` to TanStack; if using a pre-built index, add a build-step script to generate the index JSON. Notes must be synced and have a Content Collections "notes" collection for global search to include them.

### Giscus (comments)

- **Current:** Astro uses **Giscus** for comments on blog posts ([PostComments.astro](websites/astro/src/components/PostComments.astro)) and notes ([NoteComments.astro](websites/astro/src/components/NoteComments.astro)) with different Giscus categories ("Blog Post Comments" vs "Note comments"). TanStack has **no comments**.
- **Required for TanStack:** **Implement Giscus** on the primary site so blog (and notes, when present) keep the same discussion threads:
  - Add a **Giscus** React component that injects the Giscus script and mounts the widget (e.g. in a `section` with a ref). Use the same repo and mapping as Astro: `data-repo="JohannesKonings/JohannesKonings.github.io"`, `data-mapping="url"`, `data-theme="preferred_color_scheme"`, and the same **category** / **category-id** for blog vs notes so threads match across Astro and TanStack (same URL = same thread).
  - Render this component in the **blog post** layout/footer ([websites/tanstack/src/routes/blog/$postId.tsx](websites/tanstack/src/routes/blog/$postId.tsx)) for every post. When notes routes exist, render it on note pages with the note category.
  - Ensure the script loads with the correct **page URL** (canonical or current window location) so Giscus maps to the right discussion. Lazy-load the script (e.g. when the comments section is in view or on route load) to avoid blocking.

### Series (enhanced vs Astro)

- **Current:** Frontmatter already has `series` (e.g. `series: tanstack-aws`, `series: cdk-notifier`). Astro uses **prev/next by collection and date** only ([ArticleBottomLayout.astro](websites/astro/src/layouts/ArticleBottomLayout.astro)); it does **not** use `series` for navigation. TanStack content-collections schema does **not** include `series` yet.
- **Required for TanStack (enhancement over Astro):**
  - **Schema:** Add optional `series: z.string().optional()` (or similar) to the blog posts schema in [websites/tanstack/content-collections.ts](websites/tanstack/content-collections.ts). Ensure sync'd frontmatter keeps the field.
  - **Series index:** Add a route **/blog/series/$seriesSlug** that lists all posts in that series, ordered by date (or a future `seriesOrder` if you add it). Show series title and post cards with "Part 1", "Part 2", etc. if desired.
  - **Post page – series context:** On each blog post that has `series`, show:
    - A **series banner** or line: e.g. "Part N of M · [Series name](link to series index)".
    - **Prev/next within the same series** (not global): "Previous: [title]" / "Next: [title]" linking to the previous/next post in the same series by date. If the post is not in a series, fall back to global prev/next or hide.
  - **Optional:** In the transform, compute `seriesPosts` or expose a helper so each post knows its index-in-series and total count; use that for "Part N of M" and prev/next links.

---

## 7. Summary of file and config changes

| Area                                                                 | Action                                                                                                                                                                                              |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [scripts/syncWebsites.ts](scripts/syncWebsites.ts)                   | Add `_notes` → notes sync in `syncTanstack()`.                                                                                                                                                      |
| [.github/workflows/websites.yml](.github/workflows/websites.yml)     | Build TanStack then Astro; combine TanStack → dist/, Astro → dist/astro/; copy ads.txt to dist/; 404.html for TanStack at root. Pass `--base "/astro"` (and correct `--site`) for Astro.            |
| [websites/tanstack/vite.config.ts](websites/tanstack/vite.config.ts) | Production `base: "/"`.                                                                                                                                                                             |
| [websites/tanstack/src/router.tsx](websites/tanstack/src/router.tsx) | Production basepath: undefined (root).                                                                                                                                                              |
| [websites/tanstack/src/lib/seo.ts](websites/tanstack/src/lib/seo.ts) | Set baseUrl to deployment root (no `/tanstack`).                                                                                                                                                    |
| TanStack                                                             | Add `public/robots.txt` and a generated or static sitemap at root; ensure links in meta and structured data use new baseUrl.                                                                        |
| Astro                                                                | Ensure `site` + `base` so sitemap and canonicals use `/astro`.                                                                                                                                      |
| Specs/docs                                                           | Update [specs/website-tanstack.md](specs/website-tanstack.md) / [specs/website-astro.md](specs/website-astro.md) (and any README) to state TanStack = primary at root, Astro = secondary at /astro. |
| TanStack font + code                                                 | Use Cascadia Code/Mono (or JetBrains Mono / Fira Code) with @font-face + preload; add CodeBlock with syntax highlighting + copy button; apply monospace to `pre`/`code`.                            |
| Tag filtering                                                        | Keep and polish existing tag/category filters and routes on blog list; optional header filter entry.                                                                                                |
| Global search                                                        | Add /search route; Search component with **Orama** over posts + notes (index at build or on client); link from nav.                                                                                 |
| Giscus                                                               | Add Giscus React component; same repo/category IDs as Astro; render on blog post (and note) pages.                                                                                                  |
| Series                                                               | Add `series` to content-collections schema; /blog/series/$seriesSlug index; series banner and series-aware prev/next + "Part N of M" on post page.                                                  |

---

## 8. Verification

- Run `pnpm build:tanstack` and `pnpm build:astro` (with the new base for Astro) and confirm combine step produces `dist/` with TanStack at root and Astro under `dist/astro/`.
- Check root serves the TanStack app and `/astro` serves Astro.
- Validate SEO: root page and a blog post have correct canonical and OG URLs (no `/tanstack`).
- Validate GEO: `https://<deployment-root>/ads.txt` returns the expected content.
- Check `robots.txt` and sitemap at root and, if applicable, Astro sitemap under `/astro`.
