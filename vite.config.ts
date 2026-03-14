import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
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
    options: {
      typeAware: true,
    },
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
