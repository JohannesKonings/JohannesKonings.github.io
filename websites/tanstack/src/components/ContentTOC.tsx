import type { JSX } from "react";

interface HeadingItem {
  depth: number;
  text: string;
  slug: string;
}

interface ContentTOCProps {
  headings: HeadingItem[];
}

export function ContentTOC({ headings }: ContentTOCProps): JSX.Element | null {
  const filteredHeadings = headings.filter(
    (heading) => heading.depth >= 2 && heading.depth <= 3,
  );

  if (filteredHeadings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="not-prose mb-8 rounded-xl border border-cyan-500/20 bg-gray-900/60 p-4 backdrop-blur"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyan-300">
        Table of Contents
      </h2>
      <ul className="space-y-2 text-sm">
        {filteredHeadings.map((heading) => (
          <li key={heading.slug} className={heading.depth === 3 ? "ml-4" : ""}>
            <a
              href={`#${heading.slug}`}
              className="text-gray-300 transition-colors duration-300 hover:text-cyan-300 focus-visible:text-cyan-300"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
