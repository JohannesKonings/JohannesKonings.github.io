#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE_HOOKS_DIR = path.join(ROOT, ".githooks");
const MANAGED_MARKER = "@johanneskonings-pre-commit-hook";

function resolveHooksDirectory() {
  let configuredHooksPath = "";

  try {
    configuredHooksPath = execSync("git config --get core.hooksPath", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return path.join(ROOT, ".git/hooks");
  }

  if (!configuredHooksPath) {
    return path.join(ROOT, ".git/hooks");
  }

  const activeHooksPath = path.isAbsolute(configuredHooksPath)
    ? configuredHooksPath
    : path.join(ROOT, configuredHooksPath);

  const cursorOriginalHooksPathFile = path.join(activeHooksPath, ".cursor-original-hooks-path");
  if (!fs.existsSync(cursorOriginalHooksPathFile)) {
    return activeHooksPath;
  }

  const originalHooksPath = fs.readFileSync(cursorOriginalHooksPathFile, "utf8").trim();
  return path.isAbsolute(originalHooksPath)
    ? originalHooksPath
    : path.join(ROOT, originalHooksPath);
}

function installHook(hookName: string, hooksDirectory: string) {
  const sourcePath = path.join(SOURCE_HOOKS_DIR, hookName);
  const targetPath = path.join(hooksDirectory, hookName);
  const sourceContent = fs.readFileSync(sourcePath, "utf8");

  fs.mkdirSync(hooksDirectory, { recursive: true });

  if (fs.existsSync(targetPath)) {
    const existingContent = fs.readFileSync(targetPath, "utf8");
    if (!existingContent.includes(MANAGED_MARKER) && existingContent !== sourceContent) {
      console.warn(`[hooks] Skipping ${hookName}: existing unmanaged hook at ${targetPath}`);
      return;
    }
  }

  fs.writeFileSync(targetPath, sourceContent);
  fs.chmodSync(targetPath, 0o755);
  console.log(`[hooks] Installed ${hookName} -> ${targetPath}`);
}

function main() {
  const hooksDirectory = resolveHooksDirectory();
  installHook("pre-commit", hooksDirectory);
}

main();
