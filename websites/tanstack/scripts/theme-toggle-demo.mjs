#!/usr/bin/env node
/**
 * Theme toggle demo: runs Playwright in headed mode, toggles theme, saves screenshots.
 * Requires dev server running: pnpm dev:tanstack (or nr dev:tanstack)
 * Run from repo root: node websites/tanstack/scripts/theme-toggle-demo.mjs
 * Or from websites/tanstack: node scripts/theme-toggle-demo.mjs
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "e2e-screenshots");
mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const THEME_TOGGLE =
  'button[aria-label*="Switch to"], button[aria-label="Toggle theme"]';

async function main() {
  const headless =
    process.env.HEADLESS !== "0" && process.env.HEADLESS !== "false";
  const browser = await chromium.launch({
    headless,
    slowMo: headless ? 0 : 300,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "en",
  });

  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    // Screenshot 1: initial state (depends on OS preference / localStorage)
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    const initialLabel = await page
      .locator(THEME_TOGGLE)
      .getAttribute("aria-label")
      .catch(() => "");
    await page.screenshot({
      path: path.join(OUT_DIR, "01-initial.png"),
      fullPage: false,
    });
    console.log(
      "Screenshot 1: initial state (dark:",
      hasDark,
      ") aria-label:",
      initialLabel,
    );

    // Click theme toggle
    await page.locator(THEME_TOGGLE).click();
    await page.waitForTimeout(600);

    const afterFirst = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    const labelAfterFirst = await page
      .locator(THEME_TOGGLE)
      .getAttribute("aria-label")
      .catch(() => "");
    await page.screenshot({
      path: path.join(OUT_DIR, "02-after-first-click.png"),
      fullPage: false,
    });
    console.log(
      "Screenshot 2: after first click (dark:",
      afterFirst,
      ") aria-label:",
      labelAfterFirst,
    );

    // Click again
    await page.locator(THEME_TOGGLE).click();
    await page.waitForTimeout(600);

    const afterSecond = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    await page.screenshot({
      path: path.join(OUT_DIR, "03-after-second-click.png"),
      fullPage: false,
    });
    console.log("Screenshot 3: after second click (dark:", afterSecond, ")");

    console.log("\nScreenshots saved to:", OUT_DIR);
    console.log("Theme changed on first click:", hasDark !== afterFirst);
    console.log("Theme restored on second click:", hasDark === afterSecond);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
