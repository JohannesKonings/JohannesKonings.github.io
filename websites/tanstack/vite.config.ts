import { defineConfig } from "vite-plus";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import contentCollections from "@content-collections/vite";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";

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
      } else if (!existsSync(destPath) || statSync(srcPath).mtime > statSync(destPath).mtime) {
        mkdirSync(dirname(destPath), { recursive: true });
        copyFileSync(srcPath, destPath);
      }
    }
  };

  return {
    name: "sync-content",
    buildStart() {
      copyDirectory("src/content", "public/content");
    },
    handleHotUpdate({ file }: { file: string }) {
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

function syncStartManifestPlugin() {
  return {
    name: "sync-start-manifest",
    closeBundle(this: { environment?: { name?: string } }) {
      if (this.environment?.name !== "nitro") {
        return;
      }

      const ssrAssetsDir = resolve("node_modules/.nitro/vite/services/ssr/assets");
      if (!existsSync(ssrAssetsDir)) {
        return;
      }

      const manifestFile = readdirSync(ssrAssetsDir).find(
        (file) => file.startsWith("_tanstack-start-manifest_v-") && file.endsWith(".js"),
      );

      if (!manifestFile) {
        return;
      }

      const outputManifestPath = resolve(".output/server/_tanstack-start-manifest_v.mjs");
      mkdirSync(dirname(outputManifestPath), { recursive: true });
      copyFileSync(join(ssrAssetsDir, manifestFile), outputManifestPath);
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: "/",
  environments: {
    nitro: {
      build: {
        ssr: "./src/server.ts",
      },
    },
  },
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
    syncStartManifestPlugin(),
    contentCollections(),
    tsConfigPaths(),
    tanstackStart({
      srcDirectory: "src",
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
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
    viteReact(),
    nitro({ preset: "static" }),
  ],
}));
