# AGENTS.md

## Cursor Cloud specific instructions

This is a pnpm monorepo containing the TanStack blog website under `websites/`. All scripts are defined in the root `package.json`.

### Services

| Service       | Dev command         | Port | Notes                                       |
| ------------- | ------------------- | ---- | ------------------------------------------- |
| TanStack blog | `pnpm dev:tanstack` | 3000 | Primary blog; serves at `/` in development  |

### Key commands

See root `package.json` `scripts` for the full list. Highlights:

- **Lint**: `pnpm run lint:check` (oxlint), `pnpm run format:check` (Prettier)
- **Build**: `pnpm run build:tanstack`
- **Type check**: `pnpm run tsc:check` (tsgo preview — has known pre-existing errors, not run in CI)

### Gotchas

- **pnpm 10 build scripts**: The repo originally targeted pnpm 9 (see CI). Under pnpm 10 the `pnpm.onlyBuiltDependencies` field in root `package.json` is required to allow native package builds (`esbuild`, `sharp`, `@tailwindcss/oxide`, `@parcel/watcher`). If this field is missing, `pnpm install` will skip build scripts and Tailwind/Sharp/esbuild will not work.
- **Content sync**: The TanStack website auto-runs a sync script (`pnpm sync`) as part of its `dev`/`build` scripts. This copies markdown from root `_posts/` and `_notes/` into `websites/tanstack/src/content/`. No manual sync step is needed.
