# Writing capabilities

The capability module tells the planner what it can do on your site. The
planner sees only the module's descriptions and schemas. It never sees your
code or your pages. So a good module is clear, small and close to what users
do.

The examples use a made-up site, Recipe Box, where users keep recipes and plan
meals.

## The module

The module is in `sites/<name>/module/`, in your copy of the harness. Its main
file is `sites/<name>/module/index.ts`. Its default export is one object:

```ts
import { type CapabilityModule, dictaCapabilities } from "dicta-action-js";
import { getRecipe, listRecipes, updateRecipe } from "recipe-box/api";

const recipeBox: CapabilityModule = {
  site: {
    name: "Recipe Box",
    desc:
      "Users keep recipes and plan meals. " +
      "A recipe has a title, an author and an optional planned date.",
  },
  state: {
    desc: 'The open page: "list" or "recipe", with the recipe\'s id.',
    run: async () => ({ page: "list" }),
  },
  capabilities: {
    ...dictaCapabilities,
    // Your capabilities.
  },
};

export default recipeBox;
```

- `site.desc`: what the planner needs to know beyond the capabilities: what the
  site is for, its main things and its words. Keep it short. The planner reads
  it every time it plans.
- `state.run`: what the page shows now, as a small object, such as the open
  page and the selected items. `state.desc` says what its fields mean.
- `dictaCapabilities`: capabilities that `dicta-action-js` brings, such as the
  history of earlier requests. Always add them.
- `confirmOver`: optional. How many items one plan may change before the user
  is asked. The default is 10.

## How the module reaches your site

There are two ways. Choose by what the agent can use.

With the site's code, the module calls your site's own functions, the ones
your pages call. The example above imports them from `recipe-box/api`. That
name is an import alias: a setting maps it to your site's code, both here and
in your site (`adding-dicta.md`). The module file stays the same in both
places.

With only a running site, such as a test environment, the module sends the
same HTTP requests your pages send, with `fetch`:

```ts
run: async ({ id, date }: PlanArgs) => {
  const response = await fetch(`/api/recipes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planned: date }),
  });
  if (!response.ok) throw new Error("The recipe was not changed");
},
```

The browser sends the user's session cookie, so the site checks the user's
rights as usual. But the page does not know about the change. It shows the old
data until it loads again. Make sure the developer knows this. A capability
may end with a page load (Mark page loads), so the user sees the change.

## A capability

```ts
// The arguments, as `args` describes them.
type PlanArgs = { id: string; date: string };

"recipes.plan": {
  level: "write",
  desc: "Plans a recipe for a date.",
  args: {
    type: "object",
    properties: {
      id: { type: "string", description: "The recipe's id" },
      date: { type: "string", description: "Date, YYYY-MM-DD" },
    },
    required: ["id", "date"],
  },
  confirm: async ({ id, date }: PlanArgs) =>
    `Plan "${(await getRecipe(id)).title}" for ${date}`,
  run: async ({ id, date }: PlanArgs) => {
    await updateRecipe(id, { planned: date });
  },
},
```

- The name is a group and an action, such as `recipes.plan`. The `dicta` group
  is taken.
- `level` says how risky it is:
  - `read`: changes nothing.
  - `write`: changes the user's data or the page.
  - `destructive`: deletes or overwrites what is hard to get back.
  - `external`: sends data out of the site or reaches other people, such as
    sharing, inviting, sending a message or paying.
- `desc`: one or two sentences: what it does and when to use it.
- `args` and `output`: JSON Schemas. Use only `type`, `properties`, `required`,
  `items`, `enum` and `description`.
- `run`: does the work and returns what the planner needs. The browser checks
  the arguments against `args` before it calls `run`, so `run` can name their
  type, as `PlanArgs` above.
- `confirm`: required for `write`, `destructive` and `external`. It returns a
  short text that names the action and what it acts on. The browser shows it
  when it asks the user. It may read data, but it never changes anything.

A capability that fails throws an error. Give the error a `code`, such as
`not_found`, and a short message without secrets.

## Rules

### Work like the user

Make capabilities for the actions your users do, such as "plan a recipe" or
"share a recipe". Call the same code your buttons call, so your site's checks
and rights apply. Never go around them.

A plan cannot compute anything: it has no arithmetic and no expressions. So a
capability takes the values a user would give, such as a date, not values the
planner has to work out from other data.

### Keep capabilities narrow

One capability does one kind of action. Then `confirm` can say exactly what
will happen, such as `Delete "Lemon cake"`. A wide capability, such as one
`recipes.change` for every kind of change, makes confirmations vague.

### Return names, not only ids

When an output refers to a person or a thing, return its name next to its id.
The planner tells the user about it, and the user knows names, not ids.

```ts
// Good: the planner can say "Lemon cake, by Maria".
{ id: "r7", title: "Lemon cake", author: { id: "u3", name: "Maria" } }

