# dicta-action-harness

dicta actions let the users of your site say what they want in their own words,
and your site does it. This harness is the folder you open your AI coding agent
in. The agent writes the part that is specific to your site: the capability
module.

## Start

1. Fork this repo on GitHub, and clone your fork.
2. Make a branch for your site, named after it:

   ```sh
   git checkout -b recipe-box
   ```

3. Open your agent in this folder, such as Claude Code or Codex.
4. Tell it where your site's code is, or only where your running test site is.

The agent follows `AGENTS.md`. Everything it makes for your site goes into the
`site/` folder of your branch. Commit it like any other work.

To get updates of the harness, merge `main` into your site's branch:

```sh
git fetch upstream
git merge upstream/main
```

`upstream` is this repo. Add it once with
`git remote add upstream https://github.com/emrahcom/dicta-action-harness.git`.

## Read next

- `docs/getting-started.md`: how the harness works, step by step.
- `docs/writing-capabilities.md`: how to write a good module.
- `docs/adding-dicta.md`: how to put dicta into your site.

## License

Apache-2.0
