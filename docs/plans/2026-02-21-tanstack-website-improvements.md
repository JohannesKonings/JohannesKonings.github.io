# TanStack Website Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical light-mode styling bugs, improve navigation/accessibility, and add missing UX features to the TanStack blog at `websites/tanstack/`.

**Architecture:** The site uses TanStack Start (React) with file-based routing, Content Collections for markdown blog/notes, Tailwind CSS 4 for styling, and Orama for search. All changes are in `websites/tanstack/src/`. No test framework exists — verification is visual via `pnpm dev:tanstack` (localhost:3000).

**Tech Stack:** TanStack Start 1.124, React 19, Tailwind CSS 4, Vite 8, Content Collections, Orama, Giscus

---

## Phase A: Critical Fixes

### Task 1: Fix light-mode styling in BlogPostList filter section

**Files:**
- Modify: `websites/tanstack/src/components/blog/BlogPostList.tsx`

**Step 1: Fix the filter container background**

In `BlogPostList.tsx`, replace the hardcoded dark filter container (line ~100) with theme-aware classes:

```tsx
// OLD (line 100):
<div className="mb-8 space-y-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-gray-600/30">

// NEW:
<div className="mb-8 space-y-6 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-600/30 shadow-sm">
```

**Step 2: Fix the search input**

```tsx
// OLD (line 108):
className="w-full px-4 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"

// NEW:
className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-600/50 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
```

**Step 3: Fix unselected tag/category pill styling**

```tsx
// OLD (lines 129, 153 — the unselected state for tags and categories):
"bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-300 border border-gray-600/30 hover:border-cyan-500/50 hover:text-cyan-300"

// NEW:
"bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600/30 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-300"
```

Apply the same pattern to the category pills (line ~153).

**Step 4: Fix "Clear all filters" button**

```tsx
// OLD (line 174):
className="px-4 py-2 text-sm bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30 rounded-lg hover:border-red-400/60 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-orange-500/30 transition-all duration-300 transform hover:scale-105"

// NEW:
className="px-4 py-2 text-sm bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-300 dark:border-red-500/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/30 transition-all duration-300"
```

**Step 5: Fix results count text**

```tsx
// OLD (line 184):
<p className="text-sm bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">

// NEW:
<p className="text-sm text-gray-600 dark:text-gray-400">
```

**Step 6: Fix empty state styling**

```tsx
// OLD (line 192-193):
<div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm p-8 rounded-xl border border-gray-600/30">
  <p className="text-gray-400 text-lg">

// NEW:
<div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-600/30">
  <p className="text-gray-600 dark:text-gray-400 text-lg">
```

Also fix the sub-text on line ~199:
```tsx
// OLD:
<p className="text-gray-500 text-sm mt-2">
// (this one is actually fine for both modes)
```

**Step 7: Remove the focus-within gradient div (line ~110)**

The gradient overlay inside the search input's parent div uses hardcoded dark colors and isn't needed:
```tsx
// REMOVE this line entirely (line ~110):
<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-lg pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
```

**Step 8: Verify**

Run: `pnpm dev:tanstack` → open http://localhost:3000/blog
- In light mode: filter section should have white/light background, readable text, visible tags
- In dark mode: should look the same as before (dark backgrounds, light text)
- Toggle theme and verify both states

**Step 9: Commit**

```bash
git add websites/tanstack/src/components/blog/BlogPostList.tsx
git commit -m "fix: light-mode styling for blog filter section"
```

---

### Task 2: Fix light-mode styling in BlogPostCard

**Files:**
- Modify: `websites/tanstack/src/components/blog/BlogPostCard.tsx`

**Step 1: Fix tag pill styling**

```tsx
// OLD (line 123):
className="px-3 py-1.5 text-xs bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105"

// NEW:
className="px-3 py-1.5 text-xs bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-all duration-300"
```

**Step 2: Fix "+N more" badge**

```tsx
// OLD (line 129):
className="px-3 py-1.5 text-xs bg-gradient-to-r from-gray-600/50 to-gray-700/50 text-gray-300 rounded-full border border-gray-500/30"

// NEW:
className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300 rounded-full border border-gray-300 dark:border-gray-500/30"
```

**Step 3: Verify**

Run: `pnpm dev:tanstack` → open http://localhost:3000
- Light mode: tag pills should be light cyan with dark text, "+N more" badge readable
- Dark mode: unchanged from current

