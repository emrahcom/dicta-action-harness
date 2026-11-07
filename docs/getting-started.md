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

## One folder per site

Keep your own private copy of the harness (`README.md`). All your sites share
it, each in its own folder, on the same branch.

Everything the harness makes for a site is in `sites/<name>/`, such as
`sites/recipe-box/`. It holds only two things:

- `sites/<name>/module/`: the module. This is the only place where it is
  changed.
- `sites/<name>/notes.md`: what the agent learned about the site and what you
  decided together. For example: where the site is and how to start it, the
  list of capabilities, the problems the agent found, and the requests it
  tried.

Commit `sites/` like any other work. Then another developer, or you on another
machine, goes on from the same point. The harness itself has only one site
folder, the example site. It never has your sites' folders, so its updates do
not conflict with your work. Keep your work in your sites' folders, and do not
change the harness's own files.

## The example site

`sites/example-site/` shows what a finished site folder looks like. The site is
`dicta-example-site`, a small task list. An agent made the folder in a real
session in the harness. Read its `notes.md` and its module to see what your
agent will make.

The example site is part of the harness. Do not change it.

## What you need

- A running copy of your site for tests, such as a local development server or
  a test environment.
- Your site's source code, if you can give it to the agent. The agent only reads
  it, unless you ask it to add dicta to your site. Without the code, the agent
  works with the running site only.
- An AI coding agent, such as Claude Code or Codex.

## Steps

1. Open your agent in your copy of the harness.
2. Tell it which site to work on, where its code is, or only where the running
   site is, and how to start it for tests. For example:

   ```
   I want to add dicta to my site. Its short name is recipe-box.
   The code is in ~/work/recipe-box. The running site is at
   http://localhost:3000/. Please study the site and propose the
   capabilities.
   ```

3. The agent follows `AGENTS.md`: it studies the site, lists what users can do,
   and writes the module in `sites/<name>/module/`.
4. Review the module there, like any other change. Nothing in your site has
   changed yet. Each capability runs with the user's rights, so check that it
   uses your site's own code and checks.
5. Add dicta to your site: see `adding-dicta.md`. You can do it by hand, or ask
   the agent to do it.
6. Try some requests on your test site.

## Tips

- Say at the start what you want, such as "do not integrate the module yet".
  The agent keeps to it.
- Say where the code is, or that you only have the running site. With the code,
  the agent calls your site's own functions.
- Review the capability list before you approve it. The agent stops there and
  lists the problems it found.
- Trying requests needs the module in your site. Without integration, the agent
  stops after the check.

## The guides

- `writing-capabilities.md`: how to write a good capability module.
- `adding-dicta.md`: how to put the module, `dicta-action-js` and the server
  into your site.
- `adding-voice.md`: how to let your users speak their requests, with
  `dicta-js` and `dicta-server`. Optional.
- `checking-the-module.md`: how to check the module and try it.
- `upgrading.md`: how to move to a new version.
