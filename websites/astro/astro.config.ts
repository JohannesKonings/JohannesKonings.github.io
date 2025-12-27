import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";
import { rehypePrettyCode } from "rehype-pretty-code";
import { transformerCopyButton } from "@rehype-pretty/transformers";
import rehypeMermaid from "rehype-mermaid";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://johanneskonings.dev",

  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      rehypeAstroRelativeMarkdownLinks,
      rehypeMermaid,
      [
        rehypePrettyCode,
        {
          // theme: moonlightTheme,
          transformers: [
            transformerCopyButton({
              visibility: "always",
              feedbackDuration: 2_500,
            }),
          ],
        },
      ],
    ],
  },

  integrations: [mdx(), sitemap(), solidJs()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
        "@consts": "/src/consts.ts",
        "@lib": "/src/lib",
        "@components": "/src/components",
        "@layouts": "/src/layouts",
        "@styles": "/src/styles",
      },
    },
  },
});
