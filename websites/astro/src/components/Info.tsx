import type { CollectionEntry } from "astro:content";
import { createEffect, createSignal, For } from "solid-js";
import ArrowCardIssue from "@components/ArrowCardIssue";

type Props = {
	tags: string[];
	data: CollectionEntry<"infoSlsManagementGovernance">[];
};

export default function Blog({ data, tags }: Props) {
	const [issues, setIssues] = createSignal<
		CollectionEntry<"infoSlsManagementGovernance">[]
	>([]);

	createEffect(() => {
		setIssues(data);
	});

	return (
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
			<div class="col-span-3 sm:col-span-2">
				<div class="flex flex-col">
					<div class="text-sm uppercase mb-2">
						Showing {issues().length} of {data.length} issues
					</div>
					<ul class="flex flex-col gap-3">
						<For each={issues()}>
							{(issue) => (
								<li id={issue.id}>
									<ArrowCardIssue entry={issue} />
								</li>
							)}
						</For>
					</ul>
				</div>
			</div>
		</div>
	);
}
