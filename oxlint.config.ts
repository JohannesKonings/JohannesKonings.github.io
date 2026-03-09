import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    typeAware: true,
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
    "websites/tanstack/src/routeTree.gen.ts",
  ],
});
