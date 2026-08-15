import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const roots = ["apps", "packages"];
const sourceExtensions = new Set([".ts", ".tsx"]);
const ignored = new Set(["node_modules", ".next", ".turbo", "dist", "coverage"]);
const violations = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (sourceExtensions.has(extname(entry.name))) inspect(file);
  }
}

function inspect(file) {
  const source = readFileSync(file, "utf8");
  if (/type\s*=\s*["'](?:date|datetime-local)["']/.test(source)) {
    violations.push(`${file}: native date/datetime-local input`);
  }
  if (!file.includes("packages/datetime/") && !file.endsWith("apps/web/lib/datetime.ts") && source.includes("Intl.DateTimeFormat")) {
    violations.push(`${file}: direct Intl.DateTimeFormat outside centralized datetime modules`);
  }
}

for (const root of roots) walk(root);
if (violations.length) {
  console.error("Jalali date policy violations:\n" + violations.join("\n"));
  process.exit(1);
}
console.log("Jalali date policy audit passed.");
