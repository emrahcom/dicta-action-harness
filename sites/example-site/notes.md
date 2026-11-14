# example-site

Teamboard, a small task list for a team. Example site of dicta.

## Where the site is

- Code: `node_modules/dicta-example-site/` in the harness, a pinned dependency
  of the harness. The developer has no other copy. Read it only.
- Running site: http://localhost:8080/
- Start it: in the site's folder, `npm install`, then `npm start` (builds `web/`
  into `dist/` and serves on port 8080, `PORT` changes it).
- Data is in memory. It goes back to the 3 sample tasks when the server restarts
  or on `POST /api/reset`.

## What the site is

- Two pages: `/` (task list, add form, done checkbox, delete button) and
  `/tasks/<id>` (edit title, due date and assignee, share with a teammate).
- A task: `id`, `title` (1 to 200 chars), `due` (YYYY-MM-DD or null), `done`,
  `assignee` (teammate id or null).
- Teammates are fixed: anna (Anna Weber), ben (Ben Okafor), chen (Chen Li).
- The buttons call `web/actions.ts`, which calls `web/api.ts` (fetch to
  `/api/...`).
- API: `GET /api/tasks?q=` (title search, no limit), `POST /api/tasks`,
  `GET|PATCH|DELETE /api/tasks/<id>`, `POST /api/tasks/<id>/share`
  (`{teammate}`, stands in for an email), `GET /api/teammates`,
  `POST /api/reset`.
- No sign-in. Every visitor can do everything.

## Integration method

Not chosen yet. The developer asked not to integrate the module for now.

In the harness, the module imports the site's code through the alias
`teamboard/*`, mapped to `node_modules/dicta-example-site/web/*` in
`module/tsconfig.json`. The path is the same on every machine, so there is no
`tsconfig.local.json`. The site has no bundler (only `tsc` into `dist/`), so an
alias does not work in the site as it is. Relative imports (`teamboard/api.ts`
-> `./api.ts` when the copy goes into `web/`) or a separate bundle are the
likely choices.

## Module

- Written on 2026-11-07, `npm run check -- example-site`: 0 errors, 0 warnings.
- `tasks.list` returns `{ total, tasks }`, at most 50 tasks, 20 by default, in
  the site's order (oldest first). The site has no other filter.
- Errors from the site's API (such as "no such task") have no code, so the
  client reports them as `capability` with the site's message.
- `tasks.share` confirms with the teammate's name and email address, the address
  the site sends the task to (guide rule "Say where the data goes"). An unknown
  teammate id fails the confirmation with `not_found`, so the user is never
  asked about a recipient that does not exist.
- Reviewed on 2026-11-07 against "Say where the data goes": `tasks.share` showed
  only the name; changed as above. `npm run check -- example-site`: 0 errors, 0
  warnings.

## Capabilities

Approved by the developer on 2026-11-07:

| Name             | Level           | Calls                                                                        |
| ---------------- | --------------- | ---------------------------------------------------------------------------- |
| `teammates.list` | read            | `api.listTeammates`, without emails                                          |
| `tasks.list`     | read            | `api.listTasks(q)`, with a limit, assignee name added                        |
| `tasks.get`      | read            | `api.getTask`, assignee name added                                           |
| `tasks.create`   | write           | `actions.addTask`                                                            |
| `tasks.change`   | write           | `actions.updateTask` (title, due, assignee; due and assignee can be cleared) |
| `tasks.setDone`  | write           | `actions.setDone`                                                            |
| `tasks.delete`   | destructive     | `actions.deleteTask`                                                         |
| `tasks.share`    | external        | `actions.shareTask`, confirm shows the email address                         |
| `tasks.open`     | write, pageLoad | `actions.openTask`                                                           |

Plus `dictaCapabilities`. State: `{ page: "list" }` or `{ page: "task", id }`,
from `location.pathname`.

Left out: `POST /api/reset` (no button calls it, and it wipes all data).

## Problems for the developer

1. No sign-in and no rights checks in the API. Anyone who reaches the site can
   change or delete every task. dicta adds no risk of its own here, but the rule
   "the user's rights" means nothing on this site.
2. `POST /api/reset` is open to everyone and wipes all tasks.
3. `GET /api/tasks` has no limit and no filter other than the title search. The
   module cuts the list itself.
4. The page does not reload after a capability changes a task. The list page
   keeps showing old data until it loads again. Decided with the developer on
   2026-11-07: leave it. A reload after each change would cut multi-step plans
   short. The user loads the page again to see the result.
