# dicta-action-harness

This folder is a harness for building the dicta action layer of a web site. You
are the developer's agent. Your job is to write the site's capability module:
the file that tells the dicta planner what it can do on the site, and how, with
the site's own code.

Read `docs/getting-started.md` first. The developer tells you where the site's
code is and how to start it for tests.

## Workflow

1. Study the site. Read its code: its pages, its API and the functions its
   buttons call. Find how a user signs in and what a user can do.
2. List what users can do on the site, as capabilities, each with its level.
   Show the list to the developer before you go on.
3. Write the module in the site's code, next to its other frontend code. Follow
   `docs/writing-capabilities.md`.
4. Check the module. The check command is not written yet: for now, build the
   site and fix every type error in the module.
5. Try it on the running site. Add dicta to the site as
   `docs/adding-dicta.md` says, and try requests in plain words for each
   capability.

## Rules

- Each capability calls the site's own code, with the user's rights. Never go
  around the site's checks, and never change them for dicta.
- Change only what the module needs. List any other problem you find for the
  developer instead of fixing it.
- Never put secrets, such as API keys, in the module or the site's frontend.
