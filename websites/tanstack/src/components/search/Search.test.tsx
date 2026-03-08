import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Search, type SearchItem } from "./Search";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    className,
    onClick,
    children,
  }: {
    to: string;
    className?: string;
    onClick?: () => void;
    children: ReactNode;
  }) => (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  ),
}));

const items: SearchItem[] = [
  {
    type: "blog",
    slug: "router-deep-dive",
    title: "TanStack Router Deep Dive",
    summary: "Routing patterns and nested routes",
    excerpt: "Understanding route trees and layouts",
    tags: "tanstack,router",
    url: "/blog/router-deep-dive",
  },
  {
    type: "blog",
    slug: "aws-lambda-guide",
    title: "Serverless APIs on AWS",
    summary: "Deploying Lambda and API Gateway",
    excerpt: "Infrastructure and release strategy",
    tags: "aws,lambda,serverless",
    url: "/blog/aws-lambda-guide",
  },
  {
    type: "note",
    slug: "edge-cache-checklist",
    title: "Edge Cache Checklist",
    summary: "",
    excerpt: "Validate stale-while-revalidate settings",
    tags: "cdn,edge,cache",
    url: "/notes/edge-cache-checklist",
  },
];

describe("Search (Orama)", () => {
  it("does not show results when query is below the minimum length", async () => {
    const user = userEvent.setup();
    render(<Search items={items} />);

    await user.type(screen.getByPlaceholderText("What are you looking for?"), "a");

    expect(screen.queryByText(/result/i)).not.toBeInTheDocument();
    expect(screen.queryByText("No results found. Try different keywords.")).not.toBeInTheDocument();
  });

  it("finds results from indexed fields like title and tags", async () => {
    const user = userEvent.setup();
    render(<Search items={items} />);
    const input = screen.getByPlaceholderText("What are you looking for?");

    await user.type(input, "router");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "TanStack Router Deep Dive" })).toBeInTheDocument();
    });

    await user.clear(input);
    await user.type(input, "lambda");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Serverless APIs on AWS" })).toBeInTheDocument();
    });
  });

  it("shows a no-results state when there are no matches", async () => {
    const user = userEvent.setup();
    render(<Search items={items} />);

    await user.type(screen.getByPlaceholderText("What are you looking for?"), "zzzz");

    await waitFor(() => {
      expect(screen.getByText("No results found. Try different keywords.")).toBeInTheDocument();
    });
  });

  it("calls onResultClick when a result is clicked", async () => {
    const user = userEvent.setup();
    const onResultClick = vi.fn();
    render(<Search items={items} onResultClick={onResultClick} />);

    await user.type(screen.getByPlaceholderText("What are you looking for?"), "edge");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Edge Cache Checklist" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("heading", { name: "Edge Cache Checklist" }));

    expect(onResultClick).toHaveBeenCalledTimes(1);
  });
});
