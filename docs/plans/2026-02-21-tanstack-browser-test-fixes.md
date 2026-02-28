# TanStack Website Browser Test Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the five runtime bugs discovered during browser testing: broken search, invisible BackToTop/ReadingProgressBar, theme toggle timing issue, and inconsistent internal navigation links.

**Architecture:** All fixes are in `websites/tanstack/src/`. The site uses TanStack Start (SSR), so components that access `window`/`document` must guard against server-side execution. No test framework exists — verification is visual via `pnpm dev:tanstack` (localhost:3000).

**Tech Stack:** TanStack Start 1.124, React 19, Orama search, Tailwind CSS 4

---

## Task 1: Fix Orama search not returning results

**Files:**

- Modify: `websites/tanstack/src/components/search/Search.tsx`

**Step 1: Add `properties` to the Orama search call**

The `search()` call is missing the `properties` option, so Orama doesn't know which fields to search. In `Search.tsx`, update the `runSearch` callback:

```tsx
// OLD (line ~63):
const { hits } = await search(db, {
  term: q,
  limit: 50,
});

// NEW:
const { hits } = await search(db, {
  term: q,
  properties: ["title", "summary", "excerpt", "tags"],
  limit: 50,
});
```

**Step 2: Verify**

Run: `pnpm dev:tanstack` → open http://localhost:3000/search

- Type "tanstack" in the search box
- Results should appear showing matching blog posts and notes
- Type "aws" — should show many results
- Type "x" (single char) — should show nothing (min 2 chars)

**Step 3: Commit**

```bash
git add websites/tanstack/src/components/search/Search.tsx
git commit -m "fix: add properties to Orama search so results actually appear"
```

---

## Task 2: Fix BackToTop not appearing (SSR guard)

**Files:**

- Modify: `websites/tanstack/src/components/BackToTop.tsx`

**Step 1: Add SSR guard to the scroll listener**

The component accesses `window.scrollY` and `window.addEventListener` without checking if `window` exists. During SSR these are undefined, which can prevent proper hydration.

Replace the full component:

```tsx
import { useState, useEffect } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
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
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  );
}
```

Key changes:

- Added `if (typeof window === "undefined") return;` guard inside `useEffect`
- Added `onScroll()` call immediately after attaching the listener so the button shows if the page is already scrolled (e.g. after navigation)

**Step 2: Verify**

Open http://localhost:3000/blog → scroll down past 400px → a floating up-arrow button should appear in the bottom-right. Click it → page scrolls to top.

**Step 3: Commit**

```bash
git add websites/tanstack/src/components/BackToTop.tsx
git commit -m "fix: add SSR guard to BackToTop scroll listener"
```

---

## Task 3: Fix ReadingProgressBar not appearing (SSR guard)

**Files:**

- Modify: `websites/tanstack/src/components/blog/ReadingProgressBar.tsx`

**Step 1: Add SSR guard to the scroll listener**

Same issue as BackToTop — accessing `window`/`document` without SSR guard.

Replace the full component:

