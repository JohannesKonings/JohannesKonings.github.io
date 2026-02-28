# UX Animations & Dark Mode Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the broken dark mode toggle and add subtle CSS-only scroll-reveal animations, improved hover effects, and better page transitions — no new dependencies.

**Architecture:** All changes live in `websites/tanstack/src/`. A tiny `useInView` hook (Intersection Observer) drives scroll-reveal by toggling a `.visible` CSS class. All animations are defined in `global.css` as `@keyframes` + utility classes. Components apply them via className strings.

**Tech Stack:** TanStack Start 1.124, React 19, Tailwind CSS 4 (class-based dark mode via `@custom-variant`), Vite 8 beta

---

## Task 1: Fix dark mode toggle

The dark mode toggle clicks but nothing changes visually. Root cause: `ThemeSync` in `__root.tsx` toggles the `dark` class on `document.documentElement`, but the Tailwind v4 `@custom-variant dark` only generates utility classes when the generated CSS actually includes `dark:` variants — which it does. The real issue is that `ThemeSync` sets the class via `useEffect`, but on the initial client render the theme state may default to `"light"` (because `getInitialTheme` runs during SSR where `document` is undefined), so the `useEffect` immediately removes the `dark` class that `theme-init.js` set. Additionally, the `setTheme` callback does not synchronously update the DOM, causing a flash.

**Files:**

- Modify: `websites/tanstack/src/contexts/ThemeContext.tsx`

