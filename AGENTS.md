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

### Gotchas

- **pnpm 10 build scripts**: The repo now runs installs through `vp install`, but the root `pnpm.onlyBuiltDependencies` field is still required so pnpm can build native dependencies like `esbuild`, `sharp`, `@tailwindcss/oxide`, and `@parcel/watcher`.
- **Content sync**: The TanStack website scripts auto-run content sync as part of `dev` and `build`. This copies markdown from root `_posts/` and `_notes/` into `websites/tanstack/src/content/`, so no manual sync step is needed.
- **Git hooks**: Hook setup is Vite+-owned via `vp config`, and the repo pre-commit flow runs `vp staged`.

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for this repository. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default canonical label names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Domain docs are configured as single-context (root `CONTEXT.md` + `docs/adr/` when present). See `docs/agents/domain.md`.
