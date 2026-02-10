---
outline: deep
---

# Persistence

Pinorama Server stores logs in-memory using [Orama](https://askorama.ai/). Persistence allows you to save the database to disk and restore it on startup, so logs survive server restarts.

## How It Works

1. **On startup** — If the configured `dbPath` file exists, the database is restored from it. Otherwise, a fresh database is created.
2. **On shutdown** — When the server closes gracefully (e.g. `Ctrl+C` or `app.close()`), the database is automatically saved to `dbPath` via the Fastify `onClose` hook.
3. **On demand** — You can manually trigger a save at any time via the `POST /persist` endpoint.

## Configuration

Pass persistence options when registering the Pinorama Server plugin:

```js
import Fastify from "fastify"
import pinoramaServer from "pinorama-server"

const app = Fastify()

app.register(pinoramaServer, {
  dbPath: "./data/logs.msp",
  dbFormat: "json",
  introspection: { /* ... */ }
})
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `dbPath` | `string` | `undefined` | File path for saving/restoring the database |
| `dbFormat` | `"json" \| "dpack" \| "binary"` | `"json"` | Serialization format |

::: warning
If `dbPath` is not set, the database is purely in-memory and all data is lost when the server stops.
:::

## Formats

Pinorama supports three persistence formats provided by [`@orama/plugin-data-persistence`](https://docs.orama.com/open-source/plugins/plugin-data-persistence):

| Format | Description |
| --- | --- |
| `json` | Human-readable JSON. Good for debugging and small datasets. Default. |
| `dpack` | MessagePack-based binary format. More compact than JSON. |
| `binary` | Raw binary format. Most compact, best for large datasets. |

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
