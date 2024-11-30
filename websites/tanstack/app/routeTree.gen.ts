/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as IndexImport } from "./routes/index";
import { Route as BlogIndexImport } from "./routes/blog/index";
import { Route as BlogPostIdImport } from "./routes/blog/$postId";

// Create/Update Routes

const IndexRoute = IndexImport.update({
	id: "/",
	path: "/",
	getParentRoute: () => rootRoute,
} as any);

const BlogIndexRoute = BlogIndexImport.update({
	id: "/blog/",
	path: "/blog/",
	getParentRoute: () => rootRoute,
} as any);

const BlogPostIdRoute = BlogPostIdImport.update({
	id: "/blog/$postId",
	path: "/blog/$postId",
	getParentRoute: () => rootRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
	interface FileRoutesByPath {
		"/": {
			id: "/";
			path: "/";
			fullPath: "/";
			preLoaderRoute: typeof IndexImport;
			parentRoute: typeof rootRoute;
		};
		"/blog/$postId": {
			id: "/blog/$postId";
			path: "/blog/$postId";
			fullPath: "/blog/$postId";
			preLoaderRoute: typeof BlogPostIdImport;
			parentRoute: typeof rootRoute;
		};
		"/blog/": {
			id: "/blog/";
			path: "/blog";
			fullPath: "/blog";
			preLoaderRoute: typeof BlogIndexImport;
			parentRoute: typeof rootRoute;
		};
	}
}

// Create and export the route tree

export interface FileRoutesByFullPath {
	"/": typeof IndexRoute;
	"/blog/$postId": typeof BlogPostIdRoute;
	"/blog": typeof BlogIndexRoute;
}

export interface FileRoutesByTo {
	"/": typeof IndexRoute;
	"/blog/$postId": typeof BlogPostIdRoute;
	"/blog": typeof BlogIndexRoute;
}

export interface FileRoutesById {
	__root__: typeof rootRoute;
	"/": typeof IndexRoute;
	"/blog/$postId": typeof BlogPostIdRoute;
	"/blog/": typeof BlogIndexRoute;
}

export interface FileRouteTypes {
	fileRoutesByFullPath: FileRoutesByFullPath;
	fullPaths: "/" | "/blog/$postId" | "/blog";
	fileRoutesByTo: FileRoutesByTo;
	to: "/" | "/blog/$postId" | "/blog";
	id: "__root__" | "/" | "/blog/$postId" | "/blog/";
	fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
	IndexRoute: typeof IndexRoute;
	BlogPostIdRoute: typeof BlogPostIdRoute;
	BlogIndexRoute: typeof BlogIndexRoute;
}

const rootRouteChildren: RootRouteChildren = {
	IndexRoute: IndexRoute,
	BlogPostIdRoute: BlogPostIdRoute,
	BlogIndexRoute: BlogIndexRoute,
};

export const routeTree = rootRoute
	._addFileChildren(rootRouteChildren)
	._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/blog/$postId",
        "/blog/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/blog/$postId": {
      "filePath": "blog/$postId.tsx"
    },
    "/blog/": {
      "filePath": "blog/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
