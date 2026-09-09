#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`chatgpt-subagent\n\nUsage:\n  chatgpt-subagent install [--global] [--force] [--dry-run]\n\nOptions:\n  --global   Install to ~/.agents/skills/subagent\n  --force    Replace an existing installation\n  --dry-run  Show the target path without writing files\n  --help     Show this help message\n`);
}

if (!command || command === "--help" || command === "-h" || args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (command !== "install") {
  console.error(`Unknown command: ${command}\n`);
  printHelp();
  process.exit(1);
}

const globalInstall = args.includes("--global");
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");
const knownOptions = new Set(["install", "--global", "--force", "--dry-run", "--help", "-h"]);
const unknown = args.filter((arg) => !knownOptions.has(arg));

if (unknown.length > 0) {
  console.error(`Unknown option: ${unknown.join(", ")}`);
  process.exit(1);
}

const binDir = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(binDir, "..", "subagent");
const target = globalInstall
  ? path.join(os.homedir(), ".agents", "skills", "subagent")
  : path.join(process.cwd(), ".agents", "skills", "subagent");

if (!fs.existsSync(source)) {
  console.error(`Bundled skill directory not found: ${source}`);
  process.exit(1);
}

console.log(`Installing chatgpt-subagent`);
console.log(`  source: ${source}`);
console.log(`  target: ${target}`);

if (dryRun) {
  console.log("Dry run only. No files were changed.");
  process.exit(0);
}

if (fs.existsSync(target)) {
  if (!force) {
    console.error(`Target already exists: ${target}`);
    console.error("Re-run with --force to replace it.");
    process.exit(1);
  }
  fs.rmSync(target, { recursive: true, force: true });
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(source, target, { recursive: true });

console.log(`Installed successfully to ${target}`);
