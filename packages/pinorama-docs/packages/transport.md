---
outline: deep
---

# Transport

**Pinorama Transport** is a [Pino transport](https://getpino.io/#/docs/transports) that streams log data to [Pinorama Server](/packages/server). It buffers logs in batches and sends them via [Pinorama Client](/packages/client) with automatic retry on failure.

## Installation

::: code-group

```sh [npm]
npm i pinorama-transport
```

```sh [pnpm]
pnpm i pinorama-transport
```

```sh [yarn]
yarn add pinorama-transport
```

:::

## Programmatic Usage

Use as a Pino transport in your Node.js application:

```js
import pino from "pino"

const logger = pino({
  transport: {
    target: "pinorama-transport",
    options: {
      url: "http://localhost:3000/pinorama",
      adminSecret: "my-secret"
    }
  }
})

logger.info("hello from pinorama!")
```

### With custom buffering options

```js {6-8}
const logger = pino({
  transport: {
    target: "pinorama-transport",
    options: {
      url: "http://localhost:3000/pinorama",
      batchSize: 50,
      flushInterval: 2000,
      maxRetries: 10
    }
  }
})
```

## CLI Usage

The `pino-pinorama` CLI reads JSON logs from stdin and streams them to Pinorama Server:

```sh
node app.js | pino-pinorama --url http://localhost:3000/pinorama
```

### CLI Options

```
pino-pinorama [options]
```

| Flag | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--help` | `-h` | | | Display help message |
| `--version` | `-v` | | | Show version |
| `--url` | `-u` | `string` | *required* | Pinorama Server URL |
| `--adminSecret` | `-k` | `string` | | Server admin secret |
| `--batchSize` | `-b` | `number` | `100` | Logs per bulk insert |
| `--flushInterval` | `-f` | `number` | `1000` | Flush interval in ms |
| `--maxRetries` | `-m` | `number` | `5` | Max retry attempts |
| `--backoff` | `-i` | `number` | `1000` | Initial backoff time in ms |
| `--backoffFactor` | `-d` | `number` | `2` | Backoff multiplier |
| `--backoffMax` | `-x` | `number` | `30000` | Max backoff time in ms |
| `--maxBufferSize` | `-s` | `number` | `10000` | Max buffer size before dropping old logs |

## Options

All options from both the [Client](/packages/client) and the transport itself:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `string` | *required* | Pinorama Server URL |
| `adminSecret` | `string` | | Server admin secret |
| `batchSize` | `number` | `100` | Number of logs to buffer before flushing |
| `flushInterval` | `number` | `1000` | Max time (ms) between flushes |
| `maxBufferSize` | `number` | `10000` | Maximum buffer size before dropping oldest logs |
| `maxRetries` | `number` | `5` | Max retry attempts for failed inserts |
| `backoff` | `number` | `1000` | Initial backoff time in ms |
| `backoffFactor` | `number` | `2` | Backoff multiplier per retry |
| `backoffMax` | `number` | `30000` | Maximum backoff time in ms |

## Buffering Behavior

The transport accumulates logs in an internal buffer and flushes when either condition is met:

1. **Batch size reached** — When the buffer contains `batchSize` items, an immediate flush is triggered
2. **Flush interval elapsed** — A timer fires every `flushInterval` milliseconds

On each flush, the transport pauses the input stream, sends the buffered logs via `PinoramaClient.insert()`, clears the buffer, and resumes the stream. A final flush is performed when the input stream ends.

Only valid JSON objects are accepted — non-object or empty-object lines are silently dropped.

### Buffer Overflow

When the buffer exceeds `maxBufferSize`, the oldest logs are dropped to keep the buffer within the limit. This prevents unbounded memory growth when the server is unreachable or slow to respond. The default limit is 10,000 entries.

## Retry with Exponential Backoff

When a flush fails, [Pinorama Client](/packages/client) retries with exponential backoff. After exhausting all retries, the error is logged to stderr and the transport continues processing new logs.

::: details Retry sequence

1. First attempt fails — wait `backoff` ms (default: 1000ms)
2. Second retry — wait `backoff * backoffFactor` ms (default: 2000ms)
3. Third retry — wait `backoff * backoffFactor^2` ms (default: 4000ms)
4. Continues until `maxRetries` is reached or `backoffMax` is hit

The wait time is always capped at `backoffMax` (default: 30s).
:::
