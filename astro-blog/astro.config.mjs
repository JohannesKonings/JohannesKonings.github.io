import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: "https://johanneskonings.dev",
  markdown: {
    remarkPlugins: [remarkToc],
  },
  integrations: [
    mdx(),
    sitemap(),
    solidJs(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
