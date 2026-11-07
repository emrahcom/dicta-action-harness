# Example site

This folder is an example. It shows what the harness makes for a site.

The site is `dicta-example-site`, a small task list for a team:
https://github.com/emrahcom/dicta-example-site

The folder is the result of a real session in the harness. A developer asked
the agent to add the site, and the agent did its normal work. The result is
here as the agent made it.

- `notes.md`: what the agent learned about the site and what the developer
  decided.
- `module/`: the capability module.

Keep this folder unchanged. Then harness updates apply without conflicts.

The site's code is in `node_modules/dicta-example-site/`. The harness installs
it, so `npm run check -- example-site` works on every machine.

To run the site itself, clone it and start it:

```sh
git clone https://github.com/emrahcom/dicta-example-site.git
cd dicta-example-site
npm install
npm start
```

Then open http://localhost:8080/ in your browser.