**Step 4: Commit**

```bash
git add websites/tanstack/src/components/blog/BlogPostCard.tsx
git commit -m "fix: light-mode styling for blog post card tags"
```

---

### Task 3: Fix light-mode "View All Posts" button on homepage

**Files:**
- Modify: `websites/tanstack/src/routes/index.tsx`

**Step 1: Fix button styling**

```tsx
// OLD (line 121):
className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded-full border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"

// NEW:
className="inline-flex items-center px-8 py-4 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-400/60 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
```

**Step 2: Fix button text gradient**

```tsx
// OLD (line 123):
<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">

// NEW:
<span className="text-cyan-700 dark:text-transparent dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-400 dark:bg-clip-text">
```

**Step 3: Clean up commented-out code**

Remove the commented-out imports and route alternatives on lines 4-8 and 30-43 of `index.tsx`:

```tsx
// DELETE lines 4-8 (commented-out icon imports)
// DELETE lines 30-43 (commented-out route patterns)
// Also remove line 24 (commented-out fontawesome config)
```

**Step 4: Verify**

Light mode: "View All Posts" button should be cyan-tinted with readable text.

**Step 5: Commit**

```bash
git add websites/tanstack/src/routes/index.tsx
git commit -m "fix: light-mode View All Posts button and clean up dead code"
```

---

### Task 4: Add responsive mobile navigation

**Files:**
- Modify: `websites/tanstack/src/components/Navigation.tsx`

**Step 1: Add mobile hamburger menu**

Replace the entire `Navigation` component with a responsive version that:
- Shows horizontal nav links on `md:` and above (current behavior)
- Shows a hamburger button on small screens
- Opens a slide-down menu panel when hamburger is clicked
- Includes the theme toggle in both mobile and desktop views

```tsx
import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import type { JSX } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/blog", label: "Blog", exact: false },
  { to: "/notes", label: "Notes", exact: false },
  { to: "/search", label: "Search", exact: true },
] as const;

export function Navigation(): JSX.Element {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string, exact: boolean) =>
    exact ? currentPath === to : currentPath.startsWith(to);

  const linkClasses = (to: string, exact: boolean) =>
    `relative px-6 py-2 text-sm font-medium transition-all duration-300 group ${
      isActive(to, exact)
        ? "text-cyan-600 dark:text-cyan-400"
        : "text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400"
    }`;

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-600 shadow-lg backdrop-blur-sm transition-colors duration-300 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:justify-center md:gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <Link key={to} to={to} className={linkClasses(to, exact)}>
                <span className="relative z-10">{label}</span>
                <div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 ${
                    isActive(to, exact) ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to, exact)
                    ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
```

**Step 2: Verify**

- Desktop (>768px): nav should look similar to current horizontal layout
- Narrow browser (<768px): should show hamburger on left, theme toggle on right. Tapping hamburger reveals stacked nav links. Tapping a link closes the menu.

**Step 3: Commit**

```bash
git add websites/tanstack/src/components/Navigation.tsx
git commit -m "feat: add responsive mobile navigation with hamburger menu"
```

---

### Task 5: Add 404 Not Found page

**Files:**
- Modify: `websites/tanstack/src/router.tsx`
- Modify: `websites/tanstack/src/routes/__root.tsx`

**Step 1: Add defaultNotFoundComponent to router**

In `websites/tanstack/src/router.tsx`, add the default not-found component:

```tsx
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export function createRouter() {
  const router = createTanStackRouter({
    basepath: undefined,
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: DefaultNotFound,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export const getRouter = createRouter;
```

**Step 2: Remove the per-route notFoundComponent from index.tsx**

