---
outline: deep
---

# Server

**Pinorama Server** is a [Fastify](https://fastify.dev/) plugin that provides a REST API for storing and searching logs using [Orama](https://askorama.ai/). It can be used as a standalone server or integrated into an existing Fastify application.

## Installation

::: code-group

```sh [npm]
npm i pinorama-server
```

```sh [pnpm]
pnpm i pinorama-server
```

```sh [yarn]
yarn add pinorama-server
```

:::

## Quick Start

### As a Fastify plugin

```js
import Fastify from "fastify"
import pinoramaServer from "pinorama-server"

const app = Fastify()

app.register(pinoramaServer, {
  introspection: {
    columns: {
      time: { visible: true, size: 150 },
      level: { visible: true, size: 70 },
      msg: { visible: true, size: 400 }
    }
  }
})

app.listen({ port: 3000 })
```

### Using the `createServer` helper

```js
import { createServer } from "pinorama-server"

const app = createServer(
  {
    prefix: "/pinorama",
    adminSecret: "my-secret"
  },
  { logger: true } // Fastify options
)

app.listen({ port: 3000 })
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `adminSecret` | `string` | `process.env.PINORAMA_SERVER_ADMIN_SECRET` | Secret for authenticating write operations |
| `dbSchema` | `AnySchema` | Pino preset schema | [Orama schema](https://docs.orama.com/open-source/usage/create) for the database |
| `dbPath` | `string` | `undefined` | File path for database persistence |
| `dbFormat` | `"json" \| "dpack" \| "binary"` | `"json"` | Persistence format |
| `prefix` | `string` | `undefined` | Route prefix (e.g. `"/pinorama"`) |
| `logLevel` | `LogLevel` | `undefined` | Fastify log level for plugin routes |
| `introspection` | `PinoramaIntrospection` | Pino preset introspection | Metadata for facets, columns, labels, formatters, and styles |

## REST API

All routes are relative to the configured `prefix`.

### `POST /bulk`

Insert multiple log documents.

- **Body:** JSON array of log objects
- **Response:** `201 { success: true }`
- **Auth:** Required if `adminSecret` is set

Each document is automatically augmented with a `_pinorama.createdAt` timestamp for insertion ordering.

```sh
curl -X POST http://localhost:3000/bulk \
  -H "Content-Type: application/json" \
  -H "x-pinorama-admin-secret: my-secret" \
  -d '[{"level": 30, "msg": "hello", "time": 1700000000000}]'
```

### `POST /search`

Search the log database using [Orama search params](https://docs.orama.com/open-source/usage/search/introduction).

- **Body:** Orama `SearchParams` object
- **Response:** `200` with Orama `Results` object

```sh
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"term": "error", "limit": 10}'
```

### `GET /introspection`

Returns the introspection configuration used by Studio to render columns, facets, labels, and styles.

- **Response:** `200` with `PinoramaIntrospection` JSON

### `GET /styles.css`

Returns dynamically generated CSS based on the introspection `styles` config. Used by Studio to apply per-field and per-value styling.

- **Response:** `200` with `text/css` content

### `POST /persist`

Manually persist the in-memory database to disk. Requires `dbPath` to be configured.

- **Response:** `204` on success
- **Auth:** Required if `adminSecret` is set

## Authentication

When `adminSecret` is set (via option or `PINORAMA_SERVER_ADMIN_SECRET` environment variable), all routes require the `x-pinorama-admin-secret` header:

```
x-pinorama-admin-secret: my-secret
```

Requests without a valid secret receive a `401 Unauthorized` response.

If `adminSecret` is not configured, all routes are open.

## Fastify Decorations

The plugin decorates the Fastify instance with:

- **`fastify.pinoramaDb`** — The Orama database instance
- **`fastify.pinoramaOpts`** — The resolved server options

These can be used in custom routes or plugins:

```js
app.get("/count", async (request, reply) => {
  const count = await getCount(app.pinoramaDb)
  return { count }
})
```

## Graceful Shutdown

When `dbPath` is configured, the database is automatically persisted to disk when the Fastify server shuts down (via the `onClose` hook). This means data is saved when you stop the server with `Ctrl+C` or call `app.close()`.

See [Persistence](/advanced/persistence) for more details on formats and configuration.
