# Checking the module

Check the module after every change. Then try it on the running site.

## Running the check

Run `npm install` once in the harness. Then:

```sh
npm run check -- recipe-box
```

This checks the module in `sites/recipe-box/module/`. Without a name, it checks
every site.

The check needs no browser and no server. It finds:

- type errors in the module;
- a site context that `dicta-action-server` would refuse, checked with the
  server's own code;
- a `write`, `destructive` or `external` capability without `confirm`;
- a `confirmOver` that is not a whole number from 0.

It also warns about:

- a type list other than a type and `null` (`writing-capabilities.md`);
- a module that cannot be loaded outside a browser;
- a newer harness. Then ask your agent to update the harness.

An error fails the check. A warning does not, but read it.

## Reading the result

```
recipe-box
  error: recipes.delete: add confirm. A destructive capability needs it: it
  gives the text the user sees before the step runs
  warning: recipes.change: args.planned has the type list ["string","number"].
  Use a type list only for a type or null

1 errors, 1 warnings
```

Each line names the site, the capability and what to fix.

Type errors in your site's own code are only counted, not shown. Your site
builds that code with its own settings.

When the module cannot be loaded outside a browser, the check still checks its
types. This happens when your site's code needs a real browser as soon as it
loads. Try the module on the running site instead.

## The module's settings

Each site's module has a `tsconfig.json` in `sites/<name>/module/`:

```json
{
  "extends": "../../../tsconfig.json",
  "include": ["**/*.ts"]
}
```

It holds the module's own settings, such as an import alias
(`adding-dicta.md`). Commit it.

A path that is different on each machine, such as where your site's code is,
goes into `tsconfig.local.json` next to it. It is never committed. Write it
again on a new machine, from the site's `notes.md`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "paths": { "recipe-box/*": ["/home/maria/work/recipe-box/src/*"] }
  }
}
```

When `tsconfig.local.json` exists, the check uses it.

## Trying it on the running site

The check cannot tell if a capability does the right thing. Only a real request
can. Once the module is in your site (`adding-dicta.md`), try requests in plain
words:

- one for each capability;
- one that clears each value that can be cleared, such as "remove the planned
  date of the lemon cake";
- one that asks about many items, such as "plan every soup for next week".

Write the requests and their results in the site's `notes.md`.
