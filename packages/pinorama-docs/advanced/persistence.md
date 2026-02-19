---
outline: deep
---

# Persistence

Pinorama Server stores logs in-memory using [Orama](https://askorama.ai/). Persistence saves the database to disk and restores it on startup, so logs survive server restarts.

## How It Works

1. **On startup** — If the configured `dbPath` file exists, the database is restored from it. Otherwise, a fresh database is created.
2. **On shutdown** — When the server closes gracefully (e.g. `Ctrl+C` or `app.close()`), the database is automatically saved to `dbPath` via the Fastify `onClose` hook.
3. **On demand** — Trigger a save at any time via the `POST /persist` endpoint.
4. **Auto-save** — When `autoSaveInterval` is configured, the database is saved periodically at the specified interval.

## Configuration

Pass persistence options when registering the Pinorama Server plugin:

```js {7-9}
import Fastify from "fastify"
import pinoramaServer from "pinorama-server"

const app = Fastify()

app.register(pinoramaServer, {
  dbPath: "./data/logs.msp",
  dbFormat: "binary",
  introspection: { /* ... */ }
})
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `dbPath` | `string` | `undefined` | File path for saving/restoring the database |
| `dbFormat` | `"json" \| "dpack" \| "binary"` | `"binary"` | Serialization format |
| `autoSaveInterval` | `number` | `undefined` | Auto-save interval in ms |

::: warning
If `dbPath` is not set, the database is purely in-memory and all data is lost when the server stops.
:::

## Auto-Save

When both `dbPath` and `autoSaveInterval` are configured, Pinorama Server automatically persists the database at the specified interval. This protects against data loss from unexpected crashes.

```js {3}
app.register(pinoramaServer, {
  dbPath: "./data/logs.msp",
  autoSaveInterval: 60_000 // save every 60 seconds
})
```

The auto-save timer is automatically cleared when the server shuts down. If an auto-save fails, the error is logged but the server continues running.

## Formats

Pinorama supports three persistence formats provided by [`@orama/plugin-data-persistence`](https://docs.orama.com/open-source/plugins/plugin-data-persistence):

| Format | Description |
| --- | --- |
| `json` | Human-readable JSON. Good for debugging and small datasets. |
| `dpack` | MessagePack-based binary format. More compact than JSON. |
| `binary` | Raw binary format. Most compact, best for large datasets. Default. |

## Recommended Setup

Start with basic persistence and add auto-save for crash protection:

```js
app.register(pinoramaServer, {
  dbPath: "./data/logs.msp",
  dbFormat: "binary",
  autoSaveInterval: 60_000,             // [!code ++]
  introspection: { /* ... */ }
})
```

## Manual Persist

Trigger a manual save via the REST API:

```sh
curl -X POST http://localhost:3000/persist \
  -H "x-pinorama-admin-secret: my-secret"
```

Returns `204 No Content` on success. Requires authentication if `adminSecret` is configured.

## Pinorama Studio

When using [Pinorama Studio](/packages/studio) with piped input, the `--server-db-path` flag controls where the embedded server stores its database:

```sh
node app.js | pinorama --open --server-db-path ./my-logs.msp
```

The default path is a temporary file at `<tmpdir>/pinorama.msp`.
