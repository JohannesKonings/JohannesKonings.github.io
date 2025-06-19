import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import path from "node:path";

export default defineConfig({
	// base: "/tanstack/", // Added base path
	server: {
		port: 3000, // Port for local development
	},
	plugins: [
		tsConfigPaths(),
		tanstackStart({
			// target: "static",
			target: "static", // Use GitHub Pages as the target
			spa: {
				enabled: true,
				prerender: {
					enabled: false,
					crawlLinks: true,
					autoSubfolderIndex: true,
				},
			},
			pages: [
				{
					path: "/tanstack",
					prerender: {
						enabled: true,
						crawlLinks: true,
						autoSubfolderIndex: true,
					},
				},
			],
			// prerender: {
			// 	enabled: true,
			// 	crawlLinks: true,
			// 	autoSubfolderIndex: true,
			// 	filter: () => true,
			// },
		}),
	],
});
