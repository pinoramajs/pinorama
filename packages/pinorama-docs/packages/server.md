---
outline: deep
---

# Server

**Pinorama Server** is a [Fastify](https://fastify.dev/) plugin that provides a REST API for storing and searching logs using [Orama](https://askorama.ai/). It runs as a standalone server or integrates into an existing Fastify application.

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

```js {5-6}
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
| `adminSecret` | `string` | `process.env.PINORAMA_SERVER_ADMIN_SECRET` | Secret for authenticating protected routes |
| `dbSchema` | `AnySchema` | Pino preset schema | [Orama schema](https://docs.orama.com/open-source/usage/create) for the database |
| `dbPath` | `string` | `undefined` | File path for database persistence |
| `dbFormat` | `"json" \| "dpack" \| "binary"` | `"binary"` | Persistence format |
| `prefix` | `string` | `undefined` | Route prefix (e.g. `"/pinorama"`) |
| `logLevel` | `LogLevel` | `undefined` | Fastify log level for plugin routes |
| `autoSaveInterval` | `number` | `undefined` | Auto-save interval in ms (requires `dbPath`) |
| `introspection` | `PinoramaIntrospection` | Pino preset introspection | Metadata for facets, columns, labels, formatters, and styles |

## REST API

All routes are relative to the configured `prefix`.

### `GET /health`

Health check endpoint. Returns server status, uptime, document count, and memory usage.

- **Response:** `200` with status object
- **Auth:** Not required

```sh
curl http://localhost:3000/health
```

### `POST /bulk`

Insert multiple log documents.

- **Body:** JSON array of log objects
- **Response:** `201 { success: true }`
- **Auth:** Required

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
- **Auth:** Required

```sh
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -H "x-pinorama-admin-secret: my-secret" \
  -d '{"term": "error", "limit": 10}'
```

### `GET /introspection`

Returns the introspection configuration used by Pinorama Studio to render columns, facets, labels, and styles.

- **Response:** `200` with `PinoramaIntrospection` JSON
- **Auth:** Required

### `GET /styles.css`

Returns dynamically generated CSS based on the introspection `styles` config. Used by Pinorama Studio to apply per-field and per-value styling.

- **Response:** `200` with `text/css` content
- **Auth:** Required

### `GET /stats`

Returns database statistics: total document count, memory usage, and oldest/newest timestamps.

- **Response:** `200` with stats object
- **Auth:** Required

```sh
curl http://localhost:3000/stats \
  -H "x-pinorama-admin-secret: my-secret"
```

### `POST /context`

Returns logs surrounding a specific timestamp. Useful for investigating what happened before and after an event.

- **Body:** `{ timestamp, before?, after?, where? }`
- **Response:** `200` with `{ before, after, timestamp }`
- **Auth:** Required

```sh
curl -X POST http://localhost:3000/context \
  -H "Content-Type: application/json" \
  -H "x-pinorama-admin-secret: my-secret" \
  -d '{"timestamp": 1700000000000, "before": 5, "after": 5}'
```

### `POST /aggregate/field`

Group logs by a field and optionally compute metrics (count, avg, min, max) on a numeric field.

- **Body:** `{ field, metric?, where?, limit? }`
- **Response:** `200` with `{ values: [{ value, count, metric? }] }`
- **Auth:** Required

```sh
curl -X POST http://localhost:3000/aggregate/field \
  -H "Content-Type: application/json" \
  -H "x-pinorama-admin-secret: my-secret" \
  -d '{"field": "req.url", "metric": {"field": "responseTime", "fn": "avg"}, "limit": 10}'
```

### `POST /clear`

Clear all documents from the database and delete the persistence file if it exists.

- **Response:** `204` on success
- **Auth:** Required

### `POST /persist`

Manually persist the in-memory database to disk. Requires `dbPath` to be configured.

- **Response:** `204` on success
- **Auth:** Required

### MCP Endpoints

Pinorama Server includes a built-in [MCP](/packages/mcp) server for AI assistant integration. See the [MCP documentation](/packages/mcp) for details on `/mcp` and `/mcp/status` endpoints.

## Authentication

When `adminSecret` is set (via option or `PINORAMA_SERVER_ADMIN_SECRET` environment variable), most routes require the `x-pinorama-admin-secret` header:

```
x-pinorama-admin-secret: my-secret
```

Requests without a valid secret receive a `401 Unauthorized` response.

### Routes that never require auth

| Route | Reason |
| --- | --- |
| `GET /health` | Health checks must always be accessible |
| `GET /mcp/status` | Allows clients to check if MCP is enabled |
| `POST/GET/DELETE /mcp` | MCP protocol endpoints handle their own session management |

### Routes that require auth (when `adminSecret` is configured)

All other routes: `/bulk`, `/search`, `/introspection`, `/styles.css`, `/stats`, `/context`, `/aggregate/field`, `/clear`, `/persist`, `POST /mcp/status`.

If `adminSecret` is not configured, all routes are open.

## Fastify Decorations

The plugin decorates the Fastify instance with:

- **`fastify.pinorama.db`** — The Orama database instance
- **`fastify.pinorama.opts`** — The resolved server options

These can be used in custom routes or plugins:

```js {4}
import { count } from "@orama/orama"

app.get("/count", async () => {
  return { count: count(app.pinorama.db) }
})
```

## Auto-Save Plugin

When `autoSaveInterval` and `dbPath` are both configured, Pinorama Server automatically persists the database at the specified interval. This protects against data loss from unexpected crashes.

```js {3}
app.register(pinoramaServer, {
  dbPath: "./data/logs.msp",
  autoSaveInterval: 60_000 // save every 60 seconds
})
```

The auto-save timer is automatically cleared when the server shuts down.

## Graceful Shutdown

When `dbPath` is configured, the database is automatically persisted to disk when the Fastify server shuts down (via the `onClose` hook). This means data is saved when you stop the server with `Ctrl+C` or call `app.close()`.

See [Persistence](/advanced/persistence) for more details on formats and configuration.
