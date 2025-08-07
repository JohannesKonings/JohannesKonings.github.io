import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

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

  // Also copy content to public directory for static serving
  console.log("Copying content to public directory for static serving");
  const { stdout: stdoutPublicCopy } =
    await execa`cp -r ./../../websites/tanstack/src/content ./../../websites/tanstack/public/`;
  console.log("public content copied", stdoutPublicCopy);
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
