# Adding dicta to your site

To use the capability module, your pages need `dicta-action-js`, and you need a
running `dicta-action-server`.

## On every page

Every page of your site loads `dicta-action-js` and the module, and has one
`<dicta-action>` element. Put them in the layout that all your pages share.
When a capability loads a new page, the request goes on in that page, so a page
without them ends the request.

```ts
import { DictaAction } from "dicta-action-js";
import recipeBox from "./dicta-module";

const action = document.querySelector<DictaAction>("dicta-action")!;
action.getToken = async () => {
  const response = await fetch("/api/dicta-token");
  return (await response.json()).token;
};
action.module = recipeBox;
```

```html
<dicta-action server="https://dicta.example.com"></dicta-action>
```

- `server`: the address of your `dicta-action-server`.
- `getToken`: returns a token from your backend (Tokens). Set it before
  `module`.
- `module`: your capability module.

The user's words come from your page. Pass them to the element:

```ts
action.submit("plan the lemon cake for Friday");
```

The text can come from a text field or from speech, such as `dicta-js`.

## The server

`dicta-action-server` is a small Node.js server. It keeps no data between
requests. Set these environment variables:

- `PLANNER`: `claude`.
- `ANTHROPIC_API_KEY`: your key for the Claude API.
- `JWT_SECRET`: the secret for the tokens, at least 32 bytes. Your backend uses
  the same secret.
- `PORT`: optional, `8080` by default.

All its paths start with `/dicta-action/`, so it can share a domain with your
site behind a proxy.

Your users' browsers must reach the server. Chromium blocks or asks before a
public site calls a server on a private address, such as `localhost` or
`192.168.x.x`. So in production, the server must have a public address, or be
in the same network as your site.

## Tokens

Your backend gives signed-in users a short-lived token. The server checks it on
every call.

- A JWT signed with HS256 and `JWT_SECRET`.
- `exp` is required. 5 minutes is a good lifetime.
- `sub` is optional, the user's id.

For example, in Node.js with the `jose` package:

```ts
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function dictaToken(userId: string) {
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .sign(secret);
}
```

Each request to the AI costs money. Limit how many tokens one user can get, in
your backend, like any other costly feature.
