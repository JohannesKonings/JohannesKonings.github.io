import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import contentCollections from "@content-collections/vite";

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
  plugins: [
    tailwindcss(),
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
