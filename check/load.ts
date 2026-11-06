// Loads one site's module outside a browser, with a DOM stand-in, and checks
// what the types cannot: the site context and the module rules. index.ts runs
// it in its own process for each site, with that site's tsconfig, and reads
// the result from the last line it prints.

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { pathToFileURL } from "node:url";

const MARK = "dicta-check-result:";
// The most bytes of a site context (contract-protocol.md in
// dicta-action-server, Limits).
const MAX_CONTEXT = 64 * 1024;

type Result = { errors: string[]; warnings: string[]; notLoaded?: string };
type Schema = { type?: unknown; properties?: unknown; items?: unknown };

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

GlobalRegistrator.register({ url: "http://localhost/" });

const file = process.argv[2];
const errors: string[] = [];
const warnings: string[] = [];

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
  finish({ errors, warnings, notLoaded: firstLine(error) });
}

if (typeof module !== "object" || module === null) {
  finish({
    errors: ["module/index.ts has no default export with the module"],
    warnings,
  });
}

// The server's error names a capability by its place in the list; name it
// as the module does.
try {
  const context = buildContext(module);
  const size = Buffer.byteLength(JSON.stringify(context), "utf8");
  if (size > MAX_CONTEXT) {
    errors.push(
      `the site context is ${Math.ceil(size / 1024)} KB, more than 64 KB. ` +
        "Shorten site.desc and the capabilities' desc",
    );
  }
  try {
    checkContext(context);
  } catch (error) {
    const text = firstLine(error).replace(
      /context\.capabilities\[(\d+)\]/,
      (all, i) => context.capabilities[Number(i)]?.name ?? all,
    );
    errors.push(`the site context is not valid: ${text}`);
  }
} catch (error) {
  errors.push(`the site context could not be built: ${firstLine(error)}`);
}

const { confirmOver, capabilities } = module;
if (
  confirmOver !== undefined &&
  !(Number.isInteger(confirmOver) && confirmOver >= 0)
) {
  errors.push("confirmOver must be a whole number from 0");
}

if (typeof capabilities === "object" && capabilities !== null) {
  for (const [name, capability] of Object.entries(capabilities)) {
    const { level, confirm, args, output } = capability as {
      level?: unknown;
      confirm?: unknown;
      args?: unknown;
      output?: unknown;
    };
    const asks = ["write", "destructive", "external"].includes(String(level));
    if (asks && typeof confirm !== "function") {
      errors.push(
        `${name}: add confirm. A ${String(level)} capability needs it: ` +
          "it gives the text the user sees before the step runs",
      );
    }
    const lists: string[] = [];
    typeLists(args, "args", lists);
    typeLists(output, "output", lists);
    for (const list of lists) {
      warnings.push(
        `${name}: ${list}. Use a type list only for a type or null`,
      );
    }
  }
}

finish({ errors, warnings });