**Step 1: Make `setTheme` synchronously toggle the DOM class**

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribeToTheme(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

Key changes:

- Replace `useState` + `useEffect` with `useSyncExternalStore` — theme derives from the DOM class (set by `theme-init.js` before React hydrates)
- `setTheme` synchronously toggles the class and writes to localStorage
- No `useEffect`, no race condition, no hydration mismatch

**Step 2: Remove `ThemeSync` from `__root.tsx`**

In `websites/tanstack/src/routes/__root.tsx`, delete the `ThemeSync` component entirely (lines 80-86) and remove `<ThemeSync />` from `RootDocument` (line 103). Also remove `useEffect` from the import on line 1 if no longer used.

**Step 3: Verify**

Run: `pnpm dev:tanstack` → open http://localhost:3000/

- Click the moon icon → background should change to dark, nav should darken, text should lighten
- Click the sun icon → should revert to light
- Refresh → theme should persist
- Navigate to /blog → theme should persist across routes

**Step 4: Commit**

```bash
git add websites/tanstack/src/contexts/ThemeContext.tsx websites/tanstack/src/routes/__root.tsx
git commit -m "fix: rewrite theme toggle with useSyncExternalStore to fix dark mode"
```

---

## Task 2: Create `useInView` hook

A small Intersection Observer hook that returns a ref and a boolean `isInView`.

**Files:**

- Create: `websites/tanstack/src/hooks/useInView.ts`

**Step 1: Write the hook**

```ts
import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = "0px 0px -40px 0px",
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView } as const;
}
```

**Step 2: Verify**

No standalone test — this will be verified through the components that use it in subsequent tasks.

**Step 3: Commit**

```bash
git add websites/tanstack/src/hooks/useInView.ts
git commit -m "feat: add useInView hook for scroll-reveal animations"
```

---

## Task 3: Add scroll-reveal CSS animations

Add `@keyframes` and utility classes for fade-up, fade-in, and slide-in effects.

**Files:**

- Modify: `websites/tanstack/src/styles/global.css`

**Step 1: Add the reveal keyframes and classes**

Append after the existing `animation-delay-3000` block (line 157) and before the route transition block (line 159):

```css
/* Scroll-reveal animations — elements start hidden, become visible via JS */
@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes revealFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes revealScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.reveal {
  opacity: 0;
}

.reveal.visible {
  animation: revealUp 0.6s ease-out forwards;
}

.reveal-fade.reveal {
  opacity: 0;
}

.reveal-fade.visible {
  animation: revealFade 0.5s ease-out forwards;
}

.reveal-scale.reveal {
  opacity: 0;
}

.reveal-scale.visible {
  animation: revealScale 0.5s ease-out forwards;
}

/* Stagger delays for grid children */
.stagger-1 {
  animation-delay: 0.1s;
}
.stagger-2 {
  animation-delay: 0.2s;
}
.stagger-3 {
  animation-delay: 0.3s;
}
.stagger-4 {
  animation-delay: 0.4s;
}
.stagger-5 {
  animation-delay: 0.5s;
}
.stagger-6 {
  animation-delay: 0.6s;
}
```

**Step 2: Boost background orb visibility**

In `global.css`, the existing `gentlePulse` keyframes (lines 94-104) use very low opacity (0.2-0.4). Update to be slightly more visible:

```css
@keyframes gentlePulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.02);
  }
}
```

And `subtleGlow` (lines 84-92):

```css
@keyframes subtleGlow {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.25;
  }
}
```

**Step 3: Improve the route transition**

Update the existing `routeFade` keyframes (lines 160-169) to be a bit more pronounced:

```css
@keyframes routeFade {
  from {
    opacity: 0.6;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-route-fade {
  animation: routeFade 0.35s ease-out;
}
```

**Step 4: Verify**

Open http://localhost:3000/ — background orbs should be subtly more visible. Page navigation should have a slightly more noticeable entrance.

**Step 5: Commit**

```bash
git add websites/tanstack/src/styles/global.css
git commit -m "feat: add scroll-reveal CSS animations and boost background visibility"
```

---

## Task 4: Apply scroll-reveal to homepage

Add fade-up animations to the avatar, social links, heading, and blog post cards on the homepage.

**Files:**

- Modify: `websites/tanstack/src/routes/index.tsx`

**Step 1: Import the hook**

Add at the top of `index.tsx`:

```tsx
import { useInView } from "../hooks/useInView";
```

**Step 2: Add reveal wrappers inside the `Home` component**

Replace the `Home` function body. The key changes are:

- Wrap the avatar section, social links, heading, and each blog card row in `useInView` refs
- Add `reveal` / `visible` classes based on `inView` state

```tsx
function Home() {
  const recentPosts = getRecentPosts(3);
  const hero = useInView();
  const cards = useInView();
  const cta = useInView();

  return (
    <>
      {/* Animated background - light/dark aware */}
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 relative">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-xl animate-gentle-pulse animation-delay-1000" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-xl animate-gentle-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-300/10 dark:bg-gray-400/8 rounded-full blur-lg animate-subtle-glow animation-delay-3000" />
        </div>

        {/* Avatar Section */}
        <div
          ref={hero.ref}
          className={`relative z-10 pt-16 pb-12 reveal ${hero.inView ? "visible" : ""}`}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              {/* Avatar with subtle glow effect */}
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-subtle-glow"></div>
                <img
                  src={avatar}
                  alt="Avatar"
                  className="relative z-10 rounded-full border-2 border-gray-600/50 shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all duration-300 hover:-translate-y-0.5"
                    aria-label={label}
                  >
                    {Icon ? (
                      <Icon className="w-6 h-6 text-current" />
                    ) : (
                      <span className="text-sm font-medium">{label}</span>
                    )}
                  </a>
                ))}
              </div>

              <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                Johannes Konings
              </h1>
              <p className="mb-6 text-sm text-gray-700 dark:text-gray-200 max-w-md text-center">
                Notes and posts on AWS and TanStack.
              </p>
            </div>
          </div>
        </div>

        {/* Latest Blog Posts Section */}
        <div className="relative z-10 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-3">
                Recent posts
              </h2>
            </div>

            <div
              ref={cards.ref}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {recentPosts.map((post, i) => (
                <div
                  key={post.slug}
                  className={`reveal ${cards.inView ? "visible" : ""} stagger-${i + 1}`}
                >
                  <BlogPostCard post={post} />
                </div>
              ))}
            </div>

            {/* View All Posts Link */}
            <div
              ref={cta.ref}
              className={`text-center mt-12 reveal-scale reveal ${cta.inView ? "visible" : ""}`}
            >
              <Link
                to="/blog"
                className="group inline-flex items-center px-8 py-4 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-400/60 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                <span className="text-cyan-700 dark:text-transparent dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-400 dark:bg-clip-text">
                  View All Posts
                </span>
                <svg
                  className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}
```

Key changes:

- Three `useInView` instances: hero, cards grid, CTA button
- Cards get stagger classes (`stagger-1`, `stagger-2`, `stagger-3`) for sequential reveal
- Social links get `hover:-translate-y-0.5` for a subtle lift on hover
- "View All Posts" button gets `group` class so the arrow slides on hover

**Step 3: Verify**

Open http://localhost:3000/ — scroll down slowly:

- Hero section (avatar, name, social links) should fade-up as the page loads
- Blog cards should stagger in one after another
- "View All Posts" button should scale-reveal when it enters the viewport
- Hovering social icons should lift them slightly

**Step 4: Commit**

```bash
git add websites/tanstack/src/routes/index.tsx
git commit -m "feat: add scroll-reveal animations to homepage"
```

---

## Task 5: Apply scroll-reveal to blog post list

Add staggered reveal to blog post cards in the grid on `/blog`.

**Files:**

- Modify: `websites/tanstack/src/components/blog/BlogPostList.tsx`

**Step 1: Import the hook**

Add at the top:

```tsx
import { useInView } from "../../hooks/useInView";
```

**Step 2: Wrap the cards grid**

Replace the posts grid section (lines 227-233). Wrap each card in a reveal div:

```tsx
{
  filteredPosts.length === 0 ? (
    <div className="text-center py-12">
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-600/30">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No posts found in the digital archive.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Try adjusting your search criteria.
        </p>
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredPosts.map((post, i) => (
        <RevealCard key={post.slug} post={post} index={i} />
      ))}
    </div>
  );
}
```

**Step 3: Add `RevealCard` helper component**

Add above the `BlogPostList` function:

```tsx
function RevealCard({
  post,
  index,
}: {
  post: (typeof allPosts)[0];
  index: number;
}) {
  const { ref, inView } = useInView({ rootMargin: "0px 0px -20px 0px" });
  const stagger = (index % 3) + 1;
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "visible" : ""} stagger-${stagger}`}
    >
      <BlogPostCard post={post} />
    </div>
  );
}
```

Each card in a row of 3 gets `stagger-1`, `stagger-2`, `stagger-3` based on its column position.

**Step 4: Update imports**

Add the `allPosts` type import if not already present (it is — line 1).

**Step 5: Verify**

Open http://localhost:3000/blog — scroll down the page:

- Blog cards should fade-up as they enter the viewport
- Each row of 3 cards should stagger (first card appears, then second, then third)
- Filtering/searching should still work normally

**Step 6: Commit**

```bash
git add websites/tanstack/src/components/blog/BlogPostList.tsx
git commit -m "feat: add staggered scroll-reveal to blog post cards"
```

---

## Task 6: Enhance card hover effects

Improve the `BlogPostCard` hover with a more pronounced shadow lift and border glow.

**Files:**

- Modify: `websites/tanstack/src/components/blog/BlogPostCard.tsx`

**Step 1: Update the article className**

Replace the article's className (line 40):

Old:

```tsx
className =
  "bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-600/30 hover:border-cyan-500/50 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-cyan-500/20 group";
