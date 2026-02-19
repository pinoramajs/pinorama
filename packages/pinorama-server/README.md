# pinorama-server

A [Fastify](https://fastify.dev/) plugin that provides a REST API for storing and searching logs, powered by [Orama](https://askorama.ai/).

Use it as a standalone server or register it into an existing Fastify application. Includes authentication, persistence, auto-save, and a built-in MCP server for AI-powered log analysis.

## Installation

```sh
npm i pinorama-server
```

## Usage

```js
import Fastify from "fastify"
import pinoramaServer from "pinorama-server"

const app = Fastify()

app.register(pinoramaServer, {
  adminSecret: "my-secret",
  dbPath: "./data/logs.msp"
})

app.listen({ port: 6200 })
```

## REST API

`POST /bulk` · `POST /search` · `GET /introspection` · `GET /styles.css` · `GET /health` · `GET /stats` · `POST /context` · `POST /aggregate/field` · `POST /clear` · `POST /persist`

## Documentation

Full documentation at **[pinorama.dev/packages/server](https://pinorama.dev/packages/server)**.

## License

[MIT](https://github.com/pinoramajs/pinorama/blob/main/LICENSE)