```tsx
import { useState, useEffect } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0,
      );
    };

    update();
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

Key changes:

- Added `if (typeof window === "undefined") return;` guard inside `useEffect`
- Added `update()` call immediately so the bar shows if the page is already partially scrolled

**Step 2: Verify**

Open any blog post (e.g. http://localhost:3000/blog/2026-02-02-tanstack-ai-bedrock-simple) → scroll down → a thin cyan progress bar should fill from left to right at the very top of the viewport.

**Step 3: Commit**

```bash
git add websites/tanstack/src/components/blog/ReadingProgressBar.tsx
git commit -m "fix: add SSR guard to ReadingProgressBar scroll listener"
```

---

## Task 4: Fix ThemeProvider redundant useEffect

**Files:**

- Modify: `websites/tanstack/src/contexts/ThemeContext.tsx`

**Step 1: Remove the redundant useEffect that re-reads localStorage on mount**

`getInitialTheme()` already reads the DOM class, then localStorage, then system preference. The `useEffect` on lines 32-39 re-reads localStorage after mount, potentially overwriting the correct initial state and causing timing issues with the theme toggle.

```tsx
// REMOVE this entire useEffect block (lines 32-39):
useEffect(() => {
  const stored = localStorage.getItem("theme");
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = stored === "dark" || (!stored && prefersDark);
  setThemeState(dark ? "dark" : "light");
}, []);
```

The resulting `ThemeProvider` should be:

```tsx
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem("theme", next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Step 2: Remove unused imports**

After removing the useEffect, remove `useEffect` from the import line if it's no longer used in the file.

**Step 3: Verify**

- Open http://localhost:3000/ → Click the moon/sun icon in the top-right of the nav bar
- Theme should toggle between light and dark immediately
- Refresh the page → theme preference should persist
- Open a new tab to http://localhost:3000/ → theme should match

**Step 4: Commit**

```bash
git add websites/tanstack/src/contexts/ThemeContext.tsx
git commit -m "fix: remove redundant useEffect in ThemeProvider that could race with toggle"
```

---

## Task 5: Use TanStack Router `Link` for internal tag/category navigation

**Files:**

- Modify: `websites/tanstack/src/components/blog/BlogPostCard.tsx`
- Modify: `websites/tanstack/src/routes/blog/$postId.tsx`

Using plain `<a>` tags for internal routes causes full page reloads instead of client-side navigation. Replace them with TanStack Router `<Link>` components.

**Step 1: Fix BlogPostCard tag links**

In `BlogPostCard.tsx`, the tag links (line ~119-126) use `<a href=...>`. Replace with `<Link>`:

```tsx
// OLD:
<a
  key={tag}
  href={`/blog/tag/${encodeURIComponent(tag)}`}
  className="px-3 py-1.5 text-xs bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-all duration-300"
>
  {tag}
</a>

// NEW:
<Link
  key={tag}
  to="/blog/tag/$tag"
  params={{ tag }}
  className="px-3 py-1.5 text-xs bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-all duration-300"
>
  {tag}
</Link>
```

`Link` is already imported in `BlogPostCard.tsx` (line 3).

**Step 2: Fix $postId.tsx tag links**

In `$postId.tsx`, the header tag links (line ~109-115) use `<a href=...>`. Replace with `<Link>`:

```tsx
// OLD:
<a
  key={tag}
  href={`/blog/tag/${encodeURIComponent(tag)}`}
  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
>
  {tag}
</a>

// NEW:
<Link
  key={tag}
  to="/blog/tag/$tag"
  params={{ tag }}
  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
>
  {tag}
</Link>
```

`Link` is already imported in `$postId.tsx` (line 2).

**Step 3: Fix $postId.tsx category links**

In `$postId.tsx`, the footer category links (line ~230-236) use `<a href=...>`. Replace with `<Link>`:

```tsx
// OLD:
<a
  href={`/blog/category/${encodeURIComponent(category)}`}
  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
>
  {category}
</a>

// NEW:
<Link
  to="/blog/category/$category"
  params={{ category }}
  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
>
  {category}
</Link>
```

**Step 4: Verify**

- Open http://localhost:3000/blog → click a tag on a blog card → should navigate to `/blog/tag/[tag]` WITHOUT a full page reload (no white flash, instant transition)
- Open a blog post → click a tag in the header → same smooth navigation
- Open a blog post → click a category in the footer → smooth navigation to category page

**Step 5: Commit**

```bash
git add websites/tanstack/src/components/blog/BlogPostCard.tsx websites/tanstack/src/routes/blog/$postId.tsx
git commit -m "fix: use Router Link for tag/category links instead of plain anchors"
```

---

## Summary

| Task                          | Impact                                            | Risk                         |
| ----------------------------- | ------------------------------------------------- | ---------------------------- |
| 1: Fix Orama search           | Search page becomes functional                    | Low — adding one option      |
| 2: Fix BackToTop SSR          | Button appears when scrolling                     | Low — adding guard           |
| 3: Fix ReadingProgressBar SSR | Progress bar visible on blog posts                | Low — adding guard           |
| 4: Fix ThemeProvider timing   | Theme toggle works reliably                       | Low — removing code          |
| 5: Use Router Link            | Smooth client-side navigation for tags/categories | Low — same visual, better UX |

All tasks are independent and can be done in any order. Each is a small, focused change.
