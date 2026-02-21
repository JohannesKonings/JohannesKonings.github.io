/**
 * Injects a script at the start of <body> in 404.html that redirects
 * /tanstack/* to /* for SEO and existing link compatibility.
 */
import fs from "node:fs";
import path from "node:path";

const dist404 = path.join(process.cwd(), "dist", "404.html");
if (!fs.existsSync(dist404)) {
  console.log("No dist/404.html found, skipping redirect injection");
  process.exit(0);
}

const redirectScript = `<script>if(location.pathname.startsWith("/tanstack")){var p=location.pathname.replace(/^\\/tanstack/,"")||"/";location.replace(p+location.search+location.hash);}</script>`;
let html = fs.readFileSync(dist404, "utf-8");
html = html.replace("<body>", "<body>" + redirectScript);
fs.writeFileSync(dist404, html);
console.log("Injected /tanstack redirect into 404.html");
