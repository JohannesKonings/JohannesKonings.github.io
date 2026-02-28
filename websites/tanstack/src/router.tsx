import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
          404
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
          Page not found
        </p>
        <a
          href={import.meta.env.PROD ? "/tanstack/" : "/"}
          className="inline-flex items-center px-6 py-3 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg border border-cyan-200 dark:border-cyan-500/30 hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export function createRouter() {
  const router = createTanStackRouter({
    basepath: import.meta.env.PROD ? "/tanstack" : undefined,
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: DefaultNotFound,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export const getRouter = createRouter;
