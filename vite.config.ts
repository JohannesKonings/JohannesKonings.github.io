import { defineConfig } from "vite-plus";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import contentCollections from "@content-collections/vite";
import { copyFileSync, mkdirSync, existsSync, readdirSync, rmSync, statSync } from "fs";
import { join, dirname, extname } from "path";

function syncContentPlugin() {
  const authoredContentRoots = [
    { source: "_posts", destination: "public/content/blog" },
    { source: "_notes", destination: "public/content/notes" },
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
      } else {
        if (isMarkdownFile(srcPath)) {
          continue;
        }

        if (!existsSync(destPath) || statSync(srcPath).mtime > statSync(destPath).mtime) {
          mkdirSync(dirname(destPath), { recursive: true });
          copyFileSync(srcPath, destPath);
        }
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
          console.log("Synced authored content assets to public directory");
        } catch (error) {
          console.error("Failed to sync content:", error);
        }
      }
    },
  };
}

export default defineConfig({
  base: "/",
  server: {
    port: 3000,
    watch: {
      ignored: [
        "**/.pnpm-store/**",
        "**/.git/**",
        "**/.output/**",
        "**/.tanstack/**",
        "**/.content-collections/**",
        "**/.nitro/**",
      ],
    },
  },
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
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  build: {
    target: "esnext",
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
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    env: {
      browser: true,
      node: true,
      es2022: true,
    },
    ignorePatterns: [
      "**/dist/**",
      "**/.vinxi",
      "**/.output",
      "**/.tanstack",
      "**/.content-collections",
      "**/.nitro",
      "src/routeTree.gen.ts",
      "test-results/**",
    ],
    options: {
      typeAware: true,
    },
  },
  fmt: {
    ignorePatterns: [
      "**/dist/**",
      "**/.vinxi",
      "**/.output",
      "**/.tanstack",
      "**/.content-collections",
      "**/.nitro",
      "src/routeTree.gen.ts",
      "test-results/**",
      "node_modules/",
      "*.min.js",
      "*.min.css",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
    ],
  },
});
