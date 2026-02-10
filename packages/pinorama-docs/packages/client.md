---
outline: deep
---

# Client

**Pinorama Client** is an isomorphic HTTP client for interacting with a [Pinorama Server](/packages/server). It provides methods for inserting logs, searching, and retrieving server metadata. It works in both Node.js and the browser.

## Installation

::: code-group

```sh [npm]
npm i pinorama-client
```

```sh [pnpm]
pnpm i pinorama-client
```

```sh [yarn]
yarn add pinorama-client
```

:::

## Usage

```js
import { PinoramaClient } from "pinorama-client"

const client = new PinoramaClient({
  url: "http://localhost:3000/pinorama",
  adminSecret: "my-secret"
})

// Insert logs
await client.insert([
  { level: 30, msg: "hello", time: Date.now() }
])

// Search logs
const results = await client.search({
  term: "hello",
  limit: 10
})
```

## Constructor Options

Options are validated with Zod at construction time.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `string` | *required* | Pinorama Server URL |
| `adminSecret` | `string` | | Secret for the `x-pinorama-admin-secret` header |
| `maxRetries` | `number` | `5` | Max retry attempts for `insert()` |
| `backoff` | `number` | `1000` | Initial backoff time in ms |
| `backoffFactor` | `number` | `2` | Backoff multiplier (min: 2) |
| `backoffMax` | `number` | `30000` | Maximum backoff time in ms |

## API Methods

### `insert(docs)`

Insert an array of log documents into the server.

- **Endpoint:** `POST /bulk`
- **Retries:** Yes (exponential backoff)
- **Returns:** `Promise<void>`

```js
await client.insert([
  { level: 30, msg: "request started", time: Date.now() },
  { level: 30, msg: "request completed", time: Date.now() }
])
```

### `search(params)`

Search the log database using [Orama search params](https://docs.orama.com/open-source/usage/search/introduction).

- **Endpoint:** `POST /search`
- **Retries:** No
- **Returns:** `Promise<Results>`

```js
const results = await client.search({
  term: "error",
  where: { level: { eq: 50 } },
  limit: 25
})

console.log(results.hits)
```

### `introspection()`

Retrieve the server's introspection configuration (facets, columns, labels, formatters, styles).

- **Endpoint:** `GET /introspection`
- **Retries:** No
- **Returns:** `Promise<PinoramaIntrospection>`

```js
const config = await client.introspection()
console.log(config.columns)
```

### `styles()`

Retrieve the server's generated CSS stylesheet.

- **Endpoint:** `GET /styles.css`
- **Retries:** No
- **Returns:** `Promise<string>`

```js
const css = await client.styles()
```

## Retry Behavior

Only `insert()` uses automatic retry with exponential backoff. The retry sequence with default options:

| Attempt | Wait Time |
| --- | --- |
| 1st (initial) | immediate |
| 2nd (retry 1) | 1,000 ms |
| 3rd (retry 2) | 2,000 ms |
| 4th (retry 3) | 4,000 ms |
| 5th (retry 4) | 8,000 ms |

After `maxRetries` attempts, a `"max retries reached"` error is thrown. The wait time is always capped at `backoffMax`.

## Platform Support

The client works in both Node.js and the browser with the same API. The only platform-specific code is the `setTimeout` implementation used for retry delays.

### Node.js

```js
import { PinoramaClient } from "pinorama-client"
// or explicitly:
import { PinoramaClient } from "pinorama-client/node"
```

### Browser

```js
import { PinoramaClient } from "pinorama-client/browser"
```

The browser build is an ESM module that uses `window.setTimeout` instead of Node.js `timers/promises`.