In `websites/tanstack/src/routes/index.tsx`, remove the `notFoundComponent` property from the Route (it's redundant now that a default is set):

```tsx
// REMOVE:
notFoundComponent: () => <div>Page Not Found</div>,
```

**Step 3: Verify**

Navigate to http://localhost:3000/nonexistent — should see styled 404 page with "Go home" link. Terminal warnings about missing notFoundComponent should stop.

**Step 4: Commit**

```bash
git add websites/tanstack/src/router.tsx websites/tanstack/src/routes/index.tsx
git commit -m "feat: add styled 404 page as default notFoundComponent"
```

---

### Task 6: Add skip link for accessibility

**Files:**
- Modify: `websites/tanstack/src/routes/__root.tsx`
- Modify: `websites/tanstack/src/styles/global.css`

**Step 1: Add skip link in RootDocument**

In `__root.tsx`, add a skip link as the first child of `<body>`, before the theme-init script:

```tsx
<body>
  <a
    href="#main-content"
    className="skip-link"
  >
    Skip to content
  </a>
  <script src="/theme-init.js" suppressHydrationWarning />
```

**Step 2: Add the `id="main-content"` target**

In `RootComponent`, add the id to the `<main>` element:

```tsx
<main id="main-content" key={pathname} className="animate-route-fade">
```

**Step 3: Add skip-link CSS**

In `global.css`, add the skip-link style (visually hidden until focused):

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #0e7490;
  border: 2px solid #0e7490;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 1rem;
}
```

**Step 4: Verify**

Open http://localhost:3000, press Tab — the "Skip to content" link should appear at the top center. Pressing Enter should scroll/focus past the navigation.

**Step 5: Commit**

```bash
git add websites/tanstack/src/routes/__root.tsx websites/tanstack/src/styles/global.css
git commit -m "feat: add skip-to-content link for keyboard/screen reader users"
```

---

### Task 7: Add footer to homepage

**Files:**
- Modify: `websites/tanstack/src/routes/index.tsx`

**Step 1: Wrap homepage content in BlogLayout**

The homepage currently renders raw JSX without `BlogLayout`, so it lacks a footer. The simplest fix: add a footer directly to the homepage (don't use `BlogLayout` since the homepage has a custom hero layout).

Add a footer section at the end of the `Home` component's return, after the "View All Posts" `</div>`:

```tsx
{/* Footer */}
<footer className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600/50 shadow-lg">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="text-center flex flex-wrap justify-center items-center gap-4">
      <a
        href="/rss.xml"
        className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
        aria-label="RSS feed"
      >
        RSS
      </a>
      <span className="text-gray-400 dark:text-gray-500">|</span>
      <p className="text-gray-600 dark:text-gray-400">
        © 2026 Johannes Konings. All rights reserved.
      </p>
    </div>
  </div>
</footer>
```

This matches the existing footer in `BlogLayout.tsx`.

**Step 2: Verify**

Homepage should now have a footer matching other pages.

**Step 3: Commit**

```bash
git add websites/tanstack/src/routes/index.tsx
git commit -m "feat: add footer to homepage matching BlogLayout footer"
```

---

### Task 8: Fix Content Collections deprecation warnings

**Files:**
- Modify: `websites/tanstack/content-collections.ts`

**Step 1: Add explicit content property to both collections**

The deprecation warning says "implicit addition of a content property" — we need to add `content: z.string()` explicitly to both schemas.

In the `posts` collection schema:
```tsx
schema: z.object({
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  categories: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .default([]),
  thumbnail: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  series: z.string().optional(),
  content: z.string(),
}),
```

In the `notes` collection schema:
```tsx
schema: z.object({
  title: z.string(),
  summary: z.string().default(""),
  date: z.coerce.date(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  categories: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .default([]),
  content: z.string(),
}),
```

**Step 2: Verify**

Restart dev server. The "[CC DEPRECATED]" warnings should no longer appear in the console.

**Step 3: Commit**

```bash
git add websites/tanstack/content-collections.ts
git commit -m "fix: add explicit content property to suppress CC deprecation warnings"
```

---

## Phase B: UX Improvements

### Task 9: Add "Back to Blog" link on blog post pages

**Files:**
- Modify: `websites/tanstack/src/routes/blog/$postId.tsx`

**Step 1: Add navigation link above the article**

Add a "Back to Blog" link above the series banner, inside the `<article>` element:

```tsx
<article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Back link */}
  <nav className="mb-6">
    <Link
      to="/blog"
      className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to Blog
    </Link>
  </nav>

  {/* Series banner */}
  ...
