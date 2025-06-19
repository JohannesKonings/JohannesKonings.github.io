import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import typographyPlugin from "@tailwindcss/typography";

const config = {
	darkMode: "class",
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["CascadiaMonoNF", ...defaultTheme.fontFamily.sans],
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "100%",
					},
				},
			},
			rotate: {
				"45": "45deg",
				"135": "135deg",
				"225": "225deg",
				"315": "315deg",
			},
			animation: {
				twinkle: "twinkle 2s ease-in-out forwards",
				meteor: "meteor 3s ease-in-out forwards",
			},
			keyframes: {
				twinkle: {
					"0%": {
						opacity: "0",
						transform: "rotate(0deg)",
					},
					"50%": {
						opacity: "1",
						transform: "rotate(180deg)",
					},
					"100%": {
						opacity: "0",
						transform: "rotate(360deg)",
					},
				},
				meteor: {
					"0%": {
						opacity: "0",
						transform: "translateY(200%)",
					},
					"50%": {
						opacity: "1",
					},
					"100%": {
						opacity: "0",
						transform: "translateY(0)",
					},
				},
			},
		},
	},
	plugins: [typographyPlugin],
} satisfies Config;

export default config;
