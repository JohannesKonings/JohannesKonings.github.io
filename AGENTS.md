# AGENTS.md

## Cursor Cloud specific instructions

This is a pnpm monorepo containing two blog websites under `websites/`. All scripts are defined in the root `package.json`.

### Services

| Service | Dev command | Port | Notes |
|---|---|---|---|
| Astro blog | `pnpm dev:astro` | 4321 | Primary blog site |
| TanStack blog | `pnpm dev:tanstack` | 3000 | Secondary blog; serves at `/` in dev, `/tanstack/` in production |

### Key commands

See root `package.json` `scripts` for the full list. Highlights:

- **Lint**: `pnpm run lint:check` (oxlint), `pnpm run format:check` (Prettier)
- **Build**: `pnpm run build:astro`, `pnpm run build:tanstack`
- **Type check**: `pnpm run tsc:check` (tsgo preview — has known pre-existing errors, not run in CI)

### Gotchas

- **pnpm 10 build scripts**: The repo originally targeted pnpm 9 (see CI). Under pnpm 10 the `pnpm.onlyBuiltDependencies` field in root `package.json` is required to allow native package builds (`esbuild`, `sharp`, `@tailwindcss/oxide`, `@parcel/watcher`). If this field is missing, `pnpm install` will skip build scripts and Tailwind/Sharp/esbuild will not work.
- **Content sync**: Both websites auto-run a sync script (`pnpm sync`) as part of their `dev`/`build` scripts. This copies markdown from root `_posts/`/`_notes/`/`_info/` into each website's `src/content/`. No manual sync step is needed.
- **Playwright**: The Astro build invokes Playwright for Mermaid diagram rendering (`rehype-mermaid`). Run `pnpm exec playwright install chromium --with-deps` after a fresh `pnpm install` if Chromium is not cached.