```

New:

```tsx
className =
  "bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600/30 hover:border-cyan-400/60 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/15 group";
```

Key changes:

- Added `hover:-translate-y-1` for a lift effect
- Changed from `shadow-xl` to `shadow-lg` (base) with `hover:shadow-xl` (elevated)
- Slightly adjusted the cyan glow color

**Step 2: Enhance the "Read more" arrow**

The SVG arrow (line 146-157) already has `group-hover:translate-x-1`. No change needed.

**Step 3: Verify**

Open http://localhost:3000/ — hover a blog post card:

- Card should lift up slightly (~4px)
- Shadow should grow and get a subtle cyan tint
- Border should glow cyan
- "Read more" arrow should shift right

**Step 4: Commit**

```bash
git add websites/tanstack/src/components/blog/BlogPostCard.tsx
git commit -m "feat: enhance card hover with lift and glow effects"
```

---

## Task 7: Enhance BackToTop button animation

Add a smooth enter/exit transition to the BackToTop button instead of instant show/hide.

**Files:**

- Modify: `websites/tanstack/src/components/BackToTop.tsx`

**Step 1: Replace the component**

The current component returns `null` when not visible, which means no exit animation is possible. Instead, always render but control visibility with CSS:

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

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-cyan-500/20 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Back to top"
      aria-hidden={!visible}
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

- Always renders the button (no conditional `return null`)
- Uses `opacity-0 translate-y-4 pointer-events-none` when hidden
- Uses `opacity-100 translate-y-0` when visible
- Transition handled by the existing `transition-all duration-300`
- Added `hover:shadow-cyan-500/20` for a glow on hover

**Step 2: Verify**

Open http://localhost:3000/blog — scroll down past 400px:

- Button should slide up and fade in smoothly
- Scroll back to top — button should slide down and fade out
- Hover should show a subtle cyan shadow glow

**Step 3: Commit**

```bash
git add websites/tanstack/src/components/BackToTop.tsx
git commit -m "feat: add smooth enter/exit transition to BackToTop button"
```

---

## Task 8: Add reveal to Related Posts on blog post pages

Add a subtle scroll-reveal to the related posts section at the bottom of blog posts.

**Files:**

- Modify: `websites/tanstack/src/components/blog/RelatedPosts.tsx`

**Step 1: Import the hook and add reveal**

```tsx
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { allPosts } from "content-collections";
import { useInView } from "../../hooks/useInView";

