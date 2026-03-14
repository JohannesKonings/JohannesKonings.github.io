# AGENTS.md

## Cursor Cloud specific instructions

This is a pnpm-backed monorepo managed through Vite+. The TanStack blog website lives under `websites/`, and the supported entrypoints are the root `vp` commands and `vp run` scripts.

### Services

| Service       | Dev command           | Port | Notes                                      |
| ------------- | --------------------- | ---- | ------------------------------------------ |
| TanStack blog | `vp run dev:tanstack` | 3000 | Primary blog; serves at `/` in development |

### Key commands

See root `package.json` `scripts` for the full list. Highlights:

- **Install**: `vp install` or `vp install --frozen-lockfile`
- **Checks**: `vp check`
- **Build**: `vp run build:tanstack`
- **Tests**: `vp run --filter tanstack test:ui`, `vp run --filter tanstack test:smoke`
- **Verification**: `vp run verify:tanstack:seo-geo`, `vp run verify:tanstack:lighthouse`
- **Optional type check**: `vp exec tsgo --noEmit`

### Deployments

- **Production**: `main` continues to deploy to GitHub Pages at `https://johanneskonings.dev`.
- **Branch previews**: non-`main` branches deploy through `.github/workflows/branch-previews.yml` to Cloudflare Pages previews.
- **Preview URL shape**: branch previews use a sanitized branch label as the preview subdomain, for example `feature-x.<preview-base-domain>`.
- **Required preview configuration**:
  - repository variable `CLOUDFLARE_PAGES_PROJECT_NAME`
  - optional repository variable `CLOUDFLARE_PAGES_PREVIEW_BASE_DOMAIN` (defaults to `<project>.pages.dev`)
  - repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

### Demo rule

- Every demo script or walkthrough must support **both**:
  - localhost usage
  - deployed-site usage
- Demo scripts should accept an overridable `BASE_URL`.
- Demo documentation should show both invocation styles.

### Gotchas

- **pnpm 10 build scripts**: The repo now runs installs through `vp install`, but the root `pnpm.onlyBuiltDependencies` field is still required so pnpm can build native dependencies like `esbuild`, `sharp`, `@tailwindcss/oxide`, and `@parcel/watcher`.
- **Content sync**: The TanStack website scripts auto-run content sync as part of `dev` and `build`. This copies markdown from root `_posts/` and `_notes/` into `websites/tanstack/src/content/`, so no manual sync step is needed.
- **Git hooks**: Hook setup is Vite+-owned via `vp config`, and the repo pre-commit flow runs `vp staged`.
- **Preview SEO**: preview and localhost builds intentionally emit non-indexable metadata and disable production analytics/ads. Only production builds should be indexable.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->
