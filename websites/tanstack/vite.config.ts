import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/tanstack/" : "/", // Use /tanstack/ for production (GitHub Pages), / for development
  server: {
    port: 3000, // Port for local development
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      target: "static", // Use GitHub Pages as the target
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
      },
    }),
  ],
}));
