# dicta-action-harness

This folder is a harness for building the dicta action layer of a web site. You
are the developer's agent. Your job is to write the site's capability module:
the file that tells the dicta planner what it can do on the site, and how, with
the site's own code or its own requests.

Read `docs/getting-started.md` first.

## Where your work goes

Each site has its own folder, `sites/<name>/`, such as `sites/recipe-box/`.
Work on the site the developer names. Everything you make for it goes into its
folder, and nowhere else in the harness:

- `sites/<name>/module/`: the module, with its main file
  `sites/<name>/module/index.ts`. This is the only place where you change it.
- `sites/<name>/notes.md`: what you learned about the site and what you decided
  with the developer.

If the site's folder exists, read its `notes.md` before anything else. If it
does not, it is a new site: ask the developer for a short name, where the
site's code is, or only where the running site is, and how to start it for
tests. Then create the folder with its `notes.md`, and `module/tsconfig.json`
as `docs/checking-the-module.md` shows. A path that differs from machine to
machine goes into `module/tsconfig.local.json`, never committed; on a new
machine, write it again from `notes.md`.

Keep the site's `notes.md` up to date as you work, so another session or
another developer goes on from the same point. It holds:

- where the site's code or the running site is, and how to start it;
- the integration method, once chosen;
- the capability list the developer approved;
- the problems you listed for the developer;
- the requests you tried, and their results.

## Workflow

1. Study the site. With its code, read its pages, its API and the functions its
   buttons call. Without it, use the running site: its pages and the requests
   they send. Find how a user signs in and what a user can do.
2. List what users can do on the site, as capabilities, each with its level.
   Show the list to the developer before you go on.
3. Write the module in `sites/<name>/module/`. Follow
   `docs/writing-capabilities.md`.
4. Run `npm run check -- <name>` and fix every error. Read every warning
   (`docs/checking-the-module.md`).
5. Integrate the module into the site only when the developer asks. Otherwise
   give them the steps in `docs/adding-dicta.md` for their site. Choose the
   integration method with the developer, and write it in the site's
   `notes.md`.
6. Try it on the running site, once the module is in it. Try requests in plain
   words for each capability, and a request that clears each value that can be
   cleared.

## Updating the harness

When the developer asks you to update the harness:

1. Merge `upstream/main`, the original harness, into the current branch.
2. Run `npm install`, then `npm run check` on every site.
3. Review every site's module against the updated guides.
4. Report what you found for each site. Change a module only when the developer
   agrees.

`docs/upgrading.md` tells the developer what comes next for sites in
production.

## Rules

- Each capability calls the site's own code, or sends the site's own requests,
  with the user's rights. Never go around the site's checks, and never change
  them for dicta.
- Do not change the site's code, except to integrate the module when the
  developer asks. List any problem you find for the developer instead of fixing
  it.
- Never change the copy of the module in the site. Change
  `sites/<name>/module/`, and copy it again.
- Do not change the harness's own files. Your work goes only into the sites'
  folders.
- Never put secrets, such as API keys, in the module or the site's frontend.
