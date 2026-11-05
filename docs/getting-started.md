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
- The capability module: one file in your site's code. It lists what a plan can
  do on your site, such as "add a recipe" or "share a recipe", and how to do it
  with your site's own functions. You review it and bundle it into your pages
  like any other code.

## What you need

- Your site's source code, which the agent can read and change.
- A running copy of your site for tests, such as a local development server.
- An AI coding agent, such as Claude Code or Codex.

## Steps

1. Open your agent in this folder.
2. Tell it where your site's code is and how to start the site for tests.
3. The agent follows `AGENTS.md`: it studies the site, lists what users can do,
   and writes the module in your site's code.
4. Review the module like any other change. Each capability runs with the
   user's rights, so check that it uses your site's own code and checks.
5. Add dicta to your site: see `adding-dicta.md`.
6. Try some requests on your test site.

## The guides

- `writing-capabilities.md`: how to write a good capability module.
- `adding-dicta.md`: how to load dicta on your pages and run the server.
