import { defineMiddleware } from "astro:middleware";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.url);
  const path = url.pathname;
  if (path === "/blog/2025-01-02-aws-application-config-lambda-cdk") {
    return context.redirect(
      "/blog/2025-01-02-aws-application-signals-config-lambda-cdk",
      302,
    );
  }
  return next();
});
