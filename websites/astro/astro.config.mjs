import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";

// https://astro.build/config
export default defineConfig({
	site: "https://johanneskonings.dev",
	markdown: {
		rehypePlugins: [rehypeAstroRelativeMarkdownLinks],
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