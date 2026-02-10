---
outline: deep
---

# Studio

**Pinorama Studio** is a web-based UI and CLI tool for viewing, filtering, and analyzing [Pino](https://getpino.io/) logs. It can run as a standalone viewer connected to an existing Pinorama Server, or start an embedded server to receive piped logs directly.

## Installation

Install globally:

::: code-group

```sh [npm]
npm i -g pinorama-studio
```

```sh [pnpm]
pnpm i -g pinorama-studio
```

```sh [yarn]
yarn global add pinorama-studio
```

:::

## Usage

### Pipe logs from any Node.js application

```sh
node app.js | pinorama --open
```

This starts an embedded Pinorama Server, ingests the piped logs, and opens the Studio UI in your browser.

### Connect to an existing server

If you already have a [Pinorama Server](/packages/server) running, launch Studio as a standalone viewer:

```sh
pinorama --open --server-prefix http://localhost:3000/pinorama
```

### With a Fastify application

```sh
node server.js | pinorama --open --preset fastify
```

Use the `fastify` preset to get Fastify-specific columns like request method, URL, and status code.

## Server Mode

Server mode is **automatically enabled** when stdin is piped (i.e. `!process.stdin.isTTY`). You can also enable it explicitly with the `--server` flag.

When server mode is active:

1. An embedded [Pinorama Server](/packages/server) starts on the configured `--host` and `--port`
2. The selected preset provides the database schema and introspection config
3. Piped stdin is streamed through a [Pinorama Transport](/packages/transport) into the embedded server
4. The Studio UI connects to the embedded server automatically

When server mode is **not** active, Studio runs as a static web app that you can point at any remote Pinorama Server.

## CLI Options

```
pinorama [options]
```

| Flag | Alias | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--help` | `-h` | | | Display help message |
| `--version` | `-v` | | | Show version |
| `--host` | `-H` | `string` | `"localhost"` | Web server host |
| `--port` | `-P` | `number` | `6200` | Web server port |
| `--open` | `-o` | `boolean` | `false` | Open Studio in browser |
| `--logger` | `-l` | `boolean` | `false` | Enable Fastify request logging |
| `--server` | `-s` | `boolean` | `false` | Start embedded Pinorama Server |
| `--server-prefix` | `-e` | `string` | `"/pinorama"` | Server endpoint prefix |
| `--server-db-path` | `-f` | `string` | `<tmpdir>/pinorama.msp` | Database file path |
| `--admin-secret` | `-k` | `string` | `"your-secret"` | Server admin secret key |
| `--preset` | `-p` | `string` | `"pino"` | Preset name (`pino` or `fastify`) |
| `--batch-size` | `-b` | `number` | `10` | Transport batch size |
| `--flush-interval` | | `number` | `100` | Transport flush interval (ms) |

## Examples

Start with default settings:

```sh
node app.js | pinorama
```

Open browser automatically with Fastify preset:

```sh
node app.js | pinorama --open --preset fastify
```

Use a custom port and persist database:

```sh
node app.js | pinorama --port 8080 --server-db-path ./logs.msp
```

Enable Fastify logging for the Studio server itself:

```sh
node app.js | pinorama --open --logger
```
