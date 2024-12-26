import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { INFO_AWS_SLS_MANAGEMENT_GOVERNANCE, SITE } from "@consts";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

type Context = {
	site: string;
};

export async function GET(context: Context) {
	const awsSlsPosts = await getCollection("infoSlsManagementGovernance");
	const path = "info/aws-sls-management-governance";

	const items = [...awsSlsPosts];

	items.sort(
		(a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
	);

	return rss({
		title: INFO_AWS_SLS_MANAGEMENT_GOVERNANCE.TITLE,
		description: INFO_AWS_SLS_MANAGEMENT_GOVERNANCE.DESCRIPTION,
		site: `${context.site}/${path}`,
		items: items.map((item) => ({
			title: item.data.title,
			description: item.data.summary,
			pubDate: item.data.date,
			link: `${path}/${item.slug}/`,
			content: sanitizeHtml(parser.render(item.body), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			}),
		})),
	});
}
