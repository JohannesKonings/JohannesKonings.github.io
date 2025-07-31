/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: "development" | "production" | "test";
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// For Node.js process.env
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    // Add more env variables here as needed
  }
}
