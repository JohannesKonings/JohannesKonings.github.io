import fs from "node:fs";
import path from "node:path";

function mirrorDirectory(from: string, to: string) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

async function sync(from: string, to: string, pathPrefix: string) {
  console.log("Syncing", from, "to", to);
  console.log("Current directory", process.cwd());

  const fromPath = path.join("./../../", from);
  const toPath = path.join("./../../", pathPrefix, to);
  mirrorDirectory(fromPath, toPath);
  console.log("files mirrored");

  //   markdown post processing

  const markdownFiles = fs.readdirSync(toPath, { recursive: true }).filter((file) => {
    return path.extname(file.toString()) === ".md";
  });

  for (const file of markdownFiles) {
    // Process each markdown file here
    const filePath = path.join(toPath, file.toString());
    const markdownContent = fs.readFileSync(filePath, "utf-8");
    const markdownContentWithoutLayout = markdownContent.replace(/^.*layout:.*$\n?/gm, "");
    fs.writeFileSync(filePath, markdownContentWithoutLayout);
  }
}

const syncTanstack = async () => {
  const pathPrefix = "websites/tanstack/src/content";
  await sync("_posts", "blog", pathPrefix);
  await sync("_notes", "notes", pathPrefix);

  // Also copy content to public directory for static serving
  console.log("Copying content to public directory for static serving");
  mirrorDirectory(
    "./../../websites/tanstack/src/content",
    "./../../websites/tanstack/public/content",
  );
  console.log("public content mirrored");
};

const website = process.argv[2];

if (website === "tanstack") {
  console.log("Synced Tanstack");
  await syncTanstack();
} else {
  console.error("Unknown website", website);
}
