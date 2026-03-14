import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    css: true,
  },
});
