# Upgrading

How to move to a new version of dicta.

## What changes

Four parts work together:

- This harness: the guides, the rules and the check.
- [`dicta-action-server`](https://github.com/emrahcom/dicta-action-server), the
  planner.
- [`dicta-action-js`](https://github.com/emrahcom/dicta-action-js), the browser
  part, bundled into your site's pages.
- Your site's capability module, in `sites/<name>/module/`.

Each release has notes. Read them first. They say what changed and what a site
must change.

## Updating the harness

Commit your work first. Then, in your copy of the harness:

```sh
git fetch upstream
git merge upstream/main
npm install
npm run check
```

The merge does not touch your sites' folders. It changes only the harness's own
files, so it has no conflicts unless you changed one of them.

If your copy has its own remote, push the merge:

```sh
git push
```

Then ask your agent to review each site's module against the new guides. It
tells you what it found. You decide what to change.

You can also ask your agent to do all of this. It follows the same steps.

Your sites' folders are not touched by the update. The harness itself has only
one site folder, the example site, `sites/example-site/`. It is not one of your
sites, so there is nothing to upgrade in it. The update brings its new version.

## Updating a site in production

### Until version 1.0.0

Any release may break the other parts. So update them together:

1. Update the harness, and fix the module with your agent.
2. Update the server, `dicta-action-js` and the copy of the module in your site
   at the same time.
3. Try some requests on the site.

### From version 1.0.0 on

A new server works with older sites of the same protocol version. The protocol
version is the `v1` in `/dicta-action/v1/round`. So:

1. Update the server first.
2. Then update `dicta-action-js` and the copy of the module, when it suits you.

A change that would break older sites gets a new protocol version, such as `v2`.
The server then serves both versions for a while. The release notes say when the
old one goes away.

## Updating the server

1. Get the new code.
2. Run `npm install`.
3. Restart the server.

The server keeps no data, so there is nothing to move.
