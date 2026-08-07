import { createThemeCss } from "@tanstack/highlight/theme";
import { githubLightTheme } from "@tanstack/highlight/themes/github-light";
import { oneDarkProTheme } from "@tanstack/highlight/themes/one-dark-pro";

/** Light/dark theme CSS for TanStack Highlight token classes (`th-*`). */
export const highlightThemeCss = createThemeCss({
  light: githubLightTheme,
  dark: oneDarkProTheme,
  darkSelector: ".dark",
});
