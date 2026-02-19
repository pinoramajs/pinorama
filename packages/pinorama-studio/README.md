# pinorama-studio

A web-based log explorer for [Pino](https://getpino.io/) logs. Pipe logs from any Node.js process and get full-text search, faceted filtering, keyboard shortcuts, Live Mode, and MCP integration for AI-powered log analysis.

## Installation

```sh
npm i -g pinorama-studio
```

## Usage

```sh
node app.js | pinorama --open
```

## Features

- Full-text search powered by [Orama](https://askorama.ai)
- Faceted filtering (enum, text, date range)
- Live Mode with auto-refresh
- Keyboard-first navigation
- Details panel with JSON tree view
- MCP integration for AI assistants
- Built-in presets for Pino and Fastify logs
- Internationalization (English, Italian)

## Documentation

Full documentation at **[pinorama.dev/packages/studio](https://pinorama.dev/packages/studio)**.

## License

[MIT](https://github.com/pinoramajs/pinorama/blob/main/LICENSE)
