import { expect, test } from "@playwright/test";

test.describe("tanstack smoke", () => {
  test("blog preview card opens the post from image/card clicks", async ({ page }) => {
    await page.goto("/");

    const firstPreviewCard = page
      .locator("article")
      .filter({ has: page.locator("h2") })
      .first();

    await expect(firstPreviewCard).toBeVisible();
    await expect
      .poll(async () => firstPreviewCard.evaluate((element) => getComputedStyle(element).cursor))
      .toBe("pointer");

    const previewTitle = (await firstPreviewCard.locator("h2").textContent())?.trim();

    await firstPreviewCard.click({ position: { x: 32, y: 32 } });
    await expect(page).toHaveURL(/\/blog\/[^/]+$/);

    const headerCoverImage = page.locator("article header img").first();
    await expect(headerCoverImage).toBeVisible();
    await expect(headerCoverImage).toHaveAttribute("src", /\/content\/blog\/.+/);
    await expect
      .poll(async () =>
        headerCoverImage.evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);

    if (previewTitle) {
      await expect(headerCoverImage).toHaveAttribute(
        "alt",
        new RegExp(`^Cover image for ${previewTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
      );
    }
  });

  test("blog preview card tags stay clickable", async ({ page }) => {
    await page.goto("/");

    const firstTag = page.locator('article a[href^="/blog/tag/"]').first();

    await expect(firstTag).toBeVisible();
    await firstTag.click();
    await expect(page).toHaveURL(/\/blog\/tag\/[^/]+$/);
  });

  test("desktop navigation click path works", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.getByRole("link", { name: "Notes" }).click();
    await expect(page).toHaveURL(/\/notes$/);

    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("search modal opens and closes", async ({ page }) => {
    await page.goto("/");

    const searchButton = page.locator("nav").getByRole("button", { name: "Search" });
    const searchDialog = page.getByRole("dialog", { name: "Search content" });

    await expect
      .poll(async () => {
        await searchButton.click();
        return await searchDialog.isVisible();
      })
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(searchDialog).toBeHidden();
  });

  test("mobile menu can navigate to notes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuToggle = page.getByRole("button", {
      name: "Toggle navigation menu",
    });

    await expect
      .poll(async () => {
        if ((await menuToggle.getAttribute("aria-expanded")) !== "true") {
          await menuToggle.click();
        }

        return await menuToggle.getAttribute("aria-expanded");
      })
      .toBe("true");

    const mobileNotesLink = page
      .locator("a")
      .filter({ hasText: /^Notes$/ })
      .last();

    await expect(mobileNotesLink).toBeVisible();
    await mobileNotesLink.click();

    await expect(page).toHaveURL(/\/notes$/);
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  });
});
