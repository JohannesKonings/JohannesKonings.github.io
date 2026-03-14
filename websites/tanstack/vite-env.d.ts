/// <reference types="vite-plus/client" />

interface ImportMetaEnv {
  readonly NODE_ENV: "development" | "production" | "test";
  readonly VITE_DEPLOYMENT_KIND?: "production" | "preview" | "local";
  readonly VITE_SITE_URL?: string;
  readonly VITE_BRANCH_NAME?: string;
  readonly VITE_PREVIEW_SITE_BASE_DOMAIN?: string;
  readonly VITE_PRODUCTION_SITE_URL?: string;
  readonly VITE_LOCAL_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// For Node.js process.env
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    DEPLOYMENT_KIND?: "production" | "preview" | "local";
    SITE_URL?: string;
    BRANCH_NAME?: string;
    PREVIEW_SITE_BASE_DOMAIN?: string;
    PRODUCTION_SITE_URL?: string;
    LOCAL_SITE_URL?: string;
    VITE_DEPLOYMENT_KIND?: "production" | "preview" | "local";
    VITE_SITE_URL?: string;
    VITE_BRANCH_NAME?: string;
    VITE_PREVIEW_SITE_BASE_DOMAIN?: string;
    VITE_PRODUCTION_SITE_URL?: string;
    VITE_LOCAL_SITE_URL?: string;
  }
}
