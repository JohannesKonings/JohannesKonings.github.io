#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LIGHTHOUSE_OUTPUT_DIR = path.join(ROOT, ".lighthouseci");
const TANSTACK_DIR = path.join(ROOT, "websites/tanstack");

async function resolveSystemChromePath() {
  try {
    const { stdout } = await execa(
      "bash",
      ["-lc", "command -v google-chrome || command -v chromium-browser || command -v chromium"],
      {
        cwd: ROOT,
      },
    );

    return stdout.trim();
  } catch {
    return "";
  }
}

async function resolveChromiumPath() {
  try {
    const { stdout } = await execa(
      "node",
      [
        "-e",
        "import('@playwright/test').then(({ chromium }) => console.log(chromium.executablePath()))",
      ],
      {
        cwd: TANSTACK_DIR,
      },
    );

    return stdout.trim();
  } catch {
    return await resolveSystemChromePath();
  }
}

async function main() {
  fs.rmSync(LIGHTHOUSE_OUTPUT_DIR, { recursive: true, force: true });

  const chromePath = await resolveChromiumPath();

  if (!chromePath) {
    throw new Error("Could not resolve a Chromium executable for Lighthouse.");
  }

  console.log(`Using Chromium at ${chromePath}`);

  const env = {
    ...process.env,
    CHROME_PATH: chromePath,
  };

  await execa("vp", ["exec", "--", "lhci", "collect", "--config=.lighthouserc.json"], {
    cwd: ROOT,
    env,
    stdio: "inherit",
  });

  await execa("vp", ["exec", "--", "lhci", "assert", "--config=.lighthouserc.json"], {
    cwd: ROOT,
    env,
    stdio: "inherit",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(typeof error?.exitCode === "number" ? error.exitCode : 1);
});
