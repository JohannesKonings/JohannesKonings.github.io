import { expect, test } from "@playwright/test";

test.describe("tanstack smoke", () => {
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

    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");

    await page
      .locator("a")
      .filter({ hasText: /^Notes$/ })
      .last()
      .click();

    await expect(page).toHaveURL(/\/notes$/);
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
  });
});
