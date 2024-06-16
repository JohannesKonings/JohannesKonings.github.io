import { execa } from "execa";
import fs from "fs";
import path from "path";

async function sync(from: string, to: string) {
  console.log("Syncing", from, "to", to);

  const { stdout: stdoutCleanup } = await execa`rm -rf ./src/content/${to}`;
  console.log(stdoutCleanup);
  const { stdout: stdoutCopy } = await execa`cp -r ../${from}/ ./src/content`;
  console.log(stdoutCopy);
  // rename _posts to blog -> copy of folders below _posts was somehow not possible
  const { stdout: stdoutRename } =
    await execa`mv ./src/content/${from} ./src/content/${to}`;
  console.log(stdoutRename);

  //   markdown post processing

  const markdownFiles = fs
    .readdirSync(`./src/content/${to}`, { recursive: true })
    .filter((file) => {
      return path.extname(file.toString()) === ".md";
    });

  for (const file of markdownFiles) {
    // Process each markdown file here
    const filePath = path.join(`./src/content/${to}`, file.toString());
    const markdownContent = fs.readFileSync(filePath, "utf-8");
    const markdownContentWithoutLayout = markdownContent.replace(
      /^.*layout:.*$\n?/gm,
      ""
    );
    fs.writeFileSync(filePath, markdownContentWithoutLayout);
  }
}

await sync("_posts", "blog");
await sync("_notes", "notes");
