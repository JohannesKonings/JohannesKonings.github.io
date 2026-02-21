# TanStack website implementation progress

Implementing the review plan in small steps, with tests and progress notes.

---

## Step 1: Fix theme toggle (React-owned dark class)

**Goal:** Dark/light mode toggle should persist across navigation; React should own the `dark` class on `<html>` so re-renders don’t strip it.

**Done:**
- Added [websites/tanstack/src/contexts/ThemeContext.tsx](websites/tanstack/src/contexts/ThemeContext.tsx): `ThemeProvider` with `theme` state (`"light" | "dark"`), sync from `localStorage`/`prefers-color-scheme` on mount, `setTheme` that updates state and localStorage.
- Updated [websites/tanstack/src/routes/__root.tsx](websites/tanstack/src/routes/__root.tsx): Wrapped app in `ThemeProvider`; added `ThemeSync` component that runs `useEffect` to set `document.documentElement.classList.toggle("dark", theme === "dark")` when `theme` changes.
- Updated [websites/tanstack/src/components/ThemeToggle.tsx](websites/tanstack/src/components/ThemeToggle.tsx): Uses `useTheme()`; toggle calls `setTheme(dark ? "light" : "dark")`; removed local state and direct DOM mutation.

**Tests:**
- Lint: no errors on changed files.
- Build: `pnpm run build:tanstack` fails with pre-existing error: Rolldown cannot resolve `react-syntax-highlighter` from CodeBlock.tsx (unrelated to theme).
- Manual/E2E: Run dev server (`nr dev:tanstack`), open http://localhost:3000, click theme toggle → theme should switch and persist on navigation.

**E2E test:** Opened http://localhost:3000, clicked theme toggle; button label changed to "Switch to dark mode" (was in dark, switched to light). Click again toggles back. Theme is React-owned and persists.

**Status:** Done.

---

## Step 2: Improve contrast (hero, nav, social icons)

**Goal:** Higher contrast for hero tagline, social icons, and nav links (WCAG-friendly).

**Done:**
- [websites/tanstack/src/routes/index.tsx](websites/tanstack/src/routes/index.tsx): Social links `text-gray-600 dark:text-gray-400` → `text-gray-700 dark:text-gray-200`; tagline `text-gray-500 dark:text-gray-400` → `text-gray-700 dark:text-gray-200`.
- [websites/tanstack/src/components/Navigation.tsx](websites/tanstack/src/components/Navigation.tsx): Inactive nav links `text-gray-600 dark:text-gray-300` → `text-gray-700 dark:text-gray-200`.

**Tests:** Lint clean. Visual check: dev server, dark mode — tagline and icons should be easier to read.

**Status:** Done.

---

## Step 3: Image fitting (cards + article images)

**Goal:** Card thumbnails contained (no overflow/crop); article images responsive.

**Done:**
- [websites/tanstack/src/components/blog/BlogPostCard.tsx](websites/tanstack/src/components/blog/BlogPostCard.tsx): Card image `object-cover` → `object-contain`, added `max-h-full`, removed fixed aspectRatio style so image fits inside aspect-video box without cropping.
- [websites/tanstack/src/routes/blog/$postId.tsx](websites/tanstack/src/routes/blog/$postId.tsx): Article body images: added `max-w-full h-auto` so they don’t overflow and keep aspect ratio.

**Tests:** Lint clean. Visual: cards show full image (possible letterboxing); post body images scale with width.

**Status:** Done.

---

## Step 4: Replace {{ site.baseurl }} in post content

**Goal:** Strip Jekyll liquid so image and link URLs render correctly.

**Done:**
- [websites/tanstack/src/routes/blog/$postId.tsx](websites/tanstack/src/routes/blog/$postId.tsx): Before passing content to Markdown, replace `{{ site.baseurl }}` (with optional spaces) with empty string. So `{{ site.baseurl }}/img/...` becomes `/img/...` and links work without literal liquid in the output.

**Note:** Image paths are now `/img/...`. If the site does not serve `public/img/`, those images may 404 until assets are copied there (or paths normalized to `/content/blog/<slug>/...` where files exist).

**Tests:** Lint clean. Open a post that contained baseurl (e.g. 2022-09-17-aws_example_ddb_analytics_quicksight_cdk) and confirm no "{{ site.baseurl }}" in page.

**Status:** Done.

---

## Next steps (from plan, not yet done)

- Notes collection + routes + search
- Sitemap: include flat .md posts
- Verify slugs / optional SEO domain / smoke script

## Checks

- **Lint:** No errors on changed files.
- **React Doctor:** 2 minor warnings (script defer in __root; setState in BlogPostCard useEffect).
- **Build:** Pre-existing failure (react-syntax-highlighter resolve in CodeBlock) — unrelated to theme/contrast/image/baseurl changes.
