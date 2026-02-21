import { useEffect, useRef } from "react";

const GISCUS_SCRIPT = "https://giscus.app/client.js";

const REPO = "JohannesKonings/JohannesKonings.github.io";
const REPO_ID = "MDEwOlJlcG9zaXRvcnkyODQyNTQyNjc=";
const MAPPING = "url";
const THEME = "preferred_color_scheme";
const LANG = "en";
const REACTIONS = "1";
const INPUT_POSITION = "bottom";
const LOADING = "lazy";

export type GiscusCategory = "blog" | "notes";

const CATEGORY_CONFIG: Record<
  GiscusCategory,
  { category: string; categoryId: string }
> = {
  blog: {
    category: "Blog Post Comments",
    categoryId: "DIC_kwDOEPFgO84CgLJN",
  },
  notes: {
    category: "Note comments",
    categoryId: "DIC_kwDOEPFgO84CgLJO",
  },
};

interface GiscusProps {
  category?: GiscusCategory;
}

export function Giscus({ category = "blog" }: GiscusProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { category: catName, categoryId } = CATEGORY_CONFIG[category];

  useEffect(() => {
    if (!containerRef.current || typeof document === "undefined") return;

    const script = document.createElement("script");
    script.src = GISCUS_SCRIPT;
    script.setAttribute("data-repo", REPO);
    script.setAttribute("data-repo-id", REPO_ID);
    script.setAttribute("data-category", catName);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", MAPPING);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", REACTIONS);
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", INPUT_POSITION);
    script.setAttribute("data-theme", THEME);
    script.setAttribute("data-lang", LANG);
    script.setAttribute("data-loading", LOADING);
    script.crossOrigin = "anonymous";
    script.async = true;

    containerRef.current.appendChild(script);

    return () => {
      containerRef.current?.querySelector("script[src='" + GISCUS_SCRIPT + "']")?.remove();
    };
  }, [catName, categoryId]);

  return <section ref={containerRef} className="giscus mx-auto mt-10 w-full" />;
}
