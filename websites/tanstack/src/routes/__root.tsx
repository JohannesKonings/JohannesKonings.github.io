import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import globalCss from "@/src/styles/global.css?url";
import { Navigation } from "../components/Navigation";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Johannes Konings | Blog & Notes",
      },
      {
        name: "description",
        content:
          "Engineering blog and notes on AWS, TanStack, TypeScript, and modern web development.",
      },
    ],
    links: [{ rel: "stylesheet", href: globalCss }],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <RootDocument>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-3 text-4xl font-bold text-cyan-200">404</h1>
        <p className="mb-6 text-gray-300">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-200 transition-colors hover:border-cyan-400/60 hover:text-cyan-100"
        >
          Back to home
        </a>
      </main>
    </RootDocument>
  ),
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const activeTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", activeTheme === "dark");
  } catch (_) {}
})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
          <Navigation />
          <div className="relative z-10 min-h-screen">
            {children}
            <Scripts />
          </div>
        </div>
      </body>
    </html>
  );
}
