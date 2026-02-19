---
outline: deep
---

# Studio

**Pinorama Studio** is a web-based UI and CLI tool for viewing, filtering, and analyzing [Pino](https://getpino.io/) logs. It runs as a standalone viewer connected to an existing Pinorama Server, or starts an embedded server to receive piped logs directly.

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

If you already have a [Pinorama Server](/packages/server) running, launch Pinorama Studio as a standalone viewer:

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
3. Piped stdin is streamed through [Pinorama Transport](/packages/transport) into the embedded server
4. Pinorama Studio connects to the embedded server automatically

When server mode is **not** active, Pinorama Studio runs as a static web app that you can point at any remote Pinorama Server.

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
| `--open` | `-o` | `boolean` | `false` | Open Pinorama Studio in browser |
| `--logger` | `-l` | `boolean` | `false` | Enable Fastify request logging |
| `--server` | `-s` | `boolean` | `false` | Start embedded Pinorama Server |
| `--server-prefix` | `-e` | `string` | `"/pinorama"` | Server endpoint prefix |
| `--server-db-path` | `-f` | `string` | `<tmpdir>/pinorama.msp` | Database file path |
| `--admin-secret` | `-k` | `string` | | Server admin secret key |
| `--preset` | `-p` | `string` | `"pino"` | Preset name (`pino` or `fastify`) |
| `--batch-size` | `-b` | `number` | `10` | Transport batch size |
| `--flush-interval` | `-f` | `number` | `100` | Transport flush interval (ms) |

::: tip
The `-f` alias is shared between `--server-db-path` and `--flush-interval`. Use the long form to avoid ambiguity.
:::

## Keyboard Shortcuts

Pinorama Studio provides keyboard shortcuts for fast navigation:

| Key | Action |
| --- | --- |
| `/` | Focus search bar |
| `f` | Toggle filters panel |
| `o` | Toggle details panel |
| `m` | Maximize details panel |
| `l` | Toggle Live Mode |
| `r` | Refresh |
| `x` | Clear all filters |
| `j` / `↓` | Select next row |
| `k` / `↑` | Select previous row |
| `y` / `c` | Copy selected row to clipboard |
| `Shift+F` | Increase filters panel size |
| `Shift+D` | Decrease filters panel size |
| `Shift+J` | Increase details panel size |
| `Shift+K` | Decrease details panel size |
| `Esc` | Clear selection |

## Live Mode

Live Mode automatically refreshes the log viewer at a regular interval. When enabled, new logs appear at the top of the table as they are ingested.

Toggle Live Mode with the `l` keyboard shortcut or the Live Mode button in the toolbar.

## Details Panel

Select a row to open the details panel on the right side. The panel shows the full JSON document in a tree view. Use `o` to toggle the panel and `m` to maximize it.

Copy the selected row as JSON with `y` or `c`.

## Status Bar

The status bar at the bottom of the screen shows:

- Connection status (connected/disconnected)
- Total number of documents matching the current query
- Current server URL

## MCP Integration

Pinorama Studio includes a built-in MCP panel for enabling and configuring AI assistant access. Open it from the toolbar to:

- Enable or disable the embedded MCP server
- Copy connection instructions for Claude Code, VS Code, Cursor, or other clients

See [MCP](/packages/mcp) for full documentation.

## Internationalization

Pinorama Studio supports multiple languages:

| Language | Code |
| --- | --- |
| English | `en` |
| Italian | `it` |

The language is detected automatically from the browser settings.

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

Enable Fastify logging for the Pinorama Studio server itself:

```sh
node app.js | pinorama --open --logger
```
