#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgJsonPath = resolve(__dirname, "../package.json");
const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));

const name = String(pkg.name ?? "app").replace(/[^a-zA-Z0-9._-]/g, "-");
const version = String(pkg.version ?? "0.0.0");

const distDir = resolve(__dirname, "../dist");
const releaseDir = resolve(__dirname, "../release");
const outZip = resolve(releaseDir, `${name}-${version}.zip`);

if (!existsSync(distDir)) {
  console.error("Error: dist/ directory not found. Run `npm run build` first.");
  process.exit(1);
}

if (!existsSync(releaseDir)) {
  mkdirSync(releaseDir, { recursive: true });
}

console.log(`Packaging release archive: ${outZip}`);

try {
  // Zip the contents of dist/ (not the dist directory itself)
  execSync(`zip -r -q ${JSON.stringify(outZip)} .`, {
    cwd: distDir,
    stdio: "inherit",
  });
  console.log("Release archive created:", outZip);
} catch (err) {
  console.error("Failed to create zip archive. Is `zip` installed and available on your PATH?");
  console.error(err);
  process.exit(1);
}
