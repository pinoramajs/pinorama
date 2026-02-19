---
outline: deep
---

# Presets

Presets define the database schema and introspection configuration for Pinorama Server. They control how logs are indexed, displayed, filtered, and styled in Pinorama Studio.

## How Presets Work

A preset is an object with two properties:

- **`schema`** — An [Orama schema](https://docs.orama.com/open-source/usage/create) that defines the indexed fields and their types
- **`introspection`** — A `PinoramaIntrospection` config that controls how Pinorama Studio renders the data

```ts
type PinoramaPreset<T> = {
  schema: T
  introspection: PinoramaIntrospection<T>
}
```

Presets are passed to the server at registration time via the `dbSchema` and `introspection` options.

## Built-in Presets

Pinorama ships with two presets in the `pinorama-presets` package.

### `pino` (default)

The default preset for standard Pino logs.

**Schema fields:**

| Field | Type | Description |
| --- | --- | --- |
| `time` | `number` | Log timestamp |
| `level` | `enum` | Log level (10–60) |
| `msg` | `string` | Log message |
| `pid` | `enum` | Process ID |
| `hostname` | `string` | Hostname |

**Default columns:**

| Column | Visible | Size |
| --- | --- | --- |
| `time` | yes | 150px |
| `level` | yes | 70px |
| `msg` | yes | 400px |
| `pid` | no | 70px |
| `hostname` | no | 150px |

**Level labels:** TRACE (10), DEBUG (20), INFO (30), WARN (40), ERROR (50), FATAL (60)

### `fastify`

Extended preset for Fastify applications. Includes all `pino` fields plus HTTP request/response data.

**Additional schema fields:**

| Field | Type | Description |
| --- | --- | --- |
| `reqId` | `string` | Request ID |
| `req.method` | `string` | HTTP method |
| `req.url` | `string` | Request URL |
| `req.hostname` | `string` | Request hostname |
| `req.remoteAddress` | `string` | Client IP address |
| `req.remotePort` | `enum` | Client port |
| `res.statusCode` | `enum` | Response status code |
| `responseTime` | `number` | Response time in ms |

**Additional columns:**

| Column | Visible | Size |
| --- | --- | --- |
| `reqId` | yes | 80px |
| `req.method` | yes | 80px |
| `req.url` | yes | 100px |
| `res.statusCode` | yes | 70px |
| `req.hostname` | no | 150px |
| `req.remoteAddress` | no | 100px |
| `req.remotePort` | no | 80px |
| `responseTime` | no | 150px |

## Introspection Config

The `PinoramaIntrospection` object controls how Pinorama Studio renders each field:

### `facets`

Defines which fields appear as filters in the sidebar. Three facet types are available:

| Type | Description | UI Control |
| --- | --- | --- |
| `"enum"` | Select from known values | Checkbox list |
| `"string"` | Free text search | Text input |
| `"date"` | Date range filter | Date range picker |

```ts
facets: {
  time: "date",
  level: "enum",
  msg: "string",
  "req.method": "string"
}
```

### `columns`

Controls which fields appear as columns in the log viewer, their visibility, and width.

```ts
columns: {
  time: { visible: true, size: 150 },
  level: { visible: true, size: 70 },
  msg: { visible: true, size: 400 },
  pid: { visible: false, size: 70 }
}
```

### `labels`

Defines display labels for fields. Can be a simple string or a tuple with a value map for human-readable values.

```ts {4-12}
labels: {
  time: "Time",                    // simple label
  msg: "Message",
  level: ["Level", {               // label + value mapping
    10: "TRACE",
    20: "DEBUG",
    30: "INFO",
    40: "WARN",
    50: "ERROR",
    60: "FATAL"
  }]
}
```

### `formatters`

Specifies how field values are formatted for display. Currently supports `"timestamp"` for converting Unix timestamps.

```ts
formatters: {
  time: "timestamp"
}
```

### `styles`

Defines CSS styles applied to field values. Can be a base style object or a tuple with per-value styles.

```ts {3-8}
styles: {
  time: { opacity: "0.5" },       // base style for all values
  level: [{}, {                    // base + per-value styles
    30: { color: "lime" },
    40: { color: "yellow" },
    50: { color: "red" }
  }]
}
```

The server generates CSS classes from these styles (e.g. `.pinorama-level`, `.pinorama-level-30`) served at `GET /styles.css`.

## Custom Presets

Create a custom preset using the `createPreset` function from `pinorama-presets`, then pass it to the server:

```ts {3-4}
import pinoramaServer from "pinorama-server"

app.register(pinoramaServer, {
  dbSchema: myPreset.schema,
  introspection: myPreset.introspection
})
```

::: details Full custom preset example

```ts
import { createPreset } from "pinorama-presets"

const myPreset = createPreset(
  // Orama schema
  {
    timestamp: "number",
    severity: "enum",
    message: "string",
    service: "string"
  },
  // Introspection config
  {
    facets: {
      timestamp: "date",
      severity: "enum",
      message: "string",
      service: "enum"
    },
    columns: {
      timestamp: { visible: true, size: 150 },
      severity: { visible: true, size: 80 },
      message: { visible: true, size: 400 },
      service: { visible: true, size: 100 }
    },
    labels: {
      timestamp: "Time",
      severity: ["Severity", { 1: "LOW", 2: "MEDIUM", 3: "HIGH" }],
      message: "Message",
      service: "Service"
    },
    formatters: {
      timestamp: "timestamp"
    },
    styles: {
      severity: [{}, {
        1: { color: "gray" },
        2: { color: "yellow" },
        3: { color: "red" }
      }]
    }
  }
)
```
:::
