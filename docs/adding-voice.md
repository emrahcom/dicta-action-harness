# Adding voice

Voice input lets your users speak their request instead of typing it. It is
optional. Add it after dicta works with typed text
([`adding-dicta.md`](adding-dicta.md)).

Voice input needs two more parts:

- [`dicta-js`](https://github.com/emrahcom/dicta-js): the `<dicta-input>`
  element. It has a text field, a microphone button and a Send button. So the
  user can type or speak.
- [`dicta-server`](https://github.com/emrahcom/dicta-server): it turns speech
  into text, with a speech-to-text service.

The harness does not include them. Their own documents have all the details:

- https://github.com/emrahcom/dicta-js
- https://github.com/emrahcom/dicta-server

## On every page

Load `dicta-js` from your `dicta-server`. The server serves the version that
fits it. Put one `<dicta-input>` next to the `<dicta-action>` element, and pass
its text to `submit`:

```html
<script
  type="module"
  src="https://voice.example.com/dicta/js/index.js"
></script>

<dicta-input server="wss://voice.example.com" label="Request"></dicta-input>
```

```js
const input = document.querySelector("dicta-input");
input.getToken = async () => {
  const response = await fetch("/api/dicta-voice-token");
  return (await response.json()).token;
};
input.addEventListener("dicta-text", (event) => {
  action.submit(event.detail.text);
});
```

`action` is the `<dicta-action>` element ([`adding-dicta.md`](adding-dicta.md)).
The attributes of `<dicta-input>`, such as `lang`, are in the `dicta-js`
documents.

## The server

For tests, run `dicta-server` from its Docker image. It listens on port `8740`.
[`dicta-action-server`](https://github.com/emrahcom/dicta-action-server) uses
`8741`, so both can run on one machine:

```sh
docker run -p 8740:8740 -e PROVIDER=deepgram -e DEEPGRAM_API_KEY=... \
  -e JWT_SECRET=... ghcr.io/emrahcom/dicta-server:latest
```

It needs a key for a speech-to-text service, Mistral or Deepgram. Each minute of
audio costs money there. All settings are in the `dicta-server` documents.

On a test page over plain `http://`, use `ws://localhost:8740` as the `server`
attribute. A page over `https://` needs `wss://`, so in production run the
server behind a proxy that handles TLS.

## Tokens

`dicta-server` checks a token too, made the same way as for
`dicta-action-server` ([`adding-dicta.md`](adding-dicta.md#tokens), Tokens). You
can choose:

- One secret: both servers have the same `JWT_SECRET`. Then one token works on
  both, and one endpoint in your backend is enough.
- Kept apart: give each server its own `JWT_AUDIENCE`, such as `dicta` and
  `dicta-action`. Your backend signs one token for each, with `setAudience`.
  Then a token for one server does not work on the other.

Keep them apart when you limit the two differently. For example, a token for
typed requests should not open minutes of paid audio.
