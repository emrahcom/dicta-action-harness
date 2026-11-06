# Getting started

dicta actions let the users of your site say what they want in their own words,
such as "move my dentist visit to Friday". An AI planner turns the words into a
plan. The browser runs the plan with your site's own code and the user's own
rights.

This harness helps you build the part that is specific to your site: the
capability module. You open your AI agent in this folder, and the agent writes
the module with you.

## The parts

- `dicta-action-server`: the planner. It talks to the AI service. It never acts
  on your site.
- `dicta-action-js`: the browser part. It puts a `<dicta-action>` element on
  your pages, sends the user's words to the server and runs the plans it gets
  back.
- The capability module: it lists what a plan can do on your site, such as "add
  a recipe" or "share a recipe", and how to do it. The agent writes it here, in
  the harness. Later a copy of it goes into your site.

## One branch per site

Fork the harness, and make one branch for each of your sites. Get updates of
the harness by merging `main` into your site's branch.

Everything the harness makes for a site is in one folder, `site/`, in the
site's branch. It holds only two things:

- `site/module/`: the module. This is the only place where it is changed.
- `site/notes.md`: what the agent learned about the site and what you decided
  together. For example: where the site is and how to start it, the list of
  capabilities, the problems the agent found, and the requests it tried.

Commit `site/` like any other work. Then another developer, or you on another
machine, goes on from the same point. `main` never has a `site/` folder, so the
merges do not conflict.

## What you need

- A running copy of your site for tests, such as a local development server or
  a test environment.
- Your site's source code, if you can give it to the agent. The agent only reads
  it. Without the code, the agent works with the running site only.
- An AI coding agent, such as Claude Code or Codex.

## Steps

1. Make a branch for your site and open your agent in this folder.
2. Tell it where your site's code is, or only where the running site is, and
   how to start it for tests.
3. The agent follows `AGENTS.md`: it studies the site, lists what users can do,
   and writes the module in `site/module/`.
4. Review the module there, like any other change. Nothing in your site has
   changed yet. Each capability runs with the user's rights, so check that it
   uses your site's own code and checks.
5. Add dicta to your site: see `adding-dicta.md`. You can do it by hand, or ask
   the agent to do it.
6. Try some requests on your test site.

## The guides

- `writing-capabilities.md`: how to write a good capability module.
- `adding-dicta.md`: how to put the module, `dicta-action-js` and the server
  into your site.
