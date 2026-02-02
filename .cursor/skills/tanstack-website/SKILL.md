---
name: tanstack-website
description: Uses the TanStack MCP to search docs, fetch pages, list libraries, and create TanStack apps. Covers the TanStack website as a blog: static content configuration, TanStack DevTools integration, and optimization for SEO and agent access. Use when working on the TanStack website, blog, static content, DevTools, SEO, agent access, TanStack docs, or TanStack tooling.
---

# TanStack Website

## Use the TanStack MCP

When the task involves TanStack docs, APIs, or app creation, use the **TanStack MCP** (`user-tanstack`) via `call_mcp_tool`. Do not guess or use generic web search for TanStack-specific information.

Before calling any tool, read its descriptor from `mcps/user-tanstack/tools/<toolName>.json` for parameters, then call with server `user-tanstack`.

## Tool reference

| Tool                          | Purpose              | Key parameters                                                                                |
| ----------------------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| **tanstack_search_docs**      | Find docs by query   | `query` (required); optional: `library`, `framework`, `limit`                                 |
| **tanstack_doc**              | Fetch a doc page     | `library`, `path` (required); optional: `version`                                             |
| **tanstack_list_libraries**   | List libraries       | optional: `group` (state, headlessUI, performance, tooling)                                   |
| **tanstack_ecosystem**        | Ecosystem partners   | optional: `category`, `library`                                                               |
| **listTanStackAddOns**        | Add-ons for new apps | `framework` (required; React or Solid)                                                        |
| **createTanStackApplication** | Create TanStack app  | `framework`, `projectName`, `cwd`, `addOns`, `targetDir` (required); optional: `addOnOptions` |

**When to use which**: Need a doc snippet → `tanstack_search_docs`. Need full page → `tanstack_doc`. Scaffolding app → `listTanStackAddOns` then `createTanStackApplication`.

## Blog and static content

The TanStack website is a **blog**. Ensure static content is properly configured:

- Build output and routes for blog posts
- Content sources (e.g. markdown, CMS)
- SSG/static export so posts are pre-rendered

## SEO and agent access

Optimize for:

- **SEO**: Meta tags, structured data (JSON-LD), sitemaps, canonical URLs, semantic HTML
- **Agent access**: Clear structure, machine-readable metadata, optional robots/LLM-friendly hints (e.g. clear headings, descriptive links)

## TanStack DevTools

For a static blog, integrate only the TanStack DevTools that apply: typically **Router DevTools** (for route/build debugging in development). Omit React Query DevTools and Table DevTools unless the blog adds client-side data or tables. Enable in development; gate or strip in production builds.
