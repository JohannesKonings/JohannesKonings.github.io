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
    ],
    links: [{ rel: "stylesheet", href: globalCss }],
  }),
  component: RootComponent,
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
        <HeadContent />
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          {/* Animated background pattern - more subtle and slower */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 animate-gentle-pulse"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl animate-gentle-pulse animation-delay-2000"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-gentle-pulse animation-delay-3000"></div>
          </div>

          <Navigation />
          <div className="relative z-10 min-h-screen bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50 backdrop-blur-sm">
            {children}
            <Scripts />
          </div>
        </div>
      </body>
    </html>
  );
}
