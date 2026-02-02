import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import contentCollections from "@content-collections/vite";
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

// Plugin to sync src/content to public/content
function syncContentPlugin() {
  const copyDirectory = (src: string, dest: string) => {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }

    const items = readdirSync(src);
    for (const item of items) {
      const srcPath = join(src, item);
      const destPath = join(dest, item);

      if (statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        // Only copy if file doesn't exist or is newer
        if (
          !existsSync(destPath) ||
          statSync(srcPath).mtime > statSync(destPath).mtime
        ) {
          mkdirSync(dirname(destPath), { recursive: true });
          copyFileSync(srcPath, destPath);
        }
      }
    }
  };

  return {
    name: "sync-content",
    buildStart() {
      // Initial sync on build start
      copyDirectory("src/content", "public/content");
    },
    handleHotUpdate({ file }: { file: string }) {
      // Sync when content files change
      if (file.includes("src/content")) {
        try {
          copyDirectory("src/content", "public/content");
          console.log("✅ Synced content to public directory");
        } catch (error) {
          console.error("❌ Failed to sync content:", error);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/tanstack/" : "/",
  server: {
    port: 3000,
    fs: {
      allow: [".."],
    },
  },
  // Serve content directory as static assets for images
  publicDir: "public",
  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.svg",
    "**/*.avif",
    "**/*.webp",
  ],
  // Disable experimental features for TanStack Start compatibility
  // experimental: {
  //   enableNativePlugin: true,
  // },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-start",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
  },
  build: {
    target: "esnext",
    sourcemap: mode === "development",
    // Remove manual chunks to avoid conflicts with TanStack Start's build process
    // rollupOptions: {
    //   output: {
    //     manualChunks: (id) => {
    //       if (id.includes('node_modules')) {
    //         if (id.includes('react') || id.includes('react-dom')) {
    //           return 'vendor';
    //         }
    //         if (id.includes('@tanstack')) {
    //           return 'tanstack';
    //         }
    //         if (id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
    //           return 'utils';
    //         }
    //       }
    //     }
    //   }
    // }
  },
  plugins: [
    tailwindcss(),
    syncContentPlugin(),
    contentCollections(),
    // TanStack Start before React plugin (per official docs)
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
      },
    }),
    react(),
    tsConfigPaths(),
  ],
}));
