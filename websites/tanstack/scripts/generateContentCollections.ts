/**
 * Generates Content Collections output for type-checking and builds.
 * Run after sync so src/content is populated.
 */
import { createBuilder } from "@content-collections/core";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, "content-collections.ts");

const builder = await createBuilder(configPath);
await builder.build();
