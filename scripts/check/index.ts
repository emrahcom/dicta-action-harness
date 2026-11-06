// The harness check (docs/checking-the-module.md). `npm run check -- <name>`
// checks the module of one site; `npm run check` checks every site. It runs in
// Node, never in a browser.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const MARK = "dicta-check-result:";
const root = process.cwd();
const sitesDir = join(root, "sites");
const bin = (name: string) => join(root, "node_modules", ".bin", name);

type Result = { errors: string[]; warnings: string[]; notes: string[] };

function run(command: string, args: string[]) {
  return spawnSync(command, args, { cwd: root, encoding: "utf8" });
}

// A newer harness on upstream/main. Skipped without git, without the remote
// or offline.
function newerHarness() {
  if (run("git", ["remote", "get-url", "upstream"]).status !== 0) return false;
  const fetch = spawnSync("git", ["fetch", "--quiet", "upstream", "main"], {
    cwd: root,
    timeout: 15000,
  });
  if (fetch.status !== 0) return false;
  const count = run("git", ["rev-list", "--count", "HEAD..upstream/main"]);
  return count.status === 0 && Number(count.stdout.trim()) > 0;
}

// Type errors in the module's own files. Errors in the site's code are only
// counted: the site builds it with its own settings.
function typeCheck(tsconfig: string, moduleDir: string, result: Result) {
  const tsc = run(bin("tsc"), ["-p", tsconfig, "--pretty", "false"]);
  let others = 0;
  for (const line of tsc.stdout.split("\n")) {
    const match = /^(.+?)\(\d+,\d+\): error /.exec(line);
    if (!match) continue;
    if (resolve(root, match[1]).startsWith(moduleDir + sep)) {
      result.errors.push(`type error: ${line}`);
    } else {
      others += 1;
    }
  }
  if (others > 0) {
    result.notes.push(
      `${others} type errors in the site's own code were not counted`,
    );
  }
  if (tsc.status !== 0 && tsc.stdout.trim() === "") {
    result.errors.push(`the type check did not run: ${tsc.stderr.trim()}`);
  }
}

function load(tsconfig: string, index: string, result: Result) {
  const child = run(bin("tsx"), [
    "--tsconfig",
    tsconfig,
    join(root, "scripts", "check", "load.ts"),
    index,
  ]);
  const line = child.stdout
    .split("\n")
    .reverse()
    .find((text) => text.startsWith(MARK));
  if (!line) {
    const reason = child.stderr.trim().split("\n")[0] || "no result";
    result.errors.push(`the check could not run on the module: ${reason}`);
    return;
  }
  const loaded = JSON.parse(line.slice(MARK.length)) as {
    errors: string[];
    warnings: string[];
    notLoaded?: string;
  };
  result.errors.push(...loaded.errors);
  result.warnings.push(...loaded.warnings);
  if (loaded.notLoaded !== undefined) {
    result.warnings.push(
      "the module could not be loaded outside a browser, so only its types " +
        `were checked. Try it on the running site. Reason: ${loaded.notLoaded}`,
    );
  }
}

function checkSite(name: string): Result {
  const result: Result = { errors: [], warnings: [], notes: [] };
  const moduleDir = join(sitesDir, name, "module");
  const index = join(moduleDir, "index.ts");
  const local = join(moduleDir, "tsconfig.local.json");
  const shared = join(moduleDir, "tsconfig.json");
  if (!existsSync(index)) {
    result.errors.push(`${relative(root, index)} is missing`);
    return result;
  }
  if (!existsSync(shared)) {
    result.errors.push(`${relative(root, shared)} is missing`);
    return result;
  }
  const tsconfig = existsSync(local) ? local : shared;
  typeCheck(tsconfig, moduleDir, result);
  load(tsconfig, index, result);
  return result;
}

function siteNames() {
  const named = process.argv[2];
  if (named !== undefined) return [named];
  if (!existsSync(sitesDir)) return [];
  return readdirSync(sitesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

let errors = 0;
let warnings = 0;

if (newerHarness()) {
  warnings += 1;
  console.log(
    "warning: a newer harness is available. Ask your agent to update the " +
      "harness.\n",
  );
}

const names = siteNames();
if (names.length === 0) {
  console.log("No sites yet. Each site has a folder in sites/.");
}
for (const name of names) {
  if (!existsSync(join(sitesDir, name))) {
    console.log(`${name}\n  error: there is no folder sites/${name}\n`);
    errors += 1;
    continue;
  }
  const result = checkSite(name);
  console.log(name);
  for (const text of result.errors) console.log(`  error: ${text}`);
  for (const text of result.warnings) console.log(`  warning: ${text}`);
  for (const text of result.notes) console.log(`  note: ${text}`);
  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log("  ok");
  }
  console.log("");
  errors += result.errors.length;
  warnings += result.warnings.length;
}

console.log(`${errors} errors, ${warnings} warnings`);
process.exitCode = errors > 0 ? 1 : 0;
