import type { JSX } from "react";

interface ContentNavItem {
  title: string;
  url: string;
}

interface PrevNextNavProps {
  prev?: ContentNavItem;
  next?: ContentNavItem;
}

export function PrevNextNav({ prev, next }: PrevNextNavProps): JSX.Element {
  return (
    <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {prev ? (
        <a
          href={prev.url}
          className="group rounded-xl border border-cyan-500/20 bg-gray-900/50 p-4 transition-all duration-300 hover:border-cyan-400/60 hover:bg-gray-900/70"
        >
          <p className="text-xs uppercase tracking-wide text-cyan-300">Previous</p>
          <p className="mt-3 text-gray-100 transition-colors duration-300 group-hover:text-cyan-200">
            {prev.title}
          </p>
        </a>
      ) : (
        <div />
      )}

      {next ? (
        <a
          href={next.url}
          className="group rounded-xl border border-blue-500/20 bg-gray-900/50 p-4 text-right transition-all duration-300 hover:border-blue-400/60 hover:bg-gray-900/70"
        >
          <p className="text-xs uppercase tracking-wide text-blue-300">Next</p>
          <p className="mt-3 text-gray-100 transition-colors duration-300 group-hover:text-blue-200">
            {next.title}
          </p>
        </a>
      ) : (
        <div />
      )}
    </div>
  );
}

