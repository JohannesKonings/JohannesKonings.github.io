import { defineConfig } from "oxlint";

export default defineConfig({
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
    "websites/tanstack/src/routeTree.gen.ts",
  ],
});