interface RelatedPostsProps {
  posts: (typeof allPosts)[number][];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const { ref, inView } = useInView();

  if (posts.length === 0) return null;

  return (
    <section
      ref={ref}
      className={`mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 reveal-fade reveal ${inView ? "visible" : ""}`}
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            to={post.url}
            className={`block p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 hover:-translate-y-0.5 transition-all duration-300 stagger-${i + 1}`}
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

Key changes:

- Whole section fades in when scrolled to
- Individual cards get stagger delays
- Cards lift slightly on hover (`hover:-translate-y-0.5`)

**Step 2: Verify**

Open a blog post and scroll to the bottom — the "Related Posts" section should fade in as it enters the viewport.

**Step 3: Commit**

```bash
git add websites/tanstack/src/components/blog/RelatedPosts.tsx
git commit -m "feat: add scroll-reveal to related posts section"
```

---

## Summary

| Task                       | Type        | Files                          | Risk                                       |
| -------------------------- | ----------- | ------------------------------ | ------------------------------------------ |
| 1: Fix dark mode           | Bug fix     | ThemeContext.tsx, \_\_root.tsx | Medium — changes state management approach |
| 2: Create useInView hook   | New utility | hooks/useInView.ts             | Low — pure addition                        |
| 3: Add CSS animations      | Enhancement | global.css                     | Low — additive CSS                         |
| 4: Homepage scroll-reveal  | Enhancement | routes/index.tsx               | Low — className changes                    |
| 5: Blog list scroll-reveal | Enhancement | BlogPostList.tsx               | Low — wrapper div                          |
| 6: Card hover effects      | Enhancement | BlogPostCard.tsx               | Low — className changes                    |
| 7: BackToTop animation     | Enhancement | BackToTop.tsx                  | Low — CSS transition                       |
| 8: Related Posts reveal    | Enhancement | RelatedPosts.tsx               | Low — className changes                    |

**Dependencies:** Tasks 2 and 3 must be done before Tasks 4, 5, and 8 (they use the hook and CSS classes). Task 1 is independent. Tasks 6 and 7 are independent.

**Recommended order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
