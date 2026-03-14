import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const configPath = path.join(ROOT, ".lighthouserc.json");

test("LHCI collect config keeps Chrome flags under settings", () => {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  assert.equal(config.ci.collect.chromeFlags, undefined);
  assert.match(config.ci.collect.settings.chromeFlags, /--no-sandbox/);
});
