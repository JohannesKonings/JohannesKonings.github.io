import { lazy, type ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import globalCss from "@/src/styles/global.css?url";
import { Navigation } from "../components/Navigation";
import { BackToTop } from "../components/BackToTop";
import { ThemeProvider } from "../contexts/ThemeContext";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : lazy(() =>
        import("@tanstack/react-router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

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
        title: "Johannes Konings",
      },
      {
        name: "description",
        content: "Notes and posts on AWS and TanStack.",
      },
    ],
    links: [
      { rel: "stylesheet", href: globalCss },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Johannes Konings",
        href: "https://johanneskonings.github.io/rss.xml",
      },
      {
        rel: "preload",
        href: "/fonts/CascadiaMonoNF.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/CascadiaMonoNF-SemiBold.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <RootDocument>
      <main id="main-content" key={pathname} className="animate-route-fade">
        <Outlet />
      </main>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script src="/theme-init.js" suppressHydrationWarning />
        <ThemeProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
            {/* Animated background - gradient shift and orbs */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 dark:from-cyan-500/5 dark:via-transparent dark:to-blue-500/5 animate-fade bg-[length:200%_200%]" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-gentle-pulse animation-delay-2000" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-gentle-pulse animation-delay-3000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-400/5 dark:bg-cyan-500/5 rounded-full blur-3xl animate-subtle-glow" />

            <Navigation />
            <div className="relative z-10 min-h-screen bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm transition-colors duration-300">
              {children}
              <BackToTop />
              <Scripts />
              <TanStackRouterDevtools position="bottom-right" />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
