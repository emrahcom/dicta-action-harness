# Writing capabilities

The capability module tells the planner what it can do on your site. The
planner sees only the module's descriptions and schemas. It never sees your
code or your pages. So a good module is clear, small and close to what users
do.

The examples use a made-up site, Recipe Box, where users keep recipes and plan
meals.

## The full rules

This guide teaches what a module needs. The full rules are in the contracts of
the version of
[`dicta-action-server`](https://github.com/emrahcom/dicta-action-server) this
harness uses. After `npm install`, they are in
`node_modules/dicta-action-server/specs/`:

- `contract-capability.md`: the module and its capabilities.
- `contract-context.md`: what the planner sees of the module.
- `contract-plan.md`: plans, confirmations and the limits of a plan.
- `contract-protocol.md` (Limits): the limits of the state, the context and the
  outputs.

When this guide and a contract differ, the contract is right.

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
- `dictaCapabilities`: capabilities that
  [`dicta-action-js`](https://github.com/emrahcom/dicta-action-js) brings, such
  as the history of earlier requests. Always add them.
- `confirmOver`: optional, a whole number, 10 by default. The most items of one
  list, or steps calling the same `write` capability, that run without asking
  the user. With more, the user is asked once, before any of them runs. With 0,
  every change asks. `destructive` and `external` capabilities always ask.

## How the module calls your site

There are two ways. Choose by what the agent can use.

With the site's code, the module calls your site's own functions, the ones
your pages call. The example above imports them from `recipe-box/api`, an
import alias: a setting maps that name to your site's code. An alias is one way
to bring the module into your site. Choose the way with the developer
([`adding-dicta.md`](adding-dicta.md)).

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
data until it loads again. Make sure the developer knows this. A capability may
end with a page load ([Mark page loads](#mark-page-loads)), so the user sees the
change.

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
  - `write`: changes the user's data or the page. A change that others see in
    the site, such as a task on a team's board, is `write` too.
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

### Wait until the change is saved

Many sites change the page at once and save the change to their server in the
background, a moment later. Their functions return before the save is done. A
person clicks a few seconds apart, so each save finishes in time. A plan runs
its next step within milliseconds. Then two quick changes can overwrite each
other, or the server's copy of a new item can replace a change made right after
it. The report still says the step succeeded, and the page may look right until
it reloads.

So a capability that changes stored data returns only when the site has saved
the change. Wait for what your site offers: the promise of the save request, a
"saved" event, or the server's copy of a new item. Never wait a fixed time. If
your site offers no way to know, tell the developer. Tell them too when your
site saves only after a long delay, so each step would wait long: they may know
a way to save at once.

```ts
run: async ({ id, column }: MoveArgs) => {
  board.moveCard(id, column); // changes the page, saves later
  await board.whenSaved(); // returns when the server has the change
},
```

A site whose functions return only after the server answers, such as one that
awaits its `fetch` call, needs nothing more.

### Leave the page as your site does

The next request reads the page through `state`. So after a change, the page
looks as your site's own action leaves it. For example, if your site selects a
new item when a user makes it, the capability selects it too. Then "make it
blue" finds the new item in the state.

Copy only what the action itself does:

- Not what a user does before it. A user selects an item to rename it, but a
  capability that renames it leaves the selection as it was.
- Not a page load or a change of view, such as opening the new item's page or
  scrolling to it. A page load stops the rest of a plan, and a moving view
  pulls the user away while the plan runs.

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

### Say where the data goes

An `external` capability sends data out of the site. Its `confirm` says where
the data goes, so the user can check it before it leaves. Use a short form the
user knows, such as an email address or the name of a service. Never show a
long link, a token or other text the user cannot read.

```ts
// Good: the user sees who gets it.
confirm: async ({ id, member }: ShareArgs) => {
  const person = await getMember(member);
  const recipe = await getRecipe(id);
  return `Share "${recipe.title}" with ${person.name} (${person.email})`;
},

// Good: the service by its name, not the address it posts to.
confirm: async ({ id }: PostArgs) =>
  `Post "${(await getRecipe(id)).title}" to Slack`,
```

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

The module's descriptions and schemas go to the planner in every round, at most
64 KB in all. Keep `site.desc` and each `desc` short.

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
  longer list, the step fails before any item runs, and the planner must find
  a shorter list.

With filters, "plan every soup for next week" reads only the soups.

### Bulk actions only when your site has them

Some sites have a bulk action, such as "select all, delete" or "clear the
board". Make it a capability, like any other user action. Its `confirm` says
how many items it acts on.

If your site has no bulk action, do not make one. A plan runs the single
action for each item, and the user is asked first when there are many. Never
write a capability whose `run` loops over a single action, such as
`recipes.deleteMany`. When item 7 of 30 fails, the planner cannot tell which
items were done, and the user is not asked before many items change.

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
