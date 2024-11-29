import { defineConfig } from "@tanstack/start/config";

export const githubPagesPrefix = "/tanstack";

export default defineConfig({
	routers: {
		client: {
			// hack to get links with subpath working,
			// also need a postbuild movement of the asset files
			base: githubPagesPrefix,
		},
	},
	server: {
		compatibilityDate: "2024-11-23",
		prerender: {
			routes: ["/"],
			crawlLinks: true,
		},
		static: true,
		preset: "static",
	},
});
