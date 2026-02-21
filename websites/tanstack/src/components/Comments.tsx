import { useEffect, useRef } from "react";
import type { JSX } from "react";

export function Comments(): JSX.Element {
  const commentsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = commentsRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute(
      "data-repo",
      "JohannesKonings/JohannesKonings.github.io",
    );
    script.setAttribute("data-repo-id", "MDEwOlJlcG9zaXRvcnkyODQyNTQyNjc=");
    script.setAttribute("data-category", "Blog Post Comments");
    script.setAttribute("data-category-id", "DIC_kwDOEPFgO84CgLJN");
    script.setAttribute("data-mapping", "url");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");

    container.append(script);
  }, []);

  return <div ref={commentsRef} className="giscus mx-auto mt-12 w-full" />;
}
