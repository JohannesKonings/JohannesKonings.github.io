import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
	base: "/tanstack/", // Added base path
	server: {
		port: 3000,
	},
	plugins: [
		tsConfigPaths(),
		tanstackStart({
			// target: "static",
			target: "github-pages", // Use GitHub Pages as the target
			prerender: {
				enabled: true,
				crawlLinks: true,
			},
		}),
	],
});