```

**Step 2: Verify**

Open any blog post. There should be a "← Back to Blog" link above the content.

**Step 3: Commit**

```bash
git add websites/tanstack/src/routes/blog/$postId.tsx
git commit -m "feat: add Back to Blog navigation link on post pages"
```

---

### Task 10: Add table of contents for blog posts

**Files:**
- Create: `websites/tanstack/src/components/blog/TableOfContents.tsx`
- Modify: `websites/tanstack/src/routes/blog/$postId.tsx`

**Step 1: Create the TableOfContents component**

Create `websites/tanstack/src/components/blog/TableOfContents.tsx`:

```tsx
import { useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const regex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2]
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      items.push({ id, text, level });
    }
    return items;
  }, [content]);

  if (headings.length < 3) return null;

  return (
    <nav className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
        Table of Contents
      </h2>
      <ul className="space-y-1.5 text-sm">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 1}rem` }}>
            <a
              href={`#${h.id}`}
              className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

**Step 2: Add id attributes to rendered headings**

In `$postId.tsx`, add heading overrides to the Markdown `options.overrides` so headings get `id` attributes for anchor linking:

```tsx
h2: {
  component: ({ children, ...props }) => {
    const text = typeof children === "string" ? children : String(children);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return <h2 {...props} id={id}>{children}</h2>;
  },
},
h3: {
  component: ({ children, ...props }) => {
    const text = typeof children === "string" ? children : String(children);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return <h3 {...props} id={id}>{children}</h3>;
  },
},
```

**Step 3: Render TableOfContents above article content**

In `$postId.tsx`, import and render the component above the prose div:

```tsx
import { TableOfContents } from "../../components/blog/TableOfContents";

// ... inside RouteComponent, before the prose div:
<TableOfContents content={processedContent} />

{/* Article content */}
<div className="prose prose-lg dark:prose-invert max-w-none">
```

**Step 4: Verify**

Open a long blog post with multiple headings. A "Table of Contents" box should appear. Clicking a link should scroll to the heading.

**Step 5: Commit**

```bash
git add websites/tanstack/src/components/blog/TableOfContents.tsx websites/tanstack/src/routes/blog/$postId.tsx
git commit -m "feat: add auto-generated table of contents for blog posts"
```

---

### Task 11: Add related posts section

**Files:**
- Create: `websites/tanstack/src/components/blog/RelatedPosts.tsx`
- Modify: `websites/tanstack/src/routes/blog/$postId.tsx`

**Step 1: Create RelatedPosts component**

Create `websites/tanstack/src/components/blog/RelatedPosts.tsx`:

```tsx
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { allPosts } from "content-collections";

interface RelatedPostsProps {
  posts: (typeof allPosts)[number][];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={post.url}
            className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-colors"
          >
            <time className="text-xs text-gray-500 dark:text-gray-400">
              {format(post.date, "MMM d, yyyy")}
            </time>
            <h3 className="mt-1 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

**Step 2: Import and use in blog post page**

In `$postId.tsx`, use the existing `getRelatedPosts` utility:

```tsx
import { getSeriesContext, getRelatedPosts } from "../../lib/content-utils";
import { RelatedPosts } from "../../components/blog/RelatedPosts";

// Inside RouteComponent:
const relatedPosts = getRelatedPosts(post, 3);

// Render before Giscus, inside the <footer>:
<RelatedPosts posts={relatedPosts} />
<Giscus category="blog" />
```

**Step 3: Verify**

Open a blog post. A "Related Posts" section should appear above the Giscus comments, showing up to 3 related posts.

**Step 4: Commit**

```bash
git add websites/tanstack/src/components/blog/RelatedPosts.tsx websites/tanstack/src/routes/blog/$postId.tsx
git commit -m "feat: add related posts section to blog post pages"
```

---

### Task 12: Improve tag filter UX with counts and collapse

**Files:**
- Modify: `websites/tanstack/src/components/blog/BlogPostList.tsx`

**Step 1: Add post count to each tag**

Change the tag rendering to show counts:

```tsx
// Compute tag counts
const tagCounts = useMemo(() => {
  const counts = new Map<string, number>();
  posts.forEach((post) =>
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  );
  return counts;
}, [posts]);

const categoryCounts = useMemo(() => {
  const counts = new Map<string, number>();
  posts.forEach((post) =>
    post.categories.forEach((cat) => counts.set(cat, (counts.get(cat) ?? 0) + 1)),
  );
  return counts;
}, [posts]);
```

Then in the tag buttons, show the count:

```tsx
<button ...>
  {tag} ({tagCounts.get(tag)})
</button>
```

Same for categories:

```tsx
<button ...>
  {category} ({categoryCounts.get(category)})
