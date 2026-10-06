import { defineWorkspaceConfig } from "@jaykingson/vite-plus-base";

export default defineWorkspaceConfig({
  bingo: {
    blockPackageJson: { name: "johanneskonings.github.io" },
    blockAgentSkills: {
      glossaryMap: {
        root: {
          glossary: "GLOSSARY.md",
          adr: "docs/adr",
          summary: "Content authoring, sync, and cross-post distribution",
        },
        "websites/tanstack": {
          glossary: "websites/tanstack/GLOSSARY.md",
          summary: "TanStack Start blog website",
        },
      },
    },
  },
  lint: {
    options: {
      typeAware: true,
      // typeCheck: true,
      typeCheck: false,
    },
    env: {
      browser: true,
      node: true,
      es2022: true,
    },
    ignorePatterns: [
      "**/next-blog/.next/**",
      "**/next-blog/out/**",
      "**/.astro",
      "**/dist/**",
      "**/.vinxi",
      "**/.output",
      "**/.tanstack",
      "**/.content-collections",
      "**/.nitro",
      "websites/tanstack/src/routeTree.gen.ts",
      "websites/tanstack/test-results/**",
    ],
  },
  fmt: {
    ignorePatterns: [
      "**/next-blog/.next/**",
      "**/next-blog/out/**",
      "**/.astro",
      "**/dist/**",
      "**/.vinxi",
      "**/.output",
      "**/.tanstack",
      "**/.content-collections",
      "**/.nitro",
      "websites/tanstack/src/routeTree.gen.ts",
      "websites/tanstack/test-results/**",
      "node_modules/",
      "*.min.js",
      "*.min.css",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
    ],
  },
});
