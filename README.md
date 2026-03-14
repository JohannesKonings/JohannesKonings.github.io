# Personal website and blog

This repository contains the TanStack-based website and the supporting content/distribution scripts used for the blog.

## website

- local development: `pnpm dev:tanstack`
- production build: `pnpm build:tanstack`
- content verification: `pnpm verify:tanstack`

## deployments

- production deploys from `main` to GitHub Pages at `https://johanneskonings.dev`
- branch previews deploy from non-`main` branches through `.github/workflows/branch-previews.yml`
- preview builds use the sanitized branch name as the preview subdomain

### branch preview configuration

Configure the following repository settings for branch previews:

- variable: `CLOUDFLARE_PAGES_PROJECT_NAME`
- optional variable: `CLOUDFLARE_PAGES_PREVIEW_BASE_DOMAIN`
  - defaults to `<project>.pages.dev`
  - set this only if preview metadata should use a different preview base domain
- secret: `CLOUDFLARE_API_TOKEN`
- secret: `CLOUDFLARE_ACCOUNT_ID`

## demos

Every demo or walkthrough must work against both localhost and a deployed URL.

- localhost example:
  - `BASE_URL=http://localhost:3000 node websites/tanstack/scripts/theme-toggle-demo.mjs`
- deployed example:
  - `BASE_URL=https://<branch-preview-host> node websites/tanstack/scripts/theme-toggle-demo.mjs`

## blog post distribution

- build process for dev.to, hashnode and medium incl. image optimization

`nlx tsx ./scripts/syncCrossPosts.ts`

## rss feed

...

## search

...
