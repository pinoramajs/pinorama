import abstractTransport from "pino-abstract-transport"
import { PinoramaClient } from "pinorama-client"
import type { Transform } from "node:stream"

type PinoramaTransportOptions = {
  url: string
  batchSize?: number
  flushInterval?: number
  maxRetries?: number
  retryInterval?: number
}

export default async function pinoramaTransport(
  opts: PinoramaTransportOptions
) {
  const client = new PinoramaClient({
    baseUrl: opts.url,
    maxRetries: opts.maxRetries || 5,
    retryInterval: opts.retryInterval || 1000
  })

  const buildFn = async (source: Transform) => {
    client.bulkInsert(source, {
      batchSize: opts.batchSize || 10,
      flushInterval: opts.flushInterval || 5000
    })
  }

  const closeFn = async () => {
    // TODO: flush client buffer
  }

  return abstractTransport(buildFn, { close: closeFn })
}