// Not enough: the planner may say "by u3".
{ id: "r7", title: "Lemon cake", author: "u3" }
```

In `confirm`, read the names too, so the user sees "Lemon cake", not "r7".

### Mark page loads

A capability that may load a new page has `pageLoad: true`. Its `desc` says so,
so the planner puts it last:

```ts
"recipes.open": {
  level: "write",
  desc: "Opens a recipe's page. Loads a page; the steps after it do not run.",
  pageLoad: true,
  args: {
    type: "object",
    properties: { id: { type: "string", description: "The recipe's id" } },
    required: ["id"],
  },
  confirm: async ({ id }: { id: string }) =>
    `Open "${(await getRecipe(id)).title}"`,
  run: async ({ id }: { id: string }) => {
    location.href = `/recipes/${id}`;
  },
},
```

- Loading the page is the last thing `run` does. Do not `await` anything after
  it.
- A page load stays on your site's own origin.
- A capability with `pageLoad` does not start downloads. Put a download in a
  capability without `pageLoad`.

### Keep state and outputs small

The outputs the planner reads share 16 KB per plan. The state has at most 16
KB too. Return only what a planner needs, such as ids, names and dates, not
whole records.

### Filter long lists

A list can grow, such as all recipes of a user. Then the list capability takes
the filters your site's own list offers, such as a search text, a status or a
date range, and a limit. Its `desc` says how many items it returns at most:

```ts
"recipes.list": {
  level: "read",
  desc:
    "Lists recipes, newest first, at most 50. " +
    "Filters by a search text in the title or by planned dates.",
  args: {
    type: "object",
    properties: {
      search: { type: "string" },
      plannedFrom: { type: "string", description: "Date, YYYY-MM-DD" },
      plannedTo: { type: "string", description: "Date, YYYY-MM-DD" },
      limit: { type: "number", description: "At most 50, 20 by default" },
    },
  },
  // ...
},
```

Two limits make this matter:

- The outputs the planner reads share 16 KB per plan.
- A plan can run a step for each item of a list of at most 100 items. With a
  longer list, the request stops.

With filters, "plan every soup for next week" reads only the soups.

### Bulk actions only when your site has them

Some sites have a bulk action, such as "select all, delete" or "clear the
board". Make it a capability, like any other user action. Its `confirm` says
how many items it acts on.

If your site has no bulk action, do not make one. A plan runs the single
action for each item, and the user is asked first when there are many. Never
write a capability whose `run` loops over a single action, such as
`recipes.deleteMany`. When item 7 of 30 fails, the planner cannot tell which
items were done, and the checks for many items do not apply.

### Values that can be cleared

Some values can be empty, such as a recipe's planned date. Give such an
argument the type list `["<type>", "null"]`, so a plan can clear it:

```ts
type ChangeArgs = { id: string; title?: string; planned?: string | null };

"recipes.change": {
  level: "write",
  desc: "Changes a recipe's title or planned date, or removes the date.",
  args: {
    type: "object",
    properties: {
      id: { type: "string", description: "The recipe's id" },
      title: { type: "string" },
      planned: {
        type: ["string", "null"],
        description: "Date, YYYY-MM-DD, or null to remove it",
      },
    },
    required: ["id"],
  },
  confirm: async ({ id }: ChangeArgs) =>
    `Change "${(await getRecipe(id)).title}"`,
  run: async ({ id, ...changes }: ChangeArgs) => {
    await updateRecipe(id, changes);
  },
},
```

In `run`, each such argument has three cases:

- Left out: change nothing.
- `null`: clear the value, the way your site does it. Find what your site's
  "remove" button calls, and do the same.
- Any other value: set it.

Take care that a missing argument does not turn into `undefined` or `null` on
its way to your site's code. Pass on only the arguments the plan gave, as the
example does with `...changes`.

An output field that can be empty gets the same type list, such as
`planned: { type: ["string", "null"] }`, so the planner knows it can be `null`.

Use type lists only for "a type or `null`". When you try the module, also try a
request that clears each value that can be cleared, such as "remove the
planned date of the lemon cake".
