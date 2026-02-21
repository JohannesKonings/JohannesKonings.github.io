const basePathRaw = import.meta.env.BASE_URL || "/";

export const BASE_PATH =
  basePathRaw === "/" ? "" : basePathRaw.replace(/\/$/, "");

export function withBase(path: string): string {
  if (!BASE_PATH) {
    return path;
  }

  if (path === "/") {
    return `${BASE_PATH}/`;
  }

  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

