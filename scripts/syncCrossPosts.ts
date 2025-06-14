import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

async function sync(from: string, to: string, pathPrefix: string) {
	console.log("Syncing", from, "to", to);
	console.log("Current directory", process.cwd());

	const fromPath = `./${from}`;
	const toPath = `./${pathPrefix}/${to}`;

	const { stdout: stdoutCleanup } = await execa`rm -rf ${toPath}`;
	fs.mkdirSync(toPath, { recursive: true });
	console.log("current files removed", stdoutCleanup);
	// const { stdout: stdoutCopy } =
	// 	await execa`cp -r ./../../${from}/ ./../../${pathPrefix}`;
	// console.log("files copied", stdoutCopy);
	// // rename _posts to blog -> copy of folders below _posts was somehow not possible
	// const { stdout: stdoutRename } =
	// 	await execa`mv ./../../${pathPrefix}/${from} ./../../${pathPrefix}/${to}`;
	// console.log("moved", stdoutRename);

	const markdownFiles = fs
		.readdirSync(fromPath, { recursive: true })
		.filter((file) => {
			return path.extname(file.toString()) === ".md";
		});

	console.log(`${markdownFiles.length} markdown files found`);

	for (const file of markdownFiles) {
		// Process each markdown file here
		const filePathFrom = path.join(fromPath, file.toString());
		const markdownContent = fs.readFileSync(filePathFrom, "utf-8");
		const filename = file.toString().endsWith("index.md")
			? file.toString().split("/").slice(-2).join("-")
			: file.toString();
		console.log("filename", filename);
		const filePathTo = path.join(toPath, filename);

		// postprocessing
		// links from github
		// links to other blog post on the same website

		fs.writeFileSync(filePathTo, markdownContent);
	}
}

const syncDevTo = async () => {
	const pathPrefix = "crossPosts/devTo";
	await sync("_posts", "posts", pathPrefix);
};

// const syncTanstack = async () => {
// 	const pathPrefix = "websites/tanstack/src/content";
// 	await sync("_posts", "blog", pathPrefix);
// };

await syncDevTo();

// const website = process.argv[2];

// if (website === "astro") {
// 	console.log("Syncing Astro");
// 	await syncAstro();
// } else if (website === "tanstack") {
// 	console.log("Synced Tanstack");
// 	await syncTanstack();
// } else {
// 	console.error("Unknown website", website);
// }
