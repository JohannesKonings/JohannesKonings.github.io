import type { CollectionEntry } from "astro:content";
import { createEffect, createSignal, For } from "solid-js";
import ArrowCardPost from "@components/ArrowCardPost";
import { cn } from "@lib/utils";

type Props = {
  tags: { name: string; count: number }[];
  data: CollectionEntry<"blog">[];
};

export default function Blog({ data, tags }: Props) {
  const [filter, setFilter] = createSignal(new Set<string>());
  const [posts, setPosts] = createSignal<CollectionEntry<"blog">[]>([]);

  createEffect(() => {
    setPosts(
      data.filter((entry) =>
        Array.from(filter()).every((value) =>
          entry.data.tags.some(
            (tag: string) => tag.toLowerCase() === String(value).toLowerCase(),
          ),
        ),
      ),
    );
  });

  function toggleTag(tagName: string) {
    setFilter(
      (prev) =>
        new Set(
          prev.has(tagName)
            ? [...prev].filter((t) => t !== tagName)
            : [...prev, tagName],
        ),
    );
  }

  return (
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div class="col-span-3 sm:col-span-2">
        <div class="flex flex-col">
          <div class="text-sm uppercase mb-2">
            Showing {posts().length} of {data.length} posts
          </div>
          <ul class="flex flex-col gap-3">
            {posts().map((post) => (
              <li>
                <ArrowCardPost entry={post} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div class="col-span-3 sm:col-span-1 ">
        <div class="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden">
          <div class="text-sm font-semibold uppercase mb-2 text-black dark:text-white">
            Filter
          </div>
          <ul class="flex flex-wrap sm:flex-col gap-1.5">
            <For each={tags}>
              {(tag) => (
                <li>
                  <button
                    onClick={() => toggleTag(tag.name)}
                    class={cn(
                      "w-full px-2 py-1 rounded",
                      "whitespace-nowrap overflow-hidden text-ellipsis",
                      "flex gap-2 items-center justify-between",
                      "bg-black/5 dark:bg-white/10",
                      "hover:bg-black/10 hover:dark:bg-white/15",
                      "transition-colors duration-300 ease-in-out",
                      filter().has(tag.name) && "text-black dark:text-white",
                    )}
                  >
                    <div class="flex gap-2 items-center">
                      <svg
                        class={cn(
                          "size-5 fill-black/50 dark:fill-white/50",
                          "transition-colors duration-300 ease-in-out",
                          filter().has(tag.name) &&
                            "fill-black dark:fill-white",
                        )}
                      >
                        <use
                          href={`/ui.svg#square`}
                          class={cn(
                            !filter().has(tag.name) ? "block" : "hidden",
                          )}
                        />
                        <use
                          href={`/ui.svg#square-check`}
                          class={cn(
                            filter().has(tag.name) ? "block" : "hidden",
                          )}
                        />
                      </svg>
                      <span>{tag.name}</span>
                    </div>
                    <span class="text-sm opacity-60">({tag.count})</span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
    </div>
  );
}
