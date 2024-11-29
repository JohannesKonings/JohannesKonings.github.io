import { defineConfig } from "@tanstack/start/config";

export const githubPagesPrefix = "/tanstack";

export default defineConfig({
	// vite: {
	//   base: githubPagesPrefix,
	// },
	// vite() {
	//   return {
	//     base: githubPagesPrefix,
	//   }
	// },
	routers: {
		client: {
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
