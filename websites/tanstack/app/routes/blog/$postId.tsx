import { createFileRoute } from "@tanstack/react-router";
import * as fs from "node:fs";
import * as path from "node:path";

import Markdown from "markdown-to-jsx";

export const Route = createFileRoute("/blog/$postId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { postId } = Route.useParams();
	if (
		postId.endsWith(".png") ||
		postId.endsWith(".jpg") ||
		postId.endsWith(".jpeg") ||
		postId.endsWith(".gif")
	) {
		// ignore images
	} else {
		const postPath = path.resolve(
			import.meta.dirname,
			`../../content/blog/${postId}/index.md`,
		);
		const postContent = fs.readFileSync(postPath, "utf8");

		// image link postprocessing
		const updatedContent = postContent.replace(
			/!\[([^\]]*)\]\(([^)]+\.png)\)/g,
			(match, altText, imagePath) =>
				`![${altText}](../../app/content/blog/${postId}/${imagePath})`,
		);

		return <Markdown>{updatedContent}</Markdown>;
	}
}
