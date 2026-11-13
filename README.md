# dicta-action-harness

dicta actions let the users of your site say what they want in their own words,
and your site does it. This harness is the folder you open your AI coding agent
in. The agent writes the part that is specific to your site: the capability
module.

## Start

Make your own private copy of the harness. Do not fork it: a fork of a public
repo is public, and your copy will hold notes about your sites.

1. Make an empty private repo on GitHub, such as `your-account/dicta`.
2. Copy the harness into it:

   ```sh
   git clone https://github.com/emrahcom/dicta-action-harness.git dicta
   cd dicta
   git remote rename origin upstream
   git remote add origin git@github.com:your-account/dicta.git
   git push -u origin main
   npm install
   ```

3. Open your agent in this folder, such as Claude Code or Codex.
4. Tell it which site to work on, and where its code is, or only where your
   running test site is.

The agent follows [`AGENTS.md`](AGENTS.md). Everything it makes for a site goes
into `sites/<name>/`, such as `sites/recipe-box/`. Commit it like any other
work. All your sites live side by side in the same copy.

## Updates

The steps to update the harness are in
[`docs/upgrading.md`](docs/upgrading.md#updating-the-harness). The same guide
tells the rest.

## Read next

- [`docs/getting-started.md`](docs/getting-started.md): how the harness works,
  step by step.
- [`docs/writing-capabilities.md`](docs/writing-capabilities.md): how to write a
  good module.
- [`docs/adding-dicta.md`](docs/adding-dicta.md): how to put dicta into your
  site.
- [`docs/adding-voice.md`](docs/adding-voice.md): how to let your users speak
  their requests.
- [`docs/checking-the-module.md`](docs/checking-the-module.md): how to check the
  module and try it.
- [`docs/upgrading.md`](docs/upgrading.md): how to move to a new version.

## License

Apache-2.0
