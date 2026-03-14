/**
 * Injects a script at the start of <body> in 404.html that redirects
 * /tanstack/* to /* for humans while keeping the 404 artifact non-indexable.
 */
import fs from "node:fs";
import path from "node:path";

const dist404 = path.join(process.cwd(), "dist", "404.html");
if (!fs.existsSync(dist404)) {
  console.log("No dist/404.html found, skipping redirect injection");
  process.exit(0);
}

const redirectScript = `<script id="legacy-tanstack-redirect">if(location.pathname.startsWith("/tanstack")){var p=location.pathname.replace(/^\\/tanstack/,"")||"/";location.replace(p+location.search+location.hash);}</script>`;
const robotsMeta = '<meta name="robots" content="noindex, follow">';
const notFoundTitle = "<title>Page not found | Johannes Konings</title>";
const notFoundDescription =
  '<meta name="description" content="The requested page could not be found.">';
let html = fs.readFileSync(dist404, "utf-8");
html = html.replace(/<title>[\s\S]*?<\/title>/i, notFoundTitle);
html = html.replace(/<meta[^>]+name="description"[^>]*>/i, notFoundDescription);
html = html.replace(/<link[^>]+rel="canonical"[^>]*>\s*/i, "");
html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, "");

if (!html.includes('name="robots"')) {
  html = html.replace("</head>", `${robotsMeta}</head>`);
}

html = html.replace("<body>", "<body>" + redirectScript);
fs.writeFileSync(dist404, html);
console.log("Injected /tanstack redirect and noindex metadata into 404.html");
