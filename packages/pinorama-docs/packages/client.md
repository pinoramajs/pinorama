---
outline: deep
---

# Client

**Pinorama Client** is an isomorphic HTTP client for interacting with [Pinorama Server](/packages/server). It provides methods for inserting logs, searching, querying stats, and managing MCP. It works in both Node.js and the browser.

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

### `clear()`

Clear all documents from the database.

- **Endpoint:** `POST /clear`
- **Retries:** No
- **Returns:** `Promise<void>`

```js
await client.clear()
```

### `stats()`

Get database statistics: total documents, memory usage, and time range.

- **Endpoint:** `GET /stats`
- **Retries:** No
- **Returns:** `Promise<PinoramaStats>`

```js
const stats = await client.stats()
console.log(stats.totalDocs, stats.memoryUsage)
```

The returned object includes:

| Field | Type | Description |
| --- | --- | --- |
| `totalDocs` | `number` | Total number of documents |
| `memoryUsage` | `number` | Heap memory used in bytes |
| `oldestTimestamp` | `number \| null` | Oldest log timestamp |
| `newestTimestamp` | `number \| null` | Newest log timestamp |

### `context(params)`

Get logs surrounding a specific timestamp.

- **Endpoint:** `POST /context`
- **Retries:** No
- **Returns:** `Promise<PinoramaContextResult>`

```js
const ctx = await client.context({
  timestamp: 1700000000000,
  before: 10,
  after: 10
})

console.log(ctx.before, ctx.after)
```

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `timestamp` | `number` | *required* | Center point timestamp |
| `before` | `number` | `10` | Number of logs before the timestamp |
| `after` | `number` | `10` | Number of logs after the timestamp |
| `where` | `object` | | Additional Orama where clause |

### `aggregateByField(params)`

Group logs by a field and compute optional metrics.

- **Endpoint:** `POST /aggregate/field`
- **Retries:** No
- **Returns:** `Promise<PinoramaAggregateResult>`

```js {3}
const result = await client.aggregateByField({
  field: "req.url",
  metric: { field: "responseTime", fn: "avg" },
  limit: 10
})

console.log(result.values)
```

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `field` | `string` | *required* | Field to group by |
| `metric` | `object` | | `{ field: string, fn: "count" \| "avg" \| "min" \| "max" }` |
| `where` | `object` | | Orama where clause for filtering |
| `limit` | `number` | `10` | Max number of groups |

### `mcpStatus()`

Check whether the embedded MCP server is enabled.

- **Endpoint:** `GET /mcp/status`
- **Retries:** No
- **Returns:** `Promise<{ enabled: boolean }>`

```js
const { enabled } = await client.mcpStatus()
```

### `setMcpStatus(enabled)`

Enable or disable the embedded MCP server.

- **Endpoint:** `POST /mcp/status`
- **Retries:** No
- **Returns:** `Promise<{ enabled: boolean }>`

```js
await client.setMcpStatus(true)
```

## Error Handling

All methods throw a `PinoramaError` on failure. This error extends `Error` with additional properties:

| Property | Type | Description |
| --- | --- | --- |
| `status` | `number` | HTTP status code |
| `errorDetails` | `unknown` | Full response body from the server |

```js {6-7}
import { PinoramaError } from "pinorama-client"

try {
  await client.search({ term: "test" })
} catch (error) {
  if (error instanceof PinoramaError) {
    console.log(error.status, error.errorDetails)
  }
}
```

## Retry Behavior

Only `insert()` uses automatic retry with exponential backoff. After `maxRetries` attempts, a `PinoramaError` is thrown.

::: details Retry sequence with default options

| Attempt | Wait Time |
| --- | --- |
| 1st (initial) | immediate |
| 2nd (retry 1) | 1,000 ms |
| 3rd (retry 2) | 2,000 ms |
| 4th (retry 3) | 4,000 ms |
| 5th (retry 4) | 8,000 ms |

The wait time is always capped at `backoffMax`.
:::

## Platform Support

Pinorama Client works in both Node.js and the browser with the same API.

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