</button>
```

**Step 2: Add collapsible tag list**

Add state to control whether the full tag list is shown:

```tsx
const [tagsExpanded, setTagsExpanded] = useState(false);
const VISIBLE_TAGS = 12;

// In the tags section:
const visibleTags = tagsExpanded ? allTags : allTags.slice(0, VISIBLE_TAGS);
```

Render the tags using `visibleTags` and add a toggle button:

```tsx
{visibleTags.map((tag) => (
  <button key={tag} ...>{tag} ({tagCounts.get(tag)})</button>
))}
{allTags.length > VISIBLE_TAGS && (
  <button
    onClick={() => setTagsExpanded((v) => !v)}
    className="px-3 py-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
  >
    {tagsExpanded ? "Show less" : `+${allTags.length - VISIBLE_TAGS} more`}
  </button>
)}
```

**Step 3: Verify**

Blog listing should show first 12 tags with a "+N more" toggle. Tags should show post counts.

**Step 4: Commit**

```bash
git add websites/tanstack/src/components/blog/BlogPostList.tsx
git commit -m "feat: add tag counts and collapsible tag list to blog filters"
```

---

### Task 13: Make notes tags linkable

**Files:**
- Modify: `websites/tanstack/src/routes/notes/index.tsx`

**Step 1: Change tag spans to links**

Replace the static `<span>` tags with links to `/blog/tag/$tag` (notes share the same tag taxonomy):

```tsx
// OLD:
<span
  key={tag}
  className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"
>
  {tag}
</span>

// NEW:
<Link
  key={tag}
  to="/blog/tag/$tag"
  params={{ tag }}
  className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
>
  {tag}
</Link>
```

**Step 2: Verify**

Notes page tags should be clickable, linking to the blog tag filter page.

**Step 3: Commit**

```bash
git add websites/tanstack/src/routes/notes/index.tsx
git commit -m "feat: make notes tags clickable links to blog tag pages"
```

---

### Task 14: Add reading progress bar for blog posts

**Files:**
- Create: `websites/tanstack/src/components/blog/ReadingProgressBar.tsx`
- Modify: `websites/tanstack/src/routes/blog/$postId.tsx`

**Step 1: Create ReadingProgressBar component**

Create `websites/tanstack/src/components/blog/ReadingProgressBar.tsx`:

```tsx
import { useState, useEffect } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-gray-200/50 dark:bg-gray-700/50">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

**Step 2: Render in blog post page**

In `$postId.tsx`, import and render at the top of the component return:

```tsx
import { ReadingProgressBar } from "../../components/blog/ReadingProgressBar";

// Inside RouteComponent return, before <BlogLayout>:
return (
  <>
    <ReadingProgressBar />
    <BlogLayout ...>
```

And close the fragment at the end.

**Step 3: Verify**

Open a blog post and scroll. A thin cyan progress bar should fill from left to right at the very top of the viewport.

**Step 4: Commit**

```bash
git add websites/tanstack/src/components/blog/ReadingProgressBar.tsx websites/tanstack/src/routes/blog/$postId.tsx
git commit -m "feat: add reading progress bar to blog posts"
```

---

## Phase C: Accessibility & SEO Polish

### Task 15: Improve accessible link text for "Read more"

**Files:**
- Modify: `websites/tanstack/src/components/blog/BlogPostCard.tsx`

**Step 1: Add screen-reader-only post title to "Read more" link**

```tsx
// OLD (line ~137-141):
<Link to={post.url} className="...">
  <span className="...">Read more</span>
  <svg ...>
</Link>

// NEW:
<Link to={post.url} className="..." aria-label={`Read more about ${post.title}`}>
  <span className="..." aria-hidden="true">Read more</span>
  <svg ... aria-hidden="true">
</Link>
```

**Step 2: Verify**

Inspect with browser dev tools. The link should have a descriptive `aria-label`.

**Step 3: Commit**

```bash
git add websites/tanstack/src/components/blog/BlogPostCard.tsx
git commit -m "fix: add accessible aria-label to Read More links"
```

---

### Task 16: Fix SEO baseUrl to use johanneskonings.dev

**Files:**
- Modify: `websites/tanstack/src/lib/seo.ts`

**Step 1: Update baseUrl**

```tsx
// OLD (line 26, 69, 107):
const baseUrl = "https://johanneskonings.github.io";

// NEW (all occurrences):
const baseUrl = "https://johanneskonings.dev";
```

