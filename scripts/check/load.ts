// Loads one site's module outside a browser, with a DOM stand-in, and checks
// what the types cannot: the site context and the module rules. index.ts runs
// it in its own process for each site, with that site's tsconfig, and reads
// the result from the last line it prints.

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { pathToFileURL } from "node:url";
import type { SiteContext } from "dicta-action-js";

// The same as the MARK in index.ts.
const MARK = "dicta-check-result:";
// The most bytes of a site context (contract-protocol.md in
// dicta-action-server, Limits).
const MAX_CONTEXT = 64 * 1024;

type Result = { errors: string[]; warnings: string[]; notLoaded?: string };
type Schema = { type?: unknown; properties?: unknown; items?: unknown };
type Capability = {
  level?: unknown;
  confirm?: unknown;
  args?: unknown;
  output?: unknown;
};

function finish(result: Result): never {
  console.log(MARK + JSON.stringify(result));
  process.exit(0);
}

function firstLine(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  return text.split("\n")[0];
}

// Type lists other than a type and null, anywhere in a schema.
function typeLists(schema: unknown, path: string, found: string[]) {
  if (typeof schema !== "object" || schema === null) return;
  const { type, properties, items } = schema as Schema;
  if (Array.isArray(type)) {
    const others = type.filter((t) => t !== "null");
    if (type.length !== 2 || others.length !== 1) {
      found.push(`${path} has the type list ${JSON.stringify(type)}`);
    }
  }
  if (typeof properties === "object" && properties !== null) {
    for (const [name, value] of Object.entries(properties)) {
      typeLists(value, `${path}.${name}`, found);
    }
  }
  typeLists(items, `${path}[]`, found);
}

// The site context: built as the client builds it, within the size limit
// and valid for the server.
function checkSiteContext(
  build: () => SiteContext,
  check: (context: SiteContext) => void,
  result: Result,
) {
  try {
    const context = build();
    const size = Buffer.byteLength(JSON.stringify(context), "utf8");
    if (size > MAX_CONTEXT) {
      result.errors.push(
        `the site context is ${Math.ceil(size / 1024)} KB, more than ${MAX_CONTEXT / 1024} KB. ` +
          "Shorten site.desc and the capabilities' desc",
      );
    }
    try {
      check(context);
    } catch (error) {
      // The server's error names a capability by its place in the list; name
      // it as the module does.
      const text = firstLine(error).replace(
        /context\.capabilities\[(\d+)\]/,
        (all, i) => context.capabilities[Number(i)]?.name ?? all,
      );
      result.errors.push(`the site context is not valid: ${text}`);
    }
  } catch (error) {
    result.errors.push(
      `the site context could not be built: ${firstLine(error)}`,
    );
  }
}

// The capabilities: confirm where the level needs it, and type lists.
function checkCapabilities(capabilities: unknown, result: Result) {
  if (typeof capabilities !== "object" || capabilities === null) return;
  for (const [name, capability] of Object.entries(capabilities)) {
    const { level, confirm, args, output } = capability as Capability;
    const asks = ["write", "destructive", "external"].includes(String(level));
    if (asks && typeof confirm !== "function") {
      result.errors.push(
        `${name}: add confirm. A ${String(level)} capability needs it: ` +
          "it gives the text the user sees before the step runs",
      );
    }
    const lists: string[] = [];
    typeLists(args, "args", lists);
    typeLists(output, "output", lists);
    for (const list of lists) {
      result.warnings.push(
        `${name}: ${list}. Use a type list only for a type or null`,
      );
    }
  }
}

GlobalRegistrator.register({ url: "http://localhost/" });

const file = process.argv[2];
const result: Result = { errors: [], warnings: [] };

// Imported after the DOM stand-in, since importing dicta-action-js defines
// its element.
let module;
let buildContext;
let checkContext;
try {
  ({ buildContext } = await import("dicta-action-js"));
  ({ checkContext } = await import("dicta-action-server/src/context.ts"));
  module = (await import(pathToFileURL(file).href)).default;
} catch (error) {
  finish({ ...result, notLoaded: firstLine(error) });
}

if (typeof module !== "object" || module === null) {
  result.errors.push("module/index.ts has no default export with the module");
  finish(result);
}

checkSiteContext(() => buildContext(module), checkContext, result);

const { confirmOver, capabilities } = module;
if (
  confirmOver !== undefined &&
  !(Number.isInteger(confirmOver) && confirmOver >= 0)
) {
  result.errors.push("confirmOver must be a whole number from 0");
}

checkCapabilities(capabilities, result);

finish(result);
