import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://johanneskonings.dev";

async function sync(from: string, to: string, pathPrefix: string) {
  console.log("Syncing", from, "to", to);
  console.log("Current directory", process.cwd());

  const { stdout: stdoutCleanup } =
    await execa`rm -rf ./../../${pathPrefix}/${to}`;
  console.log("current files removed", stdoutCleanup);
  const { stdout: stdoutCopy } =
    // await execa`cp -r ./../../${from}/ ./../../${pathPrefix}`;
    await execa`cp -r ./../../${from}/ ./../../${pathPrefix}/${to}`;
  console.log("files copied", stdoutCopy);
  // rename _posts to blog -> copy of folders below _posts was somehow not possible
  // const { stdout: stdoutRename } =
  // 	await execa`mv ./../../${pathPrefix}/${from} ./../../${pathPrefix}/${to}`;
  // console.log("moved", stdoutRename);

  //   markdown post processing

  const markdownFiles = fs
    .readdirSync(`./../../${pathPrefix}/${to}`, { recursive: true })
    .filter((file) => {
      return path.extname(file.toString()) === ".md";
    });

  for (const file of markdownFiles) {
    // Process each markdown file here
    const filePath = path.join(`./../../${pathPrefix}/${to}`, file.toString());
    const markdownContent = fs.readFileSync(filePath, "utf-8");
    const markdownContentWithoutLayout = markdownContent.replace(
      /^.*layout:.*$\n?/gm,
      "",
    );
    fs.writeFileSync(filePath, markdownContentWithoutLayout);
  }
}

function getMarkdownFiles(targetPath: string): string[] {
  return fs
    .readdirSync(targetPath, { recursive: true })
    .filter((file) => path.extname(file.toString()) === ".md")
    .map((file) => path.join(targetPath, file.toString()));
}

function toContentSlug(filePath: string, basePath: string): string {
  const relativePath = path.relative(basePath, filePath).replaceAll("\\", "/");
  return relativePath.replace(/\/index\.md$/, "").replace(/\.md$/, "");
}

function parseFrontmatter(markdownContent: string): Record<string, string> {
  const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const frontmatter = frontmatterMatch[1];
  const values: Record<string, string> = {};
  const lines = frontmatter.split("\n");

  for (const line of lines) {
    const dividerIndex = line.indexOf(":");
    if (dividerIndex <= 0) {
      continue;
    }

    const key = line.slice(0, dividerIndex).trim();
    const value = line
      .slice(dividerIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) {
      values[key] = value;
    }
  }

  return values;
}

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function generateRssXml() {
  const postsBasePath = path.resolve(process.cwd(), "./../../_posts");
  const markdownFiles = getMarkdownFiles(postsBasePath);

  const rssItems = markdownFiles
    .map((filePath) => {
      const markdownContent = fs.readFileSync(filePath, "utf-8");
      const frontmatter = parseFrontmatter(markdownContent);
      const isPublished = frontmatter.published !== "false";
      const title = frontmatter.title;
      const summary = frontmatter.summary ?? "";
      const date = frontmatter.date;

      if (!isPublished || !title || !date) {
        return null;
      }

      const slug = toContentSlug(filePath, postsBasePath);
      const url = `${SITE_URL}/blog/${slug}/`;

      return {
        title,
        summary,
        date: new Date(date),
        url,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Johannes Konings</title>
    <description>Contact, notes and some posts</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems
      .map(
        (item) => `<item>
      <title>${xmlEscape(item.title)}</title>
      <description>${xmlEscape(item.summary)}</description>
      <link>${xmlEscape(item.url)}</link>
      <guid>${xmlEscape(item.url)}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
    </item>`,
      )
      .join("\n    ")}
  </channel>
</rss>
`;

  const rssPath = path.resolve(
    process.cwd(),
    "./../../websites/tanstack/public/rss.xml",
  );
  fs.writeFileSync(rssPath, rssXml);
  console.log("Generated RSS feed at", rssPath);
}

function generateRobotsTxt() {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap-index.xml
`.trim();

  const robotsPath = path.resolve(
    process.cwd(),
    "./../../websites/tanstack/public/robots.txt",
  );
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log("Generated robots.txt at", robotsPath);
}

const syncAstro = async () => {
  const pathPrefix = "websites/astro/src/content";
  await sync("_posts", "blog", pathPrefix);
  await sync("_notes", "notes", pathPrefix);
  await sync(
    "_info/aws-sls-management-governance",
    "infoSlsManagementGovernance",
    pathPrefix,
  );
};

const syncTanstack = async () => {
  const pathPrefix = "websites/tanstack/src/content";
  await sync("_posts", "blog", pathPrefix);
  await sync("_notes", "notes", pathPrefix);
  await sync("websites/astro/src/content/legal", "legal", pathPrefix);

  // Also copy content to public directory for static serving
  console.log("Copying content to public directory for static serving");
  const { stdout: stdoutPublicCopy } =
    await execa`cp -r ./../../websites/tanstack/src/content ./../../websites/tanstack/public/`;
  console.log("public content copied", stdoutPublicCopy);

  generateRssXml();
  generateRobotsTxt();
};

const website = process.argv[2];

if (website === "astro") {
  console.log("Syncing Astro");
  await syncAstro();
} else if (website === "tanstack") {
  console.log("Synced Tanstack");
  await syncTanstack();
} else {
  console.error("Unknown website", website);
}
