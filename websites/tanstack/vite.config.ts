import { defineConfig } from "vite-plus";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import contentCollections from "@content-collections/vite";
import { copyFileSync, mkdirSync, existsSync, readdirSync, rmSync, statSync } from "fs";
import { join, dirname, extname } from "path";

// Plugin to mirror authored content assets into public/content
function syncContentPlugin() {
  const authoredContentRoots = [
    { source: "../../_posts", destination: "public/content/blog" },
    { source: "../../_notes", destination: "public/content/notes" },
  ] as const;

  const isMarkdownFile = (filePath: string) =>
    [".md", ".mdx"].includes(extname(filePath).toLowerCase());

  const copyAssetFiles = (src: string, dest: string) => {
    if (!existsSync(src)) {
      return;
    }

    const items = readdirSync(src);
    for (const item of items) {
      const srcPath = join(src, item);
      const destPath = join(dest, item);

      if (statSync(srcPath).isDirectory()) {
        copyAssetFiles(srcPath, destPath);
        continue;
      }

      if (isMarkdownFile(srcPath)) {
        continue;
      }

      if (!existsSync(destPath) || statSync(srcPath).mtime > statSync(destPath).mtime) {
        mkdirSync(dirname(destPath), { recursive: true });
        copyFileSync(srcPath, destPath);
      }
    }
  };

  const syncAuthoredAssets = () => {
    rmSync("public/content", { recursive: true, force: true });

    for (const { source, destination } of authoredContentRoots) {
      copyAssetFiles(source, destination);
    }
  };

  return {
    name: "sync-content",
    buildStart() {
      syncAuthoredAssets();
    },
    handleHotUpdate({ file }: { file: string }) {
      if (file.includes("_posts") || file.includes("_notes")) {
        try {
          syncAuthoredAssets();
          console.log("✅ Synced authored content assets to public directory");
        } catch (error) {
          console.error("❌ Failed to sync content:", error);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: "/",
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
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    css: true,
  },
  plugins: [
    tailwindcss(),
    syncContentPlugin(),
    contentCollections(),
    // TanStack Start includes its own React plugin — no separate @vitejs/plugin-react needed
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
        failOnError: true,
      },
      pages: [
        { path: "/", prerender: { enabled: true, outputPath: "/index.html" } },
        {
          path: "/blog",
          prerender: { enabled: true, outputPath: "/blog.html" },
        },
        {
          path: "/notes",
          prerender: { enabled: true, outputPath: "/notes.html" },
        },
        {
          path: "/search",
          prerender: { enabled: true, outputPath: "/search.html" },
        },
      ],
    }),
    tsConfigPaths(),
  ],
}));
