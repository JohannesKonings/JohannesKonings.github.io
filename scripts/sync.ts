import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

const pathPrefix = "websites/astro";

async function sync(from: string, to: string) {
	console.log("Syncing", from, "to", to);
	console.log("Current directory", process.cwd());

	const { stdout: stdoutCleanup } =
		await execa`rm -rf ./../../${pathPrefix}/src/content/${to}`;
	console.log("current files removed", stdoutCleanup);
	const { stdout: stdoutCopy } =
		await execa`cp -r ./../../${from}/ ./../../${pathPrefix}/src/content`;
	console.log("files copied", stdoutCopy);
	// rename _posts to blog -> copy of folders below _posts was somehow not possible
	const { stdout: stdoutRename } =
		await execa`mv ./../../${pathPrefix}/src/content/${from} ./../../${pathPrefix}/src/content/${to}`;
	console.log("moved", stdoutRename);

	//   markdown post processing

	const markdownFiles = fs
		.readdirSync(`./../../${pathPrefix}/src/content/${to}`, { recursive: true })
		.filter((file) => {
			return path.extname(file.toString()) === ".md";
		});

	for (const file of markdownFiles) {
		// Process each markdown file here
		const filePath = path.join(
			`./../../${pathPrefix}/src/content/${to}`,
			file.toString(),
		);
		const markdownContent = fs.readFileSync(filePath, "utf-8");
		const markdownContentWithoutLayout = markdownContent.replace(
			/^.*layout:.*$\n?/gm,
			"",
		);
		fs.writeFileSync(filePath, markdownContentWithoutLayout);
	}
}

const syncAstro = async () => {
	await sync("_posts", "blog");
	await sync("_notes", "notes");
};

const website = process.argv[2];

if (website === "astro") {
	console.log("Syncing Astro");
	await syncAstro();
} else {
	console.error("Unknown website", website);
}
