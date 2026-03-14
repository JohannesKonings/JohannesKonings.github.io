import { describe, expect, it } from "vite-plus/test";
import {
  extractFirstMarkdownImage,
  normalizeContentImagePath,
  resolvePostSocialImage,
} from "./social-images";

describe("social image helpers", () => {
  it("normalizes relative post asset paths", () => {
    expect(normalizeContentImagePath("./cover-image.png", "my-post")).toBe(
      "/content/blog/my-post/cover-image.png",
    );
    expect(normalizeContentImagePath("release-draft.png", "my-post")).toBe(
      "/content/blog/my-post/release-draft.png",
    );
  });

  it("normalizes legacy site.baseurl image paths", () => {
    expect(
      normalizeContentImagePath(
        "{{ site.baseurl }}/img/2020-10-19-example_react_average_of_items_in_different_arrays/react_frui_basket_selection.png",
        "legacy-post",
      ),
    ).toBe("/img/2020-10-19-example_react_average_of_items_in_different_arrays/react_frui_basket_selection.png");
  });

  it("extracts the first markdown image from post content", () => {
    const content = `
Intro paragraph

![Preview]({{ site.baseurl }}/img/legacy-post/preview.png)

![Later](./later.png)
`;

    expect(extractFirstMarkdownImage(content, "legacy-post")).toBe("/img/legacy-post/preview.png");
  });

  it("resolves social image with cover image priority and fallback support", () => {
    expect(
      resolvePostSocialImage({
        coverImage: "./cover-image.png",
        content: "![Preview](./preview.png)",
        slug: "post-with-cover",
        fallbackImage: "/social-preview.png",
      }),
    ).toBe("/content/blog/post-with-cover/cover-image.png");

    expect(
      resolvePostSocialImage({
        content: "No images here",
        slug: "imageless-post",
        fallbackImage: "/social-preview.png",
      }),
    ).toBe("/social-preview.png");
  });
});
