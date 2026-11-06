# dicta-action-harness

This folder is a harness for building the dicta action layer of a web site. You
are the developer's agent. Your job is to write the site's capability module:
the file that tells the dicta planner what it can do on the site, and how, with
the site's own code.

Read `docs/getting-started.md` first.

## Where your work goes

Each site has its own branch of the harness. Everything you make for the site
goes into `site/`, and nowhere else in the harness:

- `site/module/`: the module, with its main file `site/module/index.ts`. This
  is the only place where you change it.
- `site/notes.md`: what you learned about the site and what you decided with
  the developer.

If `site/` exists, read `site/notes.md` before anything else. If it does not,
you are on a new site's branch: ask the developer where the site's code is, or
only where the running site is, and how to start it for tests. Then create
`site/` with `site/notes.md`.

Keep `site/notes.md` up to date as you work, so another session or another
developer goes on from the same point. It holds:

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
3. Write the module in `site/module/`. Follow `docs/writing-capabilities.md`.
4. Check the module. The check command is not written yet: for now, fix every
   type error in the module.
5. Integrate the module into the site only when the developer asks. Otherwise
   give them the steps in `docs/adding-dicta.md` for their site. Choose the
   integration method with the developer, and write it in `site/notes.md`.
6. Try it on the running site, once the module is in it. Try requests in plain
   words for each capability, and a request that clears each value that can be
   cleared.

## Rules

- Each capability calls the site's own code, or sends the site's own requests,
  with the user's rights. Never go around the site's checks, and never change
  them for dicta.
- Do not change the site's code, except to integrate the module when the
  developer asks. List any problem you find for the developer instead of fixing
  it.
- Never change the copy of the module in the site. Change `site/module/`, and
  copy it again.
- Never put secrets, such as API keys, in the module or the site's frontend.
