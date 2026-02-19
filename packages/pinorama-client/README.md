# pinorama-client

Isomorphic HTTP client for [Pinorama Server](https://pinorama.dev/packages/server). Works in Node.js and the browser.

This package is used internally by Pinorama Transport and Pinorama Studio. Install it directly if you need to build a custom integration.

## Installation

```sh
npm i pinorama-client
```

## Usage

```js
import { PinoramaClient } from "pinorama-client"

const client = new PinoramaClient({
  url: "http://localhost:6200/pinorama",
  adminSecret: "my-secret"
})

await client.insert([{ level: 30, msg: "hello", time: Date.now() }])

const results = await client.search({ term: "hello", limit: 10 })
```

## API

`insert()` · `search()` · `introspection()` · `styles()` · `clear()` · `stats()` · `context()` · `aggregateByField()` · `mcpStatus()` · `setMcpStatus()`

## Documentation

Full documentation at **[pinorama.dev/packages/client](https://pinorama.dev/packages/client)**.

## License

[MIT](https://github.com/pinoramajs/pinorama/blob/main/LICENSE)
