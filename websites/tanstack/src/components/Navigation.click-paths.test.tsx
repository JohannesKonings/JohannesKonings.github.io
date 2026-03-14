import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { createMemoryHistory } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { Navigation } from "./Navigation";
import { ThemeProvider } from "../contexts/ThemeContext";

vi.mock("../lib/content-collections", () => ({
  allPosts: [
    {
      published: true,
      slug: "post-1",
      title: "Post 1",
      summary: "Post summary",
      excerpt: "Post excerpt",
      tags: ["aws", "tanstack"],
      url: "/blog/post-1",
    },
  ],
  allNotes: [
    {
      published: true,
      slug: "note-1",
      title: "Note 1",
      summary: "Note summary",
      excerpt: "Note excerpt",
      tags: ["notes"],
      url: "/notes/note-1",
    },
  ],
}));

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <Navigation />
      <Outlet />
    </ThemeProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1>Home page</h1>,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: () => <h1>Blog page</h1>,
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notes",
  component: () => <h1>Notes page</h1>,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: () => <h1>Search page</h1>,
});

const routeTree = rootRoute.addChildren([homeRoute, blogRoute, notesRoute, searchRoute]);

async function renderWithRouter(initialPath = "/") {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialPath],
    }),
  });

  render(<RouterProvider router={router} />);
  const user = userEvent.setup();
  await waitFor(() => expect(router.state.status).toBe("idle"));

  return { router, user };
}

describe("Navigation click paths", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("navigates across desktop links via clicks", async () => {
    const { router, user } = await renderWithRouter("/");

    await user.click(screen.getByRole("link", { name: "Blog" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/blog"));
    expect(screen.getByRole("heading", { name: "Blog page" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Notes" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/notes"));
    expect(screen.getByRole("heading", { name: "Notes page" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Home" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    expect(screen.getByRole("heading", { name: "Home page" })).toBeInTheDocument();
  });

  it("navigates from mobile menu links and closes menu", async () => {
    const { router, user } = await renderWithRouter("/");
    const menuToggle = screen.getByRole("button", {
      name: "Toggle navigation menu",
    });

    await user.click(menuToggle);
    expect(menuToggle).toHaveAttribute("aria-expanded", "true");

    const mobileNotesLink = screen
      .getAllByRole("link", { name: "Notes" })
      .find((link) => link.className.includes("block px-3 py-2"));
    expect(mobileNotesLink).toBeTruthy();

    await user.click(mobileNotesLink!);
    await waitFor(() => expect(router.state.location.pathname).toBe("/notes"));
    expect(menuToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "RSS" })).not.toBeInTheDocument();
  });

  it("opens and closes the search modal via click controls", async () => {
    const { user } = await renderWithRouter("/");

    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("dialog", { name: "Search content" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close search" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Search content" })).not.toBeInTheDocument();
    });
  });

  it("closes the search modal with escape key and backdrop click", async () => {
    const { user } = await renderWithRouter("/");

    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Search content" })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Search" }));
    const modal = screen.getByRole("dialog", { name: "Search content" });
    fireEvent.mouseDown(modal);
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Search content" })).not.toBeInTheDocument();
    });
  });
});