There are 3 occurrences of `baseUrl` definition — update all of them.

**Step 2: Verify**

Check that structured data and meta tags render with `johanneskonings.dev` URLs.

**Step 3: Commit**

```bash
git add websites/tanstack/src/lib/seo.ts
git commit -m "fix: update SEO baseUrl to johanneskonings.dev"
```

---

### Task 17: Add TanStack Router DevTools in development

**Files:**
- Modify: `websites/tanstack/src/routes/__root.tsx`
- Run: `pnpm add -D @tanstack/react-router-devtools` in `websites/tanstack/`

**Step 1: Install devtools**

```bash
cd websites/tanstack && pnpm add -D @tanstack/react-router-devtools
```

**Step 2: Add lazy devtools import to __root.tsx**

```tsx
import { lazy } from "react";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : lazy(() =>
        import("@tanstack/react-router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );
```

**Step 3: Render in RootDocument**

Add after `<Scripts />`:

```tsx
<Scripts />
<TanStackRouterDevtools position="bottom-right" />
```

**Step 4: Verify**

In dev mode, a TanStack Router DevTools icon should appear in the bottom-right corner. In production builds, it should be tree-shaken out.

**Step 5: Commit**

```bash
git add websites/tanstack/src/routes/__root.tsx websites/tanstack/package.json websites/tanstack/pnpm-lock.yaml
git commit -m "feat: add TanStack Router DevTools in development mode"
```

---

### Task 18: Add share buttons on blog posts

**Files:**
- Create: `websites/tanstack/src/components/blog/ShareButtons.tsx`
- Modify: `websites/tanstack/src/routes/blog/$postId.tsx`

**Step 1: Create ShareButtons component**

Create `websites/tanstack/src/components/blog/ShareButtons.tsx`:

```tsx
import { useState, useCallback } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `https://johanneskonings.dev${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }, [fullUrl]);

  return (
    <div className="flex items-center gap-3 mt-4">
      <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
      <a
        href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Share on X"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Copy link to clipboard"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
    </div>
  );
}
```

**Step 2: Render in blog post footer**

In `$postId.tsx`, import and render after the published date:

```tsx
import { ShareButtons } from "../../components/blog/ShareButtons";

// In the footer, after the "Published on" paragraph:
<ShareButtons title={post.title} url={post.url} />
```

**Step 3: Verify**

Blog post footer should show share icons for X, LinkedIn, and a copy-link button.

**Step 4: Commit**

```bash
git add websites/tanstack/src/components/blog/ShareButtons.tsx websites/tanstack/src/routes/blog/$postId.tsx
git commit -m "feat: add share buttons (X, LinkedIn, copy link) to blog posts"
```

---

### Task 19: Add Back to Top button

**Files:**
- Create: `websites/tanstack/src/components/BackToTop.tsx`
- Modify: `websites/tanstack/src/routes/__root.tsx`

**Step 1: Create BackToTop component**

Create `websites/tanstack/src/components/BackToTop.tsx`:

```tsx
import { useState, useEffect } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-300"
      aria-label="Back to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}
```

**Step 2: Render in RootComponent**

In `__root.tsx`, import and render inside the layout div (after `{children}`):

```tsx
import { BackToTop } from "../components/BackToTop";

// In RootDocument, after {children} and before </div>:
{children}
<BackToTop />
<Scripts />
```

**Step 3: Verify**

Scroll down on any page. A floating "up arrow" button should appear in the bottom-right. Clicking it scrolls to top.

**Step 4: Commit**

```bash
git add websites/tanstack/src/components/BackToTop.tsx websites/tanstack/src/routes/__root.tsx
git commit -m "feat: add floating Back to Top button"
```

---

## Summary

| Phase | Tasks | Impact |
|-------|-------|--------|
| **A: Critical** | 1-8 | Fix broken light-mode UI, add mobile nav, 404 page, skip link, homepage footer, fix CC warnings |
| **B: UX** | 9-14 | Back-to-blog link, table of contents, related posts, tag count + collapse, clickable notes tags, reading progress bar |
| **C: A11y & SEO** | 15-19 | Accessible link text, fix SEO baseUrl, Router DevTools, share buttons, Back to Top |

Each task is independently committable. Phase A should be done first as it fixes broken functionality. Phases B and C can be done in any order.
